import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Search,
  Gift,
  Eye,
  Trash2,
  Filter,
  CheckCircle,
  XCircle,
  Package,
  X,
  Plus,
  Edit,
} from "lucide-react";
import Loading from "../../../components/Loading/Loading";
import {
  getFruitBasketsRequest,
  getFruitBasketByIdRequest,
  deleteFruitBasketRequest,
} from "../../../redux/actions/fruitBasketActions";
import CreateFruitBasket from "./CreateFruitBasket";
import UpdateFruitBasket from "./UpdateFruitBasket";

const FruitBasketDetailModal = ({ isOpen, onClose, basket, loading }) => {
  if (!isOpen) return null;

  const formatCurrency = (value) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
            <Gift size={24} />
            <span>Fruit Basket Details</span>
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        {loading ? (
          <div className="p-6">
            <Loading message="Loading fruit basket details..." />
          </div>
        ) : !basket ? (
          <div className="p-6 text-center text-gray-600">Fruit basket not found</div>
        ) : (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="text-lg font-semibold text-gray-900">{basket.name}</p>
                </div>
                {basket.short_desc && (
                  <div>
                    <p className="text-sm text-gray-500">Short description</p>
                    <p className="text-gray-800">{basket.short_desc}</p>
                  </div>
                )}
                {basket.detail_desc && (
                  <div>
                    <p className="text-sm text-gray-500">Detail description</p>
                    <p className="text-gray-800 whitespace-pre-wrap">{basket.detail_desc}</p>
                  </div>
                )}
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Total price</p>
                  <p className="text-lg font-semibold text-green-700">
                    {formatCurrency(basket.totalPrice)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Stock status</p>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      basket.stockStatus === "IN_STOCK"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {basket.stockStatus === "IN_STOCK" ? "In stock" : "Out of stock"}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      basket.status ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {basket.status ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Items</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(basket.items || []).map((item, index) => (
                  <div key={index} className="border rounded-lg p-4 flex space-x-4">
                    <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                      {item.product?.images?.[0] ? (
                        <img
                          src={item.product.images[0]}
                          alt={item.product?.name || "Product"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Package size={20} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.product?.name || "N/A"}</p>
                      <p className="text-sm text-gray-600">
                        Qty: {item.quantity} | Price: {formatCurrency(item.product?.price || 0)}
                      </p>
                      <p className="text-sm text-gray-800 font-semibold">
                        Line total: {formatCurrency(item.lineTotal)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {Array.isArray(basket.images) && basket.images.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Images</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {basket.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`Fruit basket ${idx + 1}`}
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                  ))}
                </div>
              </div>
            )}
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

const FruitBasketPage = () => {
  const dispatch = useDispatch();
  const {
    fruitBaskets,
    fruitBasketsLoading,
    fruitBasketsPagination,
    fruitBasketDetail,
    fruitBasketDetailLoading,
    deleteFruitBasketLoading,
    deleteFruitBasketError,
    createFruitBasketLoading,
    createFruitBasketError,
    updateFruitBasketLoading,
    updateFruitBasketError,
  } = useSelector((state) => state.fruitBasket);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showReadModal, setShowReadModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedBasket, setSelectedBasket] = useState(null);
  const [selectedBasketId, setSelectedBasketId] = useState(null);
  const [prevDeleteLoading, setPrevDeleteLoading] = useState(false);
  const [prevCreateLoading, setPrevCreateLoading] = useState(false);
  const [prevUpdateLoading, setPrevUpdateLoading] = useState(false);

  useEffect(() => {
    dispatch(
      getFruitBasketsRequest({
        page: currentPage,
        limit: 10,
        search: searchTerm || undefined,
        status: filterStatus !== "all" ? filterStatus : undefined,
        sortBy,
        sortOrder,
      })
    );
  }, [dispatch, currentPage, searchTerm, filterStatus, sortBy, sortOrder]);

  useEffect(() => {
    if (prevDeleteLoading && !deleteFruitBasketLoading && !deleteFruitBasketError) {
      dispatch(
        getFruitBasketsRequest({
          page: currentPage,
          limit: 10,
          search: searchTerm || undefined,
          status: filterStatus !== "all" ? filterStatus : undefined,
          sortBy,
          sortOrder,
        })
      );
    }
    setPrevDeleteLoading(deleteFruitBasketLoading);
  }, [
    dispatch,
    prevDeleteLoading,
    deleteFruitBasketLoading,
    deleteFruitBasketError,
    currentPage,
    searchTerm,
    filterStatus,
    sortBy,
    sortOrder,
  ]);

  useEffect(() => {
    if (prevCreateLoading && !createFruitBasketLoading && !createFruitBasketError) {
      dispatch(
        getFruitBasketsRequest({
          page: currentPage,
          limit: 10,
          search: searchTerm || undefined,
          status: filterStatus !== "all" ? filterStatus : undefined,
          sortBy,
          sortOrder,
        })
      );
    }
    setPrevCreateLoading(createFruitBasketLoading);
  }, [
    dispatch,
    prevCreateLoading,
    createFruitBasketLoading,
    createFruitBasketError,
    currentPage,
    searchTerm,
    filterStatus,
    sortBy,
    sortOrder,
  ]);

  useEffect(() => {
    if (prevUpdateLoading && !updateFruitBasketLoading && !updateFruitBasketError) {
      dispatch(
        getFruitBasketsRequest({
          page: currentPage,
          limit: 10,
          search: searchTerm || undefined,
          status: filterStatus !== "all" ? filterStatus : undefined,
          sortBy,
          sortOrder,
        })
      );
    }
    setPrevUpdateLoading(updateFruitBasketLoading);
  }, [
    dispatch,
    prevUpdateLoading,
    updateFruitBasketLoading,
    updateFruitBasketError,
    currentPage,
    searchTerm,
    filterStatus,
    sortBy,
    sortOrder,
  ]);

  const formatCurrency = (value) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value || 0);

  const handleView = (basketId) => {
    setSelectedBasketId(basketId);
    dispatch(getFruitBasketByIdRequest(basketId));
    setShowReadModal(true);
  };

  const handleEdit = (basket) => {
    setSelectedBasket(basket);
    setShowUpdateModal(true);
  };

  const handleDelete = (basket) => {
    if (!window.confirm(`Are you sure you want to delete "${basket.name}"?`)) return;
    dispatch(deleteFruitBasketRequest(basket._id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Fruit basket management</h1>
          <p className="text-gray-600 mt-1">Manage fruit basket products</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <Plus size={18} />
          <span>Add fruit basket</span>
        </button>
      </div>

      <div className="bg-white rounded-lg border shadow-sm p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="text-gray-400" size={20} />
          <h2 className="text-lg font-semibold text-gray-800">Filters</h2>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search by basket name..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="createdAt">Created date</option>
              <option value="updatedAt">Updated date</option>
              <option value="name">Name</option>
              <option value="status">Status</option>
            </select>
            <select
              value={sortOrder}
              onChange={(e) => {
                setSortOrder(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-800">
            Fruit baskets ({fruitBasketsPagination?.total || fruitBaskets.length})
          </h2>
        </div>
        <div className="p-6">
          {fruitBasketsLoading || deleteFruitBasketLoading ? (
            <Loading message="Loading fruit baskets..." />
          ) : fruitBaskets.length === 0 ? (
            <div className="text-center py-12">
              <Gift className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No fruit baskets found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Basket
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Items
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total price
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Availability
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {fruitBaskets.map((basket) => (
                      <tr key={basket._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden">
                              {basket.featuredImage ? (
                                <img
                                  src={basket.featuredImage}
                                  alt={basket.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                  <Gift size={18} />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{basket.name}</p>
                              {basket.short_desc && (
                                <p className="text-xs text-gray-500 truncate max-w-xs">
                                  {basket.short_desc}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-gray-900">
                            {(basket.items || []).length} items
                          </p>
                          <p className="text-xs text-gray-500">
                            {(basket.items || [])
                              .map((item) => item.product?.name)
                              .filter(Boolean)
                              .slice(0, 2)
                              .join(", ")}
                            {(basket.items || []).length > 2 ? "..." : ""}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm font-semibold text-green-700">
                            {formatCurrency(basket.totalPrice)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              basket.stockStatus === "IN_STOCK"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {basket.stockStatus === "IN_STOCK" ? "In stock" : "Out of stock"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              basket.status ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {basket.status ? (
                              <>
                                <CheckCircle size={14} className="mr-1" />
                                Active
                              </>
                            ) : (
                              <>
                                <XCircle size={14} className="mr-1" />
                                Inactive
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleView(basket._id)}
                              className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                              title="View details"
                            >
                              <Eye size={18} />
                            </button>
                            <button
                              onClick={() => handleEdit(basket)}
                              className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded"
                              title="Edit basket"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(basket)}
                              className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
                              title="Delete basket"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {fruitBasketsPagination && fruitBasketsPagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div className="text-sm text-gray-700">
                    Showing{" "}
                    {fruitBasketsPagination.page * fruitBasketsPagination.limit -
                      fruitBasketsPagination.limit +
                      1}{" "}
                    -{" "}
                    {Math.min(
                      fruitBasketsPagination.page * fruitBasketsPagination.limit,
                      fruitBasketsPagination.total
                    )}{" "}
                    of {fruitBasketsPagination.total} baskets
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    {[...Array(fruitBasketsPagination.totalPages)].map((_, index) => (
                      <button
                        key={index + 1}
                        onClick={() => setCurrentPage(index + 1)}
                        className={`px-3 py-1 border rounded-lg ${
                          currentPage === index + 1
                            ? "bg-green-600 text-white border-green-600"
                            : "border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}
                    <button
                      onClick={() =>
                        setCurrentPage((prev) =>
                          Math.min(fruitBasketsPagination.totalPages, prev + 1)
                        )
                      }
                      disabled={currentPage === fruitBasketsPagination.totalPages}
                      className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <FruitBasketDetailModal
        isOpen={showReadModal}
        onClose={() => {
          setShowReadModal(false);
          setSelectedBasketId(null);
        }}
        basket={selectedBasketId ? fruitBasketDetail : null}
        loading={fruitBasketDetailLoading}
      />

      <CreateFruitBasket
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      <UpdateFruitBasket
        isOpen={showUpdateModal}
        onClose={() => {
          setShowUpdateModal(false);
          setSelectedBasket(null);
        }}
        basket={selectedBasket}
      />
    </div>
  );
};

export default FruitBasketPage;
