import { X, Star } from "lucide-react";


const ReviewDetails = ({ isOpen, onClose, review }) => {
  if (!isOpen || !review) return null;


  const rating = Number(review.rating || 0);


  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            Review details
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div className="text-sm text-gray-700">
            <div className="font-medium text-gray-900">Product</div>
            <div>{review.product_id?.name || "N/A"}</div>
          </div>
          <div className="text-sm text-gray-700">
            <div className="font-medium text-gray-900">Reviewer</div>
            <div>{review.user_id?.user_name || "N/A"}</div>
            {review.user_id?.email && (
              <div className="text-xs text-gray-500">{review.user_id.email}</div>
            )}
          </div>
          <div className="text-sm text-gray-700">
            <div className="font-medium text-gray-900">Rating</div>
            <div className="flex items-center gap-2 mt-1">
              {[1, 2, 3, 4, 5].map((value) => (
                <Star
                  key={value}
                  size={16}
                  className={rating >= value ? "text-yellow-500" : "text-gray-300"}
                  fill={rating >= value ? "currentColor" : "none"}
                />
              ))}
              <span className="text-xs text-gray-500">{rating}/5</span>
            </div>
          </div>
          <div className="text-sm text-gray-700">
            <div className="font-medium text-gray-900">Content</div>
            <div className="whitespace-pre-line">{review.comment || "No comment"}</div>
          </div>
          {Array.isArray(review.images) && review.images.length > 0 && (
            <div className="text-sm text-gray-700">
              <div className="font-medium text-gray-900">Review images</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {review.images.map((img, index) => (
                  <div key={`${img}-${index}`} className="h-16 w-16 overflow-hidden rounded border">
                    <img src={img} alt={`review-${index}`} className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="text-sm text-gray-700">
            <div className="font-medium text-gray-900">Status</div>
            <span
              className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                review.status === "VISIBLE"
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {review.status === "VISIBLE" ? "Visible" : review.status === "HIDDEN" ? "Hidden" : review.status || "N/A"}
            </span>
          </div>
          {(review.editedCount != null && review.editedCount > 0) && (
            <div className="text-sm text-gray-700">
              <div className="font-medium text-gray-900">Edited</div>
              <div className="text-gray-600">{review.editedCount} time(s)</div>
            </div>
          )}
          <div className="text-xs text-gray-500">
            Created at: {review.createdAt ? new Date(review.createdAt).toLocaleString("en-US") : "N/A"}
          </div>
        </div>
        <div className="flex justify-end p-5 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};


export default ReviewDetails;
