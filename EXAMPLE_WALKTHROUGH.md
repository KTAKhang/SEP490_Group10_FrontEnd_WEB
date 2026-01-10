# 🎯 VÍ DỤ THỰC TẾ: LUỒNG SHOW ORDER LIST

> File này sẽ đi qua **TỪNG DÒNG CODE** của tính năng hiển thị danh sách đơn hàng, giải thích chi tiết luồng hoạt động.

---

## 📍 BƯỚC 1: USER MỞ TRANG ORDER MANAGEMENT

### User thao tác:

```
User nhập URL: http://localhost:3000/admin/order-management
hoặc click vào menu "Quản lý đơn hàng"
```

### React Router render component:

```javascript
// src/routes/index.jsx (giả sử)
<Route path="/admin/order-management" element={<OrderManagement />} />
```

---

## 📍 BƯỚC 2: COMPONENT MOUNT VÀ KHỞI TẠO

### File: `OrderManagement.jsx`

#### Dòng 48-50: Component lấy data từ Redux Store

```javascript
const {
  items: orderItems, // Lấy state.order.items
  stats, // Lấy state.order.stats
  statuses, // Lấy state.order.statuses
  pagination: apiPagination, // Lấy state.order.pagination
  currentOrder,
  loadingList, // Lấy state.order.loadingList
  loadingStats,
  loadingDetail,
  updating,
  error, // Lấy state.order.error
  success, // Lấy state.order.success
} = useSelector((state) => state.order);
```

**💡 Giải thích:**

- `useSelector`: React Hook của react-redux
- `(state) => state.order`: Selector function
  - `state`: Toàn bộ Redux state tree
  - `state.order`: Chỉ lấy phần order state (được định nghĩa trong store.js)
- Component sẽ **tự động re-render** khi `state.order` thay đổi

**📊 State tree structure:**

```javascript
{
  order: {              // ← state.order
    items: [],          // ← orderItems
    stats: {},          // ← stats
    loadingList: false, // ← loadingList
    error: null,        // ← error
    // ...
  },
  product: { ... },
  cart: { ... },
  // ...
}
```

---

#### Dòng 117-121: useEffect chạy khi component mount

```javascript
useEffect(() => {
  fetchOrders({ page: 1 }); // ← Gọi hàm fetchOrders
  dispatch(orderStatsRequest()); // ← Dispatch action lấy thống kê
  dispatch(orderStatusesRequest()); // ← Dispatch action lấy danh sách status
}, [dispatch, fetchOrders]); // ← Dependency array
```

**💡 Giải thích:**

- `useEffect`: React Hook chạy side effects
- Chạy **1 lần** khi component mount (vì `dispatch` và `fetchOrders` không đổi)
- `fetchOrders({ page: 1 })`: Gọi hàm để load danh sách đơn hàng trang 1
- `dispatch(...)`: Gửi actions vào Redux

**🔍 Tại sao cần dependency array `[dispatch, fetchOrders]`?**

- React yêu cầu khai báo tất cả dependencies
- `dispatch` và `fetchOrders` là stable (không đổi), nên useEffect chỉ chạy 1 lần

---

#### Dòng 80-109: Hàm fetchOrders - Chuẩn bị và dispatch action

```javascript
const fetchOrders = useCallback(
  (params = {}) => {
    // 1. Lấy giá trị hiện tại từ refs
    const currentFilters = filtersRef.current; // { searchText: "", status: "all" }
    const currentPagination = paginationRef.current; // { current: 1, pageSize: 5 }
    const currentSort = sortRef.current; // { sortBy: "default", sortOrder: "" }

    // 2. Tạo query object
    const query = {
      page: currentPagination.current, // 1
      limit: currentPagination.pageSize, // 5
      sortBy: currentSort.sortBy, // "default"
      sortOrder: currentSort.sortOrder, // ""
      includeDetails: true, // true (để lấy orderDetails)
      ...params, // Merge với params truyền vào
    };

    // 3. Thêm filter status (nếu không phải "all")
    if (currentFilters.status !== "all") {
      query.status = currentFilters.status;
    }

    // 4. Thêm search text (nếu có)
    if (currentFilters.searchText.trim()) {
      const searchTerm = currentFilters.searchText.trim();
      query.keyword = searchTerm;
      query.search = searchTerm;
      query.q = searchTerm;
      query.customerName = searchTerm;
      query.orderNumber = searchTerm;
    }

    // 5. 🎯 DISPATCH ACTION VÀO REDUX
    dispatch(orderListRequest(query));
  },
  [dispatch]
);
```

