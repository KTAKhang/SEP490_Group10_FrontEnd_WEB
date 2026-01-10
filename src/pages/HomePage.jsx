const features = [
  {
    icon: "ri-leaf-line",
    title: "100% Hữu Cơ",
    desc: "Không sử dụng hóa chất, thuốc trừ sâu. Được chứng nhận bởi tổ chức quốc tế về nông nghiệp hữu cơ.",
  },
  {
    icon: "ri-truck-line",
    title: "Giao Hàng Nhanh",
    desc: "Giao trong vòng 24h tại nội thành. Đảm bảo độ tươi ngon khi đến tay bạn.",
  },
  {
    icon: "ri-shield-check-line",
    title: "Nguồn Gốc Rõ Ràng",
    desc: "Truy xuất nguồn gốc từng sản phẩm, minh bạch từ trang trại.",
  },
];
const testimonials = [
  {
    content:
      "Rau củ rất tươi, giao hàng đúng hẹn. Gia đình tôi rất hài lòng với chất lượng sản phẩm. Đặc biệt là rau cải và cà chua bi, ngọt tự nhiên không cần nêm nhiều gia vị. Sẽ tiếp tục ủng hộ!",
    author: "Chị Nguyễn Thị Mai, Hà Nội",
  },
  {
    content:
      "Mình đã thử nhiều nơi bán nông sản hữu cơ nhưng chỉ có ở đây là tươi và ngon nhất. Giá cả hợp lý, dịch vụ chăm sóc khách hàng tốt. Rất đáng tin cậy!",
    author: "Anh Trần Văn Hùng, TP.HCM",
  },
];

const aboutFeatures = [
  { icon: "ri-leaf-line", label: "Hữu Cơ" },
  { icon: "ri-truck-line", label: "Giao Nhanh" },
  { icon: "ri-shield-check-line", label: "Chứng Nhận" },
  { icon: "ri-heart-line", label: "Tận Tâm" },
  { icon: "ri-star-line", label: "Chất Lượng" },
];

const products = [
  {
    name: "Rau Cải Xanh Hữu Cơ",
    price: "25.000đ",
    desc: "Rau cải xanh tươi ngon, không hóa chất",
    img: "product1",
  },
  {
    name: "Cà Chua Bi Đà Lạt",
    price: "45.000đ",
    desc: "Cà chua bi ngọt tự nhiên từ Đà Lạt",
    img: "product2",
  },
  {
    name: "Cà Rót Tím Organic",
    price: "35.000đ",
    desc: "Cà rót tím tươi, giàu dinh dưỡng",
    img: "product3",
  },
  {
    name: "Dưa Leo Xanh",
    price: "20.000đ",
    desc: "Dưa leo giòn ngọt, tươi mát",
    img: "product4",
  },
  {
    name: "Ớt Chuông Đỏ",
    price: "55.000đ",
    desc: "Ớt chuông đỏ ngọt, giàu vitamin C",
    img: "product5",
  },
  {
    name: "Bí Đỏ Hữu Cơ",
    price: "30.000đ",
    desc: "Bí đỏ ngọt bùi, giàu chất xơ",
    img: "product6",
  },
];

