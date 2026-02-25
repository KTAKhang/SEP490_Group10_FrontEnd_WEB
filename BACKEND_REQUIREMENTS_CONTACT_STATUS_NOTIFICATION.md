# YÊU CẦU BACKEND: Gửi thông báo cho Customer khi Admin cập nhật trạng thái Contact

**Trạng thái: Đã triển khai (Backend).** Frontend đã tương thích payload dạng `{ type, data: { type, action, contactId } }`.

## Mục đích
Khi admin (hoặc staff) cập nhật trạng thái của một contact (Open → In Progress, Resolved, Closed), customer (người tạo contact) phải nhận được thông báo ngay (in-app + push FCM nếu có).

## Ngữ cảnh
- **API cập nhật trạng thái:** `PATCH /contacts/:contactId/status` với body `{ status: "IN_PROGRESS" | "RESOLVED" | "CLOSED" }`
- Frontend đã xử lý click thông báo loại `contact`: mở trang Lịch sử liên hệ và có thể deep-link tới đúng contact (`/customer/contact-history?contactId=...`).

## Yêu cầu Backend

### 1. Khi nào gửi thông báo
- **Trigger:** Ngay sau khi xử lý thành công `PATCH /contacts/:contactId/status` (trạng thái đã được lưu).
- **Người nhận:** User (customer) gắn với contact đó — tức là `contact.user_id` (hoặc field tương ứng lưu người tạo contact).

### 2. Nội dung thông báo gửi cho Customer

**Gợi ý title (tiếng Việt):**
- `"Trạng thái liên hệ đã được cập nhật"`

**Gợi ý body (có thể tùy theo status mới):**
- Trạng thái mới là **In Progress:** `"Yêu cầu liên hệ của bạn đang được xử lý."`
- Trạng thái mới là **Resolved:** `"Yêu cầu liên hệ của bạn đã được giải quyết."`
- Trạng thái mới là **Closed:** `"Yêu cầu liên hệ của bạn đã được đóng."`

*(Backend có thể dùng một câu chung hoặc map message theo từng status.)*

### 3. Format gửi notification (FCM + lưu DB)

Backend cần gửi notification tới **đúng user** (customer của contact) với **data** đúng format để frontend xử lý click và deep-link:

- **Lưu notification vào DB** (bảng/collection notifications) cho user đó.
- **Gửi FCM push** (nếu user có FCM token) với payload chứa **data** như sau:

```json
{
  "type": "contact",
  "action": "view_contact",
  "contactId": "<contactId của contact vừa cập nhật>"
}
```

- **title / body:** Dùng title và body đã gợi ý ở mục 2 (hoặc tương đương).

**Ví dụ gọi service (backend):**
```javascript
// Sau khi cập nhật contact status thành công
await NotificationService.sendToUser(contact.user_id, {
  title: "Trạng thái liên hệ đã được cập nhật",
  body: "Yêu cầu liên hệ của bạn đang được xử lý.", // hoặc theo status
  data: {
    type: "contact",
    action: "view_contact",
    contactId: contact._id.toString()
  }
});
```

### 4. Frontend đã hỗ trợ sẵn
- Khi user click vào thông báo, frontend sẽ đọc `data.type === 'contact'`, `data.action === 'view_contact'`, `data.contactId` và chuyển tới:
  - `/customer/contact-history?contactId=<contactId>`
- Không cần thay đổi frontend cho phần click notification nếu backend gửi đúng format trên.

## Tóm tắt
| Mục | Nội dung |
|-----|----------|
| Trigger | Thành công khi gọi `PATCH /contacts/:id/status` |
| Người nhận | User (customer) của contact (`contact.user_id`) |
| Notification | Lưu DB + gửi FCM với `data: { type: "contact", action: "view_contact", contactId }` |
| Title/Body | Tiếng Việt, thông báo trạng thái liên hệ đã cập nhật (có thể thay đổi theo status) |

Sau khi backend triển khai đúng format trên, customer sẽ nhận thông báo khi admin cập nhật trạng thái và có thể mở đúng contact từ thông báo.
