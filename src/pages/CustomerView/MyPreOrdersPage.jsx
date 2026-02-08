import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Package, ChevronLeft, ChevronRight } from "lucide-react";
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
  WAITING_FOR_PRODUCT: "Waiting for allocation (legacy)",
};

const STATUS_OPTIONS = [
  { value: "", label: "All" },
  { value: "WAITING_FOR_ALLOCATION", label: "Waiting for allocation" },
  { value: "WAITING_FOR_NEXT_BATCH", label: "Waiting for next batch" },
  { value: "ALLOCATED_WAITING_PAYMENT", label: "Allocated, pay remaining" },
  { value: "READY_FOR_FULFILLMENT", label: "Ready for fulfillment" },
  { value: "COMPLETED", label: "Completed" },
];

const FILTERABLE_STATUSES = STATUS_OPTIONS.filter((s) => s.value !== "");

const STATUS_BADGE = {
  COMPLETED: "bg-green-100 text-green-800",
  READY_FOR_FULFILLMENT: "bg-green-100 text-green-700",
  ALLOCATED_WAITING_PAYMENT: "bg-purple-100 text-purple-800",
  WAITING_FOR_NEXT_BATCH: "bg-amber-100 text-amber-800",
  WAITING_FOR_ALLOCATION: "bg-gray-100 text-gray-700",
  WAITING_FOR_PRODUCT: "bg-gray-100 text-gray-600",
};

export default function MyPreOrdersPage() {
  const navigate = useNavigate();
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
  const page = pagination?.page || 1;

  return (
    <div className="px-6 pt-24 pb-6">
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-gray-900">My Pre-orders</h1>
          <p className="text-sm text-gray-600 mt-1">
            View and manage your pre-orders
          </p>
        </div>

        {(msg || err) && (
          <div className="px-6 pt-4">
            {msg && (
              <div className="mb-2 p-3 bg-green-50 border border-green-200 text-green-800 rounded-lg text-sm font-medium">
                {msg}
              </div>
            )}
            {err && (
              <div className="mb-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm font-medium">
                {err}
              </div>
            )}
          </div>
        )}

        <div className="p-6 border-b bg-gray-50">
          <div className="flex flex-col md:flex-row md:items-start gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleStatusFilter("")}
                  className={`px-3 py-2 rounded-lg border text-sm ${
                    statusFilter === ""
                      ? "bg-green-600 text-white border-green-600"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50"
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
                      className={`px-3 py-2 rounded-lg border text-sm ${
                        isActive
                          ? "bg-green-600 text-white border-green-600"
                          : "border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort
              </label>
              <select
                value={`${sortBy}:${sortOrder}`}
                onChange={handleSortChange}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="createdAt:desc">Newest first</option>
                <option value="createdAt:asc">Oldest first</option>
                <option value="totalAmount:desc">Total: high to low</option>
                <option value="totalAmount:asc">Total: low to high</option>
              </select>
            </div>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="py-10 text-center text-gray-600">
              Loading pre-orders...
            </div>
          ) : list.length === 0 ? (
            <div className="py-12 text-center text-gray-600">
              <Package className="mx-auto mb-3 text-gray-400" size={32} />
              No pre-orders yet
            </div>
          ) : (
            <div className="space-y-4">
              {list.map((po) => {
                const ft = po.fruitTypeId;
                const isDetailOpen = detailId === po._id;
                return (
                  <div
                    key={po._id}
                    className="border rounded-lg p-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-500">
                          Pre-order ID: {po._id}
                        </span>
                        {renderStatusBadge(po.status)}
                      </div>
                      <div className="text-sm text-gray-700">
                        Order date: {formatDate(po.createdAt)}
                      </div>
                      <div className="text-sm text-gray-700">
                        Product: {ft?.name || "—"} · {po.quantityKg} kg
                      </div>
                      <div className="text-sm text-gray-700">
                        Recipient: {po.receiver_name || "—"} ({po.receiver_phone || "—"})
                      </div>
                      <div className="text-sm text-gray-700">
                        Address: {po.receiver_address || "—"}
                      </div>
                      {po.canPayRemaining && (po.remainingAmount || 0) > 0 && (
                        <div className="text-sm text-green-600 font-medium">
                          Remaining to pay: {formatCurrency(po.remainingAmount)}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-start lg:items-end gap-2">
                      <div className="text-lg font-semibold text-gray-900">
                        {formatCurrency(po.totalAmount)}
                      </div>
                      <div className="text-sm text-gray-600">
                        Deposit: {formatCurrency(po.depositPaid)}
                        {(po.remainingAmount || 0) > 0 && (
                          <> · Remaining: {formatCurrency(po.remainingAmount)}</>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setDetailId((prev) => (prev === po._id ? null : po._id))}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                        >
                          {isDetailOpen ? "Hide details" : "View details"}
                        </button>
                        {po.canPayRemaining && (
                          <button
                            type="button"
                            onClick={() => handlePayRemaining(po._id)}
                            disabled={payingRemainingId === po._id}
                            className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
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

          {list.length > 0 && (
            <>
              {detailId && (
                <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                  {list
                    .filter((po) => po._id === detailId)
                    .map((po) => (
                      <div key={po._id} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600 mb-1">Receiver</p>
                          <p className="text-gray-900">{po.receiver_name || "—"}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 mb-1">Phone</p>
                          <p className="text-gray-900">{po.receiver_phone || "—"}</p>
                        </div>
                        <div className="md:col-span-2">
                          <p className="text-gray-600 mb-1">Delivery address</p>
                          <p className="text-gray-900">{po.receiver_address || "—"}</p>
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
                            <p className="text-gray-900">{formatDate(po.remainingPaidAt)}</p>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              )}

              {pagination && totalPages > 1 && (
                <div className="mt-6 pt-4 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => load(page - 1)}
                    disabled={page <= 1}
                    className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {page} / {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => load(page + 1)}
                    disabled={page >= totalPages}
                    className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
