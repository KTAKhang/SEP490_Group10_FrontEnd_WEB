# Sửa backend: cho phép cập nhật visibleInReceipt

**Trạng thái:** Đã áp dụng (backend đã thêm `visibleInReceipt` vào whitelist và xử lý gán giá trị).

---

## Nguyên nhân (trước khi sửa)

Trong service **updateHarvestBatch** (HarvestBatchService), mảng `allowed` chỉ gồm:

```javascript
const allowed = ["batchNumber", "harvestDate", "location", "notes", "receiptEligible"];
```

**`visibleInReceipt` không nằm trong `allowed`**, nên mọi giá trị gửi từ frontend đều bị `delete payload[key]` và không được lưu vào DB. Do đó khi admin chọn "No" (visible = false) thì DB vẫn giữ `true`, và API `getHarvestBatches` với `visibleInReceipt: true` vẫn trả về batch đó → vẫn chọn được trong CreateReceipt.

## Cách sửa (backend)

Trong file chứa hàm **updateHarvestBatch** (ví dụ `HarvestBatchService.js`):

### 1. Thêm `"visibleInReceipt"` vào whitelist

Đổi:

```javascript
const allowed = ["batchNumber", "harvestDate", "location", "notes", "receiptEligible"];
```

thành:

```javascript
const allowed = ["batchNumber", "harvestDate", "location", "notes", "receiptEligible", "visibleInReceipt"];
```

### 2. Xử lý gán giá trị cho `visibleInReceipt`

Thêm block (đặt cùng chỗ với `receiptEligible`, ví dụ ngay sau):

```javascript
if (payload.receiptEligible !== undefined) {
  harvestBatch.receiptEligible = payload.receiptEligible === true || payload.receiptEligible === "true";
}

// Cho phép cập nhật ẩn/hiện trong dropdown nhập kho
if (payload.visibleInReceipt !== undefined) {
  harvestBatch.visibleInReceipt = payload.visibleInReceipt === true || payload.visibleInReceipt === "true";
}
```

Lưu ý: backend có thể nhận `visibleInReceipt` dạng boolean từ JSON hoặc string `"true"`/`"false"` từ query, nên so sánh cả hai.

Sau khi sửa, khi admin bấm "Update" với "No" (visible = false), DB sẽ lưu `visibleInReceipt: false`, và `getHarvestBatches` với `visibleInReceipt: true` sẽ không trả về batch đó → CreateReceipt sẽ không còn hiển thị batch đó trong dropdown.
