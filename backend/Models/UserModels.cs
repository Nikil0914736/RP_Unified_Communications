using System;
using System.Text.Json.Serialization;

namespace backend.Models;

public class User
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty; // This will be the email
    public string Password { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public List<string> ReadBroadcastIds { get; set; } = new List<string>();
    public List<string> ReadReminderIds { get; set; } = new List<string>();
    public List<string> ReadOfferIds { get; set; } = new List<string>();
}

public class UserRegistrationDto
{
    [JsonPropertyName("fullName")]
    public string FullName { get; set; } = string.Empty;
    [JsonPropertyName("email")]
    public string Email { get; set; } = string.Empty;
    [JsonPropertyName("password")]
    public string Password { get; set; } = string.Empty;
    [JsonPropertyName("role")]
    public string Role { get; set; } = string.Empty;
}

public class UserData
{
    public List<User> Users { get; set; } = new List<User>();
}

public class ChangePasswordDto
{
    [JsonPropertyName("email")]
    public string Email { get; set; } = string.Empty;
    [JsonPropertyName("oldPassword")]
    public string OldPassword { get; set; } = string.Empty;
    [JsonPropertyName("newPassword")]
    public string NewPassword { get; set; } = string.Empty;
}

public class LoginDto
{
    [JsonPropertyName("username")]
    public string Username { get; set; } = string.Empty;
    [JsonPropertyName("password")]
    public string Password { get; set; } = string.Empty;
    [JsonPropertyName("role")]
    public string Role { get; set; } = string.Empty;
}

public class MarkAsReadDto
{
    [JsonPropertyName("username")]
    public string Username { get; set; } = string.Empty;
    [JsonPropertyName("broadcastId")]
    public string BroadcastId { get; set; } = string.Empty;
}

public class MarkReminderAsReadDto
{
    [JsonPropertyName("username")]
    public string Username { get; set; } = string.Empty;
    [JsonPropertyName("reminderId")]
    public string ReminderId { get; set; } = string.Empty;
}

public class MarkOfferAsReadDto
{
    [JsonPropertyName("username")]
    public string Username { get; set; } = string.Empty;
    [JsonPropertyName("offerId")]
    public string OfferId { get; set; } = string.Empty;
}

public class BroadcastMessage
{
    public string Id { get; set; }
    public string Subject { get; set; }
    public string Content { get; set; }
    public string FullName { get; set; }
    public DateTime Timestamp { get; set; }
}
