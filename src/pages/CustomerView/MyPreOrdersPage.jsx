import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Package,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  MapPin,
  Calendar,
  User,
  CreditCard,
} from "lucide-react";
import api from "../../api";

const formatCurrency = (n) =>
  n != null ? (n || 0).toLocaleString("en-US", { maximumFractionDigits: 0 }) + " VND" : "—";

const formatDate = (d) =>
  d ? new Date(d).toLocaleString("en-US") : "N/A";

const STATUS_LABEL = {
  WAITING_FOR_ALLOCATION: "Waiting for allocation",
  WAITING_FOR_NEXT_BATCH: "Waiting for next batch",
  ALLOCATED_WAITING_PAYMENT: "Allocated, pay remaining",
  READY_FOR_FULFILLMENT: "Ready for fulfillment",
  COMPLETED: "Completed",
  REFUND: "Refund",
  WAITING_FOR_PRODUCT: "Waiting for allocation (legacy)",
};

const STATUS_OPTIONS = [
  { value: "", label: "All" },
  { value: "WAITING_FOR_ALLOCATION", label: "Waiting for allocation" },
  { value: "WAITING_FOR_NEXT_BATCH", label: "Waiting for next batch" },
  { value: "ALLOCATED_WAITING_PAYMENT", label: "Allocated, pay remaining" },
  { value: "READY_FOR_FULFILLMENT", label: "Ready for fulfillment" },
  { value: "COMPLETED", label: "Completed" },
  { value: "REFUND", label: "Refund" },
];

const FILTERABLE_STATUSES = STATUS_OPTIONS.filter((s) => s.value !== "");

const STATUS_BADGE = {
  COMPLETED: "bg-green-100 text-green-800",
  READY_FOR_FULFILLMENT: "bg-green-100 text-green-700",
  ALLOCATED_WAITING_PAYMENT: "bg-purple-100 text-purple-800",
  WAITING_FOR_NEXT_BATCH: "bg-amber-100 text-amber-800",
  WAITING_FOR_ALLOCATION: "bg-gray-100 text-gray-700",
  WAITING_FOR_PRODUCT: "bg-gray-100 text-gray-600",
  REFUND: "bg-red-100 text-red-800",
};