**💡 Giải thích:**

- `useCallback`: Memoize function để tránh re-create
- `filtersRef.current`: Lấy giá trị hiện tại của filters (dùng ref để tránh dependency loop)
- `query`: Object chứa tất cả params cần gửi lên API
  ```javascript
  {
    page: 1,
    limit: 5,
    sortBy: "default",
    sortOrder: "",
    includeDetails: true
  }
  ```
- `dispatch(orderListRequest(query))`: Gửi action vào Redux

**🔍 Tại sao dùng ref thay vì state trực tiếp?**

- Tránh infinite loop trong useEffect
- useCallback sẽ không bị re-create khi filters/pagination thay đổi
- Vẫn lấy được giá trị mới nhất qua `ref.current`

---

## 📍 BƯỚC 3: ACTION ĐƯỢC TẠO VÀ DISPATCH

### File: `orderActions.js`

#### Dòng 6-9: Action Creator được gọi

```javascript
export const orderListRequest = (query = {}) => ({
  type: ORDER_LIST_REQUEST, // "ORDER_LIST_REQUEST"
  payload: query, // { page: 1, limit: 5, ... }
});
```

**💡 Action object được tạo ra:**

```javascript
{
  type: "ORDER_LIST_REQUEST",
  payload: {
    page: 1,
    limit: 5,
    sortBy: "default",
    sortOrder: "",
    includeDetails: true
  }
}
```

**🎯 Action này được dispatch vào Redux Store:**

```javascript
dispatch({
  type: "ORDER_LIST_REQUEST",
  payload: { page: 1, limit: 5, ... }
});
```

---

## 📍 BƯỚC 4A: REDUCER NHẬN ACTION VÀ CẬP NHẬT STATE

### File: `orderReducer.js`

#### Dòng 75-80: Reducer xử lý ORDER_LIST_REQUEST

```javascript
case ORDER_LIST_REQUEST:
  return {
    ...state,              // Copy toàn bộ state cũ
    loadingList: true,     // Bật loading indicator
    error: null,           // Xóa error cũ (nếu có)
  };
```

**💡 State TRƯỚC khi dispatch:**

```javascript
{
  items: [],
  pagination: { page: 1, limit: 5, total: 0 },
  loadingList: false,  // ← false
  error: null,
  // ...
}
```

**💡 State SAU khi dispatch ORDER_LIST_REQUEST:**

```javascript
{
  items: [],
  pagination: { page: 1, limit: 5, total: 0 },
  loadingList: true,   // ← true (bật loading)
  error: null,
  // ...
}
```

**🔄 Redux Store tự động:**

1. Lưu state mới vào Store
2. Thông báo cho tất cả subscribers (components đang dùng useSelector)
3. Component nhận thông báo → re-render

---

## 📍 COMPONENT RE-RENDER LẦN 1: HIỂN THỊ LOADING

### File: `OrderManagement.jsx`

#### Dòng 50: useSelector nhận state mới

```javascript
const { loadingList } = useSelector((state) => state.order);
// loadingList = true ← State đã thay đổi!
```

#### Dòng 702-716: Component render với loading = true

```javascript
<Spin spinning={loading || loadingList || updating} tip="Đang tải đơn hàng...">
  {/* loadingList = true → Hiển thị Spinner */}
  <Table
    dataSource={dataForPage} // dataForPage = [] (rỗng)
    // ...
  />
</Spin>
```

**👀 User thấy:**

```
┌─────────────────────────────────────┐
│  Quản lý Đơn hàng                   │
├─────────────────────────────────────┤
│                                     │
│         🔄 Đang tải đơn hàng...    │ ← Loading spinner
│                                     │
└─────────────────────────────────────┘
```

---

