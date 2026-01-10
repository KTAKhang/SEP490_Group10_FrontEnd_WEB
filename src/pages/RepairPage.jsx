import React, { useState } from 'react';
import { ShoppingCart, Heart, User, Search, Menu, Star, Grid, List } from 'lucide-react';

const products = [
    {
        id: 1,
        name: 'MacBook Pro M3 14 inch',
        image: 'https://readdy.ai/api/search-image?query=Apple%20MacBook%20Pro%20laptop%20with%20sleek%20aluminum%20design%20open%20displaying%20colorful%20desktop%20on%20pure%20white%20background%2C%20premium%20product%20photography%20with%20soft%20shadows%20and%20professional%20lighting&width=400&height=400&seq=macbook-pro-list&orientation=squarish',
        price: '52.990.000₫',
        oldPrice: '59.990.000₫',
        discount: '-12%',
        badge: 'Mới nhất',
        rating: 4.8,
        reviews: 124,
        specs: ['Chip M3', '16GB RAM', '512GB SSD']
    },
    {
        id: 2,
        name: 'iPad Pro 12.9 inch M2',
        image: 'https://readdy.ai/api/search-image?query=iPad%20Pro%20tablet%20device%20with%20vibrant%20display%20showing%20creative%20apps%20interface%20on%20clean%20white%20background%2C%20modern%20product%20photography%20emphasizing%20sleek%20design%20and%20premium%20build&width=400&height=400&seq=ipad-pro-list&orientation=squarish',
        price: '28.990.000₫',
        oldPrice: '32.990.000₫',
        discount: '-12%',
        badge: 'Bán chạy',
        rating: 4.9,
        reviews: 89,
        specs: ['Chip M2', 'Liquid Retina XDR', 'Hỗ trợ Apple Pencil']
    },
    {
        id: 3,
        name: 'ASUS ROG Strix G15',
        image: 'https://readdy.ai/api/search-image?query=Gaming%20laptop%20with%20RGB%20backlit%20keyboard%20and%20aggressive%20design%20open%20on%20white%20background%2C%20high-performance%20gaming%20computer%20with%20colorful%20lighting%20effects%20professional%20product%20photography&width=400&height=400&seq=asus-rog-list&orientation=squarish',
        price: '25.990.000₫',
        oldPrice: '29.990.000₫',
        discount: '-13%',
        badge: 'Gaming',
        rating: 4.7,
        reviews: 156,
        specs: ['RTX 4060', 'AMD Ryzen 7', '16GB DDR5']
    },
    {
        id: 4,
        name: 'Dell XPS 13 Plus',
        image: 'https://readdy.ai/api/search-image?query=Ultra-slim%20business%20laptop%20with%20premium%20aluminum%20construction%20and%20edge-to-edge%20display%20on%20white%20background%2C%20professional%20ultrabook%20design%20with%20minimalist%20aesthetics&width=400&height=400&seq=dell-xps-list&orientation=squarish',
        price: '32.990.000₫',
        oldPrice: '36.990.000₫',
        discount: '-11%',
        badge: 'Cao cấp',
        rating: 4.6,
        reviews: 78,
        specs: ['Intel i7-1360P', '13.4" OLED', '512GB SSD']
    },
    {
        id: 5,
        name: 'Samsung Galaxy Tab S9',
        image: 'https://readdy.ai/api/search-image?query=Samsung%20Galaxy%20tablet%20with%20S%20Pen%20stylus%20and%20vibrant%20AMOLED%20display%20on%20clean%20white%20background%2C%20premium%20Android%20tablet%20photography%20with%20professional%20lighting&width=400&height=400&seq=samsung-tab-list&orientation=squarish',
        price: '18.990.000₫',
        oldPrice: '21.990.000₫',
        discount: '-14%',
        badge: 'Khuyến mãi',
        rating: 4.5,
        reviews: 92,
        specs: ['Snapdragon 8 Gen 2', '11" AMOLED', 'S Pen']
    },
    {
        id: 6,
        name: 'MSI Gaming GF63',
        image: 'https://readdy.ai/api/search-image?query=MSI%20gaming%20laptop%20with%20red%20accents%20and%20gaming%20keyboard%20open%20on%20white%20background%2C%20mid-range%20gaming%20computer%20with%20aggressive%20design%20professional%20product%20photography&width=400&height=400&seq=msi-gaming-list&orientation=squarish',
        price: '19.990.000₫',
        oldPrice: '23.990.000₫',
        discount: '-17%',
        badge: 'Giá tốt',
        rating: 4.4,
        reviews: 203,
        specs: ['GTX 1650', 'Intel i5-11400H', '8GB RAM']
    },
    {
        id: 7,
        name: 'AirPods Pro Gen 2',
        image: 'https://readdy.ai/api/search-image?query=Apple%20AirPods%20Pro%20wireless%20earbuds%20with%20charging%20case%20on%20clean%20white%20background%2C%20premium%20audio%20accessories%20photography%20with%20soft%20shadows%20and%20elegant%20presentation&width=400&height=400&seq=airpods-pro-list&orientation=squarish',
        price: '5.990.000₫',
        oldPrice: '6.990.000₫',
        discount: '-14%',
        badge: 'Hot',
        rating: 4.8,
        reviews: 456,
        specs: ['Chống ồn chủ động', 'Chip H2', 'MagSafe']
    },
    {
        id: 8,
        name: 'Magic Keyboard',
        image: 'https://readdy.ai/api/search-image?query=Apple%20Magic%20Keyboard%20wireless%20bluetooth%20keyboard%20with%20clean%20minimalist%20design%20on%20white%20background%2C%20premium%20computer%20accessories%20photography%20with%20professional%20lighting&width=400&height=400&seq=magic-keyboard-list&orientation=squarish',
        price: '2.990.000₫',
        oldPrice: '3.490.000₫',
        discount: '-14%',
        badge: 'Chính hãng',
        rating: 4.6,
        reviews: 134,
        specs: ['Bluetooth', 'Pin sạc', 'Thiết kế mỏng']
    }
];

