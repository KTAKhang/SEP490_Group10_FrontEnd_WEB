import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Search, Eye, Edit, Star } from "lucide-react";
import {
  getAdminReviewsRequest,
  updateReviewVisibilityRequest,
  clearReviewMessages,
} from "../../../redux/actions/reviewActions";
import ReviewDetails from "./ReviewDetails";
import UpdateReview from "./UpdateReview";


const STATUS_OPTIONS = [
  { value: "ALL", label: "All" },
  { value: "VISIBLE", label: "Visible" },
  { value: "HIDDEN", label: "Hidden" },
];


const ReviewManagement = () => {
  const dispatch = useDispatch();
  const {
    adminReviews,
    adminPagination,
    adminLoading,
    adminError,
    updateVisibilityLoading,
    updateVisibilitySuccess,
  } = useSelector((state) => state.review || {});


  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [status, setStatus] = useState("ALL");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [productId, setProductId] = useState("");
  const [userId, setUserId] = useState("");
  const [search, setSearch] = useState("");
  const [rating, setRating] = useState("ALL");


  const [showDetail, setShowDetail] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);


  const queryParams = useMemo(
    () => ({
      page,
      limit,
      status: status !== "ALL" ? status : undefined,
      sortBy,
      sortOrder,
      productId: productId || undefined,
      userId: userId || undefined,
      search: search || undefined,
      rating: rating !== "ALL" ? rating : undefined,
    }),
    [page, limit, status, sortBy, sortOrder, productId, userId, search, rating]
  );


  useEffect(() => {
    dispatch(getAdminReviewsRequest(queryParams));
  }, [dispatch, queryParams]);


  useEffect(() => {
    if (updateVisibilitySuccess) {
      dispatch(getAdminReviewsRequest(queryParams));
      dispatch(clearReviewMessages());
      setShowUpdate(false);
      setSelectedReview(null);
    }
  }, [updateVisibilitySuccess, dispatch, queryParams]);


  const totalPages = adminPagination?.totalPages || 1;


  const handleViewDetail = (review) => {
    setSelectedReview(review);
    setShowDetail(true);
  };


  const handleOpenUpdate = (review) => {
    setSelectedReview(review);
    setShowUpdate(true);
  };


  const handleUpdateStatus = (id, nextStatus) => {
    dispatch(updateReviewVisibilityRequest(id, nextStatus));
  };


  const formatDate = (value) =>
    value ? new Date(value).toLocaleString("en-US") : "N/A";


  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-gray-100 p-5">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
          <Star size={24} />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900">Review Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage customer product reviews</p>
        </div>
      </div>


      <div className="border-b border-gray-100 bg-gray-50/50 p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative min-w-0">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={productId}
              onChange={(e) => {
                setProductId(e.target.value.trim());
                setPage(1);
              }}
              placeholder="Product ID"
              className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
            />
          </div>
          <div className="relative min-w-0">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={userId}
              onChange={(e) => {
                setUserId(e.target.value.trim());
                setPage(1);
              }}
              placeholder="User ID"
              className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
            />
          </div>
          <div className="relative min-w-0">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by content"
              className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
            />
          </div>
          <div className="flex gap-2 min-w-0">
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>


        <div className="flex flex-col md:flex-row gap-3 md:items-center">
          <select
            value={rating}
            onChange={(e) => {
              setRating(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="ALL">All ratings</option>
            {[5, 4, 3, 2, 1].map((value) => (
              <option key={value} value={value}>
                {value} stars
              </option>
            ))}
          </select>
          <select
            value={`${sortBy}:${sortOrder}`}
            onChange={(e) => {
              const [nextSortBy, nextSortOrder] = e.target.value.split(":");
              setSortBy(nextSortBy);
              setSortOrder(nextSortOrder);
              setPage(1);
            }}
            className="rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="createdAt:desc">Newest</option>
            <option value="createdAt:asc">Oldest</option>
            <option value="rating:desc">Rating high</option>
            <option value="rating:asc">Rating low</option>
          </select>
        </div>
      </div>


      <div className="p-6">
        {adminLoading ? (
          <div className="py-10 text-center text-gray-600">Loading reviews...</div>
        ) : adminError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            {adminError}
          </div>
        ) : adminReviews.length === 0 ? (
          <div className="py-12 text-center text-gray-600">No reviews yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                  <tr>
                  <th className="px-4 py-3 text-left">Product</th>
                  <th className="px-4 py-3 text-left">Customer</th>
                  <th className="px-4 py-3 text-left">Rating</th>
                  <th className="px-4 py-3 text-left">Content</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Edited</th>
                  <th className="px-4 py-3 text-left">Created</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {adminReviews.map((review) => (
                  <tr key={review._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{review.product_id?.name || "N/A"}</td>
                    <td className="px-4 py-3">
                      {review.user_id?.user_name || "N/A"}
                      {review.user_id?.email && (
                        <div className="text-xs text-gray-500">{review.user_id.email}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">{review.rating}</td>
                    <td className="px-4 py-3 max-w-xs truncate">{review.comment || "-"}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          review.status === "VISIBLE"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {review.status === "VISIBLE" ? "Visible" : review.status === "HIDDEN" ? "Hidden" : review.status || "N/A"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {(review.editedCount != null && review.editedCount > 0)
                        ? `${review.editedCount} time(s)`
                        : "-"}
                    </td>
                    <td className="px-4 py-3">{formatDate(review.createdAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-1">
                        <button
                          onClick={() => handleViewDetail(review)}
                          className="rounded-xl p-2 text-blue-600 transition hover:bg-blue-50 hover:text-blue-700"
                          title="View details"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleOpenUpdate(review)}
                          className="rounded-xl p-2 text-emerald-600 transition hover:bg-emerald-50 hover:text-emerald-700"
                          title="Update"
                        >
                          <Edit size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>


      {adminPagination && totalPages > 1 && (
        <div className="px-6 pb-6 flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={page === 1}
            className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition disabled:opacity-50 hover:bg-gray-50"
          >
            Prev
          </button>
          <span className="text-sm text-gray-600">
            Page {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={page === totalPages}
            className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition disabled:opacity-50 hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}


      <ReviewDetails
        isOpen={showDetail}
        onClose={() => setShowDetail(false)}
        review={selectedReview}
      />
      <UpdateReview
        isOpen={showUpdate}
        onClose={() => setShowUpdate(false)}
        review={selectedReview}
        loading={updateVisibilityLoading}
        onSubmit={handleUpdateStatus}
      />
    </div>
  );
};


export default ReviewManagement;




