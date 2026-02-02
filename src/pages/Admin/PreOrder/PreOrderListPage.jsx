import { useState, useEffect } from "react";
import apiClient from "../../../utils/axiosConfig";

const STATUS_LABEL = {
  WAITING_FOR_PRODUCT: "Waiting for product",
  READY_FOR_FULFILLMENT: "Ready for fulfillment",
  COMPLETED: "Completed",
};
const formatDate = (d) => (d ? new Date(d).toLocaleString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—");
const formatCurrency = (n) => (n != null ? (n || 0).toLocaleString("en-US", { maximumFractionDigits: 0 }) + " VND" : "—");

export default function PreOrderListPage() {
  const [list, setList] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [detail, setDetail] = useState(null);
  const [completingId, setCompletingId] = useState(null);
  const [filterStatus, setFilterStatus] = useState("");
  const [searchText, setSearchText] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  const load = (page = 1, overrides = {}) => {
    setLoading(true);
    const params = { page, limit: overrides.limit ?? pagination.limit ?? 10, sortBy: overrides.sortBy ?? sortBy, sortOrder: overrides.sortOrder ?? sortOrder };
    if (filterStatus) params.status = filterStatus;
    if (searchText.trim()) params.keyword = searchText.trim();
    apiClient
      .get("/admin/preorder/pre-orders", { params })
      .then((res) => {
        if (res.data && res.data.data) setList(res.data.data);
        if (res.data && res.data.pagination) setPagination(res.data.pagination);
      })
      .catch(() => setErr("Could not load pre-order list."))
      .finally(() => setLoading(false));
  };

  const handleLimitChange = (newLimit) => {
    load(1, { limit: newLimit });
  };

  useEffect(() => {
    load(1);
  }, [filterStatus]);

  useEffect(() => {
    if (searchText.trim() === "") return;
    const t = setTimeout(() => load(1), 400);
    return () => clearTimeout(t);
  }, [searchText]);

  const openDetail = (id) => {
    apiClient
      .get(`/admin/preorder/pre-orders/${id}`)
      .then((res) => {
        if (res.data && res.data.data) setDetail(res.data.data);
      })
      .catch(() => setErr("Could not load detail."));
  };

  const handleMarkCompleted = (id) => {
    if (!window.confirm("Mark this pre-order as Completed (delivery done)?")) return;
    setCompletingId(id);
    apiClient
      .put(`/admin/preorder/pre-orders/${id}/complete`)
      .then((res) => {
        if (res.data && res.data.data) setDetail(res.data.data);
        load(pagination.page);
      })
      .catch((e) => setErr(e.response?.data?.message || "Could not mark as completed."))
      .finally(() => setCompletingId(null));
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Deposit orders</h1>
      {err && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-2xl border border-red-100 flex items-center justify-between">
          <span>{err}</span>
          <button type="button" className="font-medium underline hover:no-underline" onClick={() => setErr("")}>Dismiss</button>
        </div>
      )}

      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search by customer or product..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-gray-900/20 outline-none"
          />
        </div>
        <select
          value={`${sortBy}-${sortOrder}`}
          onChange={(e) => {
            const [sby, sord] = e.target.value.split("-");
            setSortBy(sby);
            setSortOrder(sord);
            load(1, { sortBy: sby, sortOrder: sord });
          }}
          className="border border-gray-200 rounded-2xl px-4 py-2 text-sm text-gray-700 bg-white"
        >
          <option value="createdAt-desc">Sort: Order date (newest)</option>
          <option value="createdAt-asc">Sort: Order date (oldest)</option>
          <option value="totalAmount-desc">Sort: Total (high–low)</option>
          <option value="totalAmount-asc">Sort: Total (low–high)</option>
          <option value="status-asc">Sort: Status (A–Z)</option>
        </select>
        <label className="text-sm font-medium text-gray-700">Status:</label>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-gray-200 rounded-2xl px-4 py-2 text-sm text-gray-700 bg-white"
        >
          <option value="">All</option>
          <option value="WAITING_FOR_PRODUCT">Waiting for product</option>
          <option value="READY_FOR_FULFILLMENT">Ready for fulfillment</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <i className="ri-loader-4-line text-4xl text-green-600 animate-spin" />
        </div>
      ) : list.length === 0 ? (
        <p className="text-gray-600">No deposit orders yet.</p>
      ) : (
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">Customer</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">Product</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">Quantity</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">Order date</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {list.map((po) => (
                <tr key={po._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm">
                    <div className="font-medium text-gray-900">{po.userId?.user_name || "—"}</div>
                    <div className="text-gray-500 text-xs">{po.userId?.email || "—"}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{po.fruitTypeId?.name || "—"}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{po.quantityKg} kg</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                      po.status === "COMPLETED" ? "bg-green-100 text-green-800" :
                      po.status === "READY_FOR_FULFILLMENT" ? "bg-blue-100 text-blue-800" :
                      "bg-amber-100 text-amber-800"
                    }`}>
                      {STATUS_LABEL[po.status] || po.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{formatDate(po.createdAt)}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => openDetail(po._id)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                      title="View detail"
                    >
                      <i className="ri-eye-line text-lg" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {list.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-600">
              <div>
                Displaying {((pagination.page - 1) * (pagination.limit || 10)) + 1}-{Math.min(pagination.page * (pagination.limit || 10), pagination.total || 0)} of {pagination.total || 0} pre-orders
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={pagination.limit || 10}
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
                    type="button"
                    onClick={() => load(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <i className="ri-arrow-left-s-line" />
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
                          className={`px-3 py-1.5 rounded-lg transition-colors ${pagination.page === pageNum ? "bg-green-600 text-white" : "border border-gray-200 hover:bg-gray-50"}`}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                    if (pageNum === pagination.page - 2 || pageNum === pagination.page + 2) {
                      return <span key={pageNum} className="px-2">...</span>;
                    }
                    return null;
                  })}
                  <button
                    type="button"
                    onClick={() => load(pagination.page + 1)}
                    disabled={pagination.page >= Math.ceil((pagination.total || 0) / (pagination.limit || 10))}
                    className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <i className="ri-arrow-right-s-line" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {detail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 flex justify-between items-start border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Pre-order detail</h2>
              <button type="button" onClick={() => setDetail(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <i className="ri-close-line text-xl text-gray-600" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-sm">
              <div><span className="text-gray-500 font-medium">Customer:</span><br /><span className="text-gray-700">{detail.userId?.user_name || "—"} ({detail.userId?.email || "—"})</span></div>
              <div><span className="text-gray-500 font-medium">Product:</span><br /><span className="text-gray-700">{detail.fruitTypeId?.name || "—"}</span></div>
              <div><span className="text-gray-500 font-medium">Quantity:</span><br /><span className="text-gray-700">{detail.quantityKg} kg</span></div>
              <div><span className="text-gray-500 font-medium">Est. price:</span><br /><span className="text-gray-700">{formatCurrency(detail.fruitTypeId?.estimatedPrice)}/kg</span></div>
              <div><span className="text-gray-500 font-medium">Status:</span><br /><span className="text-gray-700">{STATUS_LABEL[detail.status] || detail.status}</span></div>
              <div><span className="text-gray-500 font-medium">Order date:</span><br /><span className="text-gray-700">{formatDate(detail.createdAt)}</span></div>
              <div><span className="text-gray-500 font-medium">Deposit:</span><br /><span className="text-gray-700">{formatCurrency(detail.depositPaid)} — <span className="text-green-600 font-medium">Paid</span></span></div>
              <div><span className="text-gray-500 font-medium">Remaining:</span><br /><span className="text-gray-700">{formatCurrency((detail.totalAmount ?? 0) - (detail.depositPaid ?? 0))} — <span className={detail.remainingPaidAt ? "text-green-600 font-medium" : "text-amber-600 font-medium"}>{detail.remainingPaidAt ? "Paid" : "Unpaid"}</span></span></div>
              <hr className="border-gray-100" />
              <div><span className="text-gray-500 font-medium">Receiver name:</span><br /><span className="text-gray-700">{detail.receiver_name || "—"}</span></div>
              <div><span className="text-gray-500 font-medium">Receiver phone:</span><br /><span className="text-gray-700">{detail.receiver_phone || "—"}</span></div>
              <div><span className="text-gray-500 font-medium">Delivery address:</span><br /><span className="text-gray-700">{detail.receiver_address || "—"}</span></div>
            </div>
            {detail.status === "READY_FOR_FULFILLMENT" && (
              <div className="p-6 pt-0 flex justify-end">
                <button
                  type="button"
                  onClick={() => handleMarkCompleted(detail._id)}
                  disabled={completingId === detail._id}
                  className="px-4 py-2 bg-green-600 text-white rounded-full text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {completingId === detail._id ? (
                    <><i className="ri-loader-4-line animate-spin inline-block mr-1" /> Marking…
                  </>
                  ) : (
                    "Mark completed (delivery done)"
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
