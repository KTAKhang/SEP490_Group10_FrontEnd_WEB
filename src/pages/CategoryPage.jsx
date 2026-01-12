import React from 'react';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';

// Mock data cho danh mục
const categories = [
  {
    id: 1,
    name: 'Rau Củ',
    description: 'Rau củ tươi ngon, hữu cơ 100%, không hóa chất độc hại',
    image: 'https://cdn.britannica.com/17/196817-050-6A15DAC3/vegetables.jpg?w=400&h=300&c=crop',
    productCount: 15
  },
  {
    id: 2,
    name: 'Trái Cây',
    description: 'Trái cây ngọt tự nhiên, giàu vitamin và khoáng chất',
    image: 'https://img.freepik.com/free-vector/vector-ripe-yellow-banana-bunch-isolated-white-background_1284-45456.jpg?semt=ais_hybrid&w=740&q=80',
    productCount: 12
  },
  {
    id: 3,
    name: 'Nấm',
    description: 'Nấm tươi các loại, giàu protein và chất dinh dưỡng',
    image: 'https://images.immediate.co.uk/production/volatile/sites/30/2023/08/Chestnut-mushrooms-a223a78.jpg?quality=90&resize=440,400',
    productCount: 8
  },
  {
    id: 4,
    name: 'Gia Vị',
    description: 'Gia vị tự nhiên, thơm ngon cho món ăn thêm hấp dẫn',
    image: 'https://t4.ftcdn.net/jpg/01/02/58/91/360_F_102589163_hk02O92vzEYP0rZbVyvDTbkje1GaUDk1.jpg',
    productCount: 10
  },
  {
    id: 5,
    name: 'Rau Ăn Lá',
    description: 'Rau xanh giòn ngon, giàu chất xơ và vitamin',
    image: 'https://www.unileverfoodsolutions.com.vn/vi/goc-am-thuc/nhat-quan/nang-tam-lau/rau-an-lau-ga/jcr:content/parsys/set1/row2/span12/textimage_811810871/image.img.png/1658722672229.png',
    productCount: 18
  },
  {
    id: 6,
    name: 'Củ Quả',
    description: 'Củ quả tươi ngon, bổ dưỡng cho cả nhà',
    image: 'https://images.pexels.com/photos/144248/potatoes-vegetables-erdfrucht-bio-144248.jpeg',
    productCount: 14
  }
];

export default function Categories() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 bg-gradient-to-br from-green-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-6">
              Categories
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Explore a variety of organic agricultural product categories, from fresh vegetables to naturally sweet fruits
            </p>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category) => (
              <a
                key={category.id}
                href="/products"
                className="group relative bg-white rounded-3xl overflow-hidden border border-gray-200 hover:shadow-2xl transition-all duration-300 cursor-pointer"
              >
                {/* Category Image */}
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                  
                  {/* Product Count Badge */}
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full">
                    <span className="text-sm font-semibold text-gray-900">
                      {category.productCount} products
                    </span>
                  </div>
                </div>

                {/* Category Info */}
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    {category.description}
                  </p>
                  
                  <div className="flex items-center text-gray-900 font-semibold group-hover:text-green-600 transition-colors">
                    <span>Explore now</span>
                    <i className="ri-arrow-right-line ml-2 group-hover:translate-x-2 transition-transform"></i>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-green-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-6">
            Can't Find the Product You Need?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Contact us for consultation and special product orders
          </p>
          <a
            href="/contact"
            className="inline-block bg-white text-gray-900 px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition-colors whitespace-nowrap cursor-pointer"
          >
            Contact Us
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}