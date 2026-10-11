const errorMessages: Record<string, string> = {
  INVALID_CREDENTIALS: 'Email hoặc mật khẩu không đúng.',
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
