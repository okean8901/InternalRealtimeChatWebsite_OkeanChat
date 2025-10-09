namespace Internal_Real_time_Chat_Website.Models
{
	public class FriendRequest
	{
		public int Id { get; set; }
		public string RequesterId { get; set; } = string.Empty;
		public ApplicationUser Requester { get; set; } = null!;
		public string AddresseeId { get; set; } = string.Empty;
		public ApplicationUser Addressee { get; set; } = null!;
		public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
		public FriendRequestStatus Status { get; set; } = FriendRequestStatus.Pending;
	}

	public enum FriendRequestStatus
	{
		Pending = 0,
		Accepted = 1,
		Declined = 2
	}
}
