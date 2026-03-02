# YÊU CẦU BACKEND: Thêm Google Maps Embed URL cho Shop

## Mục đích
Frontend cần hiển thị Google Maps iframe trên trang About Us để khách hàng có thể xem vị trí shop.

## Yêu cầu Backend

### 1. Thêm field vào Shop Model/Schema

**Field mới cần thêm:**
- **Tên field:** `mapEmbedUrl` (hoặc `googleMapUrl`)
- **Kiểu dữ liệu:** `String`
- **Bắt buộc:** Không (optional)
- **Mô tả:** URL embed từ Google Maps để hiển thị bản đồ

**Ví dụ Schema:**
```javascript
// Mongoose Schema
{
  shopName: { type: String, required: true },
  address: { type: String },
  email: { type: String },
  phone: { type: String },
  description: { type: String },
  workingHours: { type: String },
  images: [{ type: String }],
  mapEmbedUrl: { type: String }, // ← THÊM FIELD NÀY
  // ... các field khác
}
```

### 2. Cập nhật API GET /shop/public

**Endpoint:** `GET /shop/public`

**Yêu cầu:** Response phải bao gồm field `mapEmbedUrl`

**Format Response mong đợi:**
```json
{
  "status": "OK",
  "data": {
    "shopName": "Smart Fruit Shop",
    "address": "123 Đường ABC, Quận XYZ, TP.HCM",
    "email": "contact@example.com",
    "phone": "0123456789",
    "description": "...",
    "workingHours": "...",
    "images": ["url1", "url2"],
    "mapEmbedUrl": "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.1234567890!2d106.6296643!3d10.8230989!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752a...!2sYour%20Address!5e0!3m2!1sen!2s!4v1234567890"
  }
}
```

**Lưu ý:**
- Nếu shop chưa có `mapEmbedUrl`, trả về `null` hoặc `""` (empty string)
- Frontend sẽ chỉ hiển thị map khi có giá trị hợp lệ

### 3. Cập nhật API Admin (nếu có)

**Endpoint:** `PUT /admin/shop/basic-info` (hoặc endpoint tương ứng để cập nhật shop)

**Yêu cầu:** Cho phép admin cập nhật field `mapEmbedUrl`

**Request Body:**
```json
{
  "shopName": "...",
  "address": "...",
  "email": "...",
  "phone": "...",
  "mapEmbedUrl": "https://www.google.com/maps/embed?pb=..." // ← Cho phép cập nhật
}
```

### 4. Format của mapEmbedUrl

**Ví dụ URL hợp lệ:**
```
https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.1234567890!2d106.6296643!3d10.8230989!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752a...!2sYour%20Address!5e0!3m2!1sen!2s!4v1234567890
```

**Cách lấy URL:**
1. Vào Google Maps: https://www.google.com/maps
2. Tìm địa chỉ shop
3. Click vào menu (☰) → "Chia sẻ hoặc nhúng bản đồ"
4. Chọn tab "Nhúng bản đồ"
5. Copy phần `src="..."` trong thẻ iframe

### 5. Validation (tùy chọn)

Nếu muốn validate URL:
- Kiểm tra URL bắt đầu bằng `https://www.google.com/maps/embed`
- Hoặc chỉ cần kiểm tra là URL hợp lệ

### 6. Database Migration (nếu cần)

Nếu database đã có dữ liệu:
- Thêm field `mapEmbedUrl` với giá trị mặc định là `null` hoặc `""`
- Không cần migrate dữ liệu cũ

## Tóm tắt

**Backend cần làm:**
1. ✅ Thêm field `mapEmbedUrl` vào Shop model
2. ✅ Cập nhật API `GET /shop/public` để trả về `mapEmbedUrl`
3. ✅ (Tùy chọn) Cho phép admin cập nhật `mapEmbedUrl` qua API admin

**Frontend sẽ làm:**
- Hiển thị Google Maps iframe khi có `mapEmbedUrl`
- Responsive design
- Fallback khi không có map

## Câu hỏi thường gặp

**Q: Có cần Google Maps API Key không?**
A: Không. Embed URL không cần API key.

**Q: Field này có bắt buộc không?**
A: Không. Field này là optional. Frontend sẽ chỉ hiển thị map khi có giá trị.

**Q: Có thể dùng tên field khác không?**
A: Có thể, nhưng cần thống nhất với Frontend. Đề xuất: `mapEmbedUrl` hoặc `googleMapUrl`.

---

**Ngày tạo:** 2026-02-12
**Phiên bản:** 1.0
