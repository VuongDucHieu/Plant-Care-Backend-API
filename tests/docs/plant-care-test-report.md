# PLANT CARE BACKEND API — TEST REPORT

**Document ID:** QA-PLANT-001  
**Version:** 1.0  
**Status:** Test plan / Chưa thực thi các test case trong báo cáo  
**Scope:** `POST /plants/identify`  
**Repository:** `vgduchieu0602/Plant-Care-Backend-API`  
**Prepared on:** 2026-09-23

> **Quy ước trạng thái:** `NOT RUN` = chưa chạy; `PASS` = đã chạy và đạt; `FAIL` = đã chạy và không đạt; `BLOCKED` = không thể chạy. Không chuyển test case sang PASS chỉ vì đã viết code hoặc vì `pnpm typecheck` thành công.

## 1. Mục tiêu và phạm vi

Báo cáo này mô tả **những gì sẽ được kiểm thử, cách thực hiện, kết quả kỳ vọng và bằng chứng cần lưu** cho chức năng nhận diện cây.

**Luồng nghiệp vụ thuộc phạm vi:** Client gửi một ảnh qua multipart field `image` → Multer nhận file → Controller tạo `ImageInput` → UseCase normalize ảnh → `PlantAnalyzer.identify()` → trả JSON. Các trường hợp lỗi liên quan upload, ảnh đầu vào và nhà cung cấp AI cũng nằm trong phạm vi.

**Ngoài phạm vi hiện tại:** `POST /plants/diagnose`, đánh giá độ chính xác nhận diện của Gemini, kiểm thử tải, bảo mật chuyên sâu, deploy và CI/CD.

**Điều kiện đầu vào:** mã nguồn của nhánh đang kiểm thử; cấu hình môi trường hợp lệ; Vitest; công cụ gửi HTTP request (dự kiến Supertest); ảnh mẫu JPEG/PNG hợp lệ và dữ liệu ảnh lỗi. Với integration test, dùng fake `PlantAnalyzer` để không gọi Gemini thật.

## 2. Tổng quan test suite

| Suite | Mã | Đối tượng | Mục đích | Trạng thái |
|---|---|---|---|---|
| Unit | UT-IDENTIFY | `IdentifyPlantUseCase` | Xác minh thứ tự normalize → identify, dữ liệu truyền và lỗi được lan truyền | NOT RUN |
| Unit | UT-NORMALIZER | `SharpImageNormalizer` | Xác minh định dạng đầu ra và xử lý ảnh không hợp lệ | NOT RUN |
| Integration | IT-IDENTIFY | `POST /plants/identify` | Xác minh Router → Multer → Controller → UseCase → HTTP response | NOT RUN |
| Integration | IT-ERROR | HTTP error middleware | Xác minh mã HTTP và JSON khi upload/analyzer lỗi | NOT RUN |

**Lưu ý về bằng chứng hiện có:** Người phát triển cho biết `pnpm typecheck` và `pnpm test:run` đã chạy thành công trước khi lập báo cáo; chưa có log, số lượng test hoặc kết quả từng test case để xác nhận trong tài liệu này. Hai lỗi ESLint đã được nêu ở `_next` và `_images`; trạng thái khắc phục và kết quả lint sau sửa chưa được xác nhận.

## 3. UNIT TEST REPORT — `IdentifyPlantUseCase`

**Test level:** Unit  
**Test target:** `src/application/use-cases/identify-plant.use-case.ts`  
**Dependencies:** fake/mock `PlantAnalyzer`, fake/mock `ImageNormalizer`; không khởi tạo Gemini, không gọi HTTP.  
**Mục đích:** Chứng minh UseCase điều phối đúng các dependency mà không phụ thuộc implementation cụ thể.

