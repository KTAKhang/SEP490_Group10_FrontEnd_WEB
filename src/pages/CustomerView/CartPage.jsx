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

  const [selectedItems, setSelectedItems] = useState([]);
  const [editingQuantity, setEditingQuantity] = useState({});

  const navigate = useNavigate();

  const checkout = useSelector((state) => state.checkout || {});

  const appliedDiscount = null;
  const totalItems = items.reduce((sum, item) => sum + (item.quantity || 0), 0);

  useEffect(() => {
    dispatch(fetchCartRequest());
  }, [dispatch]);

  useEffect(() => {
    if (!items || items.length === 0) {
      setSelectedItems([]);
      return;
    }

    const preselected = items
      .filter((it) => it.selected === true)
      .map((it) => it.product_id ?? it.productId);

    if (preselected.length > 0) {
      setSelectedItems(preselected);
    } else {
      setSelectedItems(items.map((it) => it.product_id ?? it.productId));
    }
  }, [JSON.stringify(items)]);

  const toggleSelectItem = (productId) => {
    setSelectedItems((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId],
    );
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === items.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(items.map((it) => it.product_id ?? it.productId));
    }
  };

  // Handle quantity input change
  const handleQuantityChange = (productId, value) => {
    setEditingQuantity((prev) => ({
      ...prev,
      [productId]: value,
    }));
  };

  // Handle quantity input blur (when user clicks away)
  const handleQuantityBlur = (productId, currentQty) => {
    const newQty = editingQuantity[productId];

    if (newQty !== undefined && newQty !== "") {
      const parsedQty = parseInt(newQty, 10);

      // Validate quantity
      if (!isNaN(parsedQty) && parsedQty > 0 && parsedQty !== currentQty) {
        dispatch(updateCartItemRequest(productId, parsedQty));
      }
    }

    // Clear editing state
    setEditingQuantity((prev) => {
      const newState = { ...prev };
      delete newState[productId];
      return newState;
    });
  };

  // Handle Enter key press in quantity input
  const handleQuantityKeyPress = (e, productId, currentQty) => {
    if (e.key === "Enter") {
      e.target.blur(); // Trigger blur event
    }
  };

  const isAllSelected =
    selectedItems.length === cart.items?.length && cart.items?.length > 0;

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN").format(price) + "₫";
  };

  const calculateSubtotal = () => {
    return items
      .filter((item) =>
        selectedItems.includes(item.product_id ?? item.productId),
      )
      .reduce((total, item) => {
        const price = item.product?.price ?? item.price ?? item.unit_price ?? 0;
        return total + price * (item.quantity || 0);
      }, 0);
  };

  const selectedCount = selectedItems.length;

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
    } else if (
      checkout.message &&
      localStorage.getItem("checkout_session_id")
    ) {
      // assume this is a cancel message or other terminal state that cleared session
      localStorage.removeItem("checkout_session_id");
    }
  }, [checkout.checkout_session_id, checkout.message, navigate]);

  const handleCheckout = () => {
    if (!items || items.length === 0) {
      alert("Cart is empty");
      return;
    }

    if (!selectedItems || selectedItems.length === 0) {
      alert("Please select at least one product to proceed to checkout");
      return;
    }

    const sessionId =
      window.crypto && crypto.randomUUID
        ? crypto.randomUUID()
        : `cs_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

    dispatch(checkoutHoldRequest(selectedItems, sessionId));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 mt-20">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-green-600 mb-2">
            Your shopping cart
          </h1>
          <p className="text-gray-600">
            {cart.items?.length} products in the shopping cart
          </p>
        </div>
         {cart.updateLoading && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center gap-4">
              <div className="w-14 h-14 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
              <p className="text-green-600 font-semibold text-lg">
                Processing Cart Updated...
              </p>
            </div>
          </div>
        )}
        {checkout.loading && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center gap-4">
              <div className="w-14 h-14 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
              <p className="text-green-600 font-semibold text-lg">
                Processing Checkout...
              </p>
            </div>
          </div>
        )}

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
                  ({selectedCount}/{cart.items?.length} products selected)
                </h2>
              </div>
              <div className="divide-y divide-gray-100">
                {items.map((item) => {
                  const pid = item.product_id ?? item.productId;
                  const name = item.product?.name ?? item.name ?? "Product";
                  const warning = item?.warning;
                  const image =
                    item.product?.image ??
                    item.image ??
                    "../../../public/a1.png";
                  const price =
                    item.product?.price ?? item.price ?? item.unit_price ?? 0;
                  const originalPrice =
                    item.originalPrice ?? item.product?.originalPrice ?? null;
                  const isNearExpiry =
                    item.isNearExpiry ?? item.product?.isNearExpiry ?? false;
                  const qty = item.quantity || 0;
                  const displayQty =
                    editingQuantity[pid] !== undefined
                      ? editingQuantity[pid]
                      : qty;

                  return (
                    <div
                      key={pid}
                      className={`p-6 transition-colors ${
                        selectedItems.includes(pid)
                          ? "bg-blue-50/30"
                          : "bg-white"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(pid)}
                          onChange={() => toggleSelectItem(pid)}
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
                          </h3>
                          {isNearExpiry && (
                            <span className="inline-block text-xs font-medium px-2 py-0.5 rounded bg-amber-100 text-amber-800 mb-2">
                              Near expiry - Special price
                            </span>
                          )}
                          {isNearExpiry &&
                            originalPrice != null &&
                            originalPrice > 0 && (
                              <span className="text-sm text-gray-500 line-through block mb-1">
                                Original price: {formatPrice(originalPrice)}
                              </span>
                            )}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center border border-gray-200 rounded-lg">
                                <button
                                  onClick={() => {
                                    const newQty = Math.max(1, Number(qty) - 1);
                                    dispatch(
                                      updateCartItemRequest(pid, newQty),
                                    );
                                  }}
                                  className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition-colors"
                                >
                                  <Minus className="w-4 h-4 text-gray-600" />
                                </button>
                                <input
                                  type="number"
                                  min="1"
                                  value={displayQty}
                                  onChange={(e) =>
                                    handleQuantityChange(pid, e.target.value)
                                  }
                                  onBlur={() => handleQuantityBlur(pid, qty)}
                                  onKeyPress={(e) =>
                                    handleQuantityKeyPress(e, pid, qty)
                                  }
                                  className="w-12 text-center font-medium border-0 focus:outline-none focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                                <button
                                  onClick={() => {
                                    const newQty = Math.max(1, Number(qty) + 1);
                                    dispatch(
                                      updateCartItemRequest(pid, newQty),
                                    );
                                  }}
                                  className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition-colors"
                                >
                                  <Plus className="w-4 h-4 text-gray-600" />
                                </button>
                              </div>
                              <button
                                onClick={() => {
                                  if (
                                    window.confirm(
                                      "Remove this product from your cart?",
                                    )
                                  ) {
                                    dispatch(removeCartItemRequest(pid));
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
                                    warning ===
                                    "The product has been discontinued"
                                      ? "bg-red-100 text-red-700"
                                      : warning ===
                                          "The product is temporarily out of stock"
                                        ? "bg-red-100 text-red-700"
                                        : "bg-green-100 text-green-700"
                                  }`}
                                >
                                  {warning}
                                </div>
                              )}
                              <div className="font-bold text-red-600 text-lg">
                                {formatPrice(price * qty)}
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
              <button
                onClick={() => navigate("/products")}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Continue shopping
              </button>
              <button
                onClick={() => {
                  if (!cart?.items || cart.items.length === 0) {
                    alert("The shopping cart is empty");
                    return;
                  }

                  if (
                    window.confirm(
                      "Are you sure you want to clear your entire shopping cart?",
                    )
                  ) {
                    const allProductIds = cart.items.map(
                      (item) => item.product_id._id || item.product_id,
                    );

                    dispatch(removeCartItemRequest(allProductIds));
                  }
                }}
                className="flex items-center gap-2 text-red-600 hover:text-red-700 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete alls
              </button>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-16">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Order summary
              </h2>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Estimate:</span>
                  <span className="font-medium">
                    {formatPrice(calculateSubtotal())}
                  </span>
                </div>

                {appliedDiscount && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-green-700 font-medium">
                        Discount ({appliedDiscount.code}):
                      </span>
                      <span className="text-green-600 font-bold">
                        -{formatPrice(appliedDiscount.discountAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-green-700 font-medium">
                        Total after reduction:
                      </span>
                      <span className="text-green-600 font-bold">
                        {formatPrice(appliedDiscount.totalAfterDiscount)}
                      </span>
                    </div>
                  </div>
                )}

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">
                      Total:
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
