import { useEffect, useState, useRef } from "react";
import { MessageCircle, Send, X, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import { socket } from "../../socket";

export default function CustomerChat() {
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem("token");

  const [user, setUser] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const [onlineStaffs, setOnlineStaffs] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(null);

  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [hasMore, setHasMore] = useState(false);
  const [oldestMessageId, setOldestMessageId] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const initialLoadRef = useRef(false);
  const [initializing, setInitializing] = useState(false);

  /* ======================
     LOAD USER
  ====================== */
  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.role_name === "customer") {
        setUser(parsed);
      }
    }
  }, []);

  /* ======================
     ONLINE STAFFS
  ====================== */
  useEffect(() => {
    const handleConnect = () => {
      console.log("🔌 socket connected (customer):", socket.id);
      socket.emit("get_online_staffs");
    };

    const handleOnlineStaffs = (staffs) => {
      console.log("👥 ONLINE STAFFS (raw):", staffs);

      if (Array.isArray(staffs)) {
        setOnlineStaffs(staffs);
        return;
      }

      if (staffs && typeof staffs === "object") {
        setOnlineStaffs(Object.values(staffs));
        return;
      }

      setOnlineStaffs([]);
    };

    const handleConnectError = (err) => {
      console.error("socket connect_error:", err.message);
    };

    if (socket.connected) {
      socket.emit("get_online_staffs");
    }

    socket.on("connect", handleConnect);
    socket.on("online_staffs", handleOnlineStaffs);
    socket.on("connect_error", handleConnectError);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("online_staffs", handleOnlineStaffs);
      socket.off("connect_error", handleConnectError);
    };
  }, []);

  /* ======================
     RECEIVE MESSAGE
  ====================== */
  useEffect(() => {
    const handleReceiveMessage = (message) => {
      if (!room) return;

      const msgRoomId =
        typeof message.room === "string" ? message.room : message.room?._id;

      if (msgRoomId === room._id) {
        setMessages((prev) => [...prev, message]);
      }
    };

    socket.on("receive_message", handleReceiveMessage);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
    };
  }, [room]);

  /* ======================
     JOIN ROOM
  ====================== */
  useEffect(() => {
    if (room?._id) {
      socket.emit("join_room", room._id);
    }
  }, [room]);

  /* ======================
     CREATE ROOM WITH STAFF
  ====================== */
  const createRoomWithStaff = async (staff) => {
    try {
      console.log("📝 Creating room with staff:", {
        staffId: staff.staffId,
        staffName: staff.userName,
        currentRoom: room?._id,
      });

      // 🔥 Leave room cũ trước (nếu có)
      if (room?._id) {
        socket.emit("leave_room", room._id);
      }

      // Reset state
      setMessages([]);
      setSelectedStaff(staff);

      const res = await api.post("/chat/room", {
        staffId: staff.staffId,
      });

      console.log("res.data",res.data)
      const createdRoom = res.data.data;
      setRoom(createdRoom);
      setHasMore(false);
      setOldestMessageId(null);
      initialLoadRef.current = true;
      setInitializing(true);
      await loadMessages(createdRoom._id);
    } catch (err) {
      console.error("❌ createRoomWithStaff error:", err);
    }
  };

  /* ======================
     SEND MESSAGE
  ====================== */
  const sendMessage = () => {
    if (!text.trim() || !room || !user) return;

    socket.emit("send_message", {
      roomId: room._id,
      senderId: user._id,
      senderRole: "customer",
      content: text.trim(),
    });

    setText("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  /* ======================
     TOGGLE CHAT
  ====================== */
  const toggleChat = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    setIsOpen((prev) => !prev);
  };

  const closeChat = () => {
    if (room?._id) {
      socket.emit("leave_room", room._id);
    }
    setIsOpen(false);
    setRoom(null);
    setMessages([]);
    setSelectedStaff(null);
  };

  /* ======================
     BACK TO STAFF LIST
  ====================== */
  const backToStaffList = () => {
    if (room?._id) {
      socket.emit("leave_room", room._id);
    }
    setRoom(null);
    setMessages([]);
    setSelectedStaff(null);
  };

  // Scroll to bottom after messages change and clear init flag
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

    if (initialLoadRef.current) {
      initialLoadRef.current = false;
      setInitializing(false);
    }
  }, [messages]);

  // Load messages with optional before (messageId) for pagination
  const loadMessages = async (roomId, { before = null, prepend = false, limit = 6 } = {}) => {
    if (!roomId) return;
    if (prepend && loadingMore) return;

    if (prepend) setLoadingMore(true);

    try {
      const params = { limit };
      if (before) params.before = before;

      const container = messagesContainerRef.current;
      const prevScrollHeight = prepend && container ? container.scrollHeight : null;

      const res = await api.get(`/chat/room/${roomId}/messages`, { params });
      const payload = res.data?.data ?? res.data;

      const fetched = Array.isArray(payload) ? payload : payload.messages || [];
      const more = typeof payload === "object" && payload.hasMore !== undefined ? payload.hasMore : fetched.length === limit;
      const oldest = typeof payload === "object" && payload.oldestMessageId ? payload.oldestMessageId : (fetched.length > 0 ? fetched[0]._id : null);

      if (prepend) {
        setMessages((prev) => [...fetched, ...prev]);

        // preserve scroll position after prepending
        setTimeout(() => {
          if (container && prevScrollHeight != null) {
            const newScrollHeight = container.scrollHeight;
            container.scrollTop = newScrollHeight - prevScrollHeight;
          }
        }, 0);
      } else {
        setMessages(fetched);
      }

      setHasMore(more);
      setOldestMessageId(oldest);
    } catch (err) {
      console.error("loadMessages failed:", err);
    } finally {
      if (prepend) setLoadingMore(false);
    }
  };

  // Helpers: compare days and format header label
  const isSameDay = (a, b) => {
  if (!a || !b) return false;
  const d1 = new Date(a);
  const d2 = new Date(b);
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

const getStartOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay(); // 0 = CN, 1 = T2...
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // chỉnh về Monday
  return new Date(d.setDate(diff));
};

