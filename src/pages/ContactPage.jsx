import { useState } from 'react';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';

export default function Contact() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState('idle');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus('idle');

        try {
            const formBody = new URLSearchParams();
            formBody.append('name', formData.name);
            formBody.append('email', formData.email);
            formBody.append('phone', formData.phone);
            formBody.append('subject', formData.subject);
            formBody.append('message', formData.message);

            const response = await fetch('', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formBody.toString()
            });

            if (response.ok) {
                setSubmitStatus('success');
                setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
            } else {
                setSubmitStatus('error');
            }
        } catch (error) {
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const contactInfo = [
        {
            icon: '📍',
            title: 'Address',
            content: '123 Nong Nghiep Street, District 1, Ho Chi Minh City',
            link: 'https://maps.google.com'
        },
        {
            icon: '📞',
            title: 'Phone',
            content: '0123 456 789',
            link: 'tel:0123456789'
        },
        {
            icon: '✉️',
            title: 'Email',
            content: 'info@nongsansach.vn',
            link: 'mailto:info@nongsansach.vn'
        },
        {
            icon: '🕐',
            title: 'Working Hours',
            content: 'Monday - Sunday: 8:00 AM - 8:00 PM',
            link: null
        },
    ];

    return (
        <div className="min-h-screen bg-white">
            <Header />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 bg-gradient-to-br from-green-50 to-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto">
                        <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-6">
                            Contact Us
                        </h1>
                        <p className="text-xl text-gray-600 leading-relaxed">
                            We are always ready to listen and support you. Please leave your information, and we will respond as soon as possible!
                        </p>
                    </div>
                </div>
            </section>

            {/* Contact Info Cards */}
            <section className="py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {contactInfo.map((info, index) => (
                            <div
                                key={index}
                                className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-shadow"
                            >
                                <div className="w-12 h-12 flex items-center justify-center bg-green-100 rounded-xl mb-4">
                                    <span className="text-2xl">{info.icon}</span>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">{info.title}</h3>
                                {info.link ? (
                                    <a
                                        href={info.link}
                                        target={info.link.startsWith('http') ? '_blank' : undefined}
                                        rel={info.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                                        className="text-gray-600 hover:text-green-600 transition-colors"
                                    >
                                        {info.content}
                                    </a>
                                ) : (
                                    <p className="text-gray-600">{info.content}</p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Form & Map */}
            <section className="py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                        {/* Contact Form */}
                        <div>
                            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-6">
                                Send Us a Message
                            </h2>
                            <p className="text-gray-600 mb-8">
                                Fill out the form below, and we will get back to you as soon as possible.
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-semibold text-gray-900 mb-2">
                                        Full Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 text-sm"
                                        placeholder="Nguyễn Văn A"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
                                            Email <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            required
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 text-sm"
                                            placeholder="email@example.com"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="phone" className="block text-sm font-semibold text-gray-900 mb-2">
                                            Phone Number
                                        </label>
                                        <input
                                            type="tel"
                                            id="phone"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 text-sm"
                                            placeholder="0123 456 789"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="subject" className="block text-sm font-semibold text-gray-900 mb-2">
                                        Subject <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="subject"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 text-sm"
                                        placeholder="Tôi muốn hỏi về..."
                                    />
                                </div>

                                <div>
                                    <label htmlFor="message" className="block text-sm font-semibold text-gray-900 mb-2">
                                        Message <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        value={formData.message}
                                        onChange={(e) => {
                                            if (e.target.value.length <= 500) {
                                                setFormData({ ...formData, message: e.target.value });
                                            }
                                        }}
                                        required
                                        rows={6}
                                        maxLength={500}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 resize-none text-sm"
                                        placeholder="Nhập nội dung tin nhắn của bạn..."
                                    ></textarea>
                                    <p className="text-xs text-gray-500 mt-2">
                                        {formData.message.length}/500 characters
                                    </p>
                                </div>

                                {submitStatus === 'success' && (
                                    <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
                                        <div className="flex items-center space-x-2">
                                            <span className="text-xl">✓</span>
                                            <span className="font-medium">Message sent successfully! We will get back to you soon.</span>
                                        </div>
                                    </div>
                                )}

                                {submitStatus === 'error' && (
                                    <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                                        <div className="flex items-center space-x-2">
                                            <span className="text-xl">⚠</span>
                                            <span className="font-medium">An error occurred. Please try again later.</span>
                                        </div>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-gray-900 text-white px-8 py-4 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? (
                                        <span className="flex items-center justify-center space-x-2">
                                            <span className="animate-spin">⏳</span>
                                            <span>Sending...</span>
                                        </span>
                                    ) : (
                                        'Send Message'
                                    )}
                                </button>
                            </form>
                        </div>

                        {/* Map */}
                        <div>
                            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-6">
                                Our Location
                            </h2>
                            <p className="text-gray-600 mb-8">
                                Visit our store to experience fresh organic agricultural products firsthand.
                            </p>

                            <div className="rounded-2xl overflow-hidden shadow-lg h-[500px]">
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3929.0532902991586!2d105.72985667569752!3d10.012457072818897!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31a0882139720a77%3A0x3916a227d0b95a64!2zVHLGsOG7nW5nIMSQ4bqhaSBo4buNYyBGUFQgQ-G6p24gVGjGoQ!5e0!3m2!1sen!2s!4v1768101333349!5m2!1sen!2s"
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    allowFullScreen
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    title="Vị trí cửa hàng"
                                ></iframe>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Social Media Section */}
            <section className="py-20 bg-gradient-to-br from-gray-900 to-green-900 text-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-4xl md:text-5xl font-black mb-6">
                        Connect with Us on Social Media
                    </h2>
                    <p className="text-xl text-gray-300 mb-8">
                        Follow us on social media to stay updated with the latest news and offers
                    </p>
                    <div className="flex justify-center space-x-6">
                        <a
                            href="https://facebook.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-14 h-14 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                            aria-label="Facebook"
                        >
                            <span className="text-2xl">f</span>
                        </a>
                        <a
                            href="https://instagram.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-14 h-14 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                            aria-label="Instagram"
                        >
                            <span className="text-2xl">📷</span>
                        </a>
                        <a
                            href="https://zalo.me"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-14 h-14 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                            aria-label="Zalo"
                        >
                            <span className="text-2xl">💬</span>
                        </a>
                        <a
                            href="https://youtube.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-14 h-14 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                            aria-label="YouTube"
                        >
                            <span className="text-2xl">▶️</span>
                        </a>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}