## 📍 BƯỚC 4B: SAGA BẮT ACTION VÀ GỌI API

### File: `orderSaga.js`

#### Dòng 229-238: Root Saga đang lắng nghe

```javascript
export default function* orderSaga() {
  console.log("🚀 orderSaga root saga initialized");

  // Lắng nghe action ORDER_LIST_REQUEST
  yield takeEvery(ORDER_LIST_REQUEST, fetchOrdersSaga);

  // Lắng nghe các actions khác...
  yield takeEvery(ORDER_DETAIL_REQUEST, fetchOrderDetailSaga);
  // ...
}
```

**💡 Giải thích:**

- `yield takeEvery(pattern, saga)`:
  - Mỗi khi có action khớp với `pattern` (ORDER_LIST_REQUEST)
  - Sẽ chạy saga function (`fetchOrdersSaga`)
- Saga này **đã chạy sẵn** từ khi app khởi động (trong store.js: `sagaMiddleware.run(rootSaga)`)

---

#### Dòng 50-70: fetchOrdersSaga được chạy

```javascript
function* fetchOrdersSaga(action) {
  try {
    // 📝 Log để debug
    console.log("🚀 fetchOrdersSaga called with action:", action);
    console.log("🔄 Calling real API...");

    // 🌐 Bước 1: GỌI API
    const response = yield call(fetchOrdersApi, action.payload);
    //    ^^^^^        ^^^^^      ^^^^^^^^^^^^^^^  ^^^^^^^^^^^^^^^
    //    keyword    effect     API function      params từ action

    console.log("✅ API response:", response);

    // 📊 Bước 2: KIỂM TRA RESPONSE
    if (response.status === "OK") {
      // ✅ Thành công → Dispatch SUCCESS action
      yield put(orderListSuccess(response.data, response.pagination));
      //    ^^^     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
      //  effect    action creator
    } else {
      // ❌ Response có status khác OK → Dispatch FAILED action
      yield put(
        orderListFailed(response.message || "Lỗi khi tải danh sách đơn hàng")
      );
    }
  } catch (error) {
    // ❌ Có exception (network error, timeout, ...) → Dispatch FAILED action
    console.log("❌ API Error:", error);
    const errorMessage =
      error.response?.data?.message || error.message || "Lỗi kết nối server";
    yield put(orderListFailed(errorMessage));
  }
}
```

**💡 Giải thích từng keyword:**

**`yield`:**

- Tạm dừng function cho đến khi có kết quả
- Giống như `await` trong async/await

**`call(fn, ...args)`:**

- Effect của Saga để gọi function
- `yield call(fetchOrdersApi, action.payload)` = Gọi `fetchOrdersApi(action.payload)` và chờ kết quả
- **Blocking**: Code phía dưới chỉ chạy khi có kết quả

**`put(action)`:**

- Effect của Saga để dispatch action
- `yield put(orderListSuccess(...))` = Dispatch action vào Redux Store
- Giống như `dispatch(...)` trong component

---

#### Dòng 28-33: fetchOrdersApi - Gọi API thực tế

```javascript
function* fetchOrdersApi(params) {
  // Gọi axios GET request
  const response = yield call(apiClient.get, "/order/orders", {
    params, // Query params: { page: 1, limit: 5, ... }
  });
  return response.data; // Return data từ response
}
```

**💡 Giải thích:**

- `apiClient.get`: Axios instance (đã config sẵn base URL, credentials, ...)
- `"/order/orders"`: Endpoint API
- `{ params }`: Query parameters

**🌐 HTTP Request được gửi đi:**

```
GET http://localhost:8080/api/order/orders?page=1&limit=5&sortBy=default&includeDetails=true
Headers:
  Cookie: session_token=...
  Content-Type: application/json
```

---

## 📍 BƯỚC 5: CHỜ RESPONSE TỪ BACKEND

### Backend xử lý:

```
1. Nhận request GET /order/orders?page=1&limit=5
2. Authenticate user (kiểm tra cookie session)
3. Query database: SELECT * FROM orders ... LIMIT 5 OFFSET 0
4. Populate orderDetails, userId, orderStatusId
5. Tính pagination: total, totalPages, hasNextPage, ...
6. Format response
7. Gửi response về frontend
```

