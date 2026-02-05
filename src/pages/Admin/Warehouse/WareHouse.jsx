import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  Package,
  Store,
  Search,
  Plus,
  Edit,
  AlertCircle,
  CheckCircle,
  TrendingDown,
  Filter,
  Download,
  Upload,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  getProductsRequest,
  getProductStatsRequest,
} from "../../../redux/actions/productActions";
import { getCategoriesRequest } from "../../../redux/actions/categoryActions";
import CreateProduct from "./CreateProduct";
import UpdateProduct from "./UpdateProduct";
import DetailProduct from "./DetailProduct";
import VisibilityToggle from "./VisibilityToggle";
import Loading from "../../../components/Loading/Loading";


const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden ${className}`}>{children}</div>
);


const CardHeader = ({ children, className = "" }) => (
  <div className={`border-b border-gray-100 px-5 py-4 ${className}`}>{children}</div>
);


const CardTitle = ({ children, className = "" }) => (
  <h3 className={`text-base font-semibold text-gray-800 ${className}`}>{children}</h3>
);


const CardContent = ({ children, className = "" }) => (
  <div className={`p-5 ${className}`}>{children}</div>
);


const WareHouse = () => {
  const dispatch = useDispatch();
  const {
    products,
    productsLoading,
    productsPagination,
    productStats,
    createProductLoading,
    updateProductLoading,
    createProductError,
    updateProductError,
  } = useSelector((state) => state.product);
 
  const { categories } = useSelector((state) => state.category);


  const [searchTerm, setSearchTerm] = useState("");
  const [filterStockStatus, setFilterStockStatus] = useState("all"); // all, IN_STOCK, OUT_OF_STOCK
  const [filterReceivingStatus, setFilterReceivingStatus] = useState("all"); // all, NOT_RECEIVED, PARTIAL, RECEIVED
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showReadModal, setShowReadModal] = useState(false);
  const [showVisibilityModal, setShowVisibilityModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [prevCreateLoading, setPrevCreateLoading] = useState(false);
  const [prevUpdateLoading, setPrevUpdateLoading] = useState(false);


  // Fetch products, categories and stats on mount
  useEffect(() => {
    dispatch(getProductsRequest({ page: currentPage, limit: 10, sortBy, sortOrder }));
dispatch(getCategoriesRequest({ page: 1, limit: 100 }));
    dispatch(getProductStatsRequest());
  }, [dispatch]);


  // Fetch products when filters change
  useEffect(() => {
    const params = {
      page: currentPage,
      limit: 10,
      search: searchTerm || undefined,
      stockStatus: filterStockStatus !== "all" ? filterStockStatus : undefined,
      receivingStatus: filterReceivingStatus !== "all" ? filterReceivingStatus : undefined,
      category: selectedCategory !== "all" ? selectedCategory : undefined,
      sortBy,
      sortOrder,
    };
    dispatch(getProductsRequest(params));
  }, [dispatch, currentPage, searchTerm, filterStockStatus, filterReceivingStatus, selectedCategory, sortBy, sortOrder]);


  // Auto refresh after successful create
  useEffect(() => {
    if (prevCreateLoading && !createProductLoading && !createProductError) {
      // Create was just completed successfully
      const params = {
        page: currentPage,
        limit: 10,
        search: searchTerm || undefined,
        stockStatus: filterStockStatus !== "all" ? filterStockStatus : undefined,
        receivingStatus: filterReceivingStatus !== "all" ? filterReceivingStatus : undefined,
        category: selectedCategory !== "all" ? selectedCategory : undefined,
        sortBy,
        sortOrder,
      };
      dispatch(getProductsRequest(params));
      dispatch(getProductStatsRequest());
    }
    setPrevCreateLoading(createProductLoading);
  }, [dispatch, createProductLoading, createProductError, prevCreateLoading, currentPage, searchTerm, filterStockStatus, filterReceivingStatus, selectedCategory, sortBy, sortOrder]);


  // Auto refresh after successful update
  useEffect(() => {
    if (prevUpdateLoading && !updateProductLoading && !updateProductError) {
      // Update was just completed successfully
      const params = {
        page: currentPage,
        limit: 10,
        search: searchTerm || undefined,
        stockStatus: filterStockStatus !== "all" ? filterStockStatus : undefined,
        receivingStatus: filterReceivingStatus !== "all" ? filterReceivingStatus : undefined,
        category: selectedCategory !== "all" ? selectedCategory : undefined,
        sortBy,
        sortOrder,
      };
      dispatch(getProductsRequest(params));
      dispatch(getProductStatsRequest());
    }
    setPrevUpdateLoading(updateProductLoading);
  }, [dispatch, updateProductLoading, updateProductError, prevUpdateLoading, currentPage, searchTerm, filterStockStatus, filterReceivingStatus, selectedCategory, sortBy, sortOrder]);


  const getStockStatus = (product) => {
    if (product.stockStatus === "OUT_OF_STOCK" || product.onHandQuantity === 0) {
      return { label: "Out of stock", color: "bg-red-100 text-red-800", icon: AlertCircle };
    }
    if (product.onHandQuantity <= 10) {
      return { label: "Low stock", color: "bg-yellow-100 text-yellow-800", icon: TrendingDown };
    }
    return { label: "In stock", color: "bg-green-100 text-green-800", icon: CheckCircle };
  };


  const getReceivingStatus = (product) => {
    switch (product.receivingStatus) {
      case "NOT_RECEIVED":
        return { label: "Not received", color: "bg-gray-100 text-gray-800" };
      case "PARTIAL":
        return { label: "Partial", color: "bg-yellow-100 text-yellow-800" };
      case "RECEIVED":
        return { label: "Fully received", color: "bg-green-100 text-green-800" };
      default:
        return { label: "N/A", color: "bg-gray-100 text-gray-800" };
    }
  };


  const handleAddProduct = () => {
    setShowCreateModal(true);
  };


  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setShowUpdateModal(true);
  };


  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setShowReadModal(true);
  };


  const handleVisibilityProduct = (product) => {
    setSelectedProduct(product);
    setShowVisibilityModal(true);
  };


  // Use stats from API
  const stats = {
    total: productStats?.total || 0,
    inStock: productStats?.inStock || 0,
    outOfStock: productStats?.outOfStock || 0,
    lowStock: productStats?.lowStock || 0,
  };


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
            <Store size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Warehouse management</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage products and inventory</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50">
            <Upload size={18} />
            Import Excel
          </button>
          <button className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50">
            <Download size={18} />
            Export Excel
          </button>
          <button onClick={handleAddProduct} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-700 hover:shadow">
            <Plus size={18} />
            Add product
          </button>
        </div>
      </div>


      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Total</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-600"><Package size={22} /></div>
          </div>
        </div>
        <div className="rounded-2xl border border-emerald-200/60 bg-emerald-50/50 p-5 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-emerald-700/80">In stock</p>
              <p className="mt-1 text-2xl font-bold text-emerald-700">{stats.inStock}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600"><CheckCircle size={22} /></div>
          </div>
        </div>
        <div className="rounded-2xl border border-amber-200/60 bg-amber-50/50 p-5 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-amber-700/80">Low stock</p>
              <p className="mt-1 text-2xl font-bold text-amber-700">{stats.lowStock}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600"><TrendingDown size={22} /></div>
          </div>
        </div>
        <div className="rounded-2xl border border-red-200/60 bg-red-50/40 p-5 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-red-700/80">Out of stock</p>
              <p className="mt-1 text-2xl font-bold text-red-600">{stats.outOfStock}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-red-600"><AlertCircle size={22} /></div>
          </div>
        </div>
      </div>


      {/* Filters */}
      <Card>
        <CardContent className="p-5">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Search & filters</p>
          <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
            <div className="relative min-w-0 flex-1 lg:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="text" placeholder="Search by product name..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20" />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Filter size={16} className="text-gray-400" />
              <select value={filterStockStatus} onChange={(e) => { setFilterStockStatus(e.target.value); setCurrentPage(1); }} className="rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20">
                <option value="all">All statuses</option>
                <option value="IN_STOCK">In stock</option>
                <option value="OUT_OF_STOCK">Out of stock</option>
              </select>
              <select value={filterReceivingStatus} onChange={(e) => { setFilterReceivingStatus(e.target.value); setCurrentPage(1); }} className="rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20">
                <option value="all">All receipts</option>
                <option value="NOT_RECEIVED">Not received</option>
                <option value="PARTIAL">Partial</option>
                <option value="RECEIVED">Fully received</option>
              </select>
              <select value={selectedCategory} onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }} className="rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20">
                <option value="all">All categories</option>
                {categories?.map((cat) => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
              </select>
              <select value={sortBy} onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }} className="rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20">
                <option value="createdAt">Created date</option>
                <option value="name">Name</option>
                <option value="price">Price</option>
                <option value="onHandQuantity">Stock</option>
                <option value="receivedQuantity">Received</option>
                <option value="updatedAt">Updated date</option>
                <option value="status">Status</option>
              </select>
              <select value={sortOrder} onChange={(e) => { setSortOrder(e.target.value); setCurrentPage(1); }} className="rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20">
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>


      {/* Products Table */}
      <Card>
        <CardHeader className="py-4">
          <CardTitle>Product list ({productsPagination?.total || products.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {productsLoading || createProductLoading || updateProductLoading ? (
            <Loading message="Loading data..." />
          ) : products.length === 0 ? (
            <div className="p-8 text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">No products found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50/80">
                    <tr>
                      <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Product</th>
                      <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Category</th>
                      <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Quantity</th>
                      <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Price</th>
                      <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Status</th>
                      <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {products.map((product) => {
                      const stockStatus = getStockStatus(product);
                      const receivingStatus = getReceivingStatus(product);
                      const StatusIcon = stockStatus.icon;
                      return (
                        <tr key={product._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {product.images && product.images.length > 0 ? (
                                <img
                                  src={product.images[0]}
                                  alt={product.name}
                                  className="h-10 w-10 rounded-xl object-cover mr-3"
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center mr-3">
                                  <Package size={20} className="text-gray-400" />
                                </div>
                              )}
                              <div>
                                <p className="text-sm font-medium text-gray-900">{product.name}</p>
                                <p className="text-xs text-gray-500 truncate max-w-xs">
                                  {product.short_desc}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 whitespace-nowrap text-sm text-gray-900">{product.category?.name || "N/A"}</td>
                          <td className="px-5 py-3.5 whitespace-nowrap">
                            <div className="text-sm">
                              <p className="font-medium text-gray-900">
                                Stock: {product.onHandQuantity || 0}
                              </p>
                              <p className="text-xs text-gray-500">
                                Planned: {product.plannedQuantity || 0} | Received:{" "}
                                {product.receivedQuantity || 0}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-900">
                              {new Intl.NumberFormat("vi-VN", {
                                style: "currency",
                                currency: "VND",
                              }).format(product.price || 0)}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 whitespace-nowrap">
                            <div className="space-y-1">
                              <span
                                className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${stockStatus.color}`}
                              >
                                <StatusIcon size={14} />
                                <span>{stockStatus.label}</span>
                              </span>
                              <br />
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${receivingStatus.color}`}
                              >
                                {receivingStatus.label}
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleViewProduct(product)}
                                className="rounded-xl p-2 text-blue-600 transition hover:bg-blue-50 hover:text-blue-700"
                                title="View details"
                              >
                                <Eye size={18} />
                              </button>
                              <button
                                onClick={() => handleEditProduct(product)}
                                className="rounded-xl p-2 text-emerald-600 transition hover:bg-emerald-50 hover:text-emerald-700"
                                title="Edit product"
                              >
                                <Edit size={18} />
                              </button>
                              <button
                                onClick={() => handleVisibilityProduct(product)}
                                className="rounded-xl p-2 text-amber-600 transition hover:bg-amber-50 hover:text-amber-700"
                                title="Show / Hide product"
                              >
                                {product.status ? <EyeOff size={18} /> : <Eye size={18} />}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>


              {/* Pagination */}
              {productsPagination && productsPagination.totalPages > 1 && (
                <div className="flex flex-col gap-3 border-t border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-gray-500">
                    Showing {productsPagination.page * productsPagination.limit - productsPagination.limit + 1}–{Math.min(productsPagination.page * productsPagination.limit, productsPagination.total)} of {productsPagination.total}
                  </p>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition disabled:opacity-50 hover:bg-gray-50">Previous</button>
                    {[...Array(productsPagination.totalPages)].map((_, i) => (
                      <button key={i + 1} onClick={() => setCurrentPage(i + 1)} className={`min-w-[2.25rem] rounded-xl px-3 py-2 text-sm font-medium transition ${currentPage === i + 1 ? "bg-emerald-600 text-white shadow-sm" : "border border-gray-200 text-gray-700 hover:bg-gray-50"}`}>{i + 1}</button>
                    ))}
                    <button onClick={() => setCurrentPage((p) => Math.min(productsPagination.totalPages, p + 1))} disabled={currentPage === productsPagination.totalPages} className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition disabled:opacity-50 hover:bg-gray-50">Next</button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>


      {/* Create Product Modal */}
      <CreateProduct isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />


      {/* Update Product Modal */}
      <UpdateProduct
        isOpen={showUpdateModal}
        onClose={() => {
          setShowUpdateModal(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
      />


      {/* Detail Product Modal */}
      <DetailProduct
        isOpen={showReadModal}
        onClose={() => {
          setShowReadModal(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
      />


      {/* Visibility Toggle Modal */}
      <VisibilityToggle
        isOpen={showVisibilityModal}
        onClose={() => {
          setShowVisibilityModal(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
        onSuccess={() => {
          const params = {
            page: currentPage,
            limit: 10,
            search: searchTerm || undefined,
            stockStatus: filterStockStatus !== "all" ? filterStockStatus : undefined,
            receivingStatus: filterReceivingStatus !== "all" ? filterReceivingStatus : undefined,
            category: selectedCategory !== "all" ? selectedCategory : undefined,
            sortBy,
            sortOrder,
          };
          dispatch(getProductsRequest(params));
          dispatch(getProductStatsRequest());
        }}
      />
    </div>
  );
};


export default WareHouse;




