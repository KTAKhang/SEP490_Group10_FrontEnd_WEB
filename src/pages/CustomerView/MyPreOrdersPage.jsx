import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../api";

const formatCurrency = (n) => (n != null ? (n || 0).toLocaleString("en-US", { maximumFractionDigits: 0 }) + " VND" : "—");
const formatDate = (d) =>
  d
    ? new Date(d).toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
    : "";

const STATUS_LABEL = {
  WAITING_FOR_ALLOCATION: "Waiting for allocation",
  WAITING_FOR_NEXT_BATCH: "Waiting for next batch",
  ALLOCATED_WAITING_PAYMENT: "Allocated, pay remaining",
  READY_FOR_FULFILLMENT: "Ready for fulfillment",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  WAITING_FOR_PRODUCT: "Waiting for allocation (legacy)",
};

const STATUS_OPTIONS = [
  { value: "", label: "All orders" },
  { value: "WAITING_FOR_ALLOCATION", label: "Waiting for allocation" },
  { value: "WAITING_FOR_NEXT_BATCH", label: "Waiting for next batch" },
  { value: "ALLOCATED_WAITING_PAYMENT", label: "Allocated, pay remaining" },
  { value: "READY_FOR_FULFILLMENT", label: "Ready for fulfillment" },
  { value: "COMPLETED", label: "Completed" },
];