**⏱️ Thời gian: ~200-300ms (tùy server và network)**

---

### Response từ Backend:

```javascript
{
  "status": "OK",
  "message": "Lấy danh sách đơn hàng thành công",
  "data": [
    {
      "_id": "674abc123...",
      "orderNumber": "ORD-2024-001",
      "userId": {
        "_id": "673xyz...",
        "user_name": "Nguyễn Văn A",
        "email": "nguyenvana@gmail.com",
        "phone": "0901234567"
      },
      "orderStatusId": {
        "_id": "672status...",
        "name": "pending",
        "description": "Chờ xác nhận",
        "color": "#faad14"
      },
      "receiverName": "Nguyễn Văn A",
      "receiverPhone": "0901234567",
      "receiverAddress": "123 Đường ABC, Q1, TP.HCM",
      "totalPrice": 1500000,
      "subtotal": 1400000,
      "shippingFee": 30000,
      "discount": 0,
      "paymentStatus": "pending",
      "orderDetails": [
        {
          "productId": { ... },
          "quantity": 2,
          "price": 700000
        }
      ],
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    },
    // ... 4 orders nữa (tổng 5 orders)
  ],
  "pagination": {
    "page": 1,
    "limit": 5,
    "total": 50,
    "totalPages": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

## 📍 BƯỚC 6: SAGA XỬ LÝ RESPONSE VÀ DISPATCH SUCCESS

### File: `orderSaga.js` (tiếp)

#### Dòng 58-59: Response thành công

```javascript
if (response.status === "OK") {
  // Dispatch SUCCESS action với data và pagination
  yield put(orderListSuccess(response.data, response.pagination));
}
```

**💡 Action được dispatch:**

```javascript
{
  type: "ORDER_LIST_SUCCESS",
  payload: {
    data: [ { _id: "674abc...", orderNumber: "ORD-2024-001", ... }, ... ],
    pagination: {
      page: 1,
      limit: 5,
      total: 50,
      totalPages: 10,
      hasNextPage: true,
      hasPrevPage: false
    }
  }
}
```

---

## 📍 BƯỚC 7: REDUCER NHẬN SUCCESS VÀ CẬP NHẬT STATE

### File: `orderReducer.js`

#### Dòng 82-89: Reducer xử lý ORDER_LIST_SUCCESS

```javascript
case ORDER_LIST_SUCCESS:
  return {
    ...state,                                    // Copy state cũ
    loadingList: false,                          // Tắt loading
    items: action.payload.data || [],            // Lưu danh sách orders
    pagination: action.payload.pagination || state.pagination,  // Lưu pagination
    error: null,                                 // Xóa error (nếu có)
  };
