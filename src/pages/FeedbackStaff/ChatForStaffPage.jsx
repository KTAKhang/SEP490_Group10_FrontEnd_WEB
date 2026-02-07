import { useEffect, useState, useRef } from "react";
import { MessageCircle, Send, RefreshCw, User, Clock } from "lucide-react";
import api from "../../api";
import { socket } from "../../socket";

export default function StaffChat() {
  const [rooms, setRooms] = useState([]);
  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [hasMore, setHasMore] = useState(false);
  const [oldestMessageId, setOldestMessageId] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const initialLoadRef = useRef(false);
  const [initializing, setInitializing] = useState(false);
  const [staff, setStaff] = useState(null);

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (raw) {
      const user = JSON.parse(raw);
      if (user.role_name === "feedbacked-staff") {
        setStaff(user);
      }
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });

    // If this was the initial load for a room, clear the initializing flag
    if (initialLoadRef.current) {
      initialLoadRef.current = false;
      setInitializing(false);
    }
  }, [messages]);

  /* ======================
    STAFF ONLINE
 ====================== */
  useEffect(() => {
    if (!staff?._id || !socket) return;

    socket.emit("staff_online", staff._id, staff.user_name, staff.avatar);
  }, [staff, socket]);

  /* ======================
     LOAD ROOMS INIT
  ====================== */
  useEffect(() => {
    loadRooms();
  }, []);

  /* ======================
     SOCKET: RECEIVE MESSAGE
  ====================== */
  useEffect(() => {
    socket.on("receive_message", (message) => {
      if (room && message.room._id === room._id) {
        setMessages((prev) => [...prev, message]);
      }
    });

    return () => socket.off("receive_message");
  }, [room]);

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
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); 
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
  /* ======================
     SOCKET: ROOM UPDATED
  ====================== */
  useEffect(() => {
    if (!staff?._id) return;

    const handler = (updatedRoom) => {
      // ❌ Không phải room của staff này → bỏ qua
      if (!updatedRoom.staff || updatedRoom.staff._id !== staff._id) {
        return;
      }

      setRooms((prev) => {
        const exists = prev.find((r) => r._id === updatedRoom._id);

        // 🆕 Room mới
        if (!exists) {
          return [updatedRoom, ...prev];
        }

        // 🔁 Update lastMessage + đẩy lên đầu
        return [
          {
            ...exists,
            lastMessage: updatedRoom.lastMessage,
            updatedAt: updatedRoom.updatedAt,
            unreadByStaff: updatedRoom.unreadByStaff ?? exists.unreadByStaff,
          },
          ...prev.filter((r) => r._id !== updatedRoom._id),
        ];
      });
    };

    socket.on("room_updated", handler);
    return () => socket.off("room_updated", handler);
  }, [staff]);

  /* ======================
     JOIN ROOM
  ====================== */
  useEffect(() => {
    if (room?._id) {
      socket.emit("join_room", room._id);
    }
  }, [room]);

  /* ======================
     LOAD ROOMS
  ====================== */
  const loadRooms = async () => {
    setLoading(true);
    try {
      const res = await api.get("/chat/staff/rooms");
      setRooms(res.data.data);
    } catch (error) {
      console.error("Error loading rooms:", error);
    } finally {
      setLoading(false);
    }
  };

  /* ======================
     OPEN ROOM
  ====================== */
  const openRoom = async (r) => {
    setRoom(r);

    // reset unread bên client cho mượt UX
    setRooms((prev) =>
      prev.map((room) =>
        room._id === r._id ? { ...room, unreadByStaff: 0 } : room,
      ),
    );

    // Mark as read on server (best-effort)
    try {
      await api.get(`/chat/room/${r._id}/mark-as-read`);
    } catch (err) {
      console.error("mark-as-read failed:", err?.message || err);
    }

    // Load initial messages (with pagination support)
    setHasMore(false);
    setOldestMessageId(null);
    // indicate we're initializing so scroll handler won't auto-load more
    initialLoadRef.current = true;
    setInitializing(true);
    await loadMessages(r._id);
  };

  const loadMessages = async (roomId, { before = null, prepend = false, limit = 5 } = {}) => {
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

      // payload may be either array (legacy) or object { messages, hasMore, oldestMessageId }
      const fetched = Array.isArray(payload) ? payload : payload.messages || [];
      const more = typeof payload === "object" && payload.hasMore !== undefined ? payload.hasMore : fetched.length === limit;
      const oldest = typeof payload === "object" && payload.oldestMessageId ? payload.oldestMessageId : (fetched.length > 0 ? fetched[0]._id : null);

      if (prepend) {
        setMessages((prev) => [...fetched, ...prev]);

        // Preserve scroll position after prepending
        setTimeout(() => {
          if (container && prevScrollHeight != null) {
            const newScrollHeight = container.scrollHeight;
            container.scrollTop = newScrollHeight - prevScrollHeight;
          }
        }, 0);
      } else {
        setMessages(fetched);
        // scroll to bottom handled by messagesEndRef effect
      }

      setHasMore(more);
      setOldestMessageId(oldest);
    } catch (err) {
      console.error("loadMessages failed:", err);
    } finally {
      if (prepend) setLoadingMore(false);
    }
  };

  /* ======================
     SEND MESSAGE
  ====================== */
  const sendMessage = () => {
    if (!room || !text.trim()) return;

    socket.emit("send_message", {
      roomId: room._id,
      senderId: staff?._id,
      senderRole: "feedbacked-staff",
      content: text,
    });

    setText("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex h-[86dvh] bg-gradient-to-br from-gray-50 to-gray-100">
      {/* ===== SIDEBAR ===== */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col shadow-lg">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-green-600 to-green-700">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Message
            </h2>
            <button
              onClick={loadRooms}
              className="p-2 hover:bg-green-500 rounded-lg transition-colors"
              disabled={loading}
            >
              <RefreshCw
                className={`w-4 h-4 text-white ${
                  loading ? "animate-spin" : ""
                }`}
              />
            </button>
          </div>
        </div>

        {/* Rooms */}
        <div className="flex-1 overflow-y-auto">
          {rooms.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No conversation has taken place yet</p>
            </div>
          ) : (
            rooms.map((r) => (
              <div
                key={r._id}
                onClick={() => openRoom(r)}
                className={`p-4 cursor-pointer transition-all border-b border-gray-100 hover:bg-green-50 flex items-center justify-between ${
                  room?._id === r._id
                    ? "bg-green-50 border-l-4 border-l-green-600"
                    : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white shadow-md">
                    <User className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {r.user.user_name}
                    </h3>
                    <p className="text-sm text-gray-600 truncate">
                      {r.lastMessage}
                    </p>
                  </div>
                </div>

                {/* Unread badge */}
                {r.unreadByStaff > 0 && (
                  <div className="ml-3 flex-shrink-0">
                    <div className="bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                      {r.unreadByStaff}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* ===== CHAT ===== */}
      <div className="flex-1 flex flex-col bg-white">
        {!room ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500">Choose a conversation to start</p>
          </div>
        ) : (
          <>
            {/* Messages */}
            <div
              ref={messagesContainerRef}
              onScroll={() => {
                const c = messagesContainerRef.current;
                if (!c || loadingMore || !hasMore || initializing) return;
                if (c.scrollTop <= 50) {
                  // load older messages
                  if (room?._id && oldestMessageId) {
                    loadMessages(room._id, { before: oldestMessageId, prepend: true });
                  }
                }
              }}
              className="flex-1 overflow-y-auto p-4"
            >
              {loadingMore && (
                <div className="text-center text-xs text-gray-500 mb-2">Đang tải tin nhắn cũ...</div>
              )}
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
              {messages.map((m, i) => {
                const prev = messages[i - 1];
                const showDateSeparator =
                  !prev || !isSameDay(prev.createdAt, m.createdAt);

                const isStaff =
                  m.senderRole === "feedbacked-staff" ||
                  m.sender._id === "6961b15f0b506435dc7500c0";

                return (
                  <div key={m._id}>
                    {/* ===== DATE SEPARATOR ===== */}
                    {showDateSeparator && (
                      <div className="w-full flex justify-center my-4">
                        <div className="bg-gray-200 text-xs text-gray-600 px-3 py-1 rounded-full shadow-sm">
                          {formatDateHeader(m.createdAt)}
                        </div>
                      </div>
                    )}

                    {/* ===== MESSAGE ROW ===== */}
                    <div
                      className={`flex mb-3 ${
                        isStaff ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div>
                        {/* Bubble */}
                        <div
                          className={`px-4 py-2 rounded-xl max-w-md ${
                            isStaff
                              ? "bg-green-600 text-white"
                              : "bg-gray-200 text-gray-800"
                          }`}
                        >
                          {m.content}
                        </div>

                        {/* Time */}
                        <p
                          className={`text-xs text-gray-500 mt-1 px-1 ${
                            isStaff ? "text-right" : "text-left"
                          }`}
                        >
                          {new Date(m.createdAt).toLocaleTimeString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                    <div ref={messagesEndRef} />
                  </div>
                );
              })}
            </div>

            {/* Input */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 border rounded-full px-4 py-2"
                  placeholder="Enter message..."
                />
                <button
                  onClick={sendMessage}
                  className="bg-green-600 text-white px-5 py-2 rounded-full"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}