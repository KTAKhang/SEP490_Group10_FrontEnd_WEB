import {
  CREATE_SUPPLIER_REQUEST,
  CREATE_SUPPLIER_SUCCESS,
  CREATE_SUPPLIER_FAILURE,
  UPDATE_SUPPLIER_REQUEST,
  UPDATE_SUPPLIER_SUCCESS,
  UPDATE_SUPPLIER_FAILURE,
  GET_SUPPLIERS_REQUEST,
  GET_SUPPLIERS_SUCCESS,
  GET_SUPPLIERS_FAILURE,
  GET_SUPPLIER_BY_ID_REQUEST,
  GET_SUPPLIER_BY_ID_SUCCESS,
  GET_SUPPLIER_BY_ID_FAILURE,
  GET_SUPPLIERS_FOR_BRAND_REQUEST,
  GET_SUPPLIERS_FOR_BRAND_SUCCESS,
  GET_SUPPLIERS_FOR_BRAND_FAILURE,
  CREATE_HARVEST_BATCH_REQUEST,
  CREATE_HARVEST_BATCH_SUCCESS,
  CREATE_HARVEST_BATCH_FAILURE,
  UPDATE_HARVEST_BATCH_REQUEST,
  UPDATE_HARVEST_BATCH_SUCCESS,
  UPDATE_HARVEST_BATCH_FAILURE,
  DELETE_HARVEST_BATCH_REQUEST,
  DELETE_HARVEST_BATCH_SUCCESS,
  DELETE_HARVEST_BATCH_FAILURE,
  GET_HARVEST_BATCHES_REQUEST,
  GET_HARVEST_BATCHES_SUCCESS,
  GET_HARVEST_BATCHES_FAILURE,
  GET_HARVEST_BATCH_BY_ID_REQUEST,
  GET_HARVEST_BATCH_BY_ID_SUCCESS,
  GET_HARVEST_BATCH_BY_ID_FAILURE,
  VERIFY_QUALITY_REQUEST,
  VERIFY_QUALITY_SUCCESS,
  VERIFY_QUALITY_FAILURE,
  UPDATE_QUALITY_VERIFICATION_REQUEST,
  UPDATE_QUALITY_VERIFICATION_SUCCESS,
  UPDATE_QUALITY_VERIFICATION_FAILURE,
  DELETE_QUALITY_VERIFICATION_REQUEST,
  DELETE_QUALITY_VERIFICATION_SUCCESS,
  DELETE_QUALITY_VERIFICATION_FAILURE,
  GET_QUALITY_VERIFICATIONS_REQUEST,
  GET_QUALITY_VERIFICATIONS_SUCCESS,
  GET_QUALITY_VERIFICATIONS_FAILURE,
  GET_QUALITY_VERIFICATION_BY_ID_REQUEST,
  GET_QUALITY_VERIFICATION_BY_ID_SUCCESS,
  GET_QUALITY_VERIFICATION_BY_ID_FAILURE,
  UPDATE_PURCHASE_COST_REQUEST,
  UPDATE_PURCHASE_COST_SUCCESS,
  UPDATE_PURCHASE_COST_FAILURE,
  EVALUATE_PERFORMANCE_REQUEST,
  EVALUATE_PERFORMANCE_SUCCESS,
  EVALUATE_PERFORMANCE_FAILURE,
  GET_PERFORMANCES_REQUEST,
  GET_PERFORMANCES_SUCCESS,
  GET_PERFORMANCES_FAILURE,
  GET_PERFORMANCE_BY_ID_REQUEST,
  GET_PERFORMANCE_BY_ID_SUCCESS,
  GET_PERFORMANCE_BY_ID_FAILURE,
  UPDATE_COOPERATION_STATUS_REQUEST,
  UPDATE_COOPERATION_STATUS_SUCCESS,
  UPDATE_COOPERATION_STATUS_FAILURE,
  GET_ACTIVITY_LOG_REQUEST,
  GET_ACTIVITY_LOG_SUCCESS,
  GET_ACTIVITY_LOG_FAILURE,
  CLEAR_SUPPLIER_MESSAGES,
} from "../actions/supplierActions";

