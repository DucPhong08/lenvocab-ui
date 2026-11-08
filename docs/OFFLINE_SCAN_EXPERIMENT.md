# Thử nghiệm quét ảnh offline trên Android

## Cách chạy

```sh
python3 scripts/download_offline_model.py
cd android
./gradlew :app:assembleDebug -PofflineScan=true
```

Cần Android SDK như khi build app trước đây. Muốn thử chế độ máy bay ngay từ lúc mở app, build `assembleRelease` cùng cờ `-PofflineScan=true`; bản này có sẵn JS và model, không cần Metro. Đây là bản nội bộ dùng cấu hình ký hiện có, không phải gói phát hành cửa hàng.

Trong bản thử: `Quét ảnh → Thử quét offline → Chọn ảnh từ máy / Chụp ảnh → Nhận diện trên máy`.

Bỏ cờ `offlineScan` hoặc đặt `-PofflineScan=false` để build app thường. Khi đó Gradle không lấy LiteRT, không đóng gói `.tflite`, và không có nút thử offline. Luồng Cloud, hạn mức quét và API backend giữ nguyên.

## Model và runtime

- EfficientDet-Lite0 detection metadata v1, nguồn từ [mẫu Android chính thức TensorFlow](https://github.com/tensorflow/examples/blob/master/lite/examples/object_detection/android/app/download_models.gradle).
- File 4.563.519 byte; SHA-256 `2e04c53bfeac0ac2a30c057c7e2a777594ce39baaac35a92f74fb1e8c4fc4e0b`.
- Ảnh vào RGB uint8 320×320; biến thể có hậu xử lý NMS sẵn, trả boxes/classes/scores/count. Không dùng biến thể MediaPipe raw-head với cùng tên gần giống.
- LiteRT `com.google.ai.edge.litert:litert:1.4.2`, Interpreter CPU 2 luồng; nhánh Interpreter vẫn được Google liệt kê hỗ trợ, phù hợp Android minSdk 24 hiện tại. Không thêm npm package, GPU delegate hoặc Play Services model download.
- 80 nhóm vật COCO, bảng 90 dòng gồm slot `???` không dùng. Giữ nguyên chỉ số lớp trong `labels.txt`; `labels.vi.json` chỉ thêm nghĩa ngắn, không thay lớp của model.
- Số vật và ngưỡng tin cậy lấy từ `scan_settings` trong `/auth/me` / `/users/me/preferences`. Backend tính `min(tùy chọn user, trần admin)`; phạm vi hợp đồng hiện tại 1–10 vật. Native chấp nhận đủ phạm vi này, không còn chặn cứng 5.
- Tái sử dụng cấu hình đã đồng bộ trong bộ nhớ offline theo phiên. Khi mất mạng không thể biết admin vừa đổi gì; app ghi rõ đang dùng bản đồng bộ gần nhất. Khách hoặc backend cũ chưa trả `scan_settings` dùng mặc định 5 vật/0,5 và có thông báo, không coi đó là cấu hình đã đồng bộ.
- Mô tả và xử lý dùng cùng cấu hình; đổi user/setting sẽ bỏ kết quả nhận diện cũ. Nghĩa tiếng Việt đi theo `preferences.target_language` (bản thử chỉ có nhãn Anh và nghĩa Việt).
- 80 nhóm vật thuộc khả năng model, không đổi theo tài khoản. Điểm model không phải phần trăm bảo đảm nhận diện đúng.

File model được tải và xác minh lúc chuẩn bị build, **không tải trong app**. Model chưa commit; nguồn, số byte và checksum nằm trong `assets/models/manifest.json`. Runtime có giấy phép Apache-2.0 trong Maven POM. Model lấy từ bản mẫu TensorFlow chính thức; cần xác nhận điều kiện tái phân phối đúng file weights trước khi xuất bản công khai. Bản thử này chỉ dùng nội bộ.

## Phạm vi và giới hạn

- Chạy trên ảnh tĩnh JPG/PNG từ máy, kể cả khi không đăng nhập. Không gửi ảnh, nhãn hay dữ liệu tài khoản lên Cloud; adapter từ chối URI HTTP/data.
- Giới hạn ảnh nén 5 MB cả ở JS và native; decode giảm kích thước, xử lý EXIF xoay/lật và letterbox trước khi inference. Đổi hộp từ tọa độ model về ảnh đã định hướng.
- Chạy trên worker riêng. Chặn bấm trùng, đóng Interpreter và Bitmap sau mỗi lần; bỏ phản hồi cũ nếu đổi ảnh/rời màn. Không có service, timer hoặc live-camera chạy nền.
- Model không nhận được mọi đồ vật, đặc biệt vật nhỏ, chồng lấp, thiếu sáng và các từ trừu tượng. Không tự biến nhãn `cup` thành từ cụ thể hơn như `mug`.
- Chưa có tách nền, viền sticker, sinh câu ví dụ, lưu thẻ offline hoặc đồng bộ kết quả scan. Kết quả chỉ là hộp, nhãn và nghĩa ngắn biên soạn sẵn.
- Chưa triển khai native iOS; chưa kiểm tra trên điện thoại Android thật. Đo trên giả lập không đại diện tốc độ trên điện thoại.

## Kiểm chứng ngày 08/11/2026

- Build thành công bản thử release cho ARM64 và x86_64, có JS/model sẵn trong APK. Đã chạy trên Android giả lập API 34, x86_64.
- Bật chế độ máy bay, tắt Wi-Fi/dữ liệu và xác nhận `Active default network: none` trước cold start; không có Metro hoặc API demo.
- Ảnh đường phố: 5 hộp (xe đạp, đèn giao thông, 3 người). Ảnh bàn học: 1 sách, vẫn bỏ sót các vật khác. Ảnh đen trống: 0 vật và hiển thị hướng dẫn thử lại.
- Các lần xử lý ghi nhận khoảng 66–120 ms trên giả lập. Đây không phải benchmark p50/p95 hoặc độ trễ trên điện thoại. Bộ ảnh ít, chưa có tập ground truth để công bố độ chính xác.
- 8 kiểm thử mới qua, gồm giới hạn đầu vào, không gọi fetch và đổi ảnh khi kết quả chưa về. Kiểm tra handle của riêng các test này không để lại timer/handle.
- Lần chạy toàn bộ gần nhất: 176 tests qua; TypeScript qua; lint các file offline qua. Lint toàn project còn 3 tham số chưa dùng trong `__tests__/sfx.test.ts` thuộc thay đổi âm thanh đang làm song song, được giữ nguyên.
- Build debug với `offlineScan=false` thành công; kiểm tra ZIP APK xác nhận không có `.tflite` hay `libtensorflowlite_jni.so`. APK thử và ELF LiteRT ARM64/x86_64 đạt kiểm tra alignment 16 KB.

Trước khi đưa vào bản phát hành: xác nhận quyền tái phân phối weights, kiểm chứng trên điện thoại thật (gồm ảnh xoay/thiếu sáng/vật nhỏ) và bộ ảnh có nhãn chuẩn. Chưa có bằng chứng để thay thế Cloud cho mọi trường hợp.


## Cài đặt tài khoản và backend

Backend mới bổ sung `scan_settings` và `preference_limits` vào `/auth/me`; các trường cũ không đổi. Cần cập nhật backend rồi đồng bộ tài khoản để nhận cấu hình mới. Không thêm dependency hay migration dữ liệu.

Màn Cá nhân dùng một thành phần chọn chung cho số vật mỗi ảnh, tốc độ đọc theo `allowed_speeds`, và mục tiêu ôn theo `max_daily_review_goal`. Mục tiêu và số thực tế áp dụng được hiển thị riêng: hàng đợi còn chịu trần ôn theo gói do admin đặt. Giọng mặc định hiện được backend cố định theo cấu hình Polly; chưa có tùy chọn model/provider hay ngưỡng tin cậy riêng của user. Quota Cloud, bảo trì và ngưỡng semantic cache vẫn do backend quản lý, không đưa thành quyền chỉnh của user.
