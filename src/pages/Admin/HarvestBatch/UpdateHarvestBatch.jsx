import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X, Calendar, Package, MapPin, AlertCircle } from "lucide-react";
import axios from "axios";
import { updateHarvestBatchRequest, getHarvestBatchByIdRequest } from "../../../redux/actions/supplierActions";


const API_BASE = "https://provinces.open-api.vn/api/v2";


const UpdateHarvestBatch = ({ isOpen, onClose, harvestBatchId }) => {
  const dispatch = useDispatch();
  const {
    harvestBatchDetail,
    harvestBatchDetailLoading,
    updateHarvestBatchLoading,
  } = useSelector((state) => state.supplier);


  const [formData, setFormData] = useState({
    batchNumber: "",
    harvestDate: "",
    location: "",
    city: "",
    ward: "",
    notes: "",
    receiptEligible: true,
  });


  const [provinces, setProvinces] = useState([]);
  const [wards, setWards] = useState([]);
  const [icity, setIcity] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);


  // Load harvest batch data when modal opens
  useEffect(() => {
    if (isOpen && harvestBatchId) {
      dispatch(getHarvestBatchByIdRequest(harvestBatchId));
    }
  }, [dispatch, isOpen, harvestBatchId]);


  // Populate form when harvest batch detail is loaded
  useEffect(() => {
    if (harvestBatchDetail) {
      // Format harvestDate to YYYY-MM-DD
      const harvestDate = harvestBatchDetail.harvestDate
        ? new Date(harvestBatchDetail.harvestDate).toISOString().split("T")[0]
        : "";


      setFormData({
        batchNumber: harvestBatchDetail.batchNumber || "",
        harvestDate: harvestDate,
        location: harvestBatchDetail.location || "",
        city: "",
        ward: "",
        notes: harvestBatchDetail.notes || "",
        receiptEligible: harvestBatchDetail.receiptEligible !== false,
      });
      setIcity("");
    }
  }, [harvestBatchDetail]);


  // Close modal after successful update
  useEffect(() => {
    if (hasSubmitted && !updateHarvestBatchLoading) {
      setHasSubmitted(false);
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- onClose omitted to avoid infinite loop on parent re-render
  }, [hasSubmitted, updateHarvestBatchLoading]);


  useEffect(() => {
    axios
      .get(`${API_BASE}/p/`)
      .then((res) => setProvinces(res.data))
      .catch((err) => console.error("Error loading provinces:", err));
  }, []);


  useEffect(() => {
    if (!formData.city) {
      setWards(() => []);
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
      setFormData((prev) => ({ ...prev, city: value, ward: "" }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };


  const handleSubmit = (e) => {
    e.preventDefault();


    if (!formData.batchNumber || !formData.harvestDate) {
      alert("Please fill in all required fields.");
      return;
    }


    // ✅ BR-SUP-12: Validation harvestDate không được lớn hơn ngày hiện tại
    const harvestDateObj = new Date(formData.harvestDate);
    harvestDateObj.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (harvestDateObj > today) {
      alert("Harvest date cannot be later than today.");
      return;
    }


    const locationLine = formData.location?.trim() || "";
    const wardName = formData.ward?.toString().trim() || "";
    const provinceName = icity?.toString().trim() || "";
    const locationParts = [locationLine, wardName, provinceName].filter(Boolean);


    const cleanedData = {
      batchNumber: formData.batchNumber.trim(),
      harvestDate: formData.harvestDate,
      location: locationParts.join(", "),
      notes: formData.notes?.trim() || "",
      receiptEligible: formData.receiptEligible,
    };


    setHasSubmitted(true);
    dispatch(updateHarvestBatchRequest(harvestBatchId, cleanedData));
  };


  const handleCancel = () => {
    setHasSubmitted(false);
    onClose();
  };


  if (!isOpen || !harvestBatchId) return null;


  const receivedQuantity = harvestBatchDetail?.receivedQuantity || 0;
  const canEdit = receivedQuantity === 0; // Chỉ cho phép edit nếu chưa nhập kho


  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0];


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-gray-200/80">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800 flex items-center space-x-2">
            <Package size={24} />
            <span>Update Harvest Batch</span>
          </h2>
          <button onClick={handleCancel} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>


        {harvestBatchDetailLoading ? (
          <div className="p-6 text-center">
            <p className="text-gray-600">Loading harvest batch details...</p>
          </div>
        ) : !harvestBatchDetail ? (
          <div className="p-6 text-center">
            <p className="text-red-600">Harvest batch not found</p>
          </div>
        ) : (
          <>
            {/* Warning if receivedQuantity > 0 */}
            {!canEdit && (
              <div className="mx-6 mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start space-x-3">
                <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="text-sm font-medium text-yellow-800">
                    Cannot edit harvest batch that has been received in warehouse
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    This batch has {receivedQuantity} already received in warehouse. You can only view details, not edit.
                  </p>
                </div>
              </div>
            )}


            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-4">
                {/* Read-only Supplier & Product Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Read-only information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Supplier</p>
                      <p className="text-sm font-medium text-gray-900">
                        {harvestBatchDetail.supplier?.name || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Product</p>
                      <p className="text-sm font-medium text-gray-900">
                        {harvestBatchDetail.product?.name || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Batch Code</p>
                      <p className="text-sm font-medium text-gray-900">
                        {harvestBatchDetail.batchCode || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Received Quantity</p>
                      <p className="text-sm font-medium text-gray-900">
                        {receivedQuantity}
                      </p>
                    </div>
                  </div>
                </div>


                {/* Receipt Eligible - only editable when canEdit */}
               


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
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder="Enter batch number"
                      required
                      disabled={!canEdit}
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
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                        max={today}
                        required
                        disabled={!canEdit}
                      />
                    </div>
                  </div>
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
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder="Street address"
                      disabled={!canEdit}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <select
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                        disabled={!canEdit}
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
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                        disabled={!canEdit || !formData.city}
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
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    rows="3"
                    placeholder="Enter notes"
                    maxLength={500}
                    disabled={!canEdit}
                  />
                  <p className="text-xs text-gray-500 mt-1">{formData.notes.length}/500</p>
                </div>
              </div>


              <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50"
                >
                  {canEdit ? "Cancel" : "Close"}
                </button>
                {canEdit && (
                  <button
                    type="submit"
                    disabled={updateHarvestBatchLoading}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updateHarvestBatchLoading ? "Updating..." : "Update Harvest Batch"}
                  </button>
                )}
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default UpdateHarvestBatch;




