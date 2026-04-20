import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  Package,
  PackageCheck,
  AlertCircle,
  TrendingDown,
  Upload,
  Layers,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Search,
  Filter,
  FileText,
  Eye,
  User,
} from "lucide-react";
import { getWarehouseDashboardStatsRequest } from "../../redux/actions/warehouseDashboardActions";
import { getReceiptHistoryRequest } from "../../redux/actions/inventoryActions";
import { getProductsRequest } from "../../redux/actions/productActions";
import ReceiptDetailModal from "../Admin/ReceiptHistory/ReceiptDetailModal";
import Loading from "../../components/Loading/Loading";

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children, className = "" }) => (
  <div className={`px-5 py-4 border-b border-gray-100 ${className}`}>{children}</div>
);

const CardTitle = ({ children, className = "" }) => (
  <h3 className={`text-base font-semibold text-gray-800 ${className}`}>{children}</h3>
);

const CardContent = ({ children, className = "" }) => (
  <div className={`p-5 ${className}`}>{children}</div>
);

const formatNumber = (n) => (n ?? 0).toLocaleString("vi-VN", { maximumFractionDigits: 0 });
const formatKg = (n) => (n ?? 0).toLocaleString("vi-VN", { maximumFractionDigits: 1 });
const formatDate = (d) => (d ? new Date(d).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" }) : "—");

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const RECEIPT_HISTORY_LIMIT = 20;
const CHART_BAR_HEIGHT = 180;
const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 6 }, (_, i) => currentYear - i);

