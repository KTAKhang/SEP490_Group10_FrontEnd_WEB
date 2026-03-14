import { useEffect, useRef } from "react";
import {
  X,
  MessageCircle,
  Users,
  Eye,
  User,
  ChevronUp,
  Loader2,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  getRoomDetailAdminRequest,
  getRoomDetailAdminSuccess,
} from "../../../redux/actions/chatActions";
import Loading from "../../../components/Loading/Loading";

const MESSAGES_PER_PAGE = 6;

const ChatRoomDetail = ({ isOpen, onClose, room }) => {
  const dispatch = useDispatch();
  const { roomDetail, roomDetailLoading, roomDetailLoadMore } = useSelector(
    (state) => state.chat
  );
  const messagesContainerRef = useRef(null);

  const roomId = room?._id;

  useEffect(() => {
    if (isOpen && roomId) {
      dispatch(
        getRoomDetailAdminRequest(roomId, {
          page: 1,
          limit: MESSAGES_PER_PAGE,
        })
      );
    }
    return () => {
      if (!isOpen) {
        dispatch(getRoomDetailAdminSuccess(null));
      }
    };
  }, [isOpen, roomId, dispatch]);

  const hasMore = roomDetail?.hasMore;
  const prevScrollHeightRef = useRef(null);

  useEffect(() => {
    if (roomDetailLoadMore === false && prevScrollHeightRef.current != null) {
      const container = messagesContainerRef.current;
      if (container) {
        const newScrollHeight = container.scrollHeight;
        container.scrollTop = newScrollHeight - prevScrollHeightRef.current;
      }
      prevScrollHeightRef.current = null;
    }
  }, [roomDetailLoadMore, roomDetail?.messages?.length]);

  const handleLoadMore = () => {
    if (!roomId || roomDetailLoadMore || !hasMore) return;
    const oldestId = roomDetail?.oldestMessageId;
    if (!oldestId) return;

    const container = messagesContainerRef.current;
    if (container) prevScrollHeightRef.current = container.scrollHeight;

    dispatch(
      getRoomDetailAdminRequest(roomId, {
        limit: MESSAGES_PER_PAGE,
        before: oldestId,
        append: true,
      })
    );
  };

  if (!isOpen) return null;

  const displayData = roomDetail || room;
  const participants = displayData?.participants || [];
  const messages = displayData?.messages || [];
  const roomName = displayData?.name || `Phòng #${roomId?.slice(-6) || "N/A"}`;

  // Helpers giống Staff/Customer chat: nhóm theo ngày, format header
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

  const formatDateHeader = (dateStr) => {
    const d = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (isSameDay(d, today)) return "Hôm nay";
    if (isSameDay(d, yesterday)) return "Hôm qua";

    return d.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getSenderName = (msg) =>
    msg.sender?.name ||
    msg.sender?.user_name ||
    msg.sender?.username ||
    msg.sender?.email ||
    "Unknown";

  const isFromStaffSide = (msg) => {
    const role =
      msg.senderRole ||
      msg.sender?.role ||
      msg.sender?.role_name ||
      msg.sender?.type;
    // Mặc định: customer bên trái, còn lại (staff/admin) bên phải
    if (!role) return false;
    return role !== "customer";
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Eye size={24} className="text-blue-600" />
            Chi tiết phòng chat
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {roomDetailLoading ? (
            <Loading message="Đang tải chi tiết phòng..." />
          ) : (
            <>
              {/* Room Info */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <MessageCircle size={18} />
                  Thông tin phòng
                </h3>
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <div>
                    <p className="text-xs text-gray-500">Tên phòng</p>
                    <p className="font-medium text-gray-900">{roomName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">ID phòng</p>
                    <p className="text-sm text-gray-600 font-mono">
                      {roomId || "—"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    {displayData?.createdAt && (
                      <p>
                        Tạo:{" "}
                        {new Date(displayData.createdAt).toLocaleString(
                          "vi-VN"
                        )}
                      </p>
                    )}
                    {displayData?.updatedAt && (
                      <p>
                        Cập nhật:{" "}
                        {new Date(displayData.updatedAt).toLocaleString(
                          "vi-VN"
                        )}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Participants */}
              {participants.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <Users size={18} />
                    Người tham gia ({participants.length})
                  </h3>
                  <div className="space-y-2">
                    {participants.map((p, idx) => (
                      <div
                        key={p._id || idx}
                        className="flex items-center gap-3 p-3 rounded-lg bg-gray-50"
                      >
                        <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                          <User size={18} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {p.name ||
                              p.user_name ||
                              p.username ||
                              p.email ||
                              "Unknown"}
                          </p>
                          {p.email && (
                            <p className="text-xs text-gray-500">{p.email}</p>
                          )}
                          {p.role && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                              {p.role}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Messages */}
              {messages.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    Lịch sử tin nhắn ({messages.length})
                  </h3>
                  <div
                    ref={messagesContainerRef}
                    className="space-y-3 max-h-[360px] overflow-y-auto pr-2 bg-gray-50 rounded-xl p-4"
                  >
                    {hasMore && (
                      <div className="flex justify-center pb-2">
                        <button
                          onClick={handleLoadMore}
                          disabled={roomDetailLoadMore}
                          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 border border-blue-200 rounded-xl hover:bg-blue-50 disabled:opacity-60 disabled:cursor-not-allowed transition"
                        >
                          {roomDetailLoadMore ? (
                            <>
                              <Loader2 size={18} className="animate-spin" />
                              Đang tải...
                            </>
                          ) : (
                            <>
                              <ChevronUp size={18} />
                              Xem thêm tin nhắn cũ
                            </>
                          )}
                        </button>
                      </div>
                    )}
                    {messages.map((msg, idx) => {
                      const prev = messages[idx - 1];
                      const showDateSeparator =
                        !prev || !isSameDay(prev.createdAt, msg.createdAt);
                      const fromStaff = isFromStaffSide(msg);
                      const senderName = getSenderName(msg);

                      return (
                        <div key={msg._id || idx}>
                          {showDateSeparator && msg.createdAt && (
                            <div className="flex justify-center my-2">
                              <div className="bg-gray-200 text-xs text-gray-600 px-3 py-1 rounded-full">
                                {formatDateHeader(msg.createdAt)}
                              </div>
                            </div>
                          )}

                          <div
                            className={`flex mb-1 ${fromStaff ? "justify-end" : "justify-start"
                              }`}
                          >
                            <div className="max-w-[70%]">
                              <div
                                className={`px-4 py-2 rounded-2xl text-sm shadow ${fromStaff
                                  ? "bg-blue-600 text-white rounded-br-none"
                                  : "bg-white text-gray-800 rounded-bl-none"
                                  }`}
                              >
                                <p className="text-[11px] font-semibold mb-1 opacity-80">
                                  {senderName}
                                </p>

                                {msg.content && (
                                  <p className="whitespace-pre-wrap break-words">
                                    {msg.content || msg.text}
                                  </p>
                                )}

                                {msg.images && msg.images.length > 0 && (
                                  <div className="grid grid-cols-2 gap-2 mt-2">
                                    {msg.images.map((img, imageIdx) => (
                                      <img
                                        key={imageIdx}
                                        src={img}
                                        alt="message-attachment"
                                        className="rounded-lg max-h-40 object-cover"
                                      />
                                    ))}
                                  </div>
                                )}
                              </div>

                              <p
                                className={`text-[11px] text-gray-500 mt-1 px-1 ${fromStaff ? "text-right" : "text-left"
                                  }`}
                              >
                                {msg.createdAt
                                  ? new Date(msg.createdAt).toLocaleTimeString(
                                    "vi-VN",
                                    {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    }
                                  )
                                  : "—"}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {participants.length === 0 && messages.length === 0 && (
                <p className="text-center text-gray-500 py-4">
                  Chưa có thông tin chi tiết
                </p>
              )}
            </>
          )}
        </div>

        <div className="flex items-center justify-end p-6 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatRoomDetail;
