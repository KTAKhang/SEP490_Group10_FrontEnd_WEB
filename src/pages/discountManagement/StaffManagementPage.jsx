/**
 * author: KHoanDCE170420
 * StaffManagementPage.jsx
 * Discount Management Page for Sales Staff
 * - Can create discount codes (status = PENDING)
 * - Can update discount codes (only if status = PENDING)
 * - Cannot approve, reject, activate, or delete
 */
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    discountListRequest,
    discountCreateRequest,
    discountUpdateRequest,
    discountDetailRequest,
} from "../../redux/actions/discountActions";

const StaffManagementPage = () => {
    const dispatch = useDispatch();
    const { list = [], loading, pagination: pageMeta = { page: 1, limit: 10, total: 0 } } = useSelector(
        (state) => state.discount || {}
    );

    const [statusFilter, setStatusFilter] = useState("ALL");
    const [sortBy, setSortBy] = useState("createdAt");
    const [sortOrder, setSortOrder] = useState("desc");
    const [loadingRefresh, setLoadingRefresh] = useState(false);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isUpdateOpen, setIsUpdateOpen] = useState(false);
    const [selectedDiscount, setSelectedDiscount] = useState(null);
    const [formData, setFormData] = useState({
        code: "",
        discountPercent: "",
        minOrderValue: "",
        maxDiscountAmount: "",
        startDate: "",
        endDate: "",
        usageLimit: "",
        description: "",
    });
    const [formErrors, setFormErrors] = useState({});

    // Calculate statistics
    const statistics = useMemo(() => {
        const stats = {
            pending: 0,
            approved: 0,
            rejected: 0,
            expired: 0
        };
        
        list.forEach(discount => {
            if (discount.status === "PENDING") stats.pending++;
            else if (discount.status === "APPROVED") stats.approved++;
            else if (discount.status === "REJECTED") stats.rejected++;
            else if (discount.status === "EXPIRED") stats.expired++;
        });
        
        return stats;
    }, [list]);

    // Load discounts with current filters
    const loadDiscounts = useCallback(
        (query = {}) => {
            const payload = {
                page: query.page ?? 1,
                limit: query.limit ?? 10,
                sortBy: query.sortBy ?? sortBy,
                sortOrder: query.sortOrder ?? sortOrder,
            };
            // Only include status filter if it's not "ALL"
            if (query.status && query.status !== "ALL") {
                payload.status = query.status;
            } else if (statusFilter && statusFilter !== "ALL") {
                payload.status = statusFilter;
            }
            dispatch(discountListRequest(payload));
        },
        [dispatch, sortBy, sortOrder, statusFilter]
    );

    useEffect(() => {
        loadDiscounts({ page: 1, limit: 10 });
    }, []);

    // Auto-load when filters change
    useEffect(() => {
        loadDiscounts({ page: 1, status: statusFilter === "ALL" ? undefined : statusFilter });
    }, [statusFilter, loadDiscounts]);

    const handleCreate = () => {
        setIsCreateOpen(true);
        setFormData({
            code: "",
            discountPercent: "",
            minOrderValue: "",
            maxDiscountAmount: "",
            startDate: "",
            endDate: "",
            usageLimit: "",
            description: "",
        });
        setFormErrors({});
    };

    const handleEdit = (discount) => {
        if (discount.status !== "PENDING") {
            alert("You can only edit PENDING discount codes");
            return;
        }
        setSelectedDiscount(discount);
        setFormData({
            code: discount.code || "",
            discountPercent: discount.discountPercent || "",
            minOrderValue: discount.minOrderValue || "",
            maxDiscountAmount: discount.maxDiscountAmount || "",
            startDate: discount.startDate ? new Date(discount.startDate).toISOString().split("T")[0] : "",
            endDate: discount.endDate ? new Date(discount.endDate).toISOString().split("T")[0] : "",
            usageLimit: discount.usageLimit || "",
            description: discount.description || "",
        });
        setFormErrors({});
        setIsUpdateOpen(true);
    };

    const handleRefresh = useCallback(() => {
        setLoadingRefresh(true);
        const query = { page: pageMeta.page, limit: pageMeta.limit, sortBy, sortOrder, status: statusFilter };
        loadDiscounts(query);
        setTimeout(() => setLoadingRefresh(false), 450);
    }, [loadDiscounts, statusFilter, pageMeta.page, pageMeta.limit, sortBy, sortOrder]);

    const handleTableChange = (newPage) => {
        const query = { page: newPage, limit: pageMeta.limit, sortBy, sortOrder, status: statusFilter };
        loadDiscounts(query);
    };

    const handleLimitChange = (newLimit) => {
        const query = { page: 1, limit: newLimit, sortBy, sortOrder, status: statusFilter };
        loadDiscounts(query);
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.code || formData.code.trim().length < 3) {
            errors.code = "Discount code must be at least 3 characters";
        }
        if (!formData.discountPercent || formData.discountPercent < 1 || formData.discountPercent > 100) {
            errors.discountPercent = "Discount percentage must be between 1 and 100";
        }
        if (!formData.minOrderValue || formData.minOrderValue < 0) {
            errors.minOrderValue = "Minimum order value must be 0 or greater";
        }
        if (!formData.maxDiscountAmount || formData.maxDiscountAmount < 0) {
            errors.maxDiscountAmount = "Maximum discount amount must be 0 or greater";
        }
        if (!formData.startDate) {
            errors.startDate = "Start date is required";
        }
        if (!formData.endDate) {
            errors.endDate = "End date is required";
        }
        
        // Validate dates are not in the past
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time to start of day for comparison
        
        if (formData.startDate) {
            const startDate = new Date(formData.startDate);
            startDate.setHours(0, 0, 0, 0);
            if (startDate < today) {
                errors.startDate = "Start date cannot be in the past";
            }
        }
        
        if (formData.endDate) {
            const endDate = new Date(formData.endDate);
            endDate.setHours(0, 0, 0, 0);
            if (endDate < today) {
                errors.endDate = "End date cannot be in the past";
            }
        }
        
        // Validate date range
        if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
            errors.endDate = "End date must be after start date";
        }
        
        if (formData.usageLimit && formData.usageLimit < 1) {
            errors.usageLimit = "Usage limit must be at least 1 (leave empty for unlimited)";
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

        const submitData = {
            ...formData,
            discountPercent: Number(formData.discountPercent),
            minOrderValue: Number(formData.minOrderValue),
            maxDiscountAmount: Number(formData.maxDiscountAmount),
            usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
        };

        dispatch(discountCreateRequest(submitData));
        setIsCreateOpen(false);
        setTimeout(() => handleRefresh(), 600);
    };

    const handleUpdateSubmit = (e) => {
        e.preventDefault();
        const errors = validateForm();
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        if (!selectedDiscount?._id) {
            alert("Discount ID is missing!");
            return;
        }

        const submitData = {
            ...formData,
            discountPercent: Number(formData.discountPercent),
            minOrderValue: Number(formData.minOrderValue),
            maxDiscountAmount: Number(formData.maxDiscountAmount),
            usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
        };

        dispatch(discountUpdateRequest(selectedDiscount._id, submitData));
        setIsUpdateOpen(false);
        setTimeout(() => handleRefresh(), 600);
    };

    const StatCard = ({ icon, title, value, color }) => (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
                    <p className="text-3xl font-bold text-gray-900">{value}</p>
                </div>
                <div className={`p-3 rounded-lg bg-gray-50`}>
                    <i className={`${icon} text-2xl ${color}`}></i>
                </div>
            </div>
        </div>
    );

    const StatusBadge = ({ status }) => {
        const config = {
            PENDING: { label: "Pending", color: "bg-yellow-100 text-yellow-700" },
            APPROVED: { label: "Approved", color: "bg-green-100 text-green-700" },
            REJECTED: { label: "Rejected", color: "bg-red-100 text-red-700" },
            EXPIRED: { label: "Expired", color: "bg-gray-100 text-gray-700" },
        };
        const statusConfig = config[status] || { label: status, color: "bg-gray-100 text-gray-700" };
        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                {statusConfig.label}
            </span>
        );
    };

    const filteredList = statusFilter === "ALL" ? list : list.filter((d) => d.status === statusFilter);

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Discount Management</h1>
                    <p className="text-gray-600">Create and manage discount codes (Sales Staff)</p>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <StatCard 
                        icon="ri-time-line" 
                        title="Pending" 
                        value={statistics.pending} 
                        color="text-yellow-600" 
                    />
                    <StatCard 
                        icon="ri-checkbox-circle-line" 
                        title="Approved" 
                        value={statistics.approved} 
                        color="text-green-600" 
                    />
                    <StatCard 
                        icon="ri-close-circle-line" 
                        title="Rejected" 
                        value={statistics.rejected} 
                        color="text-red-600" 
                    />
                </div>

                {/* Main Content Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                    {/* Filter Bar */}
                    <div className="p-6 border-b border-gray-100">
                        <div className="flex flex-col lg:flex-row gap-4 mb-4">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white"
                            >
                                <option value="ALL">All Discounts</option>
                                <option value="PENDING">Pending</option>
                                <option value="APPROVED">Approved</option>
                                <option value="REJECTED">Rejected</option>
                                <option value="EXPIRED">Expired</option>
                            </select>

                            <select
                                value={sortBy === "createdAt" ? "createdAt" : "code"}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    const nextSortBy = val;
                                    const nextSortOrder = val === "createdAt" ? "desc" : "asc";
                                    setSortBy(nextSortBy);
                                    setSortOrder(nextSortOrder);
                                    const query = { page: 1, limit: pageMeta.limit, sortBy: nextSortBy, sortOrder: nextSortOrder, status: statusFilter };
                                    loadDiscounts(query);
                                }}
                                className="px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white"
                            >
                                <option value="createdAt">Sort by: Created Date (Newest)</option>
                                <option value="code">Sort by: Code (A→Z)</option>
                            </select>

                            <div className="flex gap-3 ml-auto">
                                <button
                                    onClick={handleRefresh}
                                    disabled={loadingRefresh}
                                    className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                                >
                                    <i className={`ri-refresh-line ${loadingRefresh ? "animate-spin" : ""}`}></i>
                                    <span>Refresh</span>
                                </button>
                                <button
                                    onClick={handleCreate}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    <i className="ri-add-line"></i>
                                    <span>Create Discount</span>
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
                                    <p className="text-gray-600">Loading discounts...</p>
                                </div>
                            </div>
                        ) : filteredList.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <i className="ri-coupon-line text-6xl text-gray-300 mb-3"></i>
                                <p className="text-gray-600">No discounts found</p>
                            </div>
                        ) : (
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                            Code
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                            Discount
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                            Validity Period
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                            Usage
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
                                    {filteredList.map((discount) => (
                                        <tr key={discount._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-gray-900">{discount.code}</div>
                                                {discount.description && (
                                                    <div className="text-sm text-gray-500 mt-1">{discount.description}</div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm">
                                                    <div className="font-medium text-gray-900">{discount.discountPercent}% off</div>
                                                    <div className="text-gray-600">
                                                        Min: {discount.minOrderValue} vnđ | Max: {discount.maxDiscountAmount} vnd
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-700">
                                                    <div>
                                                        {new Date(discount.startDate).toLocaleDateString()} -{" "}
                                                        {new Date(discount.endDate).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-700">
                                                    {discount.usedCount} / {discount.usageLimit || "∞"}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <StatusBadge status={discount.status} />
                                                {discount.rejectedReason && (
                                                    <div className="text-xs text-red-600 mt-1">{discount.rejectedReason}</div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {discount.status === "PENDING" && (
                                                    <button
                                                        onClick={() => handleEdit(discount)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Edit"
                                                    >
                                                        <i className="ri-edit-line text-lg"></i>
                                                    </button>
                                                )}
                                                {discount.status !== "PENDING" && (
                                                    <span className="text-sm text-gray-400">Cannot edit</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Pagination */}
                    {!loading && !loadingRefresh && filteredList.length > 0 && (
                        <div className="px-6 py-4 border-t border-gray-100">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-600">
                                    Displaying {((pageMeta.page - 1) * pageMeta.limit) + 1}-
                                    {Math.min(pageMeta.page * pageMeta.limit, pageMeta.total)} of {pageMeta.total} discounts
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
                                                                ? "bg-green-600 text-white"
                                                                : "border border-gray-200 hover:bg-gray-50"
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
             {/* Create Discount Modal */}
            {isCreateOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-100">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-gray-900">Create Discount Code</h2>
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
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Discount Code <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                                        placeholder="SUMMER2024"
                                    />
                                    {formErrors.code && <p className="text-red-500 text-xs mt-1">{formErrors.code}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Discount Percentage (%) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="100"
                                        value={formData.discountPercent}
                                        onChange={(e) => setFormData({ ...formData, discountPercent: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                                        placeholder="10"
                                    />
                                    {formErrors.discountPercent && (
                                        <p className="text-red-500 text-xs mt-1">{formErrors.discountPercent}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Minimum Order Value <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={formData.minOrderValue}
                                        onChange={(e) => setFormData({ ...formData, minOrderValue: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                                        placeholder="100"
                                    />
                                    {formErrors.minOrderValue && (
                                        <p className="text-red-500 text-xs mt-1">{formErrors.minOrderValue}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Maximum Discount Amount <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={formData.maxDiscountAmount}
                                        onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                                        placeholder="50"
                                    />
                                    {formErrors.maxDiscountAmount && (
                                        <p className="text-red-500 text-xs mt-1">{formErrors.maxDiscountAmount}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Start Date <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                                    />
                                    {formErrors.startDate && <p className="text-red-500 text-xs mt-1">{formErrors.startDate}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        End Date <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                                    />
                                    {formErrors.endDate && <p className="text-red-500 text-xs mt-1">{formErrors.endDate}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Usage Limit (optional)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={formData.usageLimit}
                                        onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                                        placeholder="Leave empty for unlimited"
                                    />
                                    {formErrors.usageLimit && <p className="text-red-500 text-xs mt-1">{formErrors.usageLimit}</p>}
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Description (optional)</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                                        rows="3"
                                        placeholder="Discount description..."
                                    />
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

            {/* Update Discount Modal */}
            {isUpdateOpen && selectedDiscount && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-100">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-gray-900">Update Discount Code</h2>
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
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Discount Code <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                                        placeholder="SUMMER2024"
                                    />
                                    {formErrors.code && <p className="text-red-500 text-xs mt-1">{formErrors.code}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Discount Percentage (%) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="100"
                                        value={formData.discountPercent}
                                        onChange={(e) => setFormData({ ...formData, discountPercent: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                                        placeholder="10"
                                    />
                                    {formErrors.discountPercent && (
                                        <p className="text-red-500 text-xs mt-1">{formErrors.discountPercent}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Minimum Order Value <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={formData.minOrderValue}
                                        onChange={(e) => setFormData({ ...formData, minOrderValue: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                                        placeholder="100"
                                    />
                                    {formErrors.minOrderValue && (
                                        <p className="text-red-500 text-xs mt-1">{formErrors.minOrderValue}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Maximum Discount Amount <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={formData.maxDiscountAmount}
                                        onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                                        placeholder="50"
                                    />
                                    {formErrors.maxDiscountAmount && (
                                        <p className="text-red-500 text-xs mt-1">{formErrors.maxDiscountAmount}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Start Date <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                                    />
                                    {formErrors.startDate && <p className="text-red-500 text-xs mt-1">{formErrors.startDate}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        End Date <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                                    />
                                    {formErrors.endDate && <p className="text-red-500 text-xs mt-1">{formErrors.endDate}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Usage Limit (optional)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={formData.usageLimit}
                                        onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                                        placeholder="Leave empty for unlimited"
                                    />
                                    {formErrors.usageLimit && <p className="text-red-500 text-xs mt-1">{formErrors.usageLimit}</p>}
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Description (optional)</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                                        rows="3"
                                        placeholder="Discount description..."
                                    />
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
        </div>
    );
};

export default StaffManagementPage;