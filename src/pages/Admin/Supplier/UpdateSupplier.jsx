import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { updateSupplierRequest } from "../../../redux/actions/supplierActions";

const API_BASE = "https://provinces.open-api.vn/api/v2";

/** Phone: only digits, spaces, + - ( ); digit count 10–12. Returns { valid, message }. */
function validatePhone(phoneStr) {
  if (!phoneStr || !phoneStr.toString().trim()) return { valid: true };
  const s = phoneStr.toString().trim();
  if (!/^[0-9+\-\s()]+$/.test(s)) {
    return { valid: false, message: "Phone number can only contain digits, spaces, and + - ( )" };
  }
  const digitCount = (s.match(/\d/g) || []).length;
  if (digitCount < 10 || digitCount > 12) {
    return { valid: false, message: "Phone number must contain 10 to 12 digits" };
  }
  return { valid: true };
}

/** Email: detailed validation. Returns { valid, message }. */
function validateEmail(emailStr) {
  if (!emailStr || !emailStr.toString().trim()) return { valid: true };
  const s = emailStr.toString().trim();
  if (s.indexOf("@") === -1) return { valid: false, message: "Email must contain @" };
  if ((s.match(/@/g) || []).length > 1) return { valid: false, message: "Email must contain exactly one @" };
  const [local, domain] = s.split("@");
  if (!local || !local.length) return { valid: false, message: "Email must have a local part before @" };
  if (!domain || !domain.length) return { valid: false, message: "Email must have a domain after @" };
  if (domain.indexOf(".") === -1) return { valid: false, message: "Email domain must contain a dot (e.g. example.com)" };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)) return { valid: false, message: "Invalid email format (e.g. name@example.com)" };
  return { valid: true };
}

const UpdateSupplier = ({ isOpen, onClose, supplier }) => {
  const dispatch = useDispatch();
  const { updateSupplierLoading, updateSupplierError } = useSelector((state) => state.supplier);


  const [formData, setFormData] = useState({
    name: "",
    type: "FARM",
    contactPerson: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    ward: "",
    notes: "",
    status: true,
  });

  const [provinces, setProvinces] = useState([]);
  const [wards, setWards] = useState([]);
  const [icity, setIcity] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);

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

  useEffect(() => {
    if (supplier) {
      setFormData({
        name: supplier.name || "",
        type: supplier.type || "FARM",
        contactPerson: supplier.contactPerson || "",
        phone: supplier.phone || "",
        email: supplier.email || "",
        address: "",
        city: "",
        ward: "",
        notes: supplier.notes || "",
        status: supplier.status !== undefined ? supplier.status : true,
      });
      setIcity("");
    }
  }, [supplier]);


  useEffect(() => {
    if (hasSubmitted && !updateSupplierLoading && !updateSupplierError) {
      setHasSubmitted(false);
      onClose();
    }
  }, [hasSubmitted, updateSupplierLoading, updateSupplierError, onClose]);


  const handleSubmit = (e) => {
    e.preventDefault();

    const nameStr = formData.name?.toString().trim() || "";
    if (!nameStr) {
      toast.error("Supplier name is required");
      return;
    }
    if (nameStr.length < 2) {
      toast.error("Supplier name must be at least 2 characters");
      return;
    }
    if (nameStr.length > 100) {
      toast.error("Supplier name must be at most 100 characters");
      return;
    }
    if (!["FARM", "COOPERATIVE", "BUSINESS"].includes(formData.type)) {
      toast.error("Supplier type must be FARM, COOPERATIVE, or BUSINESS");
      return;
    }
    const contactPersonStr = (formData.contactPerson ?? "").toString().trim();
    if (contactPersonStr.length > 50) {
      toast.error("Contact person name must be at most 50 characters");
      return;
    }

    const phone = formData.phone?.toString().trim() || "";
    const email = formData.email?.toString().trim() || "";
    if (!phone && !email) {
      toast.error("At least one phone number or email is required");
      return;
    }
    if (phone) {
      const phoneCheck = validatePhone(phone);
      if (!phoneCheck.valid) {
        toast.error(phoneCheck.message);
        return;
      }
    }
    if (email) {
      const emailCheck = validateEmail(email);
      if (!emailCheck.valid) {
        toast.error(emailCheck.message);
        return;
      }
    }
    const addressLine = (formData.address ?? "").toString().trim();
    const wardName = (formData.ward ?? "").toString().trim();
    const provinceName = icity?.toString().trim() || "";
    const fullAddress = [addressLine, wardName, provinceName].filter(Boolean).join(", ");
    if (fullAddress.length > 500) {
      toast.error("Address must be at most 500 characters");
      return;
    }
    const notesStr = (formData.notes ?? "").toString().trim();
    if (notesStr.length > 1000) {
      toast.error("Notes must be at most 1000 characters");
      return;
    }

    // Clean data: remove empty strings and undefined values
    const cleanedData = {
      name: formData.name.trim(),
      type: formData.type,
      status: formData.status,
    };


    // Only include fields that are provided
    if (formData.contactPerson !== undefined) {
      cleanedData.contactPerson = formData.contactPerson?.toString().trim() || "";
    }
    if (formData.phone !== undefined) {
      cleanedData.phone = phone || "";
    }
    if (formData.email !== undefined) {
      cleanedData.email = email || "";
    }
    if (fullAddress) {
      cleanedData.address = fullAddress;
    }
    if (formData.notes !== undefined) {
      cleanedData.notes = formData.notes?.toString().trim() || "";
    }


    setHasSubmitted(true);
    dispatch(updateSupplierRequest(supplier._id, cleanedData));
  };


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "city") {
      const selectedProvince = provinces.find((p) => p.code === Number(value));
      setIcity(selectedProvince ? selectedProvince.name : "");
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => {
    setHasSubmitted(false);
    onClose();
  };


  if (!isOpen || !supplier) return null;


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">Update Supplier</h2>
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
                placeholder="Enter supplier name (2–100 characters)"
                minLength={2}
                maxLength={100}
                required
              />
              <p className="text-xs text-gray-500 mt-1">{formData.name.length}/100</p>
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
                placeholder="Enter contact person name (max 50 characters)"
                maxLength={50}
              />
              <p className="text-xs text-gray-500 mt-1">{formData.contactPerson.length}/50</p>
            </div>


            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter phone number (10–12 digits)"
                />
                <p className="text-xs text-gray-500 mt-1">Only digits, spaces, + - ( ). Must have 10–12 digits.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="text"
                  autoComplete="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter email address"
                />
              </div>
            </div>


            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <div className="space-y-3">
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                rows="3"
                placeholder="Enter notes (max 1000 characters)"
                maxLength={1000}
              />
              <p className="text-xs text-gray-500 mt-1">{formData.notes.length}/1000</p>
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
              disabled={updateSupplierLoading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updateSupplierLoading ? "Updating..." : "Update Supplier"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


export default UpdateSupplier;
