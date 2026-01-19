import { Link } from "react-router-dom";
import { Building2, Package, CheckSquare, BarChart3 } from "lucide-react";

const QcStaffPage = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">QC Staff Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome to Quality Control Staff Panel</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Suppliers</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">-</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Building2 className="text-purple-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Harvest Batches</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">-</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Package className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Quality Verifications</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">-</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckSquare className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Performance Evaluations</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">-</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <BarChart3 className="text-yellow-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <h3 className="font-medium text-gray-800 mb-2">Supplier Management</h3>
            <p className="text-sm text-gray-600 mb-3">
              Create, update, and manage supplier information
            </p>
            <Link
              to="/qc-staff/suppliers"
              className="text-purple-600 hover:text-purple-700 font-medium text-sm"
            >
              Go to Suppliers →
            </Link>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <h3 className="font-medium text-gray-800 mb-2">Harvest Batches</h3>
            <p className="text-sm text-gray-600 mb-3">
              Manage harvest batches from suppliers
            </p>
            <Link
              to="/qc-staff/harvest-batches"
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              Go to Harvest Batches →
            </Link>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <h3 className="font-medium text-gray-800 mb-2">Quality Verifications</h3>
            <p className="text-sm text-gray-600 mb-3">
              Verify product quality from suppliers
            </p>
            <Link
              to="/qc-staff/quality-verifications"
              className="text-green-600 hover:text-green-700 font-medium text-sm"
            >
              Go to Quality Verifications →
            </Link>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <h3 className="font-medium text-gray-800 mb-2">Performance Evaluations</h3>
            <p className="text-sm text-gray-600 mb-3">
              Evaluate supplier performance metrics
            </p>
            <Link
              to="/qc-staff/performance-evaluations"
              className="text-yellow-600 hover:text-yellow-700 font-medium text-sm"
            >
              Go to Performance Evaluations →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QcStaffPage;
