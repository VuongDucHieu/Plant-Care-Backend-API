# ADR-001 — Giữ một backend application thay vì tách microservices

- **Trạng thái:** Đề xuất; chờ review/merge ARCH-001
- **Ngày:** 2026-10-09
- **Phạm vi:** Plant Care Backend API

## 1. Bối cảnh

Plant Care hiện có hai chức năng Identify và Diagnose, cùng dùng upload ảnh, chuẩn hóa ảnh, abstraction `PlantAnalyzer`, Gemini adapter và error handling. Chưa có dữ liệu benchmark chứng minh nhu cầu scale hoặc triển khai độc lập.

## 2. Vấn đề cần quyết định

Có nên tách Identify Service và Diagnose Service thành các tiến trình/deployment riêng ngay từ đầu không?

## 3. Các phương án

**A — Một backend application (lựa chọn hiện tại):** Duy trì các layer và interface rõ ràng trong cùng một deployable.

**B — Hai microservices:** Tách Identify và Diagnose thành các service có deployment, cấu hình, monitoring và giao tiếp riêng.

## 4. Quyết định

**Chọn A.** Không tách microservices ở checkpoint này.

### Lý do

1. Chưa có bằng chứng về bottleneck, yêu cầu scale độc lập hoặc nhu cầu release độc lập.
2. Identify và Diagnose đang chia sẻ nhiều thành phần; tách sớm dễ tạo trùng lặp hoặc phát sinh giao tiếp mạng không cần thiết.
3. Một deployable giúp giảm độ phức tạp về triển khai, quan sát, debug và vận hành trong giai đoạn phát triển ban đầu.

### Trade-offs và nhược điểm

- Các chức năng chia sẻ tài nguyên CPU/RAM và có thể ảnh hưởng lẫn nhau.
- Khi chỉ có một deployable, thay đổi một chức năng thường kéo theo deployment toàn ứng dụng.
- Không thể scale riêng Identify và Diagnose chỉ bằng cách nhân bản toàn bộ ứng dụng; nếu nhu cầu khác nhau lớn, việc này có thể kém hiệu quả.

## 5. Khi nào đánh giá lại?

Chỉ xem xét thay đổi sau khi có bằng chứng như: sự khác biệt rõ rệt về tải/độ trễ; nhu cầu triển khai độc lập; ranh giới nghiệp vụ rõ; hoặc yêu cầu reliability không thể đáp ứng hợp lý trong cấu trúc hiện tại.

Trước khi tách service, cân nhắc các giải pháp ít phức tạp hơn: tối ưu xử lý ảnh, giới hạn concurrency, caching phù hợp, queue/worker cho tác vụ chậm, hoặc scale toàn bộ API khi thực sự cần.

## 6. Hệ quả

- Tiếp tục phát triển theo hướng một backend application có các boundary rõ ràng.
- Ghi nhận latency, error rate và resource usage ở phase performance.
- Tách service là **quyết định dựa trên bằng chứng**, không phải mục tiêu tự thân.

## 7. Bằng chứng

- Source code: `src/app.ts`, `src/http/routes/plant.route.ts`, `src/domain/plant-analyzer.ts`.
- Benchmark: **Chưa thực hiện**.
- Issue/PR: **Bổ sung liên kết khi tạo**.
