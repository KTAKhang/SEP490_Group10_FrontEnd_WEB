import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X, Building2, Phone, Mail, MapPin, FileText, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { getSupplierByIdRequest } from "../../../redux/actions/supplierActions";
import Loading from "../../../components/Loading/Loading";

const ReadSupplier = ({ isOpen, onClose, supplierId }) => {
  const dispatch = useDispatch();
  const {
    supplierDetail,
    supplierDetailLoading,
  } = useSelector((state) => state.supplier);

  useEffect(() => {
    if (isOpen && supplierId) {
      dispatch(getSupplierByIdRequest(supplierId));
    }
  }, [dispatch, isOpen, supplierId]);

  const getCooperationStatusBadge = (status) => {
    switch (status) {
      case "ACTIVE":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <CheckCircle size={16} className="mr-1" />
            Active
          </span>
        );
      case "TERMINATED":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
            <XCircle size={16} className="mr-1" />
            Terminated
          </span>
        );
      default:
        return <span className="text-gray-500">N/A</span>;
    }
  };

  if (!isOpen || !supplierId) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
            <Building2 size={24} />
            <span>Supplier Details</span>
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        {supplierDetailLoading ? (
          <div className="p-6">
            <Loading message="Loading supplier details..." />
          </div>
        ) : supplierDetail ? (
          <div className="p-6">
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Code</p>
                    <p className="text-base font-medium text-gray-900">{supplierDetail.code || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Name</p>
                    <p className="text-base font-medium text-gray-900">{supplierDetail.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Type</p>
                    <p className="text-base font-medium text-gray-900">
                      {supplierDetail.type === "FARM" ? "🏭 Farm" : supplierDetail.type === "COOPERATIVE" ? "🤝 Cooperative" : "💼 Business"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Cooperation Status</p>
                    {getCooperationStatusBadge(supplierDetail.cooperationStatus)}
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Contact Information</h3>
                <div className="space-y-3">
                  {supplierDetail.contactPerson && (
                    <div className="flex items-start space-x-3">
                      <Building2 size={20} className="text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Contact Person</p>
                        <p className="text-base font-medium text-gray-900">{supplierDetail.contactPerson}</p>
                      </div>
                    </div>
                  )}
                  {supplierDetail.phone && (
                    <div className="flex items-start space-x-3">
                      <Phone size={20} className="text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="text-base font-medium text-gray-900">{supplierDetail.phone}</p>
                      </div>
                    </div>
                  )}
                  {supplierDetail.email && (
                    <div className="flex items-start space-x-3">
                      <Mail size={20} className="text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="text-base font-medium text-gray-900">{supplierDetail.email}</p>
                      </div>
                    </div>
                  )}
                  {supplierDetail.address && (
                    <div className="flex items-start space-x-3">
                      <MapPin size={20} className="text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Address</p>
                        <p className="text-base font-medium text-gray-900">{supplierDetail.address}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Statistics */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Statistics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Total Batches</p>
                    <p className="text-2xl font-bold text-gray-900">{supplierDetail.totalBatches || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Total Products Supplied</p>
                    <p className="text-2xl font-bold text-gray-900">{supplierDetail.totalProductsSupplied || 0}</p>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {supplierDetail.notes && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                    <FileText size={20} />
                    <span>Notes</span>
                  </h3>
                  <p className="text-base text-gray-700 whitespace-pre-wrap">{supplierDetail.notes}</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-6 text-center">
            <p className="text-gray-600">Supplier not found</p>
          </div>
        )}

        <div className="flex justify-end p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReadSupplier;
