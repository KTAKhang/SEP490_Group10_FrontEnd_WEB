/**
 * SalesStaffPage.jsx
 * Dashboard / Statistics page for Sales Staff
 * Real data from order stats + discount list + news. UI aligned with Warehouse Staff.
 * Includes lists and specific metrics per function.
 */
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import { DatePicker, Spin } from "antd";
import {
  LayoutDashboard,
  ShoppingCart,
  RotateCcw,
  CheckCircle,
  Ticket,
  Package,
  FileText,
  Clock,
  XCircle,
  Ban,
  ChevronRight,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  Download,
} from "lucide-react";
import { orderAdminStatsRequest, orderAdminListRequest } from "../../redux/actions/orderActions";
import { discountListRequest, fetchDiscountStatsRequest } from "../../redux/actions/discountActions";
import { newsGetNewsRequest } from "../../redux/actions/newsActions";
import Loading from "../../components/Loading/Loading";
import apiClient from "../../utils/axiosConfig";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const normalizeStatus = (value) =>
  (value || "").toString().trim().toUpperCase().replace(/[_\s]+/g, "-");

const STATUS_LABELS = {
  PENDING: "Pending",
  PAID: "Paid",
  "READY-TO-SHIP": "Ready to ship",
  SHIPPING: "Shipping",
  COMPLETED: "Completed",
  REFUND: "Refund",
  CANCELLED: "Cancelled",
};

const getOrderStatusLabel = (status) =>
  STATUS_LABELS[status] || status || "N/A";

const formatCurrency = (value) =>
  (value ?? 0).toLocaleString("vi-VN", { maximumFractionDigits: 0 }) + " ₫";
const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

const Card = ({ children, className = "" }) => (
  <div
    className={`rounded-2xl border border-gray-200/80 bg-white shadow-sm overflow-hidden ${className}`}
  >
    {children}
  </div>
);

const CardHeader = ({ children, className = "" }) => (
  <div className={`px-5 py-4 border-b border-gray-100 ${className}`}>
    {children}
  </div>
);

const CardTitle = ({ children, className = "" }) => (
  <h3 className={`text-base font-semibold text-gray-800 ${className}`}>
    {children}
  </h3>
);

const CardContent = ({ children, className = "" }) => (
  <div className={`p-5 ${className}`}>{children}</div>
);

