import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import {
  Package,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  Layers3,
  ArrowRight,
  RotateCcw,
  Boxes,
  CalendarDays,
} from "lucide-react";
import { orderAdminListRequest, orderAdminStatsRequest } from "../../../redux/actions/orderActions";
import { getProductStatsRequest } from "../../../redux/actions/productActions";
import { getCategoryStatsRequest } from "../../../redux/actions/categoryActions";
import apiClient from "../../../utils/axiosConfig";

// Simple Card components
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-lg border ${className}`}>{children}</div>
);

const CardHeader = ({ children, className = "" }) => (
  <div className={`p-6 pb-4 ${className}`}>{children}</div>
);

const CardTitle = ({ children, className = "" }) => (
  <h3 className={className}>{children}</h3>
);

const CardContent = ({ children, className = "" }) => (
  <div className={`p-6 pt-0 ${className}`}>{children}</div>
);

const normalizeStatus = (value) =>
  value ? value.toString().trim().toUpperCase().replace(/[_\s]+/g, "-") : "";

const formatCurrency = (value) =>
  (value || 0).toLocaleString("vi-VN", { maximumFractionDigits: 0 });

const statusLabel = (status) => {
  const map = {
    PENDING: "Pending",
    PAID: "Paid",
    "READY-TO-SHIP": "Ready to ship",
    SHIPPING: "Shipping",
    COMPLETED: "Completed",
    REFUND: "Refund",
    CANCELLED: "Cancelled",
  };
  return map[status] || status || "N/A";
};

const statusBadgeClass = (status) => {
  const map = {
    PENDING: "bg-yellow-100 text-yellow-800",
    PAID: "bg-blue-100 text-blue-800",
    "READY-TO-SHIP": "bg-purple-100 text-purple-800",
    SHIPPING: "bg-indigo-100 text-indigo-800",
    COMPLETED: "bg-green-100 text-green-800",
    REFUND: "bg-amber-100 text-amber-800",
    CANCELLED: "bg-red-100 text-red-800",
  };
  return map[status] || "bg-gray-100 text-gray-800";
};

const toNumber = (value) => {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "string") {
    const parsed = Number(value.replace(/,/g, ""));
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const getOrderRevenueValue = (order) =>
  toNumber(order?.total_price ?? order?.totalPrice ?? order?.payment?.amount ?? 0);

const getOrderRevenueDate = (order) =>
  order?.updatedAt || order?.createdAt || order?.order_date || order?.date || null;

const getOrderItems = (order) => {
  if (Array.isArray(order?.details)) return order.details;
  if (Array.isArray(order?.order_details)) return order.order_details;
  if (Array.isArray(order?.items)) return order.items;
  if (Array.isArray(order?.order_items)) return order.order_items;
  return [];
};

const chunkArray = (arr, size) => {
  if (!Array.isArray(arr) || size <= 0) return [];
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
};

const aggregateTopSellingProducts = (orders, limit = 5) => {
  if (!Array.isArray(orders) || orders.length === 0) return [];

  const productMap = new Map();
  orders.forEach((order) => {
    const orderId = String(order?._id || "");
    const seenInThisOrder = new Set();
    const items = getOrderItems(order);
    items.forEach((item) => {
      const productId =
        item?.product_id?._id ||
        item?.product_id ||
        item?.product?._id ||
        item?.productId ||
        item?._id ||
        item?.product_name ||
        item?.name ||
        "unknown-product";
      const productName =
        item?.product_name ||
        item?.product?.name ||
        item?.name ||
        "Unknown product";
      const quantity = toNumber(item?.quantity ?? item?.qty ?? 0);
      const image =
        item?.product_image ||
        item?.product?.images?.[0] ||
        item?.product?.image ||
        null;

      if (quantity <= 0) return;
      const key = String(productId);
      const current = productMap.get(key) || {
        id: key,
        name: productName,
        soldQty: 0,
        image: image,
        orderIds: new Set(),
      };
      current.soldQty += quantity;
      if (orderId && !seenInThisOrder.has(key)) {
        current.orderIds.add(orderId);
        seenInThisOrder.add(key);
      }
      if (!current.image && image) current.image = image;
      if (current.name === "Unknown product" && productName !== "Unknown product") {
        current.name = productName;
      }
      productMap.set(key, current);
    });
  });

  return [...productMap.values()]
    .map((item) => ({
      ...item,
      orderCount: item.orderIds?.size || 0,
    }))
    .sort((a, b) => {
      if (b.orderCount !== a.orderCount) return b.orderCount - a.orderCount;
      if (b.soldQty !== a.soldQty) return b.soldQty - a.soldQty;
      return String(a.name).localeCompare(String(b.name));
    })
    .slice(0, limit);
};

const buildEmptyPeriodSeries = (period) => {
  if (period === "day") {
    return Array.from({ length: 31 }, (_, i) => {
      const day = i + 1;
      return {
        label: `Day ${day}`,
        revenue: 0,
        rawKey: day,
        orderKey: day,
      };
    });
  }
  if (period === "month") {
    return Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      return {
        label: `T${month}`,
        revenue: 0,
        rawKey: month,
        orderKey: month,
      };
    });
  }
  return [];
};

const sortSeriesByPeriod = (series, period) => {
  const sorted = [...series];
  if (period === "day") {
    sorted.sort((a, b) => String(a.rawKey).localeCompare(String(b.rawKey)));
    return sorted.slice(-14);
  }
  if (period === "month") {
    sorted.sort((a, b) => toNumber(a.orderKey) - toNumber(b.orderKey));
    return sorted.slice(-12);
  }
  if (period === "year") {
    sorted.sort((a, b) => toNumber(a.orderKey) - toNumber(b.orderKey));
    return sorted;
  }
  return sorted;
};

const formatPeriodLabel = (entry, period) => {
  if (period === "day") {
    const raw = entry?.date || entry?.day || entry?.label || entry?.period || entry?.x;
    if (!raw) return "N/A";
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return String(raw);
    return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
  }
  if (period === "month") {
    const month = entry?.month ?? entry?.label ?? entry?.period ?? entry?.x;
    const monthNum = toNumber(month);
    if (monthNum >= 1 && monthNum <= 12) return `T${monthNum}`;
    return String(month || "N/A");
  }
  const year = entry?.year ?? entry?.label ?? entry?.period ?? entry?.x;
  return String(year || "N/A");
};

const periodOrderKey = (entry, period) => {
  if (period === "day") return entry?.date || entry?.day || entry?.label || entry?.period || "";
  if (period === "month") return entry?.month ?? entry?.label ?? entry?.period ?? 0;
  return entry?.year ?? entry?.label ?? entry?.period ?? 0;
};

const buildRevenueSeries = (adminStats, period) => {
  if (!adminStats) return [];

  const keyMap = {
    day: ["revenueByDay", "dailyRevenue", "revenueDaily", "revenueByDate"],
    month: ["revenueByMonth", "monthlyRevenue", "revenueMonthly"],
    year: ["revenueByYear", "yearlyRevenue", "revenueYearly"],
  };
  const targetKey = keyMap[period].find((k) => adminStats[k] != null);
  const source = targetKey ? adminStats[targetKey] : null;

  let rows = [];
  if (Array.isArray(source)) rows = source;
  else if (source && typeof source === "object") {
    rows = Object.entries(source).map(([key, value]) => ({
      period: key,
      revenue: value,
    }));
  }

  const normalized = rows.map((item) => {
    const revenue = toNumber(
      item?.revenue ??
        item?.amount ??
        item?.totalRevenue ??
        item?.total_amount ??
        item?.value ??
        item?.total
    );
    return {
      label: formatPeriodLabel(item, period),
      revenue,
      rawKey: periodOrderKey(item, period),
      orderKey: periodOrderKey(item, period),
    };
  });

  return sortSeriesByPeriod(normalized, period);
};

const buildRevenueSeriesFromOrders = (orders, period) => {
  if (!Array.isArray(orders) || orders.length === 0) {
    return buildEmptyPeriodSeries(period);
  }

  const dayMap = new Map();
  const monthMap = new Map();
  const yearMap = new Map();

  orders.forEach((order) => {
    const rawDate = getOrderRevenueDate(order);
    const revenue = getOrderRevenueValue(order);
    if (!rawDate || revenue <= 0) return;
    const d = new Date(rawDate);
    if (Number.isNaN(d.getTime())) return;

    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const dayKey = day;
    const monthKey = month;
    const yearKey = `${year}`;

    dayMap.set(dayKey, (dayMap.get(dayKey) || 0) + revenue);
    monthMap.set(monthKey, (monthMap.get(monthKey) || 0) + revenue);
    yearMap.set(yearKey, (yearMap.get(yearKey) || 0) + revenue);
  });

  const toSeries = (map, keyType) =>
    [...map.entries()].map(([key, revenue]) => {
      if (keyType === "day") {
        return {
          label: `Day ${Number(key)}`,
          revenue,
          rawKey: key,
          orderKey: Number(key),
        };
      }
      if (keyType === "month") {
        return {
          label: `T${Number(key)}`,
          revenue,
          rawKey: key,
          orderKey: Number(key),
        };
      }
      return {
        label: key,
        revenue,
        rawKey: key,
        orderKey: Number(key),
      };
    });

  if (period === "day") {
    const series = toSeries(dayMap, "day");
    const valueMap = new Map(series.map((item) => [Number(item.rawKey), item.revenue]));
    return Array.from({ length: 31 }, (_, i) => {
      const day = i + 1;
      return {
        label: `Day ${day}`,
        revenue: valueMap.get(day) || 0,
        rawKey: day,
        orderKey: day,
      };
    });
  }
  if (period === "month") {
    const series = toSeries(monthMap, "month");
    const valueMap = new Map(series.map((item) => [Number(item.rawKey), item.revenue]));
    return Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      return {
        label: `T${month}`,
        revenue: valueMap.get(month) || 0,
        rawKey: month,
        orderKey: month,
      };
    });
  }
  return sortSeriesByPeriod(toSeries(yearMap, "year"), "year");
};

const getTotalRevenue = (adminStats, revenueSeries, ordersRevenueTotal = 0) => {
  const directRevenue = toNumber(
    adminStats?.totalRevenue ??
      adminStats?.revenue ??
      adminStats?.completedRevenue ??
      adminStats?.grossRevenue
  );
  if (directRevenue > 0) return directRevenue;
  if (ordersRevenueTotal > 0) return ordersRevenueTotal;
  return revenueSeries.reduce((sum, item) => sum + toNumber(item.revenue), 0);
};

const AdminPage = () => {
  const [revenuePeriod, setRevenuePeriod] = useState("day");
  const [showSpecificSelector, setShowSpecificSelector] = useState(false);
  const [selectedPeriodKey, setSelectedPeriodKey] = useState("");
  const [revenueOrders, setRevenueOrders] = useState([]);
  const [revenueOrdersLoading, setRevenueOrdersLoading] = useState(false);
  const dispatch = useDispatch();
  const { adminStats, adminStatsLoading, adminOrders, adminLoading } = useSelector(
    (state) => state.order || {}
  );
  const { productStats, productStatsLoading } = useSelector((state) => state.product || {});
  const { categoryStats, categoryStatsLoading } = useSelector((state) => state.category || {});

  useEffect(() => {
    dispatch(orderAdminStatsRequest());
    dispatch(
      orderAdminListRequest({
        page: 1,
        limit: 5,
        sortBy: "createdAt",
        sortOrder: "desc",
      })
    );
    dispatch(getProductStatsRequest());
    dispatch(getCategoryStatsRequest());
  }, [dispatch]);

  useEffect(() => {
    let isMounted = true;

    const fetchCompletedOrdersForRevenue = async () => {
      setRevenueOrdersLoading(true);
      try {
        const allOrders = [];
        let page = 1;
        const limit = 100;
        let totalPages = 1;

        do {
          const res = await apiClient.get("/order", {
            params: {
              page,
              limit,
              status_names: "COMPLETED",
              sortBy: "createdAt",
              sortOrder: "asc",
            },
          });

          const payload = res?.data;
          const rows = Array.isArray(payload?.data) ? payload.data : [];
          allOrders.push(...rows);

          totalPages = Number(payload?.pagination?.totalPages || 1);
          page += 1;
        } while (page <= totalPages && page <= 100);

        // /order list may not include line items; enrich completed orders with /order/:id details
        const candidateOrders = allOrders.filter((order) => order?._id);
        const ordersNeedDetails = candidateOrders.filter(
          (order) => getOrderItems(order).length === 0
        );

        if (ordersNeedDetails.length > 0) {
          const detailsById = new Map();
          const batches = chunkArray(ordersNeedDetails, 10);

          for (const batch of batches) {
            const results = await Promise.allSettled(
              batch.map((order) => apiClient.get(`/order/${order._id}`))
            );

            results.forEach((result, idx) => {
              const orderId = batch[idx]?._id;
              if (!orderId || result.status !== "fulfilled") return;
              const payload = result.value?.data;
              const detailData = payload?.data ?? payload;
              const details = Array.isArray(detailData?.details) ? detailData.details : [];
              if (details.length > 0) {
                detailsById.set(orderId, details);
              }
            });
          }

          const enriched = allOrders.map((order) => {
            const fallbackItems = getOrderItems(order);
            if (fallbackItems.length > 0) return order;
            const details = detailsById.get(order?._id) || [];
            return {
              ...order,
              details,
            };
          });

          if (isMounted) {
            setRevenueOrders(enriched);
          }
        } else if (isMounted) {
          setRevenueOrders(allOrders);
        }

      } catch {
        if (isMounted) setRevenueOrders([]);
      } finally {
        if (isMounted) setRevenueOrdersLoading(false);
      }
    };

    fetchCompletedOrdersForRevenue();
    return () => {
      isMounted = false;
    };
  }, []);

  const countsByStatus = useMemo(() => {
    const map = new Map();
    (adminStats?.statusCounts || []).forEach((item) => {
      const key = normalizeStatus(item.status_name);
      map.set(key, item.total || 0);
    });
    return map;
  }, [adminStats]);

  const processingOrders =
    (countsByStatus.get("PENDING") || 0) +
    (countsByStatus.get("PAID") || 0) +
    (countsByStatus.get("READY-TO-SHIP") || 0) +
    (countsByStatus.get("SHIPPING") || 0);
  const completedOrders = countsByStatus.get("COMPLETED") || 0;
  const refundOrders = countsByStatus.get("REFUND") || 0;
  const cancelledOrders = countsByStatus.get("CANCELLED") || 0;
  const realRevenuePeriod = revenuePeriod || "day";
  const revenueSeriesFromStats = useMemo(
    () => buildRevenueSeries(adminStats, realRevenuePeriod),
    [adminStats, realRevenuePeriod]
  );
  const revenueSeriesFromOrders = useMemo(
    () => buildRevenueSeriesFromOrders(revenueOrders, realRevenuePeriod),
    [revenueOrders, realRevenuePeriod]
  );
  const revenueSeries = useMemo(() => {
    if (realRevenuePeriod === "day" || realRevenuePeriod === "month") {
      return revenueSeriesFromOrders;
    }
    return revenueSeriesFromStats.length > 0 ? revenueSeriesFromStats : revenueSeriesFromOrders;
  }, [realRevenuePeriod, revenueSeriesFromOrders, revenueSeriesFromStats]);
  const periodOptions = useMemo(
    () =>
      revenueSeries.map((item) => ({
        value: String(item.rawKey),
        label: item.label,
      })),
    [revenueSeries]
  );
  const filteredRevenueSeries = useMemo(() => {
    if (!selectedPeriodKey) return revenueSeries;
    return revenueSeries.filter((item) => String(item.rawKey) === selectedPeriodKey);
  }, [revenueSeries, selectedPeriodKey]);

  useEffect(() => {
    setSelectedPeriodKey("");
  }, [realRevenuePeriod]);

  useEffect(() => {
    if (
      selectedPeriodKey &&
      !periodOptions.some((option) => option.value === selectedPeriodKey)
    ) {
      setSelectedPeriodKey("");
    }
  }, [periodOptions, selectedPeriodKey]);

  const selectedOptionLabel = useMemo(() => {
    if (!selectedPeriodKey) return "All";
    return periodOptions.find((option) => option.value === selectedPeriodKey)?.label || "All";
  }, [periodOptions, selectedPeriodKey]);

  const ordersRevenueTotal = useMemo(
    () => revenueOrders.reduce((sum, order) => sum + getOrderRevenueValue(order), 0),
    [revenueOrders]
  );
  const totalRevenue = useMemo(
    () => getTotalRevenue(adminStats, revenueSeries, ordersRevenueTotal),
    [adminStats, revenueSeries, ordersRevenueTotal]
  );
  const topSellingProducts = useMemo(
    () => aggregateTopSellingProducts(revenueOrders, 5),
    [revenueOrders]
  );
  const topMaxOrderCount = useMemo(
    () => Math.max(1, ...topSellingProducts.map((item) => item.orderCount || 0)),
    [topSellingProducts]
  );

  const kpiCards = [
    {
      title: "Total orders",
      value: adminStats?.totalOrders || 0,
      icon: ShoppingCart,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
      helper: "All-time order volume",
    },
    {
      title: "Orders processing",
      value: processingOrders,
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      helper: "Need operational attention",
    },
    {
      title: "Completed orders",
      value: completedOrders,
      icon: ShoppingCart,
      color: "text-green-600",
      bgColor: "bg-green-100",
      helper: "Orders successfully finished",
    },
    {
      title: "Risk alerts",
      value: refundOrders + cancelledOrders + (productStats?.outOfStock || 0),
      icon: AlertTriangle,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      helper: "Refund, cancel, out-of-stock",
    },
  ];

  const busy =
    adminStatsLoading || productStatsLoading || categoryStatsLoading || revenueOrdersLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          The essential overview for business direction and daily operation
        </p>
      </div>

      {/* Revenue chart */}
      <Card className="shadow-sm">
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-800">Revenue overview</CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              Revenue from completed orders, grouped by day, month, year
            </p>
          </div>
          <div className="inline-flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
            {[
              { key: "day", label: "Day" },
              { key: "month", label: "Month" },
              { key: "year", label: "Year" },
            ].map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => setRevenuePeriod(option.key)}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  realRevenuePeriod === option.key
                    ? "bg-white text-emerald-700 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowSpecificSelector((prev) => !prev)}
              className="px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700"
            >
              Select specific {realRevenuePeriod}
            </button>
            {showSpecificSelector && (
              <div className="absolute right-0 mt-2 w-64 rounded-lg border border-gray-200 bg-white shadow-lg p-3 z-10">
                <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
                  {realRevenuePeriod === "day"
                    ? "Choose day"
                    : realRevenuePeriod === "month"
                    ? "Choose month"
                    : "Choose year"}
                </label>
                <select
                  value={selectedPeriodKey}
                  onChange={(e) => setSelectedPeriodKey(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="">
                    {realRevenuePeriod === "day"
                      ? "All days"
                      : realRevenuePeriod === "month"
                      ? "All months"
                      : "All years"}
                  </option>
                  {periodOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <div className="mt-2 text-xs text-gray-500">
                  Showing: <span className="font-medium text-gray-700">{selectedOptionLabel}</span>
                </div>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 mb-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-emerald-700">Total revenue</p>
                <p className="text-xl font-bold text-emerald-800 mt-1">
                  {formatCurrency(totalRevenue)} VND
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <TrendingUp size={20} />
              </div>
            </div>
          </div>
          {busy ? (
            <div className="h-72 flex items-center justify-center text-sm text-gray-500">
              Loading revenue chart...
            </div>
          ) : filteredRevenueSeries.length > 0 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filteredRevenueSeries}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `${Math.round(toNumber(value) / 1000000)}M`}
                  />
                  <Tooltip
                    formatter={(value) => [`${formatCurrency(value)} VND`, "Revenue"]}
                    contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb" }}
                  />
                  <Bar dataKey="revenue" fill="#16a34a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center text-sm text-gray-500 bg-gray-50 rounded-lg">
              No revenue data for selected {realRevenuePeriod}.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-800">
                  {busy ? "..." : stat.value}
                </div>
                <div className="text-xs mt-2 text-gray-500">
                  {stat.helper}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Top selling products */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800">
            Top 5 best-selling products
          </CardTitle>
          <p className="text-sm text-gray-500 mt-1">
            Ranked by appearances in completed orders (not by revenue)
          </p>
        </CardHeader>
        <CardContent>
          {revenueOrdersLoading ? (
            <div className="text-sm text-gray-500">Loading top products...</div>
          ) : topSellingProducts.length > 0 ? (
            <div className="space-y-3">
              {topSellingProducts.map((product, index) => {
                const barPercent = Math.round((product.orderCount / topMaxOrderCount) * 100);
                return (
                  <div key={product.id} className="rounded-lg border border-gray-100 p-3 bg-gray-50/60">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center">
                          {index + 1}
                        </div>
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-9 h-9 rounded object-cover border border-gray-200"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded bg-gray-200 text-gray-500 flex items-center justify-center">
                            <Package size={16} />
                          </div>
                        )}
                        <p className="text-sm font-medium text-gray-800 truncate">{product.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">
                          Appeared in {product.orderCount} completed orders
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-gray-200 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${barPercent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-sm text-gray-500">
              No product sales data found in completed orders.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent orders */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Recent orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            {adminLoading ? (
              <div className="text-sm text-gray-500">Loading recent orders...</div>
            ) : adminOrders?.length > 0 ? (
              <div className="space-y-4">
                {adminOrders.map((order) => {
                  const normalizedStatus = normalizeStatus(order?.order_status_id?.name);
                  return (
                    <div
                      key={order._id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-800">#{String(order._id).slice(-8)}</p>
                        <p className="text-sm text-gray-500">
                          {order.receiver_name || "Unknown customer"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-800">
                          {formatCurrency(order.total_price)} VND
                        </p>
                        <p
                          className={`text-xs inline-block px-2 py-0.5 rounded-full mt-1 ${statusBadgeClass(normalizedStatus)}`}
                        >
                          {statusLabel(normalizedStatus)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-sm text-gray-500">No recent orders</div>
            )}
            <Link
              to="/admin/orders"
              className="mt-4 inline-flex items-center gap-2 text-sm text-emerald-700 hover:text-emerald-800 font-medium"
            >
              Go to order management
              <ArrowRight size={16} />
            </Link>
          </CardContent>
        </Card>

        {/* Quick actions */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Quick actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Link
                to="/admin/orders"
                className="p-3 bg-purple-50 hover:bg-purple-100 rounded-lg text-center transition-colors text-sm font-medium text-gray-800"
              >
                Orders
              </Link>
              <Link
                to="/admin/refund-orders"
                className="p-3 bg-orange-50 hover:bg-orange-100 rounded-lg text-center transition-colors text-sm font-medium text-gray-800"
              >
                Refunds
              </Link>
              <Link
                to="/admin/product"
                className="p-3 bg-blue-50 hover:bg-blue-100 rounded-lg text-center transition-colors text-sm font-medium text-gray-800"
              >
                Products
              </Link>
              <Link
                to="/admin/shop"
                className="p-3 bg-green-50 hover:bg-green-100 rounded-lg text-center transition-colors text-sm font-medium text-gray-800"
              >
                Shop info
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPage;
