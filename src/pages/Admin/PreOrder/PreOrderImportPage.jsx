import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import apiClient from "../../../utils/axiosConfig";

export default function PreOrderImportPage() {
  const [demand, setDemand] = useState([]);
  const [demandPagination, setDemandPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [searchText, setSearchText] = useState("");
  const [harvestBatches, setHarvestBatches] = useState([]);
  const [existingPreOrderBatches, setExistingPreOrderBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showConfirmCreate, setShowConfirmCreate] = useState(false);
  const [form, setForm] = useState({
    fruitTypeId: "",
    harvestBatchId: "",
    quantityKg: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const loadDemand = (page = 1, limit) => {
    const params = { page, limit: limit ?? demandPagination.limit ?? 10 };
    if (searchText.trim()) params.keyword = searchText.trim();
    return apiClient.get("/admin/preorder/demand", { params }).then((r) => {
      if (r.data?.data) setDemand(r.data.data);
      if (r.data?.pagination) setDemandPagination(r.data.pagination);
    });
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([
      loadDemand(1),
      apiClient.get("/admin/harvest-batch", { params: { limit: 500 } }),
      apiClient.get("/inventory/preorder-batches"),
    ])
      .then(([, br, pr]) => {
        if (br.data?.data) setHarvestBatches(br.data.data);
        if (pr.data?.data) setExistingPreOrderBatches(pr.data.data);
      })
      .catch(() => setErr("Could not load demand or harvest batch list."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (searchText.trim() === "") return;
    const t = setTimeout(() => {
      setLoading(true);
      loadDemand(1).finally(() => setLoading(false));
    }, 400);
    return () => clearTimeout(t);
  }, [searchText]);

  const openForm = (row) => {
    setForm({
      fruitTypeId: row?.fruitTypeId?._id || row?.fruitTypeId || "",
      harvestBatchId: "",
      quantityKg: row?.demandKg ?? "",
      notes: "",
    });
    setErr("");
    setShowForm(true);
  };

  const hasBatchForFruitType = (fid) =>
    existingPreOrderBatches.some(
      (b) => (b.fruitTypeId?._id || b.fruitTypeId)?.toString() === (fid?._id || fid)?.toString()
    );

  const doSubmitForm = () => {
    setSubmitting(true);
    setErr("");
    const qty = Number(form.quantityKg);
    apiClient
      .post("/inventory/preorder-batches", {
        harvestBatchId: form.harvestBatchId,
        fruitTypeId: form.fruitTypeId,
        quantityKg: qty,
        notes: (form.notes || "").trim(),
      })
      .then(() => {
        setShowForm(false);
        setShowConfirmCreate(false);
        loadDemand(demandPagination.page);
        apiClient.get("/inventory/preorder-batches").then((r) => { if (r.data?.data) setExistingPreOrderBatches(r.data.data); });
      })
      .catch((e) => setErr(e.response?.data?.message || "Failed to create batch."))
      .finally(() => setSubmitting(false));
  };

  const submitForm = () => {
    if (!form.fruitTypeId) {
      setErr("Select a fruit type.");
      return;
    }
    if (!form.harvestBatchId) {
      setErr("Select a harvest batch (manage at Harvest Batch).");
      return;
    }
    const qty = Number(form.quantityKg);
    if (!Number.isFinite(qty) || qty <= 0) {
      setErr("Quantity (kg) must be greater than 0.");
      return;
    }
    const row = demand.find((d) => (d.fruitTypeId?._id || d.fruitTypeId) === form.fruitTypeId);
    if (row && Math.abs(qty - (row.demandKg ?? 0)) > 0.001) {
      setErr(`Quantity must equal demand (${row.demandKg} kg).`);
      return;
    }
    setErr("");
    setShowConfirmCreate(true);
  };

  /** Chỉ hiển thị lô thu hoạch của nhà cung cấp ACTIVE (optional: có thể bỏ filter) */
  const usableBatches = harvestBatches.filter(
    (b) => !b.supplier?.cooperationStatus || b.supplier?.cooperationStatus === "ACTIVE"
  );

  return (
    <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Receive stock (fulfill pre-orders)</h1>
      <p className="text-gray-600 text-sm mb-6">
        Create receive batch by demand: select <strong>harvest batch</strong> (manage at{" "}
        <Link to="/admin/harvest-batches" className="text-green-600 hover:underline inline-flex items-center gap-1">
          Harvest Batch <i className="ri-external-link-line text-sm" />
        </Link>
        ), fruit type, quantity (kg) = demand. After creation, warehouse staff receives at Pre-order Stock until fully received, then Admin allocates from Demand page.
      </p>
      <div className="mb-4 flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search by fruit type name..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-gray-900/20 outline-none"
          />
        </div>
      </div>
      {err && !showForm && !showConfirmCreate && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-2xl border border-red-100 text-sm">{err}</div>
      )}
      {loading ? (
        <div className="flex justify-center py-20">
          <i className="ri-loader-4-line text-4xl text-green-600 animate-spin" />
        </div>
      ) : demand.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-8 text-center text-gray-600">
          <i className="ri-archive-line text-5xl mx-auto mb-3 text-gray-400 block" />
          No demand yet. Customer pre-orders will create demand on the Demand page.
        </div>
      ) : (
        <div className="space-y-4">
          {demand.map((d) => {
            const fid = d.fruitTypeId?._id || d.fruitTypeId;
            const alreadyHasBatch = hasBatchForFruitType(fid);
            return (
              <div
                key={fid}
                className="bg-white rounded-lg border p-4 flex flex-wrap items-center justify-between gap-4"
              >
                <div>
                  <h2 className="font-semibold text-gray-800">{d.fruitTypeName || "—"}</h2>
                  <div className="flex flex-wrap gap-4 mt-1 text-sm text-gray-600">
                    <span>Demand: <strong>{d.demandKg} kg</strong> ({d.orderCount} orders)</span>
                    <span>Received: <strong>{d.receivedKgFromPreOrderStock ?? 0} kg</strong></span>
                  </div>
                  {alreadyHasBatch && (
                    <p className="text-amber-600 text-sm mt-1">Receive batch already created (one per fruit type).</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => openForm(d)}
                  disabled={alreadyHasBatch}
                  className="px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Create receive batch
                </button>
              </div>
            );
          })}
          {demand.length > 0 && (
            <div className="mt-6 flex items-center justify-between text-sm text-gray-600">
              <div>
                Displaying {((demandPagination.page - 1) * (demandPagination.limit || 10)) + 1}-{Math.min(demandPagination.page * (demandPagination.limit || 10), demandPagination.total || 0)} of {demandPagination.total || 0} items
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={demandPagination.limit || 10}
                  onChange={(e) => { setLoading(true); loadDemand(1, Number(e.target.value)).finally(() => setLoading(false)); }}
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
                    onClick={() => { setLoading(true); loadDemand(demandPagination.page - 1).finally(() => setLoading(false)); }}
                    disabled={demandPagination.page <= 1}
                    className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <i className="ri-arrow-left-s-line" />
                  </button>
                  {[...Array(Math.max(1, Math.ceil((demandPagination.total || 0) / (demandPagination.limit || 10))))].map((_, i) => {
                    const pageNum = i + 1;
                    const totalPages = Math.ceil((demandPagination.total || 0) / (demandPagination.limit || 10)) || 1;
                    if (pageNum === 1 || pageNum === totalPages || (pageNum >= demandPagination.page - 1 && pageNum <= demandPagination.page + 1)) {
                      return (
                        <button
                          key={pageNum}
                          type="button"
                          onClick={() => { setLoading(true); loadDemand(pageNum).finally(() => setLoading(false)); }}
                          className={`px-3 py-1.5 rounded-lg transition-colors ${demandPagination.page === pageNum ? "bg-green-600 text-white" : "border border-gray-200 hover:bg-gray-50"}`}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                    if (pageNum === demandPagination.page - 2 || pageNum === demandPagination.page + 2) {
                      return <span key={pageNum} className="px-2">...</span>;
                    }
                    return null;
                  })}
                  <button
                    type="button"
                    onClick={() => { setLoading(true); loadDemand(demandPagination.page + 1).finally(() => setLoading(false)); }}
                    disabled={demandPagination.page >= Math.ceil((demandPagination.total || 0) / (demandPagination.limit || 10))}
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

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-gray-900">Create receive batch</h3>
              <button
                type="button"
                onClick={() => { setShowForm(false); setErr(""); }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <i className="ri-close-line text-xl text-gray-600" />
              </button>
            </div>
            {err && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-2xl border border-red-100 text-sm">{err}</div>
            )}
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Harvest batch <span className="text-gray-500 font-normal">(manage at Harvest Batch)</span>
                </label>
                <select
                  value={form.harvestBatchId}
                  onChange={(e) => setForm((f) => ({ ...f, harvestBatchId: e.target.value }))}
                  className="w-full border rounded px-3 py-2 mt-1"
                >
                  <option value="">— Select batch —</option>
                  {usableBatches.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.batchCode || b.batchNumber || b._id} — {b.supplier?.name || "NCC"} — {b.product?.name || "SP"}
                    </option>
                  ))}
                </select>
                {harvestBatches.length === 0 && !loading && (
                  <p className="text-amber-600 text-xs mt-1">
                    No batches. <Link to="/admin/harvest-batches" className="underline">Create at Harvest Batch</Link>.
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Fruit type</label>
                <select
                  value={form.fruitTypeId}
                  onChange={(e) => {
                    const row = demand.find(
                      (d) => (d.fruitTypeId?._id || d.fruitTypeId) === e.target.value
                    );
                    setForm((f) => ({
                      ...f,
                      fruitTypeId: e.target.value,
                      quantityKg: row?.demandKg ?? f.quantityKg,
                    }));
                  }}
                  className="w-full border rounded px-3 py-2 mt-1"
                >
                  <option value="">— Select —</option>
                  {demand.map((d) => {
                    const id = d.fruitTypeId?._id || d.fruitTypeId;
                    return (
                      <option key={id} value={id}>
                        {d.fruitTypeName} ({d.demandKg} kg)
                      </option>
                    );
                  })}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Quantity (kg) — must equal demand</label>
                <input
                  type="number"
                  min={0.1}
                  step={0.5}
                  value={form.quantityKg}
                  onChange={(e) => setForm((f) => ({ ...f, quantityKg: e.target.value }))}
                  className="w-full border rounded px-3 py-2 mt-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Notes (optional)</label>
                <input
                  type="text"
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  className="w-full border rounded px-3 py-2 mt-1"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => { setShowForm(false); setErr(""); }}
                className="flex-1 py-2.5 border border-gray-300 rounded-full font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitForm}
                disabled={submitting}
                className="flex-1 py-2.5 bg-green-600 text-white rounded-full font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {submitting ? "Creating..." : "Create batch"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm: tạo lô chỉ một lần duy nhất cho mỗi loại trái, số lượng = nhu cầu */}
      {showConfirmCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="font-bold text-gray-900 text-lg mb-3">Confirm create receive batch</h3>
            {err && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-2xl border border-red-100 text-sm">{err}</div>
            )}
            <p className="text-gray-700 mb-6">
              This action can be done <strong>only once</strong> per pre-order fruit type. Quantity must equal demand. After creation, warehouse staff receives once only. Are you sure?
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => { setShowConfirmCreate(false); setErr(""); }}
                className="flex-1 py-2.5 border border-gray-300 rounded-full font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={doSubmitForm}
                disabled={submitting}
                className="flex-1 py-2.5 bg-green-600 text-white rounded-full font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {submitting ? "Creating..." : "Confirm create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
