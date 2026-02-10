import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X, Calendar, Package, MapPin } from "lucide-react";
import axios from "axios";
import apiClient from "../../../utils/axiosConfig";
import { createHarvestBatchRequest } from "../../../redux/actions/supplierActions";
import { getSuppliersRequest } from "../../../redux/actions/supplierActions";
import { getProductsRequest } from "../../../redux/actions/productActions";


const API_BASE = "https://provinces.open-api.vn/api/v2";


const CreateHarvestBatch = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { suppliers } = useSelector((state) => state.supplier);
  const { products } = useSelector((state) => state.product);
  const { createHarvestBatchLoading, createHarvestBatchError } = useSelector((state) => state.supplier);


  const [formData, setFormData] = useState({
    supplierId: "",
    productId: "",
    fruitTypeId: "",
    isPreOrderBatch: false,
    batchNumber: "",
    harvestDate: "",
    location: "",
    city: "",
    ward: "",
    notes: "",
  });
  const [preOrderFruitTypes, setPreOrderFruitTypes] = useState([]);


  const [provinces, setProvinces] = useState([]);
  const [wards, setWards] = useState([]);
  const [icity, setIcity] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);


  useEffect(() => {
    if (isOpen) {
      dispatch(getSuppliersRequest({ page: 1, limit: 1000, status: true }));
      dispatch(getProductsRequest({ page: 1, limit: 1000 }));
      apiClient.get("/admin/preorder/demand", { params: { limit: 500 } })
        .then((r) => {
          const data = r.data?.data || [];
          const seen = new Set();
          const list = data
            .filter((d) => {
              const id = d.fruitTypeId?._id || d.fruitTypeId;
              if (!id || seen.has(String(id))) return false;
              seen.add(String(id));
              return true;
            })
            .map((d) => ({ id: d.fruitTypeId?._id || d.fruitTypeId, name: d.fruitTypeName || "—" }));
          setPreOrderFruitTypes(list);
        })
        .catch(() => setPreOrderFruitTypes([]));
    } else {
      setHasSubmitted(false);
      setFormData({
        supplierId: "",
        productId: "",
        fruitTypeId: "",
        isPreOrderBatch: false,
        batchNumber: "",
        harvestDate: "",
        location: "",
        city: "",
        ward: "",
        notes: "",
      });
      setIcity("");
    }
  }, [dispatch, isOpen]);


  useEffect(() => {
    axios
      .get(`${API_BASE}/p/`)
      .then((res) => setProvinces(res.data))
      .catch((err) => console.error("Error loading provinces:", err));
  }, []);


  useEffect(() => {
    if (!formData.city) {
      setWards([]);
      setFormData((prev) => ({ ...prev, ward: "" }));
      setIcity("");
      return;
    }


    axios
      .get(`${API_BASE}/w/`)
      .then((res) => {
        const filtered = res.data.filter(
          (ward) => ward.province_code === Number(formData.city),
        );
        setWards(filtered);
      })
      .catch((err) => console.error("Error loading wards:", err));
  }, [formData.city]);


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "city") {
      const selectedProvince = provinces.find((p) => p.code === Number(value));
      setIcity(selectedProvince ? selectedProvince.name : "");
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };


  useEffect(() => {
    // Only close modal if submission was successful (no error) and loading is done
    if (hasSubmitted && !createHarvestBatchLoading && !createHarvestBatchError) {
      setHasSubmitted(false);
      setFormData({
        supplierId: "",
        productId: "",
        fruitTypeId: "",
        isPreOrderBatch: false,
        batchNumber: "",
        harvestDate: "",
        location: "",
        city: "",
        ward: "",
        notes: "",
      });
      setIcity("");
      onClose();
    } else if (hasSubmitted && !createHarvestBatchLoading && createHarvestBatchError) {
      // Reset hasSubmitted on error so user can try again
      setHasSubmitted(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasSubmitted, createHarvestBatchLoading, createHarvestBatchError]);


  const handleSubmit = (e) => {
    e.preventDefault();
    const isPreOrder = formData.isPreOrderBatch === true;
    if (!formData.supplierId || !formData.harvestDate) {
      return;
    }
    if (isPreOrder) {
      if (!formData.fruitTypeId) {
        alert("Please select a fruit type for pre-order harvest batch.");
        return;
      }
    } else {
      if (!formData.productId) {
        alert("Please select a product from the supplier.");
        return;
      }
    }
    const batchNumberTrimmed = formData.batchNumber?.trim() || "";
    if (!batchNumberTrimmed) {
      alert("Harvest Batch Number is required and cannot be empty");
      return;
    }
    const harvestDateObj = new Date(formData.harvestDate);
    harvestDateObj.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (harvestDateObj > today) {
      alert("Harvest date cannot be later than today");
      return;
    }
    const locationLine = formData.location?.trim() || "";
    const wardName = formData.ward?.toString().trim() || "";
    const provinceName = icity?.toString().trim() || "";
    const locationParts = [locationLine, wardName, provinceName].filter(Boolean);
    const cleanedData = {
      supplierId: formData.supplierId,
      batchNumber: batchNumberTrimmed,
      harvestDate: formData.harvestDate,
      location: locationParts.join(", "),
      notes: formData.notes?.trim() || "",
      isPreOrderBatch: isPreOrder,
    };
    if (isPreOrder) {
      cleanedData.fruitTypeId = formData.fruitTypeId;
    } else {
      cleanedData.productId = formData.productId;
    }
    setHasSubmitted(true);
    dispatch(createHarvestBatchRequest(cleanedData));
  };


  const handleCancel = () => {
    setHasSubmitted(false);
    setFormData({
      supplierId: "",
      productId: "",
      fruitTypeId: "",
      isPreOrderBatch: false,
      batchNumber: "",
      harvestDate: "",
      location: "",
      city: "",
      ward: "",
      notes: "",
    });
    setIcity("");
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
            {/* Normal product harvest batch flow (same as before): Supplier + Product first */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Supplier <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.supplierId}
                  onChange={(e) => setFormData({ ...formData, supplierId: e.target.value, productId: "", fruitTypeId: "" })}
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

              {!formData.isPreOrderBatch && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.productId}
                    onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required={!formData.isPreOrderBatch}
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
              )}

              {formData.isPreOrderBatch && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fruit type (pre-order) <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.fruitTypeId}
                    onChange={(e) => setFormData({ ...formData, fruitTypeId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required={formData.isPreOrderBatch}
                    disabled={!formData.supplierId}
                  >
                    <option value="">Select fruit type</option>
                    {preOrderFruitTypes.length === 0 && formData.supplierId && (
                      <option value="" disabled>No fruit types in pre-order demand</option>
                    )}
                    {preOrderFruitTypes.map((ft) => (
                      <option key={ft.id} value={ft.id}>{ft.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>


            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Batch Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.batchNumber}
                  onChange={handleInputChange}
                  name="batchNumber"
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
                    onChange={handleInputChange}
                    name="harvestDate"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    max={today}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Chỉ khi tích mới chuyển sang flow pre-order (Fruit type); không tích = lô product như cũ */}
            <div className="pt-2 pb-2 border-t border-gray-100">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isPreOrderBatch === true}
                  onChange={(e) => setFormData({
                    ...formData,
                    isPreOrderBatch: e.target.checked,
                    productId: e.target.checked ? "" : formData.productId,
                    fruitTypeId: e.target.checked ? formData.fruitTypeId : "",
                  })}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span className="text-sm font-medium text-gray-700">Pre-order harvest batch</span>
              </label>
              <p className="text-xs text-gray-500 mt-1 ml-6">
                Leave unchecked for <strong>normal product harvest batch</strong> (same as before: supplier + product). Check only when creating a batch for pre-order; then select fruit type above instead of product.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center space-x-2">
                <MapPin size={16} />
                <span>Location</span>
              </label>
              <div className="space-y-3">
                <input
                  type="text"
                  value={formData.location}
                  onChange={handleInputChange}
                  name="location"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Street address"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <select
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Select province/city</option>
                    {provinces.map((province) => (
                      <option key={province.code} value={province.code}>
                        {province.name}
                      </option>
                    ))}
                  </select>
                  <select
                    name="ward"
                    value={formData.ward}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    disabled={!formData.city}
                  >
                    <option value="">Select ward</option>
                    {wards.map((ward) => (
                      <option key={ward.code} value={ward.name}>
                        {ward.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>


            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={handleInputChange}
                name="notes"
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
              disabled={createHarvestBatchLoading}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createHarvestBatchLoading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createHarvestBatchLoading ? "Processing…" : "Create Harvest Batch"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


export default CreateHarvestBatch;




