import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Search, ScrollText, Eye, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import { orderStatusLogsRequest } from "../../../redux/actions/orderActions";
import OrderLogDetail from "./OrderLogDetail";
import Loading from "../../../components/Loading/Loading";


const ROLE_LABEL = {
  admin: "Admin",
  "sales-staff": "Sales staff",
  customer: "Customer",
};


const STATUS_OPTIONS = [
  { value: "PENDING", label: "Pending" },
  { value: "PAID", label: "Paid" },
  { value: "READY-TO-SHIP", label: "Ready to ship" },
  { value: "SHIPPING", label: "Shipping" },
  { value: "COMPLETED", label: "Completed" },
  { value: "RETURNED", label: "Returned" },
  { value: "CANCELLED", label: "Cancelled" },
];
const STATUS_LABEL = Object.fromEntries(STATUS_OPTIONS.map((o) => [o.value, o.label]));
// Backend may return name as READY_TO_SHIP (underscore), normalize to READY-TO-SHIP for label
const getStatusLabel = (name) => {
  if (!name) return "—";
  const normalized = String(name).trim().replace(/_/g, "-");
  return STATUS_LABEL[name] || STATUS_LABEL[normalized] || name;
};


const SORT_OPTIONS = [
  { value: "changed_at", label: "Change time" },
  { value: "changed_by_role", label: "Role" },
  { value: "order_id", label: "Order ID" },
  { value: "createdAt", label: "Created date" },
];


const formatDate = (value) =>
  value ? new Date(value).toLocaleString("en-US") : "—";


const formatDateInput = (value) => {
  if (!value) return "";
  const d = new Date(value);
  return d.toISOString().slice(0, 10);
};


