using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using backend.Models;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly string _usersFilePath = "users.json";
    private readonly ILogger<AuthController> _logger;

    public AuthController(ILogger<AuthController> logger)
    {
        _logger = logger;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] UserRegistrationDto registrationDto)
    {        
        if (registrationDto == null || string.IsNullOrWhiteSpace(registrationDto.Email))
        {
            return BadRequest(new { message = "Invalid user data." });
        }

        var userData = new UserData();
        if (System.IO.File.Exists(_usersFilePath))
        {
            var jsonData = await System.IO.File.ReadAllTextAsync(_usersFilePath);
            var deserializedData = JsonSerializer.Deserialize<UserData>(jsonData, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            if (deserializedData?.Users != null)
            {
                userData = deserializedData;
            }
        }

        if (userData.Users.Any(u => u.Username.Equals(registrationDto.Email, StringComparison.OrdinalIgnoreCase)))
        {
            return Conflict(new { message = "An account with this email address already exists." });
        }

        var newUser = new User
        {
            Id = Guid.NewGuid(),
            FullName = registrationDto.FullName,
            Username = registrationDto.Email,
            Password = registrationDto.Password, // WARNING: Password should be hashed in a real application
            Role = registrationDto.Role
        };

        userData.Users.Add(newUser);

        var newJsonData = JsonSerializer.Serialize(userData, new JsonSerializerOptions { WriteIndented = true });
        await System.IO.File.WriteAllTextAsync(_usersFilePath, newJsonData);

        return Ok(new { message = "Registration successful" });
    }

    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto changePasswordDto)
    {
        if (changePasswordDto == null || string.IsNullOrWhiteSpace(changePasswordDto.Email))
        {
            return BadRequest(new { message = "Invalid data provided." });
        }

        var userData = new UserData();
        if (!System.IO.File.Exists(_usersFilePath))
        {
            return NotFound(new { message = "User data file not found." });
        }

        var jsonData = await System.IO.File.ReadAllTextAsync(_usersFilePath);
        var deserializedData = JsonSerializer.Deserialize<UserData>(jsonData, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        if (deserializedData?.Users != null)
        {
            userData = deserializedData;
        }

        var userToUpdate = userData.Users.FirstOrDefault(u => u.Username.Equals(changePasswordDto.Email, StringComparison.OrdinalIgnoreCase));

        if (userToUpdate == null)
        {
            return NotFound(new { message = "User not found." });
        }

        if (userToUpdate.Password != changePasswordDto.OldPassword)
        {
            return BadRequest(new { message = "Incorrect old password." });
        }

        if (changePasswordDto.OldPassword == changePasswordDto.NewPassword)
        {
            return BadRequest(new { message = "New password cannot be the same as the old password." });
        }

        userToUpdate.Password = changePasswordDto.NewPassword;

        var newJsonData = JsonSerializer.Serialize(userData, new JsonSerializerOptions { WriteIndented = true });
        await System.IO.File.WriteAllTextAsync(_usersFilePath, newJsonData);

        return Ok(new { message = "Password updated successfully" });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
    {
        if (loginDto == null || string.IsNullOrWhiteSpace(loginDto.Username))
        {
            return BadRequest(new { message = "Invalid login data." });
        }

        var userData = new UserData();
        if (!System.IO.File.Exists(_usersFilePath))
        {
            return Unauthorized(new { message = "Invalid credentials." });
        }

        var jsonData = await System.IO.File.ReadAllTextAsync(_usersFilePath);
        userData = JsonSerializer.Deserialize<UserData>(jsonData, new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? new UserData();

        var user = userData.Users.FirstOrDefault(u => 
            u.Username.Equals(loginDto.Username, StringComparison.OrdinalIgnoreCase) && 
            u.Password == loginDto.Password &&
            u.Role.Equals(loginDto.Role, StringComparison.OrdinalIgnoreCase));

                if (user == null)
        {
            return Unauthorized(new { message = "Invalid credentials" });
        }

        bool needsSave = false;
        if (user.Id == Guid.Empty)
        {
            user.Id = Guid.NewGuid();
            needsSave = true;
        }

        if (needsSave)
        {
            var newJsonData = JsonSerializer.Serialize(userData, new JsonSerializerOptions { WriteIndented = true });
            await System.IO.File.WriteAllTextAsync(_usersFilePath, newJsonData);
        }

        return Ok(user);
    }

    [HttpPost("mark-broadcast-as-read")]
    public async Task<IActionResult> MarkBroadcastAsRead([FromBody] MarkAsReadDto markAsReadDto)
    {
        if (markAsReadDto == null || string.IsNullOrWhiteSpace(markAsReadDto.Username) || string.IsNullOrWhiteSpace(markAsReadDto.BroadcastId))
        {
            return BadRequest(new { message = "Invalid data provided." });
        }

        var userData = new UserData();
        if (!System.IO.File.Exists(_usersFilePath))
        {
            return NotFound(new { message = "User data file not found." });
        }

        var jsonData = await System.IO.File.ReadAllTextAsync(_usersFilePath);
        var deserializedData = JsonSerializer.Deserialize<UserData>(jsonData, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        if (deserializedData?.Users != null)
        {
            userData = deserializedData;
        }

        var userToUpdate = userData.Users.FirstOrDefault(u => u.Username.Equals(markAsReadDto.Username, StringComparison.OrdinalIgnoreCase));

        if (userToUpdate == null)
        {
            return NotFound(new { message = "User not found." });
        }

        if (!userToUpdate.ReadBroadcastIds.Contains(markAsReadDto.BroadcastId))
        {
            userToUpdate.ReadBroadcastIds.Add(markAsReadDto.BroadcastId);

            var newJsonData = JsonSerializer.Serialize(userData, new JsonSerializerOptions { WriteIndented = true });
            await System.IO.File.WriteAllTextAsync(_usersFilePath, newJsonData);
        }

        return Ok(new { message = "Broadcast marked as read." });
    }

    [HttpPost("mark-reminder-as-read")]
    public async Task<IActionResult> MarkReminderAsRead([FromBody] MarkReminderAsReadDto markAsReadDto)
    {
        _logger.LogInformation("MarkReminderAsRead endpoint called for user: {Username}, reminderId: {ReminderId}", markAsReadDto?.Username, markAsReadDto?.ReminderId);

        if (markAsReadDto == null || string.IsNullOrWhiteSpace(markAsReadDto.Username) || string.IsNullOrWhiteSpace(markAsReadDto.ReminderId))
        {
            _logger.LogWarning("MarkReminderAsRead: Invalid data provided.");
            return BadRequest(new { message = "Invalid data provided." });
        }

        try
        {
            var userData = new UserData();
            if (!System.IO.File.Exists(_usersFilePath))
            {
                _logger.LogError("MarkReminderAsRead: User data file not found at {Path}", _usersFilePath);
                return NotFound(new { message = "User data file not found." });
            }

            var jsonData = await System.IO.File.ReadAllTextAsync(_usersFilePath);
            var deserializedData = JsonSerializer.Deserialize<UserData>(jsonData, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            if (deserializedData?.Users != null)
            {
                userData = deserializedData;
            }

            var userToUpdate = userData.Users.FirstOrDefault(u => u.Username.Equals(markAsReadDto.Username, StringComparison.OrdinalIgnoreCase));

            if (userToUpdate == null)
            {
                _logger.LogWarning("MarkReminderAsRead: User not found with username {Username}", markAsReadDto.Username);
                return NotFound(new { message = "User not found." });
            }

            _logger.LogInformation("MarkReminderAsRead: User {Username} found.", userToUpdate.Username);

            if (!userToUpdate.ReadReminderIds.Contains(markAsReadDto.ReminderId))
            {
                _logger.LogInformation("MarkReminderAsRead: ReminderId {ReminderId} not in user's read list. Adding it.", markAsReadDto.ReminderId);
                userToUpdate.ReadReminderIds.Add(markAsReadDto.ReminderId);

                var newJsonData = JsonSerializer.Serialize(userData, new JsonSerializerOptions { WriteIndented = true });
                await System.IO.File.WriteAllTextAsync(_usersFilePath, newJsonData);
                _logger.LogInformation("MarkReminderAsRead: users.json file updated successfully.");
            }
            else
            {
                _logger.LogInformation("MarkReminderAsRead: ReminderId {ReminderId} already in user's read list. No update needed.", markAsReadDto.ReminderId);
            }

            return Ok(new { message = "Reminder marked as read." });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "MarkReminderAsRead: An unexpected error occurred.");
            return StatusCode(500, "An internal server error occurred.");
        }
    }
}
