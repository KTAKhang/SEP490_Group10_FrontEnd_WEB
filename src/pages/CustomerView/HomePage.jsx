import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import Loading from "../../components/Loading/Loading";
import { getFeaturedProductsRequest } from "../../redux/actions/publicProductActions";
import { addItemToCartRequest } from "../../redux/actions/cartActions";
const HomePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { featuredProducts, featuredProductsLoading } = useSelector(
    (state) => state.publicProduct,
  );

  useEffect(() => {
    dispatch(getFeaturedProductsRequest());
  }, [dispatch]);

  const handleProductClick = (productId) => {
    navigate(`/products/${productId}`);
  };
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* HERO SECTION */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url(https://readdy.ai/api/search-image?query=Beautiful%20lush%20green%20organic%20farm%20field%20with%20fresh%20vegetables%20growing%20under%20bright%20natural%20sunlight%20wide%20landscape%20view%20peaceful%20countryside%20agricultural%20scene%20with%20vibrant%20green%20colors%20and%20natural%20lighting&width=1920&height=1080&seq=hero1&orientation=landscape)",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/40"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex flex-col items-start max-w-3xl">
            {/* Trust Badge */}
            <div className="flex items-center space-x-3 mb-8">
              <div className="flex -space-x-2">
                <img
                  src="https://readdy.ai/api/search-image?query=Happy%20smiling%20asian%20woman%20customer%20portrait%20on%20clean%20white%20background%20professional%20photography&width=100&height=100&seq=avatar1&orientation=squarish"
                  alt="Customer"
                  className="w-10 h-10 rounded-full border-2 border-white object-cover"
                />
                <img
                  src="https://readdy.ai/api/search-image?query=Happy%20smiling%20asian%20man%20customer%20portrait%20on%20clean%20white%20background%20professional%20photography&width=100&height=100&seq=avatar2&orientation=squarish"
                  alt="Customer"
                  className="w-10 h-10 rounded-full border-2 border-white object-cover"
                />
                <img
                  src="https://readdy.ai/api/search-image?query=Happy%20smiling%20asian%20woman%20customer%20portrait%20on%20clean%20white%20background%20professional%20photography&width=100&height=100&seq=avatar3&orientation=squarish"
                  alt="Customer"
                  className="w-10 h-10 rounded-full border-2 border-white object-cover"
                />
              </div>
              <p className="text-white text-sm font-medium">
                More than 5,000+ customers trust us
              </p>
            </div>

            {/* Main Heading */}
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-black text-white mb-6 leading-tight">
              Clean Agricultural Products
            </h1>
            <p className="text-4xl md:text-5xl lg:text-6xl font-light text-white/90 mb-12">
              From Farm To Table
            </p>

            {/* CTA Button */}
            <button
              onClick={() => navigate("/products")}
              className="inline-flex items-center space-x-3 bg-white text-gray-900 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-xl whitespace-nowrap cursor-pointer"
            >
              <span>Explore Now</span>
              <i className="ri-arrow-right-line text-xl"></i>
            </button>
          </div>

          {/* Description - Bottom Right */}
          <div className="absolute bottom-20 right-8 max-w-md hidden lg:block">
            <p className="text-white/90 text-lg leading-relaxed">
              Committed to delivering the freshest, safest organic agricultural
              products. Directly from the farm to your hands.
            </p>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="mb-16">
            <p className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-3">
              WHY CHOOSE US
            </p>
            <h2 className="text-5xl md:text-6xl font-black text-gray-900 leading-tight">
              Quality Commitment
              <br />
              From the Source
            </h2>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-gray-50 rounded-3xl p-8 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 flex items-center justify-center mb-6">
                <i className="ri-leaf-line text-4xl text-gray-900"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                100% Organic
              </h3>
              <p className="text-gray-600 leading-relaxed">
                No chemicals or pesticides used. Certified by international
                organic farming organizations.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-gray-50 rounded-3xl p-8 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 flex items-center justify-center mb-6">
                <i className="ri-truck-line text-4xl text-gray-900"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Fast Delivery
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Delivery within 24 hours in the inner city. Ensuring freshness
                and quality of products when they reach you.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-gray-50 rounded-3xl p-8 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 flex items-center justify-center mb-6">
                <i className="ri-shield-check-line text-4xl text-gray-900"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Clear Origin
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Traceability of each product. Transparency from the farm,
                ensuring absolute food safety.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS SECTION */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16">
            <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-4 md:mb-0">
              Featured Products
            </h2>
            <p className="text-gray-600 max-w-md">
              The most popular products, fresh and guaranteed to have the
              highest organic quality.
            </p>
          </div>

          {/* Products Grid */}
          {featuredProductsLoading ? (
            <div className="flex justify-center py-12">
              <Loading message="Loading featured products..." />
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No featured products available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProducts.map((product) => (
                <div
                  key={product._id}
                  onClick={() => handleProductClick(product._id)}
                  className="group bg-white rounded-2xl overflow-hidden border border-gray-200 hover:shadow-2xl transition-all duration-300 cursor-pointer"
                >
                  {/* Product Image */}
                  <div className="relative h-72 bg-gray-100 overflow-hidden">
                    <img
                      src={
                        product.featuredImage ||
                        "https://via.placeholder.com/400x400?text=No+Image"
                      }
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="p-6">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                      {product.category?.name || "N/A"}
                    </p>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {product.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {product.description || ""}
                    </p>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-bold text-gray-900">
                          {product.price?.toLocaleString("vi-VN") || "0"}đ
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          dispatch(addItemToCartRequest(product._id, 1));
                        }}
                        className="bg-gray-900 text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-gray-800 transition-colors whitespace-nowrap cursor-pointer"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* View All Button */}
          <div className="text-center mt-12">
            <button
              onClick={() => navigate("/products")}
              className="inline-flex items-center space-x-2 text-gray-900 font-semibold hover:text-green-600 transition-colors cursor-pointer"
            >
              <span>View All Products</span>
              <i className="ri-arrow-right-line"></i>
            </button>
          </div>
        </div>
      </section>

      {/* TESTIMONIAL SECTION */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
            {/* Left - Image */}
            <div className="lg:col-span-2">
              <div className="relative h-96 lg:h-[500px] rounded-3xl overflow-hidden">
                <img
                  src="https://readdy.ai/api/search-image?query=Happy%20smiling%20asian%20woman%20holding%20fresh%20organic%20vegetables%20in%20modern%20kitchen%20natural%20lighting%20lifestyle%20photography%20professional%20high%20quality&width=600&height=800&seq=testimonial1&orientation=portrait"
                  alt="Khách hàng hài lòng"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Right - Content */}
            <div className="lg:col-span-3">
              <p className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-4">
                WHAT CUSTOMERS SAY
              </p>

              <h2 className="text-5xl md:text-6xl font-black mb-4">
                <span className="text-gray-900">Amazing Experience</span>
                <br />
                <span className="text-gray-400">From Customers</span>
              </h2>

              <div className="mt-12 space-y-8">
                {/* Testimonial 1 */}
                <div>
                  <p className="text-gray-700 text-lg leading-relaxed mb-4">
                    "The vegetables are very fresh, delivered on time. My family
                    is very satisfied with the product quality. Especially the
                    mustard greens and cherry tomatoes, naturally sweet without
                    needing much seasoning. Will continue to support!"
                  </p>
                  <p className="text-gray-900 font-bold">
                    — Ms. Nguyen Thi Mai, Hanoi
                  </p>
                </div>

                {/* Testimonial 2 */}
                <div>
                  <p className="text-gray-700 text-lg leading-relaxed mb-4">
                    "I have tried many places selling organic agricultural
                    products, but only here are the freshest and most delicious.
                    Reasonable prices, good customer care service. Very
                    reliable!"
                  </p>
                  <p className="text-gray-900 font-bold">
                    — Mr. Tran Van Hung, Ho Chi Minh City
                  </p>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center space-x-4 mt-12">
                <button
                  className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 transition-colors cursor-pointer"
                  aria-label="Previous"
                >
                  <i className="ri-arrow-left-line text-xl"></i>
                </button>
                <button
                  className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-900 text-white hover:bg-gray-800 transition-colors cursor-pointer"
                  aria-label="Next"
                >
                  <i className="ri-arrow-right-line text-xl"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section className="py-32 bg-gradient-to-br from-gray-900 via-green-900 to-gray-900 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-6">
            ABOUT US
          </p>

          <h2 className="text-5xl md:text-6xl lg:text-7xl font-black leading-tight mb-8">
            Green Farm
            <br />
            Over 10 Years of Experience
            <br />
            Bringing Health to Every Home
          </h2>

          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mt-12">
            <a
              href="/about"
              className="bg-white text-gray-900 px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition-colors whitespace-nowrap cursor-pointer"
            >
              Learn More
            </a>
            <a
              href="/contact"
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white/10 transition-colors whitespace-nowrap cursor-pointer"
            >
              Contact Us
            </a>
          </div>

          {/* Feature Tags */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-20">
            {[
              { icon: "ri-leaf-line", text: "Hữu Cơ" },
              { icon: "ri-truck-line", text: "Giao Nhanh" },
              { icon: "ri-shield-check-line", text: "Chứng Nhận" },
              { icon: "ri-heart-line", text: "Tận Tâm" },
              { icon: "ri-star-line", text: "Chất Lượng" },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 flex flex-col items-center space-y-3 hover:bg-white/20 transition-colors"
              >
                <i className={`${item.icon} text-3xl text-white`}></i>
                <span className="text-white font-medium">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Image */}
          <div className="mb-12">
            <div className="relative h-80 rounded-3xl overflow-hidden">
              <img
                src="https://readdy.ai/api/search-image?query=Beautiful%20organic%20farm%20with%20fresh%20vegetables%20and%20fruits%20harvest%20scene%20natural%20lighting%20peaceful%20countryside%20agricultural%20landscape%20with%20vibrant%20colors%20and%20natural%20textures&width=1200&height=600&seq=cta1&orientation=landscape"
                alt="Đặt hàng ngay"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Text */}
          <div className="space-y-2 mb-12">
            <p className="text-4xl md:text-5xl font-normal text-gray-900">
              Order Now
            </p>
            <p className="text-4xl md:text-5xl font-light italic text-gray-500">
              Get Discounts
            </p>
            <p className="text-4xl md:text-5xl font-black text-gray-900">
              Up To 20%
            </p>
          </div>

          {/* Button */}
          <button
            onClick={() => navigate("/products")}
            className="inline-block bg-gray-900 text-white px-12 py-4 rounded-full text-lg font-semibold hover:bg-gray-800 transition-all transform hover:scale-105 shadow-xl whitespace-nowrap cursor-pointer"
          >
            Shop Now
          </button>
        </div>
      </section>
      <Footer />
    </div>
  );
};
export default HomePage;
