import { useEffect, useState } from "react";
import { MessageCircle, Send, RefreshCw, User, Clock } from "lucide-react";
import api from "../../api";
import { socket } from "../../socket";

export default function StaffChat() {
  const [rooms, setRooms] = useState([]);
  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

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

  console.log("staff",staff)

   /* ======================
     STAFF ONLINE
  ====================== */
  useEffect(() => {
    if (!staff?._id) return;

    socket.emit("staff_online", staff._id);


    return () => {
      socket.emit("staff_offline", {
        staffId: staff._id,
      });
    };
  }, [staff]);
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

  /* ======================
     SOCKET: ROOM UPDATED
  ====================== */
 useEffect(() => {
  if (!staff?._id) return;

  const handler = (updatedRoom) => {
    // ❌ Không phải room của staff này → bỏ qua
    if (
      !updatedRoom.staff ||
      updatedRoom.staff._id !== staff._id
    ) {
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
          unreadByStaff:
            updatedRoom.unreadByStaff ?? exists.unreadByStaff,
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
        room._id === r._id ? { ...room, unreadByStaff: 0 } : room
      )
    );

    const res = await api.get(`/chat/room/${r._id}/messages`);
    setMessages(res.data.data);
  };

  /* ======================
     SEND MESSAGE
  ====================== */
  const sendMessage = () => {
    if (!room || !text.trim()) return;

    socket.emit("send_message", {
      roomId: room._id,
      senderId: "695f14af48aa576b63cf6997",
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
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Tin nhắn
            </h2>
            <button
              onClick={loadRooms}
              className="p-2 hover:bg-blue-500 rounded-lg transition-colors"
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
              <p>Chưa có cuộc trò chuyện nào</p>
            </div>
          ) : (
            rooms.map((r) => (
              <div
                key={r._id}
                onClick={() => openRoom(r)}
                className={`p-4 cursor-pointer transition-all border-b border-gray-100 hover:bg-blue-50 ${
                  room?._id === r._id
                    ? "bg-blue-50 border-l-4 border-l-blue-600"
                    : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white shadow-md">
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
              </div>
            ))
          )}
        </div>
      </div>

      {/* ===== CHAT ===== */}
      <div className="flex-1 flex flex-col bg-white">
        {!room ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500">
              Chọn một cuộc trò chuyện để bắt đầu
            </p>
          </div>
        ) : (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4">
              {messages.map((m) => {
                const isStaff =
                  m.senderRole === "feedbacked-staff" ||
                  m.sender._id === "6961b15f0b506435dc7500c0";

                return (
                  <div
                    key={m._id}
                    className={`flex mb-3 ${
                      isStaff ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`px-4 py-2 rounded-xl max-w-md ${
                        isStaff
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-800"
                      }`}
                    >
                      {m.content}
                    </div>
                    <p
                                className={`text-xs text-gray-500 mt-1 px-1 ${isStaff ? "text-right" : ""}`}
                              >
                                {new Date(m.createdAt).toLocaleTimeString(
                                  "vi-VN",
                                  { hour: "2-digit", minute: "2-digit" },
                                )}
                              </p>
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
                  placeholder="Nhập tin nhắn..."
                />
                <button
                  onClick={sendMessage}
                  className="bg-blue-600 text-white px-5 py-2 rounded-full"
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
