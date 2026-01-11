import { useState } from 'react';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';

// Mock data cho sản phẩm
const featuredProducts = [
    {
        id: 1,
        name: 'Rau Cải Xanh Hữu Cơ',
        description: 'Tươi ngon, giàu dinh dưỡng',
        price: 25000,
        unit: 'kg',
        category: 'Rau Củ',
        image: 'https://img.freepik.com/free-psd/close-up-delicious-apple_23-2151868338.jpg?semt=ais_hybrid&w=740&q=80',
        isNew: true
    },
    {
        id: 2,
        name: 'Cà Chua Bi Organic',
        description: 'Ngọt tự nhiên, không thuốc trừ sâu',
        price: 45000,
        unit: 'kg',
        category: 'Rau Củ',
        image: 'https://img.freepik.com/free-psd/close-up-delicious-apple_23-2151868338.jpg?semt=ais_hybrid&w=740&q=80',
        isNew: false
    },
    {
        id: 3,
        name: 'Xà Lách Sạch',
        description: 'Giòn ngon, an toàn',
        price: 30000,
        unit: 'kg',
        category: 'Rau Củ',
        image: 'https://img.freepik.com/free-psd/close-up-delicious-apple_23-2151868338.jpg?semt=ais_hybrid&w=740&q=80',
        isNew: true
    },
    {
        id: 4,
        name: 'Dưa Leo Xanh',
        description: 'Giòn ngọt, tươi mát',
        price: 20000,
        unit: 'kg',
        category: 'Rau Củ',
        image: 'https://img.freepik.com/free-psd/close-up-delicious-apple_23-2151868338.jpg?semt=ais_hybrid&w=740&q=80',
        isNew: false
    },
    {
        id: 5,
        name: 'Ớt Chuông Đỏ',
        description: 'Ngọt, giàu vitamin C',
        price: 55000,
        unit: 'kg',
        category: 'Rau Củ',
        image: 'https://img.freepik.com/free-psd/close-up-delicious-apple_23-2151868338.jpg?semt=ais_hybrid&w=740&q=80',
        isNew: false
    },
    {
        id: 6,
        name: 'Bí Đỏ Hữu Cơ',
        description: 'Ngọt bùi, giàu chất xơ',
        price: 30000,
        unit: 'kg',
        category: 'Rau Củ',
        image: 'https://img.freepik.com/free-psd/close-up-delicious-apple_23-2151868338.jpg?semt=ais_hybrid&w=740&q=80',
        isNew: false
    },
    {
        id: 7,
        name: 'Xà Lách Xoăn',
        price: 28000,
        unit: 'kg',
        image: 'https://img.freepik.com/free-psd/close-up-delicious-apple_23-2151868338.jpg?semt=ais_hybrid&w=740&q=80',
        category: 'Rau Củ',
        isNew: false,
        description: 'Xà lách xoăn giòn ngọt'
    },
    {
        id: 8,
        name: 'Cà Rốt Đà Lạt',
        price: 32000,
        unit: 'kg',
        image: 'https://img.freepik.com/free-psd/close-up-delicious-apple_23-2151868338.jpg?semt=ais_hybrid&w=740&q=80',
        category: 'Rau Củ',
        isNew: true,
        description: 'Cà rốt ngọt bùi từ Đà Lạt'
    },
    {
        id: 9,
        name: 'Bông Cải Xanh',
        price: 38000,
        unit: 'kg',
        image: 'https://img.freepik.com/free-psd/close-up-delicious-apple_23-2151868338.jpg?semt=ais_hybrid&w=740&q=80',
        category: 'Rau Củ',
        isNew: false,
        description: 'Bông cải xanh tươi, giàu dinh dưỡng'
    },
    {
        id: 10,
        name: 'Táo Fuji Nhật',
        price: 85000,
        unit: 'kg',
        image: 'https://img.freepik.com/free-psd/close-up-delicious-apple_23-2151868338.jpg?semt=ais_hybrid&w=740&q=80',
        category: 'Trái Cây',
        isNew: true,
        description: 'Táo Fuji nhập khẩu từ Nhật Bản'
    },
    {
        id: 11,
        name: 'Cam Sành Vĩnh Long',
        price: 35000,
        unit: 'kg',
        image: 'https://img.freepik.com/free-psd/close-up-delicious-apple_23-2151868338.jpg?semt=ais_hybrid&w=740&q=80',
        category: 'Trái Cây',
        isNew: false,
        description: 'Cam sành ngọt mát từ Vĩnh Long'
    },
    {
        id: 12,
        name: 'Nấm Đùi Gà',
        price: 65000,
        unit: 'kg',
        image: 'https://img.freepik.com/free-psd/close-up-delicious-apple_23-2151868338.jpg?semt=ais_hybrid&w=740&q=80',
        category: 'Nấm',
        isNew: false,
        description: 'Nấm đùi gà tươi, giàu protein'
    }
];

