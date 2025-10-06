# Debug "Failed to send message" Error

## 🔍 Cách kiểm tra và debug lỗi gửi tin nhắn:

### 1. Mở Developer Tools (F12)
- Truy cập ứng dụng: `http://localhost:5000` hoặc `https://localhost:5001`
- Nhấn F12 để mở Developer Tools
- Chuyển đến tab **Console**

### 2. Kiểm tra SignalR Connection
Trong Console, bạn sẽ thấy:
- ✅ `SignalR connected successfully` - Kết nối thành công
- ❌ Nếu có lỗi kết nối, sẽ hiển thị error message

### 3. Test gửi tin nhắn
1. **Đăng ký 2 tài khoản**:
   - User 1: `user1@test.com` / `password123`
   - User 2: `user2@test.com` / `password123`

2. **Mở 2 tab browser** và đăng nhập với 2 tài khoản khác nhau

3. **Chọn user để chat** từ danh sách bên trái

4. **Gửi tin nhắn** và xem Console logs

### 4. Console Logs để kiểm tra:

#### Khi gửi tin nhắn thành công:
```
Sending message: {content: "Hello", receiverId: "user-id-123"}
Message sent successfully
Message sent confirmation: {Id: 1, Content: "Hello", ...}
```

#### Khi có lỗi:
```
Cannot send message: {content: true, isConnected: false, currentChatUserId: "user-id-123"}
```
hoặc
```
Error sending message: [Error details]
```

### 5. Các lỗi thường gặp và cách sửa:

#### ❌ "Cannot send message: isConnected: false"
**Nguyên nhân**: SignalR chưa kết nối
**Giải pháp**: 
- Refresh trang
- Kiểm tra network connection
- Đảm bảo ứng dụng đang chạy

#### ❌ "Cannot send message: currentChatUserId: null"
**Nguyên nhân**: Chưa chọn user để chat
**Giải pháp**: 
- Click vào user từ danh sách bên trái
- Đảm bảo user được highlight (active)

#### ❌ "Error sending message: [Error details]"
**Nguyên nhân**: Lỗi từ server
**Giải pháp**: 
- Kiểm tra server logs
- Đảm bảo database connection
- Kiểm tra user authentication

### 6. Kiểm tra Server Logs
Trong terminal chạy ứng dụng, bạn sẽ thấy:
```
info: SendMessage: SenderId=user-id-123, ReceiverId=user-id-456, Content=Hello
info: Message saved to database with ID: 1
info: Message sent to receiver group: user_user-id-456
info: Message confirmation sent to sender
```

### 7. Troubleshooting Steps:

1. **Kiểm tra kết nối SignalR**:
   - Console có hiển thị "SignalR connected successfully"?
   - Có lỗi network nào không?

2. **Kiểm tra user selection**:
   - Đã chọn user từ danh sách chưa?
   - User có được highlight không?

3. **Kiểm tra authentication**:
   - Đã đăng nhập chưa?
   - Session có còn valid không?

4. **Kiểm tra database**:
   - Database có đang chạy không?
   - Connection string có đúng không?

### 8. Test Commands:

#### Kiểm tra ứng dụng có chạy:
```bash
netstat -an | findstr :5000
```

#### Kiểm tra database:
```sql
USE okeanchat;
SELECT * FROM AspNetUsers;
SELECT * FROM Messages;
```

### 9. Nếu vẫn lỗi:
1. **Restart ứng dụng**:
   ```bash
   # Dừng ứng dụng (Ctrl+C)
   dotnet run
   ```

2. **Clear browser cache**:
   - Ctrl+Shift+R để hard refresh
   - Hoặc clear browser data

3. **Kiểm tra firewall/antivirus**:
   - Có thể block WebSocket connection

### 10. Logs để gửi cho support:
Khi báo lỗi, hãy gửi kèm:
- Console logs từ browser
- Server logs từ terminal
- Screenshot của lỗi
- Steps để reproduce lỗi
