// ===== SUPPLIER ACTIONS =====
export const CREATE_SUPPLIER_REQUEST = "CREATE_SUPPLIER_REQUEST";
export const CREATE_SUPPLIER_SUCCESS = "CREATE_SUPPLIER_SUCCESS";
export const CREATE_SUPPLIER_FAILURE = "CREATE_SUPPLIER_FAILURE";

export const UPDATE_SUPPLIER_REQUEST = "UPDATE_SUPPLIER_REQUEST";
export const UPDATE_SUPPLIER_SUCCESS = "UPDATE_SUPPLIER_SUCCESS";
export const UPDATE_SUPPLIER_FAILURE = "UPDATE_SUPPLIER_FAILURE";

export const GET_SUPPLIERS_REQUEST = "GET_SUPPLIERS_REQUEST";
export const GET_SUPPLIERS_SUCCESS = "GET_SUPPLIERS_SUCCESS";
export const GET_SUPPLIERS_FAILURE = "GET_SUPPLIERS_FAILURE";

export const GET_SUPPLIER_BY_ID_REQUEST = "GET_SUPPLIER_BY_ID_REQUEST";
export const GET_SUPPLIER_BY_ID_SUCCESS = "GET_SUPPLIER_BY_ID_SUCCESS";
export const GET_SUPPLIER_BY_ID_FAILURE = "GET_SUPPLIER_BY_ID_FAILURE";

export const GET_SUPPLIERS_FOR_BRAND_REQUEST = "GET_SUPPLIERS_FOR_BRAND_REQUEST";
export const GET_SUPPLIERS_FOR_BRAND_SUCCESS = "GET_SUPPLIERS_FOR_BRAND_SUCCESS";
export const GET_SUPPLIERS_FOR_BRAND_FAILURE = "GET_SUPPLIERS_FOR_BRAND_FAILURE";

export const CREATE_HARVEST_BATCH_REQUEST = "CREATE_HARVEST_BATCH_REQUEST";
export const CREATE_HARVEST_BATCH_SUCCESS = "CREATE_HARVEST_BATCH_SUCCESS";
export const CREATE_HARVEST_BATCH_FAILURE = "CREATE_HARVEST_BATCH_FAILURE";

export const UPDATE_HARVEST_BATCH_REQUEST = "UPDATE_HARVEST_BATCH_REQUEST";
export const UPDATE_HARVEST_BATCH_SUCCESS = "UPDATE_HARVEST_BATCH_SUCCESS";
export const UPDATE_HARVEST_BATCH_FAILURE = "UPDATE_HARVEST_BATCH_FAILURE";

export const DELETE_HARVEST_BATCH_REQUEST = "DELETE_HARVEST_BATCH_REQUEST";
export const DELETE_HARVEST_BATCH_SUCCESS = "DELETE_HARVEST_BATCH_SUCCESS";
export const DELETE_HARVEST_BATCH_FAILURE = "DELETE_HARVEST_BATCH_FAILURE";

export const GET_HARVEST_BATCHES_REQUEST = "GET_HARVEST_BATCHES_REQUEST";
export const GET_HARVEST_BATCHES_SUCCESS = "GET_HARVEST_BATCHES_SUCCESS";
export const GET_HARVEST_BATCHES_FAILURE = "GET_HARVEST_BATCHES_FAILURE";

export const GET_HARVEST_BATCH_BY_ID_REQUEST = "GET_HARVEST_BATCH_BY_ID_REQUEST";
export const GET_HARVEST_BATCH_BY_ID_SUCCESS = "GET_HARVEST_BATCH_BY_ID_SUCCESS";
export const GET_HARVEST_BATCH_BY_ID_FAILURE = "GET_HARVEST_BATCH_BY_ID_FAILURE";

export const UPDATE_PURCHASE_COST_REQUEST = "UPDATE_PURCHASE_COST_REQUEST";
export const UPDATE_PURCHASE_COST_SUCCESS = "UPDATE_PURCHASE_COST_SUCCESS";
export const UPDATE_PURCHASE_COST_FAILURE = "UPDATE_PURCHASE_COST_FAILURE";

export const UPDATE_COOPERATION_STATUS_REQUEST = "UPDATE_COOPERATION_STATUS_REQUEST";
export const UPDATE_COOPERATION_STATUS_SUCCESS = "UPDATE_COOPERATION_STATUS_SUCCESS";
export const UPDATE_COOPERATION_STATUS_FAILURE = "UPDATE_COOPERATION_STATUS_FAILURE";

export const CLEAR_SUPPLIER_MESSAGES = "CLEAR_SUPPLIER_MESSAGES";

// ===== SUPPLIER ACTION CREATORS =====
export const createSupplierRequest = (formData) => ({
  type: CREATE_SUPPLIER_REQUEST,
  payload: formData,
});

export const createSupplierSuccess = (data) => ({
  type: CREATE_SUPPLIER_SUCCESS,
  payload: data,
});

export const createSupplierFailure = (error) => ({
  type: CREATE_SUPPLIER_FAILURE,
  payload: error,
});

