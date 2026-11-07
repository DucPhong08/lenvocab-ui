# Quy ước UI LenVocab

Đối tượng: người Việt A2–B2, học và dùng lại từ trong các lượt ngắn.

- Mỗi màn có một hành động chính. Dùng `PrimaryButton` cho hành động đó; thao tác phụ dùng `secondary`.
- Nền đọc dùng `surface`; lượt ôn dùng `primaryTint`; sticker dùng `stickerTint`. `accentTint`/`accentText` dành cho lời mời chụp ảnh, không biểu thị đúng/sai.
- Giá trị màu gốc ở `src/theme/palette.ts`, cỡ chữ ở `src/theme/typography.ts`. Component lấy `styles`, `colors`, `font` bằng một hook `useStyles()`: `primary` cho hành động/lựa chọn, `primaryTint` cho nền nhấn nhẹ, `highlight` cho điểm nhấn nhỏ.
- `success`/`error` biểu thị kết quả, luôn đi cùng chữ hoặc icon. Không dùng chúng làm màu thương hiệu.
- Chữ/icon trên nền sáng dùng `primaryText`; chữ trên nút màu dùng `onPrimary`. Lớp đè ảnh dùng `overlay`/`onOverlay`. Sticker có nền `stickerTint` để thấy viền trắng.
- Nội dung dùng font hệ thống; tiêu đề dùng `font.display` (Quicksand Bold, OFL). Font nằm trong `assets/native/fonts` (`Quicksand_bold.ttf` để Android ánh xạ đúng độ đậm), Android và iOS đã khai báo; cần build lại native để nhận font. Nhãn phụ từ 12px, giữ dấu tiếng Việt và kiểm tra cỡ chữ lớn.
- Giữ vùng chạm tối thiểu 44px, khoảng thở rõ và nội dung có thể cuộn khi màn nhỏ.
- Tận dụng component hiện có; chỉ tách phần lặp thực tế. Tránh component tổng quát có nhiều cờ điều kiện.
- Giữ callback, trạng thái tải/lỗi và các chốt chống thao tác trùng khi tinh gọn code.
- Trước khi bàn giao: TypeScript, lint, test liên quan và xem app thật. Kiểm tra cả nền sáng, trạng thái chọn, vô hiệu hóa và đúng/sai.

Bảng màu là lựa chọn thiết kế hiện tại, cần tiếp tục kiểm chứng với người học; không phải chuẩn màu theo quốc tịch.


## Base và override

App bọc trong `ThemeProvider`. Mặc định kế thừa giao diện hiện tại; cấu hình user ghi đè màu nhấn/cỡ chữ, sau cùng component có thể ghi đè style riêng.

```tsx
const { setTheme, resetTheme } = useTheme();
setTheme({ primary: '#7C3AED', fontScale: 1.1 });
resetTheme();

const useStyles = createStyles(({ colors, font }) => ({
  title: { ...font.heading, color: colors.text },
}));
// Trong component: const { styles, colors, font } = useStyles();
<PrimaryButton label="Học tiếp" onPress={next} textStyle={{ fontSize: 17 }} />
```

`setTheme` nhận phần muốn thay đổi; các lựa chọn khác được giữ lại. Màu chữ trên nút/nền sáng và các nền nhấn nhẹ được tính từ màu user chọn. Màu đúng/sai giữ vai trò riêng.

Chữ dùng preset như `font.body`, `font.heading`, `font.label`; muốn khác thì spread preset trước, override sau. `font.size`, `font.line`, `font.weight` dành cho trường hợp riêng. Style được dùng chung theo theme; đổi theme không remount màn học. `fontScale` nhân cả cỡ chữ và chiều cao dòng; vẫn giữ việc phóng chữ của hệ điều hành.

Hiện tùy chọn chỉ ở bộ nhớ trong phiên app. Màn Settings, lưu trên máy và đồng bộ tài khoản sẽ được nối vào API này sau; chưa thêm thư viện hay đổi backend.

## Nội dung A2–B2

Cảnh mẫu có bộ lọc A2/B1/B2 và cụm từ dùng trong ngữ cảnh. Cấp độ do nội dung mẫu gợi ý, không phải đánh giá CEFR. API thẻ cá nhân/AI chưa trả cấp độ; giữ nhãn hiện có, không tự gán B2 cho thẻ đó. Luồng lưu, phát âm, lịch ôn và Quiz không đổi.
