import { X, Eye, CheckCircle, XCircle } from "lucide-react";

const ReadCategory = ({ isOpen, onClose, category }) => {
  if (!isOpen || !category) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800 flex items-center space-x-2">
            <Eye size={24} />
            <span>Category details</span>
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>
        <div className="p-6 space-y-6">
          {/* Image */}
          {category.image && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Image</h3>
              <img
                src={category.image}
                alt={category.name}
                className="w-full max-w-md h-64 object-cover rounded-lg border"
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/400";
                }}
              />
            </div>
          )}

          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Category name</h3>
              <p className="text-lg font-semibold text-gray-900">{category.name}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Status</h3>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  category.status
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {category.status ? (
                  <>
                    <CheckCircle size={16} className="mr-1" />
                    Active
                  </>
                ) : (
                  <>
                    <XCircle size={16} className="mr-1" />
                    Inactive
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Description */}
          {category.description && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
              <p className="text-gray-900 whitespace-pre-wrap">{category.description}</p>
            </div>
          )}

          {/* Timestamps */}
          <div className="border-t pt-4 grid grid-cols-2 gap-4 text-sm text-gray-500">
            <div>
              <p>Created: {category.createdAt ? new Date(category.createdAt).toLocaleString("en-US") : "N/A"}</p>
            </div>
            <div>
              <p>Last updated: {category.updatedAt ? new Date(category.updatedAt).toLocaleString("en-US") : "N/A"}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end p-6 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReadCategory;
