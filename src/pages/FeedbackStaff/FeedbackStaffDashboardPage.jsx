import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  Star,
  MessageSquare,
  MessageCircle,
  FileText,
  LayoutDashboard,
  Eye,
  EyeOff,
  Inbox,
  Send,
  AlertCircle,
} from "lucide-react";
import { getFeedbackedStaffDashboardRequest } from "../../redux/actions/feedbackedStaffDashboardActions";

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-lg border shadow-sm ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children, className = "" }) => (
  <div className={`p-4 border-b border-gray-100 ${className}`}>{children}</div>
);

const CardTitle = ({ children, className = "" }) => (
  <h3 className={`text-base font-semibold text-gray-800 ${className}`}>
    {children}
  </h3>
);

const CardContent = ({ children, className = "" }) => (
  <div className={`p-4 ${className}`}>{children}</div>
);

const StatCard = ({ title, value, sub, icon: Icon, color, bgColor }) => (
  <Card className="hover:shadow-md transition-shadow">
    <div className="p-4 flex flex-row items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
        {sub != null && (
          <p className="text-xs text-gray-500 mt-1">{sub}</p>
        )}
      </div>
      <div className={`p-3 rounded-lg ${bgColor}`}>
        <Icon className={`h-6 w-6 ${color}`} />
      </div>
    </div>
  </Card>
);

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const FeedbackStaffDashboardPage = () => {
  const dispatch = useDispatch();
  const { data, loading, error } = useSelector(
    (state) => state.feedbackedStaffDashboard
  );

  useEffect(() => {
    dispatch(getFeedbackedStaffDashboardRequest());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-700">
        {error}
      </div>
    );
  }

  const summary = data?.summary || {};
  const tasks = data?.tasks || {};
  const recent = data?.recent || {};

  const reviews = summary.reviews || {};
  const newsComments = summary.newsComments || {};
  const chat = summary.chat || {};
  const news = summary.news || {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <LayoutDashboard className="h-7 w-7 text-green-600" />
          Thống kê Feedback Staff
        </h1>
        <p className="text-gray-600 mt-1">
          Tổng quan đánh giá, bình luận tin tức, chat và tin tức
        </p>
      </div>

      {/* Nhiệm vụ cần xử lý */}
      {(tasks.unreadChatRooms > 0 ||
        tasks.reviewsHidden > 0 ||
        tasks.commentsHidden > 0 ||
        tasks.newsDraft > 0) && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-800">
              <AlertCircle className="h-5 w-5" />
              Cần chú ý
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            {tasks.unreadChatRooms > 0 && (
              <Link
                to="/feedbacked-staff/chat"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-100 text-amber-800 hover:bg-amber-200 text-sm font-medium"
              >
                <Inbox className="h-4 w-4" />
                {tasks.unreadChatRooms} phòng chat có tin chưa đọc
              </Link>
            )}
            {tasks.reviewsHidden > 0 && (
              <Link
                to="/feedbacked-staff/reviews"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-100 text-amber-800 hover:bg-amber-200 text-sm font-medium"
              >
                <EyeOff className="h-4 w-4" />
                {tasks.reviewsHidden} review đang ẩn
              </Link>
            )}
            {tasks.commentsHidden > 0 && (
              <span className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-100 text-amber-800 text-sm font-medium">
                <EyeOff className="h-4 w-4" />
                {tasks.commentsHidden} bình luận đang ẩn
              </span>
            )}
            {tasks.newsDraft > 0 && (
              <span className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-100 text-amber-800 text-sm font-medium">
                <FileText className="h-4 w-4" />
                {tasks.newsDraft} bài viết bản nháp
              </span>
            )}
          </CardContent>
        </Card>
      )}

      {/* Thẻ thống kê */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Reviews"
          value={reviews.total ?? 0}
          sub={`Hiển thị: ${reviews.visible ?? 0} · Ẩn: ${reviews.hidden ?? 0} · Mới 7 ngày: ${reviews.recentCount ?? 0}`}
          icon={Star}
          color="text-amber-600"
          bgColor="bg-amber-100"
        />
        <StatCard
          title="Bình luận tin tức"
          value={newsComments.total ?? 0}
          sub={`Hiển thị: ${newsComments.visible ?? 0} · Ẩn: ${newsComments.hidden ?? 0} · Mới 7 ngày: ${newsComments.recentCount ?? 0}`}
          icon={MessageSquare}
          color="text-blue-600"
          bgColor="bg-blue-100"
        />
        <StatCard
          title="Chat"
          value={chat.totalRooms ?? 0}
          sub={`Có tin chưa đọc: ${chat.roomsWithUnread ?? 0} phòng`}
          icon={MessageCircle}
          color="text-green-600"
          bgColor="bg-green-100"
        />
        <StatCard
          title="Tin tức"
          value={news.total ?? 0}
          sub={`Xuất bản: ${news.published ?? 0} · Nháp: ${news.draft ?? 0}`}
          icon={FileText}
          color="text-purple-600"
          bgColor="bg-purple-100"
        />
      </div>

      {/* Danh sách gần đây */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reviews gần đây */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-500" />
              Reviews gần đây
            </CardTitle>
            <Link
              to="/feedbacked-staff/reviews"
              className="text-sm text-green-600 hover:underline font-medium"
            >
              Xem tất cả
            </Link>
          </CardHeader>
          <CardContent>
            {recent.reviews?.length ? (
              <ul className="space-y-3">
                {recent.reviews.map((r) => (
                  <li
                    key={r._id}
                    className="flex items-start justify-between gap-2 py-2 border-b border-gray-100 last:border-0"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {r.user_id?.user_name || "—"} · {r.product_id?.name || "—"}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {r.rating} sao · {formatDate(r.createdAt)}
                      </p>
                      {r.comment && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {r.comment}
                        </p>
                      )}
                    </div>
                    <span
                      className={`shrink-0 text-xs px-2 py-1 rounded ${
                        r.status === "VISIBLE"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {r.status === "VISIBLE" ? (
                        <Eye className="h-3 w-3 inline mr-0.5" />
                      ) : (
                        <EyeOff className="h-3 w-3 inline mr-0.5" />
                      )}
                      {r.status === "VISIBLE" ? "Hiển thị" : "Ẩn"}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 py-4">Chưa có review nào</p>
            )}
          </CardContent>
        </Card>

        {/* Bình luận tin tức gần đây */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-500" />
              Bình luận tin tức gần đây
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recent.newsComments?.length ? (
              <ul className="space-y-3">
                {recent.newsComments.map((c) => (
                  <li
                    key={c._id}
                    className="py-2 border-b border-gray-100 last:border-0"
                  >
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {c.user_id?.user_name || "—"} · {c.news_id?.title || "—"}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {formatDate(c.createdAt)}
                    </p>
                    {(c.content || c.comment) && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {c.content || c.comment}
                      </p>
                    )}
                    <span
                      className={`inline-block mt-1 text-xs px-2 py-0.5 rounded ${
                        c.status === "VISIBLE"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {c.status === "VISIBLE" ? "Hiển thị" : "Ẩn"}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 py-4">Chưa có bình luận nào</p>
            )}
          </CardContent>
        </Card>

        {/* Phòng chat gần đây */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-green-500" />
              Phòng chat gần đây
            </CardTitle>
            <Link
              to="/feedbacked-staff/chat"
              className="text-sm text-green-600 hover:underline font-medium"
            >
              Vào chat
            </Link>
          </CardHeader>
          <CardContent>
            {recent.chatRooms?.length ? (
              <ul className="space-y-3">
                {recent.chatRooms.map((room) => (
                  <li
                    key={room._id}
                    className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0 overflow-hidden">
                        {room.user?.avatar ? (
                          <img
                            src={room.user.avatar}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-xs font-medium text-gray-600">
                            {(room.user?.user_name || "U").charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {room.user?.user_name || "Khách"}
                        </p>
                        <p className="text-xs text-gray-500">
                          Cập nhật: {formatDate(room.updatedAt)}
                        </p>
                      </div>
                    </div>
                    {room.unreadByStaff > 0 && (
                      <span className="shrink-0 bg-green-600 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                        {room.unreadByStaff}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 py-4">Chưa có phòng chat nào</p>
            )}
          </CardContent>
        </Card>

        {/* Tin tức gần đây */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-500" />
              Tin tức gần đây
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recent.news?.length ? (
              <ul className="space-y-3">
                {recent.news.map((n) => (
                  <li
                    key={n._id}
                    className="py-2 border-b border-gray-100 last:border-0"
                  >
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {n.title || "—"}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {formatDate(n.updatedAt || n.createdAt)} ·{" "}
                      <span
                        className={
                          n.status === "PUBLISHED"
                            ? "text-green-600"
                            : "text-amber-600"
                        }
                      >
                        {n.status === "PUBLISHED" ? "Đã xuất bản" : "Bản nháp"}
                      </span>
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 py-4">Chưa có tin tức nào</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FeedbackStaffDashboardPage;
