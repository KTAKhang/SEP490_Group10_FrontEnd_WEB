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
  Download,
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

/** Numbers/dates in the admin revenue UI use English formatting (not vi-VN). */
const DASHBOARD_DISPLAY_LOCALE = "en-US";

const formatCurrency = (value) =>
  (value || 0).toLocaleString(DASHBOARD_DISPLAY_LOCALE, { maximumFractionDigits: 0 });

const MONTH_SHORT_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const MONTH_LONG_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/** Clamp (year, month) so it is not after the current calendar month */
const clampToCurrentCalendarMonth = (year, month) => {
  const now = new Date();
  const cy = now.getFullYear();
  const cm = now.getMonth() + 1;
  const y = Math.min(Number(year), cy);
  let m = Number(month);
  if (Number.isNaN(m) || m < 1) m = 1;
  if (m > 12) m = 12;
  if (y === cy) m = Math.min(m, cm);
  return { year: y, month: m };
};

const formatYearMonthStr = ({ year, month }) =>
  `${year}-${String(month).padStart(2, "0")}`;

/** `YYYY-MM` string for calendar month picker state */
const defaultMonthPickerValue = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
};

/** @returns {{ year: number, month: number } | null} month 1–12 */
const parseMonthPickerValue = (str) => {
  if (!str || typeof str !== "string") return null;
  const [yS, mS] = str.split("-");
  const year = Number(yS);
  const month = Number(mS);
  if (!Number.isFinite(year) || !Number.isFinite(month) || month < 1 || month > 12) return null;
  return { year, month };
};

/** Calendar month 1–12 */
const calendarDaysInMonth = (year, month) => new Date(year, month, 0).getDate();

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

const getPreOrderRevenueValue = (preOrder) =>
  toNumber(
    preOrder?.totalAmount ??
      preOrder?.total_amount ??
      preOrder?.payment?.amount ??
      preOrder?.remainingAmount ??
      0
  );

const getPreOrderRevenueDate = (preOrder) =>
  preOrder?.updatedAt || preOrder?.createdAt || preOrder?.order_date || preOrder?.date || null;

const orderMatchesRevenueDisplayScope = (order, period, effectiveDayCalendar, revenueScopeYear) => {
  const rawDate = getOrderRevenueDate(order);
  const revenue = getOrderRevenueValue(order);
  if (!rawDate || revenue <= 0) return false;
  const d = new Date(rawDate);
  if (Number.isNaN(d.getTime())) return false;
  if (period === "day" && effectiveDayCalendar) {
    return (
      d.getFullYear() === effectiveDayCalendar.year &&
      d.getMonth() + 1 === effectiveDayCalendar.month
    );
  }
  if ((period === "month" || period === "year") && revenueScopeYear != null) {
    return d.getFullYear() === revenueScopeYear;
  }
  return false;
};

const preOrderMatchesRevenueDisplayScope = (
  preOrder,
  period,
  effectiveDayCalendar,
  revenueScopeYear
) => {
  const rawDate = getPreOrderRevenueDate(preOrder);
  const revenue = getPreOrderRevenueValue(preOrder);
  if (!rawDate || revenue <= 0) return false;
  const d = new Date(rawDate);
  if (Number.isNaN(d.getTime())) return false;
  if (period === "day" && effectiveDayCalendar) {
    return (
      d.getFullYear() === effectiveDayCalendar.year &&
      d.getMonth() + 1 === effectiveDayCalendar.month
    );
  }
  if ((period === "month" || period === "year") && revenueScopeYear != null) {
    return d.getFullYear() === revenueScopeYear;
  }
  return false;
};

const sumOrdersRevenueDisplayScope = (
  orders,
  period,
  effectiveDayCalendar,
  revenueScopeYear
) =>
  Array.isArray(orders)
    ? orders.reduce((sum, order) => {
        if (!orderMatchesRevenueDisplayScope(order, period, effectiveDayCalendar, revenueScopeYear)) {
          return sum;
        }
        return sum + getOrderRevenueValue(order);
      }, 0)
    : 0;

const sumPreOrdersRevenueDisplayScope = (
  preOrders,
  period,
  effectiveDayCalendar,
  revenueScopeYear
) =>
  Array.isArray(preOrders)
    ? preOrders.reduce((sum, po) => {
        if (
          !preOrderMatchesRevenueDisplayScope(po, period, effectiveDayCalendar, revenueScopeYear)
        ) {
          return sum;
        }
        return sum + getPreOrderRevenueValue(po);
      }, 0)
    : 0;

