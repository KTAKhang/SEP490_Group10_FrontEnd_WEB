import { useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Package } from "lucide-react";
import { BatchHistoryDetailContent, getProductDisplayName } from "./BatchHistoryDetail";

const BatchHistoryDetailPage = () => {
  const { productId, batchId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { batch, product } = location.state || {};

  useEffect(() => {
    if (!batch && productId) {
      navigate(`/admin/batch-history/${productId}`, { replace: true });
    }
  }, [batch, productId, navigate]);

  const handleBack = () => {
    navigate(`/admin/batch-history/${productId}`);
  };

  if (!batch) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={handleBack}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors"
          title="Go back to batch history"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
          <Package size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Batch #{batch.batchNumber} — {getProductDisplayName(batch, product) || "Product"}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Completed batch details</p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200/80 bg-white shadow-sm overflow-hidden">
        <BatchHistoryDetailContent batch={batch} product={product} />
        <div className="flex justify-end p-6 border-t bg-gray-50">
          <button
            onClick={handleBack}
            className="px-6 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors"
          >
            Go back
          </button>
        </div>
      </div>
    </div>
  );
};

export default BatchHistoryDetailPage;
