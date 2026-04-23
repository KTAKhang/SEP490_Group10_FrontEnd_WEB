import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import { getShopInfoPublicRequest } from "../redux/actions/shopActions";

const DEFAULT_FAQS = [
  {
    question: "What does this shop sell?",
    answer:
      "We focus on fresh fruit and related produce, with clear product pages, categories, and seasonal availability. Browse Products to see what is in stock and read each item’s description before you add it to your cart.",
  },
  {
    question: "How do I place a regular order?",
    answer:
      "Create an account (or sign in), open Products, choose an item, add it to your cart, then go to Checkout. You can pay with supported methods shown at checkout (for example COD or online payment where enabled). After payment, you can track your order under Order history in your customer area.",
  },
  {
    question: "What is a pre-order and how does payment work?",
    answer:
      "Pre-order lets you reserve fruit before harvest or allocation. You typically pay a deposit first; after the shop allocates stock to your order, you complete the remaining balance when prompted. Exact percentages and steps follow the checkout and pre-order screens. You can view your pre-orders under My pre-orders after you are logged in.",
  },
  {
    question: "Can I cancel a pre-order myself?",
    answer:
      "Pre-orders are confirmed at checkout and are not self-cancellable in the app for business reasons. If you need to cancel, contact us (Contact page) with your order details; our team will review the case and only staff with the right role can cancel or mark refund according to shop policy.",
  },
  {
    question: "How long does delivery take?",
    answer:
      "Delivery time depends on your address and carrier. Major cities are often faster; other areas may take a few business days. We pack carefully to keep fruit fresh. You will see shipping-related information during checkout when it applies to your order.",
  },
  {
    question: "Are your products organic?",
    answer:
      "We aim for high-quality, traceable produce. Organic claims depend on the supplier and certification shown on each product or batch. If you need proof for a specific SKU, use Contact and mention the product name or order ID so we can answer with the right documentation.",
  },
  {
    question: "How should I store fruit after delivery?",
    answer:
      "Keep most fruit in a cool, dry place or the fridge depending on the variety. Avoid washing until you eat. Use breathable bags where possible. For delicate fruit, consume within a few days for the best taste and texture.",
  },
  {
    question: "What if I am not satisfied or the item is damaged?",
    answer:
      "Contact us within a short window after delivery (for example 24 hours) with photos and your order ID. We will check quality and description issues case by case and propose a fair solution (replacement, partial refund, or guidance per policy).",
  },
  {
    question: "Do you offer vouchers or discounts?",
    answer:
      "Yes. Customers with an account can open the Vouchers section to see valid codes and promotions. Some discounts are created by staff and must be approved before use; terms (minimum order, dates, product scope) are shown when you apply a code at checkout.",
  },
  {
    question: "Can I order in bulk for a restaurant or office?",
    answer:
      "Yes. For large or recurring volumes, use Contact with subject “Bulk order”, your location, desired fruit types, and approximate kg per week. We will reply with availability, pricing, and lead time.",
  },
  {
    question: "How do I get help or track my request?",
    answer:
      "Signed-in customers can use Contact to send a message and view Contact history for replies. You can also call the shop phone shown in the header or footer when we publish it. Include your registered email and any order or pre-order ID so we can find you faster.",
  },
  {
    question: "Is my account data safe?",
    answer:
      "Use a strong password and do not share your login. We use standard authentication for customer accounts. If you suspect unauthorized access, change your password immediately and tell us via Contact.",
  },
  {
    question: "Where can I read news or promotions?",
    answer:
      "Open the News section from the main menu for articles, harvest updates, and shop announcements. It is the best place to learn about seasonal fruit and limited offers.",
  },
  {
    question: "What is the wishlist for?",
    answer:
      "When you are signed in, you can save products to your wishlist to compare or buy later. Items stay on your list until you remove them or they go out of stock.",
  },
];

