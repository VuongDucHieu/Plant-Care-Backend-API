# Plant Care — Thiết kế Prisma Schema giai đoạn 1

> **Trạng thái:** Bản thiết kế để review, chưa chạy migration. Chỉ tạo `User`, `Session`, `Plant`. Care Planning được bổ sung ở giai đoạn sau.

## 1. Quan hệ dữ liệu

```mermaid
erDiagram
  USER ||--o{ SESSION : "có phiên"
  USER ||--o{ PLANT : "sở hữu cây"
  USER { string id PK; string email UK; string passwordHash }
  SESSION { string id PK; string userId FK; string refreshTokenHash UK; datetime expiresAt; datetime revokedAt }
  PLANT { string id PK; string ownerId FK; string displayName; string scientificName }
```

## 2. Quy tắc lưu trữ

- `User.email`: chuẩn hóa email theo chính sách xác định trước khi lưu và truy vấn; unique.
- `User.passwordHash`: không bao giờ trả về trong API.
- `Session.refreshTokenHash`: unique; `revokedAt` và `expiresAt` phục vụ kiểm tra hiệu lực.
- `Plant.ownerId`: khóa ngoại bắt buộc; mọi truy vấn phải lọc ownership.
- `Plant.identificationSnapshot`: JSON tùy chọn, lưu nguyên kết quả nhận diện đã được Zod kiểm tra; không nhầm với kế hoạch chăm sóc có lịch.
- Xóa user/plant và thời hạn giữ session cần chính sách riêng; không mặc định cascade khi chưa quyết định.

## 3. Đề xuất chỉ mục

- `User(email)` unique.
- `Session(refreshTokenHash)` unique; `Session(userId, revokedAt)` để quản lý phiên.
- `Plant(ownerId, createdAt)` để lấy danh sách cây theo người dùng.

## 4. Migration và kiểm thử

1. Thiết lập PostgreSQL và cấu hình Prisma phù hợp phiên bản đã chọn.
2. Tạo migration đầu tiên cho `User`, `Session`, `Plant`.
3. Chạy migration trên database thử nghiệm; kiểm tra khóa ngoại và unique.
4. Test đăng ký email trùng; token refresh trùng; Plant thiếu owner.
5. Test isolation: User A không thể truy cập Plant của User B.
6. Kiểm tra rollback/recovery và cách quản lý dữ liệu nhạy cảm trước khi deploy.

Xem mẫu [`prisma/schema.prisma`](../../../prisma/schema.prisma) trong gói này. Mẫu chưa bao gồm Prisma client adapter, `prisma.config.ts`, dependency hay migration đã chạy.
