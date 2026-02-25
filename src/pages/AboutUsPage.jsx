import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getShopInfoPublicRequest } from "../redux/actions/shopActions";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import {
  Store,
  MapPin,
  Mail,
  Phone,
  Clock,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";

const AboutUsPage = () => {
  const dispatch = useDispatch();
  const { publicShopInfo, getShopInfoPublicLoading } = useSelector(
    (state) => state.shop
  );

  useEffect(() => {
    dispatch(getShopInfoPublicRequest());
  }, [dispatch]);

  if (getShopInfoPublicLoading && !publicShopInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-green-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Đang tải thông tin shop...</p>
        </div>
      </div>
    );
  }

  const shop = publicShopInfo || {
    shopName: "Smart Fruit Shop",
    address: "",
    email: "",
    phone: "",
    description: "",
    workingHours: "",
    images: [],
    mapEmbedUrl: "",
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <div className="flex-1">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-600 to-green-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6">
              <Store className="w-10 h-10" />
            </div>
            <h1 className="text-5xl md:text-6xl font-black mb-4">
              {shop.shopName || "Về Chúng Tôi"}
            </h1>
            <p className="text-xl text-green-100 max-w-2xl mx-auto">
            We are committed to providing the cleanest and highest quality agricultural products.
            </p>
          </div>
        </div>
      </section>

      {/* Shop Images Gallery */}
      {shop.images && shop.images.length > 0 && (
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Shop Images
            </h2>
            <div className="flex flex-wrap justify-center gap-6">
              {shop.images.map((imageUrl, index) => (
                <div
                  key={index}
                  className="relative overflow-hidden rounded-lg shadow-lg group max-w-md"
                >
                  <img
                    src={imageUrl}
                    alt={`Shop image ${index + 1}`}
                    className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Description Section */}
      {shop.description && (
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Introduction
            </h2>
            <div
              className="prose prose-lg max-w-none text-gray-700"
              dangerouslySetInnerHTML={{ __html: shop.description }}
            />
          </div>
        </section>
      )}

      {/* Contact Information Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Contact Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Address */}
            {shop.address && (
              <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <MapPin className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Address
                </h3>
                <p className="text-gray-600">{shop.address}</p>
              </div>
            )}

            {/* Email */}
            {shop.email && (
              <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <Mail className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Email Address
                </h3>
                <a
                  href={`mailto:${shop.email}`}
                  className="text-green-600 hover:text-green-700 hover:underline"
                >
                  {shop.email}
                </a>
              </div>
            )}

            {/* Phone */}
            {shop.phone && (
              <div className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <Phone className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Phone Number
                </h3>
                <a
                  href={`tel:${shop.phone}`}
                  className="text-green-600 hover:text-green-700 hover:underline"
                >
                  {shop.phone}
                </a>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Google Maps Section */}
      {shop.mapEmbedUrl && shop.mapEmbedUrl.trim() !== "" && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Our Location
            </h2>
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="w-full" style={{ height: '450px' }}>
                <iframe
                  src={shop.mapEmbedUrl}
                  width="100%"
                  height="100%"
                  style={{
                    border: 0,
                    display: 'block',
                  }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Shop Location Map"
                />
              </div>
              {shop.address && (
                <div className="p-6 bg-gray-50 border-t border-gray-200">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <p className="text-gray-700 font-medium">{shop.address}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Working Hours Section */}
      {shop.workingHours && (
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mb-6">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Working Hours
              </h2>
              <div className="bg-white rounded-lg p-6 shadow-md">
                <p className="text-lg text-gray-700 whitespace-pre-line">
                  {shop.workingHours}
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-br from-green-600 to-green-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Ready to shop?
          </h2>
          <p className="text-xl text-green-100 mb-8">
            Discover our clean and high-quality agricultural products
          </p>
          <a
            href="/products"
            className="inline-block bg-white text-green-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-xl"
          >
            View Products
          </a>
        </div>
      </section>
      </div>
      <Footer />
    </div>
  );
};

export default AboutUsPage;
