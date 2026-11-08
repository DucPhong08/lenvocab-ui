# Audio mẫu LenVocab

`../data/vocab-audio.json` chứa 200 đoạn MP3 được mã hóa base64, mỗi khóa khớp `id` trong `vocab-core.json`. `src/data/scenes.ts` gắn đoạn tương ứng vào `Word.audio`; `useAudio` dùng đường phát base64 sẵn có, kể cả khi ngoại tuyến và chưa đăng nhập. Audio chỉ đọc từ/cụm từ tiếng Anh, không đọc ví dụ hay nghĩa tiếng Việt.

Đây là giọng nói tổng hợp bằng AI, không phải bản thu âm của người thật. Nguồn: **Amazon Polly**, giọng **Joanna** (tiếng Anh Mỹ), engine **standard**, MP3 mono **22.050 Hz**, region **ap-southeast-1**. Lần tạo đầu dùng đúng cấu hình Polly của backend hiện có. Chi tiết có thể kiểm tra trong `provenance.json`, gồm thời điểm tạo, cấu hình, số đoạn, tổng dung lượng MP3 và SHA-256 của từng từ/cụm từ nguồn.

Bộ đầu tiên có 200 đoạn, tổng MP3 **859.817 byte**; JSON base64 **1.150.360 byte**. Không có URL ngoài, khóa AWS hay cấu hình tài khoản trong dữ liệu đóng gói. Phát audio mẫu không gọi dịch vụ đám mây. Chất lượng phát âm là kết quả tổng hợp tự động; cần kiểm tra nghe khi thay đổi từ hoặc giọng.

## Tạo lại

Không cần cài thêm gói. Dùng Python trong môi trường backend đã có `boto3` và cấu hình AWS hợp lệ; chạy từ thư mục backend để `app.config.settings` đọc cấu hình như ứng dụng đang chạy:

```sh
cd /path/to/app-LensVocab
.venv/bin/python /path/to/lenvocab-ui/scripts/generate_sample_audio.py \
  --backend-path "$PWD" \
  --cache /tmp/lenvocab-sample-audio-cache.json
```

Script đọc `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `POLLY_VOICE_ID`, `POLLY_ENGINE`, `POLLY_OUTPUT_FORMAT` qua `app.config.settings`. Không sao chép `.env`, không ghi hay in thông tin xác thực. Chỉ gửi 200 `term` công khai trong bộ mẫu đến Amazon Polly; không gửi ảnh hoặc dữ liệu người dùng. Việc tạo lại sử dụng dịch vụ Polly có tính phí của tài khoản đã cấu hình.

Tối đa 3 yêu cầu đồng thời, giới hạn kết nối 5 giây/đọc 20 giây, tắt tự thử lại và không tự đổi engine. Khi có lỗi, script dừng gửi việc mới, lưu các đoạn đã hoàn tất và chỉ in ID cùng mã lỗi an toàn. Kiểm tra nguyên nhân trước khi chạy lại. Cache theo ID, hash từ nguồn, cấu hình giọng/engine và header MP3 giúp tiếp tục phần còn thiếu; file audio đã đóng gói cũng được dùng lại khi khớp provenance. Chỉ ghi bộ dữ liệu cuối khi đủ 200 đoạn hợp lệ.

Thêm `--check` để kiểm tra dữ liệu đã có; chế độ này không gửi yêu cầu tổng hợp. Mỗi lần hoàn thành, chạy kiểm tra tập trung:

```sh
cd /path/to/lenvocab-ui
npm test -- --runInBand __tests__/sample-audio.test.tsx
```

Test kiểm tra đủ 200 ID, base64/MP3 header hợp lệ, audio được gắn vào các scene và phát khi ngoại tuyến bằng tốc độ đã chọn mà không gọi API audio. Test dùng mô phỏng phần phát native; vẫn cần nghe thử trên thiết bị thật để xác nhận âm lượng, phát âm và hành vi phần phát âm thanh.
