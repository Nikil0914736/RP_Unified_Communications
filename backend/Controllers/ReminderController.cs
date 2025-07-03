using Microsoft.AspNetCore.Mvc;
using backend.Models;
using System;
using System.Collections.Generic;
using System.IO;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.SignalR;
using backend.Hubs;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReminderController : ControllerBase
    {
        private static readonly string _filePath = Path.Combine(Directory.GetCurrentDirectory(), "reminders.json");
        private static readonly object _fileLock = new object();
                private readonly ILogger<ReminderController> _logger;
        private readonly IHubContext<ReminderHub> _hubContext;

                public ReminderController(ILogger<ReminderController> logger, IHubContext<ReminderHub> hubContext)
        {
                        _logger = logger;
            _hubContext = hubContext;
        }

        [HttpPost("Send")]
        public IActionResult SendReminder([FromBody] ReminderRequest request)
        {
            if (request == null)
            {
                return BadRequest("Invalid request payload.");
            }

            var newReminder = new ReminderMessage
            {
                Id = Guid.NewGuid(),
                Email = request.Email,
                Content = request.Content,
                SentBy = request.SentBy,
                Timestamp = DateTime.UtcNow
            };

                        SaveReminderToFile(newReminder);

            // Send real-time update to the specific resident
            var reminderDto = new ReminderDto
            {
                Id = newReminder.Id,
                Email = newReminder.Email,
                Content = newReminder.Content,
                SentBy = newReminder.SentBy,
                Timestamp = newReminder.Timestamp,
                IsRead = false // New reminders are always unread
            };
            _hubContext.Clients.User(reminderDto.Email).SendAsync("ReceiveReminder", reminderDto);

            return Ok(new { Message = "Reminder sent and saved successfully." });
        }

        [HttpGet("GetAll")]
        public IActionResult GetAllReminders()
        {
            var allReminders = ReadRemindersFromFile();
            return Ok(allReminders);
        }

        [HttpGet("GetByEmail")]
        public IActionResult GetRemindersByEmail([FromQuery] string email)
        {
            if (string.IsNullOrWhiteSpace(email))
            {
                return BadRequest("Email address is required.");
            }

            var allReminders = ReadRemindersFromFile();
            var residentReminders = allReminders
                .Where(r => r.Email.Equals(email, StringComparison.OrdinalIgnoreCase))
                .ToList();

            return Ok(residentReminders);
        }

        private void SaveReminderToFile(ReminderMessage reminder)
        {
            lock (_fileLock)
            {
                var reminders = ReadRemindersFromFile();
                reminders.Add(reminder);
                var options = new JsonSerializerOptions { WriteIndented = true };
                var jsonString = JsonSerializer.Serialize(reminders, options);
                System.IO.File.WriteAllText(_filePath, jsonString);
            }
        }

        private List<ReminderMessage> ReadRemindersFromFile()
        {
            lock (_fileLock)
            {
                                _logger.LogInformation("Checking for reminders file at path: {FilePath}", _filePath);
                if (!System.IO.File.Exists(_filePath))
                {
                    _logger.LogWarning("Reminders file not found at path: {FilePath}. Returning empty list.", _filePath);
                    return new List<ReminderMessage>();
                }

                try
                {
                    var jsonString = System.IO.File.ReadAllText(_filePath);
                    if (string.IsNullOrWhiteSpace(jsonString))
                    {
                        return new List<ReminderMessage>();
                    }
                    return JsonSerializer.Deserialize<List<ReminderMessage>>(jsonString) ?? new List<ReminderMessage>();
                }
                catch (JsonException ex)
                {
                    _logger.LogError(ex, "Error deserializing reminders JSON from {FilePath}", _filePath);
                    return new List<ReminderMessage>();
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "An unexpected error occurred while reading reminders from {FilePath}", _filePath);
                    return new List<ReminderMessage>();
                }
            }
        }
    }
}
