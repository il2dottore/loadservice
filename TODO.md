# Tính năng: Quản lý Tickets

Rà soát và triển khai tính năng Ticket Support theo kiến trúc hiện có. Phạm vi backend là module `backend/apps/common/src/ticket`; frontend là `dashboard`.

## 1. Giao diện và điều hướng (`dashboard`)

- Thêm **General → Tickets** cho mọi người dùng đã đăng nhập.
  - Người dùng tạo ticket với `title` và `content`.
  - Người dùng chỉ xem được các ticket do chính mình tạo, cùng lịch sử trạng thái/phản hồi của chúng.
- Thêm **Admin → Tickets** cho người có `ticket:reply` hoặc `ticket:manage`.
  - Hiển thị danh sách ticket cần hỗ trợ và chi tiết ticket.
  - Người hỗ trợ có thể claim ticket chưa được nhận, phản hồi và chuyển trạng thái theo quyền.
  - Có thể release ticket đã claim để người khác tiếp nhận.
  - `ticket:manage` được phép quản trị toàn bộ ticket theo ma trận quyền ở mục 2.
- Menu chỉ nên hiển thị mục Admin Ticket khi frontend biết người dùng có quyền phù hợp; backend vẫn phải kiểm tra quyền ở mọi API.

## 2. Phân quyền và quyền sở hữu

Quyền được kiểm tra theo permission, không theo tên role cố định:

| Permission | Quyền |
|---|---|
| Không có permission ticket | Tạo ticket và xem/thao tác trên ticket của chính mình; không truy cập Admin Tickets |
| `ticket:reply` | Truy cập Admin Tickets; claim ticket chưa có người nhận; phản hồi, release và cập nhật trạng thái ticket chưa claim hoặc do chính mình claim |
| `ticket:manage` | Toàn quyền CRUD, claim/release và cập nhật trạng thái mọi ticket |

- Người dùng thường không được truyền `senderId` trong request; backend lấy danh tính từ access token.
- Không cho phép người dùng thường sửa hoặc xoá ticket của người khác.
- Cần quy định rõ trạng thái và chuyển trạng thái hợp lệ. Tối thiểu: `OPEN → IN_PROGRESS → SOLVED`; nếu dùng `CLOSED` thì phải thêm vào database enum, type, DTO, API và UI. Nên phân biệt `SOLVED` (đã xử lý) và `CLOSED` (đã đóng hoàn toàn).
- Claim/release phải là thao tác nguyên tử (ví dụ `UPDATE ... WHERE assigned_support_id IS NULL`) để hai support không thể claim cùng một ticket. Việc đổi trạng thái cũng phải kiểm tra người đang claim trong cùng transaction/điều kiện cập nhật.
- Nên lưu phản hồi trong bảng/message riêng thay vì ghi đè `content` của ticket; cần có người gửi, thời điểm và nội dung phản hồi.

## 3. Backend

- Tất cả logic Ticket nằm trong `backend/apps/common/src/ticket` và được đăng ký trong `TicketModule`.
- Hoàn thiện entity/repository/service/controller hiện có; hiện `ticket.service.ts` chưa có implementation.
- API tối thiểu:
  - `GET /tickets`: người dùng chỉ nhận ticket của mình; support nhận ticket theo phạm vi hỗ trợ; manager nhận tất cả.
  - `GET /tickets/:id`: áp dụng cùng quy tắc truy cập.
  - `POST /tickets`: tạo ticket với danh tính người gửi lấy từ request context.
  - `POST /tickets/:id/claim`, `POST /tickets/:id/release`.
  - `POST /tickets/:id/replies` để thêm phản hồi.
  - `PATCH /tickets/:id/status` để đổi trạng thái.
  - `PUT/PATCH` và `DELETE /tickets/:id` chỉ dành cho `ticket:manage` nếu thực sự cần CRUD.
- Dùng guard/decorator permission hiện có; không chỉ ẩn route/menu ở frontend để bảo vệ API.
- DTO phải validate dữ liệu đầu vào, không cho client tự đặt `senderId`/`assignedSupportId`, và controller phải có Swagger đầy đủ cho request, response, lỗi và quyền.
- Chuẩn hoá tên cột hiện đang có typo `assgined_support_id` trước khi dùng rộng rãi; nếu database đã phát hành thì tạo migration tương thích, không đổi âm thầm.
- Cập nhật migration/schema, seed permission và dữ liệu mẫu tương ứng. Không seed dữ liệu phụ thuộc vào user ID cố định.

## 4. Ranh giới giữa service

- Không import trực tiếp entity, module hoặc service từ **ứng dụng/service khác** (`attack`, ...). Giao tiếp qua HTTP client/API contract.
- Các module cùng nằm trong app `common` có thể dùng dependency nội bộ khi phù hợp với kiến trúc hiện tại; quy tắc trên không nên hiểu là cấm mọi import trong cùng app.
- Khi cần dữ liệu từ service khác mà chưa có endpoint, bổ sung endpoint ở service sở hữu dữ liệu trước, kèm DTO/Swagger và kiểm tra authorization.

## 5. Tiêu chí hoàn thành

- Unit/integration test cho authorization, ownership, claim cạnh tranh, release, chuyển trạng thái và CRUD manager.
- Test frontend cho hiển thị menu theo permission, tạo ticket, danh sách/chi tiết, claim/release và xử lý lỗi 401/403/409.
- Chạy formatter, lint, typecheck và test của cả backend/dashboard; cập nhật README/API contract nếu endpoint thay đổi.

## Nhiệm vụ thực hiện

1. Chốt state machine (`SOLVED` có cần `CLOSED` hay không) và mô hình phản hồi.
2. Hoàn thiện schema/migration/repository/service/controller cùng guard và Swagger.
3. Xây dựng API client, route và màn hình Ticket ở dashboard.
4. Thêm test, seed và chạy toàn bộ kiểm tra chất lượng.
