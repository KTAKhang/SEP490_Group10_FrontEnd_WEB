import { X, Package, CheckCircle, AlertCircle, TrendingDown, Eye } from "lucide-react";

const ReadProduct = ({ isOpen, onClose, product }) => {

  if (!isOpen || !product) return null;

  const getStockStatus = (product) => {
    if (product.stockStatus === "OUT_OF_STOCK" || product.onHandQuantity === 0) {
      return { label: "Out of stock", color: "bg-red-100 text-red-800", icon: AlertCircle };
    }
    if (product.onHandQuantity <= 10) {
      return { label: "Low stock", color: "bg-yellow-100 text-yellow-800", icon: TrendingDown };
    }
    return { label: "In stock", color: "bg-green-100 text-green-800", icon: CheckCircle };
  };

  const getReceivingStatus = (product) => {
    switch (product.receivingStatus) {
      case "NOT_RECEIVED":
        return { label: "Not received", color: "bg-gray-100 text-gray-800" };
      case "PARTIAL":
        return { label: "Partial", color: "bg-yellow-100 text-yellow-800" };
      case "RECEIVED":
        return { label: "Fully received", color: "bg-green-100 text-green-800" };
      default:
        return { label: "N/A", color: "bg-gray-100 text-gray-800" };
    }
  };

  const stockStatus = getStockStatus(product);
  const receivingStatus = getReceivingStatus(product);
  const StatusIcon = stockStatus.icon;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-gray-200/80 shadow-xl">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <Eye size={20} />
              </span>
              Product details
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>
          <div className="p-5 space-y-6">
            {/* Images */}
            {product.images && product.images.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Images</h3>
                <div className="grid grid-cols-4 gap-4">
                  {product.images.map((img, index) => (
                    <img
                      key={index}
                      src={img}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-32 object-cover rounded-xl border border-gray-200"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/200";
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Product name</p>
                <p className="text-base font-semibold text-gray-900">{product.name}</p>
              </div>
              <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Category</p>
                <p className="text-gray-900">{product.category?.name || "N/A"}</p>
              </div>
              <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Brand</p>
                <p className="text-gray-900">{product.brand || "Not set"}</p>
              </div>
              <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Price</p>
                <p className="text-base font-semibold text-emerald-600">
                  {new Intl.NumberFormat("en-US", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(product.price || 0)}
                </p>
              </div>
            </div>

            {/* Status */}
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Stock status</p>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium ${stockStatus.color}`}>
                  <StatusIcon size={16} />
                  {stockStatus.label}
                </span>
              </div>
              <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Receipt status</p>
                <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium ${receivingStatus.color}`}>
                  {receivingStatus.label}
                </span>
              </div>
              <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Visibility</p>
                <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium ${product.status ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-800"}`}>
                  {product.status ? "Visible" : "Hidden"}
                </span>
              </div>
            </div>

            {/* Inventory Info */}
            <div className="border-t border-gray-100 pt-5">
              <h3 className="text-sm font-semibold text-gray-800 mb-4">Inventory info</h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="rounded-xl border border-blue-200/60 bg-blue-50/50 p-4">
                  <p className="text-xs font-medium text-blue-700/80 mb-0.5">Planned</p>
                  <p className="text-xl font-bold text-blue-600">{product.plannedQuantity || 0}</p>
                </div>
                <div className="rounded-xl border border-purple-200/60 bg-purple-50/50 p-4">
                  <p className="text-xs font-medium text-purple-700/80 mb-0.5">Received</p>
                  <p className="text-xl font-bold text-purple-600">{product.receivedQuantity || 0}</p>
                </div>
                <div className="rounded-xl border border-emerald-200/60 bg-emerald-50/50 p-4">
                  <p className="text-xs font-medium text-emerald-700/80 mb-0.5">On-hand</p>
                  <p className="text-xl font-bold text-emerald-600">{product.onHandQuantity || 0}</p>
                </div>
                <div className="rounded-xl border border-amber-200/60 bg-amber-50/50 p-4">
                  <p className="text-xs font-medium text-amber-700/80 mb-0.5">Reserved</p>
                  <p className="text-xl font-bold text-amber-600">{product.reservedQuantity || 0}</p>
                </div>
                <div className="rounded-xl border border-teal-200/60 bg-teal-50/50 p-4">
                  <p className="text-xs font-medium text-teal-700/80 mb-0.5">Available</p>
                  <p className="text-xl font-bold text-teal-600">
                    {product.availableQuantity !== undefined 
                      ? product.availableQuantity 
                      : Math.max(0, (product.onHandQuantity || 0) - (product.reservedQuantity || 0))}
                  </p>
                </div>
              </div>

              {/* Expiry Date & Warehouse Entry Info */}
              {(product.expiryDate || product.expiryDateStr || product.warehouseEntryDate || product.warehouseEntryDateStr) && (
                <div className="mt-4 grid grid-cols-3 gap-4">
                  {(product.warehouseEntryDateStr || product.warehouseEntryDate) && (
                    <div className="rounded-xl border border-indigo-200/60 bg-indigo-50/50 p-4">
                      <p className="text-xs font-medium text-indigo-700/80 mb-0.5">Received date</p>
                      <p className="text-base font-semibold text-indigo-600">
                        {product.warehouseEntryDateStr 
                          ? product.warehouseEntryDateStr.split('-').reverse().join('/')
                          : new Date(product.warehouseEntryDate).toLocaleDateString("en-US")}
                      </p>
                    </div>
                  )}
                  {(product.expiryDateStr || product.expiryDate) && (
                    <div className={`p-4 rounded-lg ${
                      (() => {
                        // Use date string if available, otherwise parse Date
                        const expiryDateStr = product.expiryDateStr;
                        let expiry;
                        if (expiryDateStr) {
                          const [year, month, day] = expiryDateStr.split('-').map(Number);
                          expiry = new Date(year, month - 1, day);
                        } else {
                          expiry = new Date(product.expiryDate);
                        }
                        
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        expiry.setHours(0, 0, 0, 0);
                        const diffTime = expiry.getTime() - today.getTime();
                        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                        
                        if (diffDays < 0) return "bg-red-50";
                        if (diffDays <= 7) return "bg-yellow-50";
                        return "bg-green-50";
                      })()
                    }`}>
                      <p className="text-xs text-gray-600 mb-1">Expiry date</p>
                      <p className={`text-lg font-semibold ${
                        (() => {
                          const expiryDateStr = product.expiryDateStr;
                          let expiry;
                          if (expiryDateStr) {
                            const [year, month, day] = expiryDateStr.split('-').map(Number);
                            expiry = new Date(year, month - 1, day);
                          } else {
                            expiry = new Date(product.expiryDate);
                          }
                          
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          expiry.setHours(0, 0, 0, 0);
                          const diffTime = expiry.getTime() - today.getTime();
                          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                          
                          if (diffDays < 0) return "text-red-600";
                          if (diffDays <= 7) return "text-yellow-600";
                          return "text-green-600";
                        })()
                      }`}>
                        {product.expiryDateStr 
                          ? product.expiryDateStr.split('-').reverse().join('/')
                          : new Date(product.expiryDate).toLocaleDateString("en-US")}
                      </p>
                      {(() => {
                        const expiryDateStr = product.expiryDateStr;
                        let expiry;
                        if (expiryDateStr) {
                          const [year, month, day] = expiryDateStr.split('-').map(Number);
                          expiry = new Date(year, month - 1, day);
                        } else {
                          expiry = new Date(product.expiryDate);
                        }
                        
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        expiry.setHours(0, 0, 0, 0);
                        const diffTime = expiry.getTime() - today.getTime();
                        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                        
                        if (diffDays < 0) {
                          return <p className="text-xs text-red-600 mt-1">Expired</p>;
                        } else if (diffDays <= 7) {
                          return <p className="text-xs text-yellow-600 mt-1">{diffDays} days left</p>;
                        } else {
                          return <p className="text-xs text-gray-500 mt-1">{diffDays} days left</p>;
                        }
                      })()}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Descriptions */}
            {product.short_desc && (
              <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Short description</h3>
                <p className="text-gray-900 text-sm">{product.short_desc}</p>
              </div>
            )}

            {product.detail_desc && (
              <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Detailed description</h3>
                <p className="text-gray-900 text-sm whitespace-pre-wrap">{product.detail_desc}</p>
              </div>
            )}

            {/* Timestamps */}
            <div className="border-t border-gray-100 pt-4 grid grid-cols-2 gap-4 text-sm text-gray-500">
              <div>
                <p>Created: {product.createdAt ? new Date(product.createdAt).toLocaleString("en-US") : "N/A"}</p>
              </div>
              <div>
                <p>Last updated: {product.updatedAt ? new Date(product.updatedAt).toLocaleString("en-US") : "N/A"}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end p-5 border-t border-gray-100 bg-gray-50/50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-gray-600 text-white rounded-xl text-sm font-medium hover:bg-gray-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ReadProduct;
