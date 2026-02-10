import { useState, useEffect, useCallback } from "react";
import apiClient from "../../../utils/axiosConfig";

export default function PreOrderDemandPage() {
  const [demand, setDemand] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [searchText, setSearchText] = useState("");
  const [allocModal, setAllocModal] = useState(null);
  const [showAllocConfirm, setShowAllocConfirm] = useState(false);
  const [isAllocating, setIsAllocating] = useState(false);

  const load = useCallback((page = 1, limit) => {
    setLoading(true);
    const params = { page, limit: limit ?? pagination.limit ?? 10 };
    if (searchText.trim()) params.keyword = searchText.trim();
    apiClient
      .get("/admin/preorder/demand", { params })
      .then((res) => {
        if (res.data && res.data.data) setDemand(res.data.data);
        if (res.data && res.data.pagination) setPagination(res.data.pagination);
      })
      .catch(() => setErr("Could not load data."))
      .finally(() => setLoading(false));
  }, [searchText]);

  useEffect(() => {
    load(1);
  }, []);

  useEffect(() => {
    if (searchText.trim() === "") return;
    const t = setTimeout(() => load(1), 400);
    return () => clearTimeout(t);
  }, [searchText, load]);

  const openAlloc = (row) => {
    setAllocModal(row);
  };

  const availableKg = allocModal
    ? Math.max(0, (allocModal.receivedKgFromPreOrderStock ?? 0) - (allocModal.allocatedKg ?? 0))
    : 0;

  const doSubmitAlloc = () => {
    if (!allocModal || isAllocating) return;
    setErr("");
    setIsAllocating(true);
    apiClient
      .post("/admin/preorder/allocations", {
        fruitTypeId: allocModal.fruitTypeId?._id || allocModal.fruitTypeId,
        allocatedKg: availableKg,
      })
      .then((res) => {
        const msg = res.data?.data?.message;
        setAllocModal(null);
        setShowAllocConfirm(false);
        load(pagination.page);
        if (msg) setErr(msg);
      })
      .catch((e) => setErr(e.response?.data?.message || "Lỗi khi chạy allocation."))
      .finally(() => setIsAllocating(false));
  };

  const submitAlloc = () => {
    setErr("");
    setShowAllocConfirm(true);
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Pre-order demand</h1>
      <p className="text-gray-600 text-sm mb-6">
        Run allocation whenever there is <strong>received stock</strong>. Stock is assigned to orders in FIFO order. Orders that get full quantity can pay the remaining 50%; orders that do not fit in this batch wait for the next receive. You can run allocation again after more stock is received.
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
      {err && !allocModal && !showAllocConfirm && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-2xl border border-red-100">{err}</div>
      )}
      {loading ? (
        <div className="flex justify-center py-20"><i className="ri-loader-4-line text-4xl text-green-600 animate-spin" /></div>
      ) : demand.length === 0 ? (
        <p className="text-gray-600">No demand yet.</p>
      ) : (
        <div className="space-y-6">
          {demand.map((d) => {
            const fid = d.fruitTypeId?._id || d.fruitTypeId;
            const received = d.receivedKgFromPreOrderStock ?? 0;
            const allocated = d.allocatedKg ?? 0;
            const availableKg = Math.max(0, received - allocated);
            const canAlloc = availableKg > 0;
            return (
              <div key={fid} className="bg-white rounded-2xl border border-gray-100 shadow-md p-6">
                <h2 className="font-bold text-gray-900 text-lg">{d.fruitTypeName || "—"}</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 text-sm text-gray-700">
                  <div><span className="text-gray-500">Demand: </span><strong>{d.demandKg} kg</strong> ({d.orderCount} orders)</div>
                  <div><span className="text-gray-500">Received (pre-order stock): </span><strong>{received} kg</strong></div>
                  <div><span className="text-gray-500">Allocated: </span><strong>{allocated} kg</strong></div>
                  <div><span className="text-gray-500">Remaining demand: </span><strong className="text-amber-600">{d.remainingKg} kg</strong></div>
                </div>
                {received > 0 && received < (d.demandKg ?? 0) && (
                  <p className="mt-3 text-amber-700 text-sm">Partial stock received ({received} kg). Run allocation to assign to orders (FIFO). Unfulfilled orders will wait for the next batch.</p>
                )}
                {canAlloc && (
                  <p className="mt-3 text-green-700 text-sm font-medium">Available to allocate: <strong>{availableKg} kg</strong>. Run allocation to assign to waiting orders.</p>
                )}
                {received === 0 && (
                  <p className="mt-3 text-gray-500 text-sm">No stock received yet. Warehouse staff must receive at Pre-order Stock page first.</p>
                )}
                <button
                  type="button"
                  onClick={() => canAlloc && openAlloc(d)}
                  disabled={!canAlloc || isAllocating}
                  className="mt-4 px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-full hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isAllocating ? "Processing…" : canAlloc ? "Run allocation" : (received === 0 ? "No stock to allocate" : "Allocated (no remaining stock)")}
                </button>
              </div>
            );
          })}
          {demand.length > 0 && (
            <div className="mt-6 flex items-center justify-between text-sm text-gray-600">
              <div>
                Displaying {((pagination.page - 1) * (pagination.limit || 10)) + 1}-{Math.min(pagination.page * (pagination.limit || 10), pagination.total || 0)} of {pagination.total || 0} items
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={pagination.limit || 10}
                  onChange={(e) => load(1, Number(e.target.value))}
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

      {allocModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
            <h3 className="font-bold text-gray-900 text-lg mb-4">Allocate for: {allocModal.fruitTypeName}</h3>
            {err && !showAllocConfirm && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-2xl border border-red-100 text-sm">{err}</div>
            )}
            <p className="text-sm text-gray-600 mb-2">Available from pre-order stock: <strong>{availableKg} kg</strong></p>
            <p className="text-sm text-gray-700 mb-6">
              Run allocation to assign <strong>{availableKg} kg</strong> to waiting orders (FIFO). Orders that get full quantity can pay remaining; others wait for the next batch.
            </p>
            <div className="flex gap-3">
              <button type="button" onClick={() => { setAllocModal(null); setErr(""); }} disabled={isAllocating} className="flex-1 py-2.5 border border-gray-300 rounded-full font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Cancel</button>
              <button type="button" onClick={submitAlloc} disabled={isAllocating} className="flex-1 py-2.5 bg-green-600 text-white rounded-full font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">{isAllocating ? "Processing…" : "Continue"}</button>
            </div>
          </div>
        </div>
      )}

      {showAllocConfirm && allocModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="font-bold text-gray-900 text-lg mb-3">Confirm allocation from pre-order stock</h3>
            {err && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-2xl border border-red-100 text-sm">{err}</div>
            )}
            <p className="text-gray-700 mb-2">
              Assign <strong>{availableKg} kg</strong> to pre-orders for <strong>{allocModal.fruitTypeName}</strong> (FIFO). Orders that fit get allocated; the first order that does not fit will wait for the next receive batch.
            </p>
            <p className="text-gray-700 mb-6">
              You can run allocation again when more stock is received. Continue?
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => { setShowAllocConfirm(false); setErr(""); }}
                disabled={isAllocating}
                className="flex-1 py-2.5 border border-gray-300 rounded-full font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={doSubmitAlloc}
                disabled={isAllocating}
                className="flex-1 py-2.5 bg-green-600 text-white rounded-full font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isAllocating ? "Processing…" : "Confirm allocation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