| Test ID | Tình huống | Cách thực hiện / Input | Kết quả kỳ vọng | Trạng thái |
|---|---|---|---|---|
| UT-IDENTIFY-001 | Normalize trước khi identify | Truyền một `ImageInput`; mock normalizer trả ảnh đã chuyển đổi | Analyzer nhận đúng ảnh **đã normalize**, không nhận ảnh gốc | NOT RUN |
| UT-IDENTIFY-002 | Trả kết quả analyzer | Fake analyzer trả một `IdentifyPlantResult` hợp lệ | `execute()` trả đúng kết quả đó | NOT RUN |
| UT-IDENTIFY-003 | Không gọi analyzer nếu normalize thất bại | Fake normalizer ném `ImageInputError` | `execute()` reject với lỗi tương ứng; analyzer không được gọi | NOT RUN |
| UT-IDENTIFY-004 | Lan truyền lỗi provider | Fake analyzer ném `PlantAnalyzerError('TIMEOUT')` | `execute()` reject với lỗi `TIMEOUT`, không tự đổi thành kết quả thành công | NOT RUN |
| UT-IDENTIFY-005 | Xử lý danh sách ảnh theo contract hiện tại | Truyền danh sách `ImageInput[]` và theo dõi mock calls | Mỗi ảnh được normalize; analyzer nhận danh sách ảnh đã normalize | NOT RUN |

**Tiêu chí hoàn thành suite:** Tất cả test case được thực thi và PASS; không có request ra Gemini; không cần API key thật cho test UseCase.

### 3.1 UNIT TEST REPORT — `SharpImageNormalizer`

**Test target:** `src/infra/image/sharp-image-normalizer.ts`  
**Mục đích:** Xác minh xử lý ảnh đầu vào trước khi gửi AI.

| Test ID | Tình huống | Cách thực hiện / Input | Kết quả kỳ vọng | Trạng thái |
|---|---|---|---|---|
| UT-NORMALIZER-001 | Ảnh JPEG hợp lệ | Dùng fixture JPEG nhỏ | Trả `bytes` đọc được và `mimeType: image/jpeg` | NOT RUN |
| UT-NORMALIZER-002 | Ảnh PNG hợp lệ | Dùng fixture PNG nhỏ | Trả JPEG hợp lệ, `mimeType: image/jpeg` | NOT RUN |
| UT-NORMALIZER-003 | Định dạng không hỗ trợ | Dùng ảnh có định dạng khác JPEG/PNG mà Sharp nhận diện được | Ném `ImageInputError` với code `UNSUPPORTED_FORMAT` | NOT RUN |
| UT-NORMALIZER-004 | Bytes ảnh hỏng | Truyền Buffer không phải ảnh | Ném `ImageInputError` với code `INVALID_IMAGE` | NOT RUN |
| UT-NORMALIZER-005 | Ảnh vượt kích thước resize | Dùng fixture lớn hơn giới hạn 1600×1600 | Kích thước đầu ra nằm trong 1600×1600, không méo tỉ lệ | NOT RUN |

**Ghi chú:** Kiểm thử dung lượng upload thuộc integration test của Multer, không thuộc trách nhiệm của Sharp normalizer.

## 4. INTEGRATION TEST REPORT — `POST /plants/identify`

**Test level:** Integration  
**Test target:** Express app được tạo bởi `createApp()`; Router, Multer, Controller, UseCase và error middleware.  
**Test double:** fake `PlantAnalyzer` trả kết quả cố định hoặc ném lỗi được chỉ định.  
**Mục đích:** Chứng minh các thành phần kết nối đúng qua HTTP mà không phụ thuộc mạng hoặc quota Gemini.

**Điều kiện thiết kế để test:** `createApp()` cần cho phép inject `PlantAnalyzer` (hoặc dependency tương đương) khi chạy test; mặc định production vẫn dùng `GeminiPlantAnalyzer`. Không cần gọi `app.listen()` trong test nếu dùng Supertest với Express app.

