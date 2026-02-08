import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import Loading from '../../components/Loading/Loading';
import { getFeaturedProductsRequest } from '../../redux/actions/publicProductActions';
import { getHomepageAssetsPublicRequest } from '../../redux/actions/homepageAssetsActions';
import { addItemToCartRequest } from "../../redux/actions/cartActions";
const HomePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { featuredProducts, featuredProductsLoading } = useSelector((state) => state.publicProduct);
  const { publicAssets } = useSelector((state) => state.homepageAssets || {});
    // State for testimonial carousel
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);
  useEffect(() => {
    dispatch(getFeaturedProductsRequest());
    // Load homepage assets
    if (!publicAssets) {
      dispatch(getHomepageAssetsPublicRequest());
    }
  }, [dispatch, publicAssets]);


  // Helper function to get asset URL by key
  const getAssetUrl = (key, fallbackUrl) => {
    if (!publicAssets || !Array.isArray(publicAssets)) return fallbackUrl;
    const asset = publicAssets.find(a => a.key === key);
    return asset?.imageUrl || fallbackUrl;
  };


  // Helper function to get asset alt text by key
  const getAssetAlt = (key, fallbackAlt) => {
    if (!publicAssets || !Array.isArray(publicAssets)) return fallbackAlt;
    const asset = publicAssets.find(a => a.key === key);
    return asset?.altText || fallbackAlt;
  };


  // Fallback image URL (static, no API call - avoids failed requests in Network tab)
  const FALLBACK_IMAGE_URL = 'https://public.readdy.ai/ai/img_res/5bde7704-1cb0-4365-9e92-f123696b11d9.png';


  // Memoize asset URLs for performance
  const assets = useMemo(() => ({
    heroBackground: getAssetUrl('heroBackground', FALLBACK_IMAGE_URL),
    trustAvatar1: getAssetUrl('trustAvatar1', FALLBACK_IMAGE_URL),
    trustAvatar2: getAssetUrl('trustAvatar2', FALLBACK_IMAGE_URL),
    trustAvatar3: getAssetUrl('trustAvatar3', FALLBACK_IMAGE_URL),
    testimonialImage: getAssetUrl('testimonialImage', FALLBACK_IMAGE_URL),
    ctaImage: getAssetUrl('ctaImage', FALLBACK_IMAGE_URL),
  }), [publicAssets]);


  const assetAlts = useMemo(() => ({
    heroBackground: getAssetAlt('heroBackground', 'Organic farm field'),
    trustAvatar1: getAssetAlt('trustAvatar1', 'Customer'),
    trustAvatar2: getAssetAlt('trustAvatar2', 'Customer'),
    trustAvatar3: getAssetAlt('trustAvatar3', 'Customer'),
    testimonialImage: getAssetAlt('testimonialImage', 'Satisfied customer'),
    ctaImage: getAssetAlt('ctaImage', 'Order now'),
  }), [publicAssets]);


  const handleProductClick = (productId) => {
    navigate(`/products/${productId}`);
  };


  // Testimonials data with corresponding images
  const testimonials = [
    {
      text: "The vegetables are very fresh, delivered on time. My family is very satisfied with the product quality. Especially the mustard greens and cherry tomatoes, naturally sweet without needing much seasoning. Will continue to support!",
      author: "Ms. Nguyen Thi Mai, Hanoi",
      imageKey: 'testimonialImage', // Use testimonialImage for first testimonial
      fallbackImage: FALLBACK_IMAGE_URL
    },
    {
      text: "I have tried many places selling organic agricultural products, but only here are the freshest and most delicious. Reasonable prices, good customer care service. Very reliable!",
      author: "Mr. Tran Van Hung, Ho Chi Minh City",
      imageKey: 'testimonialImage2', // Use testimonialImage2 for second testimonial (or fallback to testimonialImage)
      fallbackImage: FALLBACK_IMAGE_URL
    }
  ];


  // Get testimonial image URL based on current index
  const getCurrentTestimonialImage = () => {
    const currentTestimonial = testimonials[currentTestimonialIndex];
    // Try to get image from assets using imageKey, fallback to testimonialImage if not found
    const imageUrl = getAssetUrl(currentTestimonial.imageKey, null);
    if (imageUrl && imageUrl !== currentTestimonial.fallbackImage) {
      return imageUrl;
    }
    // If imageKey doesn't exist in assets, try testimonialImage
    if (currentTestimonial.imageKey === 'testimonialImage2') {
      const testimonialImageUrl = getAssetUrl('testimonialImage', null);
      if (testimonialImageUrl && testimonialImageUrl !== testimonials[0].fallbackImage) {
        return testimonialImageUrl;
      }
    }
    // Use fallback image
    return currentTestimonial.fallbackImage;
  };


  const getCurrentTestimonialAlt = () => {
    const currentTestimonial = testimonials[currentTestimonialIndex];
    if (currentTestimonial.imageKey === 'testimonialImage2') {
      return getAssetAlt('testimonialImage2', getAssetAlt('testimonialImage', 'Satisfied customer'));
    }
    return getAssetAlt('testimonialImage', 'Satisfied customer');
  };


  // Handle testimonial navigation
  const handlePrevTestimonial = () => {
    setCurrentTestimonialIndex((prev) =>
      prev === 0 ? testimonials.length - 1 : prev - 1
    );
  };


  const handleNextTestimonial = () => {
    setCurrentTestimonialIndex((prev) =>
      prev === testimonials.length - 1 ? 0 : prev + 1
    );
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
            backgroundImage: `url(${assets.heroBackground})`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/40"></div>
        </div>


        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex flex-col items-start max-w-3xl">
            {/* Trust Badge */}
            <div className="flex items-center space-x-4 mb-8">
              <div className="flex -space-x-3">
                <img
                  src={assets.trustAvatar1}
                  alt={assetAlts.trustAvatar1}
                  className="w-16 h-16 rounded-full border-4 border-white object-cover shadow-lg hover:scale-110 transition-transform duration-300"
                  onError={(e) => {
                    e.target.src = 'https://ui-avatars.com/api/?name=Customer&background=random';
                  }}
                />
                <img
                  src={assets.trustAvatar2}
                  alt={assetAlts.trustAvatar2}
                  className="w-16 h-16 rounded-full border-4 border-white object-cover shadow-lg hover:scale-110 transition-transform duration-300"
                  onError={(e) => {
                    e.target.src = 'https://ui-avatars.com/api/?name=Customer&background=random';
                  }}
                />
                <img
                  src={assets.trustAvatar3}
                  alt={assetAlts.trustAvatar3}
                  className="w-16 h-16 rounded-full border-4 border-white object-cover shadow-lg hover:scale-110 transition-transform duration-300"
                  onError={(e) => {
                    e.target.src = 'https://ui-avatars.com/api/?name=Customer&background=random';
                  }}
                />
              </div>
              <p className="text-white text-base font-semibold drop-shadow-lg">More than 5,000+ customers trust us</p>
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


      {/* TRUST AVATARS SECTION */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-3">
              TRUSTED BY CUSTOMERS
            </p>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900">
              Our Happy Customers
            </h2>
          </div>


          {/* Trust Avatars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {/* Avatar 1 */}
            <div className="flex flex-col items-center text-center p-6 rounded-2xl hover:bg-gray-50 transition-colors">
              <div className="relative mb-4">
                <img
                  src={assets.trustAvatar1}
                  alt={assetAlts.trustAvatar1}
                  className="w-32 h-32 rounded-full border-4 border-gray-200 object-cover shadow-xl hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.target.src = 'https://ui-avatars.com/api/?name=Customer+1&background=random&size=128';
                  }}
                />
                <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2 shadow-lg">
                  <i className="ri-check-line text-white text-lg"></i>
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Satisfied Customer</h3>
              <p className="text-gray-600 text-sm">Verified Purchase</p>
            </div>


            {/* Avatar 2 */}
            <div className="flex flex-col items-center text-center p-6 rounded-2xl hover:bg-gray-50 transition-colors">
              <div className="relative mb-4">
                <img
                  src={assets.trustAvatar2}
                  alt={assetAlts.trustAvatar2}
                  className="w-32 h-32 rounded-full border-4 border-gray-200 object-cover shadow-xl hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.target.src = 'https://ui-avatars.com/api/?name=Customer+2&background=random&size=128';
                  }}
                />
                <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2 shadow-lg">
                  <i className="ri-check-line text-white text-lg"></i>
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Happy Customer</h3>
              <p className="text-gray-600 text-sm">Verified Purchase</p>
            </div>


            {/* Avatar 3 */}
            <div className="flex flex-col items-center text-center p-6 rounded-2xl hover:bg-gray-50 transition-colors">
              <div className="relative mb-4">
                <img
                  src={assets.trustAvatar3}
                  alt={assetAlts.trustAvatar3}
                  className="w-32 h-32 rounded-full border-4 border-gray-200 object-cover shadow-xl hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.target.src = 'https://ui-avatars.com/api/?name=Customer+3&background=random&size=128';
                  }}
                />
                <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2 shadow-lg">
                  <i className="ri-check-line text-white text-lg"></i>
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Loyal Customer</h3>
              <p className="text-gray-600 text-sm">Verified Purchase</p>
            </div>
          </div>


          {/* Trust Stats */}
          <div className="mt-12 text-center">
            <p className="text-gray-600 text-lg">
              Join <span className="font-bold text-gray-900">5,000+</span> satisfied customers who trust our quality products
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
                    {/* Out of Stock Badge */}
                    {product.onHandQuantity === 0 && (
                      <div className="absolute top-4 left-4">
                        <span className="inline-flex items-center px-3 py-1.5 bg-red-500 text-white rounded-full text-xs font-bold shadow-lg">
                          Out of stock
                        </span>
                      </div>
                    )}
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
                        {product.isNearExpiry && product.originalPrice != null && product.originalPrice > 0 && (
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                              Near expiry - {Math.round((1 - (product.price || 0) / product.originalPrice) * 100)}% off
                            </span>
                            <span className="text-sm text-gray-500 line-through">
                              {product.originalPrice?.toLocaleString("en-US")}
                            </span>
                          </div>
                        )}
                        <span className="text-2xl font-bold text-gray-900">
                          {product.price?.toLocaleString("en-US") || "0"}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (product.onHandQuantity === 0) return;
                          dispatch(addItemToCartRequest(product._id, 1));
                        }}
                        disabled={product.onHandQuantity === 0}
                        className={`px-6 py-3 rounded-full text-sm font-semibold transition-colors whitespace-nowrap ${
                          product.onHandQuantity === 0
                            ? "bg-gray-400 text-white cursor-not-allowed"
                            : "bg-gray-900 text-white hover:bg-gray-800 cursor-pointer"
                        }`}
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
                  key={currentTestimonialIndex} // Force re-render when index changes
                  src={getCurrentTestimonialImage()}
                  alt={getCurrentTestimonialAlt()}
                  className="w-full h-full object-cover transition-opacity duration-500"
                  onError={(e) => {
                    e.target.src = testimonials[currentTestimonialIndex].fallbackImage;
                  }}
                />
                {/* Fade transition overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
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


              <div className="mt-12">
                {/* Current Testimonial */}
                <div className="min-h-[200px] transition-all duration-300">
                  <p className="text-gray-700 text-lg leading-relaxed mb-4">


                    "{testimonials[currentTestimonialIndex].text}"
                  </p>
                  <p className="text-gray-900 font-bold">— {testimonials[currentTestimonialIndex].author}</p>


                </div>
              </div>


              {/* Navigation Buttons */}
              <div className="flex items-center space-x-4 mt-12">
                <button
                  onClick={handlePrevTestimonial}
                  className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 transition-colors cursor-pointer"
                  aria-label="Previous"
                >
                  <i className="ri-arrow-left-line text-xl"></i>
                </button>
             
                {/* Dots indicator */}
                <div className="flex items-center space-x-2">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentTestimonialIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentTestimonialIndex
                          ? 'bg-gray-900 w-8'
                          : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                      aria-label={`Go to testimonial ${index + 1}`}
                    />
                  ))}
                </div>
               
                <button
                  onClick={handleNextTestimonial}
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
              { icon: "ri-leaf-line", text: "Organic" },
              { icon: "ri-truck-line", text: "Fast Delivery" },
              { icon: "ri-shield-check-line", text: "Certified" },
              { icon: "ri-heart-line", text: "Dedicated" },
              { icon: "ri-star-line", text: "Quality" },
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
                src={assets.ctaImage}
                alt={assetAlts.ctaImage}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = FALLBACK_IMAGE_URL;
                }}
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




