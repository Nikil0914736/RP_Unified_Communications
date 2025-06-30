using System.Text.Json.Serialization;

namespace backend.Models;

public class User
{
    public string FullName { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty; // This will be the email
    public string Password { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
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
