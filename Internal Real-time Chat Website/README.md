# OkeanChat - Internal Real-time Chat Application

Ứng dụng chat nội bộ thời gian thực được xây dựng với ASP.NET Core 8.0 MVC, SignalR, Entity Framework Core và MySQL.

## 🚀 Tính năng

- **Đăng ký/Đăng nhập**: Hệ thống xác thực với ASP.NET Identity
- **Chat 1-1 Real-time**: Gửi và nhận tin nhắn tức thời với SignalR
- **Trạng thái Online/Offline**: Hiển thị trạng thái người dùng real-time
- **Gửi file đính kèm**: Hỗ trợ gửi ảnh và file
- **Lịch sử chat**: Lưu trữ và hiển thị lịch sử tin nhắn
- **Giao diện responsive**: Bootstrap 5 với thiết kế thân thiện
- **Cập nhật trạng thái tự động**: Tự động cập nhật khi người dùng kết nối/ngắt kết nối

## 🛠️ Công nghệ sử dụng

- **Backend**: ASP.NET Core 8.0 MVC
- **Real-time**: SignalR
- **Database**: MySQL với Entity Framework Core 8
- **Authentication**: ASP.NET Identity
- **Frontend**: Bootstrap 5, JavaScript ES6
- **Icons**: Font Awesome 6

## 📋 Yêu cầu hệ thống

- .NET 8.0 SDK
- MySQL Server 8.0+
- Visual Studio 2022 hoặc VS Code

## 🔧 Cài đặt và chạy

### 1. Clone repository
```bash
git clone <repository-url>
cd "Internal Real-time Chat Website"
```

### 2. Cấu hình database
- Tạo database MySQL với tên `okeanchat`
- Cập nhật connection string trong `appsettings.json` nếu cần:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=okeanchat;Uid=root;Pwd=123456;"
  }
}
```

### 3. Restore packages
```bash
dotnet restore
```

### 4. Chạy ứng dụng
```bash
dotnet run
```

Ứng dụng sẽ chạy tại `https://localhost:5001` hoặc `http://localhost:5000`

## 📱 Hướng dẫn sử dụng

### Đăng ký tài khoản
1. Truy cập ứng dụng
2. Click "Register here" để tạo tài khoản mới
3. Điền thông tin: Full Name, Email, Password
4. Click "Register"

### Đăng nhập
1. Nhập Email và Password
2. Click "Login"
3. Hệ thống sẽ tự động cập nhật trạng thái Online

### Chat
1. Chọn người dùng từ danh sách bên trái
2. Gõ tin nhắn và nhấn Enter hoặc click nút Send
3. Tin nhắn sẽ được gửi real-time
4. Có thể gửi file đính kèm bằng nút 📎

## 🗂️ Cấu trúc dự án

```
Internal Real-time Chat Website/
├── Controllers/          # MVC Controllers
│   ├── HomeController.cs
│   ├── AccountController.cs
│   └── ChatController.cs
├── Data/                # Database Context
│   └── ApplicationDbContext.cs
├── Hubs/                # SignalR Hubs
│   └── ChatHub.cs
├── Models/              # Data Models
│   ├── ApplicationUser.cs
│   ├── Message.cs
│   ├── ChatRoom.cs
│   └── ChatRoomUser.cs
├── Views/               # MVC Views
│   ├── Home/
│   ├── Account/
│   └── Shared/
├── wwwroot/             # Static files
│   ├── css/
│   ├── js/
│   ├── lib/
│   └── uploads/
└── Program.cs           # Application startup
```

## 🗄️ Database Schema

### Users (ApplicationUser)
- Id (Primary Key)
- UserName, Email, FullName
- IsOnline, LastSeen
- Avatar

### Messages
- Id (Primary Key)
- Content, Timestamp
- SenderId, ReceiverId
- ChatRoomId (nullable)
- IsRead, AttachmentPath, AttachmentType

### ChatRooms
- Id (Primary Key)
- Name, Description
- CreatedAt, CreatedById
- IsGroup, IsActive

### ChatRoomUsers
- Id (Primary Key)
- UserId, ChatRoomId
- JoinedAt, IsActive

## 🔐 Bảo mật

- Sử dụng ASP.NET Identity cho authentication
- Anti-forgery tokens cho forms
- Authorization attributes trên controllers
- File upload validation
- XSS protection với HTML encoding

## 🚀 Tính năng mở rộng (có thể thêm)

- Chat nhóm (Group Chat)
- Tin nhắn chưa đọc
- Thông báo push
- Emoji reactions
- Voice messages
- Video calls
- Message encryption
- Admin dashboard
- User roles và permissions

## 🐛 Troubleshooting

### Lỗi kết nối database
- Kiểm tra MySQL service đang chạy
- Xác nhận connection string đúng
- Đảm bảo database `okeanchat` đã được tạo

### Lỗi SignalR connection
- Kiểm tra firewall settings
- Đảm bảo HTTPS certificate hợp lệ
- Kiểm tra browser console để xem lỗi chi tiết

### Lỗi file upload
- Kiểm tra quyền ghi vào thư mục `wwwroot/uploads`
- Xác nhận file size không vượt quá giới hạn
- Kiểm tra file type được phép

## 📞 Hỗ trợ

Nếu gặp vấn đề, vui lòng tạo issue trên repository hoặc liên hệ team phát triển.

## 📄 License

Dự án này được phát triển cho mục đích nội bộ. Vui lòng không sử dụng cho mục đích thương mại mà không có sự đồng ý.
