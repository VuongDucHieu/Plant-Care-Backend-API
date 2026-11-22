# Plant Care — Product Vision

> **Status:** Draft for product review · **Scope:** Full product vision, not current implementation · **Updated:** 2026-11-21

## 1. Vision

**Plant Care** là trợ lý AI đồng hành với người chăm sóc cây: giúp người dùng nhận diện cây, hiểu nhu cầu cơ bản, xây dựng kế hoạch chăm sóc được phê duyệt, theo dõi công việc định kỳ và nhận hỗ trợ khi cây có dấu hiệu bất thường.

> **Vision statement:** Giúp người mới trồng cây tự tin chăm sóc cây mỗi ngày bằng hướng dẫn dễ hiểu, có bối cảnh và được người dùng kiểm soát.

## 2. Problem statement

Người mới trồng cây trong nhà/căn hộ có thể không biết tên cây, điều kiện chăm sóc phù hợp, thời điểm cần kiểm tra cây, cách nhận biết triệu chứng hoặc cách duy trì thói quen chăm sóc. Câu trả lời AI một lần chưa giải quyết nhu cầu **theo dõi liên tục**.

## 3. Target users

- **Primary — Beginner indoor plant owner:** Có một hoặc vài cây, ít kinh nghiệm chăm sóc, cần hướng dẫn dễ hiểu.
- **Secondary — Plant enthusiast:** Có nhiều cây hơn, cần quản lý kế hoạch và lịch sử theo từng cây.
- **Future segments:** Vườn ngoài trời hoặc người chăm sóc nhiều cây quy mô lớn; chưa cam kết cho MVP.

## 4. Product value

| Người dùng muốn | Giá trị mong đợi | Cách kiểm chứng dự kiến |
|---|---|---|
| Biết mình đang trồng cây gì | Nhận diện và giải thích cơ bản | Tỷ lệ hoàn tất luồng nhận diện, phản hồi hữu ích |
| Biết nên chăm sóc ra sao | Kế hoạch có thể xem xét trước khi chấp nhận | Tỷ lệ chấp nhận kế hoạch, tỷ lệ từ chối |
| Không bỏ quên việc chăm sóc | Danh sách công việc theo từng cây | Tỷ lệ công việc được xử lý, số công việc quá hạn |
| Có hướng xử lý khi cây bất thường | Hỗ trợ chẩn đoán bằng ảnh, nêu tính không chắc chắn | Phản hồi hữu ích và các trường hợp cần xem xét chuyên gia |

Các chỉ số là **đề xuất đo lường**, chưa có baseline hay target được phê duyệt.

## 5. Product capabilities and implementation truth

| Capability | Product direction | Source status (main, 2026-11-21) |
|---|---|---|
| Plant Identification | Nhận diện ảnh và mô tả yêu cầu chăm sóc | **Implemented API** `POST /plants/identify` |
| Plant Diagnosis | Phân tích hai ảnh và gợi ý xử lý | **Implemented API** `POST /plants/diagnose` |
| My Plant Collection | Lưu hồ sơ cây theo người dùng | **Planned** |
| Progressive Personalization | Thu thập bối cảnh theo từng bước; không suy đoán giá trị thiếu | **Planned** |
| AI Care Plan Approval | Accept/Reject kế hoạch AI | **Planned** |
| Recurring Care Task & History | Checklist, Complete/Skip/Undo, Overdue | **Planned** |
| Push Notification | Thông báo ngoài ứng dụng | **Open decision**, không mặc định thuộc MVP |

**Lưu ý:** Trường `carePlan` hiện có trong Identify response là phần **khuyến nghị dạng văn bản**, không phải lịch đã được phê duyệt hay các công việc đã lưu.

## 6. Principles

1. **User control:** AI đề xuất; người dùng phê duyệt trước khi kích hoạt hoặc thay đổi kế hoạch.
2. **No fabricated context:** Thông tin chưa biết phải là `Unknown`/chưa cung cấp, không tự tạo.
3. **Safe assistance:** Lịch cố định có thể là lịch *kiểm tra điều kiện*, không đồng nghĩa bắt buộc tưới/bón phân.
4. **Traceability:** Yêu cầu → đặc tả tính năng → thiết kế → test và PR.
5. **Product before technology:** Gemini, database và framework là lựa chọn triển khai, không phải giá trị cốt lõi của sản phẩm.

## 7. Related documents

- [BACCM](baccm-analysis.md)
- [Stakeholders](stakeholders.md)
- [Roadmap](roadmap.md)
- [Business Requirements](../02-business-analysis/requirements/business-requirements.md)
- [Product Decisions](../06-decisions/product/README.md)
