import React, { useState, useEffect } from 'react';
import { X, Home, Clock, AlertTriangle, PhoneCall, Receipt, Wallet, Package } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { orderDetailRequest, clearOrderMessages } from '../../redux/actions/orderActions';

export default function PaymentFailPage() {
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

  const reasons = [
    'Insufficient account balance',
    'Incorrect card information',
    'Network connection issues',
    'Card blocked or expired',
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap');

        .pf-root {
          min-height: 100vh;
          background: linear-gradient(135deg, #fff1f2 0%, #ffffff 50%, #fff7ed 100%);
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
        .pf-root::before {
          content: '';
          position: absolute;
          top: -200px;
          left: -200px;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(239,68,68,0.10) 0%, transparent 70%);
          pointer-events: none;
        }
        .pf-root::after {
          content: '';
          position: absolute;
          bottom: -200px;
          right: -200px;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(251,146,60,0.08) 0%, transparent 70%);
          pointer-events: none;
        }

        .pf-card-wrap {
          width: 100%;
          max-width: 440px;
          display: flex;
          flex-direction: column;
          align-items: center;
          opacity: 0;
          transform: translateY(20px) scale(0.97);
          transition: opacity 0.6s ease, transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .pf-card-wrap.visible {
          opacity: 1;
          transform: translateY(0) scale(1);
        }

        /* Icon */
        .pf-icon-wrap {
          position: relative;
          margin-bottom: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .pf-icon-circle {
          width: 96px;
          height: 96px;
          border-radius: 50%;
          background: linear-gradient(135deg, #dc2626, #ef4444, #f87171);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 40px rgba(239,68,68,0.45), 0 8px 24px rgba(0,0,0,0.12);
          animation: pulse-icon 2s ease-in-out infinite;
          position: relative;
          z-index: 1;
        }
        .pf-glow-ring {
          position: absolute;
          width: 120px;
          height: 120px;
          border-radius: 50%;
          border: 1.5px solid rgba(239,68,68,0.2);
          animation: glow-ring 2s ease-in-out infinite;
        }
        .pf-glow-ring-2 {
          position: absolute;
          width: 144px;
          height: 144px;
          border-radius: 50%;
          border: 1px solid rgba(239,68,68,0.08);
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
        .pf-title {
          font-size: 26px;
          font-weight: 800;
          color: #111827;
          text-align: center;
          margin: 0 0 8px;
          letter-spacing: -0.3px;
        }
        .pf-subtitle {
          font-size: 14px;
          color: #6b7280;
          text-align: center;
          line-height: 1.6;
          margin: 0 0 20px;
        }

        /* Badge */
        .pf-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.25);
          padding: 7px 16px;
          border-radius: 999px;
          margin-bottom: 24px;
          color: #ef4444;
          font-size: 13px;
          font-weight: 600;
        }

        /* Reasons Card */
        .pf-info-card {
          width: 100%;
          background: #ffffff;
          border-radius: 20px;
          padding: 20px;
          margin-bottom: 24px;
          border: 1px solid rgba(0,0,0,0.08);
          box-shadow: 0 4px 24px rgba(0,0,0,0.07);
        }
        .pf-card-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 14px;
        }
        .pf-card-title {
          color: #111827;
          font-size: 15px;
          font-weight: 700;
          margin: 0;
        }
        .pf-divider {
          height: 1px;
          background: rgba(0,0,0,0.07);
          margin-bottom: 14px;
        }
        /* Order Info rows */
        .pf-info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 0;
          border-bottom: 1px solid rgba(0,0,0,0.05);
        }
        .pf-info-row:last-child { border-bottom: none; }
        .pf-info-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .pf-row-icon {
          width: 28px;
          height: 28px;
          border-radius: 8px;
          background: rgba(239,68,68,0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .pf-info-label { color: #6b7280; font-size: 13px; }
        .pf-info-value {
          color: #111827;
          font-size: 13px;
          font-weight: 600;
          text-align: right;
          max-width: 55%;
        }
        .pf-info-value.highlight {
          color: #ef4444;
          font-size: 15px;
          font-weight: 700;
        }
        /* Loading */
        .pf-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          padding: 32px 0;
          margin-bottom: 24px;
        }
        .pf-spinner {
          width: 36px;
          height: 36px;
          border: 3px solid rgba(239,68,68,0.15);
          border-top-color: #ef4444;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .pf-loading-text { color: #9ca3af; font-size: 13px; }

        .pf-reason-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 0;
          border-bottom: 1px solid rgba(0,0,0,0.05);
        }
        .pf-reason-row:last-child { border-bottom: none; }
        .pf-reason-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #fca5a5;
          flex-shrink: 0;
          margin-left: 4px;
        }
        .pf-reason-text {
          color: #374151;
          font-size: 13px;
        }

        /* Buttons */
        .pf-btn-group {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .pf-btn-primary {
          width: 100%;
          border: none;
          border-radius: 14px;
          padding: 0;
          cursor: pointer;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(59,130,246,0.30);
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .pf-btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 28px rgba(59,130,246,0.45);
        }
        .pf-btn-primary:active { transform: translateY(0); }
        .pf-btn-primary-inner {
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
        .pf-btn-secondary {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 15px;
          border-radius: 14px;
          border: 1px solid rgba(239,68,68,0.25);
          background: rgba(239,68,68,0.04);
          color: #ef4444;
          font-size: 15px;
          font-weight: 600;
          font-family: 'Be Vietnam Pro', sans-serif;
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s, transform 0.15s;
        }
        .pf-btn-secondary:hover {
          background: rgba(239,68,68,0.08);
          border-color: rgba(239,68,68,0.4);
          transform: translateY(-1px);
        }
        .pf-btn-secondary:active { transform: translateY(0); }

        .pf-btn-ghost {
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
        .pf-btn-ghost:hover { color: #6b7280; }
      `}</style>

      <div className="pf-root">
        <div className={`pf-card-wrap ${animate ? 'visible' : ''}`}>

          {/* Fail Icon */}
          <div className="pf-icon-wrap">
            <div className="pf-glow-ring-2" />
            <div className="pf-glow-ring" />
            <div className="pf-icon-circle">
              <X size={44} color="#fff" strokeWidth={3} />
            </div>
          </div>

          {/* Title */}
          <h1 className="pf-title">Payment Failed!</h1>
          <p className="pf-subtitle">
            Sorry, your transaction could not be completed.<br />Please review the details and try again.
          </p>

          {/* Badge */}
          <div className="pf-badge">
            <AlertTriangle size={14} />
            <span>Transaction Unsuccessful</span>
          </div>

          {/* Order Detail Card */}
          {detailLoading ? (
            <div className="pf-loading">
              <div className="pf-spinner" />
              <span className="pf-loading-text">Loading order information...</span>
            </div>
          ) : order && (
            <div className="pf-info-card">
              <div className="pf-card-header">
                <Receipt size={17} color="#ef4444" />
                <h2 className="pf-card-title">Order Details</h2>
              </div>
              <div className="pf-divider" />
              {infoRows.map((row, i) => {
                const Icon = row.icon;
                return (
                  <div className="pf-info-row" key={i}>
                    <div className="pf-info-left">
                      <div className="pf-row-icon">
                        <Icon size={14} color="#fca5a5" />
                      </div>
                      <span className="pf-info-label">{row.label}</span>
                    </div>
                    <span className={`pf-info-value ${row.highlight ? 'highlight' : ''}`}>
                      {row.value}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Reasons Card */}
          <div className="pf-info-card">
            <div className="pf-card-header">
              <AlertTriangle size={17} color="#ef4444" />
              <h2 className="pf-card-title">Possible Reasons</h2>
            </div>
            <div className="pf-divider" />
            {reasons.map((reason, i) => (
              <div className="pf-reason-row" key={i}>
                <div className="pf-reason-dot" />
                <span className="pf-reason-text">{reason}</span>
              </div>
            ))}
          </div>

          {/* Buttons */}
          <div className="pf-btn-group">
            <button className="pf-btn-primary" onClick={() => navigate('/customer/orders')}>
              <div className="pf-btn-primary-inner">
                <Clock size={17} />
                View Order History
              </div>
            </button>
            <button className="pf-btn-secondary" onClick={() => navigate('/')}>
              <Home size={17} />
              Back to Home
            </button>
            <button className="pf-btn-ghost" onClick={() => navigate('/customer/contact')}>
              <PhoneCall size={15} />
              Contact Support
            </button>
          </div>

        </div>
      </div>
    </>
  );
}