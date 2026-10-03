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