```

**💡 State SAU khi dispatch ORDER_LIST_SUCCESS:**

```javascript
{
  items: [
    { _id: "674abc...", orderNumber: "ORD-2024-001", ... },
    { _id: "674def...", orderNumber: "ORD-2024-002", ... },
    { _id: "674ghi...", orderNumber: "ORD-2024-003", ... },
    { _id: "674jkl...", orderNumber: "ORD-2024-004", ... },
    { _id: "674mno...", orderNumber: "ORD-2024-005", ... },
  ],                       // ← 5 orders từ API
  pagination: {
    page: 1,
    limit: 5,
    total: 50,
    totalPages: 10,
    hasNextPage: true,
    hasPrevPage: false
  },                       // ← Pagination info
  loadingList: false,      // ← Tắt loading
  error: null,
  // ...
}
```

**🔄 Redux Store:**

1. Lưu state mới
2. Thông báo cho subscribers
3. Component sẽ re-render

---

## 📍 BƯỚC 8: COMPONENT RE-RENDER LẦN 2 - HIỂN THỊ DATA

### File: `OrderManagement.jsx`

#### Dòng 50: useSelector nhận state mới

```javascript
const {
  items: orderItems, // ← [5 orders]
  loadingList, // ← false
  pagination: apiPagination, // ← { page: 1, total: 50, ... }
} = useSelector((state) => state.order);
```

**🔄 State thay đổi → useSelector trigger re-render**

---

#### Dòng 206-248: Map data để hiển thị

```javascript
const orders = (orderItems || []).map((order) => {
  // Lấy thông tin status
  const statusInfo = getStatusInfo(order.orderStatusId);

  return {
    ...order,
    // Map lại các field để dễ hiển thị
    customerName: order.receiverName || order.userId?.user_name || "N/A",
    customerEmail: order.userId?.email || "N/A",
    customerPhone: order.receiverPhone || order.userId?.phone || "N/A",
    status: statusInfo.name, // "pending"
    statusColor: statusInfo.color, // "#faad14"
    totalAmount: order.totalPrice, // 1500000
    itemsCount: order.orderDetails?.length || 0, // 1
    // ...
  };
});
```

**💡 Mục đích:**

- Chuẩn hóa data từ backend
- Thêm các field computed (customerName, status, ...)
- Dễ dàng hiển thị trong Table

**📊 Kết quả `orders`:**

```javascript
[
  {
    _id: "674abc...",
    orderNumber: "ORD-2024-001",
    customerName: "Nguyễn Văn A",
    customerEmail: "nguyenvana@gmail.com",
    customerPhone: "0901234567",
    status: "pending",
    statusColor: "#faad14",
    totalAmount: 1500000,
    itemsCount: 1,
    createdAt: "2024-01-15T10:30:00.000Z",
    // ... tất cả fields khác
  },
  // ... 4 orders nữa
];
```

---

#### Dòng 702-716: Render Table với data

```javascript
<Spin spinning={loading || loadingList || updating}>
  {/* loadingList = false → Không hiển thị spinner */}
  <Table
    rowKey={(record) => record._id} // Key cho mỗi row
    columns={columns} // Định nghĩa các cột
    dataSource={dataForPage} // Data = orders (5 items)
    pagination={tablePagination} // Pagination config
    onChange={handleTableChange} // Handler cho sort/filter
  />
