# LenVocab Mobile

Ứng dụng React Native giúp học từ vựng tiếng Anh từ hình ảnh thực tế.

## Tính năng

- Chụp ảnh hoặc chọn ảnh từ thư viện để nhận diện từ vựng bằng AI.
- Đăng nhập, đăng ký và lưu phiên an toàn bằng Keychain.
- Lưu flashcard, ôn tập theo lịch và làm quiz.
- Khám phá dữ liệu mẫu khi chưa đăng nhập.
- Xem lại lịch sử quét trong phiên hiện tại.

## Yêu cầu

- Node.js `>= 22.11.0`
- Android Studio để chạy Android
- macOS và Xcode để chạy iOS

## Cài đặt

```bash
npm ci
```

Riêng iOS, cài CocoaPods sau khi dependencies thay đổi:

```bash
bundle install
cd ios && bundle exec pod install && cd ..
```

## Chạy ứng dụng

Khởi động Metro:

```bash
npm start
```

Sau đó chạy ứng dụng trên nền tảng mong muốn:

```bash
npm run android
npm run ios
```

## Kiểm tra code

```bash
npx tsc --noEmit
npm run lint
npm test -- --runInBand
```

## Cấu trúc chính

```text
src/
├── api/
│   ├── client/      # HTTP client, config và chuẩn hóa lỗi
│   ├── endpoints/   # Các hàm gọi backend
│   └── mappers/     # Chuyển API response sang domain model
├── app/             # App shell và điều hướng màn hình
├── components/      # Component dùng chung
├── data/            # Dữ liệu mẫu và selector
├── hooks/           # Hook dùng chung
├── screens/         # Màn hình theo feature
├── theme/           # Màu sắc, shadow và image mapping
└── types/           # Type dùng chung
```

Import nội bộ sử dụng alias `@/`, ví dụ:

```ts
import { getMe } from '@/api/endpoints/getMe';
```

Backend mặc định được cấu hình tại `src/api/client/config.ts`.

## Hợp đồng MVP với backend

- Mỗi lượt quét tạo một thẻ chính; các nhãn phụ không phải các thẻ có thể chọn/lưu.
- Kho từ dùng `GET /flashcards/page?limit=30&offset=0`, có nút tải thêm và lấy tổng số từ từ server. Tìm kiếm/bộ lọc tải tiếp các trang còn lại theo yêu cầu.
- Danh sách và hàng đợi ôn không chứa âm thanh. Khi bấm loa, app gọi `GET /flashcards/{user_flashcard_id}/audio`; kết quả scan có sẵn audio thì phát trực tiếp.
- Một giọng đọc chung theo backend. Tốc độ 0.75x / 1x / 1.25x được lưu qua preferences và áp dụng ở native audio player.
- Cần triển khai backend có hai endpoint mới trước bản UI này. Kiểm thử Jest dùng mock; vẫn cần chạy luồng quét/lưu/phát âm/đổi tốc độ trên thiết bị thật.
