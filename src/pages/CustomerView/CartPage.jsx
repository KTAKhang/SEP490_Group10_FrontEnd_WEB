import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Minus,
  Plus,
  Trash2,
  ArrowLeft,
  ShoppingBag,
  Tag,
  CheckCircle2,
} from "lucide-react";
import {
  fetchCartRequest,
  updateCartItemRequest,
  removeCartItemRequest,
} from "../../redux/actions/cartActions";
import { checkoutHoldRequest } from "../../redux/actions/checkoutActions";

const CartPage = () => {
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart || {});
  const items = cart.items || [];
  const [selectedItems, setSelectedItems] = useState([]);
  const [editingQuantity, setEditingQuantity] = useState({});
  const navigate = useNavigate();
  const checkout = useSelector((state) => state.checkout || {});
  const appliedDiscount = null;

  useEffect(() => {
    dispatch(fetchCartRequest());
  }, [dispatch]);

  useEffect(() => {
    if (!items || items.length === 0) {
      setSelectedItems([]);
      return;
    }

    const nonExpiredItems = items.filter((it) => !it.isExpired);
    const preselected = items
      .filter((it) => it.selected === true && !it.isExpired)
      .map((it) => it.product_id ?? it.productId);

    if (preselected.length > 0) {
      setSelectedItems(preselected);
    } else {
      setSelectedItems(nonExpiredItems.map((it) => it.product_id ?? it.productId));
    }
  }, [JSON.stringify(items)]);

  const toggleSelectItem = (productId, isExpired) => {
    if (isExpired) return;
    setSelectedItems((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const nonExpiredItems = items.filter((it) => !it.isExpired);
  const nonExpiredIds = nonExpiredItems.map((it) => it.product_id ?? it.productId);
  const allNonExpiredSelected =
    nonExpiredIds.length > 0 &&
    nonExpiredIds.every((id) => selectedItems.includes(id));

  const toggleSelectAll = () => {
    if (allNonExpiredSelected) {
      setSelectedItems([]);
    } else {
      setSelectedItems([...nonExpiredIds]);
    }
  };

  const handleQuantityChange = (productId, value) => {
    const digitsOnly = value.replace(/\D/g, "");
    setEditingQuantity((prev) => ({ ...prev, [productId]: digitsOnly }));
  };

  const handleQuantityBlur = (productId, currentQty) => {
    const newQty = editingQuantity[productId];
    if (newQty !== undefined && newQty !== "") {
      const parsedQty = parseInt(newQty, 10);
      if (!isNaN(parsedQty) && parsedQty > 0 && parsedQty !== currentQty) {
        dispatch(updateCartItemRequest(productId, parsedQty));
      }
    }
    setEditingQuantity((prev) => {
      const s = { ...prev };
      delete s[productId];
      return s;
    });
  };

  const handleQuantityKeyPress = (e, productId, currentQty) => {
    if (e.key === "Enter") e.target.blur();
  };

  const isAllSelected =
    nonExpiredIds.length > 0 && allNonExpiredSelected;

  const formatPrice = (price) =>
    new Intl.NumberFormat("vi-VN").format(price) + "₫";

  const calculateSubtotal = () =>
    items
      .filter((item) => selectedItems.includes(item.product_id ?? item.productId))
      .reduce((total, item) => {
        const price = item.product?.price ?? item.price ?? item.unit_price ?? 0;
        return total + price * (item.quantity || 0);
      }, 0);

  const selectedCount = selectedItems.length;

  useEffect(() => {
    const existingSession = localStorage.getItem("checkout_session_id");
    if (existingSession) navigate("/customer/checkout");
  }, [navigate]);

  useEffect(() => {
    if (checkout.checkout_session_id) {
      localStorage.setItem("checkout_session_id", checkout.checkout_session_id);
      navigate("/customer/checkout");
    } else if (checkout.message && localStorage.getItem("checkout_session_id")) {
      localStorage.removeItem("checkout_session_id");
    }
  }, [checkout.checkout_session_id, checkout.message, navigate]);

  const handleCheckout = () => {
    if (!items || items.length === 0) {
      alert("Cart is empty");
      return;
    }

    const eligibleSelected = selectedItems.filter((pid) => {
      const item = items.find((it) => (it.product_id ?? it.productId) === pid);
      return item && !item.isExpired;
    });

    if (!eligibleSelected || eligibleSelected.length === 0) {
      alert("Please select at least one valid product to proceed to checkout. Expired items cannot be checked out.");
      return;
    }

    const sessionId =
      window.crypto && crypto.randomUUID
        ? crypto.randomUUID()
        : `cs_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

    dispatch(checkoutHoldRequest(eligibleSelected, sessionId));
  };

  const LoadingOverlay = ({ message }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)" }}>
      <div style={{ background: "#fff", borderRadius: 20, padding: "36px 48px", boxShadow: "0 24px 64px rgba(0,0,0,0.15)", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
        <div style={{
          width: 52, height: 52, borderRadius: "50%",
          border: "4px solid #d1fae5", borderTopColor: "#16a34a",
          animation: "spin 0.8s linear infinite"
        }} />
        <p style={{ color: "#16a34a", fontWeight: 700, fontSize: 16, letterSpacing: "0.01em" }}>{message}</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f0fdf4", paddingTop: 96, paddingBottom: 60, fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
      {cart.updateLoading && <LoadingOverlay message="Updating cart..." />}
      {checkout.loading && <LoadingOverlay message="Processing checkout..." />}

      <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 24px" }}>

        {/* Header */}
        <div style={{ marginBottom: 36, display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <ShoppingBag size={28} color="#16a34a" />
              <h1 style={{ fontSize: 28, fontWeight: 800, color: "#14532d", margin: 0, letterSpacing: "-0.02em" }}>Your Shopping Cart</h1>
            </div>
            <p style={{ color: "#6b7280", margin: 0, fontSize: 14 }}>
              {cart.items?.length || 0} items in your cart
            </p>
          </div>
          <button
            onClick={() => navigate("/products")}
            style={{ display: "flex", alignItems: "center", gap: 6, color: "#16a34a", background: "none", border: "1.5px solid #16a34a", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontWeight: 600, fontSize: 14, transition: "all 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.background = "#dcfce7"}
            onMouseLeave={e => e.currentTarget.style.background = "none"}
          >
            <ArrowLeft size={15} /> Continue Shopping
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 28, alignItems: "start" }}>

          {/* Cart Items */}
          <div>
            {!cart.items || cart.items.length === 0 ? (
              <div style={{ background: "#fff", borderRadius: 20, padding: "64px 40px", textAlign: "center", boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
                <ShoppingBag size={56} color="#d1fae5" style={{ marginBottom: 16 }} />
                <p style={{ color: "#9ca3af", fontSize: 18, fontWeight: 600 }}>Your cart is empty</p>
                <p style={{ color: "#d1d5db", fontSize: 14, marginTop: 8 }}>Add some products to get started!</p>
              </div>
            ) : (
              <div style={{ background: "#fff", borderRadius: 20, boxShadow: "0 2px 16px rgba(0,0,0,0.06)", overflow: "hidden" }}>

                {/* Select All Row */}
                <div style={{ padding: "16px 24px", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", gap: 12, background: "#f9fafb" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                    <div
                      onClick={toggleSelectAll}
                      style={{
                        width: 20, height: 20, borderRadius: 6,
                        border: isAllSelected ? "none" : "2px solid #d1d5db",
                        background: isAllSelected ? "#16a34a" : "#fff",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        cursor: "pointer", transition: "all 0.15s", flexShrink: 0
                      }}
                    >
                      {isAllSelected && <svg width="12" height="10" viewBox="0 0 12 10" fill="none"><path d="M1 5L4.5 8.5L11 1.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    </div>
                    <span style={{ fontWeight: 600, color: "#374151", fontSize: 14 }}>
                      Select All ({selectedCount}/{nonExpiredIds.length} items)
                      {items.some((it) => it.isExpired) && (
                        <span style={{ color: "#dc2626", fontWeight: 500, marginLeft: 6 }}>
                          ({items.filter((it) => it.isExpired).length} expired — remove to checkout)
                        </span>
                      )}
                    </span>
                  </label>

                  {selectedCount > 0 && (
                    <button
                      onClick={() => {
                        if (!cart?.items || cart.items.length === 0) { alert("Cart is empty"); return; }
                        if (window.confirm("Are you sure you want to clear your entire cart?")) {
                          const allProductIds = cart.items.map((item) => item.product_id?._id || item.product_id || item.productId);
                          dispatch(removeCartItemRequest(allProductIds));
                        }
                      }}
                      style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 5, color: "#ef4444", background: "none", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 500 }}
                    >
                      <Trash2 size={14} /> Remove All
                    </button>
                  )}
                </div>

                {/* Items */}
                <div>
                  {items.map((item, idx) => {
                    const pid = item.product_id ?? item.productId;
                    const expired = item.isExpired ?? false;
                    const name = item.product?.name ?? item.name ?? "Product";
                    const warning = item?.warning;
                    const image = item.product?.image ?? item.image ?? "../../../public/a1.png";
                    const price = item.product?.price ?? item.price ?? item.unit_price ?? 0;
                    const originalPrice = item.originalPrice ?? item.product?.originalPrice ?? null;
                    const isNearExpiry = item.isNearExpiry ?? item.product?.isNearExpiry ?? false;
                    const qty = item.quantity || 0;
                    const displayQty = editingQuantity[pid] !== undefined ? editingQuantity[pid] : qty;
                    const isSelected = selectedItems.includes(pid);
                    const qtyDigits = Math.max(1, String(displayQty ?? "").length);
                    const qtyInputWidth = `${Math.max(3, qtyDigits)}ch`;

                    return (
                      <div
                        key={pid}
                        style={{
                          padding: "20px 24px",
                          borderBottom: idx < items.length - 1 ? "1px solid #f3f4f6" : "none",
                          background: isSelected ? "linear-gradient(90deg, #f0fdf4 0%, #fff 100%)" : expired ? "#fef2f2" : "#fff",
                          transition: "background 0.2s",
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 16
                        }}
                      >
                        {/* Checkbox */}
                        <div
                          onClick={() => !expired && toggleSelectItem(pid, expired)}
                          style={{
                            width: 20, height: 20, borderRadius: 6, flexShrink: 0, marginTop: 4,
                            border: isSelected ? "none" : "2px solid #d1d5db",
                            background: isSelected ? "#16a34a" : "#fff",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            cursor: expired ? "not-allowed" : "pointer",
                            opacity: expired ? 0.5 : 1,
                            transition: "all 0.15s"
                          }}
                        >
                          {isSelected && <svg width="12" height="10" viewBox="0 0 12 10" fill="none"><path d="M1 5L4.5 8.5L11 1.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                        </div>

                        {/* Image */}
                        <div style={{ position: "relative", flexShrink: 0 }}>
                          <img
                            alt={name}
                            src={image}
                            style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 14, border: "1.5px solid #e5e7eb", display: "block" }}
                          />
                          {isNearExpiry && !expired && (
                            <span style={{
                              position: "absolute", top: -6, right: -6,
                              background: "#f59e0b", color: "#fff",
                              fontSize: 9, fontWeight: 700, padding: "2px 5px", borderRadius: 4,
                              textTransform: "uppercase", letterSpacing: "0.05em"
                            }}>Sale</span>
                          )}
                          {expired && (
                            <span style={{
                              position: "absolute", top: -6, right: -6,
                              background: "#dc2626", color: "#fff",
                              fontSize: 9, fontWeight: 700, padding: "2px 5px", borderRadius: 4,
                              textTransform: "uppercase", letterSpacing: "0.05em"
                            }}>Expired</span>
                          )}
                        </div>

                        {/* Info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h3 style={{ fontWeight: 700, color: "#111827", margin: "0 0 4px", fontSize: 15, lineHeight: 1.3 }}>{name}</h3>

                          {expired && (
                            <span style={{
                              display: "inline-block", fontSize: 11, fontWeight: 600, padding: "2px 10px", borderRadius: 20, marginBottom: 8,
                              background: "#fee2e2", color: "#dc2626"
                            }}>
                              Expired — please remove from cart
                            </span>
                          )}

                          {isNearExpiry && !expired && originalPrice != null && originalPrice > 0 && (
                            <span style={{ fontSize: 12, color: "#9ca3af", textDecoration: "line-through", display: "block", marginBottom: 2 }}>
                              Price/Kg: {formatPrice(originalPrice)}
                            </span>
                          )}
                          <span style={{ fontSize: 12, fontWeight: 700, color: "#fa2a05", display: "block", marginBottom: 2 }}>
                            Price/Kg: {formatPrice(price)}
                          </span>

                          {warning && !expired && (
                            <span style={{
                              display: "inline-block",
                              fontSize: 11, fontWeight: 600, padding: "2px 10px", borderRadius: 20, marginBottom: 8,
                              background: warning === "The product has been discontinued" || warning === "The product is temporarily out of stock"
                                ? "#fee2e2" : "#dcfce7",
                              color: warning === "The product has been discontinued" || warning === "The product is temporarily out of stock"
                                ? "#dc2626" : "#16a34a"
                            }}>
                              {warning}
                            </span>
                          )}

                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginTop: 8 }}>
                            {/* Qty control */}
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div style={{ display: "flex", alignItems: "center", border: "1.5px solid #e5e7eb", borderRadius: 10, overflow: "hidden", background: "#f9fafb" }}>
                                <button
                                  onClick={() => !expired && dispatch(updateCartItemRequest(pid, Math.max(1, Number(qty) - 1)))}
                                  disabled={expired}
                                  style={{
                                    width: 36, height: 36, background: "none", border: "none",
                                    cursor: expired ? "not-allowed" : "pointer",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    color: "#6b7280", opacity: expired ? 0.5 : 1
                                  }}
                                >
                                  <Minus size={14} />
                                </button>
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  pattern="[0-9]*"
                                  value={displayQty}
                                  onChange={(e) => !expired && handleQuantityChange(pid, e.target.value)}
                                  onBlur={() => !expired && handleQuantityBlur(pid, qty)}
                                  onKeyPress={(e) => handleQuantityKeyPress(e, pid, qty)}
                                  disabled={expired}
                                  style={{
                                    width: qtyInputWidth,
                                    minWidth: 40,
                                    textAlign: "center",
                                    border: "none",
                                    background: expired ? "#f3f4f6" : "transparent",
                                    fontWeight: 700, fontSize: 14, color: "#111827", outline: "none",
                                    fontVariantNumeric: "tabular-nums",
                                    MozAppearance: "textfield",
                                    WebkitAppearance: "none",
                                    appearance: "textfield"
                                  }}
                                />
                                <button
                                  onClick={() => !expired && dispatch(updateCartItemRequest(pid, Math.max(1, Number(qty) + 1)))}
                                  disabled={expired}
                                  style={{
                                    width: 36, height: 36, background: "none", border: "none",
                                    cursor: expired ? "not-allowed" : "pointer",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    color: "#6b7280", opacity: expired ? 0.5 : 1
                                  }}
                                >
                                  <Plus size={14} />
                                </button>
                              </div>
                              <span style={{ color: "#9ca3af", fontSize: 13 }}>Kg</span>
                              <button
                                onClick={() => { if (window.confirm("Remove this item from your cart?")) dispatch(removeCartItemRequest(pid)); }}
                                style={{ width: 34, height: 34, borderRadius: 8, border: "none", background: "#fff0f0", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#ef4444", transition: "background 0.15s" }}
                                onMouseEnter={e => e.currentTarget.style.background = "#fee2e2"}
                                onMouseLeave={e => e.currentTarget.style.background = "#fff0f0"}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>

                            {/* Price */}
                            <div style={{ fontWeight: 800, color: "#dc2626", fontSize: 17, letterSpacing: "-0.01em" }}>
                              {formatPrice(price * qty)}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div style={{ position: "sticky", top: 88 }}>
            <div style={{ background: "#fff", borderRadius: 20, boxShadow: "0 2px 24px rgba(0,0,0,0.08)", overflow: "hidden" }}>

              {/* Summary header */}
              <div style={{ background: "linear-gradient(135deg, #16a34a, #15803d)", padding: "20px 24px" }}>
                <h2 style={{ color: "#fff", fontWeight: 800, fontSize: 18, margin: 0, letterSpacing: "-0.01em" }}>Order Summary</h2>
              </div>

              <div style={{ padding: 24 }}>
                {/* Subtotal */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <span style={{ color: "#6b7280", fontSize: 14 }}>Subtotal ({selectedCount} items)</span>
                  <span style={{ fontWeight: 600, color: "#111827", fontSize: 15 }}>{formatPrice(calculateSubtotal())}</span>
                </div>

                {/* Discount */}
                {appliedDiscount && (
                  <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "12px 14px", marginBottom: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                      <Tag size={13} color="#16a34a" />
                      <span style={{ color: "#15803d", fontWeight: 600, fontSize: 13 }}>Mã: {appliedDiscount.code}</span>
                      <span style={{ marginLeft: "auto", color: "#16a34a", fontWeight: 700 }}>-{formatPrice(appliedDiscount.discountAmount)}</span>
                    </div>
                  </div>
                )}

                {/* Divider */}
                <div style={{ borderTop: "2px dashed #e5e7eb", margin: "16px 0" }} />

                {/* Total */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                  <span style={{ fontWeight: 700, color: "#111827", fontSize: 16 }}>Total</span>
                  <span style={{ fontWeight: 800, color: "#dc2626", fontSize: 22, letterSpacing: "-0.02em" }}>{formatPrice(calculateSubtotal())}</span>
                </div>

                {/* Checkout button */}
                <button
                  onClick={handleCheckout}
                  disabled={selectedCount === 0}
                  style={{
                    width: "100%",
                    padding: "15px 20px",
                    background: selectedCount === 0 ? "#d1d5db" : "linear-gradient(135deg, #16a34a, #15803d)",
                    color: "#fff",
                    border: "none",
                    borderRadius: 12,
                    fontWeight: 800,
                    fontSize: 15,
                    cursor: selectedCount === 0 ? "not-allowed" : "pointer",
                    letterSpacing: "0.01em",
                    transition: "all 0.2s",
                    boxShadow: selectedCount === 0 ? "none" : "0 4px 20px rgba(22,163,74,0.35)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8
                  }}
                  onMouseEnter={e => { if (selectedCount > 0) e.currentTarget.style.transform = "translateY(-1px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  <CheckCircle2 size={18} />
                  Checkout Now ({selectedCount} items)
                </button>

                {/* Trust badges */}
                <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 8 }}>
                  {[
                    { icon: "🛡️", text: "100% Secure Payment" },
                    { icon: "🚚", text: "Fast Nationwide Delivery" },
                  ].map((b) => (
                    <div key={b.text} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 15 }}>{b.icon}</span>
                      <span style={{ color: "#6b7280", fontSize: 12 }}>{b.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;