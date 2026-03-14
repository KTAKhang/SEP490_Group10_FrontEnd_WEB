import React, { useState, useEffect } from 'react';
import { AlertTriangle, Home, Clock, Receipt, Wallet, Package, PhoneCall, Timer } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { orderDetailRequest, clearOrderMessages } from '../../redux/actions/orderActions';

export default function PaymentSuccessNoStockPage() {
  const [animate, setAnimate] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const { orderDetail, detailLoading } = useSelector((state) => state.order || {});

  useEffect(() => {
    if (orderId) dispatch(orderDetailRequest(orderId));
    return () => dispatch(clearOrderMessages());
  }, [dispatch, orderId]);

  useEffect(() => {
    const t = setTimeout(() => setAnimate(true), 50);
    return () => clearTimeout(t);
  }, []);

  const order = orderDetail?.order;

  const infoRows = order
    ? [
        {
          icon: Receipt,
          label: 'Order code',
          value: `#${order._id?.slice(-8).toUpperCase()}`,
        },
        {
          icon: Wallet,
          label: 'Total amount',
          value: `${order.total_price?.toLocaleString('en-US')} đ`,
          highlight: true,
        },
        {
          icon: Package,
          label: 'Status',
          value: order.order_status?.name,
        },
        {
          icon: Wallet,
          label: 'Payment',
          value: orderDetail.payment?.status,
        },
      ]
    : [];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap');

        .ns-root {
          min-height: 100vh;
          background: linear-gradient(135deg, #fffbeb 0%, #ffffff 50%, #fff7ed 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          margin-top: 80px;
          font-family: 'Be Vietnam Pro', sans-serif;
          position: relative;
          overflow: hidden;
        }
        .ns-root::before {
          content: '';
          position: absolute;
          top: -200px; left: -200px;
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%);
          pointer-events: none;
        }
        .ns-root::after {
          content: '';
          position: absolute;
          bottom: -200px; right: -200px;
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(239,68,68,0.07) 0%, transparent 70%);
          pointer-events: none;
        }

        .ns-card-wrap {
          width: 100%;
          max-width: 440px;
          display: flex;
          flex-direction: column;
          align-items: center;
          opacity: 0;
          transform: translateY(20px) scale(0.97);
          transition: opacity 0.6s ease, transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .ns-card-wrap.visible {
          opacity: 1;
          transform: translateY(0) scale(1);
        }

        /* Icon */
        .ns-icon-wrap {
          position: relative;
          margin-bottom: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .ns-icon-circle {
          width: 96px; height: 96px;
          border-radius: 50%;
          background: linear-gradient(135deg, #d97706, #f59e0b, #fbbf24);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 40px rgba(245,158,11,0.50), 0 8px 24px rgba(0,0,0,0.10);
          animation: pulse-icon 2s ease-in-out infinite;
          position: relative;
          z-index: 1;
        }
        .ns-glow-ring {
          position: absolute;
          width: 120px; height: 120px;
          border-radius: 50%;
          border: 1.5px solid rgba(245,158,11,0.25);
          animation: glow-ring 2s ease-in-out infinite;
        }
        .ns-glow-ring-2 {
          position: absolute;
          width: 144px; height: 144px;
          border-radius: 50%;
          border: 1px solid rgba(245,158,11,0.10);
          animation: glow-ring 2s ease-in-out infinite 0.3s;
        }
        @keyframes pulse-icon {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.06); }
        }
        @keyframes glow-ring {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.05); }
        }

        /* Text */
        .ns-title {
          font-size: 26px;
          font-weight: 800;
          color: #111827;
          text-align: center;
          margin: 0 0 8px;
          letter-spacing: -0.3px;
        }
        .ns-subtitle {
          font-size: 14px;
          color: #6b7280;
          text-align: center;
          line-height: 1.6;
          margin: 0 0 20px;
        }

        /* Badge */
        .ns-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(245,158,11,0.10);
          border: 1px solid rgba(245,158,11,0.30);
          padding: 7px 16px;
          border-radius: 999px;
          margin-bottom: 24px;
          color: #d97706;
          font-size: 13px;
          font-weight: 600;
        }

        /* Cards */
        .ns-info-card {
          width: 100%;
          background: #ffffff;
          border-radius: 20px;
          padding: 20px;
          margin-bottom: 16px;
          border: 1px solid rgba(0,0,0,0.08);
          box-shadow: 0 4px 24px rgba(0,0,0,0.07);
        }
        .ns-card-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 14px;
        }
        .ns-card-title {
          color: #111827;
          font-size: 15px;
          font-weight: 700;
          margin: 0;
        }
        .ns-divider {
          height: 1px;
          background: rgba(0,0,0,0.07);
          margin-bottom: 14px;
        }

        /* Order info rows */
        .ns-info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 0;
          border-bottom: 1px solid rgba(0,0,0,0.05);
        }
        .ns-info-row:last-child { border-bottom: none; }
        .ns-info-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .ns-row-icon {
          width: 28px; height: 28px;
          border-radius: 8px;
          background: rgba(245,158,11,0.10);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .ns-info-label { color: #6b7280; font-size: 13px; }
        .ns-info-value {
          color: #111827;
          font-size: 13px;
          font-weight: 600;
          text-align: right;
          max-width: 55%;
        }
        .ns-info-value.highlight {
          color: #d97706;
          font-size: 15px;
          font-weight: 700;
        }

        /* Refund notice */
        .ns-notice {
          width: 100%;
          background: rgba(245,158,11,0.06);
          border: 1px solid rgba(245,158,11,0.20);
          border-radius: 14px;
          padding: 14px 16px;
          margin-bottom: 24px;
          display: flex;
          gap: 10px;
          align-items: flex-start;
        }
        .ns-notice-icon { flex-shrink: 0; margin-top: 1px; }
        .ns-notice-text {
          font-size: 13px;
          color: #92400e;
          line-height: 1.6;
        }
        .ns-notice-text strong { font-weight: 700; color: #78350f; }

        /* Loading */
        .ns-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          padding: 32px 0;
          margin-bottom: 16px;
        }
        .ns-spinner {
          width: 36px; height: 36px;
          border: 3px solid rgba(245,158,11,0.15);
          border-top-color: #f59e0b;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .ns-loading-text { color: #9ca3af; font-size: 13px; }

        /* Buttons */
        .ns-btn-group {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .ns-btn-primary {
          width: 100%;
          border: none;
          border-radius: 14px;
          padding: 0;
          cursor: pointer;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(59,130,246,0.30);
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .ns-btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 28px rgba(59,130,246,0.45);
        }
        .ns-btn-primary:active { transform: translateY(0); }
        .ns-btn-primary-inner {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 16px;
          background: linear-gradient(90deg, #2563eb, #3b82f6);
          color: #fff;
          font-size: 15px;
          font-weight: 700;
          font-family: 'Be Vietnam Pro', sans-serif;
        }
        .ns-btn-secondary {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 15px;
          border-radius: 14px;
          border: 1px solid rgba(245,158,11,0.25);
          background: rgba(245,158,11,0.05);
          color: #d97706;
          font-size: 15px;
          font-weight: 600;
          font-family: 'Be Vietnam Pro', sans-serif;
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s, transform 0.15s;
        }
        .ns-btn-secondary:hover {
          background: rgba(245,158,11,0.10);
          border-color: rgba(245,158,11,0.40);
          transform: translateY(-1px);
        }
        .ns-btn-secondary:active { transform: translateY(0); }
        .ns-btn-ghost {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px;
          border-radius: 14px;
          border: none;
          background: transparent;
          color: #9ca3af;
          font-size: 14px;
          font-weight: 500;
          font-family: 'Be Vietnam Pro', sans-serif;
          cursor: pointer;
          transition: color 0.15s;
        }
        .ns-btn-ghost:hover { color: #6b7280; }
      `}</style>

      <div className="ns-root">
        <div className={`ns-card-wrap ${animate ? 'visible' : ''}`}>

          {/* Warning Icon */}
          <div className="ns-icon-wrap">
            <div className="ns-glow-ring-2" />
            <div className="ns-glow-ring" />
            <div className="ns-icon-circle">
              <AlertTriangle size={44} color="#fff" strokeWidth={2.5} />
            </div>
          </div>

          {/* Title */}
          <h1 className="ns-title">Payment Successful,<br />No Stock Available</h1>
          <p className="ns-subtitle">
            Your payment was received but the items<br />are no longer in stock.
          </p>

          {/* Badge */}
          <div className="ns-badge">
            <Timer size={14} />
            <span>Payment exceeded 15 minutes</span>
          </div>

          {/* Order Detail Card */}
          {detailLoading ? (
            <div className="ns-loading">
              <div className="ns-spinner" />
              <span className="ns-loading-text">Loading order information...</span>
            </div>
          ) : order && (
            <div className="ns-info-card">
              <div className="ns-card-header">
                <Receipt size={17} color="#f59e0b" />
                <h2 className="ns-card-title">Order Details</h2>
              </div>
              <div className="ns-divider" />
              {infoRows.map((row, i) => {
                const Icon = row.icon;
                return (
                  <div className="ns-info-row" key={i}>
                    <div className="ns-info-left">
                      <div className="ns-row-icon">
                        <Icon size={14} color="#fcd34d" />
                      </div>
                      <span className="ns-info-label">{row.label}</span>
                    </div>
                    <span className={`ns-info-value ${row.highlight ? 'highlight' : ''}`}>
                      {row.value}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Refund Notice */}
          <div className="ns-notice">
            <div className="ns-notice-icon">
              <AlertTriangle size={16} color="#d97706" />
            </div>
            <p className="ns-notice-text">
              For any questions, please <strong>contact our support</strong>. The amount paid will be <strong>refunded within 2 business days</strong>, excluding holidays and weekends.
            </p>
          </div>

          {/* Buttons */}
          <div className="ns-btn-group">
            <button className="ns-btn-primary" onClick={() => navigate('/customer/orders')}>
              <div className="ns-btn-primary-inner">
                <Clock size={17} />
                View Order History
              </div>
            </button>
            <button className="ns-btn-secondary" onClick={() => navigate('/')}>
              <Home size={17} />
              Back to Home
            </button>
            <button className="ns-btn-ghost">
              <PhoneCall size={15} />
              Contact Support
            </button>
          </div>

        </div>
      </div>
    </>
  );
}