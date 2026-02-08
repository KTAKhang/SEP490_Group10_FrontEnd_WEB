/**
 * Admin: Birthday voucher usage report (statistics only, no list of codes).
 * Part of Discount Management; accessed via button on Discount Management page.
 */
import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import apiClient from "../../utils/axiosConfig";

const currentDate = new Date();
const currentYear = currentDate.getFullYear();

const defaultFilters = {
    year: currentYear,
    month: "",
    day: "",
};

export default function BirthdayReportPage() {
    const [filters, setFilters] = useState(defaultFilters);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchReport = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = {};
            if (filters.year) params.year = filters.year;
            if (filters.month) params.month = filters.month;
            if (filters.day) params.day = filters.day;
            const res = await apiClient.get("/discounts/birthday/report", { params });
            if (res.data?.status === "OK") {
                setData(res.data.data);
            } else {
                setError(res.data?.message || "Failed to load report");
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message || "Failed to load report");
            setData(null);
        } finally {
            setLoading(false);
        }
    }, [filters.year, filters.month, filters.day]);

    useEffect(() => {
        fetchReport();
    }, [fetchReport]);

    const handleFilterChange = (field, value) => {
        setFilters((prev) => ({ ...prev, [field]: value || "" }));
    };

    const formatMoney = (v) =>
        v != null ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(v) : "0 ₫";

    const stats = data || {
        totalUsage: 0,
        totalDiscountAmount: 0,
        uniqueUsers: 0,
        averageDiscountPerOrder: 0,
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Back + Title */}
                <div className="mb-8">
                    <Link
                        to="/admin/discounts"
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium mb-4 transition-colors"
                    >
                        <i className="ri-arrow-left-line text-xl"></i>
                        <span>Back to Discount Management</span>
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Birthday Voucher Report</h1>
                    <p className="text-gray-600 font-normal">
                        Usage statistics for birthday discount codes. Statistics only; no list of codes.
                    </p>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 mb-8">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Filters</h2>
                    <div className="flex flex-wrap gap-4 items-end">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                            <input
                                type="number"
                                min="2020"
                                max={currentYear + 1}
                                value={filters.year || ""}
                                onChange={(e) => handleFilterChange("year", e.target.value)}
                                className="w-28 px-4 py-2.5 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none bg-white text-gray-900"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Month (optional)</label>
                            <select
                                value={filters.month || ""}
                                onChange={(e) => handleFilterChange("month", e.target.value)}
                                className="w-36 px-4 py-2.5 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none bg-white text-gray-700"
                            >
                                <option value="">All months</option>
                                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                                    <option key={m} value={m}>
                                        {m}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Day (optional)</label>
                            <input
                                type="number"
                                min="1"
                                max="31"
                                placeholder="Day"
                                value={filters.day || ""}
                                onChange={(e) => handleFilterChange("day", e.target.value)}
                                className="w-28 px-4 py-2.5 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none bg-white text-gray-900 placeholder-gray-400"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={fetchReport}
                            disabled={loading}
                            className="px-5 py-2.5 bg-gray-900 text-white rounded-full font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 inline-flex items-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <i className="ri-loader-4-line text-lg animate-spin"></i>
                                    <span>Loading…</span>
                                </>
                            ) : (
                                <>
                                    <i className="ri-filter-line text-lg"></i>
                                    <span>Apply</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-700 font-medium flex items-center gap-2">
                        <i className="ri-error-warning-line text-xl"></i>
                        {error}
                    </div>
                )}

                {/* Stats cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 hover:shadow-xl transition-shadow duration-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">Total used</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalUsage}</p>
                            </div>
                            <div className="p-3 rounded-2xl bg-gray-100">
                                <i className="ri-coupon-2-line text-2xl text-green-600"></i>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 hover:shadow-xl transition-shadow duration-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">Total money discounted</p>
                                <p className="text-2xl font-bold text-gray-900">{formatMoney(stats.totalDiscountAmount)}</p>
                            </div>
                            <div className="p-3 rounded-2xl bg-gray-100">
                                <i className="ri-money-dollar-circle-line text-2xl text-green-600"></i>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 hover:shadow-xl transition-shadow duration-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">Unique customers</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.uniqueUsers}</p>
                            </div>
                            <div className="p-3 rounded-2xl bg-gray-100">
                                <i className="ri-user-line text-2xl text-green-600"></i>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 hover:shadow-xl transition-shadow duration-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">Average per order</p>
                                <p className="text-2xl font-bold text-gray-900">{formatMoney(stats.averageDiscountPerOrder)}</p>
                            </div>
                            <div className="p-3 rounded-2xl bg-gray-100">
                                <i className="ri-bar-chart-box-line text-2xl text-green-600"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
