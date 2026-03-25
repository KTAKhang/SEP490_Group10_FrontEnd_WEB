import { useEffect, useState, useRef } from "react";
import { MessageCircle, Send, RefreshCw, User, Clock } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { socket } from "../../socket";
import {
  clearChatSendMessageResult,
  clearChatRoomMessages,
  getChatRoomMessagesRequest,
  getStaffChatRoomsRequest,
  markChatRoomAsReadRequest,
  receiveChatMessage,
  sendChatMessageRequest,
} from "../../redux/actions/chatActions";

export default function StaffChat() {
  const dispatch = useDispatch();
  const { staffRooms, staffRoomsLoading, sendMessage } = useSelector(
    (state) => state.chat || {},
  );

  const [rooms, setRooms] = useState([]);
  const [room, setRoom] = useState(null);
  const [text, setText] = useState("");
  const [selectedImages, setSelectedImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const initialLoadRef = useRef(false);
  const [initializing, setInitializing] = useState(false);
  const [staff, setStaff] = useState(null);

  // ✅ NEW: loading state for send
  const [isSending, setIsSending] = useState(false);
  const lastHandledSendMessageIdRef = useRef(null);
  const pendingPrependScrollHeightRef = useRef(null);

  const activeRoomMessagesState = useSelector((state) => {
    const roomId = room?._id;
    if (!roomId) return {};
    return state.chat.roomMessagesById?.[String(roomId)] || {};
  });

  const messages = activeRoomMessagesState.messages || [];
  const hasMore = activeRoomMessagesState.hasMore || false;
  const oldestMessageId = activeRoomMessagesState.oldestMessageId;
  const loadingMore = activeRoomMessagesState.loadingMore || false;

  // Load staff info for socket filtering (unread counts rely on this)
  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (!raw) return;
    try {
      const u = JSON.parse(raw);
      if (u?.role_name === "feedbacked-staff") setStaff(u);
    } catch {
      // ignore parse errors
    }
  }, []);

  useEffect(() => {
    const container = messagesContainerRef.current;
    const pendingPrependScrollHeight = pendingPrependScrollHeightRef.current;

    if (pendingPrependScrollHeight != null && container) {
      container.scrollTop = container.scrollHeight - pendingPrependScrollHeight;
      pendingPrependScrollHeightRef.current = null;
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    if (initialLoadRef.current) {
      initialLoadRef.current = false;
      setInitializing(false);
    }
  }, [messages]);

  /* ======================
    STAFF ONLINE
 ====================== */
//  useEffect(() => {
//   const raw = localStorage.getItem("user");
//   if (!raw) return;

//   const user = JSON.parse(raw);
//   if (user.role_name !== "feedbacked-staff") return;

//   setStaff(user);

//   socket.connect();

//   socket.on("connect", () => {
//     console.log("🟢 CONNECT:", socket.id);

//     socket.emit("staff_online", user._id, user.user_name, user.avatar);
//   });

//   return () => {
//     socket.off("connect");
//   };
// }, []);

  /* ======================
     LOAD ROOMS INIT
  ====================== */
  useEffect(() => {
    loadRooms();
  }, []);

  // Sync Redux staffRooms -> local rooms
  useEffect(() => {
    if (Array.isArray(staffRooms)) {
      setRooms(staffRooms);
    }
  }, [staffRooms]);

  useEffect(() => {
    setLoading(!!staffRoomsLoading);
  }, [staffRoomsLoading]);

  /* ======================
     SOCKET: RECEIVE MESSAGE
  ====================== */
  useEffect(() => {
    socket.on("receive_message", (message) => {
      const msgRoomId = message?.room?._id ?? message?.room;
      if (!msgRoomId) return;
      // Upsert messages for any room, so switching boxes still shows new content.
      dispatch(receiveChatMessage({ roomId: msgRoomId, message }));
    });

    return () => socket.off("receive_message");
  }, [dispatch]);

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
     SEND MESSAGE SUCCESS
  ====================== */
  useEffect(() => {
    const msg = sendMessage?.data;
    if (!msg) return;
    if (!room?._id) return;

    const roomKey = String(room._id);
    const targetRoomKey =
      sendMessage?.roomId != null ? String(sendMessage.roomId) : roomKey;
    if (targetRoomKey !== roomKey) return;

    const msgId = msg?._id ?? msg?.id;
    if (msgId && lastHandledSendMessageIdRef.current === String(msgId))
      return;
    if (msgId) lastHandledSendMessageIdRef.current = String(msgId);

    socket.emit("send_message", { roomId: room._id, message: msg });
    setText("");
    setSelectedImages([]);
    setIsSending(false);
    dispatch(clearChatSendMessageResult());
  }, [sendMessage?.data, sendMessage?.roomId, room]);

  useEffect(() => {
    if (!sendMessage?.error) return;
    if (!isSending) return;
    setIsSending(false);
    dispatch(clearChatSendMessageResult());
  }, [sendMessage?.error, isSending]);

  /* ======================
     LOAD ROOMS
  ====================== */
  const loadRooms = () => {
    dispatch(getStaffChatRoomsRequest());
  };

  /* ======================
     OPEN ROOM
  ====================== */
  const openRoom = (r) => {
    setRoom(r);

    setRooms((prev) =>
      prev.map((room) =>
        room._id === r._id ? { ...room, unreadByStaff: 0 } : room,
      ),
    );

    dispatch(markChatRoomAsReadRequest(r._id));
    dispatch(clearChatRoomMessages(r._id));
    initialLoadRef.current = true;
    setInitializing(true);
    dispatch(
      getChatRoomMessagesRequest(r._id, { prepend: false, limit: 5 }),
    );
  };

  /* ======================
     SEND MESSAGE (with loading)
  ====================== */
  const handleSendMessage = () => {
    if (!room) return;
    if (!text.trim() && selectedImages.length === 0) return;
    if (isSending) return;

    setIsSending(true);
    dispatch(
      sendChatMessageRequest({
        roomId: room._id,
        senderRole: "feedbacked-staff",
        content: text.trim(),
        images: selectedImages,
      }),
    );
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
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
                      pendingPrependScrollHeightRef.current = c.scrollHeight;
                      dispatch(
                        getChatRoomMessagesRequest(room._id, {
                          before: oldestMessageId,
                          prepend: true,
                          limit: 5,
                        }),
                      );
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
                        const c = messagesContainerRef.current;
                        if (c)
                          pendingPrependScrollHeightRef.current = c.scrollHeight;
                        dispatch(
                          getChatRoomMessagesRequest(room._id, {
                            before: oldestMessageId,
                            prepend: true,
                            limit: 5,
                          }),
                        );
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
                    onClick={handleSendMessage}
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