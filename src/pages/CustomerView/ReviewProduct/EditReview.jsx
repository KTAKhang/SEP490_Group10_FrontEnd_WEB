import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams, useLocation, Link } from "react-router-dom";
import { Star, ArrowLeft, AlertCircle } from "lucide-react";
import Header from "../../../components/Header/Header";
import Footer from "../../../components/Footer/Footer";
import { updateReviewRequest, clearReviewMessages } from "../../../redux/actions/reviewActions";


const EditReview = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { reviewId } = useParams();
  const location = useLocation();
 
  // ✅ Lấy review data từ location state (nếu có) hoặc từ order detail
  const reviewFromState = location.state?.review;
 
  const { updateReviewLoading, updateReviewError, updateReviewSuccess } = useSelector(
    (state) => state.review || {}
  );


  const [rating, setRating] = useState(reviewFromState?.rating || 5);
  const [comment, setComment] = useState(reviewFromState?.comment || "");
  const [existingImages, setExistingImages] = useState(reviewFromState?.images || []);
  const [existingImagePublicIds, setExistingImagePublicIds] = useState(reviewFromState?.imagePublicIds || []);
  const [newImageFiles, setNewImageFiles] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);
  const [canEdit, setCanEdit] = useState(true);
  const [editMessage, setEditMessage] = useState("");


  // ✅ Validate: Kiểm tra editedCount và 3-day window
  useEffect(() => {
    if (reviewFromState) {
      const editedCount = reviewFromState.editedCount || 0;
      const createdAt = reviewFromState.createdAt ? new Date(reviewFromState.createdAt) : null;
     
      // Kiểm tra editedCount
      if (editedCount >= 1) {
        setCanEdit(false);
        setEditMessage("Review can only be edited once. You have already edited this review.");
        return;
      }


      // Kiểm tra 3-day window
      if (createdAt) {
        const now = new Date();
        const diffDays = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));
        if (diffDays > 3) {
          setCanEdit(false);
          setEditMessage("Reviews can only be edited within the first 3 days. Edit period has expired.");
          return;
        }
      }


      // Load existing data
      setRating(reviewFromState.rating || 5);
      setComment(reviewFromState.comment || "");
      setExistingImages(reviewFromState.images || []);
      setExistingImagePublicIds(reviewFromState.imagePublicIds || []);
    } else if (reviewId) {
      // Nếu không có review data từ state, có thể cần fetch từ API
      // Tạm thời hiển thị thông báo
      setCanEdit(false);
      setEditMessage("Review information not found. Please go back to the order page.");
    }
  }, [reviewFromState, reviewId]);


  useEffect(() => {
    if (updateReviewSuccess) {
      dispatch(clearReviewMessages());
      navigate("/customer/orders");
    }
  }, [updateReviewSuccess, dispatch, navigate]);


  useEffect(() => {
    return () => {
      dispatch(clearReviewMessages());
    };
  }, [dispatch]);


  const canSubmit = useMemo(() => {
    return canEdit && !!reviewId && rating >= 1 && rating <= 5;
  }, [canEdit, reviewId, rating]);


  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;


    const formData = new FormData();
    formData.append("rating", rating);
    formData.append("comment", comment.trim());
   
    // ✅ Gửi existing images và imagePublicIds (để backend biết giữ lại ảnh nào)
    if (existingImages.length > 0) {
      formData.append("existingImages", JSON.stringify(existingImages));
    }
    if (existingImagePublicIds.length > 0) {
      formData.append("existingImagePublicIds", JSON.stringify(existingImagePublicIds));
    }
   
    // ✅ Gửi ảnh mới (nếu có)
    newImageFiles.forEach((file) => {
      formData.append("images", file);
    });


    dispatch(updateReviewRequest(reviewId, formData));
  };


  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;


    // ✅ Tổng số ảnh (existing + new) không được vượt quá 3
    const totalImages = existingImages.length + newImageFiles.length;
    const allowed = files.slice(0, Math.max(0, 3 - totalImages));
    setNewImageFiles((prev) => [...prev, ...allowed]);


    allowed.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setNewImagePreviews((prev) => [...prev, reader.result]);
        }
      };
      reader.readAsDataURL(file);
    });
  };


  const handleRemoveNewImage = (index) => {
    setNewImageFiles((prev) => prev.filter((_, i) => i !== index));
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };


  const handleRemoveExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
    setExistingImagePublicIds((prev) => prev.filter((_, i) => i !== index));
  };


  const totalImages = existingImages.length + newImageFiles.length;


  return (
    <div className="min-h-screen bg-white">
      <Header />


      <section className="pt-28 pb-10 bg-gradient-to-br from-green-50 to-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/customer/orders"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft size={16} className="mr-2" />
            Quay lại đơn hàng
          </Link>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">
            Edit review
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            You can only edit your review once within the first 3 days after posting.
          </p>
        </div>
      </section>


      {/* ✅ Thông báo quy định */}
      <section className="py-4">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <AlertCircle size={16} />
              Quy định chỉnh sửa đánh giá
            </h3>
            <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
              <li>You can edit your review <strong>only once</strong></li>
              <li>Edit window: <strong>within 3 days</strong> from the review creation date</li>
              <li>After 3 days or after one edit, you will no longer be able to edit this review</li>
            </ul>
          </div>
        </div>
      </section>


      <section className="py-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {!canEdit ? (
            <div className="bg-white border rounded-2xl shadow-sm p-6">
              <div className="flex items-start space-x-3">
                <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Cannot edit review
                  </h3>
                  <p className="text-gray-700">{editMessage}</p>
                  <Link
                    to="/customer/orders"
                    className="inline-block mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Quay lại đơn hàng
                  </Link>
                </div>
              </div>
            </div>
          ) : !reviewId ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
              Thiếu thông tin review để chỉnh sửa.
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="bg-white border rounded-2xl shadow-sm p-6 space-y-6"
            >
              <div>
                <div className="text-sm text-gray-600 mb-2">Star rating</div>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRating(value)}
                      className={`h-10 w-10 rounded-full border flex items-center justify-center ${
                        rating >= value
                          ? "border-yellow-400 bg-yellow-50 text-yellow-500"
                          : "border-gray-300 text-gray-400"
                      }`}
                    >
                      <Star size={18} fill={rating >= value ? "currentColor" : "none"} />
                    </button>
                  ))}
                  <span className="text-sm text-gray-600 ml-2">{rating}/5</span>
                </div>
              </div>


              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Comment (max 1000 characters)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={5}
                  maxLength={1000}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
                />
                <div className="text-xs text-gray-500 mt-1">{comment.length}/1000</div>
              </div>


              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Review images (max 3)
                </label>
               
                {/* ✅ Hiển thị ảnh hiện tại */}
                {existingImages.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-600 mb-2">Current images:</p>
                    <div className="flex flex-wrap gap-2">
                      {existingImages.map((img, index) => (
                        <div key={`existing-${index}`} className="relative">
                          <img
                            src={img}
                            alt={`Existing ${index + 1}`}
                            className="h-16 w-16 object-cover rounded border"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveExistingImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}


                {/* ✅ Input để thêm ảnh mới */}
                {totalImages < 3 && (
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                )}


                {/* ✅ Hiển thị preview ảnh mới */}
                {newImagePreviews.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-600 mb-2">New images:</p>
                    <div className="flex flex-wrap gap-2">
                      {newImagePreviews.map((preview, index) => (
                        <div key={`new-${index}`} className="relative">
                          <img
                            src={preview}
                            alt={`New ${index + 1}`}
                            className="h-16 w-16 object-cover rounded border"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveNewImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}


                <p className="text-xs text-gray-500 mt-1">
                  Đã chọn {totalImages}/3 ảnh
                  {existingImages.length > 0 && ` (${existingImages.length} ảnh hiện tại, ${newImageFiles.length} ảnh mới)`}
                </p>
              </div>


              {updateReviewError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {updateReviewError}
                </div>
              )}


              <div className="flex justify-end gap-3">
                <Link
                  to="/customer/orders"
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={!canSubmit || updateReviewLoading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updateReviewLoading ? "Đang cập nhật..." : "Cập nhật đánh giá"}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default EditReview;