const initialState = {
  suppliers: [],
  suppliersLoading: false,
  suppliersError: null,
  suppliersPagination: null,
  supplierDetail: null,
  supplierDetailLoading: false,
  supplierDetailError: null,
  suppliersForBrand: [],
  suppliersForBrandLoading: false,
  suppliersForBrandError: null,
  createSupplierLoading: false,
  createSupplierError: null,
  updateSupplierLoading: false,
  updateSupplierError: null,
  createHarvestBatchLoading: false,
  createHarvestBatchError: null,
  harvestBatches: [],
  harvestBatchesLoading: false,
  harvestBatchesError: null,
  harvestBatchesPagination: null,
  harvestBatchDetail: null,
  harvestBatchDetailLoading: false,
  harvestBatchDetailError: null,
  updateHarvestBatchLoading: false,
  updateHarvestBatchError: null,
  deleteHarvestBatchLoading: false,
  deleteHarvestBatchError: null,
  verifyQualityLoading: false,
  verifyQualityError: null,
  qualityVerifications: [],
  qualityVerificationsLoading: false,
  qualityVerificationsError: null,
  qualityVerificationsPagination: null,
  qualityVerificationDetail: null,
  qualityVerificationDetailLoading: false,
  qualityVerificationDetailError: null,
  updateQualityVerificationLoading: false,
  updateQualityVerificationError: null,
  deleteQualityVerificationLoading: false,
  deleteQualityVerificationError: null,
  updatePurchaseCostLoading: false,
  updatePurchaseCostError: null,
  evaluatePerformanceLoading: false,
  evaluatePerformanceError: null,
  performances: [],
  performancesLoading: false,
  performancesError: null,
  performancesPagination: null,
  performanceDetail: null,
  performanceDetailLoading: false,
  performanceDetailError: null,
  updateCooperationStatusLoading: false,
  updateCooperationStatusError: null,
  activityLog: [],
  activityLogLoading: false,
  activityLogError: null,
  activityLogPagination: null,
};

