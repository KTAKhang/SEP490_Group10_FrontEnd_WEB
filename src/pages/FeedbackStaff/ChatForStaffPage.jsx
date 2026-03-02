import { useEffect, useState, useRef } from "react";
import { MessageCircle, Send, RefreshCw, User, Clock } from "lucide-react";
import api from "../../api";
import { socket } from "../../socket";

export default function StaffChat() {
  const [rooms, setRooms] = useState([]);
  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [selectedImages, setSelectedImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [hasMore, setHasMore] = useState(false);
  const [oldestMessageId, setOldestMessageId] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const initialLoadRef = useRef(false);
  const [initializing, setInitializing] = useState(false);
  const [staff, setStaff] = useState(null);

  // ✅ NEW: loading state for send
  const [isSending, setIsSending] = useState(false);

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
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

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

    if (isSameDay(d, today)) return "Today";
    if (isSameDay(d, yesterday)) return "Yesterday";

    const startOfWeek = getStartOfWeek(today);
    if (d >= startOfWeek) {
      const weekday = d.toLocaleDateString("vi-VN", { weekday: "long" });
      return weekday.charAt(0).toUpperCase() + weekday.slice(1);
    }

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
      if (!updatedRoom.staff || updatedRoom.staff._id !== staff._id) return;

      setRooms((prev) => {
        const exists = prev.find((r) => r._id === updatedRoom._id);

        if (!exists) return [updatedRoom, ...prev];

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

    setRooms((prev) =>
      prev.map((room) =>
        room._id === r._id ? { ...room, unreadByStaff: 0 } : room,
      ),
    );

    try {
      await api.get(`/chat/room/${r._id}/mark-as-read`);
    } catch (err) {
      console.error("mark-as-read failed:", err?.message || err);
    }

    setHasMore(false);
    setOldestMessageId(null);
    initialLoadRef.current = true;
    setInitializing(true);
    await loadMessages(r._id);
  };

  const loadMessages = async (
    roomId,
    { before = null, prepend = false, limit = 5 } = {},
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

  /* ======================
     SEND MESSAGE (with loading)
  ====================== */
  const sendMessage = async () => {
    if (!room) return;
    if (!text.trim() && selectedImages.length === 0) return;
    if (isSending) return;

    setIsSending(true);

    try {
      const formData = new FormData();
      formData.append("roomId", room._id);
      formData.append("content", text.trim());
      formData.append("senderRole", "feedbacked-staff");

      selectedImages.forEach((file) => {
        formData.append("images", file);
      });

      const res = await api.post("/chat/message", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const newMessage = res.data.data;

      socket.emit("send_message", {
        roomId: room._id,
        message: newMessage,
      });

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

  return (
    <>
      {/* ✅ CSS keyframes for animations */}
      <style>{`
        @keyframes sending-bounce {
          0%, 80%, 100% { transform: scale(0); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
        @keyframes spinner-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes msg-fade-in {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .dot-typing span {
          display: inline-block;
          width: 7px;
          height: 7px;
          border-radius: 50%;
          animation: sending-bounce 1.3s infinite ease-in-out;
        }
        .dot-typing span:nth-child(1) { animation-delay: 0s; }
        .dot-typing span:nth-child(2) { animation-delay: 0.15s; }
        .dot-typing span:nth-child(3) { animation-delay: 0.3s; }
        .send-spinner {
          width: 16px;
          height: 16px;
          border: 2.5px solid rgba(255,255,255,0.4);
          border-top-color: white;
          border-radius: 50%;
          animation: spinner-spin 0.7s linear infinite;
        }
        .msg-fade-in {
          animation: msg-fade-in 0.2s ease;
        }
      `}</style>

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
                  className={`w-4 h-4 text-white ${loading ? "animate-spin" : ""}`}
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
                    <div >
                     <img
                        src={r.user.avatar}
                        alt={r.user.userName}
                        className="w-14 h-14 rounded-full border-2 border-white shadow-md group-hover:scale-110 transition object-cover"
                      /> 
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
                    if (room?._id && oldestMessageId) {
                      loadMessages(room._id, {
                        before: oldestMessageId,
                        prepend: true,
                      });
                    }
                  }
                }}
                className="flex-1 overflow-y-auto p-4"
              >
                {loadingMore && (
                  <div className="text-center text-xs text-gray-500 mb-2">
                    Đang tải tin nhắn cũ...
                  </div>
                )}
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
                    <div key={m._id} className="msg-fade-in">
                      {showDateSeparator && (
                        <div className="w-full flex justify-center my-4">
                          <div className="bg-gray-200 text-xs text-gray-600 px-3 py-1 rounded-full shadow-sm">
                            {formatDateHeader(m.createdAt)}
                          </div>
                        </div>
                      )}

                      <div
                        className={`flex mb-3 ${isStaff ? "justify-end" : "justify-start"}`}
                      >
                        <div>
                          <div
                            className={`px-4 py-2 rounded-xl max-w-md ${
                              isStaff
                                ? "bg-green-600 text-white"
                                : "bg-gray-200 text-gray-800"
                            }`}
                          >
                            {m.content && <p>{m.content}</p>}

                            {m.images && m.images.length > 0 && (
                              <div className="grid grid-cols-2 gap-2 mt-2">
                                {m.images.map((img, index) => (
                                  <img
                                    key={index}
                                    src={img}
                                    className="rounded-lg max-h-40 object-cover"
                                  />
                                ))}
                              </div>
                            )}
                          </div>

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

                {/* ✅ Sending bubble */}
                {isSending && (
                  <div className="flex justify-end mb-3 msg-fade-in">
                    <div>
                      <div className="px-4 py-3 rounded-xl max-w-md bg-green-500 text-white flex items-center gap-2">
                        <span className="text-sm opacity-80">Sending</span>
                        <div className="dot-typing flex gap-1">
                          <span style={{ background: "rgba(255,255,255,0.8)" }} />
                          <span style={{ background: "rgba(255,255,255,0.8)" }} />
                          <span style={{ background: "rgba(255,255,255,0.8)" }} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {selectedImages.length > 0 && (
                <div className="p-3 flex gap-2 flex-wrap border-t bg-gray-50">
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

              {/* Input */}
              <div className="p-4 border-t">
                <div className="flex gap-2 items-center">
                  {/* Upload button */}
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
                          alert("Tối đa 3 ảnh");
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
                    disabled={isSending}
                    placeholder={isSending ? "Sending..." : "Enter message..."}
                    className={`flex-1 border rounded-full px-4 py-2 transition ${
                      isSending ? "opacity-60 cursor-not-allowed bg-gray-50" : ""
                    }`}
                  />

                  {/* ✅ Send button with spinner */}
                  <button
                    onClick={sendMessage}
                    disabled={
                      isSending ||
                      (!text.trim() && selectedImages.length === 0)
                    }
                    className="bg-green-600 text-white px-5 py-2 rounded-full disabled:opacity-50 flex items-center justify-center min-w-[52px]"
                  >
                    {isSending ? (
                      <div className="send-spinner" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}