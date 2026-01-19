import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X, Calendar, Package, MapPin } from "lucide-react";
import { createHarvestBatchRequest } from "../../../redux/actions/supplierActions";
import { getSuppliersRequest } from "../../../redux/actions/supplierActions";
import { getProductsRequest } from "../../../redux/actions/productActions";

const CreateHarvestBatch = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { suppliers } = useSelector((state) => state.supplier);
  const { products } = useSelector((state) => state.product);
  const { createHarvestBatchLoading } = useSelector((state) => state.supplier);

  const [formData, setFormData] = useState({
    supplierId: "",
    productId: "",
    batchNumber: "",
    harvestDate: "",
    quantity: "",
    location: "",
    qualityGrade: "A",
    notes: "",
  });

  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      dispatch(getSuppliersRequest({ page: 1, limit: 1000, status: true }));
      dispatch(getProductsRequest({ page: 1, limit: 1000 }));
    }
  }, [dispatch, isOpen]);

  useEffect(() => {
    if (hasSubmitted && !createHarvestBatchLoading) {
      setHasSubmitted(false);
      setFormData({
        supplierId: "",
        productId: "",
        batchNumber: "",
        harvestDate: "",
        quantity: "",
        location: "",
        qualityGrade: "A",
        notes: "",
      });
      onClose();
    }
  }, [hasSubmitted, createHarvestBatchLoading, onClose]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.supplierId || !formData.productId || !formData.batchNumber || !formData.harvestDate || !formData.quantity) {
      return;
    }

    // ✅ BR-SUP-12: Validation harvestDate không được lớn hơn ngày hiện tại
    const harvestDateObj = new Date(formData.harvestDate);
    harvestDateObj.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (harvestDateObj > today) {
      alert("Ngày thu hoạch không được lớn hơn ngày hiện tại");
      return;
    }

    const quantityNum = parseInt(formData.quantity);
    if (isNaN(quantityNum) || quantityNum <= 0 || !Number.isInteger(quantityNum)) {
      alert("Số lượng phải là số nguyên lớn hơn 0");
      return;
    }

    // Clean data
    const cleanedData = {
      supplierId: formData.supplierId,
      productId: formData.productId,
      batchNumber: formData.batchNumber.trim(),
      harvestDate: formData.harvestDate,
      quantity: quantityNum,
      location: formData.location?.trim() || "",
      qualityGrade: formData.qualityGrade || "A",
      notes: formData.notes?.trim() || "",
    };

    setHasSubmitted(true);
    dispatch(createHarvestBatchRequest(cleanedData));
  };

  const handleCancel = () => {
    setHasSubmitted(false);
      setFormData({
        supplierId: "",
        productId: "",
        batchNumber: "",
        harvestDate: "",
        quantity: "",
        location: "",
        qualityGrade: "A",
        notes: "",
      });
    onClose();
  };

  // Filter suppliers: only ACTIVE and status true
  const activeSuppliers = suppliers?.filter(
    (s) => s.cooperationStatus === "ACTIVE" && s.status === true
  ) || [];

  // Filter products based on selected supplier
  const filteredProducts = products?.filter(product => {
    // Check if product.supplier is an ObjectId string or a populated object
    const productSupplierId = product.supplier?._id || product.supplier;
    return productSupplierId && productSupplierId.toString() === formData.supplierId;
  }) || [];

  if (!isOpen) return null;

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800 flex items-center space-x-2">
            <Package size={24} />
            <span>Create Harvest Batch</span>
          </h2>
          <button onClick={handleCancel} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Supplier <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.supplierId}
                  onChange={(e) => setFormData({ ...formData, supplierId: e.target.value, productId: "" })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  <option value="">Select supplier</option>
                  {activeSuppliers.map((supplier) => (
                    <option key={supplier._id} value={supplier._id}>
                      {supplier.name} ({supplier.type === "FARM" ? "Farm" : supplier.type === "COOPERATIVE" ? "Cooperative" : "Business"})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.productId}
                  onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                  disabled={!formData.supplierId}
                >
                  <option value="">Select product</option>
                  {filteredProducts.length === 0 && formData.supplierId && (
                    <option value="" disabled>No products for this supplier</option>
                  )}
                  {filteredProducts.map((product) => (
                    <option key={product._id} value={product._id}>
                      {product.name} {product.brand && `(${product.brand})`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Batch Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.batchNumber}
                  onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter batch number"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Harvest Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="date"
                    value={formData.harvestDate}
                    onChange={(e) => setFormData({ ...formData, harvestDate: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    max={today}
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity (KG) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter quantity in KG"
                min="1"
                step="1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center space-x-2">
                <MapPin size={16} />
                <span>Location</span>
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter harvest location"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quality Grade <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.qualityGrade}
                onChange={(e) => setFormData({ ...formData, qualityGrade: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              >
                <option value="A">Grade A (Best)</option>
                <option value="B">Grade B (Good)</option>
                <option value="C">Grade C (Fair)</option>
                <option value="D">Grade D (Poor)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                rows="3"
                placeholder="Enter notes"
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">{formData.notes.length}/500</p>
            </div>
          </div>

          <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createHarvestBatchLoading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createHarvestBatchLoading ? "Creating..." : "Create Harvest Batch"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateHarvestBatch;
