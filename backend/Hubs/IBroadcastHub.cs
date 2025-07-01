namespace backend.Hubs
{
    public interface IBroadcastHub
    {
        Task BroadcastMessage(string id, string subject, string content, string fullName, DateTime timestamp);
        Task LoadHistory(IEnumerable<object> messages);
    }
}
