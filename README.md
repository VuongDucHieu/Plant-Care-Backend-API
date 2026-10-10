# Plant Care Backend API

## 1. Mục tiêu

Xây dựng API nhận diện cây trồng (**Identify**) và hỗ trợ chẩn đoán tình trạng cây (**Diagnose**) từ ảnh, sử dụng Node.js, TypeScript, Express, Sharp và Google Gemini.

## 2. API hiện tại

| Endpoint | Mục đích | Đầu vào |
|---|---|---|
| `POST /plants/identify` | Nhận diện và đưa ra thông tin chăm sóc | Một file `image` |
| `POST /plants/diagnose` | Phân tích tình trạng và gợi ý xử lý | Hai file `plantImage`, `diseaseImage` |
| `GET /health` | Kiểm tra HTTP health endpoint | Không có ảnh |

## 3. Công nghệ và vai trò

- **Node.js + TypeScript + Express:** HTTP application và kiểu dữ liệu.
- **Multer:** Tiếp nhận multipart file upload.
- **Sharp:** Chuẩn hóa ảnh trước khi gửi provider.
- **Google Gemini:** Provider AI bên ngoài.
- **Zod:** Kiểm tra dữ liệu phản hồi tại runtime và cấu hình môi trường theo phần triển khai tương ứng.

## 4. Kiến trúc hiện tại

Một **backend application duy nhất**, có các ranh giới HTTP → Application → Domain và Infrastructure adapters. Đây là mô tả về cách tổ chức code và deployment hiện tại, **không đồng nghĩa** đã áp dụng đầy đủ mọi nguyên tắc Clean Architecture.

Xem [Phân tích kiến trúc hiện tại](docs/architecture/01-current-architecture.md) và [ADR-001](docs/decisions/ADR-001-modular-monolith.md).

## 5. Lộ trình phát triển

| Giai đoạn | Trọng tâm | Trạng thái |
|---|---|---|
| ARCH-001 | Kiến trúc hiện trạng, sơ đồ, ADR, nhật ký | Đang thực hiện |
| Database | PostgreSQL, schema, migration, index | Chưa bắt đầu |
| Reliability | Timeout, retry, rate limit, lỗi provider | Chưa đánh giá đầy đủ |
| Async processing | Queue, worker, idempotency | Chưa bắt đầu |
| Performance | Benchmark, p95, throughput, bottleneck | Chưa bắt đầu |
| Infrastructure | Linux, Docker, Nginx, deployment | Chưa bắt đầu |
| Scaling | Scale dọc/ngang, load balancing | Chưa bắt đầu |
| Observability | Logs, metrics, tracing, alerting | Chưa bắt đầu |
| Security | Auth, secret, upload security, backup | Chưa bắt đầu |

## 6. Theo dõi quá trình thực hiện

Mỗi checkpoint sử dụng **GitHub Issue → branch → Pull Request → tài liệu → merge**.

- [Nhật ký ARCH-001](docs/journal/001-architecture-baseline.md): Đã làm gì, bằng chứng, vấn đề, bài học.
- [ADR-001](docs/decisions/ADR-001-modular-monolith.md): Vì sao chưa tách microservices.
- Pull Request ghi rõ **What / Why / How / Verification**.

**Nguyên tắc:** Không ghi một thử nghiệm là đã pass nếu chưa thực sự chạy; không tự tạo số liệu tải hoặc kết quả benchmark.

## 7. Chạy và kiểm tra cục bộ

```bash
pnpm install
pnpm typecheck
pnpm lint
pnpm dev
```

Cần cấu hình các biến môi trường mà source code yêu cầu, đặc biệt cấu hình Gemini. **Không commit `.env`, API key hoặc thông tin bí mật.** Kiểm tra tên biến trong `src/config/env.ts` trước khi chạy.

## 8. Cách đọc repository

1. Bắt đầu từ README này.
2. Đọc tài liệu kiến trúc để hiểu request flow.
3. Đọc ADR để hiểu các trade-off.
4. Đọc Engineering Journal và Pull Requests để xem tiến trình học và thực hiện.
