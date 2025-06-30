using Microsoft.AspNetCore.SignalR;
using System.Text.Json;
using System.Collections.Concurrent;

namespace backend.Hubs
{
    public class BroadcastHub : Hub<IBroadcastHub>
    {
        private static readonly string _filePath = Path.Combine(Directory.GetCurrentDirectory(), "broadcasts.json");
        private static readonly object _fileLock = new object();

                public override async Task OnConnectedAsync()
        {
            var messages = ReadMessagesFromFile()
                .Select(m => new { subject = m.Subject, content = m.Content, fullName = m.FullName, timestamp = m.Timestamp });
            await Clients.Caller.LoadHistory(messages);
            await base.OnConnectedAsync();
        }

        public async Task SendMessage(string subject, string content, string fullName)
        {
            var newMessage = new BroadcastMessage { Subject = subject, Content = content, FullName = fullName, Timestamp = DateTime.UtcNow };
            SaveMessageToFile(newMessage);

            await Clients.All.BroadcastMessage(newMessage.Subject, newMessage.Content, newMessage.FullName, newMessage.Timestamp);
        }

        private void SaveMessageToFile(BroadcastMessage message)
        {
            lock (_fileLock)
            {
                var messages = ReadMessagesFromFile();
                messages.Add(message);
                var options = new JsonSerializerOptions { WriteIndented = true };
                var jsonString = JsonSerializer.Serialize(messages, options);
                File.WriteAllText(_filePath, jsonString);
            }
        }

        private List<BroadcastMessage> ReadMessagesFromFile()
        {
            lock (_fileLock)
            {
                if (!File.Exists(_filePath))
                {
                    return new List<BroadcastMessage>();
                }

                var jsonString = File.ReadAllText(_filePath);
                if (string.IsNullOrWhiteSpace(jsonString))
                {
                    return new List<BroadcastMessage>();
                }

                return JsonSerializer.Deserialize<List<BroadcastMessage>>(jsonString) ?? new List<BroadcastMessage>();
            }
        }
    }

    public class BroadcastMessage
    {
        public string Subject { get; set; }
        public string Content { get; set; }
        public string FullName { get; set; }
        public DateTime Timestamp { get; set; }
    }
}
