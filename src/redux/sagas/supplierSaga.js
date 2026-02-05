import { call, put, takeLatest } from "redux-saga/effects";
import { toast } from "react-toastify";
import apiClient from "../../utils/axiosConfig";
import {
  CREATE_SUPPLIER_REQUEST,
  createSupplierSuccess,
  createSupplierFailure,
  UPDATE_SUPPLIER_REQUEST,
  updateSupplierSuccess,
  updateSupplierFailure,
  GET_SUPPLIERS_REQUEST,
  getSuppliersSuccess,
  getSuppliersFailure,
  GET_SUPPLIER_BY_ID_REQUEST,
  getSupplierByIdSuccess,
  getSupplierByIdFailure,
  GET_SUPPLIERS_FOR_BRAND_REQUEST,
  getSuppliersForBrandSuccess,
  getSuppliersForBrandFailure,
  CREATE_HARVEST_BATCH_REQUEST,
  createHarvestBatchSuccess,
  createHarvestBatchFailure,
  UPDATE_HARVEST_BATCH_REQUEST,
  updateHarvestBatchSuccess,
  updateHarvestBatchFailure,
  DELETE_HARVEST_BATCH_REQUEST,
  deleteHarvestBatchSuccess,
  deleteHarvestBatchFailure,
  GET_HARVEST_BATCHES_REQUEST,
  getHarvestBatchesSuccess,
  getHarvestBatchesFailure,
  GET_HARVEST_BATCH_BY_ID_REQUEST,
  getHarvestBatchByIdSuccess,
  getHarvestBatchByIdFailure,
  UPDATE_PURCHASE_COST_REQUEST,
  updatePurchaseCostSuccess,
  updatePurchaseCostFailure,
  UPDATE_COOPERATION_STATUS_REQUEST,
  updateCooperationStatusSuccess,
  updateCooperationStatusFailure,
} from "../actions/supplierActions";

// ===== SUPPLIER API CALLS =====
// ✅ Tất cả endpoints đã được cập nhật sang /admin/suppliers (chỉ admin mới có quyền)
const apiCreateSupplier = async (formData) => {
  const response = await apiClient.post("/admin/suppliers", formData);
  return response.data;
};

const apiUpdateSupplier = async (supplierId, formData) => {
  const response = await apiClient.put(`/admin/suppliers/${supplierId}`, formData);
  return response.data;
};

const apiGetSuppliers = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append("page", params.page);
  if (params.limit) queryParams.append("limit", params.limit);
  if (params.search) queryParams.append("search", params.search);
  if (params.type) queryParams.append("type", params.type);
  if (params.cooperationStatus) queryParams.append("cooperationStatus", params.cooperationStatus);
  if (params.status !== undefined) queryParams.append("status", params.status);
  // ✅ Hỗ trợ các filter mới từ backend
  if (params.minTotalBatches !== undefined) queryParams.append("minTotalBatches", params.minTotalBatches);
  if (params.maxTotalBatches !== undefined) queryParams.append("maxTotalBatches", params.maxTotalBatches);
  if (params.minTotalProductsSupplied !== undefined) queryParams.append("minTotalProductsSupplied", params.minTotalProductsSupplied);
  if (params.maxTotalProductsSupplied !== undefined) queryParams.append("maxTotalProductsSupplied", params.maxTotalProductsSupplied);
  if (params.createdFrom) queryParams.append("createdFrom", params.createdFrom);
  if (params.createdTo) queryParams.append("createdTo", params.createdTo);
  if (params.updatedFrom) queryParams.append("updatedFrom", params.updatedFrom);
  if (params.updatedTo) queryParams.append("updatedTo", params.updatedTo);
  if (params.hasEmail !== undefined) queryParams.append("hasEmail", params.hasEmail);
  if (params.hasPhone !== undefined) queryParams.append("hasPhone", params.hasPhone);
  if (params.productId) queryParams.append("productId", params.productId);
  if (params.sortBy) queryParams.append("sortBy", params.sortBy);
  if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);

  const queryString = queryParams.toString();
  const url = `/admin/suppliers${queryString ? `?${queryString}` : ""}`;
  const response = await apiClient.get(url);
  return response.data;
};

const apiGetSupplierById = async (supplierId) => {
  const response = await apiClient.get(`/admin/suppliers/${supplierId}`);
  return response.data;
};

