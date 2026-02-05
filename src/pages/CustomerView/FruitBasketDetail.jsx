import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import { ShoppingBasket, ArrowLeft } from "lucide-react";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import Loading from "../../components/Loading/Loading";
import { getPublicFruitBasketByIdRequest } from "../../redux/actions/publicFruitBasketActions";

const FruitBasketDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const {
    publicFruitBasketDetail,
    publicFruitBasketDetailLoading,
    publicFruitBasketDetailError,
  } = useSelector((state) => state.publicFruitBasket);

  useEffect(() => {
    if (id) {
      dispatch(getPublicFruitBasketByIdRequest(id));
    }
  }, [dispatch, id]);

  const formatCurrency = (value) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value || 0);

  const basket = publicFruitBasketDetail;
  const images =
    Array.isArray(basket?.images) && basket.images.length > 0
      ? basket.images
      : basket?.featuredImage
      ? [basket.featuredImage]
      : ["https://via.placeholder.com/600x400?text=Fruit+Basket"];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <section className="pt-28 pb-10 bg-gradient-to-br from-orange-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/fruit-baskets"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft size={16} className="mr-2" />
            Quay lại danh sách
          </Link>
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full">
              <ShoppingBasket className="text-orange-600" size={22} />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 font-sans">
                {basket?.name || "Fruit Basket"}
              </h1>
              {basket?.short_desc && (
                <p className="text-gray-600 mt-1">{basket.short_desc}</p>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {publicFruitBasketDetailLoading ? (
            <div className="flex justify-center py-16">
              <Loading message="Loading fruit basket..." />
            </div>
          ) : publicFruitBasketDetailError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
              {publicFruitBasketDetailError}
            </div>
          ) : !basket ? (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-gray-700">
              Fruit basket not found.
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div>
                <div className="aspect-[4/3] overflow-hidden rounded-3xl border border-gray-200 bg-white">
                  <img
                    src={images[0]}
                    alt={basket.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                {images.length > 1 && (
                  <div className="mt-4 grid grid-cols-4 gap-3">
                    {images.slice(0, 4).map((img, idx) => (
                      <div
                        key={`${img}-${idx}`}
                        className="aspect-square overflow-hidden rounded-xl border border-gray-200"
                      >
                        <img src={img} alt={`${basket.name}-${idx}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-2xl font-bold text-orange-600">
                    {formatCurrency(basket.totalPrice)}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      basket.stockStatus === "IN_STOCK"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {basket.stockStatus === "IN_STOCK" ? "In stock" : "Out of stock"}
                  </span>
                </div>

                {basket.description && (
                  <div className="text-gray-700 whitespace-pre-line">{basket.description}</div>
                )}

                <div className="rounded-2xl border border-gray-200 p-5">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Sản phẩm trong giỏ</h2>
                  <div className="space-y-3">
                    {(basket.items || []).map((item) => {
                      const productImages = Array.isArray(item.product?.images)
                        ? item.product.images
                        : [];
                      const productImage =
                        productImages[0] ||
                        "https://via.placeholder.com/80x80?text=No+Image";
                      return (
                      <div
                        key={item._id || `${item.product?._id}-${item.quantity}`}
                        className="flex items-center justify-between gap-3 border-b border-gray-100 pb-3 last:border-b-0 last:pb-0"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 overflow-hidden rounded-lg border border-gray-200">
                            <img
                              src={productImage}
                              alt={item.product?.name || "product"}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div>
                          <div className="text-sm font-semibold text-gray-900">
                            {item.product?.name || "Sản phẩm không tồn tại"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {item.quantity || 0} x {formatCurrency(item.product?.price || 0)}
                          </div>
                        </div>
                        </div>
                        <div className="text-sm font-semibold text-gray-800">
                          {formatCurrency(item.lineTotal)}
                        </div>
                      </div>
                    );
                    })}
                  </div>
                  <div className="flex items-center justify-between pt-4 mt-4 border-t">
                    <span className="text-sm text-gray-600">Tổng cộng</span>
                    <span className="text-lg font-semibold text-gray-900">
                      {formatCurrency(basket.totalPrice)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default FruitBasketDetail;
