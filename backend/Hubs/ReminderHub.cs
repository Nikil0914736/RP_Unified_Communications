using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;
using backend.Models;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.IO;
using System;

namespace backend.Hubs
{
    public class ReminderDto : ReminderMessage
    {
        public bool IsRead { get; set; }
    }

    public class ReminderHub : Hub
    {
        private readonly string _usersFilePath = "users.json";
        private readonly string _remindersFilePath = "reminders.json";
        private readonly ILogger<ReminderHub> _logger;

        public ReminderHub(ILogger<ReminderHub> logger)
        {
            _logger = logger;
        }

        public override async Task OnConnectedAsync()
        {
            var username = Context.UserIdentifier;
            _logger.LogInformation("ReminderHub: OnConnectedAsync triggered for user: {Username}", username);

            if (string.IsNullOrEmpty(username)) 
            {
                _logger.LogWarning("ReminderHub: Connection attempt with no username.");
                return;
            }

            var allReminders = ReadRemindersFromFile();
            _logger.LogInformation("ReminderHub: Found {Count} total reminders in file.", allReminders.Count);

            var user = GetUser(username);
            var userReadIds = user?.ReadReminderIds ?? new List<string>();

            var userReminders = allReminders
                .Where(r => r.Email.Equals(username, StringComparison.OrdinalIgnoreCase))
                .Select(r => new ReminderDto
                {
                    Id = r.Id,
                    Email = r.Email,
                    Content = r.Content,
                    SentBy = r.SentBy,
                    Timestamp = r.Timestamp,
                    IsRead = userReadIds.Contains(r.Id.ToString())
                })
                .ToList();
            
            _logger.LogInformation("ReminderHub: Found {Count} reminders for user {Username}. Sending history.", userReminders.Count, username);

            await Clients.Caller.SendAsync("ReminderHistory", userReminders);
            await base.OnConnectedAsync();
        }

        private List<ReminderMessage> ReadRemindersFromFile()
        {
            if (!File.Exists(_remindersFilePath)) return new List<ReminderMessage>();
            var jsonString = File.ReadAllText(_remindersFilePath);
            return string.IsNullOrWhiteSpace(jsonString) 
                ? new List<ReminderMessage>() 
                : JsonSerializer.Deserialize<List<ReminderMessage>>(jsonString) ?? new List<ReminderMessage>();
        }

        private User? GetUser(string username)
        {
            if (!File.Exists(_usersFilePath)) return null;
            var jsonString = File.ReadAllText(_usersFilePath);
            var userData = JsonSerializer.Deserialize<UserData>(jsonString, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            return userData?.Users.FirstOrDefault(u => u.Username.Equals(username, StringComparison.OrdinalIgnoreCase));
        }
    }
}
