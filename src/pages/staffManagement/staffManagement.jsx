import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { staffListRequest, staffCreateRequest, updateStaffStatusRequest, updateStaffRequest } from "../../redux/actions/staffActions";
import { useNavigate } from "react-router-dom";

const StaffManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list = [], loading, pagination: pageMeta = { page: 1, limit: 10, total: 0 } } = useSelector((state) => state.staff || {});

  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [loadingRefresh, setLoadingRefresh] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [formData, setFormData] = useState({
    user_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: "",
    role: "",
    avatar: ""
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [formErrors, setFormErrors] = useState({});

  // Load staff with current filters
  const loadStaff = useCallback((query = {}) => {
    const token = localStorage.getItem("token");
    const payload = {
      page: query.page ?? 1,
      limit: query.limit ?? 10,
      sortBy: query.sortBy ?? sortBy,
      sortOrder: query.sortOrder ?? sortOrder,
    };
    if (query.status) payload.status = query.status;
    if (query.role) payload.role = query.role;
    if (query.keyword) payload.keyword = query.keyword;
    dispatch(staffListRequest(payload));
  }, [dispatch, sortBy, sortOrder]);
  
  useEffect(() => {
    // Initial load
    loadStaff({ page: 1, limit: 10, sortBy: "createdAt", sortOrder: "desc" });
  }, []);

  // Auto-load when filters change with debounce for search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const query = {};
      let hasFilters = false;

      if (statusFilter !== "all") {
        query.status = statusFilter;
        hasFilters = true;
      }

      if (roleFilter !== "all") {
        query.role = roleFilter;
        hasFilters = true;
      }

      if (searchText.trim()) {
        query.keyword = searchText.trim();
        hasFilters = true;
      }

      loadStaff({ ...query, page: 1 });
    }, searchText.trim() ? 500 : 0);

    return () => clearTimeout(timeoutId);
  }, [searchText, statusFilter, roleFilter, loadStaff]);
  
  const staff = useMemo(() => {
    return (list || []);
  }, [list]);

  const filteredStaff = staff;

  // Check if any filters are active
  const hasActiveFilters = searchText.trim() || statusFilter !== "all" || roleFilter !== "all";

  // Create filter summary text
  const getFilterSummary = () => {
    const filters = [];
    if (statusFilter !== "all") {
      filters.push(`Status: ${statusFilter === "active" ? "Active" : "Inactive"}`);
    }
    if (roleFilter !== "all") {
      const roleNames = {
        "sales-staff": "Sales Staff",
        "finance-staff": "Finance Staff",
        "inventory-staff": "Inventory Staff"
      };
      filters.push(`Role: ${roleNames[roleFilter] || roleFilter}`);
    }
    if (searchText.trim()) {
      filters.push(`search: "${searchText.trim()}"`);
    }
    return filters.length > 0 ? filters.join(" • ") : "";
  };

  // Helpers to support both boolean and legacy string status values
  const isActive = (status) => status === true || status === "active";
  const toDisplayStatusText = (status) => (isActive(status) ? "active" : "inactive");

  // Calculate stats from current list (filtered/paginated)
  const displayStats = {
    total: pageMeta.total || 0,
    active: staff.filter(s => isActive(s.status)).length,
    inactive: staff.filter(s => !isActive(s.status)).length,
  };

  const handleCreate = () => {
    setIsCreateOpen(true);
    setFormData({
      user_name: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      address: "",
      role: "",
      avatar: ""
    });
    setAvatarFile(null);
    setAvatarPreview("");
    setFormErrors({});
  };

  const handleEdit = (record) => {
    setSelectedStaff(record);
    setFormData({
      user_name: record.user_name || "",
      email: record.email || "",
      password: "",
      confirmPassword: "",
      phone: record.phone || "",
      address: record.address || "",
      role: record.role_name || "",
      avatar: record.avatar || ""
    });
    setAvatarFile(null);
    setAvatarPreview(record.avatar || "");
    setFormErrors({});
    setIsUpdateOpen(true);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert("can only upload image files!");
        return;
      }
      // Validate file size (max 3MB)
      if (file.size > 3 * 1024 * 1024) {
        alert("Image size must be less than 3MB!");
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview("");
    setFormData({ ...formData, avatar: "" });
  };

  const handleRefresh = useCallback(() => {
    setLoadingRefresh(true);
    const query = { page: pageMeta.page, limit: pageMeta.limit, sortBy, sortOrder };
    if (statusFilter !== "all") query.status = statusFilter;
    if (roleFilter !== "all") query.role = roleFilter;
    if (searchText.trim()) query.keyword = searchText.trim();

    loadStaff(query);
    setTimeout(() => setLoadingRefresh(false), 450);
  }, [loadStaff, statusFilter, roleFilter, searchText, pageMeta.page, pageMeta.limit, sortBy, sortOrder]);

  const handleStatusToggle = (record) => {
    const current = record.status;
    const newStatus = typeof current === "boolean" ? !current : (current === "active" ? "inactive" : "active");
    dispatch(updateStaffStatusRequest(record._id || record.id, newStatus));
  };

  const handleViewDetail = (record) => {
    setSelectedStaff(record);
    setIsDetailOpen(true);
  };

  const handleTableChange = (newPage) => {
    const query = { page: newPage, limit: pageMeta.limit, sortBy, sortOrder };
    if (statusFilter !== "all") query.status = statusFilter;
    if (roleFilter !== "all") query.role = roleFilter;
    if (searchText.trim()) query.keyword = searchText.trim();
    loadStaff(query);
  };

  const handleLimitChange = (newLimit) => {
    const query = { page: 1, limit: newLimit, sortBy, sortOrder };
    if (statusFilter !== "all") query.status = statusFilter;
    if (roleFilter !== "all") query.role = roleFilter;
    if (searchText.trim()) query.keyword = searchText.trim();
    loadStaff(query);
  };

  const validateForm = (isUpdate = false) => {
    const errors = {};
    if (!formData.user_name || formData.user_name.length < 3) {
      errors.user_name = "User name must be at least 3 characters";
    }
    if (!isUpdate) {
      // Email only required for create
      if (!formData.email) {
        errors.email = "Please enter an email";
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        errors.email = "Invalid email";
      }
      // Password required for create
      if (!formData.password || formData.password.length < 6) {
        errors.password = "Password must be at least 6 characters";
      }
    } else {
      // For update: password is optional, but if provided must be valid
      if (formData.password && formData.password.length < 6) {
        errors.password = "Password must be at least 6 characters";
      }
    }
    if (formData.password && formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Confirm password does not match!";
    }
    if (!formData.phone || !/^[0-9]{10}$/.test(formData.phone)) {
      errors.phone = "Phone number must be exactly 10 digits";
    }
    if (!formData.address || formData.address.length < 10) {
      errors.address = "Address must be at least 10 characters";
    }
    if (!formData.role) {
      errors.role = "Please select a role";
    }
    return errors;
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    const submitData = { ...formData };
    delete submitData.confirmPassword;
    // If there's an avatar file, create FormData, otherwise send JSON
    if (avatarFile) {
      const formDataToSend = new FormData();
      formDataToSend.append("user_name", submitData.user_name);
      formDataToSend.append("email", submitData.email);
      formDataToSend.append("password", submitData.password);
      formDataToSend.append("phone", submitData.phone);
      formDataToSend.append("address", submitData.address);
      formDataToSend.append("role", submitData.role);
      formDataToSend.append("avatar", avatarFile);
      
      // Log FormData contents
      console.log("[Frontend] Sending FormData with fields:");
      for (let pair of formDataToSend.entries()) {
        console.log(`  ${pair[0]}:`, pair[1] instanceof File ? `File: ${pair[1].name}` : pair[1]);
      }
      
      dispatch(staffCreateRequest(formDataToSend));
    } else {
      console.log("[Frontend] Sending JSON:", submitData);
      dispatch(staffCreateRequest(submitData));
    }
    
    setIsCreateOpen(false);
    setTimeout(() => handleRefresh(), 600);
  };

  const handleUpdateSubmit = (e) => {
    e.preventDefault();
    const errors = validateForm(true); // true = isUpdate mode (password optional)
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    if (!selectedStaff?._id && !selectedStaff?.id) {
      alert("Role ID is missing!");
      return;
    }
    
    const submitData = { ...formData };
    delete submitData.confirmPassword;
    delete submitData.email; // Email cannot be updated
    
    // Remove password if empty (don't update password)
    if (!submitData.password) {
      delete submitData.password;
    }
    // If there's an avatar file, create FormData, otherwise send JSON
    if (avatarFile) {
      const formDataToSend = new FormData();
      formDataToSend.append("user_name", submitData.user_name);
      if (submitData.password) formDataToSend.append("password", submitData.password);
      formDataToSend.append("phone", submitData.phone);
      formDataToSend.append("address", submitData.address);
      formDataToSend.append("role", submitData.role);
      formDataToSend.append("avatar", avatarFile);
      
      // Log FormData contents
      console.log("[Frontend] Sending FormData with fields:");
      for (let pair of formDataToSend.entries()) {
        console.log(`  ${pair[0]}:`, pair[1] instanceof File ? `File: ${pair[1].name}` : pair[1]);
      }
      
      dispatch(updateStaffRequest(selectedStaff._id || selectedStaff.id, formDataToSend));
    } else {
      // If no new avatar file but has existing avatar URL, keep it
      if (formData.avatar) {
        submitData.avatar = formData.avatar;
      }
      dispatch(updateStaffRequest(selectedStaff._id || selectedStaff.id, submitData));
    }
    
    setIsUpdateOpen(false);
    setTimeout(() => handleRefresh(), 600);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // Simple toast notification
    const toast = document.createElement('div');
    toast.textContent = 'copied to clipboard!';
    toast.className = 'fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
  };

  // UI Components
  const StatCard = ({ icon, title, value, color }) => (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-lg ${color.replace('text', 'bg').replace('600', '100')} flex items-center justify-center`}>
          <i className={`${icon} text-2xl ${color}`}></i>
        </div>
      </div>
    </div>
  );

  const RoleBadge = ({ roleName }) => {
    const roleConfig = {
      "sales-staff": { label: "Sales Staff", color: "bg-blue-100 text-blue-700" },
      "finance-staff": { label: "Finance Staff", color: "bg-purple-100 text-purple-700" },
      "inventory-staff": { label: "Inventory Staff", color: "bg-green-100 text-green-700" }
    };
    const config = roleConfig[roleName] || { label: roleName || "N/A", color: "bg-gray-100 text-gray-700" };
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const StatusBadge = ({ status }) => {
    const active = isActive(status);
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
        <i className={`${active ? 'ri-checkbox-circle-fill' : 'ri-close-circle-fill'} mr-1`}></i>
        {toDisplayStatusText(status)}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Staff Management</h1>
          <p className="text-gray-600">Manage staff information, roles, and active status</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <StatCard icon="ri-user-line" title="Total Staff" value={displayStats.total} color="text-green-600" />
          <StatCard icon="ri-checkbox-circle-line" title="Active" value={displayStats.active} color="text-green-600" />
          <StatCard icon="ri-close-circle-line" title="Inactive" value={displayStats.inactive} color="text-red-600" />
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          {/* Filter Bar */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex flex-col lg:flex-row gap-4 mb-4">
              <div className="flex-1">
                <div className="relative">
                  <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                  <input
                    type="text"
                    placeholder="Search by name, email, or phone number..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  />
                  {searchText && (
                    <button
                      onClick={() => setSearchText("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <i className="ri-close-line"></i>
                    </button>
                  )}
                </div>
              </div>

              <select
                value={sortBy === "createdAt" ? "createdAt" : "name"}
                onChange={(e) => {
                  const val = e.target.value;
                  const nextSortBy = val;
                  const nextSortOrder = val === "createdAt" ? "desc" : "asc";
                  setSortBy(nextSortBy);
                  setSortOrder(nextSortOrder);
                  const query = { page: 1, limit: pageMeta.limit, sortBy: nextSortBy, sortOrder: nextSortOrder };
                  if (statusFilter !== "all") query.status = statusFilter;
                  if (roleFilter !== "all") query.role = roleFilter;
                  if (searchText.trim()) query.keyword = searchText.trim();
                  loadStaff(query);
                }}
                className="px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white"
              >
                <option value="createdAt">Sort by: Created Date (Newest)</option>
                <option value="name">Sort by: Alphabetical (A→Z)</option>
              </select>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white"
              >
                <option value="all">All Roles</option>
                <option value="sales-staff">Sales Staff</option>
                <option value="finance-staff">Finance Staff</option>
                <option value="inventory-staff">Inventory Staff</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white"
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                {hasActiveFilters && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Showing filtered results: {getFilterSummary()}</span>
                    <button
                      onClick={() => {
                        setSearchText("");
                        setStatusFilter("all");
                        setRoleFilter("all");
                      }}
                      className="text-sm text-green-600 hover:text-green-700 font-medium"
                    >
                      Clear Filters
                    </button>
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleRefresh}
                  disabled={loadingRefresh}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  <i className={`ri-refresh-line ${loadingRefresh ? 'animate-spin' : ''}`}></i>
                  <span>Refresh</span>
                </button>
                <button
                  onClick={handleCreate}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <i className="ri-add-line"></i>
                  <span>Add Staff</span>
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {loading || loadingRefresh ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-3">
                  <i className="ri-loader-4-line text-4xl text-green-600 animate-spin"></i>
                  <p className="text-gray-600">Loading staff...</p>
                </div>
              </div>
            ) : filteredStaff.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <i className="ri-user-line text-6xl text-gray-300 mb-3"></i>
                <p className="text-gray-600">No staff found</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Staff Information
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Created Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Contact Information
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredStaff.map((record) => (
                    <tr key={record._id || record.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center overflow-hidden">
                            {record.avatar ? (
                              <img src={record.avatar} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <i className="ri-user-line text-xl text-green-600"></i>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{record.user_name}</p>
                            <p className="text-sm text-gray-600">{record.email}</p>
                            <button
                              onClick={() => copyToClipboard(record._id || record.id)}
                              className="text-xs text-gray-400 hover:text-gray-600 mt-1 flex items-center gap-1"
                              title="Click để copy ID"
                            >
                              <i className="ri-file-copy-line"></i>
                              ID: {record._id || record.id}
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {record.createdAt ? (
                          <span className="text-sm text-gray-700">
                            {new Date(record.createdAt).toLocaleDateString('vi-VN', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <p className="text-sm text-gray-700 flex items-center gap-1">
                            <i className="ri-phone-line"></i>
                            {record.phone || "N/A"}
                          </p>
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <i className="ri-map-pin-line"></i>
                            {record.address || "N/A"}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <RoleBadge roleName={record.role_name} />
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={record.status} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewDetail(record)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Xem chi tiết"
                          >
                            <i className="ri-eye-line text-lg"></i>
                          </button>
                          <button
                            onClick={() => handleEdit(record)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Chỉnh sửa"
                          >
                            <i className="ri-edit-line text-lg"></i>
                          </button>
                          <button
                            onClick={() => handleStatusToggle(record)}
                            className={`p-2 rounded-lg transition-colors ${
                              isActive(record.status)
                                ? 'text-red-600 hover:bg-red-50'
                                : 'text-green-600 hover:bg-green-50'
                            }`}
                            title={isActive(record.status) ? "Disable" : "Enable"}
                          >
                            <i className={`text-lg ${isActive(record.status) ? 'ri-close-circle-line' : 'ri-checkbox-circle-line'}`}></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {!loading && !loadingRefresh && filteredStaff.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Displaying {((pageMeta.page - 1) * pageMeta.limit) + 1}-{Math.min(pageMeta.page * pageMeta.limit, pageMeta.total)} of {pageMeta.total} staff
                  {hasActiveFilters && <span className="text-green-600 ml-1">(filtered)</span>}
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={pageMeta.limit}
                    onChange={(e) => handleLimitChange(Number(e.target.value))}
                    className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  >
                    <option value={5}>5 / page</option>
                    <option value={10}>10 / page</option>
                    <option value={20}>20 / page</option>
                    <option value={50}>50 / page</option>
                  </select>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleTableChange(pageMeta.page - 1)}
                      disabled={pageMeta.page === 1}
                      className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <i className="ri-arrow-left-s-line"></i>
                    </button>
                    {[...Array(Math.ceil(pageMeta.total / pageMeta.limit))].map((_, i) => {
                      const pageNum = i + 1;
                      if (
                        pageNum === 1 ||
                        pageNum === Math.ceil(pageMeta.total / pageMeta.limit) ||
                        (pageNum >= pageMeta.page - 1 && pageNum <= pageMeta.page + 1)
                      ) {
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handleTableChange(pageNum)}
                            className={`px-3 py-1.5 rounded-lg transition-colors ${
                              pageMeta.page === pageNum
                                ? 'bg-green-600 text-white'
                                : 'border border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      } else if (pageNum === pageMeta.page - 2 || pageNum === pageMeta.page + 2) {
                        return <span key={pageNum} className="px-2">...</span>;
                      }
                      return null;
                    })}
                    <button
                      onClick={() => handleTableChange(pageMeta.page + 1)}
                      disabled={pageMeta.page === Math.ceil(pageMeta.total / pageMeta.limit)}
                      className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <i className="ri-arrow-right-s-line"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Create Staff Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Create Staff</h2>
                <button
                  onClick={() => setIsCreateOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <i className="ri-close-line text-xl text-gray-600"></i>
                </button>
              </div>
            </div>
            <form onSubmit={handleFormSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.user_name}
                    onChange={(e) => setFormData({ ...formData, user_name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    placeholder="Nhập họ tên"
                  />
                  {formErrors.user_name && <p className="text-red-500 text-xs mt-1">{formErrors.user_name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    placeholder="Nhập email"
                  />
                  {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    placeholder="Mật khẩu"
                  />
                  {formErrors.password && <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    placeholder="Nhập lại mật khẩu"
                  />
                  {formErrors.confirmPassword && <p className="text-red-500 text-xs mt-1">{formErrors.confirmPassword}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    placeholder="Số điện thoại"
                  />
                  {formErrors.phone && <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    placeholder="Địa chỉ"
                  />
                  {formErrors.address && <p className="text-red-500 text-xs mt-1">{formErrors.address}</p>}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white"
                  >
                    <option value="">Select Role</option>
                    <option value="sales-staff">Sales Staff</option>
                    <option value="finance-staff">Finance Staff</option>
                    <option value="inventory-staff">Inventory Staff</option>
                  </select>
                  {formErrors.role && <p className="text-red-500 text-xs mt-1">{formErrors.role}</p>}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Avatar
                  </label>
                  <div className="flex items-center gap-4">
                    {avatarPreview && (
                      <div className="relative">
                        <img
                          src={avatarPreview}
                          alt="Avatar preview"
                          className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveAvatar}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                        >
                          <i className="ri-close-line text-sm"></i>
                        </button>
                      </div>
                    )}
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-sm"
                      />
                      <p className="text-xs text-gray-500 mt-1">Only image files are accepted, up to 3MB</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-6 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Staff Modal */}
      {isUpdateOpen && selectedStaff && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Update Staff</h2>
                <button
                  onClick={() => setIsUpdateOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <i className="ri-close-line text-xl text-gray-600"></i>
                </button>
              </div>
            </div>
            <form onSubmit={handleUpdateSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.user_name}
                    onChange={(e) => setFormData({ ...formData, user_name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    placeholder="Nhập họ tên"
                  />
                  {formErrors.user_name && <p className="text-red-500 text-xs mt-1">{formErrors.user_name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                    placeholder="Email cannot be changed"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password (leave blank if not changing)
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    placeholder="Để trống nếu không đổi mật khẩu"
                  />
                  {formErrors.password && <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    placeholder="Nhập lại mật khẩu mới"
                  />
                  {formErrors.confirmPassword && <p className="text-red-500 text-xs mt-1">{formErrors.confirmPassword}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    placeholder="Số điện thoại"
                  />
                  {formErrors.phone && <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    placeholder="Địa chỉ"
                  />
                  {formErrors.address && <p className="text-red-500 text-xs mt-1">{formErrors.address}</p>}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vai trò <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white"
                  >
                    <option value="">Select Role</option>
                    <option value="sales-staff">Sales Staff</option>
                    <option value="finance-staff">Finance Staff</option>
                    <option value="inventory-staff">Inventory Staff</option>
                  </select>
                  {formErrors.role && <p className="text-red-500 text-xs mt-1">{formErrors.role}</p>}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Avatar
                  </label>
                  <div className="flex items-center gap-4">
                    {avatarPreview && (
                      <div className="relative">
                        <img
                          src={avatarPreview}
                          alt="Avatar preview"
                          className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveAvatar}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                        >
                          <i className="ri-close-line text-sm"></i>
                        </button>
                      </div>
                    )}
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-sm"
                      />
                      <p className="text-xs text-gray-500 mt-1">Only image files are accepted, up to 3MB</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsUpdateOpen(false)}
                  className="px-6 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Detail Modal */}
      {isDetailOpen && selectedStaff && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Staff Details</h2>
                <button
                  onClick={() => setIsDetailOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <i className="ri-close-line text-xl text-gray-600"></i>
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center overflow-hidden">
                  {selectedStaff.avatar ? (
                    <img src={selectedStaff.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <i className="ri-user-line text-3xl text-green-600"></i>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{selectedStaff.user_name}</h3>
                  <p className="text-gray-600">{selectedStaff.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Phone Number</p>
                  <p className="text-gray-900 flex items-center gap-2">
                    <i className="ri-phone-line text-green-600"></i>
                    {selectedStaff.phone || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Address</p>
                  <p className="text-gray-900 flex items-center gap-2">
                    <i className="ri-map-pin-line text-green-600"></i>
                    {selectedStaff.address || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Role</p>
                  <RoleBadge roleName={selectedStaff.role_name} />
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Status</p>
                  <StatusBadge status={selectedStaff.status} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;