const WarehouseStaffPage = () => {
  const dispatch = useDispatch();
  const { warehouseStats, warehouseStatsLoading, warehouseStatsError } = useSelector(
    (state) => state.warehouseDashboard
  );
  const { receiptHistory, receiptHistoryPagination, receiptHistoryLoading } = useSelector(
    (state) => state.inventory
  );
  const { products } = useSelector((state) => state.product);

  const [selectedYear, setSelectedYear] = useState(currentYear);

  // Receipt history section filters
  const [historyPage, setHistoryPage] = useState(1);
  const [historyProductId, setHistoryProductId] = useState("");
  const [historySearch, setHistorySearch] = useState("");
  const [historyStartDate, setHistoryStartDate] = useState("");
  const [historyEndDate, setHistoryEndDate] = useState("");
  const [historySortOrder, setHistorySortOrder] = useState("desc");
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedReceiptId, setSelectedReceiptId] = useState(null);

  useEffect(() => {
    dispatch(getWarehouseDashboardStatsRequest({
      page: 1,
      limit: RECEIPT_HISTORY_LIMIT,
      year: selectedYear,
    }));
  }, [dispatch, selectedYear]);

  useEffect(() => {
    dispatch(getProductsRequest({ page: 1, limit: 1000, sortBy: "name", sortOrder: "asc" }));
  }, [dispatch]);

  useEffect(() => {
    dispatch(getReceiptHistoryRequest({
      page: historyPage,
      limit: 8,
      ...(historyProductId && { productId: historyProductId }),
      ...(historySearch && { search: historySearch }),
      ...(historyStartDate && { startDate: historyStartDate }),
      ...(historyEndDate && { endDate: historyEndDate }),
      sortBy: "createdAt",
      sortOrder: historySortOrder,
    }));
  }, [dispatch, historyPage, historyProductId, historySearch, historyStartDate, historyEndDate, historySortOrder]);

  const myStats = warehouseStats?.myStats ?? null;
  const whStats = warehouseStats?.warehouseStats ?? null;

  const handleResetHistoryFilters = () => {
    setHistoryProductId("");
    setHistorySearch("");
    setHistoryStartDate("");
    setHistoryEndDate("");
    setHistorySortOrder("desc");
    setHistoryPage(1);
  };

  const hasActiveFilters = historyProductId || historySearch || historyStartDate || historyEndDate || historySortOrder !== "desc";

  if (warehouseStatsLoading && !warehouseStats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loading message="Loading statistics..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-0.5">Warehouse overview and your receipt history</p>
      </div>

      {warehouseStatsError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {warehouseStatsError}
        </div>
      )}

      {/* Warehouse overview */}
      {whStats && (
        <>
          <h2 className="text-lg font-semibold text-gray-800">Warehouse overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total on hand</CardTitle>
                <div className="p-2 rounded-lg bg-slate-100">
                  <Package className="h-5 w-5 text-slate-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{formatNumber(whStats.totalQuantityInStock)}</div>
                <p className="text-xs text-gray-500 mt-1">Total quantity in stock (units)</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">In stock</CardTitle>
                <div className="p-2 rounded-lg bg-green-100">
                  <PackageCheck className="h-5 w-5 text-green-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{formatNumber(whStats.totalProductsInStock)}</div>
                <p className="text-xs text-gray-500 mt-1">Products currently in stock</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Low stock (~10%)</CardTitle>
                <div className="p-2 rounded-lg bg-amber-100">
                  <TrendingDown className="h-5 w-5 text-amber-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{formatNumber(whStats.totalProductsLowStock)}</div>
                <p className="text-xs text-gray-500 mt-1">Products running low</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Near expiry (≤7d)</CardTitle>
                <div className="p-2 rounded-lg bg-orange-100">
                  <Calendar className="h-5 w-5 text-orange-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{formatNumber(whStats.totalProductsNearExpiry)}</div>
                <p className="text-xs text-gray-500 mt-1">Products near expiry</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Out of stock</CardTitle>
                <div className="p-2 rounded-lg bg-red-100">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{formatNumber(whStats.totalProductsOutOfStock)}</div>
                <p className="text-xs text-gray-500 mt-1">Out-of-stock products</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">This month</CardTitle>
                <div className="p-2 rounded-lg bg-emerald-100">
                  <Upload className="h-5 w-5 text-emerald-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{formatNumber(whStats.totalReceivedCurrentMonth)}</div>
                <p className="text-xs text-gray-500 mt-1">Received this month</p>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Received by month this year */}
      {/* Total received by month - vertical bars + year filter */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CardTitle>Total received by month</CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600">Year:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            >
              {YEAR_OPTIONS.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {whStats?.totalReceivedByMonthThisYear?.length > 0 ? (
            <div className="flex justify-between gap-1 sm:gap-2">
              {MONTH_NAMES.map((label, i) => {
                const monthNum = i + 1;
                const item = whStats.totalReceivedByMonthThisYear.find((m) => m.month === monthNum);
                const qty = item?.totalQuantity ?? 0;
                const maxQty = Math.max(...whStats.totalReceivedByMonthThisYear.map((m) => m.totalQuantity), 1);
                const barHeightPx = maxQty > 0 ? (qty / maxQty) * CHART_BAR_HEIGHT : 0;
                return (
                  <div key={monthNum} className="flex-1 flex flex-col items-center min-w-0">
                    <div
                      className="w-full flex flex-col justify-end items-center"
                      style={{ height: CHART_BAR_HEIGHT }}
                    >
                      <div
                        className="w-full max-w-[28px] sm:max-w-[36px] rounded-t bg-emerald-500 transition-all duration-300 hover:bg-emerald-600"
                        style={{
                          height: Math.max(barHeightPx, 0),
                          minHeight: qty > 0 ? 6 : 0,
                        }}
                        title={`${label}: ${formatNumber(qty)}`}
                      />
                    </div>
                    <div className="text-xs font-medium text-gray-600 mt-2 truncate w-full text-center">{label}</div>
                    <div className="text-xs font-semibold text-gray-800 mt-0.5 truncate w-full text-center">{formatNumber(qty)}</div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center py-12 text-gray-500 text-sm">
              No monthly receipt data available for {selectedYear}
            </div>
          )}
        </CardContent>
      </Card>


      {/* Pre-order stock summary */}
      {whStats?.preOrderStockSummary && (
        <Card>
          <CardHeader>
            <CardTitle>Pre-order stock summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-xs font-medium text-gray-500 uppercase">Total received (kg)</p>
                <p className="text-xl font-bold text-gray-900">{formatKg(whStats.preOrderStockSummary.totalReceivedKg)}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-xs font-medium text-gray-500 uppercase">Total allocated (kg)</p>
                <p className="text-xl font-bold text-gray-900">{formatKg(whStats.preOrderStockSummary.totalAllocatedKg)}</p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl">
                <p className="text-xs font-medium text-emerald-700 uppercase">Available (kg)</p>
                <p className="text-xl font-bold text-emerald-700">{formatKg(whStats.preOrderStockSummary.availableKg)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <Link
              to="/warehouse-staff/warehouse"
              className="p-4 bg-emerald-50 hover:bg-emerald-100 rounded-xl text-center transition-colors border border-transparent hover:border-emerald-200"
            >
              <Upload className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-800">Receive stock</p>
            </Link>
            <Link
              to="/warehouse-staff/preorder-stock"
              className="p-4 bg-amber-50 hover:bg-amber-100 rounded-xl text-center transition-colors border border-transparent hover:border-amber-200"
            >
              <Layers className="h-8 w-8 text-amber-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-800">Pre-order stock</p>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* ===== My Receipt History ===== */}
      <div className="rounded-2xl border border-gray-200/80 bg-white shadow-sm overflow-hidden">
        {/* Section header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
            <ClipboardList size={20} />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-gray-800">My Receipt History</h3>
            {receiptHistoryPagination && (
              <p className="text-xs text-gray-500 mt-0.5">
                Total: {receiptHistoryPagination.total} receipts
              </p>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2 mb-3">
            <Filter size={15} className="text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Filters</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Product */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Product</label>
              <select
                value={historyProductId}
                onChange={(e) => { setHistoryProductId(e.target.value); setHistoryPage(1); }}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="">All products</option>
                {products.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name}{p.brand ? ` (${p.brand})` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Search note */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Search note</label>
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search in notes..."
                  value={historySearch}
                  onChange={(e) => { setHistorySearch(e.target.value); setHistoryPage(1); }}
                  className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            {/* Start date */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">From date</label>
              <div className="relative">
                <Calendar size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="date"
                  value={historyStartDate}
                  onChange={(e) => { setHistoryStartDate(e.target.value); setHistoryPage(1); }}
                  className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            {/* End date */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">To date</label>
              <div className="relative">
                <Calendar size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="date"
                  value={historyEndDate}
                  min={historyStartDate || undefined}
                  onChange={(e) => { setHistoryEndDate(e.target.value); setHistoryPage(1); }}
                  className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>
          </div>

          {/* Sort + reset */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-600">Sort:</span>
              <button
                type="button"
                onClick={() => { setHistorySortOrder((o) => (o === "asc" ? "desc" : "asc")); setHistoryPage(1); }}
                className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                Date {historySortOrder === "asc" ? "↑ Oldest first" : "↓ Newest first"}
              </button>
            </div>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetHistoryFilters}
                className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition"
              >
                Reset filters
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="p-5">
          {receiptHistoryLoading ? (
            <div className="flex justify-center py-10">
              <Loading message="Loading receipt history..." />
            </div>
          ) : receiptHistory.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <Package size={44} className="text-gray-300 mb-3" />
              <p className="text-sm font-medium text-gray-600">No receipts found</p>
              <p className="text-xs text-gray-400 mt-1">Your receipts will appear here after you receive stock.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-left">
                      <th className="px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                      <th className="px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Harvest Batch</th>
                      <th className="px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Note</th>
                      <th className="px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Detail</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {receiptHistory.map((receipt) => (
                      <tr key={receipt._id} className="hover:bg-gray-50 transition-colors">
                        {/* Product */}
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2">
                            {receipt.product?.images?.[0] && (
                              <img
                                src={receipt.product.images[0]}
                                alt={receipt.product.name}
                                className="h-9 w-9 rounded-lg object-cover border border-gray-100 flex-shrink-0"
                              />
                            )}
                            <div>
                              <p className="font-medium text-gray-900 leading-tight">
                                {receipt.product?.name || "N/A"}
                              </p>
                              {receipt.product?.brand && (
                                <p className="text-xs text-gray-400">{receipt.product.brand}</p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Quantity */}
                        <td className="px-3 py-3 whitespace-nowrap">
                          <span className="font-semibold text-emerald-600">{formatNumber(receipt.quantity)}</span>
                        </td>

                        {/* Harvest Batch */}
                        <td className="px-3 py-3">
                          {receipt.harvestBatch ? (
                            <div>
                              <p className="font-medium text-gray-800 text-xs">
                                {receipt.harvestBatch.batchCode || receipt.harvestBatch.batchNumber || "—"}
                              </p>
                              {receipt.harvestBatch.harvestDateStr && (
                                <p className="text-xs text-gray-400 mt-0.5">{receipt.harvestBatch.harvestDateStr}</p>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>

                        {/* Note */}
                        <td className="px-3 py-3 max-w-[180px]">
                          {receipt.note ? (
                            <div className="flex items-start gap-1">
                              <FileText size={13} className="text-gray-400 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-700 text-xs line-clamp-2">{receipt.note}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>

                        {/* Date */}
                        <td className="px-3 py-3 whitespace-nowrap text-gray-700 text-xs">
                          {receipt.createdAt
                            ? new Date(receipt.createdAt).toLocaleString("en-US", {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "—"}
                        </td>

                        {/* View detail */}
                        <td className="px-3 py-3 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => { setSelectedReceiptId(receipt._id); setIsDetailModalOpen(true); }}
                            className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-50 transition"
                            title="View detail"
                          >
                            <Eye size={17} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {receiptHistoryPagination && receiptHistoryPagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <span className="text-xs text-gray-500">
                    Showing{" "}
                    {(receiptHistoryPagination.page - 1) * receiptHistoryPagination.limit + 1}–
                    {Math.min(
                      receiptHistoryPagination.page * receiptHistoryPagination.limit,
                      receiptHistoryPagination.total
                    )}{" "}
                    of {receiptHistoryPagination.total} receipts
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                      disabled={historyPage === 1}
                      className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    {[...Array(receiptHistoryPagination.totalPages)].map((_, i) => (
                      <button
                        key={i + 1}
                        type="button"
                        onClick={() => setHistoryPage(i + 1)}
                        className={`min-w-[2rem] rounded-lg px-2 py-1.5 text-xs font-medium transition ${
                          historyPage === i + 1
                            ? "bg-emerald-600 text-white shadow-sm"
                            : "border border-gray-200 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setHistoryPage((p) => Math.min(receiptHistoryPagination.totalPages, p + 1))}
                      disabled={historyPage === receiptHistoryPagination.totalPages}
                      className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Receipt detail modal */}
      <ReceiptDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => { setIsDetailModalOpen(false); setSelectedReceiptId(null); }}
        receiptId={selectedReceiptId}
      />
    </div>
  );
};

export default WarehouseStaffPage;
