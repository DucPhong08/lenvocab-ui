# Dữ liệu và học offline

## Bộ từ đóng gói

- `assets/data/topics.json`: 10 chủ đề.
- `assets/data/vocab-core.json`: 200 từ/cụm mẫu, 20 mục/chủ đề; giữ 98 ID cũ.
- `src/data/scenes.ts`: adapter giữ nguyên import `scenes`, `allWords`, `Word`, `Scene`.
- Mức CEFR và IPA là nội dung tham khảo; 102 mục bổ sung được đánh dấu `editorial-draft`, chưa được chuyên gia duyệt. Không quảng cáo là từ điển chuẩn hóa hay lộ trình được chứng nhận.
- Bộ từ mẫu, Flashcard và Quiz mẫu dùng được khi không có mạng. Mỗi lượt tối đa 10 từ; câu điền từ chỉ được thêm khi ví dụ phù hợp.

## Thẻ cá nhân

Sau khi đăng nhập và tải kho từ, app lưu **nội dung chữ** của các trang đã tải và danh sách đến hạn. Không tự tải toàn bộ kho: tối đa 2.000 thẻ trong bản lưu, còn tổng số thẻ vẫn do máy chủ cung cấp. Ảnh, âm thanh, nhận diện và thay đổi tài khoản cần mạng.

`Cá nhân → Học không cần mạng` hiển thị số thẻ có trên máy, thời điểm tải và các lượt ôn chưa gửi. App dùng bản lưu khi các yêu cầu tải dữ liệu thất bại; không dùng bản lưu để vượt lỗi xác thực 401/403.

Luồng điểm ôn:

1. Tạo `review_id` khi người học chọn mức nhớ.
2. Ghi điểm vào bộ nhớ máy trước khi chuyển thẻ. Ghi thất bại thì giữ thẻ hiện tại.
3. Gửi cùng `review_id`, card và quality đến API hiện có. Lỗi mạng/429/5xx giữ bản chờ; không tính lịch SM-2 trên điện thoại.
4. Khi API xác nhận, lưu lịch do máy chủ trả về và bỏ bản chờ trong cùng một lần ghi. Retry sau mất phản hồi dùng lại ID nên backend không tính lần ôn thứ hai.
5. Lỗi 4xx khác được giữ và hiển thị để thử lại hoặc bỏ từng bản chờ. Không chặn các lượt khác.

Tự thử lại mỗi 30 giây **chỉ khi app đang hoạt động và còn lượt chờ**. Khi về nền hoặc rời phiên, timer dừng. Có nút đồng bộ thủ công. Nếu gửi điểm sau nhiều ngày, lịch tiếp theo được tính theo ngày máy chủ nhận điểm, đúng hành vi API hiện có.

## Lưu trữ và phiên đăng nhập

- JWT chỉ nằm trong Keychain/Keystore như trước. Username của mục Keychain chứa mã phiên offline ngẫu nhiên, không dùng username tài khoản làm tên file.
- JSON nằm trong vùng riêng của ứng dụng; không mã hóa riêng ở tầng app. Không ghi JWT, email, audio payload hoặc link ảnh có chữ ký vào JSON.
- Mỗi phiên có hai bản ghi luân phiên và số revision; file mới hỏng có thể quay về bản hoàn chỉnh trước. Đây không phải bảo đảm chống hỏng/mất dữ liệu tuyệt đối.
- Tối đa 500 lượt chờ; đầy thì yêu cầu đồng bộ trước khi học tiếp.
- Đăng xuất xóa bản lưu của phiên. Có xác nhận nếu còn lượt chờ. Phiên đã đóng không được tạo lại bởi phản hồi đến muộn.
- Chưa giải quyết việc khôi phục thẻ bị mất khi gỡ app, hỏng cả hai bản ghi hoặc đổi điện thoại khi chưa đồng bộ.

## Chuỗi giao diện và tài nguyên

Chuỗi dùng chung và luồng offline nằm trong `assets/locales/vi.json`, qua adapter có kiểu tại `src/i18n/vi.ts`. Đây chưa phải cam kết toàn bộ màn hình đã dịch đủ tiếng Anh. Không thêm package mới cho việc này.

Phần chính sách riêng tư, thông tin người vận hành và xóa tài khoản được người dùng tạm hoãn. Các file pháp lý nháp chưa được phép dùng làm chính sách phát hành.

## Đánh giá AI trên thiết bị — chưa tích hợp

Đối chiếu tĩnh ngày 07/11/2026: 430 nhãn trong [danh mục chính thức ML Kit](https://developers.google.com/ml-kit/vision/image-labeling/label-map) khớp chuỗi chính xác với 9/200 từ mẫu. Đây chỉ là kiểm tra từ vựng nhãn, **không phải độ chính xác nhận diện**; không tính từ đồng nghĩa và nhiều mục học là động từ/cụm từ.

[Object detection mặc định](https://developers.google.com/ml-kit/vision/object-detection/android) trả hộp và tối đa 5 vật, nhưng phân loại chỉ ở nhóm rộng. [Image labeling](https://developers.google.com/ml-kit/vision/image-labeling/android) có thể đóng gói model, tăng khoảng 5,7 MB theo Google; nhãn toàn ảnh không đủ để gắn chính xác tên vào từng hộp. [Subject segmentation](https://developers.google.com/ml-kit/vision/subject-segmentation/android) là API khác, beta và cần tải model.

Vì vậy chưa đưa model hay runtime không dùng vào bản chính. Nhận diện cloud hiện tại được giữ nguyên. Chưa chạy inference hoặc đo độ trễ trên điện thoại; không cam kết offline lần đầu, cắt nền chuẩn hoặc tốc độ gần 0.

Bước thử nghiệm tiếp theo cần một bản Android riêng: bộ ảnh có nhãn chuẩn gồm đơn vật/nhiều vật/nền rối, ánh xạ nhãn có kiểm tra, chế độ máy bay sau cài mới, đo độ chính xác vật/nhãn, độ trễ p50/p95 và kích thước APK. Chỉ tích hợp sau khi chốt model, giấy phép và kết quả trên điện thoại thật. Video hướng dẫn để sau khi có nhu cầu đã kiểm chứng.
