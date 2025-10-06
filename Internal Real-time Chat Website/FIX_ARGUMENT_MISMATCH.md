# Fix "InvalidDataException: Invocation provides 2 argument(s) but target expects 4"

## 🐛 **Vấn đề đã được sửa:**

### **Root Cause:**
- JavaScript gửi 2 arguments: `(receiverId, content)`
- ChatHub method expect 4 parameters: `(receiverId, content, attachmentPath, attachmentType)`
- SignalR không thể match arguments → InvalidDataException

### **Solution:**
- Cập nhật JavaScript để gửi đúng 4 arguments
- Gửi `null` cho attachmentPath và attachmentType khi không có file

## ✅ **Đã sửa:**

### **Before (Lỗi):**
```javascript
await this.connection.invoke("SendMessage", this.currentChatUserId, content);
```

### **After (Fixed):**
```javascript
await this.connection.invoke("SendMessage", this.currentChatUserId, content, null, null);
```

## 🚀 **Cách test:**

### 1. **Chạy ứng dụng**
```bash
cd "Internal Real-time Chat Website"
dotnet run
```

### 2. **Truy cập ứng dụng**
- URL: `http://localhost:5000` hoặc `https://localhost:5001`
- Hoặc port khác nếu được cấu hình

### 3. **Test chat functionality**
1. **Đăng ký 2 tài khoản**:
   - User 1: `user1@test.com` / `password123`
   - User 2: `user2@test.com` / `password123`

2. **Mở 2 tab browser** và đăng nhập với 2 tài khoản

3. **Chọn user để chat** từ danh sách bên trái

4. **Gửi tin nhắn text**:
   - Gõ tin nhắn và nhấn Enter
   - Hoặc click nút Send

5. **Gửi file đính kèm**:
   - Click nút 📎 để chọn file
   - Chọn file và gửi

## 🔍 **Kiểm tra kết quả:**

### **Browser Console (F12 → Console):**
```
SignalR connected successfully
Sending message: {content: "Hello", receiverId: "user-id-123"}
Message sent successfully
Message sent confirmation: {...}
```

### **Server Logs (Terminal):**
```
info: SendMessage: SenderId=user-id-123, ReceiverId=user-id-456, Content=Hello
info: Message saved to database with ID: 1
info: Message sent to receiver group: user_user-id-456
info: Message confirmation sent to sender
```

## ✅ **Expected Results:**

- ✅ **Không còn lỗi "InvalidDataException"**
- ✅ **Tin nhắn text gửi thành công**
- ✅ **File đính kèm gửi thành công**
- ✅ **Real-time chat hoạt động bình thường**
- ✅ **Lịch sử chat được lưu vào database**

## 🎯 **Test Cases:**

### **Test 1: Text Message**
- Gửi tin nhắn text đơn giản
- Verify tin nhắn hiển thị ở cả 2 tab
- Verify tin nhắn được lưu vào database

### **Test 2: File Attachment**
- Gửi file ảnh (.jpg, .png)
- Gửi file document (.pdf, .doc)
- Verify file hiển thị đúng trong chat

### **Test 3: Real-time Updates**
- Gửi tin nhắn từ tab 1
- Verify tin nhắn hiển thị ngay lập tức ở tab 2
- Verify trạng thái online/offline

### **Test 4: Error Handling**
- Test với user chưa chọn
- Test với SignalR disconnected
- Verify error messages hiển thị đúng

## 🛠️ **Troubleshooting:**

### **Nếu vẫn có lỗi:**
1. **Clear browser cache**: Ctrl+Shift+R
2. **Restart ứng dụng**: Ctrl+C → `dotnet run`
3. **Kiểm tra Console logs**: F12 → Console
4. **Kiểm tra Server logs**: Terminal

### **Common Issues:**
- **"Cannot send message: isConnected: false"** → Refresh trang
- **"Cannot send message: currentChatUserId: null"** → Chọn user từ danh sách
- **Database errors** → Kiểm tra MySQL connection

## 📋 **Verification Checklist:**

- [ ] Ứng dụng chạy thành công
- [ ] SignalR connected successfully
- [ ] User authentication working
- [ ] User selection working
- [ ] Text message sending working
- [ ] File attachment working
- [ ] Real-time message receiving working
- [ ] Database message storage working
- [ ] No more "InvalidDataException" errors

## 🎊 **Kết quả:**

Sau khi sửa, bạn sẽ thấy:
- ✅ **Chat hoạt động hoàn hảo**
- ✅ **Không còn lỗi argument mismatch**
- ✅ **Real-time messaging working**
- ✅ **File upload working**
- ✅ **Database integration working**

**Lỗi "InvalidDataException" đã được sửa hoàn toàn!** 🚀