export default function Products() {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [sortBy, setSortBy] = useState('default');

    const categories = ['all', 'Rau Củ', 'Trái Cây', 'Nấm', 'Gia Vị'];

    const allProducts = featuredProducts;

    const filteredProducts = selectedCategory === 'all'
        ? allProducts
        : allProducts.filter(p => p.category === selectedCategory);

    return (
        <div className="min-h-screen bg-white">
            <Header />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 bg-gradient-to-br from-green-50 to-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto">
                        <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-6">
                            Our Products
                        </h1>
                        <p className="text-xl text-gray-600 leading-relaxed">
                            Explore a collection of fresh organic agricultural products, carefully selected from reputable farms
                        </p>
                    </div>
                </div>
            </section>

            {/* Filters Section */}
            <section className="py-8 border-b border-gray-200 sticky top-20 bg-white z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                        {/* Category Filter */}
                        <div className="flex flex-wrap gap-2">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-6 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${selectedCategory === cat
                                            ? 'bg-gray-900 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    {cat === 'all' ? 'Tất Cả' : cat}
                                </button>
                            ))}
                        </div>

                        {/* Sort Filter */}
                        <div className="flex items-center space-x-3">
                            <span className="text-sm text-gray-600">Sort:</span>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-600 cursor-pointer"
                            >
                                <option value="default">Default</option>
                                <option value="price-low">Price: Low to High</option>
                                <option value="price-high">Price: High to Low</option>
                                <option value="name">Name: A-Z</option>
                            </select>
                        </div>
                    </div>
                </div>
            </section>

            {/* Products Grid */}
            <section className="py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <p className="text-gray-600">
                            Showing <span className="font-semibold">{filteredProducts.length}</span> products
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {filteredProducts.map((product) => (
                            <div
                                key={product.id}
                                className="group bg-white rounded-2xl overflow-hidden border border-gray-200 hover:shadow-2xl transition-all duration-300 cursor-pointer"
                            >
                                {/* Product Image */}
                                <div className="relative h-64 bg-gray-100 overflow-hidden">
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    {product.isNew && (
                                        <div className="absolute top-4 left-4 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
                                            <i className="ri-star-fill"></i>
                                            <span>NEW</span>
                                        </div>
                                    )}
                                    <button className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg cursor-pointer" aria-label="Yêu thích">
                                        <i className="ri-heart-line text-gray-900"></i>
                                    </button>
                                </div>

                                {/* Product Info */}
                                <div className="p-5">
                                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                                        {product.category}
                                    </p>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">{product.name}</h3>
                                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <span className="text-xl font-bold text-gray-900">
                                                {product.price.toLocaleString('vi-VN')}đ
                                            </span>
                                            <span className="text-gray-500 text-sm">/{product.unit}</span>
                                        </div>
                                        <button className="w-10 h-10 flex items-center justify-center bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors cursor-pointer" aria-label="Thêm vào giỏ">
                                            <i className="ri-shopping-cart-line"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}