const supplierReducer = (state = initialState, action) => {
  switch (action.type) {
    // ===== GET SUPPLIERS =====
    case GET_SUPPLIERS_REQUEST:
      return {
        ...state,
        suppliersLoading: true,
        suppliersError: null,
      };
    case GET_SUPPLIERS_SUCCESS:
      return {
        ...state,
        suppliersLoading: false,
        suppliers: action.payload.data,
        suppliersPagination: action.payload.pagination,
        suppliersError: null,
      };
    case GET_SUPPLIERS_FAILURE:
      return {
        ...state,
        suppliersLoading: false,
        suppliersError: action.payload,
      };

    // ===== GET SUPPLIER BY ID =====
    case GET_SUPPLIER_BY_ID_REQUEST:
      return {
        ...state,
        supplierDetailLoading: true,
        supplierDetailError: null,
      };
    case GET_SUPPLIER_BY_ID_SUCCESS:
      return {
        ...state,
        supplierDetailLoading: false,
        supplierDetail: action.payload,
        supplierDetailError: null,
      };
    case GET_SUPPLIER_BY_ID_FAILURE:
      return {
        ...state,
        supplierDetailLoading: false,
        supplierDetailError: action.payload,
      };

    // ===== GET SUPPLIERS FOR BRAND =====
    case GET_SUPPLIERS_FOR_BRAND_REQUEST:
      return {
        ...state,
        suppliersForBrandLoading: true,
        suppliersForBrandError: null,
      };
    case GET_SUPPLIERS_FOR_BRAND_SUCCESS:
      return {
        ...state,
        suppliersForBrandLoading: false,
        suppliersForBrand: action.payload,
        suppliersForBrandError: null,
      };
    case GET_SUPPLIERS_FOR_BRAND_FAILURE:
      return {
        ...state,
        suppliersForBrandLoading: false,
        suppliersForBrandError: action.payload,
      };

    // ===== CREATE SUPPLIER =====
    case CREATE_SUPPLIER_REQUEST:
      return {
        ...state,
        createSupplierLoading: true,
        createSupplierError: null,
      };
    case CREATE_SUPPLIER_SUCCESS:
      return {
        ...state,
        createSupplierLoading: false,
        suppliers: [action.payload, ...state.suppliers],
        createSupplierError: null,
      };
    case CREATE_SUPPLIER_FAILURE:
      return {
        ...state,
        createSupplierLoading: false,
        createSupplierError: action.payload,
      };

    // ===== UPDATE SUPPLIER =====
    case UPDATE_SUPPLIER_REQUEST:
      return {
        ...state,
        updateSupplierLoading: true,
        updateSupplierError: null,
      };
    case UPDATE_SUPPLIER_SUCCESS:
      return {
        ...state,
        updateSupplierLoading: false,
        suppliers: state.suppliers.map((supplier) =>
          supplier._id === action.payload._id ? action.payload : supplier
        ),
        supplierDetail: action.payload,
        updateSupplierError: null,
      };
    case UPDATE_SUPPLIER_FAILURE:
      return {
        ...state,
        updateSupplierLoading: false,
        updateSupplierError: action.payload,
      };

    // ===== CREATE HARVEST BATCH =====
    case CREATE_HARVEST_BATCH_REQUEST:
      return {
        ...state,
        createHarvestBatchLoading: true,
        createHarvestBatchError: null,
      };
    case CREATE_HARVEST_BATCH_SUCCESS:
      return {
        ...state,
        createHarvestBatchLoading: false,
        harvestBatches: [action.payload, ...state.harvestBatches],
        createHarvestBatchError: null,
      };
    case CREATE_HARVEST_BATCH_FAILURE:
      return {
        ...state,
        createHarvestBatchLoading: false,
        createHarvestBatchError: action.payload,
      };

    // ===== GET HARVEST BATCHES =====
    case GET_HARVEST_BATCHES_REQUEST:
      return {
        ...state,
        harvestBatchesLoading: true,
        harvestBatchesError: null,
      };
    case GET_HARVEST_BATCHES_SUCCESS:
      return {
        ...state,
        harvestBatchesLoading: false,
        harvestBatches: action.payload.data,
        harvestBatchesPagination: action.payload.pagination,
        harvestBatchesError: null,
      };
    case GET_HARVEST_BATCHES_FAILURE:
      return {
        ...state,
        harvestBatchesLoading: false,
        harvestBatchesError: action.payload,
      };

    // ===== GET HARVEST BATCH BY ID =====
    case GET_HARVEST_BATCH_BY_ID_REQUEST:
      return {
        ...state,
        harvestBatchDetailLoading: true,
        harvestBatchDetailError: null,
      };
    case GET_HARVEST_BATCH_BY_ID_SUCCESS:
      return {
        ...state,
        harvestBatchDetailLoading: false,
        harvestBatchDetail: action.payload,
        harvestBatchDetailError: null,
      };
    case GET_HARVEST_BATCH_BY_ID_FAILURE:
      return {
        ...state,
        harvestBatchDetailLoading: false,
        harvestBatchDetailError: action.payload,
      };

    // ===== UPDATE HARVEST BATCH =====
    case UPDATE_HARVEST_BATCH_REQUEST:
      return {
        ...state,
        updateHarvestBatchLoading: true,
        updateHarvestBatchError: null,
      };
    case UPDATE_HARVEST_BATCH_SUCCESS:
      return {
        ...state,
        updateHarvestBatchLoading: false,
        harvestBatches: state.harvestBatches.map((batch) =>
          batch._id === action.payload._id ? action.payload : batch
        ),
        harvestBatchDetail: action.payload,
        updateHarvestBatchError: null,
      };
    case UPDATE_HARVEST_BATCH_FAILURE:
      return {
        ...state,
        updateHarvestBatchLoading: false,
        updateHarvestBatchError: action.payload,
      };

    // ===== DELETE HARVEST BATCH =====
    case DELETE_HARVEST_BATCH_REQUEST:
      return {
        ...state,
        deleteHarvestBatchLoading: true,
        deleteHarvestBatchError: null,
      };
    case DELETE_HARVEST_BATCH_SUCCESS:
      return {
        ...state,
        deleteHarvestBatchLoading: false,
        harvestBatches: state.harvestBatches.filter(
          (batch) => batch._id !== action.payload
        ),
        deleteHarvestBatchError: null,
      };
    case DELETE_HARVEST_BATCH_FAILURE:
      return {
        ...state,
        deleteHarvestBatchLoading: false,
        deleteHarvestBatchError: action.payload,
      };

    // ===== VERIFY QUALITY =====
    case VERIFY_QUALITY_REQUEST:
      return {
        ...state,
        verifyQualityLoading: true,
        verifyQualityError: null,
      };
    case VERIFY_QUALITY_SUCCESS:
      return {
        ...state,
        verifyQualityLoading: false,
        qualityVerifications: [action.payload, ...state.qualityVerifications],
        verifyQualityError: null,
      };
    case VERIFY_QUALITY_FAILURE:
      return {
        ...state,
        verifyQualityLoading: false,
        verifyQualityError: action.payload,
      };

    // ===== GET QUALITY VERIFICATIONS =====
    case GET_QUALITY_VERIFICATIONS_REQUEST:
      return {
        ...state,
        qualityVerificationsLoading: true,
        qualityVerificationsError: null,
      };
    case GET_QUALITY_VERIFICATIONS_SUCCESS:
      return {
        ...state,
        qualityVerificationsLoading: false,
        qualityVerifications: action.payload.data,
        qualityVerificationsPagination: action.payload.pagination,
        qualityVerificationsError: null,
      };
    case GET_QUALITY_VERIFICATIONS_FAILURE:
      return {
        ...state,
        qualityVerificationsLoading: false,
        qualityVerificationsError: action.payload,
      };

    // ===== GET QUALITY VERIFICATION BY ID =====
    case GET_QUALITY_VERIFICATION_BY_ID_REQUEST:
      return {
        ...state,
        qualityVerificationDetailLoading: true,
        qualityVerificationDetailError: null,
      };
    case GET_QUALITY_VERIFICATION_BY_ID_SUCCESS:
      return {
        ...state,
        qualityVerificationDetailLoading: false,
        qualityVerificationDetail: action.payload,
        qualityVerificationDetailError: null,
      };
    case GET_QUALITY_VERIFICATION_BY_ID_FAILURE:
      return {
        ...state,
        qualityVerificationDetailLoading: false,
        qualityVerificationDetailError: action.payload,
      };

    // ===== UPDATE QUALITY VERIFICATION =====
    case UPDATE_QUALITY_VERIFICATION_REQUEST:
      return {
        ...state,
        updateQualityVerificationLoading: true,
        updateQualityVerificationError: null,
      };
    case UPDATE_QUALITY_VERIFICATION_SUCCESS:
      return {
        ...state,
        updateQualityVerificationLoading: false,
        qualityVerifications: state.qualityVerifications.map((verification) =>
          verification._id === action.payload._id ? action.payload : verification
        ),
        qualityVerificationDetail: action.payload,
        updateQualityVerificationError: null,
      };
    case UPDATE_QUALITY_VERIFICATION_FAILURE:
      return {
        ...state,
        updateQualityVerificationLoading: false,
        updateQualityVerificationError: action.payload,
      };

    // ===== DELETE QUALITY VERIFICATION =====
    case DELETE_QUALITY_VERIFICATION_REQUEST:
      return {
        ...state,
        deleteQualityVerificationLoading: true,
        deleteQualityVerificationError: null,
      };
    case DELETE_QUALITY_VERIFICATION_SUCCESS:
      return {
        ...state,
        deleteQualityVerificationLoading: false,
        qualityVerifications: state.qualityVerifications.filter(
          (verification) => verification._id !== action.payload
        ),
        deleteQualityVerificationError: null,
      };
    case DELETE_QUALITY_VERIFICATION_FAILURE:
      return {
        ...state,
        deleteQualityVerificationLoading: false,
        deleteQualityVerificationError: action.payload,
      };

    // ===== UPDATE PURCHASE COST =====
    case UPDATE_PURCHASE_COST_REQUEST:
      return {
        ...state,
        updatePurchaseCostLoading: true,
        updatePurchaseCostError: null,
      };
    case UPDATE_PURCHASE_COST_SUCCESS:
      return {
        ...state,
        updatePurchaseCostLoading: false,
        supplierDetail: action.payload.supplier,
        suppliers: state.suppliers.map((supplier) =>
          supplier._id === action.payload.supplier._id
            ? action.payload.supplier
            : supplier
        ),
        updatePurchaseCostError: null,
      };
    case UPDATE_PURCHASE_COST_FAILURE:
      return {
        ...state,
        updatePurchaseCostLoading: false,
        updatePurchaseCostError: action.payload,
      };

    // ===== EVALUATE PERFORMANCE =====
    case EVALUATE_PERFORMANCE_REQUEST:
      return {
        ...state,
        evaluatePerformanceLoading: true,
        evaluatePerformanceError: null,
      };
    case EVALUATE_PERFORMANCE_SUCCESS:
      return {
        ...state,
        evaluatePerformanceLoading: false,
        performances: [action.payload, ...state.performances],
        evaluatePerformanceError: null,
      };
    case EVALUATE_PERFORMANCE_FAILURE:
      return {
        ...state,
        evaluatePerformanceLoading: false,
        evaluatePerformanceError: action.payload,
      };

    // ===== GET PERFORMANCES =====
    case GET_PERFORMANCES_REQUEST:
      return {
        ...state,
        performancesLoading: true,
        performancesError: null,
      };
    case GET_PERFORMANCES_SUCCESS:
      return {
        ...state,
        performancesLoading: false,
        performances: action.payload.data,
        performancesPagination: action.payload.pagination,
        performancesError: null,
      };
    case GET_PERFORMANCES_FAILURE:
      return {
        ...state,
        performancesLoading: false,
        performancesError: action.payload,
      };

    // ===== GET PERFORMANCE BY ID =====
    case GET_PERFORMANCE_BY_ID_REQUEST:
      return {
        ...state,
        performanceDetailLoading: true,
        performanceDetailError: null,
      };
    case GET_PERFORMANCE_BY_ID_SUCCESS:
      return {
        ...state,
        performanceDetailLoading: false,
        performanceDetail: action.payload,
        performanceDetailError: null,
      };
    case GET_PERFORMANCE_BY_ID_FAILURE:
      return {
        ...state,
        performanceDetailLoading: false,
        performanceDetailError: action.payload,
      };

    // ===== UPDATE COOPERATION STATUS =====
    case UPDATE_COOPERATION_STATUS_REQUEST:
      return {
        ...state,
        updateCooperationStatusLoading: true,
        updateCooperationStatusError: null,
      };
    case UPDATE_COOPERATION_STATUS_SUCCESS:
      return {
        ...state,
        updateCooperationStatusLoading: false,
        supplierDetail: action.payload,
        suppliers: state.suppliers.map((supplier) =>
          supplier._id === action.payload._id ? action.payload : supplier
        ),
        updateCooperationStatusError: null,
      };
    case UPDATE_COOPERATION_STATUS_FAILURE:
      return {
        ...state,
        updateCooperationStatusLoading: false,
        updateCooperationStatusError: action.payload,
      };

    // ===== GET ACTIVITY LOG =====
    case GET_ACTIVITY_LOG_REQUEST:
      return {
        ...state,
        activityLogLoading: true,
        activityLogError: null,
      };
    case GET_ACTIVITY_LOG_SUCCESS:
      return {
        ...state,
        activityLogLoading: false,
        activityLog: action.payload.data,
        activityLogPagination: action.payload.pagination,
        activityLogError: null,
      };
    case GET_ACTIVITY_LOG_FAILURE:
      return {
        ...state,
        activityLogLoading: false,
        activityLogError: action.payload,
      };

    // ===== CLEAR MESSAGES =====
    case CLEAR_SUPPLIER_MESSAGES:
      return {
        ...state,
        createSupplierError: null,
        updateSupplierError: null,
        createHarvestBatchError: null,
        updateHarvestBatchError: null,
        deleteHarvestBatchError: null,
        verifyQualityError: null,
        updateQualityVerificationError: null,
        deleteQualityVerificationError: null,
        updatePurchaseCostError: null,
        evaluatePerformanceError: null,
        updateCooperationStatusError: null,
      };

    default:
      return state;
  }
};

export default supplierReducer;
