using backend.Hubs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace backend.Controllers
{
    // This controller is likely obsolete as the frontend now invokes the hub directly.
[ApiController]
    [Route("api/[controller]")]
    public class BroadcastController : ControllerBase
    {
        private readonly IHubContext<BroadcastHub, IBroadcastHub> _hubContext;

        public BroadcastController(IHubContext<BroadcastHub, IBroadcastHub> hubContext)
        {
            _hubContext = hubContext;
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] Message message)
        {
            await _hubContext.Clients.All.BroadcastMessage(message.Subject, message.Content, message.FullName, DateTime.UtcNow);
            return Ok();
        }
    }

        public class Message
    {
        public string Subject { get; set; }
        public string Content { get; set; }
        public string FullName { get; set; }
    }
}
