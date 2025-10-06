# Test SignalR Connection

## Cách test chức năng chat real-time:

### 1. Mở ứng dụng
- Truy cập: `http://localhost:5000` hoặc `https://localhost:5001`

### 2. Đăng ký 2 tài khoản
- Tạo tài khoản User 1: `user1@test.com` / `password123`
- Tạo tài khoản User 2: `user2@test.com` / `password123`

### 3. Test chat real-time
- Mở 2 tab browser khác nhau
- Đăng nhập với 2 tài khoản khác nhau
- Chọn user từ danh sách để bắt đầu chat
- Gửi tin nhắn và kiểm tra real-time

### 4. Kiểm tra Console
- Mở Developer Tools (F12)
- Xem tab Console để kiểm tra:
  - "SignalR connected successfully" - Kết nối thành công
  - Các lỗi nếu có

### 5. Test các tính năng
- ✅ Gửi tin nhắn text
- ✅ Gửi file đính kèm
- ✅ Trạng thái Online/Offline
- ✅ Lịch sử chat

## Troubleshooting

### Nếu SignalR không kết nối:
1. Kiểm tra Console có lỗi gì không
2. Đảm bảo ứng dụng đang chạy
3. Kiểm tra firewall/antivirus
4. Thử refresh trang

### Nếu không thấy user khác:
1. Đảm bảo đã đăng ký ít nhất 2 tài khoản
2. Kiểm tra database có dữ liệu không
3. Refresh trang

### Nếu tin nhắn không gửi được:
1. Kiểm tra Console có lỗi JavaScript không
2. Kiểm tra network tab trong DevTools
3. Đảm bảo đã chọn user để chat
