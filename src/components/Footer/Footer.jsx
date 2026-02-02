import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getShopInfoPublicRequest } from '../../redux/actions/shopActions';

const Footer = () => {
  const dispatch = useDispatch();
  const { publicShopInfo } = useSelector((state) => state.shop);

  // Log when publicShopInfo changes
  useEffect(() => {
    console.log('🔄 Footer - publicShopInfo updated:', publicShopInfo);
    console.log('📸 Footer - Logo URL:', publicShopInfo?.logo);
  }, [publicShopInfo]);

  useEffect(() => {
    // Always load/refresh shop info to ensure logo is up to date
    dispatch(getShopInfoPublicRequest());
  }, [dispatch]);

  // Use shop info or fallback to default values
  const shop = publicShopInfo || {
    shopName: "Smart fruit shop",
    logo: "https://public.readdy.ai/ai/img_res/5bde7704-1cb0-4365-9e92-f123696b11d9.png",
    address: "123 Nong Nghiep Street, District 1, Ho Chi Minh City",
    email: "info@nongsansach.vn",
    phone: "0123 456 789",
    workingHours: "Monday - Sunday\n8:00 AM - 8:00 PM",
  };

  return (
    <footer className="bg-gradient-to-br from-green-800 to-green-900 text-white">
      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

          {/* Logo & description: chỉ hiện ảnh khi có logo từ API, admin xóa logo thì không hiện ảnh nữa */}
          <div>
            {shop.logo ? (
              <img
                key={`logo-${shop.logo}`}
                src={shop.logo}
                alt={shop.shopName || "Nông Sản Sạch"}
                className="h-12 w-auto mb-4 object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            ) : null}
            <p className="text-gray-300 text-sm leading-relaxed mb-6">
              Providing clean, organic agricultural products from farm to table.
              Committed to quality and food safety.
            </p>

            <div className="flex space-x-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                aria-label="Facebook"
              >
                <i className="ri-facebook-fill text-lg" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                aria-label="Instagram"
              >
                <i className="ri-instagram-line text-lg" />
              </a>
              <a
                href="https://zalo.me"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                aria-label="Zalo"
              >
                <i className="ri-message-3-line text-lg" />
              </a>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-4">
              Subscribe to Newsletter
            </h3>
            <p className="text-gray-300 text-sm mb-4">
              Get information about new products and special offers
            </p>

            <form className="space-y-3">
              <div className="relative">
                <input
                  type="email"
                  placeholder="Email của bạn"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-white/40 transition-colors"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-white text-green-800 rounded-md hover:bg-gray-100 transition-colors"
                  aria-label="Đăng ký"
                >
                  <i className="ri-arrow-right-line" />
                </button>
              </div>
              <p className="text-xs text-gray-400">
                By subscribing, you agree to our{" "}
                <a href="#" className="text-green-300 hover:text-green-200 underline">
                  Privacy Policy
                </a>
              </p>
            </form>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-4">
              Liên kết
            </h3>
            <ul className="space-y-3">
              <li><a href="/products" className="text-gray-300 hover:text-white text-sm">Products</a></li>
              <li><a href="/categories" className="text-gray-300 hover:text-white text-sm">Categories</a></li>
              <li><a href="/about" className="text-gray-300 hover:text-white text-sm">About Us</a></li>
              <li><a href="/contact" className="text-gray-300 hover:text-white text-sm">Contact Us</a></li>
              <li><a href="/faq" className="text-gray-300 hover:text-white text-sm">FAQ</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-4">
              Contact
            </h3>
            <ul className="space-y-3 -ml-3">
              {shop.address && (
                <li className="flex items-center space-x-3">
                  <i className="ri-map-pin-line text-green-300 text-lg flex-shrink-0" />
                  <span className="text-gray-300 text-sm">
                    {shop.address}
                  </span>
                </li>
              )}

              {shop.phone && (
                <li className="flex items-center space-x-3">
                  <i className="ri-phone-line text-green-300 text-lg flex-shrink-0" />
                  <a href={`tel:${shop.phone}`} className="text-gray-300 hover:text-white text-sm">
                    {shop.phone}
                  </a>
                </li>
              )}

              {shop.email && (
                <li className="flex items-center space-x-3">
                  <i className="ri-mail-line text-green-300 text-lg flex-shrink-0" />
                  <a
                    href={`mailto:${shop.email}`}
                    className="text-gray-300 hover:text-white text-sm break-all"
                  >
                    {shop.email}
                  </a>
                </li>
              )}

              {shop.workingHours && (
                <li className="flex items-start space-x-3">
                  <i className="ri-time-line text-green-300 text-lg flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300 text-sm whitespace-pre-line">
                    {shop.workingHours}
                  </span>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Big text */}
      <div className="bg-green-900/50 py-12">
        <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black text-green-100/20 tracking-tight text-center">
            {shop.shopName || "Smart fruit shop"}
          </h2>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm text-center md:text-left">
              © {new Date().getFullYear()} {shop.shopName || "Smart fruit shop"}. All rights reserved.
            </p>

            <div className="flex flex-wrap justify-center gap-6">
              <a href="#" className="text-gray-400 hover:text-white text-sm">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-white text-sm">
                Terms of Use
              </a>
              <a
                href="https://readdy.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white text-sm"
              >
                Website Builder G10_SEP490 FPU U
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
