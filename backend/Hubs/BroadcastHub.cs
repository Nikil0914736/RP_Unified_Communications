using Microsoft.AspNetCore.SignalR;
using System.Text.Json;
using System.Collections.Concurrent;
using backend.Models;

namespace backend.Hubs
{
    public class BroadcastHub : Hub<IBroadcastHub>
    {
        private static readonly string _filePath = Path.Combine(Directory.GetCurrentDirectory(), "broadcasts.json");
        private static readonly object _fileLock = new object();

                        public override async Task OnConnectedAsync()
        {
            // History is now loaded on demand by the client.
            await base.OnConnectedAsync();
        }

        public async Task GetBroadcastHistory(string username)
        {
            var broadcasts = ReadMessagesFromFile();
            var usersData = ReadUsersFromFile();
            var currentUser = usersData.Users.FirstOrDefault(u => u.Username.Equals(username, StringComparison.OrdinalIgnoreCase));
            var readIds = currentUser?.ReadBroadcastIds ?? new List<string>();

            var history = broadcasts.Select(b => new
            {
                b.Id,
                b.Subject,
                b.Content,
                b.FullName,
                b.Timestamp,
                IsRead = readIds.Contains(b.Id)
            }).ToList();

            await Clients.Caller.LoadHistory(history);
        }

        public async Task SendMessage(string subject, string content, string fullName)
        {
            var newMessage = new BroadcastMessage 
            {
                Id = Guid.NewGuid().ToString(),
                Subject = subject, 
                Content = content, 
                FullName = fullName, 
                Timestamp = DateTime.UtcNow 
            };
            SaveMessageToFile(newMessage);

            await Clients.All.BroadcastMessage(newMessage.Id, newMessage.Subject, newMessage.Content, newMessage.FullName, newMessage.Timestamp);
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

        private UserData ReadUsersFromFile()
        {
            var usersFilePath = "users.json";
            if (!File.Exists(usersFilePath))
            {
                return new UserData();
            }

            var jsonString = File.ReadAllText(usersFilePath);
            return JsonSerializer.Deserialize<UserData>(jsonString, new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? new UserData();
        }
    }

    
}
