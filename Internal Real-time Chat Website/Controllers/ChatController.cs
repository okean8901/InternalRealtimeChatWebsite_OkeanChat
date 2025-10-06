using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Internal_Real_time_Chat_Website.Data;
using Internal_Real_time_Chat_Website.Models;
using System.Security.Claims;

namespace Internal_Real_time_Chat_Website.Controllers
{
    [Authorize]
    public class ChatController : Controller
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<ChatController> _logger;

        public ChatController(ApplicationDbContext context, ILogger<ChatController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetMessages(string receiverId, int page = 1, int pageSize = 50)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null)
            {
                return Unauthorized();
            }

            var messages = await _context.Messages
                .Where(m => (m.SenderId == userId && m.ReceiverId == receiverId) ||
                           (m.SenderId == receiverId && m.ReceiverId == userId))
                .OrderByDescending(m => m.Timestamp)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Include(m => m.Sender)
                .Select(m => new
                {
                    m.Id,
                    m.Content,
                    m.Timestamp,
                    m.AttachmentPath,
                    m.AttachmentType,
                    m.IsRead,
                    SenderId = m.SenderId,
                    SenderName = m.Sender.FullName,
                    IsFromCurrentUser = m.SenderId == userId
                })
                .ToListAsync();

            return Json(messages.OrderBy(m => m.Timestamp));
        }

        [HttpPost]
        public async Task<IActionResult> MarkAsRead(int messageId)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null)
            {
                return Unauthorized();
            }

            var message = await _context.Messages.FindAsync(messageId);
            if (message != null && message.ReceiverId == userId)
            {
                message.IsRead = true;
                await _context.SaveChangesAsync();
                return Ok();
            }

            return NotFound();
        }

        [HttpPost]
        public async Task<IActionResult> UploadFile(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest("No file uploaded");
            }

            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            var fileName = $"{Guid.NewGuid()}_{file.FileName}";
            var filePath = Path.Combine(uploadsFolder, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            return Json(new { 
                fileName = fileName, 
                filePath = $"/uploads/{fileName}",
                fileType = file.ContentType
            });
        }

        [HttpGet]
        public async Task<IActionResult> GetUserInfo(string userId)
        {
            var user = await _context.Users
                .Where(u => u.Id == userId)
                .Select(u => new
                {
                    u.Id,
                    u.FullName,
                    u.Email,
                    u.IsOnline,
                    u.LastSeen,
                    u.Avatar
                })
                .FirstOrDefaultAsync();

            if (user == null)
            {
                return NotFound();
            }

            return Json(user);
        }
    }
}