const getPreOrderStatus = (preOrder) =>
  normalizeStatus(preOrder?.status || preOrder?.pre_order_status || preOrder?.status_name);

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

const buildEmptyPeriodSeries = (period, daysInMonth = 31) => {
  if (period === "day") {
    const n = Math.min(31, Math.max(28, Number(daysInMonth) || 31));
    return Array.from({ length: n }, (_, i) => {
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
        label: MONTH_SHORT_NAMES[i],
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

/**
 * @param opts.calendarYear / opts.calendarMonth — when period is "day", only aggregate in that calendar month (1–12)
 * @param opts.filterYear — when period is "month" | "year", only include revenue in that calendar year (year chart = single bar)
 * @param preOrders — completed pre-orders; revenue is merged into the same buckets as orders
 */
const buildRevenueSeriesFromOrders = (orders, period, opts = {}, preOrders = []) => {
  const calY = opts.calendarYear;
  const calM = opts.calendarMonth;
  const filterCalendarYear = opts.filterYear;
  const dayFilter =
    period === "day" && calY != null && calM != null
      ? { year: calY, month: calM }
      : null;
  const daysInSelectedMonth = dayFilter
    ? calendarDaysInMonth(dayFilter.year, dayFilter.month)
    : 31;

  const ordersArr = Array.isArray(orders) ? orders : [];
  const preArr = Array.isArray(preOrders) ? preOrders : [];
  if (ordersArr.length === 0 && preArr.length === 0) {
    if (period === "day" && dayFilter) {
      return buildEmptyPeriodSeries(period, daysInSelectedMonth);
    }
    return buildEmptyPeriodSeries(period);
  }

  const dayMap = new Map();
  const monthMap = new Map();
  const yearMap = new Map();

  const pushRevenue = (rawDate, revenue) => {
    if (!rawDate || revenue <= 0) return;
    const d = new Date(rawDate);
    if (Number.isNaN(d.getTime())) return;

    if (dayFilter) {
      if (d.getFullYear() !== dayFilter.year || d.getMonth() + 1 !== dayFilter.month) return;
    }
    if (
      (period === "month" || period === "year") &&
      filterCalendarYear != null &&
      d.getFullYear() !== filterCalendarYear
    ) {
      return;
    }

    const y = d.getFullYear();
    const monthNum = d.getMonth() + 1;
    const dayNum = d.getDate();

    dayMap.set(dayNum, (dayMap.get(dayNum) || 0) + revenue);
    monthMap.set(monthNum, (monthMap.get(monthNum) || 0) + revenue);
    yearMap.set(`${y}`, (yearMap.get(`${y}`) || 0) + revenue);
  };

  ordersArr.forEach((order) =>
    pushRevenue(getOrderRevenueDate(order), getOrderRevenueValue(order))
  );
  preArr.forEach((po) =>
    pushRevenue(getPreOrderRevenueDate(po), getPreOrderRevenueValue(po))
  );

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
          label: MONTH_SHORT_NAMES[Number(key) - 1] || String(key),
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
    const dim = dayFilter ? daysInSelectedMonth : 31;
    return Array.from({ length: dim }, (_, i) => {
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
        label: MONTH_SHORT_NAMES[i],
        revenue: valueMap.get(month) || 0,
        rawKey: month,
        orderKey: month,
      };
    });
  }
  if (period === "year") {
    if (filterCalendarYear != null) {
      const yk = `${filterCalendarYear}`;
      return [
        {
          label: yk,
          revenue: yearMap.get(yk) || 0,
          rawKey: yk,
          orderKey: filterCalendarYear,
        },
      ];
    }
    return sortSeriesByPeriod(toSeries(yearMap, "year"), "year");
  }
  return [];
};

const AdminPage = () => {
  const [revenuePeriod, setRevenuePeriod] = useState("day");
  /** For "Day" chart: which calendar month to show (defaults to current month on first load) */
  const [revenueDayViewMonth, setRevenueDayViewMonth] = useState(() => defaultMonthPickerValue());
  const [revenueOrders, setRevenueOrders] = useState([]);
  const [revenueOrdersLoading, setRevenueOrdersLoading] = useState(false);
  const [completedPreOrders, setCompletedPreOrders] = useState([]);
  const [revenuePreOrdersLoading, setRevenuePreOrdersLoading] = useState(false);
  /** Orders / KPI for Month & Year views: filter completed revenue to this calendar year */
  const [revenueScopeYear, setRevenueScopeYear] = useState(() => new Date().getFullYear());
  const [exportingExcel, setExportingExcel] = useState(false);
  const dispatch = useDispatch();
  const { adminStats, adminStatsLoading, adminOrders, adminLoading } = useSelector(
    (state) => state.order || {}
  );
  const { productStats, productStatsLoading } = useSelector((state) => state.product || {});
  const { categoryStats, categoryStatsLoading } = useSelector((state) => state.category || {});

  const dayViewYearMonthParsed = useMemo(() => {
    const p = parseMonthPickerValue(revenueDayViewMonth);
    if (p) return clampToCurrentCalendarMonth(p.year, p.month);
    return clampToCurrentCalendarMonth(
      new Date().getFullYear(),
      new Date().getMonth() + 1
    );
  }, [revenueDayViewMonth]);

  const revenueYearOptions = useMemo(() => {
    const cy = new Date().getFullYear();
    const list = [];
    for (let y = cy; y >= cy - 15; y -= 1) list.push(y);
    return list;
  }, []);

  const revenueMonthChoices = useMemo(() => {
    const now = new Date();
    const cy = now.getFullYear();
    const cm = now.getMonth() + 1;
    const maxM = dayViewYearMonthParsed.year === cy ? cm : 12;
    return Array.from({ length: maxM }, (_, i) => i + 1);
  }, [dayViewYearMonthParsed.year]);

  const setRevenueDayViewYearMonth = (year, month) => {
    const { year: y, month: m } = clampToCurrentCalendarMonth(year, month);
    setRevenueDayViewMonth(formatYearMonthStr({ year: y, month: m }));
  };

  useEffect(() => {
    const canonical = formatYearMonthStr(dayViewYearMonthParsed);
    if (canonical !== revenueDayViewMonth) {
      setRevenueDayViewMonth(canonical);
    }
  }, [revenueDayViewMonth, dayViewYearMonthParsed]);

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

  useEffect(() => {
    let isMounted = true;

    const fetchCompletedPreOrdersForRevenue = async () => {
      setRevenuePreOrdersLoading(true);
      try {
        const allPreOrders = [];
        let page = 1;
        const limit = 100;
        let totalPages = 1;

        do {
          const res = await apiClient.get("/admin/preorder/pre-orders", {
            params: {
              page,
              limit,
              sortBy: "createdAt",
              sortOrder: "asc",
            },
          });

          const payload = res?.data;
          const rows = Array.isArray(payload?.data) ? payload.data : [];
          allPreOrders.push(...rows);

          totalPages = Number(payload?.pagination?.totalPages || 1);
          page += 1;
        } while (page <= totalPages && page <= 100);

        const completedOnly = allPreOrders.filter(
          (item) => getPreOrderStatus(item) === "COMPLETED"
        );
        if (isMounted) setCompletedPreOrders(completedOnly);
      } catch {
        if (isMounted) setCompletedPreOrders([]);
      } finally {
        if (isMounted) setRevenuePreOrdersLoading(false);
      }
    };

    fetchCompletedPreOrdersForRevenue();
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
  const effectiveDayCalendar = useMemo(() => {
    if (realRevenuePeriod !== "day") return null;
    return dayViewYearMonthParsed;
  }, [realRevenuePeriod, dayViewYearMonthParsed]);
  const revenueSeriesFromOrders = useMemo(() => {
    let calendarOpts = {};
    if (realRevenuePeriod === "day" && effectiveDayCalendar) {
      calendarOpts = {
        calendarYear: effectiveDayCalendar.year,
        calendarMonth: effectiveDayCalendar.month,
      };
    } else if (realRevenuePeriod === "month" || realRevenuePeriod === "year") {
      calendarOpts = { filterYear: revenueScopeYear };
    }
    return buildRevenueSeriesFromOrders(
      revenueOrders,
      realRevenuePeriod,
      calendarOpts,
      completedPreOrders
    );
  }, [revenueOrders, completedPreOrders, realRevenuePeriod, effectiveDayCalendar, revenueScopeYear]);
  /** Day / Month / Year charts all use orders + pre-orders so scope (e.g. Totals year) matches the chart. */
  const revenueSeries = useMemo(() => revenueSeriesFromOrders, [revenueSeriesFromOrders]);
  const ordersRevenueTotal = useMemo(
    () =>
      sumOrdersRevenueDisplayScope(
        revenueOrders,
        realRevenuePeriod,
        effectiveDayCalendar,
        revenueScopeYear
      ),
    [revenueOrders, realRevenuePeriod, effectiveDayCalendar, revenueScopeYear]
  );
  const preOrdersRevenueTotal = useMemo(
    () =>
      sumPreOrdersRevenueDisplayScope(
        completedPreOrders,
        realRevenuePeriod,
        effectiveDayCalendar,
        revenueScopeYear
      ),
    [completedPreOrders, realRevenuePeriod, effectiveDayCalendar, revenueScopeYear]
  );
  const totalRevenueCombined = useMemo(
    () => ordersRevenueTotal + preOrdersRevenueTotal,
    [ordersRevenueTotal, preOrdersRevenueTotal]
  );
  const topSellingFilteredOrders = useMemo(() => {
    if (!Array.isArray(revenueOrders)) return [];
    return revenueOrders.filter((o) =>
      orderMatchesRevenueDisplayScope(o, realRevenuePeriod, effectiveDayCalendar, revenueScopeYear)
    );
  }, [revenueOrders, realRevenuePeriod, effectiveDayCalendar, revenueScopeYear]);
  const topSellingProducts = useMemo(
    () => aggregateTopSellingProducts(topSellingFilteredOrders, 5),
    [topSellingFilteredOrders]
  );
  const topMaxOrderCount = useMemo(
    () => Math.max(1, ...topSellingProducts.map((item) => item.orderCount || 0)),
    [topSellingProducts]
  );

  const revenueDisplayScopeCaption = useMemo(() => {
    if (realRevenuePeriod === "day" && effectiveDayCalendar) {
      return `Amounts above: ${MONTH_LONG_NAMES[effectiveDayCalendar.month - 1]} ${effectiveDayCalendar.year} only (completed orders & pre-orders).`;
    }
    if (realRevenuePeriod === "month") {
      return `Amounts above: full calendar year ${revenueScopeYear} (completed orders & pre-orders). Chart shows each month in that year.`;
    }
    if (realRevenuePeriod === "year") {
      return `Amounts above: calendar year ${revenueScopeYear} only (completed orders & pre-orders). Chart shows that year.`;
    }
    return "";
  }, [realRevenuePeriod, effectiveDayCalendar, revenueScopeYear]);

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
    adminStatsLoading ||
    productStatsLoading ||
    categoryStatsLoading ||
    revenueOrdersLoading ||
    revenuePreOrdersLoading;

  const handleExportRevenueExcel = async () => {
    setExportingExcel(true);
    try {
      const now = new Date();
      const rows = [
        ["Admin Revenue Dashboard Export"],
        [`Generated at`, now.toLocaleString(DASHBOARD_DISPLAY_LOCALE)],
        [],
        ["Revenue Type", "Amount (VND)"],
        ["Total revenue", totalRevenueCombined],
        ["Revenue from orders", ordersRevenueTotal],
        ["Revenue from pre-orders", preOrdersRevenueTotal],
        [],
        ["Selected chart period", realRevenuePeriod],
        ...(realRevenuePeriod === "day" && effectiveDayCalendar
          ? [
              [
                "Daily chart calendar month",
                `${effectiveDayCalendar.year}-${String(effectiveDayCalendar.month).padStart(2, "0")}`,
              ],
            ]
          : []),
        ...(realRevenuePeriod === "month" || realRevenuePeriod === "year"
          ? [["Year scope (dashboard totals)", revenueScopeYear]]
          : []),
        [],
        ["Chart details"],
        ["Label", "Revenue (VND)"],
        ...revenueSeries.map((item) => [item.label, toNumber(item.revenue)]),
      ];

      const escapeXml = (value) =>
        String(value ?? "")
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&apos;");

      const xmlRows = rows
        .map((cols) => {
          const cells = cols
            .map((col) => {
              const isNumber = typeof col === "number";
              return `<Cell><Data ss:Type="${isNumber ? "Number" : "String"}">${escapeXml(col)}</Data></Cell>`;
            })
            .join("");
          return `<Row>${cells}</Row>`;
        })
        .join("");

      const worksheetXml = `<?xml version="1.0"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Worksheet ss:Name="Revenue">
  <Table>
   ${xmlRows}
  </Table>
 </Worksheet>
</Workbook>`;

      const blob = new Blob([worksheetXml], {
        type: "application/vnd.ms-excel;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const dateStamp = now.toISOString().slice(0, 10);
      a.href = url;
      a.download = `admin-revenue-${dateStamp}.xls`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setExportingExcel(false);
    }
  };

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
          <CardTitle className="text-lg font-semibold text-gray-800 shrink-0">Revenue overview</CardTitle>
          <div className="flex flex-wrap items-center gap-2 md:flex-1 md:justify-end">
          <button
            type="button"
            onClick={handleExportRevenueExcel}
            disabled={busy || exportingExcel}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={16} />
            {exportingExcel ? "Exporting..." : "Export Excel"}
          </button>
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
          {realRevenuePeriod === "day" && (
            <div
              className="inline-flex flex-col sm:flex-row sm:items-center gap-2 text-sm"
              lang="en"
            >
              <span className="text-gray-600 whitespace-nowrap">Calendar month</span>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  aria-label="Year for daily revenue chart"
                  value={dayViewYearMonthParsed.year}
                  onChange={(e) =>
                    setRevenueDayViewYearMonth(
                      Number(e.target.value),
                      dayViewYearMonthParsed.month
                    )
                  }
                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 bg-white text-gray-800 min-w-[4.75rem]"
                >
                  {revenueYearOptions.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
                <select
                  aria-label="Month for daily revenue chart"
                  title="Monthly period shown in the daily revenue chart"
                  value={String(dayViewYearMonthParsed.month).padStart(2, "0")}
                  onChange={(e) =>
                    setRevenueDayViewYearMonth(
                      dayViewYearMonthParsed.year,
                      Number(e.target.value)
                    )
                  }
                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 bg-white text-gray-800 min-w-[9.25rem]"
                >
                  {revenueMonthChoices.map((m) => (
                    <option key={m} value={String(m).padStart(2, "0")}>
                      {MONTH_LONG_NAMES[m - 1]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
          {(realRevenuePeriod === "month" || realRevenuePeriod === "year") && (
            <div className="inline-flex flex-col sm:flex-row sm:items-center gap-2 text-sm" lang="en">
              <span className="text-gray-600 whitespace-nowrap">
                {realRevenuePeriod === "month"
                  ? "Chart year"
                  : "Totals year"}
              </span>
              <select
                aria-label={
                  realRevenuePeriod === "month"
                    ? "Calendar year for the monthly breakdown chart"
                    : "Calendar year for dashboard totals and year chart"
                }
                value={revenueScopeYear}
                onChange={(e) => setRevenueScopeYear(Number(e.target.value))}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 bg-white text-gray-800 min-w-[5rem]"
              >
                {revenueYearOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-2">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider text-emerald-700">Total revenue</p>
                  <p className="text-xl font-bold text-emerald-800 mt-1">
                    {formatCurrency(totalRevenueCombined)} VND
                  </p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <TrendingUp size={20} />
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider text-blue-700">Revenue from orders</p>
                  <p className="text-xl font-bold text-blue-800 mt-1">
                    {formatCurrency(ordersRevenueTotal)} VND
                  </p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                  <ShoppingCart size={20} />
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-purple-200 bg-purple-50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider text-purple-700">Revenue from pre-orders</p>
                  <p className="text-xl font-bold text-purple-800 mt-1">
                    {formatCurrency(preOrdersRevenueTotal)} VND
                  </p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                  <CalendarDays size={20} />
                </div>
              </div>
            </div>
          </div>
          {revenueDisplayScopeCaption ? (
            <p className="text-xs text-gray-500 mb-4 px-0.5">{revenueDisplayScopeCaption}</p>
          ) : null}
          {busy ? (
            <div className="h-72 flex items-center justify-center text-sm text-gray-500">
              Loading revenue chart...
            </div>
          ) : revenueSeries.length > 0 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueSeries}>
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
