# ARCH-003.5 — Readiness & Failure Scenarios

## 1. Objective

Thiết kế cách Plant Care Backend API xử lý lỗi của external dependencies mà không làm gián đoạn những chức năng vẫn có khả năng hoạt động.

## 2. Architecture Decision

- Liveness phản ánh khả năng phản hồi của tiến trình HTTP.
- Readiness phản ánh trạng thái sẵn sàng nhận traffic theo application lifecycle.
- Không gọi Gemini trong health probes.
- Không đánh dấu toàn bộ ứng dụng Not Ready chỉ vì Gemini gặp lỗi.
- Lỗi từ Gemini được xử lý tại Gemini Adapter và HTTP Error Middleware.

## 3. Failure Scenarios

| Scenario | Liveness | Readiness | Identify |
|---|---|---|---|
| Normal operation | 200 | 200 | Available |
| Gemini unavailable | 200 | 200 | 503 |
| Gemini timeout | 200 | 200 | 504 |
| Gemini rate limited | 200 | 200 | 429 |
| Graceful shutdown | 200 nếu còn phản hồi | 503 nếu còn phản hồi | Đang ngừng phục vụ |
| Process stopped | Unreachable | Unreachable | Unreachable |

Các trạng thái trên mô tả chính sách và hành vi kỳ vọng; không thay thế việc kiểm chứng runtime.

## 4. Future Database Policy

**Decision: Optional History Persistence**

Chức năng nhận diện cây không bắt buộc phải lưu kết quả vào PostgreSQL để được coi là thành công.

- Gemini thành công: có thể trả kết quả cho người dùng.
- PostgreSQL lỗi: không được thông báo sai rằng dữ liệu đã lưu.
- Lưu lịch sử là một chức năng độc lập hoặc bước xử lý tùy chọn.
- Nếu sử dụng hàng đợi bất đồng bộ, phải phân biệt trạng thái đang chờ lưu với đã lưu thành công.

PostgreSQL chưa được triển khai trong phiên bản hiện tại. Đây là quyết định thiết kế cho tương lai.

## 5. Trade-offs

**Advantages**

- Giảm ảnh hưởng dây chuyền khi external dependency gặp lỗi.
- Không tạo thêm traffic đến Gemini từ health probes.
- Hỗ trợ graceful degradation.
- Giữ health checks đơn giản.

**Limitations**

- Readiness 200 không bảo đảm mọi tính năng hoạt động.
- Cần giám sát lỗi theo từng chức năng.
- Chưa có cơ chế lưu lịch sử bền vững khi PostgreSQL unavailable.
- Chưa triển khai load balancer hoặc traffic draining thực tế.

## 6. Implementation Scope

Các thành phần hiện có:

- `ReadinessState`
- `createHealthRouter`
- `GeminiPlantAnalyzer`
- `PlantAnalyzerError`
- `errorHandler`
- `createGracefulShutdown`

Không cần bổ sung infrastructure mới trong ARCH-003.5.

## 7. Acceptance Criteria

- [x] Xác định sự khác nhau giữa liveness và readiness.
- [x] Xác định chính sách khi Gemini unavailable.
- [x] Xác định chính sách khi Gemini timeout.
- [x] Xác định cách cô lập lỗi external dependency.
- [x] Chốt chính sách optional history persistence cho tương lai.
- [ ] Lưu tài liệu vào repository.
- [ ] Kiểm tra và hoàn thành Git workflow cho ticket.