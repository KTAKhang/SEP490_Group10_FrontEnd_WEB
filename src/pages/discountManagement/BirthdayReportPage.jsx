/**
 * Admin: Birthday voucher usage report (statistics only, no list of codes).
 * Part of Discount Management; accessed via button on Discount Management page.
 */
import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    PieChart,
    Pie,
    Legend,
} from "recharts";
import apiClient from "../../utils/axiosConfig";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

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

    const stats = data
        ? {
            totalUsage: data.totalUsage ?? 0,
            totalDiscountAmount: data.totalDiscountAmount ?? 0,
            uniqueUsers: data.uniqueUsers ?? 0,
            averageDiscountPerOrder: data.averageDiscountPerOrder ?? 0,
        }
        : {
            totalUsage: 0,
            totalDiscountAmount: 0,
            uniqueUsers: 0,
            averageDiscountPerOrder: 0,
        };
    const usageByMonth = Array.isArray(data?.usageByMonth) ? data.usageByMonth : [];

    // For "Usage by month" chart: ensure all 12 months have an entry (fill zeros)
    const usageByMonthChartData =
        usageByMonth.length > 0
            ? Array.from({ length: 12 }, (_, i) => {
                const m = i + 1;
                const found = usageByMonth.find((x) => x.month === m);
                return {
                    month: m,
                    name: MONTH_NAMES[i],
                    usage: found ? found.usage : 0,
                    totalAmount: found ? found.totalAmount : 0,
                };
            })
            : [];

    // Overview pie: share of usage vs unique customers (simplified)
    const overviewPieData = [
        { name: "Total redemptions", value: stats.totalUsage, fill: "#16a34a" },
        { name: "Unique customers", value: stats.uniqueUsers, fill: "#22c55e" },
    ].filter((d) => d.value > 0);

    const hasYearOnly = filters.year && !filters.month && !filters.day;

    const keyMetricsData = [
        { label: "Total redemptions", value: stats.totalUsage, fill: "#16a34a" },
        { label: "Unique customers", value: stats.uniqueUsers, fill: "#22c55e" },
        {
            label: "Total discounted (K VND)",
            value: Math.round((stats.totalDiscountAmount || 0) / 1000),
            fill: "#4ade80",
        },
        {
            label: "Avg per order (K VND)",
            value: Math.round((stats.averageDiscountPerOrder || 0) / 1000),
            fill: "#86efac",
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header: Back button + Title */}
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                        <Link
                            to="/admin/discounts"
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 active:bg-green-800 transition-colors shadow-sm hover:shadow w-fit"
                        >
                            <i className="ri-arrow-left-line text-lg"></i>
                            <span>Back to Discount Management</span>
                        </Link>
                    </div>
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Birthday Voucher Report</h1>
                        <p className="text-gray-600 text-sm sm:text-base">
                            Usage statistics for birthday discount codes. Statistics only; no list of codes.
                        </p>
                    </div>
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
                            className="px-5 py-2.5 bg-green-600 text-white rounded-full font-medium hover:bg-green-700 transition-colors disabled:opacity-50 inline-flex items-center gap-2"
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

                {/* Charts */}
                <div className="mt-8 space-y-8">
                    {/* Usage by month (when year selected, no month) */}
                    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-1">Usage by month</h2>
                        <p className="text-sm text-gray-500 mb-6">
                            {hasYearOnly
                                ? `Birthday voucher redemptions per month in ${filters.year}.`
                                : "Select only a year (leave month and day empty) and click Apply to see monthly breakdown."}
                        </p>
                        {usageByMonthChartData.length > 0 ? (
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={usageByMonthChartData} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                                        <Tooltip
                                            formatter={(value, name) => [value, name === "usage" ? "Redemptions" : "Amount (VND)"]}
                                            contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb" }}
                                            labelFormatter={(label) => `Month: ${label}`}
                                        />
                                        <Bar dataKey="usage" name="usage" fill="#16a34a" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="h-48 flex items-center justify-center rounded-xl bg-gray-50 text-gray-500 text-sm">
                                {hasYearOnly && !loading
                                    ? "No usage in this period."
                                    : "Apply filters with year only to see monthly chart."}
                            </div>
                        )}
                    </div>

                    {/* Overview: key metrics comparison + pie */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-1">Key metrics at a glance</h2>
                            <p className="text-sm text-gray-500 mb-6">Compare main counts and amounts (amounts in K VND).</p>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        layout="vertical"
                                        data={keyMetricsData}
                                        margin={{ top: 0, right: 24, left: 140, bottom: 0 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                                        <YAxis type="category" dataKey="label" width={130} tick={{ fontSize: 11 }} />
                                        <Tooltip
                                            contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb" }}
                                            formatter={(value, name, props) => [
                                                props.payload.label.includes("K VND") ? `${value} K VND` : value,
                                                "Value",
                                            ]}
                                        />
                                        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                            {keyMetricsData.map((entry, i) => (
                                                <Cell key={i} fill={entry.fill} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-1">Redemptions vs unique customers</h2>
                            <p className="text-sm text-gray-500 mb-6">When both are equal, each customer used the voucher once.</p>
                            {overviewPieData.length > 0 ? (
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={overviewPieData}
                                                dataKey="value"
                                                nameKey="name"
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={90}
                                                paddingAngle={2}
                                                label={({ name, value }) => `${name}: ${value}`}
                                            >
                                                {overviewPieData.map((_, i) => (
                                                    <Cell key={i} fill={overviewPieData[i].fill} />
                                                ))}
                                            </Pie>
                                            <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb" }} />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="h-64 flex items-center justify-center rounded-xl bg-gray-50 text-gray-500 text-sm">
                                    No data to display.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
