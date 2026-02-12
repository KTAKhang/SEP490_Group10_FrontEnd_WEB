import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X, Package, CheckCircle, AlertCircle, TrendingDown, Eye, Edit } from "lucide-react";
import { toast } from "react-toastify";
import { updateProductExpiryDateRequest } from "../../../redux/actions/warehouseActions";


const ReadProduct = ({ isOpen, onClose, product }) => {
  const dispatch = useDispatch();
  const { updateProductExpiryDateLoading, updateProductExpiryDateError } = useSelector(
    (state) => state.warehouse
  );
  const [showUpdateExpiryModal, setShowUpdateExpiryModal] = useState(false);
  const [expiryDate, setExpiryDate] = useState("");


  // Reset modal state when product changes
  useEffect(() => {
    if (product && product.expiryDate) {
      // Format date to YYYY-MM-DD for input
      const date = new Date(product.expiryDate);
      setExpiryDate(date.toISOString().split('T')[0]);
    } else {
      setExpiryDate("");
    }
  }, [product]);


  // Close update modal after successful update
  useEffect(() => {
    if (!updateProductExpiryDateLoading && !updateProductExpiryDateError && showUpdateExpiryModal) {
      // Update was successful, show toast and close modal
      toast.success("Expiry date updated successfully!");
      setShowUpdateExpiryModal(false);
      // The product will be updated in Redux state automatically
    }
    // Error toast is shown by saga; avoid duplicate toast here
  }, [updateProductExpiryDateLoading, updateProductExpiryDateError, showUpdateExpiryModal]);


  const handleUpdateExpiryDate = () => {
    if (!expiryDate) {
      toast.error("Please select expiry date");
      return;
    }


    // Validate expiryDate (must be at least tomorrow)
    const selectedDate = new Date(expiryDate);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);
   
    if (selectedDate < tomorrow) {
      toast.error(`Expiry date must be at least ${tomorrow.toISOString().split('T')[0]} (tomorrow)`);
      return;
    }


    dispatch(updateProductExpiryDateRequest(product._id, expiryDate));
  };


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
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800 flex items-center space-x-2">
            <Eye size={24} />
            <span>Product details</span>
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>
        <div className="p-6 space-y-6">
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
                    className="w-full h-32 object-cover rounded-lg border"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/200";
                    }}
                  />
                ))}
              </div>
            </div>
          )}


          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Product name</h3>
              <p className="text-lg font-semibold text-gray-900">{product.name}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Category</h3>
              <p className="text-gray-900">{product.category?.name || "N/A"}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Brand</h3>
              <p className="text-gray-900">{product.brand || "N/A"}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Price</h3>
              <p className="text-lg font-semibold text-green-600">
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "VND",
                }).format(product.price || 0)}
              </p>
            </div>
          </div>


          {/* Status */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Stock status</h3>
              <span
                className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${stockStatus.color}`}
              >
                <StatusIcon size={16} />
                <span>{stockStatus.label}</span>
              </span>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Receiving status</h3>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${receivingStatus.color}`}
              >
                {receivingStatus.label}
              </span>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Visibility</h3>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  product.status
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {product.status ? "Visible" : "Hidden"}
              </span>
            </div>
          </div>


          {/* Inventory Info */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-4">Stock information</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Planned</p>
                <p className="text-2xl font-bold text-blue-600">{product.plannedQuantity || 0}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Received</p>
                <p className="text-2xl font-bold text-purple-600">{product.receivedQuantity || 0}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">On hand (available)</p>
                <p className="text-2xl font-bold text-green-600">{product.onHandQuantity || 0}</p>
              </div>
            </div>


            {/* Expiry Date & Warehouse Entry Info */}
            {(product.expiryDate || product.warehouseEntryDate || product.shelfLifeDays) && (
              <div className="mt-4 grid grid-cols-3 gap-4">
                {product.warehouseEntryDate && (
                  <div className="bg-indigo-50 p-4 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Warehouse entry date</p>
                    <p className="text-lg font-semibold text-indigo-600">
                      {new Date(product.warehouseEntryDate).toLocaleDateString("en-US")}
                    </p>
                  </div>
                )}
                {product.expiryDate && (
                  <div className={`p-4 rounded-lg ${
                    (() => {
                      const expiry = new Date(product.expiryDate);
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      expiry.setHours(0, 0, 0, 0);
                      const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
                      if (diffDays < 0) return "bg-red-50";
                      if (diffDays <= 7) return "bg-yellow-50";
                      return "bg-green-50";
                    })()
                  }`}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs text-gray-600">Expiry date</p>
                      {product.warehouseEntryDate && (
                        <button
                          onClick={() => setShowUpdateExpiryModal(true)}
                          className="text-xs text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                          title="Update expiry date"
                        >
                          <Edit size={12} />
                          <span>Edit</span>
                        </button>
                      )}
                    </div>
                    <p className={`text-lg font-semibold ${
                      (() => {
                        const expiry = new Date(product.expiryDate);
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        expiry.setHours(0, 0, 0, 0);
                        const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
                        if (diffDays < 0) return "text-red-600";
                        if (diffDays <= 7) return "text-yellow-600";
                        return "text-green-600";
                      })()
                    }`}>
                      {new Date(product.expiryDate).toLocaleDateString("en-US")}
                    </p>
                    {(() => {
                      const expiry = new Date(product.expiryDate);
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      expiry.setHours(0, 0, 0, 0);
                      const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
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
                {product.shelfLifeDays && (
                  <div className="bg-cyan-50 p-4 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Shelf life</p>
                    <p className="text-lg font-semibold text-cyan-600">
                      {product.shelfLifeDays} days
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>


          {/* Descriptions */}
          {product.short_desc && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Short description</h3>
              <p className="text-gray-900">{product.short_desc}</p>
            </div>
          )}


          {product.detail_desc && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Detail description</h3>
              <p className="text-gray-900 whitespace-pre-wrap">{product.detail_desc}</p>
            </div>
          )}


          {/* Timestamps */}
          <div className="border-t pt-4 grid grid-cols-2 gap-4 text-sm text-gray-500">
            <div>
              <p>Created: {product.createdAt ? new Date(product.createdAt).toLocaleString("en-US") : "N/A"}</p>
            </div>
            <div>
              <p>Last updated: {product.updatedAt ? new Date(product.updatedAt).toLocaleString("en-US") : "N/A"}</p>
            </div>
          </div>
        </div>
          <div className="flex items-center justify-end p-6 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>


      {/* Update Expiry Date Modal */}
      {showUpdateExpiryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">Update expiry date</h2>
              <button
                onClick={() => setShowUpdateExpiryModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product
                </label>
                <input
                  type="text"
                  value={product.name}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  min={(() => {
                    const tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    return tomorrow.toISOString().split('T')[0];
                  })()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Select expiry date (minimum from tomorrow)
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end space-x-3 p-6 border-t">
              <button
                onClick={() => setShowUpdateExpiryModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateExpiryDate}
                disabled={updateProductExpiryDateLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updateProductExpiryDateLoading ? "Updating..." : "Update"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};


export default ReadProduct;