export const updateSupplierRequest = (supplierId, formData) => ({
  type: UPDATE_SUPPLIER_REQUEST,
  payload: { supplierId, formData },
});

export const updateSupplierSuccess = (data) => ({
  type: UPDATE_SUPPLIER_SUCCESS,
  payload: data,
});

export const updateSupplierFailure = (error) => ({
  type: UPDATE_SUPPLIER_FAILURE,
  payload: error,
});

export const getSuppliersRequest = (params = {}) => ({
  type: GET_SUPPLIERS_REQUEST,
  payload: params,
});

export const getSuppliersSuccess = (data) => ({
  type: GET_SUPPLIERS_SUCCESS,
  payload: data,
});

export const getSuppliersFailure = (error) => ({
  type: GET_SUPPLIERS_FAILURE,
  payload: error,
});

export const getSupplierByIdRequest = (supplierId) => ({
  type: GET_SUPPLIER_BY_ID_REQUEST,
  payload: supplierId,
});

export const getSupplierByIdSuccess = (data) => ({
  type: GET_SUPPLIER_BY_ID_SUCCESS,
  payload: data,
});

export const getSupplierByIdFailure = (error) => ({
  type: GET_SUPPLIER_BY_ID_FAILURE,
  payload: error,
});

export const getSuppliersForBrandRequest = () => ({
  type: GET_SUPPLIERS_FOR_BRAND_REQUEST,
});

export const getSuppliersForBrandSuccess = (data) => ({
  type: GET_SUPPLIERS_FOR_BRAND_SUCCESS,
  payload: data,
});

export const getSuppliersForBrandFailure = (error) => ({
  type: GET_SUPPLIERS_FOR_BRAND_FAILURE,
  payload: error,
});

export const createHarvestBatchRequest = (formData) => ({
  type: CREATE_HARVEST_BATCH_REQUEST,
  payload: formData,
});

export const createHarvestBatchSuccess = (data) => ({
  type: CREATE_HARVEST_BATCH_SUCCESS,
  payload: data,
});

export const createHarvestBatchFailure = (error) => ({
  type: CREATE_HARVEST_BATCH_FAILURE,
  payload: error,
});

export const updateHarvestBatchRequest = (harvestBatchId, formData) => ({
  type: UPDATE_HARVEST_BATCH_REQUEST,
  payload: { harvestBatchId, formData },
});

export const updateHarvestBatchSuccess = (data) => ({
  type: UPDATE_HARVEST_BATCH_SUCCESS,
  payload: data,
});

export const updateHarvestBatchFailure = (error) => ({
  type: UPDATE_HARVEST_BATCH_FAILURE,
  payload: error,
});

export const deleteHarvestBatchRequest = (harvestBatchId) => ({
  type: DELETE_HARVEST_BATCH_REQUEST,
  payload: harvestBatchId,
});

export const deleteHarvestBatchSuccess = (data) => ({
  type: DELETE_HARVEST_BATCH_SUCCESS,
  payload: data,
});

export const deleteHarvestBatchFailure = (error) => ({
  type: DELETE_HARVEST_BATCH_FAILURE,
  payload: error,
});

export const getHarvestBatchesRequest = (params = {}) => ({
  type: GET_HARVEST_BATCHES_REQUEST,
  payload: params,
});

export const getHarvestBatchesSuccess = (data) => ({
  type: GET_HARVEST_BATCHES_SUCCESS,
  payload: data,
});

export const getHarvestBatchesFailure = (error) => ({
  type: GET_HARVEST_BATCHES_FAILURE,
  payload: error,
});

export const getHarvestBatchByIdRequest = (harvestBatchId) => ({
  type: GET_HARVEST_BATCH_BY_ID_REQUEST,
  payload: harvestBatchId,
});

export const getHarvestBatchByIdSuccess = (data) => ({
  type: GET_HARVEST_BATCH_BY_ID_SUCCESS,
  payload: data,
});

export const getHarvestBatchByIdFailure = (error) => ({
  type: GET_HARVEST_BATCH_BY_ID_FAILURE,
  payload: error,
});

export const updatePurchaseCostRequest = (supplierId, formData) => ({
  type: UPDATE_PURCHASE_COST_REQUEST,
  payload: { supplierId, formData },
});

export const updatePurchaseCostSuccess = (data) => ({
  type: UPDATE_PURCHASE_COST_SUCCESS,
  payload: data,
});

export const updatePurchaseCostFailure = (error) => ({
  type: UPDATE_PURCHASE_COST_FAILURE,
  payload: error,
});

export const updateCooperationStatusRequest = (supplierId, formData) => ({
  type: UPDATE_COOPERATION_STATUS_REQUEST,
  payload: { supplierId, formData },
});

export const updateCooperationStatusSuccess = (data) => ({
  type: UPDATE_COOPERATION_STATUS_SUCCESS,
  payload: data,
});

export const updateCooperationStatusFailure = (error) => ({
  type: UPDATE_COOPERATION_STATUS_FAILURE,
  payload: error,
});

export const clearSupplierMessages = () => ({
  type: CLEAR_SUPPLIER_MESSAGES,
});