const statusStyles = {
  COMPLETED: "bg-green-100 text-green-800",
  READY_FOR_FULFILLMENT: "bg-green-100 text-green-700",
  ALLOCATED_WAITING_PAYMENT: "bg-purple-100 text-purple-700",
  WAITING_FOR_NEXT_BATCH: "bg-amber-100 text-amber-700",
  WAITING_FOR_ALLOCATION: "bg-gray-100 text-gray-700",
  WAITING_FOR_PRODUCT: "bg-gray-100 text-gray-600",
  CANCELLED: "bg-gray-100 text-gray-600",
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
    const [sby, sord] = e.target.value.split("-");
    setSortBy(sby);
    setSortOrder(sord);
    load(1, { sortBy: sby, sortOrder: sord });
  };

  const handleStatusFilter = (value) => {
    setStatusFilter(value);
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

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-gray-900 mb-3">My pre-orders</h1>
          <p className="text-gray-600 max-w-3xl">
            Track your pre-orders from deposit to delivery. After your deposit payment succeeds, the order status is <span className="font-medium text-gray-900">Waiting for allocation</span>. Once stock is allocated, the status becomes <span className="font-medium text-gray-900">Allocated, pay remaining</span> — pay the remaining 50% to move to <span className="font-medium text-gray-900">Ready for fulfillment</span>.
          </p>
        </div>

        {msg && (
          <div className="mb-8 p-5 bg-green-50 border border-green-200 text-green-800 rounded-2xl font-medium">
            <i className="ri-checkbox-circle-line text-xl mr-2" />
            {msg}
          </div>
        )}
        {err && (
          <div className="mb-8 p-5 bg-red-50 border border-red-200 text-red-700 rounded-2xl font-medium">
            <i className="ri-error-warning-line text-xl mr-2" />
            {err}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex-1">
                <label className="block text-sm font-bold text-gray-900 mb-3">Filter by status</label>
                <div className="flex flex-wrap gap-2">
                  {STATUS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value || "all"}
                      type="button"
                      onClick={() => handleStatusFilter(opt.value)}
                      className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${statusFilter === opt.value
                          ? "bg-green-600 text-white shadow-md"
                          : "bg-white border border-gray-300 text-gray-700 hover:border-green-600"
                        }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="lg:w-64">
                <label className="block text-sm font-bold text-gray-900 mb-3">Sort by</label>
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={handleSortChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl text-sm bg-white text-gray-700 font-medium focus:ring-2 focus:ring-green-600 focus:border-green-600 outline-none transition-all"
                >
                  <option value="createdAt-desc">Newest first</option>
                  <option value="createdAt-asc">Oldest first</option>
                  <option value="status-asc">Status (A–Z)</option>
                  <option value="status-desc">Status (Z–A)</option>
                  <option value="totalAmount-desc">Total amount (high–low)</option>
                  <option value="totalAmount-asc">Total amount (low–high)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-32">
                <i className="ri-loader-4-line text-6xl text-green-600 animate-spin mb-4" />
                <p className="text-gray-600 font-medium">Loading your orders...</p>
              </div>
            ) : list.length === 0 ? (
              <div className="text-center py-32">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <i className="ri-shopping-bag-3-line text-4xl text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No pre-orders yet</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Start pre-ordering fresh fruits today and track your orders here.
                </p>
                <button
                  type="button"
                  onClick={() => navigate("/customer/pre-orders")}
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-green-600 text-white rounded-full font-bold hover:bg-green-700 transition-all shadow-md hover:shadow-xl"
                >
                  <i className="ri-shopping-bag-3-line text-lg" />
                  Browse pre-orders
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {list.map((po) => {
                  const ft = po.fruitTypeId;
                  const isDetailOpen = detailId === po._id;
                  return (
                    <div key={po._id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all">
                      <div className="p-6">
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 flex-wrap mb-4">
                              <span className="text-sm font-medium text-gray-600">#{po._id?.slice(-8) || "—"}</span>
                              <span className={`inline-flex px-3 py-1.5 rounded-full text-xs font-bold ${statusStyles[po.status] || "bg-gray-100 text-gray-700"}`}>
                                {STATUS_LABEL[po.status] || po.status}
                              </span>
                            </div>
                            <div className="flex items-start gap-4">
                              <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center flex-shrink-0">
                                <i className="ri-plant-line text-3xl text-green-600" />
                              </div>
                              <div className="flex-1">
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">{ft?.name || "—"}</h2>
                                <p className="text-gray-600 font-medium mb-1">
                                  {po.quantityKg} kg × {formatCurrency(ft?.estimatedPrice)}/kg
                                </p>
                                <p className="text-sm text-gray-600">{formatDate(po.createdAt)}</p>
                                {po.canPayRemaining && (po.remainingAmount || 0) > 0 && (
                                  <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-full">
                                    <i className="ri-notification-badge-line text-green-600" />
                                    <span className="text-sm font-bold text-green-700">
                                      Remaining payment: {formatCurrency(po.remainingAmount)}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col items-start lg:items-end gap-4 flex-shrink-0">
                            <div className="text-3xl font-black text-gray-900">{formatCurrency(po.totalAmount)}</div>
                            <div className="flex items-center gap-3 flex-wrap">
                              <button
                                type="button"
                                onClick={() => setDetailId((prev) => (prev === po._id ? null : po._id))}
                                className="inline-flex items-center gap-2 px-5 py-2.5 border border-green-600 text-green-700 rounded-full text-sm font-bold hover:bg-green-50 transition-all"
                              >
                                <i className={isDetailOpen ? "ri-eye-off-line text-lg" : "ri-eye-line text-lg"} />
                                {isDetailOpen ? "Hide details" : "View details"}
                              </button>
                              {po.canPayRemaining && (
                                <button
                                  type="button"
                                  onClick={() => handlePayRemaining(po._id)}
                                  disabled={payingRemainingId === po._id}
                                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-full text-sm font-bold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-xl"
                                >
                                  {payingRemainingId === po._id ? (
                                    <>
                                      <i className="ri-loader-4-line text-lg animate-spin" />
                                      Processing...
                                    </>
                                  ) : (
                                    <>
                                      <i className="ri-secure-payment-line text-lg" />
                                      Pay remaining
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        {isDetailOpen && (
                          <div className="mt-6 pt-6 border-t border-gray-200">
                            <h3 className="font-bold text-gray-900 mb-4">Order details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm font-bold text-gray-900 mb-1">Receiver</p>
                                <p className="text-gray-600">{po.receiver_name || "—"}</p>
                              </div>
                              <div>
                                <p className="text-sm font-bold text-gray-900 mb-1">Phone</p>
                                <p className="text-gray-600">{po.receiver_phone || "—"}</p>
                              </div>
                              <div className="md:col-span-2">
                                <p className="text-sm font-bold text-gray-900 mb-1">Delivery address</p>
                                <p className="text-gray-600">{po.receiver_address || "—"}</p>
                              </div>
                              <div>
                                <p className="text-sm font-bold text-gray-900 mb-1">Total amount</p>
                                <p className="text-gray-600 font-medium">{formatCurrency(po.totalAmount)}</p>
                              </div>
                              <div>
                                <p className="text-sm font-bold text-gray-900 mb-1">Deposit paid</p>
                                <p className="text-gray-600 font-medium">{formatCurrency(po.depositPaid)}</p>
                              </div>
                              {(po.remainingAmount || 0) > 0 && (
                                <div>
                                  <p className="text-sm font-bold text-gray-900 mb-1">Remaining amount</p>
                                  <p className="text-green-700 font-bold">{formatCurrency(po.remainingAmount)}</p>
                                </div>
                              )}
                              {po.remainingPaidAt && (
                                <div>
                                  <p className="text-sm font-bold text-gray-900 mb-1">Remaining paid at</p>
                                  <p className="text-gray-600">{formatDate(po.remainingPaidAt)}</p>
                                </div>
                              )}
                              {ft?.estimatedHarvestDate && (
                                <div>
                                  <p className="text-sm font-bold text-gray-900 mb-1">Estimated harvest</p>
                                  <p className="text-gray-600">{formatDate(ft.estimatedHarvestDate)}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {list.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="text-sm text-gray-600">
                  Showing <span className="font-bold text-gray-900">{((pagination.page - 1) * (pagination.limit || 10)) + 1}–{Math.min(pagination.page * (pagination.limit || 10), pagination.total || 0)}</span> of <span className="font-bold text-gray-900">{pagination.total || 0}</span> orders
                </div>
                <div className="flex items-center gap-4">
                  <select
                    value={pagination.limit || 10}
                    onChange={(e) => load(1, { limit: Number(e.target.value) })}
                    className="px-4 py-2 border border-gray-300 rounded-2xl text-sm text-gray-700 font-medium bg-white focus:ring-2 focus:ring-green-600 focus:border-green-600 outline-none"
                  >
                    <option value={5}>5 per page</option>
                    <option value={10}>10 per page</option>
                    <option value={20}>20 per page</option>
                    <option value={50}>50 per page</option>
                  </select>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => load(pagination.page - 1)}
                      disabled={pagination.page <= 1}
                      className="p-2.5 border border-green-600 text-green-700 rounded-full hover:bg-green-50 disabled:opacity-40 disabled:cursor-not-allowed disabled:border-gray-300 disabled:text-gray-400 transition-all"
                    >
                      <i className="ri-arrow-left-s-line text-xl" />
                    </button>
                    {[...Array(Math.max(1, Math.ceil((pagination.total || 0) / (pagination.limit || 10))))].map((_, i) => {
                      const pageNum = i + 1;
                      const totalPages = Math.ceil((pagination.total || 0) / (pagination.limit || 10)) || 1;
                      if (pageNum === 1 || pageNum === totalPages || (pageNum >= pagination.page - 1 && pageNum <= pagination.page + 1)) {
                        return (
                          <button
                            key={pageNum}
                            type="button"
                            onClick={() => load(pageNum)}
                            className={`min-w-[2.75rem] px-4 py-2.5 rounded-full text-sm font-bold transition-all ${pagination.page === pageNum
                                ? "bg-green-600 text-white shadow-md"
                                : "bg-white border border-gray-300 text-gray-700 hover:border-green-600"
                              }`}
                          >
                            {pageNum}
                          </button>
                        );
                      }
                      if (pageNum === pagination.page - 2 || pageNum === pagination.page + 2) {
                        return (
                          <span key={pageNum} className="px-2 text-gray-400 font-bold">
                            ...
                          </span>
                        );
                      }
                      return null;
                    })}
                    <button
                      type="button"
                      onClick={() => load(pagination.page + 1)}
                      disabled={pagination.page >= Math.ceil((pagination.total || 0) / (pagination.limit || 10))}
                      className="p-2.5 border border-green-600 text-green-700 rounded-full hover:bg-green-50 disabled:opacity-40 disabled:cursor-not-allowed disabled:border-gray-300 disabled:text-gray-400 transition-all"
                    >
                      <i className="ri-arrow-right-s-line text-xl" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {list.length > 0 && (
          <div className="mt-8">
            <button
              type="button"
              onClick={() => navigate("/customer/pre-orders")}
              className="inline-flex items-center gap-2 px-6 py-3 border border-green-600 text-green-700 rounded-full font-bold hover:bg-green-50 transition-all"
            >
              <i className="ri-arrow-left-line text-lg" />
              Back to pre-orders
            </button>
          </div>
        )}
      </div>
    </div>
  );
}