const formatDateHeader = (dateStr) => {
  const d = new Date(dateStr);

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  // 1. Hôm nay
  if (isSameDay(d, today)) return "Today";

  // 2. Hôm qua
  if (isSameDay(d, yesterday)) return "Yesterday";

  // 3. Trong tuần này → hiện Thứ
  const startOfWeek = getStartOfWeek(today);
  if (d >= startOfWeek) {
    const weekday = d.toLocaleDateString("vi-VN", {
      weekday: "long",
    });

    // Viết hoa chữ cái đầu cho đẹp
    return weekday.charAt(0).toUpperCase() + weekday.slice(1);
  }

  // 4. Xa hơn → ngày đầy đủ
  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};


  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Toggle Button */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full shadow-2xl hover:scale-110 transition flex items-center justify-center"
        >
          <MessageCircle className="text-white w-7 h-7" />
        </button>
      )}

      {/* Chat Box */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-96 bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Nút quay lại (chỉ hiện khi đã chọn staff) */}
              {room && (
                <button
                  onClick={backToStaffList}
                  className="text-white hover:bg-white/20 p-1 rounded transition"
                  title="Go back and select staff"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}

              <div>
                <h3 className="text-white font-bold">
                  {selectedStaff ? selectedStaff.userName : "Message"}
                </h3>
                <p className="text-white/80 text-xs">
                  {selectedStaff
                    ? "Online"
                    : `${onlineStaffs.length} The staff are online.`}
                </p>
              </div>
            </div>

            <button
              onClick={closeChat}
              className="text-white hover:bg-white/20 p-1 rounded transition"
            >
              <X />
            </button>
          </div>

          {/* STAFF PICKER */}
          {!room && (
            <div className="p-4 h-96 overflow-y-auto">
              <p className="text-xs text-gray-500 font-semibold mb-3">
                Chose staff for support
              </p>

              <div className="flex flex-wrap gap-3">
                {onlineStaffs.map((staff) => (
                  <button
                    key={staff.staffId}
                    onClick={() => createRoomWithStaff(staff)}
                    title={staff.userName}
                    className="relative group"
                  >
                    <img
                      src={staff.avatar}
                      alt={staff.userName}
                      className="w-14 h-14 rounded-full border-2 border-white shadow-md group-hover:scale-110 transition object-cover"
                    />
                    <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
                  </button>
                ))}
              </div>

              {onlineStaffs.length === 0 && (
                <p className="text-sm text-gray-400 mt-4">
                  There are currently no staff online
                </p>
              )}
            </div>
          )}

          {/* CHAT AREA */}
          {room && (
            <>
              <div ref={messagesContainerRef} className="h-96 overflow-y-auto p-4 bg-gray-50 space-y-3">
                {hasMore && (
                  <div className="flex justify-center mb-2">
                    <button
                      onClick={() => {
                        if (loadingMore || !room?._id || !oldestMessageId) return;
                        loadMessages(room._id, { before: oldestMessageId, prepend: true });
                      }}
                      className="text-sm text-green-600 px-3 py-1 border border-green-200 rounded hover:bg-green-50"
                    >
                      {loadingMore ? "Loading..." : "Loadmore"}
                    </button>
                  </div>
                )}

                {messages.length === 0 && (
                  <div className="text-center text-gray-400 text-sm mt-8">
                   Start a conversation with {selectedStaff?.userName}
                  </div>
                )}

                {messages.map((m, i) => {
                  const prev = messages[i - 1];
                  const showDateSeparator = !prev || !isSameDay(prev.createdAt, m.createdAt);
                  const isCustomer = m.senderRole === "customer";

                  return (
                    <div key={m._id || i}>
                      {showDateSeparator && (
                        <div className="flex justify-center my-2">
                          <div className="bg-gray-200 text-xs text-gray-600 px-3 py-1 rounded-full">
                            {formatDateHeader(m.createdAt)}
                          </div>
                        </div>
                      )}

                      <div className={`flex ${isCustomer ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm shadow ${
                            isCustomer
                              ? "bg-green-500 text-white rounded-br-none"
                              : "bg-white text-gray-800 rounded-bl-none"
                          }`}
                        >
                          <p>{m.content}</p>
                          <p className="text-xs mt-1 opacity-70">
                            {new Date(m.createdAt).toLocaleTimeString("vi-VN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* INPUT */}
              <div className="border-t p-3 bg-white flex gap-2">
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter message..."
                  className="flex-1 rounded-full px-4 py-2 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                  onClick={sendMessage}
                  disabled={!text.trim()}
                  className="bg-green-500 text-white rounded-full p-2 hover:bg-green-600 disabled:opacity-50 transition"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}