const apiGetSuppliersForBrand = async () => {
  const response = await apiClient.get("/admin/suppliers/for-brand");
  return response.data;
};

// ✅ Harvest Batch endpoints đã được tách ra router riêng tại /admin/harvest-batch
const apiCreateHarvestBatch = async (formData) => {
  const response = await apiClient.post("/admin/harvest-batch", formData);
  return response.data;
};

const apiUpdateHarvestBatch = async (harvestBatchId, formData) => {
  const response = await apiClient.put(`/admin/harvest-batch/${harvestBatchId}`, formData);
  return response.data;
};

const apiDeleteHarvestBatch = async (harvestBatchId) => {
  const response = await apiClient.delete(`/admin/harvest-batch/${harvestBatchId}`);
  return response.data;
};

const apiGetHarvestBatches = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append("page", params.page);
  if (params.limit) queryParams.append("limit", params.limit);
  if (params.search) queryParams.append("search", params.search);
  if (params.supplierId) queryParams.append("supplierId", params.supplierId);
  if (params.productId) queryParams.append("productId", params.productId);
  // ✅ Đã xóa status, quantity, qualityGrade trên HarvestBatch
  if (params.minReceivedQuantity !== undefined) queryParams.append("minReceivedQuantity", params.minReceivedQuantity);
  if (params.maxReceivedQuantity !== undefined) queryParams.append("maxReceivedQuantity", params.maxReceivedQuantity);
  if (params.harvestDateFrom) queryParams.append("harvestDateFrom", params.harvestDateFrom);
  if (params.harvestDateTo) queryParams.append("harvestDateTo", params.harvestDateTo);
  if (params.createdFrom) queryParams.append("createdFrom", params.createdFrom);
  if (params.createdTo) queryParams.append("createdTo", params.createdTo);
  if (params.updatedFrom) queryParams.append("updatedFrom", params.updatedFrom);
  if (params.updatedTo) queryParams.append("updatedTo", params.updatedTo);
  if (params.hasInventoryTransactions !== undefined) queryParams.append("hasInventoryTransactions", params.hasInventoryTransactions);
  if (params.receiptEligible !== undefined) queryParams.append("receiptEligible", String(params.receiptEligible));
  if (params.visibleInReceipt !== undefined) queryParams.append("visibleInReceipt", String(params.visibleInReceipt));
  if (params.createdBy) queryParams.append("createdBy", params.createdBy);
  if (params.sortBy) queryParams.append("sortBy", params.sortBy);
  if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);

  const queryString = queryParams.toString();
  const url = `/admin/harvest-batch${queryString ? `?${queryString}` : ""}`;
  const response = await apiClient.get(url);
  return response.data;
};

const apiGetHarvestBatchById = async (harvestBatchId) => {
  const response = await apiClient.get(`/admin/harvest-batch/${harvestBatchId}`);
  return response.data;
};

const apiUpdatePurchaseCost = async (supplierId, formData) => {
  const response = await apiClient.put(`/admin/suppliers/${supplierId}/purchase-cost`, formData);
  return response.data;
};

const apiUpdateCooperationStatus = async (supplierId, formData) => {
  const response = await apiClient.put(`/admin/suppliers/${supplierId}/cooperation-status`, formData);
  return response.data;
};

// ===== SUPPLIER SAGAS =====
function* createSupplierSaga(action) {
  try {
    const formData = action.payload;
    console.log("📤 Creating supplier with data:", formData);
    const response = yield call(apiCreateSupplier, formData);
    console.log("✅ Create supplier response:", response);
    if (response.status === "OK") {
      yield put(createSupplierSuccess(response.data));
      toast.success(response.message || "Tạo nhà cung cấp thành công");
    } else {
      const errorMessage = response.message || "Không thể tạo nhà cung cấp";
      yield put(createSupplierFailure(errorMessage));
      toast.error(errorMessage);
    }
  } catch (error) {
    console.error("❌ Create supplier error:", error);
    console.error("❌ Error response:", error.response?.data);
    const errorMessage =
      error.response?.data?.message || 
      error.response?.data?.error ||
      error.message || 
      "Không thể tạo nhà cung cấp";
    yield put(createSupplierFailure(errorMessage));
    toast.error(errorMessage);
  }
}

