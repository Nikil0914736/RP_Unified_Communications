using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using backend.Models;
using System.Text.Json;
using System.Threading.Tasks;

public class OfferRecord
{
    public Guid Guid { get; set; }
    public string SelectedType { get; set; }
    public string SendUserEmail { get; set; }
    public string SendUserFullName { get; set; }
    public DateTime DateTime { get; set; }
    public string UserEmail { get; set; }
}

public class OfferHub : Hub
{
    public override async Task OnConnectedAsync()
    {
        var username = Context.GetHttpContext().Request.Query["username"];
        Console.WriteLine($"OfferHub: User connecting with username: {username}");

        if (string.IsNullOrEmpty(username))
        {
            Console.WriteLine("OfferHub: Connection failed. Username is missing.");
            return;
        }

        await Groups.AddToGroupAsync(Context.ConnectionId, username);
        Console.WriteLine($"OfferHub: Added connection {Context.ConnectionId} to group {username}.");

        var filePath = Path.Combine(Directory.GetCurrentDirectory(), "offers.json");

        if (System.IO.File.Exists(filePath))
        {
            var json = await System.IO.File.ReadAllTextAsync(filePath);
            if (!string.IsNullOrWhiteSpace(json))
            {
                var allOffers = JsonSerializer.Deserialize<List<OfferRecord>>(json);
                var userOffers = allOffers
                    .Where(o => o.UserEmail.Equals(username, StringComparison.OrdinalIgnoreCase))
                    .ToList();

                // Enrich offers with sender's full name if it's missing
                var usersFilePath = Path.Combine(Directory.GetCurrentDirectory(), "users.json");
                if (System.IO.File.Exists(usersFilePath))
                {
                    var usersJson = await System.IO.File.ReadAllTextAsync(usersFilePath);
                    var userData = JsonSerializer.Deserialize<UserData>(usersJson, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                    var userLookup = userData.Users.ToDictionary(u => u.Username, u => u.FullName, StringComparer.OrdinalIgnoreCase);

                    foreach (var offer in userOffers)
                    {
                        if (string.IsNullOrWhiteSpace(offer.SendUserFullName) && userLookup.TryGetValue(offer.SendUserEmail, out var fullName))
                        {
                            offer.SendUserFullName = fullName;
                        }
                    }
                }

                await Clients.Caller.SendAsync("OfferHistory", userOffers);
            }
        }
        
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception exception)
    {
        var username = Context.GetHttpContext().Request.Query["username"];
        if (!string.IsNullOrEmpty(username))
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, username);
        }
        await base.OnDisconnectedAsync(exception);
    }
}
