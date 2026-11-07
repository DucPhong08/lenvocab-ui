> **BẢN NHÁP CHƯA XÁC MINH — KHÔNG PHÁT HÀNH.** Người dùng đã tạm hoãn phần pháp lý. Chưa có thông tin đơn vị vận hành hay liên hệ được xác nhận. Nội dung bên dưới còn cần đối chiếu, đặc biệt các mô tả mã hóa bộ nhớ offline và xóa tài khoản chưa đúng chức năng hiện tại.

# CHÍNH SÁCH BẢO MẬT (PRIVACY POLICY) - LENVOCAB

**Ngày có hiệu lực (Effective Date):** Chưa có — bản nháp
**Ứng dụng:** LenVocab (Mã gói: `com.lenvocab.app`)
**Đơn vị phát triển:** Chưa xác nhận
**Email liên hệ:** [email chưa cung cấp] (hoặc [email chưa cung cấp])

---

LenVocab ("chúng tôi", "ứng dụng") cam kết bảo vệ quyền riêng tư và dữ liệu cá nhân của người dùng ("bạn"). Chính sách bảo mật này giải thích cách chúng tôi thu thập, sử dụng, lưu trữ, xử lý và bảo vệ thông tin khi bạn sử dụng ứng dụng di động LenVocab trên các nền tảng (Android và iOS).

Khi cài đặt và sử dụng LenVocab, bạn đồng ý với các điều khoản được quy định trong Chính sách bảo mật này.

---

## 1. Dữ liệu chúng tôi thu thập

LenVocab chỉ thu thập những thông tin tối thiểu cần thiết để phục vụ trải nghiệm học tập từ vựng qua hình ảnh:

### 1.1. Quyền truy cập thiết bị & Dữ liệu đa phương tiện (Camera & Photos)

- **Camera (`android.permission.CAMERA` / `NSCameraUsageDescription`):**
  - **Mục đích:** Cho phép bạn chụp ảnh trực tiếp các đồ vật, bối cảnh xung quanh để hệ thống nhận diện và gợi ý từ vựng tiếng Anh tương ứng.
  - **Cơ chế xử lý:** Ảnh chụp chỉ được truyền mã hóa an toàn qua HTTPS tới dịch vụ nhận diện (AI Vision) để trích xuất nhãn từ vựng và bounding box đồ vật. Chúng tôi **không** sử dụng camera ở chế độ nền và **không** ghi hình lén.
- **Thư viện ảnh (`READ_MEDIA_IMAGES` / `NSPhotoLibraryUsageDescription`):**
  - **Mục đích:** Cho phép bạn chọn ảnh có sẵn từ bộ nhớ thiết bị để quét nhận diện từ vựng hoặc đặt ảnh đại diện tài khoản.
  - Ứng dụng chỉ đọc bức ảnh mà bạn chủ động chọn, không quét toàn bộ thư viện ảnh của thiết bị.

### 1.2. Thông tin tài khoản người dùng

- Khi đăng nhập qua **Google Sign-In** hoặc tài khoản ứng dụng:
  - Họ tên hiển thị, địa chỉ email, ảnh đại diện công khai (avatar URL).
  - Mã định danh tài khoản duy nhất (User ID).
- Mật khẩu (nếu dùng tài khoản riêng) được mã hóa một chiều (băm - hash) an toàn, không thể đọc ngược.
- Mã truy cập (Auth Tokens) được lưu trữ an toàn trong phần cứng thiết bị bằng **Keychain** (trên iOS) hoặc **Keystore** (trên Android).

### 1.3. Tiến độ học tập & Dữ liệu đồng bộ

- Lịch sử quét đồ vật và từ vựng đã lưu.
- Tiến độ ôn tập: Flashcard, điểm số Quiz, số ngày học liên tục (Streak), cảnh học (Scenes).
- Bộ nhớ đệm học tập ngoại tuyến (Offline Learning Cache) được lưu cục bộ trên bộ nhớ máy bằng cơ chế mã hóa.

### 1.4. Thông báo đẩy (`POST_NOTIFICATIONS`)

- Với sự đồng ý của bạn, chúng tôi gửi lời nhắc học từ vựng hàng ngày hoặc thông báo nhắc ôn tập theo phương pháp lặp lại ngắt quãng (Spaced Repetition). Bạn có thể bật/tắt quyền này bất kỳ lúc nào trong Cài đặt hệ thống.

### 1.5. Dữ liệu kỹ thuật & Chẩn đoán lỗi

- Thông tin phiên bản hệ điều hành (Android/iOS), phiên bản ứng dụng, nhật ký lỗi kỹ thuật (Crash logs) để nâng cao độ ổn định. Chúng tôi **không** thu thập vị trí GPS chính xác hay thông tin nhạy cảm ngoài phạm vi giáo dục.

---

## 2. Cam kết về Dữ liệu Nhận diện Khuôn mặt & Sinh trắc học

- LenVocab là ứng dụng nhận diện **đồ vật, sự vật, bối cảnh** nhằm mục đích học từ vựng.
- Ứng dụng **hoàn toàn không** thu thập, phân tích, trích xuất hay lưu trữ bất kỳ dữ liệu sinh trắc học (Biometric Data) hoặc nhận diện khuôn mặt (Facial Recognition) nào của người dùng.

