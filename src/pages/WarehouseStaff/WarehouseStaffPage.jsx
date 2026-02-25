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
} from "lucide-react";
import { getWarehouseStatsRequest } from "../../redux/actions/inventoryActions";
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

const formatNumber = (n) => (n ?? 0).toLocaleString("en-US", { maximumFractionDigits: 0 });
const formatKg = (n) => (n ?? 0).toLocaleString("en-US", { maximumFractionDigits: 1 });
const formatDate = (d) => (d ? new Date(d).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" }) : "—");

const MONTH_NAMES = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"];
const RECEIPT_HISTORY_LIMIT = 20;
const CHART_BAR_HEIGHT = 180;
const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 6 }, (_, i) => currentYear - i);

const WarehouseStaffPage = () => {
  const dispatch = useDispatch();
  const { warehouseStats, warehouseStatsLoading, warehouseStatsError } = useSelector(
    (state) => state.inventory
  );
  const [receiptPage, setReceiptPage] = useState(1);
  const [selectedYear, setSelectedYear] = useState(currentYear);

  useEffect(() => {
    dispatch(getWarehouseStatsRequest({
      page: receiptPage,
      limit: RECEIPT_HISTORY_LIMIT,
      year: selectedYear,
    }));
  }, [dispatch, receiptPage, selectedYear]);

  const myStats = warehouseStats?.myStats ?? null;
  const whStats = warehouseStats?.warehouseStats ?? null;
  const receiptHistory = myStats?.receiptHistory ?? null;
  const receiptData = receiptHistory?.data ?? [];
  const receiptPagination = receiptHistory?.pagination ?? null;

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
                <p className="text-xs text-gray-500 mt-1">Tổng tồn kho (đơn vị)</p>
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
                <p className="text-xs text-gray-500 mt-1">Sản phẩm còn hàng</p>
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
                <p className="text-xs text-gray-500 mt-1">Sắp hết hàng</p>
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
                <p className="text-xs text-gray-500 mt-1">Sắp hết hạn</p>
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
                <p className="text-xs text-gray-500 mt-1">Hết hàng</p>
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
                <p className="text-xs text-gray-500 mt-1">Đã nhập tháng này</p>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Received by month this year */}
      {/* Tổng nhập theo tháng - biểu đồ cột dọc + chọn năm */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CardTitle>Tổng nhập theo tháng</CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600">Năm:</span>
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
              Không có dữ liệu nhập kho theo tháng cho năm {selectedYear}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Your receipt history */}
      <Card>
        <CardHeader>
          <CardTitle>Lịch sử nhập kho của bạn</CardTitle>
        </CardHeader>
        <CardContent>
          {receiptData.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-left text-gray-600">
                      <th className="py-2 pr-4">Thời gian</th>
                      <th className="py-2 pr-4">Sản phẩm</th>
                      <th className="py-2 pr-4">Số lượng</th>
                      <th className="py-2">Lô / Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody>
                    {receiptData.map((row) => (
                      <tr key={row._id} className="border-b border-gray-100">
                        <td className="py-2 pr-4 text-gray-700 whitespace-nowrap">{formatDate(row.createdAt)}</td>
                        <td className="py-2 pr-4 font-medium text-gray-800">
                          {row.product?.name ?? row.product ?? "—"}
                        </td>
                        <td className="py-2 pr-4 font-semibold text-emerald-600">{formatNumber(row.quantity)}</td>
                        <td className="py-2 text-gray-600">
                          {row.harvestBatch?.batchCode || row.harvestBatch?.batchNumber
                            ? `Lô: ${row.harvestBatch.batchCode || row.harvestBatch.batchNumber}`
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {receiptPagination && receiptPagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <span className="text-sm text-gray-600">
                    Trang {receiptPagination.page} / {receiptPagination.totalPages} ({receiptPagination.total} phiếu)
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setReceiptPage((p) => Math.max(1, p - 1))}
                      disabled={receiptPagination.page <= 1}
                      className="p-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setReceiptPage((p) => p + 1)}
                      disabled={receiptPagination.page >= receiptPagination.totalPages}
                      className="p-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-gray-500 py-8 text-center">Chưa có phiếu nhập kho nào</p>
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
    </div>
  );
};

export default WarehouseStaffPage;
