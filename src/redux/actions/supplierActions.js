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

export const VERIFY_QUALITY_REQUEST = "VERIFY_QUALITY_REQUEST";
export const VERIFY_QUALITY_SUCCESS = "VERIFY_QUALITY_SUCCESS";
export const VERIFY_QUALITY_FAILURE = "VERIFY_QUALITY_FAILURE";

export const UPDATE_QUALITY_VERIFICATION_REQUEST = "UPDATE_QUALITY_VERIFICATION_REQUEST";
export const UPDATE_QUALITY_VERIFICATION_SUCCESS = "UPDATE_QUALITY_VERIFICATION_SUCCESS";
export const UPDATE_QUALITY_VERIFICATION_FAILURE = "UPDATE_QUALITY_VERIFICATION_FAILURE";

export const DELETE_QUALITY_VERIFICATION_REQUEST = "DELETE_QUALITY_VERIFICATION_REQUEST";
export const DELETE_QUALITY_VERIFICATION_SUCCESS = "DELETE_QUALITY_VERIFICATION_SUCCESS";
export const DELETE_QUALITY_VERIFICATION_FAILURE = "DELETE_QUALITY_VERIFICATION_FAILURE";

export const GET_QUALITY_VERIFICATIONS_REQUEST = "GET_QUALITY_VERIFICATIONS_REQUEST";
export const GET_QUALITY_VERIFICATIONS_SUCCESS = "GET_QUALITY_VERIFICATIONS_SUCCESS";
export const GET_QUALITY_VERIFICATIONS_FAILURE = "GET_QUALITY_VERIFICATIONS_FAILURE";

export const GET_QUALITY_VERIFICATION_BY_ID_REQUEST = "GET_QUALITY_VERIFICATION_BY_ID_REQUEST";
export const GET_QUALITY_VERIFICATION_BY_ID_SUCCESS = "GET_QUALITY_VERIFICATION_BY_ID_SUCCESS";
export const GET_QUALITY_VERIFICATION_BY_ID_FAILURE = "GET_QUALITY_VERIFICATION_BY_ID_FAILURE";

export const UPDATE_PURCHASE_COST_REQUEST = "UPDATE_PURCHASE_COST_REQUEST";
export const UPDATE_PURCHASE_COST_SUCCESS = "UPDATE_PURCHASE_COST_SUCCESS";
export const UPDATE_PURCHASE_COST_FAILURE = "UPDATE_PURCHASE_COST_FAILURE";

export const EVALUATE_PERFORMANCE_REQUEST = "EVALUATE_PERFORMANCE_REQUEST";
export const EVALUATE_PERFORMANCE_SUCCESS = "EVALUATE_PERFORMANCE_SUCCESS";
export const EVALUATE_PERFORMANCE_FAILURE = "EVALUATE_PERFORMANCE_FAILURE";

export const GET_PERFORMANCES_REQUEST = "GET_PERFORMANCES_REQUEST";
export const GET_PERFORMANCES_SUCCESS = "GET_PERFORMANCES_SUCCESS";
export const GET_PERFORMANCES_FAILURE = "GET_PERFORMANCES_FAILURE";

export const GET_PERFORMANCE_BY_ID_REQUEST = "GET_PERFORMANCE_BY_ID_REQUEST";
export const GET_PERFORMANCE_BY_ID_SUCCESS = "GET_PERFORMANCE_BY_ID_SUCCESS";
export const GET_PERFORMANCE_BY_ID_FAILURE = "GET_PERFORMANCE_BY_ID_FAILURE";

export const UPDATE_COOPERATION_STATUS_REQUEST = "UPDATE_COOPERATION_STATUS_REQUEST";
export const UPDATE_COOPERATION_STATUS_SUCCESS = "UPDATE_COOPERATION_STATUS_SUCCESS";
export const UPDATE_COOPERATION_STATUS_FAILURE = "UPDATE_COOPERATION_STATUS_FAILURE";

export const GET_ACTIVITY_LOG_REQUEST = "GET_ACTIVITY_LOG_REQUEST";
export const GET_ACTIVITY_LOG_SUCCESS = "GET_ACTIVITY_LOG_SUCCESS";
export const GET_ACTIVITY_LOG_FAILURE = "GET_ACTIVITY_LOG_FAILURE";

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

