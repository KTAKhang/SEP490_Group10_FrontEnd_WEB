import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  MessageCircle,
  Search,
  Eye,
  Users,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { getChatRoomsAdminRequest } from "../../../redux/actions/chatActions";
import ChatRoomDetail from "./ChatRoomDetail";
import Loading from "../../../components/Loading/Loading";

const Card = ({ children, className = "" }) => (
  <div
    className={`bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden ${className}`}
  >
    {children}
  </div>
);

const CardHeader = ({ children, className = "" }) => (
  <div className={`border-b border-gray-100 px-5 py-4 ${className}`}>
    {children}
  </div>
);

const CardTitle = ({ children, className = "" }) => (
  <h3
    className={`text-base font-semibold text-gray-800 ${className}`}
  >
    {children}
  </h3>
);

const CardContent = ({ children, className = "" }) => (
  <div className={`p-5 ${className}`}>{children}</div>
);

const ChatManagement = () => {
  const dispatch = useDispatch();
  const { rooms, roomsLoading, roomsPagination } = useSelector(
    (state) => state.chat
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);

  const limit = 10;

  useEffect(() => {
    const params = {
      page: currentPage,
      limit,
      search: searchTerm || undefined,
      sortBy,
      sortOrder,
    };
    dispatch(getChatRoomsAdminRequest(params));
  }, [dispatch, currentPage, searchTerm, sortBy, sortOrder]);

  const handleViewRoom = (room) => {
    setSelectedRoom(room);
    setShowDetailModal(true);
  };

  const getRoomShortId = (room) =>
    room?._id ? room._id.slice(-6) : "N/A";

  const formatDateTime = (iso) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
            <MessageCircle size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Quản lý phòng chat
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Xem danh sách và chi tiết các phòng chat
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-5">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
            Tìm kiếm & lọc
          </p>
          <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
            <div className="relative min-w-0 flex-1 lg:max-w-xs">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Tìm kiếm phòng chat..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setCurrentPage(1);
                }}
                className="rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="createdAt">Ngày tạo</option>
                <option value="updatedAt">Ngày cập nhật</option>
              </select>
              <select
                value={sortOrder}
                onChange={(e) => {
                  setSortOrder(e.target.value);
                  setCurrentPage(1);
                }}
                className="rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="desc">Mới nhất</option>
                <option value="asc">Cũ nhất</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rooms Table */}
      <Card>
        <CardHeader className="py-4">
          <CardTitle>
            Danh sách phòng chat (
            {roomsPagination?.total ?? rooms?.length ?? 0})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {roomsLoading ? (
            <Loading message="Đang tải..." />
          ) : !rooms?.length ? (
            <div className="p-8 text-center">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">Chưa có phòng chat nào</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50/80">
                    <tr>
                      <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                        Khách hàng
                      </th>
                      <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                        Nhân viên hỗ trợ
                      </th>
                      <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                        Tin nhắn cuối
                      </th>
                      <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                        Hoạt động gần nhất
                      </th>
                      <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-gray-600">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {rooms.map((room) => (
                      <tr key={room._id} className="hover:bg-gray-50">
                        {/* Customer */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            {room.user?.avatar ? (
                              <img
                                src={room.user.avatar}
                                alt={room.user.user_name}
                                className="h-10 w-10 rounded-full object-cover border border-gray-200"
                              />
                            ) : (
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                <MessageCircle size={20} />
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-semibold text-gray-900">
                                {room.user?.user_name || "Khách hàng"}
                              </p>
                              <p className="text-xs text-gray-500 truncate max-w-xs">
                                {room.user?.email || "—"}
                              </p>
                              <p className="text-[11px] text-gray-400 mt-0.5">
                                Phòng #{getRoomShortId(room)}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Staff */}
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            {room.staff?.avatar && (
                              <img
                                src={room.staff.avatar}
                                alt={room.staff.user_name}
                                className="h-8 w-8 rounded-full object-cover border border-gray-200"
                              />
                            )}
                            <div className="min-w-0">
                              <div className="flex items-center gap-1 text-sm text-gray-800">
                                <Users size={16} className="text-gray-400" />
                                <span className="truncate">
                                  {room.staff?.user_name || "Chưa gán"}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 truncate max-w-[180px]">
                                {room.staff?.email || "—"}
                              </p>
                              {(room.unreadByUser > 0 ||
                                room.unreadByStaff > 0) && (
                                <div className="mt-1 flex flex-wrap gap-1 text-[11px]">
                                  {room.unreadByUser > 0 && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                                      KH: {room.unreadByUser}
                                    </span>
                                  )}
                                  {room.unreadByStaff > 0 && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                                      Staff: {room.unreadByStaff}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Last message */}
                        <td className="px-5 py-3.5">
                          <p className="text-sm text-gray-700 truncate max-w-[260px]">
                            {room.lastMessage || "—"}
                          </p>
                        </td>

                        {/* Last activity */}
                        <td className="px-5 py-3.5 whitespace-nowrap text-sm text-gray-600">
                          {formatDateTime(room.updatedAt || room.createdAt)}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <button
                            onClick={() => handleViewRoom(room)}
                            className="rounded-xl p-2 text-blue-600 transition hover:bg-blue-50 hover:text-blue-700"
                            title="Xem chi tiết"
                          >
                            <Eye size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {roomsPagination && roomsPagination.totalPages > 1 && (
                <div className="flex flex-col gap-3 border-t border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-gray-500">
                    Hiển thị{" "}
                    {roomsPagination.page * roomsPagination.limit -
                      roomsPagination.limit +
                      1}
                    –
                    {Math.min(
                      roomsPagination.page * roomsPagination.limit,
                      roomsPagination.total
                    )}{" "}
                    / {roomsPagination.total}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setCurrentPage((p) => Math.max(1, p - 1))
                      }
                      disabled={currentPage === 1}
                      className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition disabled:opacity-50 hover:bg-gray-50"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    {[...Array(roomsPagination.totalPages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`min-w-[2.25rem] rounded-xl px-3 py-2 text-sm font-medium transition ${
                          currentPage === i + 1
                            ? "bg-blue-600 text-white shadow-sm"
                            : "border border-gray-200 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() =>
                        setCurrentPage((p) =>
                          Math.min(roomsPagination.totalPages, p + 1)
                        )
                      }
                      disabled={currentPage === roomsPagination.totalPages}
                      className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition disabled:opacity-50 hover:bg-gray-50"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Room Detail Modal */}
      <ChatRoomDetail
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedRoom(null);
        }}
        room={selectedRoom}
      />
    </div>
  );
};

export default ChatManagement;
