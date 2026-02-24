import { useState, useEffect, useRef } from "react";
import apiClient from "../../../utils/axiosConfig";

const DAYS_BEFORE_HARVEST_TO_LOCK = 3;
const getMinHarvestDateStr = () => {
  const d = new Date();
  d.setDate(d.getDate() + DAYS_BEFORE_HARVEST_TO_LOCK + 1);
  return d.toISOString().slice(0, 10);
};

export default function FruitTypeManagement() {
  const [list, setList] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [searchText, setSearchText] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [modal, setModal] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    estimatedPrice: "",
    minOrderKg: "",
    maxOrderKg: "",
    estimatedHarvestDate: "",
    status: "ACTIVE",
  });
  const [existingImages, setExistingImages] = useState([]);
  const [existingImagePublicIds, setExistingImagePublicIds] = useState([]);
  const [newImageFiles, setNewImageFiles] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);
  const MAX_IMAGES = 10;

  const load = (params = {}) => {
    setLoading(true);
    const page = params.page ?? pagination.page;
    const limit = params.limit ?? pagination.limit;
    const query = { page, limit, sortBy: params.sortBy ?? sortBy, sortOrder: params.sortOrder ?? sortOrder };
    if (searchText.trim()) query.keyword = searchText.trim();
    if (params.keyword !== undefined) query.keyword = params.keyword;
    apiClient
      .get("/admin/preorder/fruit-types", { params: query })
      .then((res) => {
        if (res.data && res.data.data) setList(res.data.data);
        if (res.data && res.data.pagination) setPagination(res.data.pagination);
      })
      .catch(() => setErr("Could not load list."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load({ page: 1 });
  }, []);

  useEffect(() => {
    if (!searchText.trim()) return;
    const t = setTimeout(() => load({ page: 1 }), 400);
    return () => clearTimeout(t);
  }, [searchText]);

  const handlePageChange = (newPage) => {
    load({ page: newPage });
  };

  const handleLimitChange = (newLimit) => {
    load({ page: 1, limit: newLimit });
  };

  const handleSortChange = (e) => {
    const val = e.target.value;
    const nextSortBy = val === "name" ? "name" : val === "estimatedPrice" ? "estimatedPrice" : "createdAt";
    const nextSortOrder = nextSortBy === "createdAt" ? "desc" : "asc";
    setSortBy(nextSortBy);
    setSortOrder(nextSortOrder);
    load({ page: 1, sortBy: nextSortBy, sortOrder: nextSortOrder });
  };

  const openCreate = () => {
    setModal("create");
    setForm({
      name: "",
      description: "",
      estimatedPrice: "",
      minOrderKg: "",
      maxOrderKg: "",
      estimatedHarvestDate: "",
      status: "ACTIVE",
    });
    setExistingImages([]);
    setExistingImagePublicIds([]);
    setNewImageFiles([]);
    setNewImagePreviews([]);
    setShowSaveConfirm(false);
  };

  const closeModal = () => {
    setModal(null);
    setEditingId(null);
    setErr("");
    setExistingImages([]);
    setExistingImagePublicIds([]);
    setNewImageFiles([]);
    setNewImagePreviews([]);
  };

  const openEdit = (row) => {
    if ((row.demandKg ?? 0) > 0) return;
    if (row.status === "INACTIVE" || (row.hasClosedPreOrders && (row.demandKg ?? 0) === 0)) return;
    setModal("edit");
    setEditingId(row._id);
    setForm({
      name: row.name ?? "",
      description: row.description ?? "",
      estimatedPrice: row.estimatedPrice ?? "",
      minOrderKg: row.minOrderKg ?? "",
      maxOrderKg: row.maxOrderKg ?? "",
      estimatedHarvestDate: row.estimatedHarvestDate ? new Date(row.estimatedHarvestDate).toISOString().slice(0, 10) : "",
      status: row.status ?? "ACTIVE",
    });
    const imgs = Array.isArray(row.images) && row.images.length > 0 ? row.images : (row.image ? [row.image] : []);
    const pids = Array.isArray(row.imagePublicIds) && row.imagePublicIds.length > 0 ? row.imagePublicIds : (row.imagePublicId ? [row.imagePublicId] : []);
    setExistingImages(imgs);
    setExistingImagePublicIds(pids);
    setNewImageFiles([]);
    setNewImagePreviews([]);
    setShowSaveConfirm(false);
  };

  const handleDelete = (row) => {
    if ((row.demandKg ?? 0) > 0) return;
    if (row.status === "INACTIVE" || (row.hasClosedPreOrders && (row.demandKg ?? 0) === 0)) return;
    if (!window.confirm(`Delete fruit type "${row.name}"? This cannot be undone.`)) return;
    setDeletingId(row._id);
    setErr("");
    apiClient
      .delete(`/admin/preorder/fruit-types/${row._id}`)
      .then(() => {
        load();
      })
      .catch((e) => setErr(e.response?.data?.message || "Delete failed."))
      .finally(() => setDeletingId(null));
  };

  const handleImageChange = (e) => {
    const files = e.target.files ? [...e.target.files] : [];
    if (files.length === 0) return;
    const currentCount = existingImages.length + newImageFiles.length;
    const allowed = Math.min(files.length, MAX_IMAGES - currentCount);
    if (allowed <= 0) return;
    const toAdd = files.slice(0, allowed);
    setNewImageFiles((prev) => [...prev, ...toAdd]);
    toAdd.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewImagePreviews((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
    setExistingImagePublicIds((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index) => {
    setNewImageFiles((prev) => prev.filter((_, i) => i !== index));
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const buildFormData = () => {
    const fd = new FormData();
    fd.append("name", form.name.trim());
    fd.append("description", (form.description || "").trim());
    fd.append("estimatedPrice", String(form.estimatedPrice));
    fd.append("minOrderKg", String(form.minOrderKg));
    fd.append("maxOrderKg", String(form.maxOrderKg));
    fd.append("estimatedHarvestDate", form.estimatedHarvestDate || "");
    fd.append("allowPreOrder", "true");
    fd.append("status", form.status);
    fd.append("existingImages", JSON.stringify(existingImages));
    fd.append("existingImagePublicIds", JSON.stringify(existingImagePublicIds));
    newImageFiles.forEach((file) => fd.append("images", file));
    return fd;
  };

  const validateForm = () => {
    const name = String(form.name || "").trim();
    if (!name) return "Fruit name cannot be empty";
    if (form.estimatedPrice == null || form.estimatedPrice === "") return "Estimated price is required";
    if (form.minOrderKg == null || form.minOrderKg === "") return "Min order (kg) is required";
    if (form.maxOrderKg == null || form.maxOrderKg === "") return "Max order (kg) is required";
    const minKg = Number(form.minOrderKg);
    const maxKg = Number(form.maxOrderKg);
    if (Number.isNaN(minKg) || Number.isNaN(maxKg)) return "Min order and max order must be valid numbers";
    if (minKg > maxKg) return "Min order (kg) cannot be greater than max order (kg)";
    const priceNum = Number(form.estimatedPrice);
    if (Number.isNaN(priceNum) || priceNum < 0) return "Estimated price must be a valid number greater than or equal to 0";
    return null;
  };

  const submit = () => {
    setErr("");
    const validationError = validateForm();
    if (validationError) {
      setErr(validationError);
      return;
    }
    setIsSubmitting(true);
    const fd = buildFormData();
    apiClient
      .post("/admin/preorder/fruit-types", fd)
      .then(() => {
        setShowSaveConfirm(false);
        closeModal();
        load();
      })
      .catch((e) => setErr(e.response?.data?.message || "Something went wrong."))
      .finally(() => setIsSubmitting(false));
  };

  const submitEdit = () => {
    setErr("");
    const validationError = validateForm();
    if (validationError) {
      setErr(validationError);
      return;
    }
    setIsSubmitting(true);
    const fd = buildFormData();
    apiClient
      .put(`/admin/preorder/fruit-types/${editingId}`, fd)
      .then(() => {
        closeModal();
        load();
      })
      .catch((e) => setErr(e.response?.data?.message || "Update failed."))
      .finally(() => setIsSubmitting(false));
  };

  const handleSaveClick = () => {
    setErr("");
    const validationError = validateForm();
    if (validationError) {
      setErr(validationError);
      return;
    }
    if (modal === "edit") {
      submitEdit();
      return;
    }
    setShowSaveConfirm(true);
  };

  const allPreviews = [...existingImages, ...newImagePreviews];
  const canAddMore = allPreviews.length < MAX_IMAGES;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Pre-order fruit types</h1>
      {err && !modal && !showSaveConfirm && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-2xl border border-red-100">{err}</div>}
      <div className="mb-4 flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-full shadow-md hover:bg-green-700 transition"
        >
          <i className="ri-add-line text-lg" />
          Add fruit type
        </button>

        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search by name..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900 outline-none"
          />
        </div>
        <select
          value={sortBy}
          onChange={handleSortChange}
          className="px-4 py-2 border border-gray-200 rounded-2xl text-sm bg-white focus:ring-2 focus:ring-gray-900/20 outline-none"
        >
          <option value="createdAt">Sort: Created (newest)</option>
          <option value="name">Sort: Name (A–Z)</option>
          <option value="estimatedPrice">Sort: Price</option>
        </select>
      </div>
      {loading ? (
        <div className="flex justify-center py-12">
          <i className="ri-loader-4-line text-4xl text-green-600 animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Image</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Name</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Est. price (VND/kg)</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Min–Max kg</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Pre-order</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Demand</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((row) => {
                const isCampaignClosed = row.status === "INACTIVE" || (row.hasClosedPreOrders && (row.demandKg ?? 0) === 0);
                const canEditDelete = (row.demandKg ?? 0) === 0 && !isCampaignClosed;
                return (
                  <tr key={row._id} className="border-t">
                    <td className="px-4 py-2">
                      {(row.images && row.images[0]) || row.image ? (
                        <img
                          src={(row.images && row.images[0]) || row.image}
                          alt={row.name}
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-2">{row.name}</td>
                    <td className="px-4 py-2">{(row.estimatedPrice || 0).toLocaleString("en-US")}</td>
                    <td className="px-4 py-2">
                      {row.minOrderKg}–{row.maxOrderKg}
                    </td>
                    <td className="px-4 py-2">{row.allowPreOrder ? "Yes" : "No"}</td>
                    <td className="px-4 py-2">{row.status}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">{row.demandKg ?? 0} kg</td>
                    <td className="px-4 py-2">
                      {canEditDelete ? (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEdit(row)}
                            className="px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(row)}
                            disabled={deletingId === row._id}
                            className="px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 disabled:opacity-50 transition-colors"
                          >
                            {deletingId === row._id ? "Deleting…" : "Delete"}
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500" title={isCampaignClosed ? "Campaign closed. Edit/delete not allowed." : "Edit/delete allowed only when demand = 0."}>
                          {isCampaignClosed ? "Closed" : "Locked (demand &gt; 0)"}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {list.length === 0 && <p className="p-6 text-gray-500 text-center">No fruit types yet.</p>}
          {list.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-600">
              <div>
                Displaying {((pagination.page - 1) * (pagination.limit || 10)) + 1}-{Math.min(pagination.page * (pagination.limit || 10), pagination.total || 0)} of {pagination.total || 0} fruit types
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
                    onClick={() => handlePageChange(pagination.page - 1)}
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
                          onClick={() => handlePageChange(pageNum)}
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
                    onClick={() => handlePageChange(pagination.page + 1)}
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
        /* Modal for create form for pre-order fruit */
      )}
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="font-semibold text-lg mb-4 text-gray-900">{modal === "edit" ? "Edit fruit type" : "Add fruit type"}</h3>
            {err && (
              <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-700 rounded-2xl text-sm">
                {err}
              </div>
            )}
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Images (for detail gallery, max {MAX_IMAGES})</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                />
                <div className="flex flex-wrap gap-3">
                  {existingImages.map((url, index) => (
                    <div key={`ex-${index}`} className="relative group">
                      <img src={url} alt="" className="h-24 w-24 object-cover rounded-lg border" />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(index)}
                        className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                        title="Remove"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {newImagePreviews.map((dataUrl, index) => (
                    <div key={`new-${index}`} className="relative group">
                      <img src={dataUrl} alt="" className="h-24 w-24 object-cover rounded-lg border" />
                      <button
                        type="button"
                        onClick={() => removeNewImage(index)}
                        className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                        title="Remove"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {canAddMore && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="h-24 w-24 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-green-500 hover:text-green-600 flex flex-col items-center justify-center gap-1 shrink-0"
                    >
                      <i className="ri-image-add-line text-2xl" />
                      <span className="text-xs">Add</span>
                    </button>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <input
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Est. price (VND/kg)</label>
                <input
                  type="number"
                  min={0}
                  value={form.estimatedPrice}
                  onChange={(e) => setForm((f) => ({ ...f, estimatedPrice: e.target.value }))}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Min (kg)</label>
                <input
                  type="number"
                  min={0}
                  value={form.minOrderKg}
                  onChange={(e) => setForm((f) => ({ ...f, minOrderKg: e.target.value }))}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Max (kg)</label>
                <input
                  type="number"
                  min={0}
                  value={form.maxOrderKg}
                  onChange={(e) => setForm((f) => ({ ...f, maxOrderKg: e.target.value }))}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Est. harvest date
                </label>
                <input
                  type="date"
                  min={getMinHarvestDateStr()}
                  value={form.estimatedHarvestDate}
                  onChange={(e) => setForm((f) => ({ ...f, estimatedHarvestDate: e.target.value }))}
                  className="w-full border rounded px-3 py-2"
                  title="Cannot select today or the next 3 days (fruit would be hidden from pre-order)"
                />
                <p className="text-xs text-gray-500 mt-1">Must be at least 4 days from today (today and the next 3 days are not allowed).</p>
              </div>
              {modal === "edit" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
              )}
            </div>
            <div className="flex gap-2 mt-6">
              <button type="button" onClick={closeModal} disabled={isSubmitting} className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-full font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                Cancel
              </button>
              <button type="button" onClick={handleSaveClick} disabled={isSubmitting} className="flex-1 py-2.5 bg-green-600 text-white rounded-full font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                {isSubmitting ? "Processing…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSaveConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
            {err && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-2xl border border-red-100 text-sm">{err}</div>
            )}
            <p className="text-gray-700 text-sm mb-6">
              When there is pre-order demand (customers have ordered), this fruit type cannot be edited or deleted. Please check all information carefully, then click Confirm to save.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowSaveConfirm(false)}
                disabled={isSubmitting}
                className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-full font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submit}
                disabled={isSubmitting}
                className="flex-1 py-2.5 bg-green-600 text-white rounded-full font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? "Processing…" : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
