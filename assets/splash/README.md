# Splash Screen Assets (Màn hình khởi động)

Thư mục này chứa tài nguyên hình ảnh gốc dùng cho màn hình khởi động (Splash / Launch Screen) của ứng dụng LenVocab trên cả hai nền tảng Android và iOS.

---

### Danh mục tệp:
1. `splash-logo.svg`: Biểu tượng vector gốc của LenVocab (ống kính máy ảnh trên nền tím nhạt `#EDE7FF`, viền `#5A35C5`).
2. `splash-logo.png`: Ảnh PNG độ phân giải cao 512x512 (trong suốt).

---

### Ánh xạ sang cấu hình Native:
* **Android:** 
  * Định nghĩa màn hình: `android/app/src/main/res/drawable/launch_screen.xml`
  * Vector biểu tượng trung tâm: `android/app/src/main/res/drawable/launch_mark.xml`
  * Kiểu giao diện: `android/app/src/main/res/values/styles.xml` (`LaunchTheme`)
* **iOS:**
  * Giao diện khởi động: `ios/LenVocab/LaunchScreen.storyboard`
  * Tập hợp hình ảnh: `ios/LenVocab/Images.xcassets/LaunchMark.imageset/`
