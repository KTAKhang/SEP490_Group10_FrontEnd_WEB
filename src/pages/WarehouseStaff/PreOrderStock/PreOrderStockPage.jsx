import { useState, useEffect } from "react";
import apiClient from "../../../utils/axiosConfig";
const STATUS_LABEL = {
  NOT_RECEIVED: { label: "Not received", color: "bg-gray-100 text-gray-800" },
  PARTIAL: { label: "Partial", color: "bg-yellow-100 text-yellow-800" },
  FULLY_RECEIVED: { label: "Fully received", color: "bg-green-100 text-green-800" },
};

export default function PreOrderStockPage() {
  const [batches, setBatches] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [sortBy, setSortBy] = useState("harvestDate");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showReceive, setShowReceive] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [receiveForm, setReceiveForm] = useState({ quantityKg: "", note: "" });
  const [submitting, setSubmitting] = useState(false);

  const loadBatches = (page = 1, overrides = {}) => {
    setLoading(true);
    setErr("");
    const params = {
      page: overrides.page ?? page,
      limit: overrides.limit ?? pagination.limit ?? 10,
      sortBy: overrides.sortBy ?? sortBy,
      sortOrder: overrides.sortOrder ?? sortOrder,
    };
    if (filterStatus !== "all") params.status = filterStatus;
    if (searchText.trim()) params.keyword = searchText.trim();
    if (overrides.keyword !== undefined) params.keyword = overrides.keyword;
    apiClient
      .get("/inventory/preorder-batches", { params })
      .then((res) => {
        if (res.data?.data) setBatches(res.data.data);
        else setBatches([]);
        if (res.data?.pagination) setPagination(res.data.pagination);
      })
      .catch(() => setErr("Could not load pre-order receive batches."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadBatches(1);
  }, [filterStatus]);

  useEffect(() => {
    if (searchText.trim() === "") return;
    const t = setTimeout(() => loadBatches(1), 400);
    return () => clearTimeout(t);
  }, [searchText]);

  const openReceive = (batch) => {
    setSelectedBatch(batch);
    const planned = batch?.quantityKg ?? 0;
    setReceiveForm({
      quantityKg: planned,
      note: "",
    });
    setErr("");
    setShowReceive(true);
  };

  const submitReceive = () => {
    if (!selectedBatch) return;
    const planned = selectedBatch.quantityKg ?? 0;
    const qty = Number(receiveForm.quantityKg);
    if (!Number.isFinite(qty) || qty <= 0) {
      setErr("Quantity (kg) must be greater than 0.");
      return;
    }
    if (Math.abs(qty - planned) > 0.001) {
      setErr(`Received quantity must equal planned (${planned} kg). One-time receive only.`);
      return;
    }
    setSubmitting(true);
    setErr("");
    apiClient
      .post("/inventory/preorder-stock/receive-by-batch", {
        preOrderHarvestBatchId: selectedBatch._id,
        quantityKg: qty,
        note: receiveForm.note || "",
      })
      .then(() => {
        setShowReceive(false);
        setSelectedBatch(null);
        loadBatches(pagination.page);
      })
      .catch((e) => setErr(e.response?.data?.message || "Receive failed."))
      .finally(() => setSubmitting(false));
  };

  const displayed = batches;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pre-order stock</h1>
          <p className="text-gray-600 text-sm mt-1">
            Receive by batch (created by Admin). <strong>One-time receive only</strong>, quantity must match planned; no edits after. After fully received, Admin allocates from Demand page.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search by fruit or batch..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-2xl text-sm bg-white focus:ring-2 focus:ring-gray-900/20 outline-none"
            />
          </div>
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [sby, sord] = e.target.value.split("-");
              setSortBy(sby);
              setSortOrder(sord);
              loadBatches(1, { sortBy: sby, sortOrder: sord });
            }}
            className="border border-gray-200 rounded-2xl px-4 py-2 text-sm bg-white"
          >
            <option value="harvestDate-desc">Sort: Harvest date (newest)</option>
            <option value="harvestDate-asc">Sort: Harvest date (oldest)</option>
            <option value="createdAt-desc">Sort: Created (newest)</option>
            <option value="quantityKg-desc">Sort: Quantity (high–low)</option>
          </select>
          <span className="text-sm text-gray-600">Status:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-200 rounded-2xl px-4 py-2 text-sm bg-white"
          >
            <option value="all">All</option>
            <option value="NOT_RECEIVED">Not received</option>
            <option value="PARTIAL">Partial</option>
            <option value="FULLY_RECEIVED">Fully received</option>
          </select>
        </div>
      </div>

      {err && !showReceive && (
        <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">{err}</div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <i className="ri-loader-4-line text-4xl text-green-600 animate-spin" />
        </div>
      ) : displayed.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-8 text-center text-gray-600">
          <i className="ri-archive-line text-5xl mx-auto mb-3 text-gray-400 block" />
          No batches yet. Admin must create receive batches (fruit type, supplier, quantity = demand) from Receive stock (fulfill) page.
        </div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-xs font-medium text-gray-600 uppercase">Fruit type</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-600 uppercase">Supplier</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-600 uppercase">Batch code</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-600 uppercase">Planned (kg)</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-600 uppercase">Received (kg)</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-600 uppercase">Remaining (kg)</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-600 uppercase">Status</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-600 uppercase text-center">Receive</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {displayed.map((row) => {
                const st = STATUS_LABEL[row.status] || STATUS_LABEL.NOT_RECEIVED;
                const canReceive = row.status !== "FULLY_RECEIVED" && (row.remainingKg ?? 0) > 0;
                return (
                  <tr key={row._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {row.fruitTypeId?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {row.supplierId?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-600 font-mono text-sm">
                      {row.batchCode ?? "—"}
                    </td>
                    <td className="px-4 py-3">{row.quantityKg ?? 0}</td>
                    <td className="px-4 py-3">{row.receivedKg ?? 0}</td>
                    <td className="px-4 py-3 text-green-700 font-medium">
                      {row.remainingKg ?? 0}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${st.color}`}
                      >
                        {st.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {canReceive ? (
                        <button
                          type="button"
                          onClick={() => openReceive(row)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
                          title="Receive"
                        >
                          <i className="ri-upload-cloud-line text-lg" />
                          Receive
                        </button>
                      ) : (
                        <span className="text-gray-400 text-sm">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {displayed.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-600">
              <div>
                Displaying {((pagination.page - 1) * (pagination.limit || 10)) + 1}-{Math.min(pagination.page * (pagination.limit || 10), pagination.total || 0)} of {pagination.total || 0} batches
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={pagination.limit || 10}
                  onChange={(e) => loadBatches(1, { limit: Number(e.target.value) })}
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
                    onClick={() => loadBatches(pagination.page - 1)}
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
                          onClick={() => loadBatches(pageNum)}
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
                    onClick={() => loadBatches(pagination.page + 1)}
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

      {showReceive && selectedBatch && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-gray-900">Pre-order receive</h3>
              <button
                type="button"
                onClick={() => {
                  setShowReceive(false);
                  setSelectedBatch(null);
                  setErr("");
                }}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <i className="ri-close-line text-xl text-gray-600" />
              </button>
            </div>
            {err && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-2xl border border-red-100 text-sm">{err}</div>
            )}
            <p className="text-sm text-amber-700 bg-amber-50 rounded p-2 mb-3">
              You can only receive <strong>once</strong>, exactly the planned quantity. No edits after.
            </p>
            <p className="text-sm text-gray-600 mb-2">
              Batch: <strong>{selectedBatch.batchCode}</strong> — {selectedBatch.fruitTypeId?.name} · Planned: <strong>{selectedBatch.quantityKg ?? 0} kg</strong>
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Quantity (kg) — must equal planned</label>
                <input
                  type="number"
                  min={selectedBatch.quantityKg ?? 0}
                  max={selectedBatch.quantityKg ?? 0}
                  value={receiveForm.quantityKg}
                  readOnly
                  className="w-full border rounded px-3 py-2 mt-1 bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Notes (optional)</label>
                <input
                  type="text"
                  value={receiveForm.note}
                  onChange={(e) =>
                    setReceiveForm((f) => ({ ...f, note: e.target.value }))
                  }
                  className="w-full border rounded px-3 py-2 mt-1"
                  placeholder="e.g. batch 01/2025"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                type="button"
                onClick={() => {
                  setShowReceive(false);
                  setSelectedBatch(null);
                  setErr("");
                }}
                className="flex-1 py-2 border rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitReceive}
                disabled={submitting}
                className="flex-1 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50"
              >
                {submitting ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
