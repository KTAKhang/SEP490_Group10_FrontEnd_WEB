import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import apiClient from "../../../utils/axiosConfig";

export default function PreOrderImportPage() {
  const [demand, setDemand] = useState([]);
  const [demandPagination, setDemandPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [searchText, setSearchText] = useState("");
  const [harvestBatches, setHarvestBatches] = useState([]);
  const [harvestBatchesForForm, setHarvestBatchesForForm] = useState([]);
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
  const [simulationResult, setSimulationResult] = useState(null);
  const [simulationLoading, setSimulationLoading] = useState(false);

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
    if (!showForm || !form.fruitTypeId) {
      setHarvestBatchesForForm([]);
      return;
    }
    apiClient.get("/admin/harvest-batch", {
      params: {
        limit: 500,
        fruitTypeId: form.fruitTypeId,
        isPreOrderBatch: "true",
        receiptEligible: "true",
        visibleInReceipt: "true",
      },
    })
      .then((r) => { if (r.data?.data) setHarvestBatchesForForm(r.data.data); })
      .catch(() => setHarvestBatchesForForm([]));
  }, [showForm, form.fruitTypeId]);

  useEffect(() => {
    if (searchText.trim() === "") return;
    const t = setTimeout(() => {
      setLoading(true);
      loadDemand(1).finally(() => setLoading(false));
    }, 400);
    return () => clearTimeout(t);
  }, [searchText]);

  // Simulation: khi có fruit type + số nguyên dương thì gọi API simulate
  useEffect(() => {
    if (!showForm || !form.fruitTypeId) {
      setSimulationResult(null);
      return;
    }
    const qty = Number(form.quantityKg);
    if (!Number.isFinite(qty) || !Number.isInteger(qty) || qty < 1) {
      setSimulationResult(null);
      return;
    }
    const t = setTimeout(() => {
      setSimulationLoading(true);
      setSimulationResult(null);
      apiClient
        .post("/inventory/preorder-stock/simulate-import", {
          fruitTypeId: form.fruitTypeId,
          supplierAvailableQuantity: qty,
        })
        .then((r) => {
          if (r.data?.data) setSimulationResult(r.data.data);
        })
        .catch(() => setSimulationResult(null))
        .finally(() => setSimulationLoading(false));
    }, 400);
    return () => clearTimeout(t);
  }, [showForm, form.fruitTypeId, form.quantityKg]);

  const openForm = (row) => {
    const received = row?.receivedKgFromPreOrderStock ?? 0;
    const allocated = row?.allocatedKg ?? 0;
    const demandKg = row?.demandKg ?? 0;
    const availableKg = Math.max(0, received - allocated);
    const doneReceiving = received >= allocated && demandKg <= allocated;
    const remaining = doneReceiving ? 0 : Math.max(0, demandKg - availableKg);
    setForm({
      fruitTypeId: row?.fruitTypeId?._id || row?.fruitTypeId || "",
      harvestBatchId: "",
      quantityKg: remaining > 0 ? remaining : (row?.demandKg ?? ""),
      notes: "",
    });
    setErr("");
    setShowForm(true);
  };

  const doSubmitForm = () => {
    setSubmitting(true);
    setErr("");
    const qty = Number(form.quantityKg);
    apiClient
      .post("/inventory/preorder-batches", {
        harvestBatchId: form.harvestBatchId,
        fruitTypeId: form.fruitTypeId,
        supplierAvailableQuantity: qty,
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
    if (!Number.isFinite(qty) || !Number.isInteger(qty) || qty < 1) {
      setErr("Supplier available quantity (kg) must be a positive integer (1, 2, 3, …).");
      return;
    }
    if (simulationLoading) {
      setErr("Waiting for simulation result…");
      return;
    }
    if (simulationResult) {
      const rec = simulationResult.recommendedImportQuantity ?? 0;
      if (rec === 0) {
        setErr("No recommended quantity (no remaining pre-orders or quantity too small). Cannot create batch.");
        return;
      }
      if (qty !== rec) {
        setErr(
          `Supplier quantity must equal the recommended quantity (${rec} kg) for full-order fulfillment. You entered ${qty} kg.`
        );
        return;
      }
    } else if (qty > 0) {
      setErr("Enter supplier quantity and wait for recommendation, or quantity must match recommended.");
      return;
    }
    setErr("");
    setShowConfirmCreate(true);
  };

  /** Chỉ hiển thị lô pre-order đúng fruit type, supplier ACTIVE, còn eligible và còn hiện trong dropdown (chưa dùng nhập). */
  const usableBatches = harvestBatchesForForm.filter(
    (b) =>
      b.isPreOrderBatch === true &&
      (b.fruitTypeId?._id || b.fruitTypeId) === form.fruitTypeId &&
      (!b.supplier?.cooperationStatus || b.supplier?.cooperationStatus === "ACTIVE") &&
      b.receiptEligible !== false &&
      b.visibleInReceipt !== false
  );

  return (
    <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Receive stock (fulfill pre-orders)</h1>
      <p className="text-gray-600 text-sm mb-6">
        Create receive batch by demand: select <strong>harvest batch</strong> (manage at{" "}
        <Link to="/admin/harvest-batches" className="text-green-600 hover:underline inline-flex items-center gap-1">
          Harvest Batch <i className="ri-external-link-line text-sm" />
        </Link>
        ), fruit type, and quantity (kg). Quantity must be greater than 0 and cannot exceed demand; you may enter less if the supplier delivers short. After creation, warehouse staff receives at Pre-order Stock; then Admin allocates from Demand page.
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
            const received = d.receivedKgFromPreOrderStock ?? 0;
            const allocated = d.allocatedKg ?? 0;
            const demandKg = d.demandKg ?? 0;
            const availableKg = Math.max(0, received - allocated);
            const doneReceiving = received >= allocated && demandKg <= allocated;
            const remainingDemandKg = doneReceiving ? 0 : Math.max(0, demandKg - availableKg);
            const noRemainingDemand = remainingDemandKg <= 0;
            return (
              <div
                key={fid}
                className="bg-white rounded-lg border p-4 flex flex-wrap items-center justify-between gap-4"
              >
                <div>
                  <h2 className="font-semibold text-gray-800">{d.fruitTypeName || "—"}</h2>
                  <div className="flex flex-wrap gap-4 mt-1 text-sm text-gray-600">
                    <span>Demand: <strong>{d.demandKg} kg</strong> ({d.orderCount} orders)</span>
                    <span>Received: <strong>{received} kg</strong></span>
                    <span>Allocated: <strong>{allocated} kg</strong></span>
                    <span>Available: <strong>{availableKg} kg</strong></span>
                    <span>Remaining demand: <strong>{remainingDemandKg} kg</strong></span>
                  </div>
                  {noRemainingDemand && (
                    <p className="text-amber-600 text-sm mt-1">No remaining demand; no further receive batches needed.</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => openForm(d)}
                  disabled={noRemainingDemand}
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
                onClick={() => { setShowForm(false); setErr(""); setSimulationResult(null); }}
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
                <label className="block text-sm font-medium text-gray-700">Fruit type <span className="text-red-500">*</span></label>
                <select
                  value={form.fruitTypeId}
                  onChange={(e) => {
                    const row = demand.find(
                      (d) => (d.fruitTypeId?._id || d.fruitTypeId) === e.target.value
                    );
                    setForm((f) => ({
                      ...f,
                      fruitTypeId: e.target.value,
                      harvestBatchId: "",
                      quantityKg: row?.demandKg ?? f.quantityKg,
                    }));
                  }}
                  className="w-full border rounded px-3 py-2 mt-1"
                >
                  <option value="">— Select fruit type —</option>
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
                <label className="block text-sm font-medium text-gray-700">
                  Harvest batch <span className="text-gray-500 font-normal">(manage at Harvest Batch — must match fruit type above)</span>
                </label>
                <select
                  value={form.harvestBatchId}
                  onChange={(e) => setForm((f) => ({ ...f, harvestBatchId: e.target.value }))}
                  className="w-full border rounded px-3 py-2 mt-1"
                  disabled={!form.fruitTypeId}
                >
                  <option value="">— Select batch —</option>
                  {!form.fruitTypeId && <option value="" disabled>Select fruit type first</option>}
                  {usableBatches.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.batchCode || b.batchNumber || b._id} — {b.supplier?.name || "NCC"} — {b.fruitTypeId?.name || "—"}
                    </option>
                  ))}
                </select>
                {form.fruitTypeId && usableBatches.length === 0 && !loading && (
                  <p className="text-amber-600 text-xs mt-1">
                    No pre-order harvest batches for this fruit type. <Link to="/admin/harvest-batches" className="underline">Create at Harvest Batch</Link> (check &quot;Pre-order harvest batch&quot; and select this fruit type).
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Supplier available quantity (kg) — positive integers only
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  value={form.quantityKg}
                  onKeyDown={(e) => {
                    const allowed = ["Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight", "Home", "End"];
                    if (allowed.includes(e.key)) return;
                    if (e.key.length === 1 && !/^\d$/.test(e.key)) e.preventDefault();
                  }}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, "");
                    if (raw === "") {
                      setForm((f) => ({ ...f, quantityKg: "" }));
                      return;
                    }
                    const n = parseInt(raw, 10);
                    if (Number.isNaN(n) || n < 1) setForm((f) => ({ ...f, quantityKg: "1" }));
                    else setForm((f) => ({ ...f, quantityKg: String(n) }));
                  }}
                  onPaste={(e) => {
                    e.preventDefault();
                    const pasted = (e.clipboardData?.getData("text") || "").replace(/\D/g, "");
                    if (pasted === "") return;
                    const n = parseInt(pasted, 10);
                    if (Number.isNaN(n) || n < 1) setForm((f) => ({ ...f, quantityKg: "1" }));
                    else setForm((f) => ({ ...f, quantityKg: String(n) }));
                  }}
                  className="w-full border rounded px-3 py-2 mt-1"
                  placeholder="e.g. 10"
                />
                {simulationLoading && (
                  <p className="text-sm text-gray-500 mt-1">Checking recommendation…</p>
                )}
                {!simulationLoading && simulationResult != null && (
                  <div className="mt-2 p-2 rounded-lg bg-gray-50 border border-gray-100 text-sm">
                    <p className="font-medium text-gray-800">
                      Recommended: <strong>{simulationResult.recommendedImportQuantity ?? 0} kg</strong>
                      {typeof simulationResult.numberOfOrdersCanBeFulfilled === "number" && (
                        <span className="text-gray-600 font-normal"> (fulfills {simulationResult.numberOfOrdersCanBeFulfilled} order(s))</span>
                      )}
                    </p>
                    {Number(form.quantityKg) !== (simulationResult.recommendedImportQuantity ?? 0) && Number(form.quantityKg) > 0 && (
                      <p className="text-amber-700 mt-1">
                        Your entry ({form.quantityKg} kg) does not match recommended. Use recommended quantity to create batch.
                      </p>
                    )}
                    {Number(form.quantityKg) === (simulationResult.recommendedImportQuantity ?? 0) && Number(form.quantityKg) > 0 && (
                      <p className="text-green-700 mt-1">Quantity matches recommended. You can create batch.</p>
                    )}
                    {(simulationResult.recommendedImportQuantity ?? 0) > 0 && (
                      <button
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, quantityKg: String(simulationResult.recommendedImportQuantity ?? 0) }))}
                        className="mt-2 text-green-600 hover:underline text-sm font-medium"
                      >
                        Use recommended ({simulationResult.recommendedImportQuantity} kg)
                      </button>
                    )}
                  </div>
                )}
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
                onClick={() => { setShowForm(false); setErr(""); setSimulationResult(null); }}
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
              Create a receive batch for this fruit type with the quantity above. Quantity is greater than 0 and does not exceed demand. Warehouse staff will receive stock at Pre-order Stock (partial receives allowed; total received must not exceed demand). Then run allocation from the Demand page. Continue?
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => { setShowConfirmCreate(false); setErr(""); }}
                disabled={submitting}
                className="flex-1 py-2.5 border border-gray-300 rounded-full font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={doSubmitForm}
                disabled={submitting}
                className="flex-1 py-2.5 bg-green-600 text-white rounded-full font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? "Processing…" : "Confirm create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