| Test ID | Tình huống | HTTP request / Thiết lập | Kết quả kỳ vọng | Trạng thái |
|---|---|---|---|---|
| IT-IDENTIFY-001 | Nhận diện ảnh thành công | `POST /plants/identify`, multipart field `image`, JPEG hợp lệ; fake analyzer trả kết quả mẫu | HTTP 200; JSON bằng kết quả mẫu; analyzer được gọi với ảnh JPEG đã normalize | NOT RUN |
| IT-IDENTIFY-002 | Thiếu ảnh | `POST /plants/identify` không đính kèm file | HTTP 400; JSON báo thiếu ảnh; analyzer không được gọi | NOT RUN |
| IT-IDENTIFY-003 | Sai tên field upload | Đính kèm file ở field khác `image` | HTTP 400 từ Multer; JSON `UPLOAD_ERROR` theo middleware hiện tại | NOT RUN |
| IT-IDENTIFY-004 | Ảnh vượt dung lượng | Đính kèm ảnh lớn hơn `MAX_IMAGE_MB` | HTTP 413 nếu đã áp dụng thay đổi đề xuất; JSON code `IMAGE_TOO_LARGE` | NOT RUN |
| IT-IDENTIFY-005 | Bytes ảnh không hợp lệ | Field `image` chứa bytes không phải ảnh | HTTP 400; JSON code `INVALID_IMAGE`; analyzer không được gọi | NOT RUN |
| IT-IDENTIFY-006 | Provider rate limited | Fake analyzer ném `PlantAnalyzerError` code `RATE_LIMITED` | HTTP 429; JSON code `RATE_LIMITED` | NOT RUN |
| IT-IDENTIFY-007 | Provider timeout | Fake analyzer ném code `TIMEOUT` | HTTP 504; JSON code `TIMEOUT` | NOT RUN |
| IT-IDENTIFY-008 | Provider unavailable | Fake analyzer ném code `UNAVAILABLE` | HTTP 503; JSON code `UNAVAILABLE` | NOT RUN |
| IT-IDENTIFY-009 | Provider invalid response | Fake analyzer ném code `INVALID_RESPONSE` | HTTP 503; JSON code `INVALID_RESPONSE` | NOT RUN |
| IT-IDENTIFY-010 | Lỗi không xác định | Fake analyzer ném `Error` thông thường | HTTP 500; JSON code `INTERNAL_ERROR`; không lộ stack trace | NOT RUN |

**Lưu ý xác nhận contract:** Nếu middleware hiện tại vẫn trả HTTP 400 cho `LIMIT_FILE_SIZE`, cập nhật kết quả kỳ vọng của IT-IDENTIFY-004 theo quyết định API đã chốt, hoặc sửa middleware sang 413 trước khi chạy. Không ghi FAIL chỉ vì tài liệu và implementation chưa thống nhất.

## 5. Phương pháp thực thi và bằng chứng

**Unit:** Chạy các test Vitest ở cấp UseCase/Normalizer; xác minh return value, số lần gọi, tham số gọi và rejected error. Dùng mock/fake thay thế dependency ngoài phạm vi test.

**Integration:** Khởi tạo Express app với fake analyzer; dùng Supertest gửi multipart request; xác minh HTTP status, response body và tương tác với fake analyzer. Không gọi Gemini thật trong suite này.

**Lệnh thực thi dự kiến:**

```bash
pnpm typecheck
pnpm lint
pnpm test:run
```

Khi bổ sung test, lưu log thực thi và tên file test thực tế vào bảng kết quả dưới đây. Có thể chạy riêng suite bằng lệnh Vitest tương ứng với đường dẫn file test được tạo.

## 6. Execution log — cập nhật sau mỗi lần chạy

| Run ID | Ngày/giờ | Commit SHA | Môi trường | Lệnh / Suite | Tổng | Pass | Fail | Skip | Bằng chứng |
|---|---|---|---|---|---:|---:|---:|---:|---|
| RUN-001 | Chưa thực thi | Chưa ghi nhận | Local Windows | Unit + Integration | — | — | — | — | Chưa có log |

### Defect log

| Defect ID | Test ID | Mô tả lỗi | Mức độ | Cách tái hiện | Trạng thái |
|---|---|---|---|---|---|
| — | — | Chưa ghi nhận defect qua các test case trong báo cáo | — | — | — |

### Kết luận kiểm thử

**Trạng thái hiện tại: NOT EXECUTED.** Báo cáo đã xác định phạm vi, mục tiêu, cách thực hiện và expected result cho Unit Test và Integration Test. Chưa có bằng chứng thực thi các test case nêu trên, vì vậy chưa thể kết luận chức năng đạt yêu cầu QA. Cập nhật trạng thái và execution log sau khi viết và chạy test thực tế.
