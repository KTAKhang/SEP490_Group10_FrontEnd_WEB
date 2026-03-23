import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Check, Home, Clock, Receipt, Wallet, Package, Bike } from 'lucide-react';
import { orderDetailRequest, clearOrderMessages } from "../../redux/actions/orderActions";
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from "react-router-dom";
export default function OrderSuccessPage() {
  const [animate, setAnimate] = useState(false);
   const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { orderDetail, detailLoading } = useSelector((state) => state.order || {});
  useEffect(() => {
    if (orderId) {
      dispatch(orderDetailRequest(orderId));
    }
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
          value: order.order_status_id?.name,
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

        .os-root {
          min-height: 100vh;
          background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 50%, #eff6ff 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          margin-top: 80px;
          font-family: 'Be Vietnam Pro', sans-serif;
          position: relative;
          overflow: hidden;
        }

        /* Ambient background orbs */
        .os-root::before {
          content: '';
          position: absolute;
          top: -200px;
          left: -200px;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%);
          pointer-events: none;
        }
        .os-root::after {
          content: '';
          position: absolute;
          bottom: -200px;
          right: -200px;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%);
          pointer-events: none;
        }

        .os-card-wrap {
          width: 100%;
          max-width: 440px;
          display: flex;
          flex-direction: column;
          align-items: center;
          opacity: 0;
          transform: translateY(20px) scale(0.97);
          transition: opacity 0.6s ease, transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .os-card-wrap.visible {
          opacity: 1;
          transform: translateY(0) scale(1);
        }

        /* Icon */
        .os-icon-wrap {
          position: relative;
          margin-bottom: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .os-icon-circle {
          width: 96px;
          height: 96px;
          border-radius: 50%;
          background: linear-gradient(135deg, #059669, #10b981, #34d399);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 40px rgba(16,185,129,0.45), 0 8px 24px rgba(0,0,0,0.4);
          animation: pulse-icon 2s ease-in-out infinite;
          position: relative;
          z-index: 1;
        }
        .os-glow-ring {
          position: absolute;
          width: 120px;
          height: 120px;
          border-radius: 50%;
          border: 1.5px solid rgba(16,185,129,0.2);
          animation: glow-ring 2s ease-in-out infinite;
        }
        .os-glow-ring-2 {
          position: absolute;
          width: 144px;
          height: 144px;
          border-radius: 50%;
          border: 1px solid rgba(16,185,129,0.08);
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
        .os-title {
          font-size: 26px;
          font-weight: 800;
          color: #111827;
          text-align: center;
          margin: 0 0 8px;
          letter-spacing: -0.3px;
        }
        .os-subtitle {
          font-size: 14px;
          color: #6b7280;
          text-align: center;
          line-height: 1.6;
          margin: 0 0 20px;
        }

        /* COD Badge */
        .os-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(251,191,36,0.1);
          border: 1px solid rgba(251,191,36,0.3);
          padding: 7px 16px;
          border-radius: 999px;
          margin-bottom: 24px;
          color: #fbbf24;
          font-size: 13px;
          font-weight: 600;
        }

        /* Info Card */
        .os-info-card {
          width: 100%;
          background: #ffffff;
          border-radius: 20px;
          padding: 20px;
          margin-bottom: 24px;
          border: 1px solid rgba(0,0,0,0.08);
          box-shadow: 0 4px 24px rgba(0,0,0,0.07);
        }
        .os-card-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 14px;
        }
        .os-card-title {
          color: #111827;
          font-size: 15px;
          font-weight: 700;
          margin: 0;
        }
        .os-divider {
          height: 1px;
          background: rgba(0,0,0,0.07);
          margin-bottom: 14px;
        }
        .os-info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 0;
          border-bottom: 1px solid rgba(0,0,0,0.05);
        }
        .os-info-row:last-child { border-bottom: none; }
        .os-info-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .os-row-icon {
          width: 28px;
          height: 28px;
          border-radius: 8px;
          background: rgba(16,185,129,0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .os-info-label {
          color: #6b7280;
          font-size: 13px;
        }
        .os-info-value {
          color: #111827;
          font-size: 13px;
          font-weight: 600;
          text-align: right;
          max-width: 55%;
        }
        .os-info-value.highlight {
          color: #059669;
          font-size: 15px;
          font-weight: 700;
        }

        /* Loading */
        .os-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          padding: 32px 0;
          margin-bottom: 24px;
        }
        .os-spinner {
          width: 36px;
          height: 36px;
          border: 3px solid rgba(16,185,129,0.2);
          border-top-color: #10b981;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .os-loading-text { color: #9ca3af; font-size: 13px; }

        /* Buttons */
        .os-btn-group {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .os-btn-primary {
          width: 100%;
          border: none;
          border-radius: 14px;
          padding: 0;
          cursor: pointer;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(16,185,129,0.35);
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .os-btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 28px rgba(16,185,129,0.5);
        }
        .os-btn-primary:active { transform: translateY(0); }
        .os-btn-primary-inner {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 16px;
          background: linear-gradient(90deg, #059669, #10b981);
          color: #fff;
          font-size: 15px;
          font-weight: 700;
          font-family: 'Be Vietnam Pro', sans-serif;
        }
        .os-btn-secondary {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 15px;
          border-radius: 14px;
          border: 1px solid rgba(16,185,129,0.3);
          background: rgba(16,185,129,0.05);
          color: #10b981;
          font-size: 15px;
          font-weight: 600;
          font-family: 'Be Vietnam Pro', sans-serif;
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s, transform 0.15s;
        }
        .os-btn-secondary:hover {
          background: rgba(16,185,129,0.1);
          border-color: rgba(16,185,129,0.5);
          transform: translateY(-1px);
        }
        .os-btn-secondary:active { transform: translateY(0); }
      `}</style>



      <div className="os-root">
        <div className={`os-card-wrap ${animate ? 'visible' : ''}`}>

          {/* Success Icon */}
          <div className="os-icon-wrap">
            <div className="os-glow-ring-2" />
            <div className="os-glow-ring" />
            <div className="os-icon-circle">
              <Check size={44} color="#fff" strokeWidth={3} />
            </div>
          </div>

          {/* Title */}
          <h1 className="os-title">Order Placed Successfully!</h1>
          <p className="os-subtitle">
            Thank you for your purchase.<br />Your order is being processed.
          </p>

          {/* COD Badge */}
          <div className="os-badge">
            <Bike size={15} />
            <span>Cash on Delivery (COD)</span>
          </div>

          {/* Order Info Card */}
          {detailLoading ? (
            <div className="os-loading">
              <div className="os-spinner" />
              <span className="os-loading-text">Loading order information...</span>
            </div>
          ) : order && (
            <div className="os-info-card">
              <div className="os-card-header">
                <Receipt size={17} color="#10b981" />
                <h2 className="os-card-title">Order Details</h2>
              </div>
              <div className="os-divider" />
              {infoRows.map((row, i) => {
                const Icon = row.icon;
                return (
                  <div className="os-info-row" key={i}>
                    <div className="os-info-left">
                      <div className="os-row-icon">
                        <Icon size={14} color="#6ee7b7" />
                      </div>
                      <span className="os-info-label">{row.label}</span>
                    </div>
                    <span className={`os-info-value ${row.highlight ? 'highlight' : ''}`}>
                      {row.value}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Buttons */}
          <div className="os-btn-group">
            <button className="os-btn-primary" onClick={() => navigate('/')}>
              <div className="os-btn-primary-inner">
                <Home size={17} />
                Back to Home
              </div>
            </button>
            <button className="os-btn-secondary" onClick={() => navigate('/customer/orders')}>
              <Clock size={17} />
              View Order History
            </button>
          </div>

        </div>
      </div>
    </>
  );
}