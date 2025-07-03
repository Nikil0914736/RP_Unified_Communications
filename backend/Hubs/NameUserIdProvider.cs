using Microsoft.AspNetCore.SignalR;

namespace backend.Hubs
{
    public class NameUserIdProvider : IUserIdProvider
    {
        public string? GetUserId(HubConnectionContext connection)
        {
            // Use the 'username' from the query string as the user identifier
            return connection.GetHttpContext()?.Request.Query["username"];
        }
    }
}
