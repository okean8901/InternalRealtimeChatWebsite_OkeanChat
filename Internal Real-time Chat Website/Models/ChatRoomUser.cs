using System.ComponentModel.DataAnnotations;

namespace Internal_Real_time_Chat_Website.Models
{
    public class ChatRoomUser
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string UserId { get; set; } = string.Empty;

        [Required]
        public int ChatRoomId { get; set; }

        public DateTime JoinedAt { get; set; } = DateTime.UtcNow;

        public bool IsActive { get; set; } = true;

        // Navigation properties
        public virtual ApplicationUser User { get; set; } = null!;
        public virtual ChatRoom ChatRoom { get; set; } = null!;
    }
}
