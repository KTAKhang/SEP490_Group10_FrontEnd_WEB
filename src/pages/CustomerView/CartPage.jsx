import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Minus,
  Plus,
  Trash2,
  ArrowLeft,
  Shield,
  Truck,
  Headphones,
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

  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [selectedBasketIds, setSelectedBasketIds] = useState([]);
  const [editingQuantity, setEditingQuantity] = useState({});

  const navigate = useNavigate();

  const checkout = useSelector((state) => state.checkout || {});

  const appliedDiscount = null;
  const totalItems = items.reduce((sum, item) => sum + (item.quantity || 0), 0);

  useEffect(() => {
    dispatch(fetchCartRequest());
  }, [dispatch]);

  const getItemId = (item) => {
    if (item.item_type === "FRUIT_BASKET") return item.fruit_basket_id?._id ?? item.fruit_basket_id;
    return item.product_id?._id ?? item.product_id ?? item.productId;
  };

  const isItemSelected = (item) => {
    const id = getItemId(item);
    if (item.item_type === "FRUIT_BASKET") return selectedBasketIds.includes(id);
    return selectedProductIds.includes(id);
  };

  useEffect(() => {
    if (!items || items.length === 0) {
      setSelectedProductIds([]);
      setSelectedBasketIds([]);
      return;
    }
    const pIds = items.filter((it) => it.item_type === "PRODUCT").map((it) => getItemId(it));
    const bIds = items.filter((it) => it.item_type === "FRUIT_BASKET").map((it) => getItemId(it));
    setSelectedProductIds((prev) => {
      const next = prev.filter((id) => pIds.includes(id));
      return next.length > 0 ? next : pIds;
    });
    setSelectedBasketIds((prev) => {
      const next = prev.filter((id) => bIds.includes(id));
      return next.length > 0 ? next : bIds;
    });
  }, [items?.length]);

  const toggleSelectItem = (item) => {
    const id = getItemId(item);
    if (item.item_type === "FRUIT_BASKET") {
      setSelectedBasketIds((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      );
    } else {
      setSelectedProductIds((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      );
    }
  };

  const toggleSelectAll = () => {
    const pIds = items.filter((it) => it.item_type === "PRODUCT").map((it) => getItemId(it));
    const bIds = items.filter((it) => it.item_type === "FRUIT_BASKET").map((it) => getItemId(it));
    const allSelected = selectedProductIds.length === pIds.length && selectedBasketIds.length === bIds.length && (pIds.length > 0 || bIds.length > 0);
    if (allSelected) {
      setSelectedProductIds([]);
      setSelectedBasketIds([]);
    } else {
      setSelectedProductIds(pIds);
      setSelectedBasketIds(bIds);
    }
  };

  // Handle quantity input change
  const handleQuantityChange = (productId, value) => {
    setEditingQuantity(prev => ({
      ...prev,
      [productId]: value
    }));
  };

  // Handle quantity input blur (when user clicks away) – dùng cho cả sản phẩm và giỏ trái cây
  const handleQuantityBlur = (itemId, currentQty, isBasket) => {
    const newQty = editingQuantity[itemId];

    if (newQty !== undefined && newQty !== "") {
      const parsedQty = parseInt(newQty, 10);

      if (!isNaN(parsedQty) && parsedQty >= 0 && parsedQty !== currentQty) {
        if (isBasket) {
          dispatch(updateCartItemRequest({ fruit_basket_id: itemId, quantity: parsedQty }));
        } else {
          dispatch(updateCartItemRequest(itemId, parsedQty));
        }
      }
    }

    setEditingQuantity((prev) => {
      const newState = { ...prev };
      delete newState[itemId];
      return newState;
    });
  };

  // Handle Enter key press in quantity input
  const handleQuantityKeyPress = (e, itemId, currentQty) => {
    if (e.key === "Enter") {
      e.target.blur();
    }
  };

  const selectedCount = selectedProductIds.length + selectedBasketIds.length;
  const isAllSelected =
    selectedCount === cart.items?.length && cart.items?.length > 0;

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN").format(price) + "₫";
  };

  const calculateSubtotal = () => {
    return items
      .filter((item) => isItemSelected(item))
      .reduce((total, item) => total + (item.subtotal ?? (item.price || 0) * (item.quantity || 0)), 0);
  };

  // If user previously started a checkout, automatically go to checkout page
  useEffect(() => {
    const existingSession = localStorage.getItem("checkout_session_id");
    if (existingSession) {
      navigate("/customer/checkout");
    }
  }, [navigate]);

  // Watch checkout reducer: when hold is successful it will populate checkout_session_id
  useEffect(() => {
    if (checkout.checkout_session_id) {
      localStorage.setItem("checkout_session_id", checkout.checkout_session_id);
      navigate("/customer/checkout");
    } else if (checkout.message && localStorage.getItem("checkout_session_id")) {
      // assume this is a cancel message or other terminal state that cleared session
      localStorage.removeItem("checkout_session_id");
    }
  }, [checkout.checkout_session_id, checkout.message, navigate]);

  const handleCheckout = () => {
    if (!items || items.length === 0) {
      alert("Giỏ hàng đang trống");
      return;
    }
    if (selectedCount === 0) {
      alert("Vui lòng chọn ít nhất một sản phẩm hoặc giỏ trái cây để thanh toán");
      return;
    }
    const sessionId = (window.crypto && crypto.randomUUID)
      ? crypto.randomUUID()
      : `cs_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    dispatch(checkoutHoldRequest(selectedProductIds, selectedBasketIds, sessionId));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 mt-20">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-green-600 mb-2">
            Giỏ hàng của bạn
          </h1>
          <p className="text-gray-600">
            {cart.items?.length} sản phẩm trong giỏ hàng
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex items-center gap-4">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={toggleSelectAll}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                />
                <h2 className="text-xl font-bold text-gray-900">
                  Sản phẩm ({selectedCount}/{cart.items?.length} được chọn)
                </h2>
              </div>
              <div className="divide-y divide-gray-100">
                {items.map((item) => {
                  const itemId = getItemId(item);
                  const isBasket = item.item_type === "FRUIT_BASKET";
                  const name = item.product?.name ?? item.name ?? (isBasket ? "Giỏ trái cây" : "Sản phẩm");
                  const warning = item?.warning;
                  const image =
                    item.product?.image ??
                    item.image ??
                    "../../../public/a1.png";
                  const price = item.price ?? item.unit_price ?? 0;
                  const qty = item.quantity || 0;
                  const subtotalItem = item.subtotal ?? price * qty;
                  const displayQty = editingQuantity[itemId] !== undefined ? editingQuantity[itemId] : qty;

                  return (
                    <div
                      key={isBasket ? `b_${itemId}` : `p_${itemId}`}
                      className={`p-6 transition-colors ${
                        isItemSelected(item) ? "bg-blue-50/30" : "bg-white"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <input
                          type="checkbox"
                          checked={isItemSelected(item)}
                          onChange={() => toggleSelectItem(item)}
                          className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer mt-1"
                        />
                        <div className="flex-shrink-0">
                          <img
                            alt={name}
                            className="w-20 h-20 object-cover rounded-lg"
                            src={image}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 mb-2">
                            {name}
                            {isBasket && (
                              <span className="ml-2 text-xs font-normal text-gray-500">
                                (Giỏ trái cây)
                              </span>
                            )}
                          </h3>
                          {isBasket && item.total_weight_gram != null && (
                            <p className="text-xs text-gray-500 mb-1">
                              Khối lượng: {Number(item.total_weight_gram).toLocaleString()} g
                            </p>
                          )}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center border border-gray-200 rounded-lg">
                                <button
                                  onClick={() => {
                                    const newQty = Math.max(0, Number(qty) - 1);
                                    if (isBasket) {
                                      dispatch(updateCartItemRequest({ fruit_basket_id: itemId, quantity: newQty }));
                                    } else {
                                      dispatch(updateCartItemRequest(itemId, newQty));
                                    }
                                  }}
                                  className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition-colors"
                                >
                                  <Minus className="w-4 h-4 text-gray-600" />
                                </button>
                                <input
                                  type="number"
                                  min={isBasket ? "0" : "1"}
                                  value={displayQty}
                                  onChange={(e) => handleQuantityChange(itemId, e.target.value)}
                                  onBlur={() => handleQuantityBlur(itemId, qty, isBasket)}
                                  onKeyPress={(e) => handleQuantityKeyPress(e, itemId, qty)}
                                  className="w-12 text-center font-medium border-0 focus:outline-none focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                                <button
                                  onClick={() => {
                                    const newQty = Math.max(1, Number(qty) + 1);
                                    if (isBasket) {
                                      dispatch(updateCartItemRequest({ fruit_basket_id: itemId, quantity: newQty }));
                                    } else {
                                      dispatch(updateCartItemRequest(itemId, newQty));
                                    }
                                  }}
                                  className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition-colors"
                                >
                                  <Plus className="w-4 h-4 text-gray-600" />
                                </button>
                              </div>
                              <button
                                onClick={() => {
                                  if (window.confirm("Xóa khỏi giỏ hàng?")) {
                                    dispatch(
                                      isBasket
                                        ? removeCartItemRequest([], [itemId])
                                        : removeCartItemRequest([itemId], [])
                                    );
                                  }
                                }}
                                className="w-10 h-10 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="text-right">
                              {warning && (
                                <div
                                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-2 ${
                                    warning === "Sản phẩm đã ngừng bán" || warning === "Giỏ trái cây đã ngừng bán"
                                      ? "bg-red-100 text-red-700"
                                      : warning === "Sản phẩm tạm hết hàng"
                                        ? "bg-red-100 text-red-700"
                                        : "bg-green-100 text-green-700"
                                  }`}
                                >
                                  {warning}
                                </div>
                              )}
                              <div className="font-bold text-red-600 text-lg">
                                {formatPrice(subtotalItem)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="mt-6 flex justify-between">
              <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Tiếp tục mua sắm
              </button>
              <button
                onClick={() => {
                  if (!cart?.items || cart.items.length === 0) {
                    alert("Giỏ hàng đang trống");
                    return;
                  }

                  if (
                    window.confirm("Bạn có chắc muốn xóa toàn bộ giỏ hàng?")
                  ) {
                    const productIds = (cart.items || [])
                      .filter((i) => i.item_type === "PRODUCT")
                      .map((i) => i.product_id?._id ?? i.product_id);
                    const basketIds = (cart.items || [])
                      .filter((i) => i.item_type === "FRUIT_BASKET")
                      .map((i) => i.fruit_basket_id?._id ?? i.fruit_basket_id);
                    dispatch(removeCartItemRequest(productIds, basketIds));
                  }
                }}
                className="flex items-center gap-2 text-red-600 hover:text-red-700 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Xóa tất cả
              </button>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-16">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Tổng kết đơn hàng
              </h2>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tạm tính:</span>
                  <span className="font-medium">
                    {formatPrice(calculateSubtotal())}
                  </span>
                </div>

                {appliedDiscount && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-green-700 font-medium">
                        Giảm giá ({appliedDiscount.code}):
                      </span>
                      <span className="text-green-600 font-bold">
                        -{formatPrice(appliedDiscount.discountAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-green-700 font-medium">
                        Tổng sau giảm:
                      </span>
                      <span className="text-green-600 font-bold">
                        {formatPrice(appliedDiscount.totalAfterDiscount)}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-gray-600">Phí vận chuyển:</span>
                  <span className="font-medium">Miễn phí</span>
                </div>
                <div className="text-sm text-green-600 bg-green-50 p-3 rounded-lg flex items-center">
                  <Truck className="w-4 h-4 mr-2" />
                  Miễn phí vận chuyển cho toàn bộ đơn hàng
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">
                      Tổng cộng:
                    </span>
                    <span className="text-2xl font-bold text-red-600">
                      {formatPrice(calculateSubtotal())}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleCheckout}
                  className="w-full bg-green-600 text-white py-4 rounded-lg hover:bg-green-800 transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={selectedCount === 0}
                >
                  Checkout now ({selectedCount} products)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;