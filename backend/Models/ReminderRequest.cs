namespace backend.Models
{
    public class ReminderRequest
    {
        public string Email { get; set; }
        public string Content { get; set; }
        public string SentBy { get; set; }
    }
}