export default function FAQPage() {
  const dispatch = useDispatch();
  const { publicShopInfo } = useSelector((state) => state.shop || {});
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = DEFAULT_FAQS;

  useEffect(() => {
    if (!publicShopInfo) {
      dispatch(getShopInfoPublicRequest());
    }
  }, [dispatch, publicShopInfo]);

  const phoneDisplay = publicShopInfo?.phone || "0123 456 789";
  const phoneHref = `tel:${String(phoneDisplay).replace(/\s/g, "")}`;

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <section className="relative pt-32 pb-20 bg-gradient-to-br from-green-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-6">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Quick answers about shopping, pre-orders, delivery, vouchers, and support for our fruit store.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow"
                itemScope
                itemProp="mainEntity"
                itemType="https://schema.org/Question"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full px-8 py-6 flex items-center justify-between text-left hover:bg-gray-50 transition-colors cursor-pointer"
                  aria-expanded={openIndex === index}
                >
                  <h2 className="text-lg font-bold text-gray-900 pr-8" itemProp="name">
                    {faq.question}
                  </h2>
                  <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                    <i
                      className={`ri-arrow-down-s-line text-2xl text-gray-600 transition-transform ${
                        openIndex === index ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </button>

                {openIndex === index && (
                  <div
                    className="px-8 pb-6"
                    itemScope
                    itemProp="acceptedAnswer"
                    itemType="https://schema.org/Answer"
                  >
                    <p className="text-gray-600 leading-relaxed" itemProp="text">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-gray-900 to-green-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-20 h-20 flex items-center justify-center bg-white/10 rounded-full mx-auto mb-6">
            <i className="ri-question-line text-4xl" />
          </div>
          <h2 className="text-4xl md:text-5xl font-black mb-6">Still have questions?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Our team is happy to help with orders, pre-orders, or product advice.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link
              to="/customer/contact"
              className="bg-white text-gray-900 px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition-colors whitespace-nowrap cursor-pointer"
            >
              Contact us
            </Link>
            <a
              href={phoneHref}
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white/10 transition-colors flex items-center space-x-2 whitespace-nowrap cursor-pointer"
            >
              <i className="ri-phone-line" />
              <span>{phoneDisplay}</span>
            </a>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">Useful links</h2>
            <p className="text-gray-600">
              Explore more about our shop, catalog, and customer support.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Link
              to="/about"
              className="group bg-white rounded-2xl p-8 border border-gray-200 hover:shadow-xl transition-all cursor-pointer block"
            >
              <div className="w-14 h-14 flex items-center justify-center bg-green-100 rounded-xl mb-6 group-hover:scale-110 transition-transform">
                <i className="ri-information-line text-2xl text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">About us</h3>
              <p className="text-gray-600 mb-4">Learn about our story and how we work with growers.</p>
              <span className="text-green-600 font-semibold flex items-center">
                Learn more
                <i className="ri-arrow-right-line ml-2 group-hover:translate-x-2 transition-transform" />
              </span>
            </Link>

            <Link
              to="/products"
              className="group bg-white rounded-2xl p-8 border border-gray-200 hover:shadow-xl transition-all cursor-pointer block"
            >
              <div className="w-14 h-14 flex items-center justify-center bg-green-100 rounded-xl mb-6 group-hover:scale-110 transition-transform">
                <i className="ri-shopping-bag-line text-2xl text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Products</h3>
              <p className="text-gray-600 mb-4">Browse fresh fruit and seasonal picks.</p>
              <span className="text-green-600 font-semibold flex items-center">
                View products
                <i className="ri-arrow-right-line ml-2 group-hover:translate-x-2 transition-transform" />
              </span>
            </Link>

            <Link
              to="/customer/contact"
              className="group bg-white rounded-2xl p-8 border border-gray-200 hover:shadow-xl transition-all cursor-pointer block"
            >
              <div className="w-14 h-14 flex items-center justify-center bg-green-100 rounded-xl mb-6 group-hover:scale-110 transition-transform">
                <i className="ri-customer-service-line text-2xl text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Support</h3>
              <p className="text-gray-600 mb-4">Reach our customer care team (sign in to use contact).</p>
              <span className="text-green-600 font-semibold flex items-center">
                Get help
                <i className="ri-arrow-right-line ml-2 group-hover:translate-x-2 transition-transform" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
