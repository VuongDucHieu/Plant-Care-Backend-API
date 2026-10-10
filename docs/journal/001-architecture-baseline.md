# Engineering Journal 001 — Architecture Baseline

- **Checkpoint:** ARCH-001
- **Ngày bắt đầu:** 2026-10-09
- **Trạng thái:** Đang thực hiện

## 1. Mục tiêu

Hiểu và mô tả chính xác kiến trúc Plant Care hiện tại trước khi thêm database, queue, hạ tầng hoặc scale.

## 2. Đã thực hiện / có bằng chứng

- Đã xây dựng luồng Identify và Diagnose trong source code.
- Diagnose đã trả về dữ liệu JSON có `diagnosis` và `treatment` trong lần thử Postman được báo cáo.
- Đã phát hiện một lần lỗi `UNKNOWN` liên quan đến cấu hình environment chưa đúng; sau khi cấu hình, request Diagnose chạy thành công.
- Đã xác định `src/app.ts` là composition root và `PlantAnalyzer` là interface cho AI provider.

**Giới hạn bằng chứng:** Các kết quả trên dựa vào source đã xem và output người thực hiện cung cấp; không đồng nghĩa đã có automated tests hay benchmark pass.

## 3. Điều đã học

### 3.1. Architecture không đồng nghĩa Infrastructure

Phân tách HTTP, Application, Domain và Infrastructure giúp tổ chức dependency và bảo trì code. Nhưng không tự động đảm bảo chịu tải cao hoặc availability tốt.

### 3.2. Vì sao chưa tách microservices?

Hệ thống còn nhỏ, chưa có số liệu tải/bottleneck và các chức năng đang chia sẻ thành phần. Microservices có thể tạo thêm network failure, deployment và monitoring complexity. Cần ghi nhận cả nhược điểm của một deployable: chia sẻ tài nguyên và khó scale độc lập.

### 3.3. Phải xác định đúng thứ tự xử lý

Multer → Controller → UseCase → Sharp normalize → PlantAnalyzer/Gemini → JSON parse/Zod → HTTP response.

## 4. Sai sót và cách sửa

| Vấn đề | Phát hiện | Cách xử lý / bài học |
|---|---|---|
| ENV chưa cấu hình đúng | API trả `UNKNOWN` | Kiểm tra cấu hình runtime trước khi sửa architecture |
| Nhầm thứ tự xử lý | Đặt normalize sau Gemini khi giải thích | Normalize phải thực hiện trước lời gọi provider |
| Giải thích lý do dùng object chưa đủ | Chỉ dựa vào HTTP có hai field | Object biểu diễn semantic của `plantImage` và `diseaseImage` |

## 5. Chưa thực hiện

- [ ] Đo latency, throughput, CPU/RAM.
- [ ] Thử nghiệm stress/load test.
- [ ] Đánh giá có cần queue hoặc microservices bằng số liệu.
- [ ] Hoàn thiện Issue và PR cho ARCH-001.
- [ ] Chạy lại typecheck/lint và ghi kết quả.

## 6. Nhật ký xác minh

| Hoạt động | Lệnh / phương pháp | Kết quả | Bằng chứng |
|---|---|---|---|
| TypeScript | `pnpm typecheck` | Chưa ghi nhận | Điền log/PR |
| ESLint | `pnpm lint` | Chưa ghi nhận | Điền log/PR |
| Diagnose | Postman, hai file ảnh | JSON hợp lệ đã được cung cấp | Gắn screenshot đã ẩn dữ liệu nhạy cảm |
| Load test | Chưa chạy | Chưa có | Không áp dụng |

## 7. Bước tiếp theo

1. Hoàn thiện sơ đồ as-is và ADR-001.
2. Tạo GitHub Issue ARCH-001, branch `docs/arch-001-baseline` và Pull Request.
3. Tự giải thích ưu/nhược điểm của một deployable, được chấm khách quan trước khi đóng checkpoint.

## 8. Liên kết truy vết

- Issue: _Bổ sung sau khi tạo_
- Pull Request: _Bổ sung sau khi tạo_
- Commit: _Bổ sung sau khi push_