export const verifyQualityRequest = (formData) => ({
  type: VERIFY_QUALITY_REQUEST,
  payload: formData,
});

export const verifyQualitySuccess = (data) => ({
  type: VERIFY_QUALITY_SUCCESS,
  payload: data,
});

export const verifyQualityFailure = (error) => ({
  type: VERIFY_QUALITY_FAILURE,
  payload: error,
});

export const updateQualityVerificationRequest = (verificationId, formData) => ({
  type: UPDATE_QUALITY_VERIFICATION_REQUEST,
  payload: { verificationId, formData },
});

export const updateQualityVerificationSuccess = (data) => ({
  type: UPDATE_QUALITY_VERIFICATION_SUCCESS,
  payload: data,
});

export const updateQualityVerificationFailure = (error) => ({
  type: UPDATE_QUALITY_VERIFICATION_FAILURE,
  payload: error,
});

export const deleteQualityVerificationRequest = (verificationId) => ({
  type: DELETE_QUALITY_VERIFICATION_REQUEST,
  payload: verificationId,
});

export const deleteQualityVerificationSuccess = (data) => ({
  type: DELETE_QUALITY_VERIFICATION_SUCCESS,
  payload: data,
});

export const deleteQualityVerificationFailure = (error) => ({
  type: DELETE_QUALITY_VERIFICATION_FAILURE,
  payload: error,
});

export const getQualityVerificationsRequest = (params = {}) => ({
  type: GET_QUALITY_VERIFICATIONS_REQUEST,
  payload: params,
});

export const getQualityVerificationsSuccess = (data) => ({
  type: GET_QUALITY_VERIFICATIONS_SUCCESS,
  payload: data,
});

export const getQualityVerificationsFailure = (error) => ({
  type: GET_QUALITY_VERIFICATIONS_FAILURE,
  payload: error,
});

export const getQualityVerificationByIdRequest = (verificationId) => ({
  type: GET_QUALITY_VERIFICATION_BY_ID_REQUEST,
  payload: verificationId,
});

export const getQualityVerificationByIdSuccess = (data) => ({
  type: GET_QUALITY_VERIFICATION_BY_ID_SUCCESS,
  payload: data,
});

export const getQualityVerificationByIdFailure = (error) => ({
  type: GET_QUALITY_VERIFICATION_BY_ID_FAILURE,
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

export const evaluatePerformanceRequest = (formData) => ({
  type: EVALUATE_PERFORMANCE_REQUEST,
  payload: formData,
});

export const evaluatePerformanceSuccess = (data) => ({
  type: EVALUATE_PERFORMANCE_SUCCESS,
  payload: data,
});

export const evaluatePerformanceFailure = (error) => ({
  type: EVALUATE_PERFORMANCE_FAILURE,
  payload: error,
});

export const getPerformancesRequest = (params = {}) => ({
  type: GET_PERFORMANCES_REQUEST,
  payload: params,
});

export const getPerformancesSuccess = (data) => ({
  type: GET_PERFORMANCES_SUCCESS,
  payload: data,
});

export const getPerformancesFailure = (error) => ({
  type: GET_PERFORMANCES_FAILURE,
  payload: error,
});

export const getPerformanceByIdRequest = (performanceId) => ({
  type: GET_PERFORMANCE_BY_ID_REQUEST,
  payload: performanceId,
});

export const getPerformanceByIdSuccess = (data) => ({
  type: GET_PERFORMANCE_BY_ID_SUCCESS,
  payload: data,
});

export const getPerformanceByIdFailure = (error) => ({
  type: GET_PERFORMANCE_BY_ID_FAILURE,
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

export const getActivityLogRequest = (supplierId, params = {}) => ({
  type: GET_ACTIVITY_LOG_REQUEST,
  payload: { supplierId, params },
});

export const getActivityLogSuccess = (data) => ({
  type: GET_ACTIVITY_LOG_SUCCESS,
  payload: data,
});

export const getActivityLogFailure = (error) => ({
  type: GET_ACTIVITY_LOG_FAILURE,
  payload: error,
});

export const clearSupplierMessages = () => ({
  type: CLEAR_SUPPLIER_MESSAGES,
});
