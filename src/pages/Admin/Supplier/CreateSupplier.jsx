import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X } from "lucide-react";
import { createSupplierRequest } from "../../../redux/actions/supplierActions";

const CreateSupplier = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { createSupplierLoading, createSupplierError } = useSelector((state) => state.supplier);

  const [formData, setFormData] = useState({
    name: "",
    type: "FARM",
    code: "",
    contactPerson: "",
    phone: "",
    email: "",
    address: "",
    notes: "",
    status: true,
  });

  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    if (hasSubmitted && !createSupplierLoading && !createSupplierError) {
      setHasSubmitted(false);
      setFormData({
        name: "",
        type: "FARM",
        code: "",
        contactPerson: "",
        phone: "",
        email: "",
        address: "",
        notes: "",
        status: true,
      });
      onClose();
    }
  }, [hasSubmitted, createSupplierLoading, createSupplierError, onClose]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name || !formData.name.trim()) {
      return;
    }

    // ✅ BR-SUP-02: Phải có ít nhất phone hoặc email
    const phone = formData.phone?.toString().trim() || "";
    const email = formData.email?.toString().trim() || "";
    if (!phone && !email) {
      alert("Phải có ít nhất số điện thoại hoặc email");
      return;
    }

    // Clean data: remove empty strings and undefined values
    const cleanedData = {
      name: formData.name.trim(),
      type: formData.type,
      status: formData.status,
    };

    // Only include optional fields if they have values
    if (formData.code && formData.code.trim()) {
      cleanedData.code = formData.code.trim().toUpperCase();
    }
    if (formData.contactPerson && formData.contactPerson.trim()) {
      cleanedData.contactPerson = formData.contactPerson.trim();
    }
    if (phone) {
      cleanedData.phone = phone;
    }
    if (email) {
      cleanedData.email = email;
    }
    if (formData.address && formData.address.trim()) {
      cleanedData.address = formData.address.trim();
    }
    if (formData.notes && formData.notes.trim()) {
      cleanedData.notes = formData.notes.trim();
    }

    setHasSubmitted(true);
    dispatch(createSupplierRequest(cleanedData));
  };

  const handleCancel = () => {
    setHasSubmitted(false);
    setFormData({
      name: "",
      type: "FARM",
      code: "",
      contactPerson: "",
      phone: "",
      email: "",
      address: "",
      notes: "",
      status: true,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">Add new supplier</h2>
          <button onClick={handleCancel} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Supplier Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter supplier name"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  <option value="FARM">Farm</option>
                  <option value="COOPERATIVE">Cooperative</option>
                  <option value="BUSINESS">Business</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Code
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter supplier code (optional)"
                  maxLength={20}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Person
              </label>
              <input
                type="text"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter contact person name"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter email address"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                rows="3"
                placeholder="Enter address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                rows="3"
                placeholder="Enter notes"
              />
            </div>

            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.checked })}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <span className="text-sm text-gray-700">Active</span>
              </label>
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
              disabled={createSupplierLoading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createSupplierLoading ? "Creating..." : "Create Supplier"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSupplier;
