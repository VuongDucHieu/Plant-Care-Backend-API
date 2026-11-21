# ADR-002 — Chuẩn hóa ảnh bằng Sharp

- **Trạng thái:** Accepted

## Context

Client gửi bytes và MIME type của ảnh upload. Provider cần nhận dữ liệu ảnh nhất quán, trong khi ảnh đầu vào có thể khác hướng, kích thước và định dạng.

## Decision

Dùng `SharpImageNormalizer` trước khi gọi `PlantAnalyzer`. Chỉ JPEG và PNG được chấp nhận; ảnh được auto-rotate, thu nhỏ tối đa trong khung 1600×1600 không phóng lớn, sau đó encode thành JPEG chất lượng 85.

## Alternatives considered

- Gửi nguyên ảnh upload cho provider.
- Chỉ kiểm tra MIME type do client gửi.
- Chuẩn hóa ở HTTP controller thay vì application flow.

## Rationale

Sharp đọc metadata thực của ảnh, giúp từ chối định dạng không hỗ trợ và ảnh hỏng. Chuẩn hóa trước adapter giữ `GeminiPlantAnalyzer` tập trung vào provider protocol, đồng thời interface `ImageNormalizer` giúp use case không phụ thuộc trực tiếp Sharp.

## Consequences and trade-offs

- Tốn CPU và memory để decode/encode ảnh.
- Mọi ảnh hợp lệ đều trở thành JPEG, kể cả PNG; transparency hoặc đặc tính PNG không được giữ.
- Giới hạn 1600×1600 giảm payload nhưng có thể làm mất chi tiết nhỏ.
- MIME type upload không phải bằng chứng duy nhất; quyết định dựa trên metadata Sharp.

## Implementation references

- `src/infra/image/sharp-image-normalizer.ts`
- `src/domain/image-normalize.ts`
- `src/application/use-cases/identify-plant.use-case.ts`
- `src/application/use-cases/diagnose-plant.use-case.ts`

## Follow-up considerations

Đo CPU, memory, latency và chất lượng chẩn đoán trước khi đổi kích thước/quality. Chỉ thêm format mới khi xử lý và test của Sharp đã được xác nhận.