export default function MyPreOrdersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [list, setList] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [payingRemainingId, setPayingRemainingId] = useState(null);
  const [detailId, setDetailId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  const load = (page = 1, overrides = {}) => {
    setLoading(true);
    setErr("");
    const params = {
      page,
      limit: overrides.limit ?? pagination.limit ?? 10,
      sortBy: overrides.sortBy ?? sortBy,
      sortOrder: overrides.sortOrder ?? sortOrder,
    };
    const status = overrides.status !== undefined ? overrides.status : statusFilter;
    if (status) params.status = status;
    api
      .get("/preorder/my-pre-orders", { params })
      .then((res) => {
        if (res.data && res.data.data) setList(res.data.data);
        if (res.data && res.data.pagination) setPagination(res.data.pagination);
      })
      .catch(() => setErr("Could not load pre-orders."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load(1);
  }, []);

  useEffect(() => {
    const remaining = searchParams.get("remaining");
    if (remaining === "success") {
      setMsg("Remaining payment successful.");
      setSearchParams({}, { replace: true });
    } else if (remaining === "failed") {
      setErr("Remaining payment failed or cancelled.");
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleSortChange = (e) => {
    const [sby, sord] = e.target.value.split(":");
    setSortBy(sby);
    setSortOrder(sord);
    load(1, { sortBy: sby, sortOrder: sord });
  };

  const handleStatusFilter = (value) => {
    setStatusFilter(value);
    setPagination((p) => ({ ...p, page: 1 }));
    load(1, { status: value || undefined });
  };

  const handlePayRemaining = (id) => {
    setPayingRemainingId(id);
    setErr("");
    api
      .post(`/preorder/create-remaining-payment/${id}`)
      .then((res) => {
        if (res.data && res.data.payUrl) {
          window.location.href = res.data.payUrl;
          return;
        }
        setErr("Could not create payment link.");
      })
      .catch((e) => setErr(e.response?.data?.message || "Could not create payment link."))
      .finally(() => setPayingRemainingId(null));
  };

  const renderStatusBadge = (status) => {
    const label = STATUS_LABEL[status] || status || "N/A";
    const badgeClass = STATUS_BADGE[status] || "bg-gray-100 text-gray-800";
    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${badgeClass}`}
      >
        {label}
      </span>
    );
  };

  const totalPages = pagination?.totalPages || Math.ceil((pagination?.total || 0) / (pagination?.limit || 10)) || 1;
  const displayList = list.filter((po) => po.status !== "CANCELLED");
  const page = pagination?.page || 1;

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-16">
      {/* Full-width header strip (same as Order history) */}
      <section className="w-full border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-green-100 text-green-600">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  My Pre-orders
                </h1>
                <p className="text-gray-500 text-sm mt-0.5">
                  View and manage your pre-orders
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Message / Error (same placement as order) */}
        {(msg || err) && (
          <div className="mb-6">
            {msg && (
              <div className="p-4 bg-green-50 border border-green-200 text-green-800 rounded-xl text-sm font-medium">
                {msg}
              </div>
            )}
            {err && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium">
                {err}
              </div>
            )}
          </div>
        )}

        {/* Filter bar (same layout as Order history) */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-gray-600 mr-1 hidden sm:inline">
              Status:
            </span>
            <button
              type="button"
              onClick={() => handleStatusFilter("")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                statusFilter === ""
                  ? "bg-green-600 text-white"
                  : "bg-white border border-gray-300 text-gray-600 hover:border-green-400 hover:text-green-700"
              }`}
            >
              All
            </button>
            {FILTERABLE_STATUSES.map((opt) => {
              const isActive = statusFilter === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleStatusFilter(opt.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-green-600 text-white"
                      : "bg-white border border-gray-300 text-gray-600 hover:border-green-400 hover:text-green-700"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-sm font-medium text-gray-600">Sort:</span>
            <select
              value={`${sortBy}:${sortOrder}`}
              onChange={handleSortChange}
              className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none cursor-pointer min-w-[160px]"
            >
              <option value="createdAt:desc">Newest first</option>
              <option value="createdAt:asc">Oldest first</option>
              <option value="totalAmount:desc">Total (high → low)</option>
              <option value="totalAmount:asc">Total (low → high)</option>
            </select>
          </div>
        </div>

        {/* List card (same container as Order history) */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-20 text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-100 text-green-600 mb-4">
                <Package className="w-7 h-7 animate-pulse" />
              </div>
              <p className="text-gray-600 font-medium">
                Loading pre-orders...
              </p>
              <p className="text-gray-400 text-sm mt-1">Please wait a moment</p>
            </div>
          ) : displayList.length === 0 ? (
            <div className="py-20 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 text-gray-400 mb-4">
                <Package className="w-10 h-10" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                No pre-orders yet
              </h3>
              <p className="text-gray-500 text-sm max-w-md mx-auto">
                When you place a pre-order, it will show up here. Visit Pre-order to get started.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {displayList.map((po) => {
                const ft = po.fruitTypeId;
                const isDetailOpen = detailId === po._id;
                return (
                  <div
                    key={po._id}
                    className="flex flex-col xl:flex-row xl:items-stretch gap-0 hover:bg-gray-50/80 transition-colors"
                  >
                    {/* Left: Pre-order ID + Status (same column as Order) */}
                    <div className="xl:w-56 flex-shrink-0 p-4 xl:py-5 xl:pr-0 flex flex-row xl:flex-col justify-between xl:justify-center gap-2 border-b xl:border-b-0 xl:border-r border-gray-100">
                      <span
                        className="text-xs font-mono text-gray-500 truncate max-w-[140px] xl:max-w-none"
                        title={po._id}
                      >
                        {po._id}
                      </span>
                      <span className="text-xs text-gray-500 xl:mt-1">Pre-order</span>
                      {renderStatusBadge(po.status)}
                    </div>

                    {/* Center: Date, Product, Recipient, Address (same grid as Order) */}
                    <div className="flex-1 min-w-0 p-4 xl:py-6 xl:px-7">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2.5 text-gray-700">
                          <div className="p-1.5 bg-gray-50 rounded-lg">
                            <Calendar className="w-4 h-4 text-gray-500" />
                          </div>
                          <span className="font-medium">{formatDate(po.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-gray-700 md:col-span-2 min-w-0">
                          <div className="p-1.5 bg-gray-50 rounded-lg flex-shrink-0">
                            <Package className="w-4 h-4 text-gray-500" />
                          </div>
                          <span className="truncate font-medium">
                            {ft?.name || "—"} · {po.quantityKg} kg
                          </span>
                        </div>
                        <div className="flex items-center gap-2.5 text-gray-700 md:col-span-2 min-w-0">
                          <div className="p-1.5 bg-gray-50 rounded-lg flex-shrink-0">
                            <User className="w-4 h-4 text-gray-500" />
                          </div>
                          <span className="truncate font-medium">
                            {po.receiver_name || "—"} <span className="text-gray-400">·</span>{" "}
                            <span className="text-gray-600">{po.receiver_phone || "—"}</span>
                          </span>
                        </div>
                        <div className="flex items-start gap-2.5 text-gray-600 md:col-span-3 min-w-0">
                          <div className="p-1.5 bg-gray-50 rounded-lg flex-shrink-0">
                            <MapPin className="w-4 h-4 text-gray-500" />
                          </div>
                          <span className="truncate font-medium mt-1">
                            {po.receiver_address || "—"}
                          </span>
                        </div>
                        {po.canPayRemaining && (po.remainingAmount || 0) > 0 && (
                          <div className="md:col-span-3 flex items-center gap-2 text-green-600 font-medium">
                            <CreditCard className="w-4 h-4" />
                            <span>Remaining to pay: {formatCurrency(po.remainingAmount)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Total, Deposit/Remaining, Actions (same column as Order) */}
                    <div className="flex-shrink-0 p-4 xl:py-5 xl:pl-6 flex flex-row xl:flex-col items-center xl:items-end justify-between xl:justify-center gap-3 border-t xl:border-t-0 xl:border-l border-gray-100 bg-gray-50/50 xl:bg-transparent">
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">
                          {formatCurrency(po.totalAmount)}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          Deposit: {formatCurrency(po.depositPaid)}
                          {(po.remainingAmount || 0) > 0 && (
                            <> · Remaining: {formatCurrency(po.remainingAmount)}</>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setDetailId((prev) => (prev === po._id ? null : po._id))}
                          className="px-3 py-2 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition-colors cursor-pointer"
                        >
                          {isDetailOpen ? "Hide details" : "View details"}
                        </button>
                        {po.canPayRemaining && (
                          <button
                            type="button"
                            onClick={() => handlePayRemaining(po._id)}
                            disabled={payingRemainingId === po._id}
                            className="px-3 py-2 rounded-lg text-sm font-medium border border-green-200 text-green-600 hover:bg-green-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {payingRemainingId === po._id ? "Processing..." : "Pay remaining"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Inline detail (pre-order logic unchanged) */}
          {list.length > 0 && detailId && (
            <div className="border-t border-gray-200 bg-gray-50/50">
              {list
                .filter((po) => po._id === detailId)
                .map((po) => (
                  <div key={po._id} className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600 mb-1">Receiver</p>
                        <p className="text-gray-900 font-medium">{po.receiver_name || "—"}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 mb-1">Phone</p>
                        <p className="text-gray-900 font-medium">{po.receiver_phone || "—"}</p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-gray-600 mb-1">Delivery address</p>
                        <p className="text-gray-900 font-medium">{po.receiver_address || "—"}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 mb-1">Total amount</p>
                        <p className="text-gray-900 font-medium">{formatCurrency(po.totalAmount)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 mb-1">Deposit paid</p>
                        <p className="text-gray-900 font-medium">{formatCurrency(po.depositPaid)}</p>
                      </div>
                      {(po.remainingAmount || 0) > 0 && (
                        <div>
                          <p className="text-gray-600 mb-1">Remaining amount</p>
                          <p className="text-green-700 font-medium">{formatCurrency(po.remainingAmount)}</p>
                        </div>
                      )}
                      {po.remainingPaidAt && (
                        <div>
                          <p className="text-gray-600 mb-1">Remaining paid at</p>
                          <p className="text-gray-900 font-medium">{formatDate(po.remainingPaidAt)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          )}

          {list.length > 0 && totalPages > 1 && (
            <div className="px-4 py-4 border-t border-gray-200 flex items-center justify-center gap-3 bg-gray-50">
              <button
                type="button"
                onClick={() => load(page - 1)}
                disabled={page <= 1}
                className="p-2.5 rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="text-sm font-medium text-gray-700 min-w-[100px] text-center">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => load(page + 1)}
                disabled={page >= totalPages}
                className="p-2.5 rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
