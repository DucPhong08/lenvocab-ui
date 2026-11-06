# Quy ước UI LenVocab

Đối tượng: người Việt A2–B1, học và dùng lại từ trong các lượt ngắn.

- Mỗi màn có một hành động chính. Dùng `PrimaryButton` cho hành động đó; thao tác phụ dùng `secondary`.
- Thẻ học dùng `surface`, chữ dùng `text`/`muted`. Không phủ màu thương hiệu lên cả khối nội dung.
- Màu lấy từ `src/theme/theme.ts`: `primary` cho hành động/lựa chọn, `primaryTint` cho nền nhấn nhẹ, `highlight` cho điểm nhấn nhỏ.
- `success`/`error` biểu thị kết quả, luôn đi cùng chữ hoặc icon. Không dùng chúng làm màu thương hiệu.
- Chữ trên nền đậm dùng `onPrimary`; lớp đè ảnh dùng `overlay`. Sticker có nền `surfaceMuted` để thấy viền trắng.
- Giữ font hệ thống hỗ trợ dấu tiếng Việt. Nhãn phụ từ 12px, ít giãn chữ; kiểm tra thêm cỡ chữ lớn.
- Giữ vùng chạm tối thiểu 44px, khoảng thở rõ và nội dung có thể cuộn khi màn nhỏ.
- Tận dụng component hiện có; chỉ tách phần lặp thực tế. Tránh component tổng quát có nhiều cờ điều kiện.
- Giữ callback, trạng thái tải/lỗi và các chốt chống thao tác trùng khi tinh gọn code.
- Trước khi bàn giao: TypeScript, lint, test liên quan và xem app thật. Kiểm tra cả nền sáng, trạng thái chọn, vô hiệu hóa và đúng/sai.

Bảng màu là lựa chọn thiết kế hiện tại, cần tiếp tục kiểm chứng với người học; không phải chuẩn màu theo quốc tịch.