</Spin>
```

**💡 Table component sẽ render:**

- 5 rows (từ `orders` array)
- Mỗi row hiển thị: Đơn hàng, Khách hàng, Tổng tiền, Ngày tạo, Trạng thái, Hành động
- Pagination: "Hiển thị 1-5 trong tổng số 50 đơn hàng"

---

#### Dòng 394-484: Định nghĩa columns cho Table

```javascript
const columns = [
  {
    title: "Đơn hàng",
    key: "order",
    render: (_, record) => (
      <Space>
        <Avatar icon={<FileTextOutlined />} />
        <div>
          <Text strong>{record.orderNumber}</Text>
          {/* ORD-2024-001 */}
          <Text
            type="secondary"
            onClick={() => {
              navigator.clipboard.writeText(record._id);
              message.success("Đã copy ID");
            }}
          >
            ID: {record._id}
          </Text>
        </div>
      </Space>
    ),
  },
  {
    title: "Khách hàng",
    key: "customer",
    render: (_, record) => (
      <div>
        <Text strong>{record.customerName}</Text>
        {/* Nguyễn Văn A */}
        <Text type="secondary">{record.customerEmail}</Text>
        {/* nguyenvana@gmail.com */}
        <Text type="secondary">{record.customerPhone}</Text>
        {/* 0901234567 */}
      </div>
    ),
  },
  {
    title: "Tổng tiền",
    dataIndex: "totalAmount",
    key: "totalAmount",
    render: (amount) => (
      <Tag color="#13C2C2">
        {(amount || 0).toLocaleString("vi-VN")}đ{/* 1.500.000đ */}
      </Tag>
    ),
  },
  // ... các cột khác
];
```

---

## 📍 BƯỚC 9: USER THẤY KỐT QUẢ CUỐI CÙNG

### 👀 UI hiển thị:

```
┌────────────────────────────────────────────────────────────────────────┐
│  📊 Quản lý Đơn hàng                                                   │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  🔍 [Tìm kiếm...]  [Trạng thái: Tất cả ▼]  [Sắp xếp: Mặc định ▼] 🔄   │
│                                                                        │
├────────────┬──────────────┬──────────┬────────────┬──────────┬────────┤
│ Đơn hàng   │ Khách hàng   │ Tổng tiền│ Ngày tạo   │ Trạng thái│ Action │
├────────────┼──────────────┼──────────┼────────────┼──────────┼────────┤
│ 📄 ORD-001 │ Nguyễn Văn A │ 1.500Kđ │ 15/01/2024 │ 🕐 Chờ   │ 👁️ ✏️  │
│            │ nguyenvana@  │          │ 10:30      │          │        │
│            │ 0901234567   │          │            │          │        │
├────────────┼──────────────┼──────────┼────────────┼──────────┼────────┤
│ 📄 ORD-002 │ Trần Thị B   │ 2.300Kđ │ 15/01/2024 │ ✅ Xác   │ 👁️ ✏️  │
├────────────┼──────────────┼──────────┼────────────┼──────────┼────────┤
│ 📄 ORD-003 │ Lê Văn C     │ 890Kđ   │ 14/01/2024 │ 🚚 Giao  │ 👁️ ✏️  │
├────────────┼──────────────┼──────────┼────────────┼──────────┼────────┤
│ 📄 ORD-004 │ Phạm Thị D   │ 3.200Kđ │ 14/01/2024 │ ✅ Hoàn  │ 👁️ ✏️  │
├────────────┼──────────────┼──────────┼────────────┼──────────┼────────┤
│ 📄 ORD-005 │ Hoàng Văn E  │ 1.750Kđ │ 13/01/2024 │ ❌ Hủy   │ 👁️ ✏️  │
└────────────┴──────────────┴──────────┴────────────┴──────────┴────────┘
│  Hiển thị 1-5 trong tổng số 50 đơn hàng                    [1] 2 3... │
└────────────────────────────────────────────────────────────────────────┘
```

**✅ User đã thấy danh sách đơn hàng thành công!**

---

## 📍 BƯỚC 10: USER TƯƠNG TÁC - SEARCH

### User action:

```
User gõ vào ô search: "Nguyễn"
```

### File: `OrderManagement.jsx`

#### Dòng 587-601: Input Search onChange

```javascript
<Input.Search
  placeholder="Tìm kiếm theo mã đơn hàng, tên khách hàng..."
  value={filters.searchText} // "Nguyễn"
  onChange={(e) =>
    setFilters((prev) => ({
      ...prev,
      searchText: e.target.value, // Update local state
    }))
  }
  onSearch={(value) => {
    // Khi user nhấn Enter hoặc nút Search
    setFilters((prev) => ({ ...prev, searchText: value }));
    setTimeout(() => {
      setPagination((prev) => ({ ...prev, current: 1 }));
      fetchOrders({ page: 1 }); // ← Gọi lại API với keyword
    }, 100);
  }}
/>
```

---

#### Dòng 143-156: useEffect debounce search

```javascript
useEffect(() => {
  if (isInitialLoad) return;

  // Debounce: chờ 800ms sau khi user ngừng gõ
  const timeoutId = setTimeout(
    () => {
      setPagination((prev) => ({ ...prev, current: 1 })); // Reset về trang 1
      fetchOrders({ page: 1 }); // Gọi API với keyword
    },
    filters.searchText.trim() ? 800 : 0
  ); // 800ms nếu có search text

  return () => clearTimeout(timeoutId); // Cleanup timeout khi filters thay đổi
}, [filters, fetchOrders, isInitialLoad]);
```

**💡 Giải thích Debounce:**

```
User gõ: "N" → timeout 800ms bắt đầu
         ↓
User gõ: "Ng" → Clear timeout cũ, timeout mới 800ms
         ↓
User gõ: "Ngu" → Clear timeout cũ, timeout mới 800ms
         ↓
User gõ: "Nguy" → Clear timeout cũ, timeout mới 800ms
         ↓
User dừng gõ
         ↓
800ms trôi qua → fetchOrders({ page: 1 }) được gọi
```

**🎯 Lợi ích:**

- Giảm số lần gọi API (không gọi mỗi lần user gõ 1 ký tự)
- Tốt cho performance và server

---

### Sau 800ms:

#### fetchOrders được gọi với keyword

```javascript
const query = {
  page: 1,
  limit: 5,
  sortBy: "default",
  sortOrder: "",
  includeDetails: true,
  keyword: "Nguyễn", // ← Keyword search
  search: "Nguyễn",
  q: "Nguyễn",
  customerName: "Nguyễn",
  orderNumber: "Nguyễn",
};

