# Database Setup Guide

## MySQL Database Setup

### 1. Install MySQL Server
- Download và cài đặt MySQL Server 8.0+ từ [mysql.com](https://dev.mysql.com/downloads/mysql/)
- Hoặc sử dụng XAMPP/WAMP với MySQL

### 2. Create Database
Mở MySQL Command Line hoặc MySQL Workbench và chạy:

```sql
CREATE DATABASE okeanchat CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. Create User (Optional)
Nếu muốn tạo user riêng thay vì dùng root:

```sql
CREATE USER 'okeanchat_user'@'localhost' IDENTIFIED BY '123456';
GRANT ALL PRIVILEGES ON okeanchat.* TO 'okeanchat_user'@'localhost';
FLUSH PRIVILEGES;
```

### 4. Update Connection String
Nếu sử dụng user riêng, cập nhật `appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=okeanchat;Uid=okeanchat_user;Pwd=123456;"
  }
}
```

### 5. Run Application
Khi chạy ứng dụng lần đầu, Entity Framework sẽ tự động tạo các bảng cần thiết.

## Database Tables

Sau khi chạy ứng dụng, các bảng sau sẽ được tạo:

### Identity Tables
- `AspNetUsers` - Thông tin người dùng
- `AspNetRoles` - Vai trò
- `AspNetUserRoles` - Liên kết user-role
- `AspNetUserClaims` - Claims của user
- `AspNetUserLogins` - External logins
- `AspNetUserTokens` - Tokens
- `AspNetRoleClaims` - Claims của role

### Application Tables
- `Messages` - Tin nhắn chat
- `ChatRooms` - Phòng chat (cho tính năng nhóm)
- `ChatRoomUsers` - Thành viên phòng chat

## Troubleshooting

### Connection Error
```
Unable to connect to any of the specified MySQL hosts
```
**Giải pháp:**
- Kiểm tra MySQL service đang chạy
- Xác nhận port 3306 không bị block
- Kiểm tra username/password

### Database Not Found
```
Unknown database 'okeanchat'
```
**Giải pháp:**
- Tạo database bằng SQL command ở trên
- Hoặc thay đổi tên database trong connection string

### Permission Denied
```
Access denied for user 'root'@'localhost'
```
**Giải pháp:**
- Kiểm tra password MySQL
- Hoặc tạo user mới với quyền phù hợp

### Character Set Issues
```
Incorrect string value
```
**Giải pháp:**
- Đảm bảo database sử dụng utf8mb4
- Kiểm tra connection string có `charset=utf8mb4`

## Backup & Restore

### Backup Database
```bash
mysqldump -u root -p okeanchat > okeanchat_backup.sql
```

### Restore Database
```bash
mysql -u root -p okeanchat < okeanchat_backup.sql
```

## Performance Tips

1. **Indexes**: Entity Framework tự động tạo indexes cho foreign keys
2. **Connection Pooling**: Đã được cấu hình trong Program.cs
3. **Query Optimization**: Sử dụng Include() để eager loading
4. **Caching**: Có thể thêm Redis cache cho production

## Production Considerations

1. **Security**:
   - Sử dụng user riêng thay vì root
   - Cấu hình SSL cho MySQL connection
   - Regular backup

2. **Performance**:
   - Tối ưu connection string
   - Monitor slow queries
   - Consider read replicas

3. **Monitoring**:
   - Log database operations
   - Monitor connection pool
   - Track query performance
