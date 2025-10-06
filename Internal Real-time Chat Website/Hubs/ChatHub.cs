using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Internal_Real_time_Chat_Website.Data;
using Internal_Real_time_Chat_Website.Models;
using System.Security.Claims;

namespace Internal_Real_time_Chat_Website.Hubs
{
    [Authorize]
    public class ChatHub : Hub
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<ChatHub> _logger;

        public ChatHub(ApplicationDbContext context, ILogger<ChatHub> logger)
        {
            _context = context;
            _logger = logger;
        }

        public override async Task OnConnectedAsync()
        {
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId != null)
            {
                // Update user online status
                var user = await _context.Users.FindAsync(userId);
                if (user != null)
                {
                    user.IsOnline = true;
                    user.LastSeen = DateTime.UtcNow;
                    await _context.SaveChangesAsync();

                    // Notify all clients that user is online
                    await Clients.All.SendAsync("UserStatusChanged", userId, true);
                }

                // Add user to their own group for private messages
                await Groups.AddToGroupAsync(Context.ConnectionId, $"user_{userId}");
                _logger.LogInformation("User {UserId} added to group user_{UserId}", userId, userId);
            }

            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId != null)
            {
                // Update user offline status
                var user = await _context.Users.FindAsync(userId);
                if (user != null)
                {
                    user.IsOnline = false;
                    user.LastSeen = DateTime.UtcNow;
                    await _context.SaveChangesAsync();

                    // Notify all clients that user is offline
                    await Clients.All.SendAsync("UserStatusChanged", userId, false);
                }
            }

            await base.OnDisconnectedAsync(exception);
        }

        public async Task SendMessage(string receiverId, string content, string? attachmentPath = null, string? attachmentType = null)
        {
            try
            {
                var senderId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (senderId == null) 
                {
                    _logger.LogWarning("SendMessage: SenderId is null");
                    throw new InvalidOperationException("User not authenticated");
                }

                _logger.LogInformation("SendMessage: SenderId={SenderId}, ReceiverId={ReceiverId}, Content={Content}", 
                    senderId, receiverId, content);

                var sender = await _context.Users.FindAsync(senderId);
                var receiver = await _context.Users.FindAsync(receiverId);

                if (sender == null || receiver == null) 
                {
                    _logger.LogWarning("SendMessage: Sender or receiver not found. Sender={Sender}, Receiver={Receiver}", 
                        sender?.FullName, receiver?.FullName);
                    throw new InvalidOperationException("Sender or receiver not found");
                }

                // Create message
                var message = new Message
                {
                    Content = content,
                    SenderId = senderId,
                    ReceiverId = receiverId,
                    Timestamp = DateTime.UtcNow,
                    AttachmentPath = attachmentPath,
                    AttachmentType = attachmentType
                };

                _context.Messages.Add(message);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Message saved to database with ID: {MessageId}", message.Id);

                // Send message to receiver
                await Clients.Group($"user_{receiverId}").SendAsync("ReceiveMessage", new
                {
                    Id = message.Id,
                    Content = message.Content,
                    SenderId = message.SenderId,
                    SenderName = sender.FullName,
                    ReceiverId = message.ReceiverId,
                    Timestamp = message.Timestamp,
                    AttachmentPath = message.AttachmentPath,
                    AttachmentType = message.AttachmentType
                });

                _logger.LogInformation("Message sent to receiver group: user_{ReceiverId}", receiverId);

                // Send message back to sender for confirmation
                await Clients.Caller.SendAsync("MessageSent", new
                {
                    Id = message.Id,
                    Content = message.Content,
                    SenderId = message.SenderId,
                    SenderName = sender.FullName,
                    ReceiverId = message.ReceiverId,
                    Timestamp = message.Timestamp,
                    AttachmentPath = message.AttachmentPath,
                    AttachmentType = message.AttachmentType
                });

                _logger.LogInformation("Message confirmation sent to sender");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in SendMessage: SenderId={SenderId}, ReceiverId={ReceiverId}, Content={Content}", 
                    Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value, receiverId, content);
                throw; // Re-throw to let SignalR handle it
            }
        }

        public async Task JoinRoom(int roomId)
        {
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null) return;

            // Check if user is member of the room
            var isMember = await _context.ChatRoomUsers
                .AnyAsync(cru => cru.UserId == userId && cru.ChatRoomId == roomId && cru.IsActive);

            if (isMember)
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, $"room_{roomId}");
                await Clients.Group($"room_{roomId}").SendAsync("UserJoinedRoom", userId);
            }
        }

        public async Task LeaveRoom(int roomId)
        {
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null) return;

            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"room_{roomId}");
            await Clients.Group($"room_{roomId}").SendAsync("UserLeftRoom", userId);
        }

        public async Task SendRoomMessage(int roomId, string content, string? attachmentPath = null, string? attachmentType = null)
        {
            var senderId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (senderId == null) return;

            var sender = await _context.Users.FindAsync(senderId);
            if (sender == null) return;

            // Check if user is member of the room
            var isMember = await _context.ChatRoomUsers
                .AnyAsync(cru => cru.UserId == senderId && cru.ChatRoomId == roomId && cru.IsActive);

            if (!isMember) return;

            // Create message
            var message = new Message
            {
                Content = content,
                SenderId = senderId,
                ChatRoomId = roomId,
                Timestamp = DateTime.UtcNow,
                AttachmentPath = attachmentPath,
                AttachmentType = attachmentType
            };

            _context.Messages.Add(message);
            await _context.SaveChangesAsync();

            // Send message to all room members
            await Clients.Group($"room_{roomId}").SendAsync("ReceiveRoomMessage", new
            {
                Id = message.Id,
                Content = message.Content,
                SenderId = message.SenderId,
                SenderName = sender.FullName,
                RoomId = message.ChatRoomId,
                Timestamp = message.Timestamp,
                AttachmentPath = message.AttachmentPath,
                AttachmentType = message.AttachmentType
            });
        }

        public async Task MarkMessageAsRead(int messageId)
        {
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null) return;

            var message = await _context.Messages.FindAsync(messageId);
            if (message != null && message.ReceiverId == userId)
            {
                message.IsRead = true;
                await _context.SaveChangesAsync();
            }
        }
    }
}