dispatch(orderListRequest(query));
```

**🔄 Vòng lặp lại:**

1. dispatch ORDER_LIST_REQUEST
2. Reducer: loadingList = true
3. Component re-render (hiển thị loading)
4. Saga gọi API: `GET /order/orders?page=1&keyword=Nguyễn`
5. Backend search orders có customer name chứa "Nguyễn"
6. Response: 3 orders khớp
7. Saga dispatch ORDER_LIST_SUCCESS
8. Reducer: items = [3 orders], loadingList = false
9. Component re-render (hiển thị 3 orders)

**👀 User thấy:**

```
┌────────────────────────────────────────────────────────────────┐
│  🔍 [Nguyễn                    ]  ❌                           │
├────────────────────────────────────────────────────────────────┤
│  ℹ️ Đang hiển thị kết quả đã lọc: Tìm kiếm: "Nguyễn"          │
│                                                    [Xóa bộ lọc] │
├────────────┬──────────────┬──────────┬────────────┬───────────┤
│ Đơn hàng   │ Khách hàng   │ Tổng tiền│ Ngày tạo   │ Trạng thái│
├────────────┼──────────────┼──────────┼────────────┼───────────┤
│ 📄 ORD-001 │ Nguyễn Văn A │ 1.500Kđ │ 15/01/2024 │ 🕐 Chờ    │
├────────────┼──────────────┼──────────┼────────────┼───────────┤
│ 📄 ORD-007 │ Nguyễn Thị F │ 2.100Kđ │ 12/01/2024 │ ✅ Xác    │
├────────────┼──────────────┼──────────┼────────────┼───────────┤
│ 📄 ORD-012 │ Nguyễn Văn G │ 890Kđ   │ 10/01/2024 │ ✅ Hoàn   │
└────────────┴──────────────┴──────────┴────────────┴───────────┘
│  Hiển thị 1-3 trong tổng số 3 đơn hàng (đã lọc)       [1]     │
└────────────────────────────────────────────────────────────────┘
```

---

## 🎓 TỔNG KẾT LUỒNG HOÀN CHỈNH

```
┌─────────────────────────────────────────────────────────────────────┐
│  1. USER MỞ TRANG                                                   │
│     → Browser: http://localhost:3000/admin/order-management         │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│  2. REACT ROUTER RENDER COMPONENT                                   │
│     → OrderManagement.jsx được mount                                │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│  3. COMPONENT MOUNT                                                 │
│     → useSelector subscribe vào state.order                         │
│     → useEffect chạy: fetchOrders({ page: 1 })                      │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│  4. DISPATCH ACTION                                                 │
│     → dispatch(orderListRequest({ page: 1, limit: 5 }))            │
│     → Action: { type: "ORDER_LIST_REQUEST", payload: {...} }       │
└─────────────────────────────────────────────────────────────────────┘
                    ↓                           ↓
     ┌──────────────────────────┐   ┌──────────────────────────┐
     │  5A. REDUCER             │   │  5B. SAGA                │
     │  → loadingList = true    │   │  → Bắt action REQUEST    │
     └──────────────────────────┘   └──────────────────────────┘
                    ↓                           ↓
     ┌──────────────────────────┐   ┌──────────────────────────┐
     │  6. STATE UPDATE         │   │  6. CALL API             │
     │  → Store lưu state mới   │   │  → GET /order/orders     │
     └──────────────────────────┘   └──────────────────────────┘
                    ↓                           ↓
     ┌──────────────────────────┐   ┌──────────────────────────┐
     │  7. COMPONENT RE-RENDER  │   │  7. CHỜ RESPONSE         │
     │  → Hiển thị Loading...   │   │  → ~200-300ms            │
     └──────────────────────────┘   └──────────────────────────┘
                                                ↓
                              ┌──────────────────────────┐
                              │  8. NHẬN RESPONSE        │
                              │  → data: [5 orders]      │
                              └──────────────────────────┘
                                                ↓
                              ┌──────────────────────────┐
                              │  9. DISPATCH SUCCESS     │
                              │  → orderListSuccess(...) │
                              └──────────────────────────┘
                                                ↓
                              ┌──────────────────────────┐
                              │  10. REDUCER UPDATE      │
                              │  → items = data          │
                              │  → loadingList = false   │
                              └──────────────────────────┘
                                                ↓
                              ┌──────────────────────────┐
                              │  11. COMPONENT RE-RENDER │
                              │  → Hiển thị Table + Data │
                              └──────────────────────────┘
                                                ↓
                              ┌──────────────────────────┐
                              │  12. USER THẤY KẾT QUẢ  │
                              │  → ✅ Danh sách 5 orders │
                              └──────────────────────────┘
