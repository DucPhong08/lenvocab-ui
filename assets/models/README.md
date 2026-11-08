# Model nhận diện thử nghiệm

`efficientdet-lite0.tflite` là file cục bộ, không commit. Chạy `python3 scripts/download_offline_model.py` từ gốc project để tải đúng nguồn/checksum trong `manifest.json`.

Model và runtime chỉ đi vào APK khi build với `-PofflineScan=true`. App thường không mang model. `labels.txt` giữ nguyên chỉ số 90 slot từ model, gồm 80 nhãn; không xóa các dòng `???`. `labels.vi.json` là bản nghĩa tiếng Việt biên soạn cho 80 nhãn.

Đọc `docs/OFFLINE_SCAN_EXPERIMENT.md` về cách chạy, giới hạn, nguồn và điều kiện trước khi phát hành. Chưa xác nhận tốc độ trên điện thoại thật hay iOS.
