namespace backend.Models
{
    public class ReminderMessage
    {
        public Guid Id { get; set; }
        public string Email { get; set; }
        public string Content { get; set; }
        public string SentBy { get; set; }
        public DateTime Timestamp { get; set; }
    }
}
