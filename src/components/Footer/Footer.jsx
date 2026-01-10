 

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-white mt-auto">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <div>
                        <div className="flex items-center space-x-2 mb-6">
                            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                                <span className="text-white text-xl">💻</span>
                            </div>
                            <span className="text-xl font-bold">TechStore</span>
                        </div>
                        <p className="text-gray-400 mb-4 leading-relaxed">
                            Chuyên cung cấp laptop, máy tính bảng và dịch vụ sửa chữa chất lượng cao với giá cả hợp lý.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors">
                                📘
                            </a>
                            <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors">
                                📺
                            </a>
                            <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors">
                                📷
                            </a>
                        </div>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg mb-4">Sản phẩm</h3>
                        <ul className="space-y-2">
                            <li><a className="text-gray-400 hover:text-white transition-colors cursor-pointer">Laptop</a></li>
                            <li><a className="text-gray-400 hover:text-white transition-colors cursor-pointer">Máy tính bảng</a></li>
                            <li><a className="text-gray-400 hover:text-white transition-colors cursor-pointer">Phụ kiện</a></li>
                            <li><a className="text-gray-400 hover:text-white transition-colors cursor-pointer">Sản phẩm giảm giá</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg mb-4">Dịch vụ</h3>
                        <ul className="space-y-2">
                            <li><a className="text-gray-400 hover:text-white transition-colors cursor-pointer">Sửa chữa laptop</a></li>
                            <li><a className="text-gray-400 hover:text-white transition-colors cursor-pointer">Thay màn hình</a></li>
                            <li><a className="text-gray-400 hover:text-white transition-colors cursor-pointer">Nâng cấp phần cứng</a></li>
                            <li><a className="text-gray-400 hover:text-white transition-colors cursor-pointer">Bảo hành</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg mb-4">Liên hệ</h3>
                        <ul className="space-y-3">
                            <li className="flex items-center text-gray-400">
                                <span className="mr-3 text-blue-400">📍</span>123 Đường ABC, Quận Ninh Kiều, TP.Cần Thơ
                            </li>
                            <li className="flex items-center text-gray-400">
                                <span className="mr-3 text-blue-400">📞</span>0123.456.789
                            </li>
                            <li className="flex items-center text-gray-400">
                                <span className="mr-3 text-blue-400">✉️</span>info@techstore.vn
                            </li>
                            <li className="flex items-center text-gray-400">
                                <span className="mr-3 text-blue-400">⏰</span>8:00 - 22:00 hàng ngày
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;