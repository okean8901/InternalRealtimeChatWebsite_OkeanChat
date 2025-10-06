using System.ComponentModel.DataAnnotations;

namespace Internal_Real_time_Chat_Website.Models
{
    public class ChatRoom
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        public string? Description { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Required]
        public string CreatedById { get; set; } = string.Empty;

        public virtual ApplicationUser CreatedBy { get; set; } = null!;

        public bool IsGroup { get; set; } = false;

        public bool IsActive { get; set; } = true;

        // Navigation properties
        public virtual ICollection<Message> Messages { get; set; } = new List<Message>();
        public virtual ICollection<ChatRoomUser> ChatRoomUsers { get; set; } = new List<ChatRoomUser>();
    }
}