function* updateSupplierSaga(action) {
  try {
    const { supplierId, formData } = action.payload;
    const response = yield call(apiUpdateSupplier, supplierId, formData);
    if (response.status === "OK") {
      yield put(updateSupplierSuccess(response.data));
      toast.success(response.message || "Cập nhật nhà cung cấp thành công");
    } else {
      const errorMessage = response.message || "Không thể cập nhật nhà cung cấp";
      yield put(updateSupplierFailure(errorMessage));
      toast.error(errorMessage);
    }
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Không thể cập nhật nhà cung cấp";
    yield put(updateSupplierFailure(errorMessage));
    toast.error(errorMessage);
  }
}

function* getSuppliersSaga(action) {
  try {
    const params = action.payload || {};
    const response = yield call(apiGetSuppliers, params);
    if (response.status === "OK") {
      yield put(
        getSuppliersSuccess({
          data: response.data,
          pagination: response.pagination,
        })
      );
    } else {
      throw new Error(response.message || "Không thể tải danh sách nhà cung cấp");
    }
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Không thể tải danh sách nhà cung cấp";
    yield put(getSuppliersFailure(errorMessage));
    toast.error(errorMessage);
  }
}

function* getSupplierByIdSaga(action) {
  try {
    const supplierId = action.payload;
    const response = yield call(apiGetSupplierById, supplierId);
    if (response.status === "OK") {
      yield put(getSupplierByIdSuccess(response.data));
    } else {
      throw new Error(response.message || "Không thể tải chi tiết nhà cung cấp");
    }
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Không thể tải chi tiết nhà cung cấp";
    yield put(getSupplierByIdFailure(errorMessage));
    toast.error(errorMessage);
  }
}

function* getSuppliersForBrandSaga(action) {
  try {
    const response = yield call(apiGetSuppliersForBrand);
    if (response.status === "OK") {
      yield put(getSuppliersForBrandSuccess(response.data));
    } else {
      throw new Error(response.message || "Không thể tải danh sách nhà cung cấp");
    }
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Không thể tải danh sách nhà cung cấp";
    yield put(getSuppliersForBrandFailure(errorMessage));
    // Don't show toast for this, as it's used in product form
  }
}

function* createHarvestBatchSaga(action) {
  try {
    const formData = action.payload;
    console.log("📤 Creating harvest batch with data:", formData);
    const response = yield call(apiCreateHarvestBatch, formData);
    console.log("✅ Create harvest batch response:", response);
    if (response.status === "OK") {
      yield put(createHarvestBatchSuccess(response.data));
      toast.success(response.message || "Tạo lô thu hoạch thành công");
    } else {
      const errorMessage = response.message || "Không thể tạo lô thu hoạch";
      yield put(createHarvestBatchFailure(errorMessage));
      toast.error(errorMessage);
    }
  } catch (error) {
    console.error("❌ Create harvest batch error:", error);
    console.error("❌ Error response:", error.response?.data);
    const errorMessage =
      error.response?.data?.message || 
      error.response?.data?.error ||
      error.message || 
      "Không thể tạo lô thu hoạch";
    yield put(createHarvestBatchFailure(errorMessage));
    toast.error(errorMessage);
  }
}

function* updatePurchaseCostSaga(action) {
  try {
    const { supplierId, formData } = action.payload;
    const response = yield call(apiUpdatePurchaseCost, supplierId, formData);
    if (response.status === "OK") {
      yield put(updatePurchaseCostSuccess(response.data));
      toast.success(response.message || "Cập nhật giá mua thành công");
    } else {
      const errorMessage = response.message || "Không thể cập nhật giá mua";
      yield put(updatePurchaseCostFailure(errorMessage));
      toast.error(errorMessage);
    }
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Không thể cập nhật giá mua";
    yield put(updatePurchaseCostFailure(errorMessage));
    toast.error(errorMessage);
  }
}

function* updateCooperationStatusSaga(action) {
  try {
    const { supplierId, formData } = action.payload;
    const response = yield call(apiUpdateCooperationStatus, supplierId, formData);
    if (response.status === "OK") {
      yield put(updateCooperationStatusSuccess(response.data));
      toast.success(response.message || "Cập nhật trạng thái hợp tác thành công");
    } else {
      const errorMessage = response.message || "Không thể cập nhật trạng thái hợp tác";
      yield put(updateCooperationStatusFailure(errorMessage));
      toast.error(errorMessage);
    }
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Không thể cập nhật trạng thái hợp tác";
    yield put(updateCooperationStatusFailure(errorMessage));
    toast.error(errorMessage);
  }
}