const categories = [
    { name: 'Tất cả', count: 430, active: true },
    { name: 'Laptop', count: 150, active: false },
    { name: 'Máy tính bảng', count: 80, active: false },
    { name: 'Phụ kiện', count: 200, active: false }
];

export default function TechStore() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Tất cả');
    const [sortBy, setSortBy] = useState('featured');
    const [viewMode, setViewMode] = useState('grid');
    const [cartCount] = useState(3);

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-100">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-2">
                            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                                <span className="text-white text-xl">💻</span>
                            </div>
                            <span className="text-xl font-bold text-gray-900">TechStore</span>
                        </div>

                        <nav className="hidden md:flex items-center space-x-8">
                            <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors">Trang chủ</a>
                            <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors">Sản phẩm</a>
                            <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors">Sửa chữa</a>
                            <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors">Về chúng tôi</a>
                            <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors">Liên hệ</a>
                        </nav>

                        <div className="flex items-center space-x-4">
                            <div className="relative w-64">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm laptop, máy tính bảng..."
                                    className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            <div className="flex items-center space-x-2">
                                <button className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-blue-600">
                                    <Heart size={20} />
                                </button>
                                <button className="relative w-10 h-10 flex items-center justify-center text-gray-600 hover:text-blue-600">
                                    <ShoppingCart size={20} />
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                                        {cartCount}
                                    </span>
                                </button>
                                <button className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-blue-600">
                                    <User size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main>
                <section className="py-8 bg-white">
                    <div className="container mx-auto px-4">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-gray-900 mb-4">Tất cả sản phẩm</h1>
                            <p className="text-gray-600">Khám phá bộ sưu tập công nghệ đa dạng với chất lượng đảm bảo</p>
                        </div>

                        <div className="flex flex-col lg:flex-row gap-8">
                            {/* Sidebar */}
                            <div className="lg:w-1/4">
                                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                                    <h3 className="font-bold text-gray-900 mb-4">Danh mục</h3>
                                    <div className="space-y-2">
                                        {categories.map((category) => (
                                            <button
                                                key={category.name}
                                                onClick={() => setSelectedCategory(category.name)}
                                                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${selectedCategory === category.name
                                                    ? 'bg-blue-600 text-white'
                                                    : 'hover:bg-gray-200 text-gray-700'
                                                    }`}
                                            >
                                                <div className="flex justify-between items-center">
                                                    <span>{category.name}</span>
                                                    <span className="text-sm opacity-75">({category.count})</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-xl p-6">
                                    <h3 className="font-bold text-gray-900 mb-4">Sắp xếp theo</h3>
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="featured">Nổi bật</option>
                                        <option value="price-low">Giá thấp đến cao</option>
                                        <option value="price-high">Giá cao đến thấp</option>
                                        <option value="rating">Đánh giá cao nhất</option>
                                    </select>
                                </div>
                            </div>

                            {/* Products Grid */}
                            <div className="lg:w-3/4">
                                <div className="flex justify-between items-center mb-6">
                                    <p className="text-gray-600">Hiển thị {products.length} sản phẩm</p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setViewMode('grid')}
                                            className={`p-2 border rounded-lg ${viewMode === 'grid' ? 'bg-gray-50' : 'hover:bg-gray-50'}`}
                                        >
                                            <Grid size={20} className="text-gray-600" />
                                        </button>
                                        <button
                                            onClick={() => setViewMode('list')}
                                            className={`p-2 border rounded-lg ${viewMode === 'list' ? 'bg-gray-50' : 'hover:bg-gray-50'}`}
                                        >
                                            <List size={20} className="text-gray-600" />
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {products.map((product) => (
                                        <div key={product.id} className="group bg-white rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300 overflow-hidden">
                                            <div className="relative">
                                                <img
                                                    src={product.image}
                                                    alt={product.name}
                                                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                                <div className="absolute top-3 left-3">
                                                    <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                                                        {product.discount}
                                                    </span>
                                                </div>
                                                <div className="absolute top-3 right-3">
                                                    <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                                                        {product.badge}
                                                    </span>
                                                </div>
                                                <button className="absolute bottom-3 right-3 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-red-50 transition-colors">
                                                    <Heart size={20} className="text-gray-600 hover:text-red-500" />
                                                </button>
                                            </div>

                                            <div className="p-5">
                                                <h3 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                                                    {product.name}
                                                </h3>

                                                <div className="flex flex-wrap gap-1 mb-3">
                                                    {product.specs.map((spec, index) => (
                                                        <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                                            {spec}
                                                        </span>
                                                    ))}
                                                </div>

                                                <div className="flex items-center mb-3">
                                                    <div className="flex items-center">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star
                                                                key={i}
                                                                size={14}
                                                                className={i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-yellow-400'}
                                                            />
                                                        ))}
                                                    </div>
                                                    <span className="text-sm text-gray-500 ml-2">
                                                        {product.rating} ({product.reviews})
                                                    </span>
                                                </div>

                                                <div className="flex items-center justify-between mb-4">
                                                    <div>
                                                        <span className="text-lg font-bold text-red-600">{product.price}</span>
                                                        <span className="text-sm text-gray-400 line-through ml-2">{product.oldPrice}</span>
                                                    </div>
                                                </div>

                                                <div className="flex gap-2">
                                                    <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                                                        Thêm giỏ hàng
                                                    </button>
                                                    <button className="flex-1 border border-blue-600 text-blue-600 py-2 px-4 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium">
                                                        Xem chi tiết
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-gray-900 text-white">
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
                        </div>

                        <div>
                            <h3 className="font-bold text-lg mb-4">Sản phẩm</h3>
                            <ul className="space-y-2">
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Laptop</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Máy tính bảng</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Phụ kiện</a></li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-bold text-lg mb-4">Dịch vụ</h3>
                            <ul className="space-y-2">
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Sửa chữa laptop</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Thay màn hình</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Nâng cấp phần cứng</a></li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-bold text-lg mb-4">Liên hệ</h3>
                            <ul className="space-y-3 text-gray-400">
                                <li>📍 123 Đường ABC, Quận 1, TP.HCM</li>
                                <li>📞 0123.456.789</li>
                                <li>✉️ info@techstore.vn</li>
                                <li>🕐 8:00 - 22:00 hàng ngày</li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-gray-800 mt-8 pt-8 text-center">
                        <p className="text-gray-400 text-sm">© 2024 TechStore. Tất cả quyền được bảo lưu.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}