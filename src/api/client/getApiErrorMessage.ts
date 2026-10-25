const errorMessages: Record<string, string> = {
  STICKER_BUSY: 'Máy chủ đang tạo sticker khác. Vui lòng thử lại sau ít giây.',
  OBJECT_SELECTION_EXPIRED_OR_INVALID:
    'Lượt chọn vật đã hết hạn hoặc không hợp lệ. Hãy quét lại ảnh.',
  STICKER_MODEL_NOT_CONFIGURED:
    'Máy chủ chưa sẵn sàng tạo sticker. Hãy thử lại sau.',
  STICKER_MODEL_INVALID: 'Dịch vụ tạo sticker chưa sẵn sàng. Hãy thử lại sau.',
  STICKER_OBJECT_NOT_CLEAR:
    'Chưa tách rõ được vật thể. Hãy thử ảnh có nền đơn giản hơn.',

  IMAGE_STORAGE_NOT_CONFIGURED:
    'Tính năng lưu ảnh chưa được thiết lập trên máy chủ.',
  IMAGE_STORAGE_UNAVAILABLE: 'Chưa kết nối được kho ảnh. Vui lòng thử lại.',
  IMAGE_PIXEL_LIMIT_EXCEEDED:
    'Ảnh có độ phân giải quá lớn. Hãy chọn ảnh nhỏ hơn.',
  INVALID_CROP_BOX: 'Vùng cắt ảnh không hợp lệ. Hãy chọn lại ảnh.',
  IMAGE_UPDATE_UNCERTAIN:
    'Chưa xác nhận được cập nhật ảnh. Hãy tải lại thẻ trước khi thử lại.',
  IMAGE_UPDATE_CONFLICT: 'Ảnh vừa được cập nhật ở nơi khác. Hãy tải lại thẻ.',
  IMAGE_NOT_AVAILABLE: 'Thẻ này chưa có ảnh hoặc ảnh không còn tồn tại.',
  AUDIO_NOT_AVAILABLE: 'Từ này chưa có âm thanh. Vui lòng thử lại sau.',
  FLASHCARD_NOT_FOUND: 'Không tìm thấy thẻ từ trong tài khoản của bạn.',
  INVALID_CREDENTIALS: 'Username hoặc mật khẩu không đúng.',
  USERNAME_ALREADY_REGISTERED:
    'Username này đã được sử dụng. Hãy chọn tên khác.',
  GOOGLE_AUTH_NOT_CONFIGURED:
    'Đăng nhập Google chưa được thiết lập. Bạn có thể dùng username.',
  GOOGLE_AUTH_UNAVAILABLE: 'Google đang tạm gián đoạn. Vui lòng thử lại.',
  GOOGLE_TOKEN_INVALID:
    'Thông tin đăng nhập Google không hợp lệ. Vui lòng thử lại.',
  GOOGLE_ACCOUNT_LINK_REQUIRED:
    'Email này đã có tài khoản. Hãy đăng nhập bằng mật khẩu rồi chọn Liên kết Google trong hồ sơ.',
  GOOGLE_ACCOUNT_ALREADY_LINKED:
    'Tài khoản Google đã được liên kết. Hãy kiểm tra lại tài khoản bạn chọn.',
  GOOGLE_ACCOUNT_CONFLICT: 'Chưa tạo được tài khoản Google. Vui lòng thử lại.',
  EMAIL_ALREADY_REGISTERED: 'Email này đã được đăng ký.',
  USER_INACTIVE: 'Tài khoản đã bị vô hiệu hóa.',
  INVALID_IMAGE_FORMAT: 'Chỉ hỗ trợ ảnh JPG hoặc PNG.',
  INVALID_IMAGE_DATA: 'Dữ liệu ảnh không hợp lệ. Hãy chọn ảnh khác.',
  FILE_EMPTY: 'Ảnh đang trống. Hãy chọn ảnh khác.',
  IMAGE_TOO_LARGE: 'Ảnh vượt quá 5 MB. Hãy chọn ảnh nhỏ hơn.',
  GUEST_SLOW_DOWN: 'Vui lòng đợi 10 giây trước khi quét tiếp.',
  GUEST_QUOTA_EXCEEDED:
    'Đã hết lượt quét thử của khách hôm nay. Đăng nhập để tiếp tục.',
  GUEST_CAP_REACHED:
    'Đã hết lượt quét thử của khách hôm nay. Đăng nhập để tiếp tục.',
  QUOTA_EXCEEDED: 'Bạn đã hết lượt quét hôm nay.',
  MAINTENANCE_MODE: 'Hệ thống đang bảo trì. Vui lòng thử lại sau.',
  DRAFT_EXPIRED: 'Thẻ nháp đã hết hạn. Vui lòng quét lại ảnh.',
  REDIS_CONNECTION_FAILED: 'Dịch vụ tạm thời gián đoạn. Vui lòng thử lại.',
  AWS_VISION_UNAVAILABLE: 'Dịch vụ nhận diện ảnh đang bận. Vui lòng thử lại.',
};

export function getApiErrorMessage(status: number, detail: unknown) {
  if (typeof detail === 'string' && errorMessages[detail]) {
    return errorMessages[detail];
  }

  if (
    typeof detail === 'object' &&
    detail !== null &&
    'message' in detail &&
    typeof detail.message === 'string'
  ) {
    return detail.message;
  }

  if (status === 401) {
    return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
  }
  if (status === 413) {
    return errorMessages.IMAGE_TOO_LARGE;
  }
  if (status === 429) {
    return errorMessages.GUEST_QUOTA_EXCEEDED;
  }
  if (typeof detail === 'string' && !detail.includes('_')) {
    return detail;
  }

  return 'Yêu cầu chưa thực hiện được. Vui lòng thử lại.';
}
