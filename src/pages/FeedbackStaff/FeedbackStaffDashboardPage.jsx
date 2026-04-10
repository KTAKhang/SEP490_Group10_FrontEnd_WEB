import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  Star,
  MessageSquare,
  MessageCircle,
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
  return d.toLocaleDateString("en-GB", {
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <LayoutDashboard className="h-7 w-7 text-green-600" />
          Feedback Staff Dashboard
        </h1>
        <p className="text-gray-600 mt-1">
          Overview of reviews, news comments, and chat activities
        </p>
      </div>

      {/* Action required */}
      {(tasks.unreadChatRooms > 0 || tasks.reviewsHidden > 0) && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-800">
              <AlertCircle className="h-5 w-5" />
              Needs attention
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            {tasks.unreadChatRooms > 0 && (
              <Link
                to="/feedbacked-staff/chat"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-100 text-amber-800 hover:bg-amber-200 text-sm font-medium"
              >
                <Inbox className="h-4 w-4" />
                {tasks.unreadChatRooms} chat room(s) with unread messages
              </Link>
            )}
            {tasks.reviewsHidden > 0 && (
              <Link
                to="/feedbacked-staff/reviews"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-100 text-amber-800 hover:bg-amber-200 text-sm font-medium"
              >
                <EyeOff className="h-4 w-4" />
                {tasks.reviewsHidden} hidden review(s)
              </Link>
            )}
          </CardContent>
        </Card>
      )}

      {/* Statistics cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Reviews"
          value={reviews.total ?? 0}
          sub={`Visible: ${reviews.visible ?? 0} · Hidden: ${reviews.hidden ?? 0} · New (7 days): ${reviews.recentCount ?? 0}`}
          icon={Star}
          color="text-amber-600"
          bgColor="bg-amber-100"
        />
        <StatCard
          title="News Comments"
          value={newsComments.total ?? 0}
          sub={`Visible: ${newsComments.visible ?? 0} · Hidden: ${newsComments.hidden ?? 0} · New (7 days): ${newsComments.recentCount ?? 0}`}
          icon={MessageSquare}
          color="text-blue-600"
          bgColor="bg-blue-100"
        />
        <StatCard
          title="Chat"
          value={chat.totalRooms ?? 0}
          sub={`Rooms with unread messages: ${chat.roomsWithUnread ?? 0}`}
          icon={MessageCircle}
          color="text-green-600"
          bgColor="bg-green-100"
        />
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent reviews */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-500" />
              Recent Reviews
            </CardTitle>
            <Link
              to="/feedbacked-staff/reviews"
              className="text-sm text-green-600 hover:underline font-medium"
            >
              View all
            </Link>
          </CardHeader>
          <CardContent className="max-h-[420px] overflow-y-auto pr-1">
            {recent.reviews?.length ? (
              <ul className="space-y-3">
                {recent.reviews.slice(0, 10).map((r) => (
                  <li
                    key={r._id}
                    className="flex items-start justify-between gap-2 py-2 border-b border-gray-100 last:border-0"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {r.user_id?.user_name || "—"} · {r.product_id?.name || "—"}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {r.rating} star(s) · {formatDate(r.createdAt)}
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
                      {r.status === "VISIBLE" ? "Visible" : "Hidden"}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 py-4">No reviews yet</p>
            )}
          </CardContent>
        </Card>

        {/* Recent news comments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-500" />
              Recent News Comments
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-[420px] overflow-y-auto pr-1">
            {recent.newsComments?.length ? (
              <ul className="space-y-3">
                {recent.newsComments.slice(0, 10).map((c) => (
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
                      {c.status === "VISIBLE" ? "Visible" : "Hidden"}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 py-4">No comments yet</p>
            )}
          </CardContent>
        </Card>

        {/* Recent chat rooms */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-green-500" />
              Recent Chat Rooms
            </CardTitle>
            <Link
              to="/feedbacked-staff/chat"
              className="text-sm text-green-600 hover:underline font-medium"
            >
              Go to chat
            </Link>
          </CardHeader>
          <CardContent className="max-h-[420px] overflow-y-auto pr-1">
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
                          {room.user?.user_name || "Guest"}
                        </p>
                        <p className="text-xs text-gray-500">
                          Updated: {formatDate(room.updatedAt)}
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
              <p className="text-sm text-gray-500 py-4">No chat rooms yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FeedbackStaffDashboardPage;
