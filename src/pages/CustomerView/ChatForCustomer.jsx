import { useEffect, useState } from "react";
import { MessageCircle, Send, X, Minimize2, Maximize2 } from "lucide-react";
import api from "../../api";
import { socket } from "../../socket";
import { Navigate, useNavigate } from "react-router-dom";

export default function CustomerChat() {
  const tokenFromStorage = localStorage.getItem("token");
  const isAuthenticated = !!tokenFromStorage;
  const navigate = useNavigate();
  // Nếu component cần authentication

  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [onlineStaffs, setOnlineStaffs] = useState([]);
const [user, setUser] = useState(null);

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (raw) {
      const user = JSON.parse(raw);
      if (user.role_name === "customer") {
        setUser(user);
      }
    }
  }, []);

  

   /* ======================
     ONLINE STAFFS
  ====================== */
  useEffect(() => {
    socket.on("online_staffs", (staffs) => {
      setOnlineStaffs(staffs); // [staffId1, staffId2]
    });

    return () => socket.off("online_staffs");
  }, []);

  const staffId = room?.staff?._id;
  const isStaffOnline = staffId && onlineStaffs.includes(staffId);
  /* ======================
     SOCKET LISTENER
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
     JOIN ROOM
  ====================== */
  useEffect(() => {
    if (room?._id) {
      socket.emit("join_room", room._id);
    }
  }, [room]);

    /* ======================
     CREATE ROOM
  ====================== */
  const createRoom = async () => {
    const res = await api.post("/chat/room");
    const createdRoom = res.data.data;

    setRoom(createdRoom);

    const msgRes = await api.get(
      `/chat/room/${createdRoom._id}/messages`
    );
    setMessages(msgRes.data.data);

    setIsOpen(true);
  };

  /* ======================
     SEND MESSAGE
  ====================== */
  const sendMessage = () => {
    if (!room || !text.trim()) return;
    console.log("OK")

    socket.emit("send_message", {
      roomId: room._id,
      senderId: user._id,
      senderRole: "customer",
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

 const toggleChat = () => {
  console.log("🔥 toggleChat");

  if (!isAuthenticated) {
    console.log("❌ not authenticated");
    navigate("/login");
    return;
  }

  setIsOpen(true);

  if (!room) {
    console.log("🚀 call createRoom");
    createRoom();
  }
};



  const closeChat = () => {
    setIsOpen(false);
    setRoom(null);
    setMessages([]);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 flex items-center justify-center group"
        >
          <MessageCircle className="w-7 h-7 group-hover:scale-110 transition-transform" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse"></span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className={`bg-white rounded-2xl shadow-2xl transition-all duration-300 ${
            isMinimized ? "w-80 h-14" : "w-96 h-[600px]"
          } flex flex-col overflow-hidden`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Support </h3>
                <p className="text-blue-100 text-xs flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  Trực tuyến
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                {isMinimized ? (
                  <Maximize2 className="w-4 h-4 text-white" />
                ) : (
                  <Minimize2 className="w-4 h-4 text-white" />
                )}
              </button>
              <button
                onClick={closeChat}
                className="p-1.5 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-gray-50 to-white">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mb-3">
                      <MessageCircle className="w-8 h-8 text-blue-600" />
                    </div>
                    <p className="text-gray-600 font-medium mb-1">
                      Bắt đầu cuộc trò chuyện
                    </p>
                    <p className="text-gray-400 text-sm">
                      Chúng tôi sẽ phản hồi ngay lập tức!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages.map((m) => {
                      const isCustomer =
                        m.senderRole === "customer" ||
                        m.sender._id === "6960f91abe067bcf753cf1bf";
                      return (
                        <div
                          key={m._id}
                          className={`flex ${isCustomer ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`flex gap-2 max-w-[80%] ${isCustomer ? "flex-row-reverse" : ""}`}
                          >
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${
                                isCustomer
                                  ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white"
                                  : "bg-gradient-to-br from-gray-300 to-gray-400 text-white"
                              }`}
                            >
                              {isCustomer ? "B" : "S"}
                            </div>
                            <div>
                              <div
                                className={`rounded-2xl px-4 py-2 shadow-sm ${
                                  isCustomer
                                    ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-br-sm"
                                    : "bg-white border border-gray-200 text-gray-800 rounded-bl-sm"
                                }`}
                              >
                                <p className="text-sm leading-relaxed">
                                  {m.content}
                                </p>
                              </div>
                              <p
                                className={`text-xs text-gray-500 mt-1 px-1 ${isCustomer ? "text-right" : ""}`}
                              >
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
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="p-4 border-t border-gray-200 bg-white">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={text}
                    disabled={!room}
                    onChange={(e) => setText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Nhập tin nhắn..."
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!text.trim()}
                    className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-2 text-center">
                  Nhấn Enter để gửi tin nhắn
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