// ===== HARVEST BATCH SAGAS =====
function* updateHarvestBatchSaga(action) {
  try {
    const { harvestBatchId, formData } = action.payload;
    const response = yield call(apiUpdateHarvestBatch, harvestBatchId, formData);
    if (response.status === "OK") {
      yield put(updateHarvestBatchSuccess(response.data, formData));
      toast.success(response.message || "Cập nhật lô thu hoạch thành công");
    } else {
      const errorMessage = response.message || "Không thể cập nhật lô thu hoạch";
      yield put(updateHarvestBatchFailure(errorMessage));
      toast.error(errorMessage);
    }
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Không thể cập nhật lô thu hoạch";
    yield put(updateHarvestBatchFailure(errorMessage));
    toast.error(errorMessage);
  }
}

function* deleteHarvestBatchSaga(action) {
  try {
    const harvestBatchId = action.payload;
    const response = yield call(apiDeleteHarvestBatch, harvestBatchId);
    if (response.status === "OK") {
      yield put(deleteHarvestBatchSuccess(response.data));
      toast.success(response.message || "Xóa lô thu hoạch thành công");
    } else {
      const errorMessage = response.message || "Không thể xóa lô thu hoạch";
      yield put(deleteHarvestBatchFailure(errorMessage));
      toast.error(errorMessage);
    }
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Không thể xóa lô thu hoạch";
    yield put(deleteHarvestBatchFailure(errorMessage));
    toast.error(errorMessage);
  }
}

function* getHarvestBatchesSaga(action) {
  try {
    const params = action.payload || {};
    const response = yield call(apiGetHarvestBatches, params);
    if (response.status === "OK") {
      yield put(
        getHarvestBatchesSuccess({
          data: response.data,
          pagination: response.pagination,
        })
      );
    } else {
      throw new Error(response.message || "Failed to load harvest batch list");
    }
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Failed to load harvest batch list";
    yield put(getHarvestBatchesFailure(errorMessage));
    toast.error(errorMessage);
  }
}

function* getHarvestBatchByIdSaga(action) {
  try {
    const harvestBatchId = action.payload;
    const response = yield call(apiGetHarvestBatchById, harvestBatchId);
    if (response.status === "OK") {
      yield put(getHarvestBatchByIdSuccess(response.data));
    } else {
      throw new Error(response.message || "Failed to load harvest batch details");
    }
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || "Failed to load harvest batch details";
    yield put(getHarvestBatchByIdFailure(errorMessage));
    toast.error(errorMessage);
  }
}

// ===== WATCHERS =====
export default function* supplierSaga() {
  yield takeLatest(CREATE_SUPPLIER_REQUEST, createSupplierSaga);
  yield takeLatest(UPDATE_SUPPLIER_REQUEST, updateSupplierSaga);
  yield takeLatest(GET_SUPPLIERS_REQUEST, getSuppliersSaga);
  yield takeLatest(GET_SUPPLIER_BY_ID_REQUEST, getSupplierByIdSaga);
  yield takeLatest(GET_SUPPLIERS_FOR_BRAND_REQUEST, getSuppliersForBrandSaga);
  yield takeLatest(CREATE_HARVEST_BATCH_REQUEST, createHarvestBatchSaga);
  yield takeLatest(UPDATE_HARVEST_BATCH_REQUEST, updateHarvestBatchSaga);
  yield takeLatest(DELETE_HARVEST_BATCH_REQUEST, deleteHarvestBatchSaga);
  yield takeLatest(GET_HARVEST_BATCHES_REQUEST, getHarvestBatchesSaga);
  yield takeLatest(GET_HARVEST_BATCH_BY_ID_REQUEST, getHarvestBatchByIdSaga);
  yield takeLatest(UPDATE_PURCHASE_COST_REQUEST, updatePurchaseCostSaga);
  yield takeLatest(UPDATE_COOPERATION_STATUS_REQUEST, updateCooperationStatusSaga);
}
