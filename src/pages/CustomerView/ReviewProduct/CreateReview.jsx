import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Star, ArrowLeft } from "lucide-react";
import Header from "../../../components/Header/Header";
import Footer from "../../../components/Footer/Footer";
import { createReviewRequest, clearReviewMessages } from "../../../redux/actions/reviewActions";

const CreateReview = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");
  const productId = searchParams.get("productId");

  const { createReviewLoading, createReviewError, createReviewSuccess } = useSelector(
    (state) => state.review || {}
  );

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const canSubmit = useMemo(() => {
    return !!orderId && !!productId && rating >= 1 && rating <= 5;
  }, [orderId, productId, rating]);

  useEffect(() => {
    if (createReviewSuccess) {
      dispatch(clearReviewMessages());
      navigate("/customer/orders");
    }
  }, [createReviewSuccess, dispatch, navigate]);

  useEffect(() => {
    return () => {
      dispatch(clearReviewMessages());
    };
  }, [dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    const formData = new FormData();
    formData.append("orderId", orderId);
    formData.append("productId", productId);
    formData.append("rating", rating);
    formData.append("comment", comment.trim());
    imageFiles.forEach((file) => {
      formData.append("images", file);
    });

    dispatch(createReviewRequest(formData));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const allowed = files.slice(0, Math.max(0, 3 - imageFiles.length));
    setImageFiles((prev) => [...prev, ...allowed]);

    allowed.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setImagePreviews((prev) => [...prev, reader.result]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

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
            Đánh giá sản phẩm
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Chỉ đơn hàng hoàn thành mới có thể đánh giá.
          </p>
        </div>
      </section>

      <section className="py-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {!orderId || !productId ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
              Thiếu thông tin đơn hàng hoặc sản phẩm để đánh giá.
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="bg-white border rounded-2xl shadow-sm p-6 space-y-6"
            >
              <div>
                <div className="text-sm text-gray-600 mb-2">Đánh giá sao</div>
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
                  Nhận xét (tối đa 1000 ký tự)
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
                  Ảnh đánh giá (tối đa 3 ảnh)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                {imagePreviews.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="h-16 w-16 object-cover rounded border"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Đã chọn {imageFiles.length}/3 ảnh
                </p>
              </div>

              {createReviewError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {createReviewError}
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!canSubmit || createReviewLoading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createReviewLoading ? "Đang gửi..." : "Gửi đánh giá"}
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

export default CreateReview;
