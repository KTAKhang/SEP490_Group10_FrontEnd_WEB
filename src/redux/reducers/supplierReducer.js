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
  UPDATE_PURCHASE_COST_REQUEST,
  UPDATE_PURCHASE_COST_SUCCESS,
  UPDATE_PURCHASE_COST_FAILURE,
  UPDATE_COOPERATION_STATUS_REQUEST,
  UPDATE_COOPERATION_STATUS_SUCCESS,
  UPDATE_COOPERATION_STATUS_FAILURE,
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
  updatePurchaseCostLoading: false,
  updatePurchaseCostError: null,
  updateCooperationStatusLoading: false,
  updateCooperationStatusError: null,
  /** Patch visibility/eligible đã gửi lên; dùng để áp lên dữ liệu từ API khi backend chưa trả đúng */
  lastHarvestBatchPatch: {},
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
    case GET_HARVEST_BATCHES_SUCCESS: {
      const data = action.payload.data || [];
      const hasPatch = data.some((b) => state.lastHarvestBatchPatch[b._id]);
      const harvestBatches = hasPatch
        ? data.map((batch) => {
            const patch = state.lastHarvestBatchPatch[batch._id];
            if (!patch) return batch;
            return {
              ...batch,
              visibleInReceipt: patch.visibleInReceipt ?? batch.visibleInReceipt,
              receiptEligible: patch.receiptEligible ?? batch.receiptEligible,
            };
          })
        : data;
      return {
        ...state,
        harvestBatchesLoading: false,
        harvestBatches,
        harvestBatchesPagination: action.payload.pagination,
        harvestBatchesError: null,
      };
    }
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
    case GET_HARVEST_BATCH_BY_ID_SUCCESS: {
      const batch = action.payload;
      const patch = state.lastHarvestBatchPatch[batch?._id];
      const merged =
        patch && batch
          ? {
              ...batch,
              visibleInReceipt: patch.visibleInReceipt ?? batch.visibleInReceipt,
              receiptEligible: patch.receiptEligible ?? batch.receiptEligible,
            }
          : batch;
      return {
        ...state,
        harvestBatchDetailLoading: false,
        harvestBatchDetail: merged,
        harvestBatchDetailError: null,
      };
    }
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
    case UPDATE_HARVEST_BATCH_SUCCESS: {
      const formData = action.formData;
      const mergedBatch = formData
        ? {
            ...action.payload,
            visibleInReceipt:
              formData.visibleInReceipt ?? formData.visible_in_receipt ?? action.payload.visibleInReceipt,
            receiptEligible: formData.receiptEligible ?? action.payload.receiptEligible,
          }
        : action.payload;
      const patch =
        formData && (formData.visibleInReceipt !== undefined || formData.visible_in_receipt !== undefined || formData.receiptEligible !== undefined)
          ? {
              ...state.lastHarvestBatchPatch,
              [mergedBatch._id]: {
                visibleInReceipt: mergedBatch.visibleInReceipt,
                receiptEligible: mergedBatch.receiptEligible,
              },
            }
          : state.lastHarvestBatchPatch;
      return {
        ...state,
        updateHarvestBatchLoading: false,
        lastHarvestBatchPatch: patch,
        harvestBatches: state.harvestBatches.map((batch) =>
          batch._id === mergedBatch._id ? mergedBatch : batch
        ),
        harvestBatchDetail: mergedBatch,
        updateHarvestBatchError: null,
      };
    }
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


    // ===== CLEAR MESSAGES =====
    case CLEAR_SUPPLIER_MESSAGES:
      return {
        ...state,
        createSupplierError: null,
        updateSupplierError: null,
        createHarvestBatchError: null,
        updateHarvestBatchError: null,
        deleteHarvestBatchError: null,
        updatePurchaseCostError: null,
        updateCooperationStatusError: null,
      };


    default:
      return state;
  }
};


export default supplierReducer;




