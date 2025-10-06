# Fix "Failed to invoke SendMessage due to an error on the server"

## 🔧 Đã sửa các vấn đề sau:

### 1. **Added Exception Handling**
- Thêm try-catch trong ChatHub.SendMessage method
- Better error logging với detailed information
- Proper exception throwing để SignalR handle

### 2. **Fixed MySQL Version**
- Cập nhật MySQL server version từ 8.0.21 → 8.0.0
- Tương thích với nhiều version MySQL hơn

### 3. **Enabled Detailed Errors**
- Bật `EnableDetailedErrors = true` trong SignalR
- Hiển thị chi tiết lỗi thay vì generic message

### 4. **Enhanced Logging**
- Log tất cả steps trong SendMessage process
- Track database operations
- Monitor SignalR group operations

## 🚀 Cách test và debug:

### 1. **Chạy ứng dụng**
```bash
cd "Internal Real-time Chat Website"
dotnet run
```

### 2. **Truy cập ứng dụng**
- URL: `http://localhost:5000` hoặc `https://localhost:5001`
- Hoặc port khác nếu được cấu hình

### 3. **Test với 2 user**
1. **Đăng ký User 1**: `user1@test.com` / `password123`
2. **Đăng ký User 2**: `user2@test.com` / `password123`
3. **Mở 2 tab browser** và đăng nhập với 2 tài khoản
4. **Chọn user để chat** từ danh sách bên trái
5. **Gửi tin nhắn** và xem kết quả

### 4. **Kiểm tra Server Logs**
Trong terminal chạy ứng dụng, bạn sẽ thấy:

#### ✅ Khi thành công:
```
info: SendMessage: SenderId=user-id-123, ReceiverId=user-id-456, Content=Hello
info: Message saved to database with ID: 1
info: Message sent to receiver group: user_user-id-456
info: Message confirmation sent to sender
```

#### ❌ Khi có lỗi:
```
warn: SendMessage: SenderId is null
error: Error in SendMessage: [Exception details]
```

### 5. **Kiểm tra Browser Console**
Mở F12 → Console tab:

#### ✅ Khi thành công:
```
SignalR connected successfully
Sending message: {content: "Hello", receiverId: "user-id-123"}
Message sent successfully
Message sent confirmation: {...}
```

#### ❌ Khi có lỗi:
```
Error sending message: [Detailed error message]
Failed to send message: [Specific error]
```

## 🔍 Các lỗi thường gặp và cách sửa:

### 1. **"User not authenticated"**
**Nguyên nhân**: User chưa đăng nhập hoặc session expired
**Giải pháp**: 
- Đăng nhập lại
- Refresh trang
- Kiểm tra authentication

### 2. **"Sender or receiver not found"**
**Nguyên nhân**: User không tồn tại trong database
**Giải pháp**:
- Đảm bảo đã đăng ký user
- Kiểm tra database connection
- Verify user IDs

### 3. **Database connection error**
**Nguyên nhân**: MySQL không chạy hoặc connection string sai
**Giải pháp**:
- Kiểm tra MySQL service
- Verify connection string trong appsettings.json
- Test database connection

### 4. **SignalR connection error**
**Nguyên nhân**: WebSocket connection bị block
**Giải pháp**:
- Kiểm tra firewall/antivirus
- Test network connection
- Restart ứng dụng

## 🛠️ Troubleshooting Steps:

### Step 1: Kiểm tra Database
```sql
USE okeanchat;
SELECT COUNT(*) FROM AspNetUsers;
SELECT COUNT(*) FROM Messages;
```

### Step 2: Kiểm tra Network
```bash
# Test port
netstat -an | findstr :5000
netstat -an | findstr :5001
```

### Step 3: Kiểm tra Logs
- Server logs trong terminal
- Browser console logs
- Network tab trong DevTools

### Step 4: Test từng component
1. **Authentication**: Đăng nhập/đăng xuất
2. **SignalR**: Kết nối real-time
3. **Database**: Lưu/đọc messages
4. **UI**: Gửi/nhận messages

## 📋 Checklist để test:

- [ ] Ứng dụng chạy thành công
- [ ] Database connection OK
- [ ] SignalR connected successfully
- [ ] User authentication working
- [ ] User selection working
- [ ] Message sending working
- [ ] Message receiving working
- [ ] Real-time updates working

## 🎯 Kết quả mong đợi:

Sau khi sửa, bạn sẽ thấy:
- ✅ Detailed error messages thay vì generic errors
- ✅ Better logging để debug
- ✅ Proper exception handling
- ✅ Chat functionality hoạt động bình thường

## 📞 Nếu vẫn có lỗi:

1. **Gửi server logs** từ terminal
2. **Gửi browser console logs** từ F12
3. **Mô tả steps** để reproduce lỗi
4. **Screenshot** của lỗi nếu có

Với những cải thiện này, lỗi server sẽ được hiển thị chi tiết hơn và dễ debug hơn!