---

## 3. Cách chúng tôi sử dụng thông tin

Dữ liệu thu thập được sử dụng riêng cho các mục đích:

1. Cung cấp tính năng cốt lõi: Nhận diện vật thể trong ảnh và trả về từ vựng, phiên âm, ví dụ.
2. Quản lý tài khoản, đồng bộ hóa tiến độ học giữa các thiết bị hoặc khi chuyển đổi giữa chế độ Online và Offline.
3. Cá nhân hóa lộ trình ôn tập dựa trên các từ bạn thường xuyên nhớ hoặc quên.
4. Gửi thông báo nhắc nhở học tập (nếu được cấp phép).
5. Duy trì an ninh, ngăn chặn các hành vi gian lận hoặc phá hoại dịch vụ.

---

## 4. Chia sẻ và Tiết lộ Dữ liệu

Chúng tôi **không bán, không cho thuê, không chia sẻ** dữ liệu cá nhân hay hình ảnh của bạn cho các bên thứ ba vì mục đích quảng cáo hoặc tiếp thị. Dữ liệu chỉ được chia sẻ trong các trường hợp giới hạn sau:

- **Nhà cung cấp hạ tầng dịch vụ (Service Providers):** Máy chủ đám mây lưu trữ dữ liệu an toàn và dịch vụ xử lý AI phục vụ việc nhận diện từ vựng. Tất cả các đối tác này đều chịu ràng buộc bảo mật nghiêm ngặt.
- **Yêu cầu pháp lý:** Khi có yêu cầu hợp pháp từ cơ quan nhà nước có thẩm quyền theo quy định của pháp luật.

---

## 5. Lưu trữ và Bảo mật Dữ liệu

- Mọi thông tin truyền tải giữa ứng dụng LenVocab và máy chủ đều được mã hóa bằng giao thức bảo mật chuẩn công nghiệp **TLS/HTTPS**.
- Dữ liệu nhạy cảm trên máy được bảo vệ bằng hệ thống Keystore / Keychain gốc của hệ điều hành.
- Dữ liệu hình ảnh tải lên để nhận diện chỉ được lưu trữ tạm thời trong phiên làm việc hoặc lưu trữ trong lịch sử học tập cá nhân nếu bạn chủ động lưu từ đó vào bộ sưu tập.

---

## 6. Quyền của Người dùng & Xóa Dữ liệu (User Rights & Data Deletion)

Theo chính sách của Apple App Store và Google Play, bạn có toàn quyền kiểm soát dữ liệu của mình:

1. **Xem và chỉnh sửa:** Bạn có thể xem và chỉnh sửa thông tin cá nhân trong mục Hồ sơ (Profile/Account).
2. **Hủy cấp quyền thiết bị:** Bạn có thể thu hồi quyền Camera, Ảnh hoặc Thông báo bất cứ lúc nào trong Cài đặt thiết bị (Settings -> Applications -> LenVocab).
3. **Yêu cầu Xóa Tài khoản & Dữ liệu (Account & Data Deletion Request):**
   - Bạn có thể yêu cầu xóa tài khoản trực tiếp ngay trong ứng dụng qua mục **Cài đặt > Xóa tài khoản**, hoặc:
   - Gửi email yêu cầu xóa dữ liệu tới: **[email chưa cung cấp]** với tiêu đề `[Yêu cầu xóa tài khoản LenVocab]`.
   - Khi tài khoản bị xóa, toàn bộ dữ liệu cá nhân, lịch sử quét và tiến độ học tập liên kết với bạn trên hệ thống máy chủ sẽ được xóa vĩnh viễn hoặc ẩn danh hóa không thể phục hồi trong vòng 30 ngày.

---

## 7. Quyền riêng tư của Trẻ em

LenVocab là ứng dụng giáo dục an toàn cho mọi lứa tuổi. Tuy nhiên, chúng tôi không cố ý thu thập thông tin nhận dạng cá nhân từ trẻ em dưới 13 tuổi (hoặc độ tuổi tối thiểu theo luật định tại quốc gia của bạn) mà không có sự đồng ý của cha mẹ hoặc người giám hộ. Nếu phát hiện trường hợp vô tình thu thập dữ liệu trẻ em chưa được cho phép, chúng tôi sẽ tiến hành xóa ngay lập tức.

---

## 8. Thay đổi Chính sách Bảo mật

Chúng tôi có thể cập nhật Chính sách bảo mật này theo thời gian để phản ánh các cải tiến tính năng hoặc yêu cầu pháp lý mới. Mọi thay đổi quan trọng sẽ được thông báo trực tiếp trong ứng dụng hoặc cập nhật ngày có hiệu lực ở đầu văn bản.

---

## 9. Thông tin liên hệ

Nếu bạn có bất kỳ câu hỏi, thắc mắc hoặc khiếu nại nào liên quan đến Chính sách bảo mật này hoặc việc xử lý dữ liệu của LenVocab, vui lòng liên hệ:

- **LenVocab Privacy Team**
- **Email:** [email chưa cung cấp]
- **Website / Hỗ trợ:** [website chưa cung cấp]/support