const OrderLogHistoryPage = () => {
  const dispatch = useDispatch();
  const {
    orderStatusLogs,
    orderStatusLogsPagination,
    orderStatusLogsLoading,
    orderStatusLogsError,
  } = useSelector((state) => state.order || {});


  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [search, setSearch] = useState("");
  const [changedByRole, setChangedByRole] = useState("");
  const [orderIdFilter, setOrderIdFilter] = useState("");
  const [changedAtFrom, setChangedAtFrom] = useState("");
  const [changedAtTo, setChangedAtTo] = useState("");
  const [sortBy, setSortBy] = useState("changed_at");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedLog, setSelectedLog] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);


  const buildFilters = useCallback(() => {
    const f = { page, limit, sortBy, sortOrder };
    if (search.trim()) f.search = search.trim();
    if (changedByRole) f.changed_by_role = changedByRole;
    if (orderIdFilter.trim()) f.order_id = orderIdFilter.trim();
    if (changedAtFrom) f.changedAtFrom = changedAtFrom;
    if (changedAtTo) f.changedAtTo = changedAtTo;
    return f;
  }, [page, limit, search, changedByRole, orderIdFilter, changedAtFrom, changedAtTo, sortBy, sortOrder]);


  const fetchLogs = useCallback(() => {
    dispatch(orderStatusLogsRequest(buildFilters()));
  }, [dispatch, buildFilters]);


  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);


  const handleApplyFilters = (e) => {
    e.preventDefault();
    setPage(1);
    dispatch(orderStatusLogsRequest({ ...buildFilters(), page: 1 }));
  };


  const logs = Array.isArray(orderStatusLogs) ? orderStatusLogs : [];
  const pagination = orderStatusLogsPagination || {};
  const totalPages = pagination.totalPages || 1;
  const total = pagination.total ?? 0;


  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
          <ScrollText size={24} />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900">Order log history</h1>
          <p className="text-sm text-gray-500 mt-0.5">Order status updates (admin, sales staff, customer). Search, filter and sort.</p>
        </div>
      </div>


      <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm">
        <form onSubmit={handleApplyFilters} className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <Filter size={18} />
            Filters & search
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by note"
                className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:border-transparent text-sm"
              />
            </div>
            <div>
              <select
                value={changedByRole}
                onChange={(e) => setChangedByRole(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:border-transparent text-sm"
              >
                <option value="">All roles</option>
                <option value="admin">Admin</option>
                <option value="sales-staff">Sales staff</option>
                <option value="customer">Customer</option>
              </select>
            </div>
            <div>
              <input
                type="text"
                value={orderIdFilter}
                onChange={(e) => setOrderIdFilter(e.target.value)}
                placeholder="Order ID (optional)"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:border-transparent text-sm"
              />
            </div>
            <div className="flex gap-2">
              <input
                type="date"
                value={changedAtFrom}
                onChange={(e) => setChangedAtFrom(e.target.value)}
                className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm"
              />
              <span className="self-center text-gray-400">→</span>
              <input
                type="date"
                value={changedAtTo}
                onChange={(e) => setChangedAtTo(e.target.value)}
                className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm"
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-gray-600">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2.5 border border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="px-3 py-2.5 border border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm"
            >
              <option value="desc">Newest first</option>
              <option value="asc">Oldest first</option>
            </select>
            <button
              type="submit"
              className="px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-medium text-sm shadow-sm"
            >
              Apply
            </button>
          </div>
        </form>


        {orderStatusLogsError && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {orderStatusLogsError}
          </div>
        )}


        {orderStatusLogsLoading ? (
          <div className="mt-6">
            <Loading message="Loading order log history..." />
          </div>
        ) : (
          <div className="mt-6">
            {logs.length > 0 ? (
              <>
                <p className="text-sm text-gray-600 mb-3">
                  Total <strong>{total}</strong> records. Page {page}/{totalPages}.
                </p>
                <div className="overflow-x-auto -mx-px">
                  <table className="w-full text-sm min-w-[800px]">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">Time</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">Order</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">Actor</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">Role</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">From status</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">To status</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-700">Note</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-700 w-20">Detail</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {logs.map((log) => (
                        <tr key={log._id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                            {formatDate(log.changed_at)}
                          </td>
                          <td className="px-4 py-3">
                            {log.order_id ? (
                              <div>
                                <span className="font-mono text-xs text-gray-600" title={log.order_id._id}>
                                  {typeof log.order_id === "object" && log.order_id._id
                                    ? String(log.order_id._id).slice(-8)
                                    : String(log.order_id).slice(-8)}
                                </span>
                                {log.order_id.receiver_name && (
                                  <div className="text-xs text-gray-500">{log.order_id.receiver_name}</div>
                                )}
                              </div>
                            ) : (
                              "—"
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-medium text-gray-900">
                              {log.changed_by?.user_name || "—"}
                            </span>
                            {log.changed_by?.email && (
                              <div className="text-xs text-gray-500">{log.changed_by.email}</div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              {ROLE_LABEL[log.changed_by_role] || log.changed_by_role}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-700">{getStatusLabel(log.from_status?.name)}</td>
                          <td className="px-4 py-3 text-gray-700">
                            <span className="font-medium text-green-700">{getStatusLabel(log.to_status?.name)}</span>
                          </td>
                          <td className="px-4 py-3 text-gray-600 max-w-[180px] truncate" title={log.note}>
                            {log.note || "—"}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              type="button"
                              onClick={() => { setSelectedLog(log); setDetailOpen(true); }}
                              className="rounded-xl p-2 text-blue-600 transition hover:bg-blue-50 hover:text-blue-700"
                              title="View"
                            >
                              <Eye size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>


                {totalPages > 1 && (
                  <div className="mt-4 flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1}
                      className="p-2 border border-gray-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <span className="text-sm text-gray-600">
                      Page {page} / {totalPages}
                    </span>
                    <button
                      type="button"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages}
                      className="p-2 border border-gray-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="py-12 text-center text-gray-500">
                <ScrollText className="mx-auto mb-2 text-gray-400" size={40} />
                <p>No order status change records found.</p>
                <p className="text-sm mt-1">Try adjusting filters or sort.</p>
              </div>
            )}
          </div>
        )}
      </div>


      <OrderLogDetail
        isOpen={detailOpen}
        log={selectedLog}
        onClose={() => { setDetailOpen(false); setSelectedLog(null); }}
      />
    </div>
  );
};


export default OrderLogHistoryPage;