const SalesStaffPage = () => {
  const dispatch = useDispatch();
  const {
    adminStats,
    adminStatsLoading,
    adminOrders = [],
    error: orderError,
  } = useSelector((state) => state.order || {});
  const {
    list: discountList = [],
    loading: discountLoading,
    statistics: discountStatsFromApi,
    discountStats: discountUsageStats,
    discountStatsLoading,
    discountStatsError,
  } = useSelector((state) => state.discount || {});
  const {
    newsList = [],
    newsListLoading,
    newsPagination,
  } = useSelector((state) => state.news || {});

  const [preOrderList, setPreOrderList] = useState([]);
  const [preOrderPagination, setPreOrderPagination] = useState(null);
  const [preOrderLoading, setPreOrderLoading] = useState(false);
  const [preOrderStats, setPreOrderStats] = useState(null);
  const [preOrderStatsLoading, setPreOrderStatsLoading] = useState(false);
  const [preOrderStatsDateRange, setPreOrderStatsDateRange] = useState(() => [
    dayjs().subtract(29, "day"),
    dayjs(),
  ]);
  const [discountStatsDateRange, setDiscountStatsDateRange] = useState(() => [
    dayjs().subtract(29, "day"),
    dayjs(),
  ]);
  const currentYear = new Date().getFullYear();
  const [statsGroupBy, setStatsGroupBy] = useState("month");
  const [statsYear, setStatsYear] = useState(currentYear);
  const [statsTab, setStatsTab] = useState("orders"); // "orders" | "discounts" | "preorders"

  const statsData = adminStats?.data ?? adminStats;
  const statusCounts = statsData?.statusCounts ?? [];
  const revenueRefund = statsData?.revenueRefund ?? null;

  useEffect(() => {
    dispatch(orderAdminListRequest({ page: 1, limit: 5, sortBy: "createdAt", sortOrder: "desc" }));
    dispatch(discountListRequest({ page: 1, limit: 5, sortBy: "createdAt", sortOrder: "desc" }));
    dispatch(newsGetNewsRequest({ page: 1, limit: 5 }));
  }, [dispatch]);

  useEffect(() => {
    dispatch(orderAdminStatsRequest({ groupBy: statsGroupBy, year: statsYear }));
  }, [dispatch, statsGroupBy, statsYear]);

  useEffect(() => {
    setPreOrderLoading(true);
    apiClient
      .get("/admin/preorder/pre-orders", { params: { page: 1, limit: 5, sortBy: "createdAt", sortOrder: "desc" } })
      .then((res) => {
        if (res.data?.data) setPreOrderList(res.data.data);
        if (res.data?.pagination) setPreOrderPagination(res.data.pagination);
      })
      .catch(() => setPreOrderList([]))
      .finally(() => setPreOrderLoading(false));
  }, []);

  const fetchPreOrderStats = async (dates) => {
    setPreOrderStatsLoading(true);
    try {
      const res = await apiClient.get("/admin/preorder/stats", {
        params: {
          startDate: dates[0].startOf("day").toISOString(),
          endDate: dates[1].endOf("day").toISOString(),
        },
      });
      setPreOrderStats(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setPreOrderStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchPreOrderStats(preOrderStatsDateRange);
  }, []);

  useEffect(() => {
    const s = dayjs().subtract(29, "day");
    const e = dayjs();
    dispatch(fetchDiscountStatsRequest({ startDate: s.format("YYYY-MM-DD"), endDate: e.format("YYYY-MM-DD") }));
  }, [dispatch]);

  const orderCountMap = useMemo(() => {
    const counts = statusCounts;
    const map = new Map(
      counts.map((item) => [normalizeStatus(item.status_name), item.total])
    );
    return map;
  }, [statusCounts]);

  const totalOrders = statsData?.totalOrders ?? 0;
  const refundCount = orderCountMap.get("REFUND") ?? 0;
  const completedCount = orderCountMap.get("COMPLETED") ?? 0;
  const pendingCount = orderCountMap.get("PENDING") ?? 0;
  const paidCount = orderCountMap.get("PAID") ?? 0;
  const needActionCount = pendingCount + paidCount;

  const discountStats = useMemo(() => {
    if (
      discountStatsFromApi &&
      typeof discountStatsFromApi.pending === "number"
    ) {
      return {
        pending: discountStatsFromApi.pending ?? 0,
        approved: discountStatsFromApi.approved ?? 0,
        rejected: discountStatsFromApi.rejected ?? 0,
        expired: discountStatsFromApi.expired ?? 0,
      };
    }
    const s = { pending: 0, approved: 0, rejected: 0, expired: 0 };
    discountList.forEach((d) => {
      if (d.status === "PENDING") s.pending++;
      else if (d.status === "APPROVED") s.approved++;
      else if (d.status === "REJECTED") s.rejected++;
      else if (d.status === "EXPIRED") s.expired++;
    });
    return s;
  }, [discountStatsFromApi, discountList]);

  const discountTotal =
    discountStats.pending +
    discountStats.approved +
    discountStats.rejected +
    discountStats.expired;

  const isLoading = adminStatsLoading && !adminStats;
  const hasOrderError = orderError && !adminStats;

  const exportSalesStatsToExcel = async () => {
    try {
      const res = await apiClient.get("/admin/export/sales-stats", { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `sales-stats-${dayjs().format("YYYY-MM-DD-HHmm")}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loading message="Loading statistics..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header — aligned with Warehouse Staff */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
            <LayoutDashboard size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Dashboard
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Orders, discounts & quick actions overview
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={exportSalesStatsToExcel}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
        >
          <Download size={18} />
          Export Excel
        </button>
      </div>

      {/* Navigation — 3 loại thống kê */}
      <nav className="flex flex-wrap items-center gap-2 rounded-xl border border-gray-200 bg-white p-2 shadow-sm">
        <button
          type="button"
          onClick={() => setStatsTab("orders")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            statsTab === "orders"
              ? "bg-green-700 text-white shadow-sm"
              : "bg-green-600 text-white hover:bg-green-700"
          }`}
        >
          Orders
        </button>
        <button
          type="button"
          onClick={() => setStatsTab("discounts")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            statsTab === "discounts"
              ? "bg-green-700 text-white shadow-sm"
              : "bg-green-600 text-white hover:bg-green-700"
          }`}
        >
          Discounts
        </button>
        <button
          type="button"
          onClick={() => setStatsTab("preorders")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            statsTab === "preorders"
              ? "bg-green-700 text-white shadow-sm"
              : "bg-green-600 text-white hover:bg-green-700"
          }`}
        >
          Pre-orders
        </button>
      </nav>

      {hasOrderError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {orderError}
        </div>
      )}

      {statsTab === "orders" && (
      <>
      {/* Order overview — 4 cards like WareHouse.jsx */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Order statistics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                  Total orders
                </p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {totalOrders}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                <ShoppingCart size={22} />
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-amber-200/60 bg-amber-50/50 p-5 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-amber-700/80">
                  Needs action
                </p>
                <p className="mt-1 text-2xl font-bold text-amber-700">
                  {needActionCount}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                <Clock size={22} />
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-emerald-200/60 bg-emerald-50/50 p-5 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-emerald-700/80">
                  Completed
                </p>
                <p className="mt-1 text-2xl font-bold text-emerald-700">
                  {completedCount}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                <CheckCircle size={22} />
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-purple-200/60 bg-purple-50/50 p-5 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-purple-700/80">
                  Refund
                </p>
                <p className="mt-1 text-2xl font-bold text-purple-700">
                  {refundCount}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                <RotateCcw size={22} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Orders by status */}
      <Card>
        <CardHeader>
          <CardTitle>Orders by status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {[
              "PENDING",
              "PAID",
              "READY-TO-SHIP",
              "SHIPPING",
              "COMPLETED",
              "REFUND",
              "CANCELLED",
            ].map((status) => (
              <div
                key={status}
                className="rounded-xl border border-gray-100 bg-gray-50/80 px-3 py-3"
              >
                <p className="text-xs font-medium text-gray-500 truncate">
                  {getOrderStatusLabel(status)}
                </p>
                <p className="mt-0.5 text-lg font-bold text-gray-900">
                  {orderCountMap.get(status) ?? 0}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Revenue & Refund (revenueRefund from API) */}
      {revenueRefund && (
        <>
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Revenue & Refund
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-2xl border border-emerald-200/60 bg-emerald-50/50 p-5 shadow-sm transition hover:shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-emerald-700/80">Total revenue</p>
                    <p className="mt-1 text-2xl font-bold text-emerald-700">
                      {formatCurrency((revenueRefund.revenue || []).reduce((s, r) => s + (r.value || 0), 0))}
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                    <TrendingUp size={22} />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">{revenueRefund.totalCompletedOrders ?? 0} orders completed</p>
              </div>
              <div className="rounded-2xl border border-red-200/60 bg-red-50/50 p-5 shadow-sm transition hover:shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-red-700/80">Total refund</p>
                    <p className="mt-1 text-2xl font-bold text-red-700">
                      {formatCurrency((revenueRefund.refund || []).reduce((s, r) => s + (r.value || 0), 0))}
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-red-600">
                    <RotateCcw size={22} />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">{revenueRefund.totalRefundOrders ?? 0} refund orders</p>
              </div>
              <div className="rounded-2xl border border-blue-200/60 bg-blue-50/50 p-5 shadow-sm transition hover:shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-blue-700/80">Net revenue</p>
                    <p className="mt-1 text-2xl font-bold text-blue-700">
                      {formatCurrency((revenueRefund.netRevenue || []).reduce((s, r) => s + (r.value || 0), 0))}
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                    <DollarSign size={22} />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Revenue − Refund</p>
              </div>
              <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm transition hover:shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Refund rate</p>
                    <p className="mt-1 text-2xl font-bold text-gray-900">
                      {(revenueRefund.refundRate ?? 0).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Revenue / refund / net by period — card shown when revenueRefund exists */}
          <Card>
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <CardTitle>Revenue</CardTitle>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-sm font-medium text-gray-600">Period:</span>
                  <select
                    value={statsGroupBy}
                    onChange={(e) => setStatsGroupBy(e.target.value)}
                    className="h-9 rounded-xl border border-gray-200 bg-white px-3 text-sm font-medium text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="month">By month</option>
                    <option value="quarter">By quarter</option>
                    <option value="year">By year</option>
                  </select>
                  <span className="text-sm font-medium text-gray-600">Year:</span>
                  <select
                    value={statsYear}
                    onChange={(e) => setStatsYear(Number(e.target.value))}
                    className="h-9 rounded-xl border border-gray-200 bg-white px-3 text-sm font-medium text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  >
                    {Array.from({ length: 6 }, (_, i) => currentYear - i).map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Bar chart: always show chart area, draw when data exists else placeholder */}
                <div className="h-80 w-full">
                  {(revenueRefund.netRevenue?.length ?? 0) > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={(revenueRefund.netRevenue || []).map((nr) => ({
                          label: nr.label,
                          revenue: (revenueRefund.revenue || []).find((r) => r.label === nr.label)?.value ?? 0,
                          refund: (revenueRefund.refund || []).find((r) => r.label === nr.label)?.value ?? 0,
                          netRevenue: nr.value ?? 0,
                        }))}
                        margin={{ top: 16, right: 16, left: 0, bottom: 8 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => (v >= 1e6 ? `${(v / 1e6).toFixed(0)}M` : v >= 1e3 ? `${(v / 1e3).toFixed(0)}K` : v)} />
                        <Tooltip
                          formatter={(value, name) => [
                            formatCurrency(value),
                            name === "revenue" ? "Revenue" : name === "refund" ? "Refund" : "Net revenue",
                          ]}
                          contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb" }}
                          labelFormatter={(label) => `Period: ${label}`}
                        />
                        <Legend formatter={(name) => (name === "revenue" ? "Revenue" : name === "refund" ? "Refund" : "Net revenue")} />
                        <Bar dataKey="revenue" name="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="refund" name="refund" fill="#ef4444" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="netRevenue" name="netRevenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full w-full flex flex-col items-center justify-center rounded-xl bg-gray-50 border border-dashed border-gray-200 text-gray-500">
                      <p className="text-sm font-medium">No data</p>
                      <p className="text-xs mt-1">Year {statsYear} {statsGroupBy === "month" ? "(by month)" : statsGroupBy === "quarter" ? "(by quarter)" : "(by year)"}</p>
                    </div>
                  )}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 text-left text-gray-600">
                        <th className="py-2 pr-4 font-semibold">Period</th>
                        <th className="py-2 pr-4 font-semibold text-right">Revenue</th>
                        <th className="py-2 pr-4 font-semibold text-right">Refund</th>
                        <th className="py-2 font-semibold text-right">Net</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(revenueRefund.netRevenue || []).map((nr) => (
                        <tr key={nr.label} className="border-b border-gray-100">
                          <td className="py-2 pr-4 font-medium text-gray-800">{nr.label}</td>
                          <td className="py-2 pr-4 text-right text-emerald-700">
                            {formatCurrency((revenueRefund.revenue || []).find((r) => r.label === nr.label)?.value ?? 0)}
                          </td>
                          <td className="py-2 pr-4 text-right text-red-700">
                            {formatCurrency((revenueRefund.refund || []).find((r) => r.label === nr.label)?.value ?? 0)}
                          </td>
                          <td className="py-2 text-right font-medium text-gray-900">
                            {formatCurrency(nr.value ?? 0)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {(revenueRefund.revenue?.length === 0 && revenueRefund.refund?.length === 0) && (
                  <p className="text-sm text-gray-500 py-4 text-center">No data for period</p>
                )}
              </CardContent>
            </Card>
        </>
      )}

      {/* Orders — Latest list */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <CardTitle>Orders — Latest list</CardTitle>
            <p className="text-xs text-gray-500 mt-1">
              Total <span className="font-semibold text-gray-700">{totalOrders}</span> orders
              {" · "}Pending <span className="font-semibold text-amber-600">{needActionCount}</span>
              {" · "}Completed <span className="font-semibold text-emerald-600">{completedCount}</span>
              {" · "}Refund <span className="font-semibold text-purple-600">{refundCount}</span>
            </p>
          </div>
          <Link
            to="/sale-staff/orders"
            className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            View all <ChevronRight size={16} />
          </Link>
        </CardHeader>
        <CardContent>
          {adminOrders.length === 0 ? (
            <p className="text-sm text-gray-500 py-4 text-center">No orders yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-gray-600">
                    <th className="py-2 pr-4 font-semibold">ID / Recipient</th>
                    <th className="py-2 pr-4 font-semibold">Status</th>
                    <th className="py-2 pr-4 font-semibold">Total</th>
                    <th className="py-2 font-semibold">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {adminOrders.map((order) => {
                    const status = normalizeStatus(order?.order_status_id?.name);
                    const total = order.total_price ?? order.totalPrice ?? 0;
                    return (
                      <tr key={order._id} className="border-b border-gray-100">
                        <td className="py-2 pr-4">
                          <span className="font-medium text-gray-800">{order._id?.slice(-8) || "—"}</span>
                          <br />
                          <span className="text-gray-600">{order.receiver_name} — {order.receiver_phone}</span>
                        </td>
                        <td className="py-2 pr-4">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                            status === "COMPLETED" ? "bg-emerald-100 text-emerald-700" :
                            status === "REFUND" ? "bg-purple-100 text-purple-700" :
                            status === "PENDING" || status === "PAID" ? "bg-amber-100 text-amber-700" :
                            "bg-gray-100 text-gray-700"
                          }`}>
                            {getOrderStatusLabel(status)}
                          </span>
                        </td>
                        <td className="py-2 pr-4 font-medium text-gray-900">{formatCurrency(total)}</td>
                        <td className="py-2 text-gray-600 whitespace-nowrap">{formatDate(order.createdAt)}</td>
                      </tr>
          );
        })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Refunds */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Refunds</CardTitle>
            <p className="text-xs text-gray-500 mt-1">
              <span className="font-semibold text-purple-600">{refundCount}</span> refund orders
              {refundCount > 0 && " — confirm refunds processed"}
            </p>
          </div>
          <Link
            to="/sale-staff/refund-orders"
            className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Process <ChevronRight size={16} />
          </Link>
        </CardHeader>
      </Card>

      </>
      )}

      {statsTab === "discounts" && (
      <>
      {/* Discount overview — aligned with Warehouse stats */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Discount statistics
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                  Total codes
                </p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {discountTotal}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                <Ticket size={22} />
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-amber-200/60 bg-amber-50/50 p-5 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-amber-700/80">
                  Pending approval
                </p>
                <p className="mt-1 text-2xl font-bold text-amber-700">
                  {discountStats.pending}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                <Clock size={22} />
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-emerald-200/60 bg-emerald-50/50 p-5 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-emerald-700/80">
                  Approved
                </p>
                <p className="mt-1 text-2xl font-bold text-emerald-700">
                  {discountStats.approved}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                <CheckCircle size={22} />
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-red-200/60 bg-red-50/50 p-5 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-red-700/80">
                  Rejected
                </p>
                <p className="mt-1 text-2xl font-bold text-red-700">
                  {discountStats.rejected}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-red-600">
                <XCircle size={22} />
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-gray-200/60 bg-gray-50/50 p-5 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-gray-700/80">
                  Expired
                </p>
                <p className="mt-1 text-2xl font-bold text-gray-700">
                  {discountStats.expired}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-200 text-gray-600">
                <Ban size={22} />
              </div>
            </div>
          </div>
        </div>
        {discountLoading && (
          <p className="text-sm text-gray-500 mt-2">Updating discount statistics...</p>
        )}
      </div>

      {/* Discount codes — Latest list */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <CardTitle>Discount codes — Latest list</CardTitle>
            <p className="text-xs text-gray-500 mt-1">
              Total <span className="font-semibold text-gray-700">{discountTotal}</span> codes
              {" · "}Pending <span className="font-semibold text-amber-600">{discountStats.pending}</span>
              {" · "}Approved <span className="font-semibold text-emerald-600">{discountStats.approved}</span>
              {" · "}Rejected <span className="font-semibold text-red-600">{discountStats.rejected}</span>
              {" · "}Expired <span className="font-semibold text-gray-600">{discountStats.expired}</span>
            </p>
          </div>
          <Link
            to="/sale-staff/discounts"
            className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            View all <ChevronRight size={16} />
          </Link>
          </CardHeader>
          <CardContent>
          {discountLoading && discountList.length === 0 ? (
            <p className="text-sm text-gray-500 py-4 text-center">Loading...</p>
          ) : discountList.length === 0 ? (
            <p className="text-sm text-gray-500 py-4 text-center">No discount codes yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-gray-600">
                    <th className="py-2 pr-4 font-semibold">Code</th>
                    <th className="py-2 pr-4 font-semibold">Discount</th>
                    <th className="py-2 pr-4 font-semibold">Status</th>
                    <th className="py-2 font-semibold">Expires</th>
                  </tr>
                </thead>
                <tbody>
                  {discountList.map((d) => (
                    <tr key={d._id} className="border-b border-gray-100">
                      <td className="py-2 pr-4 font-medium text-gray-800">{d.code || "—"}</td>
                      <td className="py-2 pr-4">{d.discountPercent ?? d.discount_percent ?? 0}%</td>
                      <td className="py-2 pr-4">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                          d.status === "PENDING" ? "bg-amber-100 text-amber-700" :
                          d.status === "APPROVED" ? "bg-emerald-100 text-emerald-700" :
                          d.status === "REJECTED" ? "bg-red-100 text-red-700" :
                          "bg-gray-100 text-gray-700"
                        }`}>
                          {d.status === "PENDING" ? "Pending" : d.status === "APPROVED" ? "Approved" : d.status === "REJECTED" ? "Rejected" : d.status === "EXPIRED" ? "Expired" : d.status}
                        </span>
                      </td>
                      <td className="py-2 text-gray-600 whitespace-nowrap">{formatDate(d.endDate || d.end_date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Discount usage statistics (by period) — Sales Staff only, excludes birthday */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Discount usage statistics
        </h2>
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <DatePicker.RangePicker
            value={discountStatsDateRange}
            onChange={(dates) => dates && setDiscountStatsDateRange(dates)}
            format="DD/MM/YYYY"
            className="rounded-xl border-gray-200"
          />
          <button
            type="button"
            onClick={() => {
              const [s, e] = discountStatsDateRange;
              if (s && e) {
                dispatch(
                  fetchDiscountStatsRequest({
                    startDate: s.format("YYYY-MM-DD"),
                    endDate: e.format("YYYY-MM-DD"),
                  })
                );
              }
            }}
            disabled={discountStatsLoading}
            className="h-9 rounded-xl bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            View statistics
          </button>
        </div>

        {discountStatsError && (
          <p className="text-sm text-red-600 mb-4">{discountStatsError}</p>
        )}

        {discountStatsLoading && (
          <div className="flex justify-center py-12">
            <Spin size="large" />
          </div>
        )}

        {!discountStatsLoading && discountUsageStats && (
          <div className="space-y-6">
            {/* 4 Summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm transition hover:shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Total discount codes</p>
                    <p className="mt-1 text-2xl font-bold text-gray-900">
                      {discountUsageStats.summary?.totalDiscounts ?? 0}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                        active {discountUsageStats.summary?.byStatus?.active ?? 0}
                      </span>
                      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                        pending {discountUsageStats.summary?.byStatus?.pending ?? 0}
                      </span>
                      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        inactive {discountUsageStats.summary?.byStatus?.inactive ?? 0}
                      </span>
                      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                        expired {discountUsageStats.summary?.byStatus?.expired ?? 0}
                      </span>
                    </div>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                    <Ticket size={22} />
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-indigo-200/60 bg-indigo-50/50 p-5 shadow-sm transition hover:shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-indigo-700/80">Total uses</p>
                    <p className="mt-1 text-2xl font-bold text-indigo-700">
                      {discountUsageStats.summary?.totalUsed ?? 0}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">In selected period</p>
              </div>
              <div className="rounded-2xl border border-orange-200/60 bg-orange-50/50 p-5 shadow-sm transition hover:shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-orange-700/80">Total discount amount</p>
                    <p className="mt-1 text-2xl font-bold text-orange-700">
                      {(discountUsageStats.summary?.totalDiscountAmount ?? 0).toLocaleString("vi-VN")} ₫
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Total amount saved by customers in period</p>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-blue-200/60 bg-blue-50/50 p-5 shadow-sm transition hover:shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-blue-700/80">AOV when code applied</p>
                    <p className="mt-1 text-2xl font-bold text-blue-700">
                      {(discountUsageStats.summary?.averageOrderValue ?? 0).toLocaleString("vi-VN")} ₫
                    </p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Average order value when code applied</p>
              </div>
            </div>

            {/* BarChart — Usage by day */}
            <Card>
              <CardHeader>
                <CardTitle>Usage by day</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80 w-full">
                  {(discountUsageStats.usageByDate?.length ?? 0) > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={discountUsageStats.usageByDate}
                        margin={{ top: 16, right: 56, left: 8, bottom: 8 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                        <YAxis
                          yAxisId="left"
                          orientation="left"
                          tick={{ fontSize: 11 }}
                          tickFormatter={(v) => Number(v)}
                          label={{ value: "Uses", angle: -90, position: "insideLeft", style: { fontSize: 11 } }}
                        />
                        <YAxis
                          yAxisId="right"
                          orientation="right"
                          tick={{ fontSize: 11 }}
                          tickFormatter={(v) => (v >= 1e6 ? `${(v / 1e6).toFixed(0)}M` : v >= 1e3 ? `${(v / 1e3).toFixed(0)}K` : v)}
                          label={{ value: "Discount (₫)", angle: 90, position: "insideRight", style: { fontSize: 11 } }}
                        />
                        <Tooltip
                          formatter={(value, name) => [
                            name === "usageCount" ? value : (value ?? 0).toLocaleString("vi-VN") + " ₫",
                            name === "usageCount" ? "Uses" : "Discount (₫)",
                          ]}
                          contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb" }}
                          labelFormatter={(label) => `Date: ${label}`}
                        />
                        <Legend formatter={(name) => (name === "usageCount" ? "Uses" : "Discount (₫)")} />
                        <Bar yAxisId="left" dataKey="usageCount" name="usageCount" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                        <Bar yAxisId="right" dataKey="discountAmount" name="discountAmount" fill="#f97316" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full w-full flex flex-col items-center justify-center rounded-xl bg-gray-50 border border-dashed border-gray-200 text-gray-500">
                      <p className="text-sm font-medium">No data by day</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Top discount codes — table */}
            <Card>
              <CardHeader>
                <CardTitle>Top discount codes (by usage)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 text-left text-gray-600">
                        <th className="py-2 pr-4 font-semibold">#</th>
                        <th className="py-2 pr-4 font-semibold">Code</th>
                        <th className="py-2 pr-4 font-semibold">Description</th>
                        <th className="py-2 pr-4 font-semibold">Type</th>
                        <th className="py-2 pr-4 font-semibold text-right">Uses</th>
                        <th className="py-2 pr-4 font-semibold text-right">Total discount</th>
                        <th className="py-2 pr-4 font-semibold text-right">AOV</th>
                        <th className="py-2 pr-4 font-semibold">Status</th>
                        <th className="py-2 font-semibold">Expires</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(discountUsageStats.topDiscounts || []).map((d, idx) => (
                        <tr key={idx} className="border-b border-gray-100">
                          <td className="py-2 pr-4 text-gray-600">{idx + 1}</td>
                          <td className="py-2 pr-4 font-medium text-gray-800">{d.code || "—"}</td>
                          <td className="py-2 pr-4 max-w-[120px] truncate" title={d.name}>{d.name || "—"}</td>
                          <td className="py-2 pr-4">{d.type === "percentage" ? "%" : "Fixed"}</td>
                          <td className="py-2 pr-4 text-right">{d.usageCount ?? 0}</td>
                          <td className="py-2 pr-4 text-right text-orange-700">{(d.totalDiscountAmount ?? 0).toLocaleString("vi-VN")} ₫</td>
                          <td className="py-2 pr-4 text-right">{(d.averageOrderValue ?? 0).toLocaleString("vi-VN")} ₫</td>
                          <td className="py-2 pr-4">
                            <span
                              className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                                d.status === "APPROVED" ? "bg-emerald-100 text-emerald-700" :
                                d.status === "PENDING" ? "bg-amber-100 text-amber-700" :
                                d.status === "EXPIRED" ? "bg-red-100 text-red-700" :
                                "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {d.status === "APPROVED" ? "active" : d.status === "PENDING" ? "pending" : d.status === "EXPIRED" ? "expired" : d.status || "inactive"}
                            </span>
                          </td>
                          <td className="py-2 text-gray-600 whitespace-nowrap">{formatDate(d.expiredAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {(discountUsageStats.topDiscounts?.length ?? 0) === 0 && (
                  <p className="text-sm text-gray-500 py-4 text-center">No data</p>
                )}
              </CardContent>
            </Card>

            {/* Two columns: Expiring soon | Never used */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Codes expiring soon (≤ 30 days)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 text-left text-gray-600">
                        <th className="py-2 pr-4 font-semibold">Code</th>
                        <th className="py-2 pr-4 font-semibold">Description</th>
                        <th className="py-2 pr-4 font-semibold">Expires</th>
                        <th className="py-2 font-semibold text-right">Uses</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(discountUsageStats.expiringSoon || []).map((d, idx) => {
                          const exp = d.expiredAt ? new Date(d.expiredAt) : null;
                          const daysLeft = exp ? Math.ceil((exp - new Date()) / (1000 * 60 * 60 * 24)) : 0;
                          const isUrgent = daysLeft <= 7;
                          return (
                            <tr key={idx} className={`border-b border-gray-100 ${isUrgent ? "bg-red-50" : ""}`}>
                              <td className="py-2 pr-4 font-medium text-gray-800">{d.code || "—"}</td>
                              <td className="py-2 pr-4 max-w-[100px] truncate" title={d.name}>{d.name || "—"}</td>
                              <td className="py-2 pr-4 text-gray-600 whitespace-nowrap">{formatDate(d.expiredAt)}</td>
                              <td className="py-2 text-right">{d.usageCount ?? 0}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  {(discountUsageStats.expiringSoon?.length ?? 0) === 0 && (
                    <p className="text-sm text-gray-500 py-4 text-center">No codes expiring soon</p>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Codes never used</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 text-left text-gray-600">
                        <th className="py-2 pr-4 font-semibold">Code</th>
                        <th className="py-2 pr-4 font-semibold">Description</th>
                        <th className="py-2 pr-4 font-semibold">Created</th>
                        <th className="py-2 font-semibold">Expires</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(discountUsageStats.neverUsed || []).map((d, idx) => (
                          <tr key={idx} className="border-b border-gray-100">
                            <td className="py-2 pr-4 font-medium text-gray-800">{d.code || "—"}</td>
                            <td className="py-2 pr-4 max-w-[100px] truncate" title={d.name}>{d.name || "—"}</td>
                            <td className="py-2 pr-4 text-gray-600 whitespace-nowrap">{formatDate(d.createdAt)}</td>
                            <td className="py-2 text-gray-600 whitespace-nowrap">{formatDate(d.expiredAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {(discountUsageStats.neverUsed?.length ?? 0) === 0 && (
                    <p className="text-sm text-gray-500 py-4 text-center">No never-used codes</p>
                  )}
                </CardContent>
              </Card>
            </div>

          </div>
        )}
      </div>

      </>
      )}

      {statsTab === "preorders" && (
      <>
      {/* Pre-orders — Latest list */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <CardTitle>Pre-orders — Latest list</CardTitle>
            <p className="text-xs text-gray-500 mt-1">
              <span className="font-semibold text-gray-700">{preOrderPagination?.total ?? preOrderList.length}</span> pre-orders
            </p>
          </div>
          <Link
            to="/sale-staff/preorder/orders"
            className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            View all <ChevronRight size={16} />
          </Link>
        </CardHeader>
        <CardContent>
          {preOrderLoading && preOrderList.length === 0 ? (
            <p className="text-sm text-gray-500 py-4 text-center">Loading...</p>
          ) : preOrderList.length === 0 ? (
            <p className="text-sm text-gray-500 py-4 text-center">No pre-orders yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-gray-600">
                    <th className="py-2 pr-4 font-semibold">ID / Status</th>
                    <th className="py-2 pr-4 font-semibold">Total</th>
                    <th className="py-2 font-semibold">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {preOrderList.map((po) => {
                    const total = po.totalAmount ?? po.total_amount ?? 0;
                    const status = po.status || "—";
                    return (
                      <tr key={po._id} className="border-b border-gray-100">
                        <td className="py-2 pr-4">
                          <span className="font-medium text-gray-800">{po._id?.slice(-8) || "—"}</span>
                          <br />
                          <span className="text-gray-600">{status}</span>
                        </td>
                        <td className="py-2 pr-4 font-medium text-gray-900">{formatCurrency(total)}</td>
                        <td className="py-2 text-gray-600 whitespace-nowrap">{formatDate(po.createdAt || po.created_at)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pre-order statistics */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Pre-order statistics</h2>
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <DatePicker.RangePicker
            value={preOrderStatsDateRange}
            onChange={(dates) => dates && setPreOrderStatsDateRange(dates)}
            className="rounded-xl border-gray-200"
          />
          <button
            type="button"
            onClick={() => fetchPreOrderStats(preOrderStatsDateRange)}
            className="h-9 px-4 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            View statistics
          </button>
        </div>
        <Spin spinning={preOrderStatsLoading}>
          {preOrderStats === null ? null : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total pre-orders</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{preOrderStats.summary?.total ?? 0}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {preOrderStats.summary?.byStatus && Object.entries(preOrderStats.summary.byStatus).filter(([, n]) => n > 0).map(([st, n]) => (
                        <span
                          key={st}
                          className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                            ["WAITING_FOR_ALLOCATION", "WAITING_FOR_PRODUCT", "WAITING_FOR_NEXT_BATCH"].includes(st)
                              ? "bg-amber-100 text-amber-800"
                              : st === "ALLOCATED_WAITING_PAYMENT"
                              ? "bg-orange-100 text-orange-800"
                              : st === "READY_FOR_FULFILLMENT"
                              ? "bg-blue-100 text-blue-800"
                              : st === "COMPLETED"
                              ? "bg-emerald-100 text-emerald-800"
                              : st === "CANCELLED"
                              ? "bg-red-100 text-red-800"
                              : st === "REFUND"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {st.replace(/_/g, " ")}: {n}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total revenue</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {formatCurrency(preOrderStats.summary?.totalRevenue ?? 0)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Deposit: {formatCurrency(preOrderStats.summary?.totalDepositCollected ?? 0)} | Remainder:{" "}
                      {formatCurrency(preOrderStats.summary?.totalRemainingCollected ?? 0)}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1">
                      <AlertTriangle className="h-3.5 w-3.5 text-orange-500" />
                      Awaiting balance payment
                    </p>
                    <p className="text-2xl font-bold text-orange-600 mt-1">
                      {preOrderStats.pendingPayment?.count ?? 0} orders
                    </p>
                    <p className="text-sm text-gray-600 mt-0.5">
                      {formatCurrency(preOrderStats.pendingPayment?.totalAmount ?? 0)}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Cancellation rate / Total kg</p>
                    <p
                      className={`text-2xl font-bold mt-1 ${
                        (preOrderStats.summary?.cancellationRate ?? 0) > 20 ? "text-red-600" : "text-gray-900"
                      }`}
                    >
                      {(preOrderStats.summary?.cancellationRate ?? 0).toFixed(1)}%
                    </p>
                    <p className="text-sm text-gray-600 mt-0.5">
                      {(preOrderStats.summary?.totalQuantityKg ?? 0).toLocaleString("vi-VN")} kg
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>Orders by day</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[260px] w-full">
                    {(preOrderStats.byDate?.length ?? 0) > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={preOrderStats.byDate}
                          margin={{ top: 16, right: 56, left: 8, bottom: 8 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                          <YAxis
                            yAxisId="left"
                            orientation="left"
                            tick={{ fontSize: 11 }}
                            tickFormatter={(v) => Number(v)}
                            label={{ value: "Order count", angle: -90, position: "insideLeft", style: { fontSize: 11 } }}
                          />
                          <YAxis
                            yAxisId="right"
                            orientation="right"
                            tick={{ fontSize: 11 }}
                            tickFormatter={(v) => (v >= 1e6 ? `${(v / 1e6).toFixed(0)}M` : v >= 1e3 ? `${(v / 1e3).toFixed(0)}K` : v)}
                            label={{ value: "Revenue (₫)", angle: 90, position: "insideRight", style: { fontSize: 11 } }}
                          />
                          <Tooltip
                            formatter={(value, name) => [
                              name === "revenue" ? formatCurrency(value) : value,
                              name === "count" ? "Order count" : "Revenue (₫)",
                            ]}
                            contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb" }}
                          />
                          <Legend formatter={(name) => (name === "count" ? "Order count" : "Revenue (₫)")} />
                          <Bar yAxisId="left" dataKey="count" name="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                          <Bar yAxisId="right" dataKey="revenue" name="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full w-full flex flex-col items-center justify-center rounded-xl bg-gray-50 border border-dashed border-gray-200 text-gray-500">
                        <p className="text-sm font-medium">No data by day</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>By fruit type</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 text-left text-gray-600">
                          <th className="py-2 pr-4 font-semibold">#</th>
                          <th className="py-2 pr-4 font-semibold">Fruit type</th>
                          <th className="py-2 pr-4 font-semibold text-right">Orders</th>
                          <th className="py-2 pr-4 font-semibold text-right">Total kg</th>
                          <th className="py-2 font-semibold text-right">Total revenue</th>
                        </tr>
                      </thead>
                      <tbody>
                        {((preOrderStats.byFruitType ?? []).sort((a, b) => (b.count ?? 0) - (a.count ?? 0))).map((row, idx) => (
                          <tr key={row.fruitTypeId || idx} className="border-b border-gray-100">
                            <td className="py-2 pr-4 text-gray-600">{idx + 1}</td>
                            <td className="py-2 pr-4 font-medium text-gray-800">{row.fruitTypeName || "—"}</td>
                            <td className="py-2 pr-4 text-right text-gray-700">{row.count ?? 0}</td>
                            <td className="py-2 pr-4 text-right text-gray-700">
                              {(row.totalQuantityKg ?? 0).toLocaleString("vi-VN")}
                            </td>
                            <td className="py-2 text-right font-medium text-gray-900">
                              {formatCurrency(row.totalRevenue)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {(preOrderStats.byFruitType?.length ?? 0) === 0 && (
                    <p className="text-sm text-gray-500 py-4 text-center">No data by fruit type</p>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </Spin>
      </div>

      </>
      )}

      {/* News — Latest list */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <CardTitle>News — Latest list</CardTitle>
            <p className="text-xs text-gray-500 mt-1">
              <span className="font-semibold text-gray-700">{newsPagination?.total ?? newsList.length}</span> posts
            </p>
          </div>
          <Link
            to="/sale-staff/news"
            className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            View all <ChevronRight size={16} />
          </Link>
        </CardHeader>
        <CardContent>
          {newsListLoading && newsList.length === 0 ? (
            <p className="text-sm text-gray-500 py-4 text-center">Loading...</p>
          ) : newsList.length === 0 ? (
            <p className="text-sm text-gray-500 py-4 text-center">No news yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-gray-600">
                    <th className="py-2 pr-4 font-semibold">Title</th>
                    <th className="py-2 pr-4 font-semibold">Status</th>
                    <th className="py-2 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {newsList.map((news) => (
                    <tr key={news._id} className="border-b border-gray-100">
                      <td className="py-2 pr-4 font-medium text-gray-800 max-w-[200px] truncate" title={news.title}>{news.title || "—"}</td>
                      <td className="py-2 pr-4">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                          news.status === "PUBLISHED" ? "bg-emerald-100 text-emerald-700" :
                          news.status === "DRAFT" ? "bg-gray-100 text-gray-700" :
                          "bg-amber-100 text-amber-700"
                        }`}>
                          {news.status === "PUBLISHED" ? "Published" : news.status === "DRAFT" ? "Draft" : news.status || "—"}
                        </span>
                      </td>
                      <td className="py-2 text-gray-600 whitespace-nowrap">{formatDate(news.createdAt || news.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          </CardContent>
        </Card>

      {/* Quick actions */}
      <Card>
          <CardHeader>
          <CardTitle>Quick actions</CardTitle>
          </CardHeader>
          <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <Link
              to="/sale-staff/orders"
              className="p-4 bg-blue-50 hover:bg-blue-100 rounded-xl text-center transition-colors border border-transparent hover:border-blue-200"
            >
              <ShoppingCart className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-800">Order management</p>
            </Link>
            <Link
              to="/sale-staff/refund-orders"
              className="p-4 bg-purple-50 hover:bg-purple-100 rounded-xl text-center transition-colors border border-transparent hover:border-purple-200"
            >
              <RotateCcw className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-800">Refund orders</p>
            </Link>
              <Link
              to="/sale-staff/preorder"
              className="p-4 bg-amber-50 hover:bg-amber-100 rounded-xl text-center transition-colors border border-transparent hover:border-amber-200"
              >
              <Package className="h-8 w-8 text-amber-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-800">Pre-orders</p>
              </Link>
              <Link
                to="/sale-staff/discounts"
              className="p-4 bg-emerald-50 hover:bg-emerald-100 rounded-xl text-center transition-colors border border-transparent hover:border-emerald-200"
            >
              <Ticket className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-800">Discount codes</p>
            </Link>
            <Link
              to="/sale-staff/news"
              className="p-4 bg-slate-50 hover:bg-slate-100 rounded-xl text-center transition-colors border border-transparent hover:border-slate-200"
            >
              <FileText className="h-8 w-8 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-800">News</p>
              </Link>
            </div>
          </CardContent>
        </Card>
    </div>
  );
};

export default SalesStaffPage;
