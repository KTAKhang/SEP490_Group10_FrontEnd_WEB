import { useEffect, useState, useRef } from "react";
import {
  MessageCircle,
  Send,
  X,
  ChevronLeft,
  Clock,
  Users,
} from "lucide-react";
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

  // Tab: "online" | "history"
  const [activeTab, setActiveTab] = useState("online");

  // History rooms
  const [historyRooms, setHistoryRooms] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [room, setRoom] = useState(null);
  const [isReadOnly, setIsReadOnly] = useState(false); // ← NEW
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [hasMore, setHasMore] = useState(false);
  const [oldestMessageId, setOldestMessageId] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const initialLoadRef = useRef(false);
  const [initializing, setInitializing] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [isSending, setIsSending] = useState(false);

  /* ======================
     LOAD USER
  ====================== */
  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.role_name === "customer") setUser(parsed);
    }
  }, []);

  /* ======================
     ONLINE STAFFS
  ====================== */
  useEffect(() => {
    const handleConnect = () => socket.emit("get_online_staffs");
    const handleOnlineStaffs = (staffs) => {
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

    if (socket.connected) socket.emit("get_online_staffs");
    socket.on("connect", handleConnect);
    socket.on("online_staffs", handleOnlineStaffs);
    socket.on("connect_error", (err) =>
      console.error("socket error:", err.message),
    );

    return () => {
      socket.off("connect", handleConnect);
      socket.off("online_staffs", handleOnlineStaffs);
    };
  }, []);

  /* ======================
     LOAD HISTORY ROOMS
  ====================== */
  const loadHistoryRooms = async () => {
    setLoadingHistory(true);
    try {
      const res = await api.get("/chat/user/rooms");
      console.log("res.data.data", res.data.data);
      setHistoryRooms(res.data.data || []);
    } catch (err) {
      console.error("loadHistoryRooms failed:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (isOpen && activeTab === "history") loadHistoryRooms();
  }, [isOpen, activeTab]);

  /* ======================
     RECEIVE MESSAGE
  ====================== */
  useEffect(() => {
    const handler = (message) => {
      if (!room) return;
      const msgRoomId =
        typeof message.room === "string" ? message.room : message.room?._id;
      if (msgRoomId === room._id) setMessages((prev) => [...prev, message]);
    };
    socket.on("receive_message", handler);
    return () => socket.off("receive_message", handler);
  }, [room]);

  /* ======================
     JOIN ROOM
  ====================== */
  useEffect(() => {
    if (room?._id) socket.emit("join_room", room._id);
  }, [room]);

  /* ======================
     SCROLL TO BOTTOM
  ====================== */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    if (initialLoadRef.current) {
      initialLoadRef.current = false;
      setInitializing(false);
    }
  }, [messages]);

  /* ======================
     LOAD MESSAGES
  ====================== */
  const loadMessages = async (
    roomId,
    { before = null, prepend = false, limit = 6 } = {},
  ) => {
    if (!roomId) return;
    if (prepend && loadingMore) return;
    if (prepend) setLoadingMore(true);

    try {
      const params = { limit };
      if (before) params.before = before;

      const container = messagesContainerRef.current;
      const prevScrollHeight =
        prepend && container ? container.scrollHeight : null;

      const res = await api.get(`/chat/room/${roomId}/messages`, { params });
      const payload = res.data?.data ?? res.data;
      const fetched = Array.isArray(payload) ? payload : payload.messages || [];
      const more =
        typeof payload === "object" && payload.hasMore !== undefined
          ? payload.hasMore
          : fetched.length === limit;
      const oldest =
        typeof payload === "object" && payload.oldestMessageId
          ? payload.oldestMessageId
          : fetched.length > 0
            ? fetched[0]._id
            : null;

      if (prepend) {
        setMessages((prev) => [...fetched, ...prev]);
        setTimeout(() => {
          if (container && prevScrollHeight != null) {
            container.scrollTop = container.scrollHeight - prevScrollHeight;
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

  /* ======================
     OPEN HISTORY ROOM (read-only if staff offline)
  ====================== */
  const openHistoryRoom = async (r) => {
    if (room?._id) socket.emit("leave_room", room._id);
    setMessages([]);
    setRoom(r);

    // Check if staff is still online
    const staffOnline = onlineStaffs.find((s) => s.staffId === r.staff?._id);
    if (staffOnline) {
      setSelectedStaff(staffOnline);
      setIsReadOnly(false);
    } else {
      setSelectedStaff({
        userName: r.staff?.user_name,
        avatar: r.staff?.avatar,
        staffId: r.staff?._id,
      });
      setIsReadOnly(true);
    }

    setHasMore(false);
    setOldestMessageId(null);
    initialLoadRef.current = true;
    setInitializing(true);
    await loadMessages(r._id);
  };

  /* ======================
     CREATE ROOM WITH STAFF (chat mode)
  ====================== */
  const createRoomWithStaff = async (staff) => {
    try {
      if (room?._id) socket.emit("leave_room", room._id);
      setMessages([]);
      setSelectedStaff(staff);
      setIsReadOnly(false);

      const res = await api.post("/chat/room", { staffId: staff.staffId });
      const createdRoom = res.data.data;
      setRoom(createdRoom);
      setHasMore(false);
      setOldestMessageId(null);
      initialLoadRef.current = true;
      setInitializing(true);
      await loadMessages(createdRoom._id);
    } catch (err) {
      console.error("createRoomWithStaff error:", err);
    }
  };

  /* ======================
     SEND MESSAGE
  ====================== */
  const sendMessage = async () => {
    if (!room || !user || isReadOnly) return;
    if (!text.trim() && selectedImages.length === 0) return;
    if (isSending) return;

    setIsSending(true);
    try {
      const formData = new FormData();
      formData.append("roomId", room._id);
      formData.append("content", text.trim());
      formData.append("senderRole", "customer");
      selectedImages.forEach((file) => formData.append("images", file));

      const res = await api.post("/chat/message", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      socket.emit("send_message", { roomId: room._id, message: res.data.data });
      setText("");
      setSelectedImages([]);
    } catch (err) {
      console.error("Send message failed:", err);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  /* ======================
     TOGGLE / CLOSE / BACK
  ====================== */
  const toggleChat = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    setIsOpen((prev) => !prev);
  };

  const closeChat = () => {
    if (room?._id) socket.emit("leave_room", room._id);
    setIsOpen(false);
    setRoom(null);
    setMessages([]);
    setSelectedStaff(null);
    setIsReadOnly(false);
  };

  const backToList = () => {
    if (room?._id) socket.emit("leave_room", room._id);
    setRoom(null);
    setMessages([]);
    setSelectedStaff(null);
    setIsReadOnly(false);
  };

  /* ======================
     DATE HELPERS
  ====================== */
  const isSameDay = (a, b) => {
    if (!a || !b) return false;
    const d1 = new Date(a),
      d2 = new Date(b);
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const formatDateHeader = (dateStr) => {
    const d = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    if (isSameDay(d, today)) return "Today";
    if (isSameDay(d, yesterday)) return "Yesterday";
    return d.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatLastSeen = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <>
      <style>{`
        @keyframes sending-bounce {
          0%, 80%, 100% { transform: scale(0); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
        @keyframes spinner-spin { to { transform: rotate(360deg); } }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .dot-typing span {
          display: inline-block; width: 7px; height: 7px;
          border-radius: 50%;
          animation: sending-bounce 1.3s infinite ease-in-out;
        }
        .dot-typing span:nth-child(1) { animation-delay: 0s; }
        .dot-typing span:nth-child(2) { animation-delay: 0.15s; }
        .dot-typing span:nth-child(3) { animation-delay: 0.3s; }
        .send-spinner {
          width: 18px; height: 18px;
          border: 2.5px solid rgba(255,255,255,0.4);
          border-top-color: white; border-radius: 50%;
          animation: spinner-spin 0.7s linear infinite;
        }
        .msg-fade-in { animation: fade-in 0.2s ease; }
        .tab-active {
          border-bottom: 2px solid #16a34a;
          color: #16a34a;
          font-weight: 600;
        }
      `}</style>

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
          <div
            className="absolute bottom-6 right-0 w-96 bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            style={{ maxHeight: "560px" }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                {room && (
                  <button
                    onClick={backToList}
                    className="text-white hover:bg-white/20 p-1 rounded transition"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                )}
                <div>
                  <h3 className="text-white font-bold">
                    {selectedStaff ? selectedStaff.userName : "Support Chat"}
                  </h3>
                  <p className="text-white/80 text-xs">
                    {selectedStaff
                      ? isReadOnly
                        ? "🔒 View only — staff offline"
                        : "🟢 Online"
                      : `${onlineStaffs.length} staff online`}
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

            {/* LIST VIEW — tabs + content */}
            {!room && (
              <>
                {/* Tabs */}
                <div className="flex border-b bg-white flex-shrink-0">
                  <button
                    onClick={() => setActiveTab("online")}
                    className={`flex-1 py-2.5 text-sm flex items-center justify-center gap-1.5 transition ${activeTab === "online" ? "tab-active" : "text-gray-500 hover:text-gray-700"}`}
                  >
                    <Users className="w-4 h-4" />
                    Online Staff
                  </button>
                  <button
                    onClick={() => setActiveTab("history")}
                    className={`flex-1 py-2.5 text-sm flex items-center justify-center gap-1.5 transition ${activeTab === "history" ? "tab-active" : "text-gray-500 hover:text-gray-700"}`}
                  >
                    <Clock className="w-4 h-4" />
                    History
                  </button>
                </div>

                {/* Online Tab */}
                {activeTab === "online" && (
                  <div className="p-4 overflow-y-auto flex-1">
                    <p className="text-xs text-gray-400 font-semibold mb-3 uppercase tracking-wide">
                      Choose a staff to chat
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
                          <p className="text-xs text-center text-gray-600 mt-1 max-w-[56px] truncate">
                            {staff.userName}
                          </p>
                        </button>
                      ))}
                    </div>
                    {onlineStaffs.length === 0 && (
                      <p className="text-sm text-gray-400 mt-4 text-center">
                        No staff online right now
                      </p>
                    )}
                  </div>
                )}

                {/* History Tab */}
                {activeTab === "history" && (
                  <div className="overflow-y-auto flex-1">
                    {loadingHistory ? (
                      <div className="flex justify-center items-center h-32 text-gray-400 text-sm">
                        Loading...
                      </div>
                    ) : historyRooms.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-32 text-gray-400 text-sm gap-2">
                        <Clock className="w-8 h-8 opacity-40" />
                        <p>No chat history yet</p>
                      </div>
                    ) : (
                      historyRooms.map((r) => {
                        const staffOnline = onlineStaffs.find(
                          (s) => String(s.staffId) === String(r.staff?._id),
                        );
                        return (
                          <button
                            key={r._id}
                            onClick={() => openHistoryRoom(r)}
                            className="w-full text-left flex items-center gap-3 px-4 py-3 hover:bg-gray-50 border-b border-gray-100 transition"
                          >
                            <div className="relative flex-shrink-0">
                              <img
                                src={r.staff?.avatar}
                                alt={r.staff?.user_name}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            
                              <span
                                className={`absolute bottom-0 right-0 w-3.5 h-3.5 border-2 border-white rounded-full ${
                                  staffOnline ? "bg-green-500" : "bg-gray-400"
                                }`}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="font-semibold text-gray-800 text-sm truncate">
                                  {r.staff?.user_name}
                                </p>
                                <span className="text-xs text-gray-400 ml-2 flex-shrink-0">
                                  {formatLastSeen(r.updatedAt)}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 truncate">
                                {r.lastMessage || "No messages yet"}
                              </p>
                              <p
                                className={`text-xs mt-0.5 ${staffOnline ? "text-green-600" : "text-gray-400"}`}
                              >
                                {staffOnline
                                  ? "🟢 Online — click to chat"
                                  : "🔒 View history only"}
                              </p>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                )}
              </>
            )}

            {/* CHAT AREA */}
            {room && (
              <>
                {/* Read-only banner */}
                {isReadOnly && (
                  <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center gap-2 flex-shrink-0">
                    <Clock className="w-4 h-4 text-amber-500 flex-shrink-0" />
                    <p className="text-xs text-amber-700">
                      This staff is offline. You can view the conversation
                      history only.
                    </p>
                  </div>
                )}

                {/* Messages */}
                <div
                  ref={messagesContainerRef}
                  onScroll={() => {
                    const c = messagesContainerRef.current;
                    if (!c || loadingMore || !hasMore || initializing) return;
                    if (c.scrollTop <= 50 && room?._id && oldestMessageId) {
                      loadMessages(room._id, {
                        before: oldestMessageId,
                        prepend: true,
                      });
                    }
                  }}
                  className="overflow-y-auto p-4 bg-gray-50 space-y-3 flex-1"
                  style={{ minHeight: 0 }}
                >
                  {hasMore && (
                    <div className="flex justify-center mb-2">
                      <button
                        onClick={() => {
                          if (loadingMore || !room?._id || !oldestMessageId)
                            return;
                          loadMessages(room._id, {
                            before: oldestMessageId,
                            prepend: true,
                          });
                        }}
                        className="text-sm text-green-600 px-3 py-1 border border-green-200 rounded hover:bg-green-50"
                      >
                        {loadingMore ? "Loading..." : "Load more"}
                      </button>
                    </div>
                  )}

                  {messages.length === 0 && !isSending && (
                    <div className="text-center text-gray-400 text-sm mt-8">
                      {isReadOnly
                        ? "No messages in this conversation."
                        : `Start a conversation with ${selectedStaff?.userName}`}
                    </div>
                  )}

                  {messages.map((m, i) => {
                    const prev = messages[i - 1];
                    const showDateSeparator =
                      !prev || !isSameDay(prev.createdAt, m.createdAt);
                    const isCustomer = m.senderRole === "customer";

                    return (
                      <div key={m._id || i} className="msg-fade-in">
                        {showDateSeparator && (
                          <div className="flex justify-center my-2">
                            <div className="bg-gray-200 text-xs text-gray-600 px-3 py-1 rounded-full">
                              {formatDateHeader(m.createdAt)}
                            </div>
                          </div>
                        )}
                        <div
                          className={`flex ${isCustomer ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm shadow ${isCustomer ? "bg-green-500 text-white rounded-br-none" : "bg-white text-gray-800 rounded-bl-none"}`}
                          >
                            {m.content && <p>{m.content}</p>}
                            {m.images && m.images.length > 0 && (
                              <div className="grid grid-cols-2 gap-2 mt-2">
                                {m.images.map((img, idx) => (
                                  <img
                                    key={idx}
                                    src={img}
                                    className="rounded-lg max-h-40 object-cover cursor-pointer hover:opacity-90"
                                  />
                                ))}
                              </div>
                            )}
                            <p className="text-xs mt-1 opacity-70">
                              {new Date(m.createdAt).toLocaleTimeString(
                                "vi-VN",
                                { hour: "2-digit", minute: "2-digit" },
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {isSending && (
                    <div className="flex justify-end msg-fade-in">
                      <div className="max-w-[70%] px-4 py-3 rounded-2xl rounded-br-none bg-green-400 shadow flex items-center gap-1.5">
                        <span className="text-white text-xs opacity-80 mr-1">
                          Sending
                        </span>
                        <div className="dot-typing flex gap-1">
                          <span
                            style={{ background: "rgba(255,255,255,0.8)" }}
                          />
                          <span
                            style={{ background: "rgba(255,255,255,0.8)" }}
                          />
                          <span
                            style={{ background: "rgba(255,255,255,0.8)" }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Image preview */}
                {!isReadOnly && selectedImages.length > 0 && (
                  <div className="p-2 flex gap-2 flex-wrap bg-gray-50 border-t flex-shrink-0">
                    {selectedImages.map((file, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(file)}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <button
                          onClick={() =>
                            setSelectedImages((prev) =>
                              prev.filter((_, i) => i !== index),
                            )
                          }
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* INPUT or READ-ONLY footer */}
                {isReadOnly ? (
                  <div className="border-t p-3 bg-gray-50 flex items-center justify-center gap-2 flex-shrink-0">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <p className="text-xs text-gray-500">
                      Staff is offline — messaging disabled
                    </p>
                  </div>
                ) : (
                  <div className="border-t p-3 bg-white flex gap-2 items-center flex-shrink-0">
                    <label
                      className={`cursor-pointer bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition ${isSending ? "opacity-50 pointer-events-none" : ""}`}
                    >
                      📎
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        hidden
                        disabled={isSending}
                        onChange={(e) => {
                          const files = Array.from(e.target.files);
                          if (files.length + selectedImages.length > 3) {
                            alert("Max 3 images");
                            return;
                          }
                          setSelectedImages((prev) => [...prev, ...files]);
                        }}
                      />
                    </label>
                    <input
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={
                        isSending ? "Sending..." : "Enter message..."
                      }
                      disabled={isSending}
                      className={`flex-1 rounded-full px-4 py-2 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 transition ${isSending ? "opacity-60 cursor-not-allowed" : ""}`}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={
                        isSending ||
                        (!text.trim() && selectedImages.length === 0)
                      }
                      className="bg-green-500 text-white rounded-full p-2 hover:bg-green-600 disabled:opacity-50 transition flex items-center justify-center w-9 h-9"
                    >
                      {isSending ? (
                        <div className="send-spinner" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}