```

---

## 🎯 ĐIỀU GÌ XẢY RA KHI...

### ❌ API LỖI (Network error, 500, timeout)?

```javascript
// orderSaga.js - catch block
catch (error) {
  console.log("❌ API Error:", error);
  const errorMessage = error.response?.data?.message || error.message || "Lỗi kết nối server";
  yield put(orderListFailed(errorMessage));
  //        ^^^^^^^^^^^^^^^^^^^^ Dispatch FAILED action
}
```

```javascript
// orderReducer.js
case ORDER_LIST_FAILED:
  return {
    ...state,
    loadingList: false,      // Tắt loading
    error: action.payload,   // Lưu error message
  };
```

```javascript
// OrderManagement.jsx
{
  error && (
    <Alert
      message={error} // "Lỗi kết nối server"
      type="error"
      showIcon
      closable
    />
  );
}
```

**👀 User thấy:**

```
┌────────────────────────────────────────────┐
│  ⚠️ Lỗi kết nối server                 ❌  │
└────────────────────────────────────────────┘
```

---

### 🔄 USER CLICK REFRESH?

```javascript
// OrderManagement.jsx - dòng 295-300
const handleRefresh = useCallback(() => {
  setLoading(true); // Bật loading local
  fetchOrders(); // Gọi lại API
  dispatch(orderStatsRequest()); // Refresh stats
  setTimeout(() => setLoading(false), 450);
}, [dispatch, fetchOrders]);
```

**→ Vòng lặp lại từ đầu (Bước 4)**

---

### 📄 USER CHUYỂN TRANG (page 2)?

```javascript
// OrderManagement.jsx - dòng 506-509
onChange: (page, pageSize) => {
  setPagination({ current: page, pageSize });
  fetchOrders({ page, limit: pageSize });
  //            ^^^^^^^^^^^^^^^^^^^^^ page: 2, limit: 5
},
```

**→ API được gọi với params mới:**

```
GET /order/orders?page=2&limit=5
```

**→ Response: items [6-10]**

---

## 🎉 KẾT LUẬN

### Bạn đã học được:

✅ **Luồng Redux Saga hoàn chỉnh:**

- Component → Actions → Saga → API → Reducer → Component

✅ **Vai trò từng file:**

- `orderActions.js`: Định nghĩa action types & creators
- `orderSaga.js`: Xử lý API calls
- `orderReducer.js`: Quản lý state
- `OrderManagement.jsx`: UI component

✅ **Các khái niệm quan trọng:**

- Action, Reducer, Store, Saga, Middleware
- `useSelector`, `useDispatch`, `useEffect`, `useCallback`
- `yield`, `call`, `put`, `takeEvery`

✅ **Luồng 2 chiều:**

- Component dispatch action → Redux
- Redux state thay đổi → Component re-render

✅ **Pattern 3 actions:**

- REQUEST (Component dispatch)
- SUCCESS (Saga dispatch khi thành công)
- FAILED (Saga dispatch khi lỗi)

---

**🎓 Bước tiếp theo:**

1. Thử thêm console.log vào từng file để xem luồng
2. Mở Redux DevTools để xem actions timeline
3. Thử tạo một tính năng mới (ví dụ: Delete Order)
4. Đọc docs: Redux, Redux Saga, React Hooks

**💪 Chúc bạn thành công!**