const HomePage = () => {
  return (
    <>
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <a
              href="/preview/c1fbeee4-6d00-4542-8403-c2c8a5b3bb84/5328061"
              className="flex items-center space-x-3"
            >
              <img
                src="https://public.readdy.ai/ai/img_res/5bde7704-1cb0-4365-9e92-f123696b11d9.png"
                alt="Nông Sản Sạch"
                className="h-10 md:h-12"
              />
              <span className="text-xl font-bold text-gray-900">
                Nông Sản Sạch
              </span>
            </a>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <a className="text-sm font-medium text-green-600 whitespace-nowrap" href="/">
                Trang Chủ
              </a>
              <a className="text-sm font-medium text-gray-700 hover:text-green-600 whitespace-nowrap" href="/products">
                Sản Phẩm
              </a>
              <a className="text-sm font-medium text-gray-700 hover:text-green-600 whitespace-nowrap" href="/categories">
                Danh Mục
              </a>
              <a className="text-sm font-medium text-gray-700 hover:text-green-600 whitespace-nowrap" href="/about">
                Về Chúng Tôi
              </a>
              <a className="text-sm font-medium text-gray-700 hover:text-green-600 whitespace-nowrap" href="/contact">
                Liên Hệ
              </a>
              <a className="text-sm font-medium text-gray-700 hover:text-green-600 whitespace-nowrap" href="/faq">
                FAQ
              </a>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-4">
              <button
                className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Giỏ hàng"
              >
                <i className="ri-shopping-cart-line text-xl text-gray-900"></i>
                <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  0
                </span>
              </button>

              {/* Mobile Menu Button */}
              <button
                className="md:hidden p-2 rounded-lg text-gray-900"
                aria-label="Menu"
              >
                <i className="ri-menu-line text-2xl"></i>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              'url("https://readdy.ai/api/search-image?query=Beautiful%20lush%20green%20organic%20farm%20field%20with%20fresh%20vegetables%20growing%20under%20bright%20natural%20sunlight&width=1920&height=1080&seq=hero1&orientation=landscape")',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/40"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex flex-col items-start max-w-3xl">
            {/* Customers */}
            <div className="flex items-center space-x-3 mb-8">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((_, index) => (
                  <img
                    key={index}
                    src={`https://readdy.ai/api/search-image?query=Happy%20smiling%20asian%20customer%20portrait&width=100&height=100&seq=avatar${index}`}
                    alt="Customer"
                    className="w-10 h-10 rounded-full border-2 border-white object-cover"
                  />
                ))}
              </div>
              <p className="text-white text-sm font-medium">
                Hơn 5,000+ khách hàng tin dùng
              </p>
            </div>

            {/* Headings */}
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-black text-white mb-6 leading-tight">
              Nông Sản Sạch
            </h1>

            <p className="text-4xl md:text-5xl lg:text-6xl font-light text-white/90 mb-12">
              Từ Trang Trại Đến Bàn Ăn
            </p>

            {/* CTA */}
            <a
              href="/products"
              className="inline-flex items-center space-x-3 bg-white text-gray-900 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-xl whitespace-nowrap"
            >
              <span>Khám Phá Ngay</span>
              <i className="ri-arrow-right-line text-xl"></i>
            </a>
          </div>

          {/* Description */}
          <div className="absolute bottom-20 right-8 max-w-md hidden lg:block">
            <p className="text-white/90 text-lg leading-relaxed">
              Cam kết mang đến sản phẩm nông sản hữu cơ, an toàn và tươi ngon nhất.
              Trực tiếp từ nông trại đến tay người tiêu dùng.
            </p>
          </div>
        </div>
      </section>
       {/* ===== WHY CHOOSE US ===== */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-12 md:mb-16">
            <p className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-3">
              TẠI SAO CHỌN CHÚNG TÔI
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-black text-gray-900 leading-tight">
              Cam Kết Chất Lượng
              <br />
              Từ Nguồn Gốc
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {features.map((item, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-3xl p-6 md:p-8 hover:shadow-xl transition"
              >
                <div className="w-14 h-14 flex items-center justify-center mb-6">
                  <i className={`${item.icon} text-4xl text-gray-900`} />
                </div>
                <h3 className="text-xl md:text-2xl font-bold mb-4">
                  {item.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURED PRODUCTS ===== */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-black mb-4">
              Sản Phẩm Nổi Bật
            </h2>
            <p className="text-gray-600 max-w-md text-sm md:text-base">
              Những sản phẩm được yêu thích nhất, tươi ngon và đảm bảo chất lượng hữu cơ cao nhất.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {products.map((p, index) => (
              <div
                key={index}
                className="group bg-white rounded-2xl overflow-hidden border hover:shadow-2xl transition"
              >
                <div className="relative h-56 sm:h-64 md:h-72 bg-gray-100 overflow-hidden">
                  <img
                    src={`https://readdy.ai/api/search-image?query=Fresh%20organic%20vegetables&width=400&height=400&seq=${p.img}`}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                  />
                  {index < 2 && (
                    <span className="absolute top-4 left-4 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      <i className="ri-star-fill" />
                      MỚI
                    </span>
                  )}
                </div>

                <div className="p-5 md:p-6">
                  <p className="text-xs text-gray-500 uppercase mb-2">Rau Củ</p>
                  <h3 className="text-lg md:text-xl font-bold mb-2">
                    {p.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {p.desc}
                  </p>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xl md:text-2xl font-bold">
                        {p.price}
                      </span>
                      <span className="text-gray-500 text-sm"> /kg</span>
                    </div>
                    <button className="bg-gray-900 text-white px-4 md:px-6 py-2.5 md:py-3 rounded-full text-sm font-semibold hover:bg-gray-800">
                      Thêm Vào Giỏ
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10 md:mt-12">
            <a
              href="/products"
              className="inline-flex items-center gap-2 font-semibold hover:text-green-600 transition"
            >
              Xem Tất Cả Sản Phẩm
              <i className="ri-arrow-right-line" />
            </a>
          </div>
        </div>
      </section>
      {/* ===== TESTIMONIAL ===== */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-center">
            {/* Image */}
            <div className="lg:col-span-2">
              <div className="relative h-72 sm:h-96 lg:h-[500px] rounded-3xl overflow-hidden">
                <img
                  src="https://readdy.ai/api/search-image?query=Happy%20smiling%20asian%20woman%20holding%20fresh%20organic%20vegetables%20in%20modern%20kitchen&width=600&height=800"
                  alt="Khách hàng hài lòng"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Content */}
            <div className="lg:col-span-3">
              <p className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-4">
                (KHÁCH HÀNG NÓI GÌ)
              </p>

              <h2 className="text-3xl sm:text-4xl md:text-6xl font-black mb-6">
                <span className="text-gray-900">Trải Nghiệm Tuyệt Vời</span>
                <br />
                <span className="text-gray-400">Từ Khách Hàng</span>
              </h2>

              <div className="space-y-8 mt-8">
                {testimonials.map((t, i) => (
                  <div key={i}>
                    <p className="text-gray-700 text-base md:text-lg leading-relaxed mb-4">
                      “{t.content}”
                    </p>
                    <p className="font-bold text-gray-900">
                      — {t.author}
                    </p>
                  </div>
                ))}
              </div>

              {/* Controls */}
              <div className="flex items-center space-x-4 mt-10">
                <button className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center">
                  <i className="ri-arrow-left-line text-xl" />
                </button>
                <button className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-gray-900 hover:bg-gray-800 text-white flex items-center justify-center">
                  <i className="ri-arrow-right-line text-xl" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== ABOUT CTA ===== */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-gray-900 via-green-900 to-gray-900 text-white">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-gray-400 text-sm uppercase tracking-wider mb-6">
            VỀ CHÚNG TÔI
          </p>

          <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black leading-tight mb-8">
            Nông Trại Xanh
            <br />
            Hơn 10 Năm Kinh Nghiệm
            <br />
            Mang Sức Khỏe Đến Mọi Nhà
          </h2>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-10">
            <a
              href="/about"
              className="bg-white text-gray-900 px-8 py-4 rounded-full font-semibold hover:bg-gray-100"
            >
              Tìm Hiểu Thêm
            </a>
            <a
              href="/contact"
              className="border-2 border-white px-8 py-4 rounded-full font-semibold hover:bg-white/10"
            >
              Liên Hệ Ngay
            </a>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mt-16">
            {aboutFeatures.map((f, i) => (
              <div
                key={i}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 flex flex-col items-center gap-3 hover:bg-white/20 transition"
              >
                <i className={`${f.icon} text-3xl`} />
                <span className="font-medium">{f.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="mb-10">
            <div className="relative h-64 sm:h-80 rounded-3xl overflow-hidden">
              <img
                src="https://readdy.ai/api/search-image?query=Beautiful%20organic%20farm%20with%20fresh%20vegetables%20and%20fruits&width=1200&height=600"
                alt="Đặt hàng ngay"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="space-y-2 mb-10">
            <p className="text-2xl sm:text-3xl md:text-5xl text-gray-900">
              Đặt Hàng Ngay Hôm Nay
            </p>
            <p className="text-2xl sm:text-3xl md:text-5xl italic text-gray-500">
              Nhận Ưu Đãi
            </p>
            <p className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900">
              Lên Đến 20%
            </p>
          </div>

          <a
            href="/products"
            className="inline-block bg-gray-900 text-white px-10 py-4 rounded-full text-lg font-semibold hover:bg-gray-800 hover:scale-105 transition"
          >
            Mua Sắm Ngay
          </a>
        </div>
      </section>
       
    <footer className="bg-gradient-to-br from-green-800 to-green-900 text-white">
      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          {/* Logo & description */}
          <div>
            <img
              src="https://public.readdy.ai/ai/img_res/5bde7704-1cb0-4365-9e92-f123696b11d9.png"
              alt="Nông Sản Sạch"
              className="h-12 w-auto mb-4"
            />
            <p className="text-gray-300 text-sm leading-relaxed">
              Cung cấp nông sản sạch, hữu cơ từ trang trại đến bàn ăn. 
              Cam kết chất lượng và an toàn thực phẩm.
            </p>

            <div className="flex space-x-4 mt-6">
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
              Đăng ký nhận tin
            </h3>
            <p className="text-gray-300 text-sm mb-4">
              Nhận thông tin về sản phẩm mới và ưu đãi đặc biệt
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
                Bằng cách đăng ký, bạn đồng ý với{" "}
                <a href="#" className="text-green-300 hover:text-green-200 underline">
                  Chính sách bảo mật
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
              {["Sản Phẩm", "Danh Mục", "Về Chúng Tôi", "Liên Hệ", "FAQ"].map(
                (item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-gray-300 hover:text-white text-sm transition-colors"
                    >
                      {item}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-4">
              Liên hệ
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <i className="ri-map-pin-line text-green-300 mt-1" />
                <span className="text-gray-300 text-sm">
                  123 Đường Nông Nghiệp, Quận 1, TP.HCM
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <i className="ri-phone-line text-green-300" />
                <a href="tel:0123456789" className="text-gray-300 hover:text-white text-sm">
                  0123 456 789
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <i className="ri-mail-line text-green-300" />
                <a
                  href="mailto:info@nongsansach.vn"
                  className="text-gray-300 hover:text-white text-sm"
                >
                  info@nongsansach.vn
                </a>
              </li>
              <li className="flex items-start space-x-3">
                <i className="ri-time-line text-green-300 mt-1" />
                <span className="text-gray-300 text-sm">
                  Thứ 2 - Chủ Nhật <br /> 8:00 - 20:00
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Big text */}
      <div className="bg-green-900/50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black text-green-100/20 tracking-tight text-center">
            NÔNG SẢN SẠCH
          </h2>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm text-center md:text-left">
              © 2026 Nông Sản Sạch. Tất cả quyền được bảo lưu.
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <a href="#" className="text-gray-400 hover:text-white text-sm">
                Chính sách bảo mật
              </a>
              <a href="#" className="text-gray-400 hover:text-white text-sm">
                Điều khoản sử dụng
              </a>
              <a
                href="https://readdy.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white text-sm"
              >
                Website Builder
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
    </>
  );
};

export default HomePage;