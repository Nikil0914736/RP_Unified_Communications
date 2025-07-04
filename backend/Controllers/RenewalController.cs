using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System.Net.Http.Headers;
using System.Runtime.Caching;
using System.Text;
using System.Text.Json;
using static backend.Controllers.RenewalController;

using Microsoft.AspNetCore.SignalR;
using backend.Models;

namespace backend.Controllers
{
	[ApiController]
	[Route("api/[controller]")]
	public class RenewalController : ControllerBase
	{
		private readonly IHubContext<OfferHub> _offerHubContext;

		public RenewalController(IHubContext<OfferHub> offerHubContext)
		{
			_offerHubContext = offerHubContext;
		}
		[HttpPost("GetExpiringRenewals")]
		public IActionResult getExpiringRenewals([FromBody] RequestPayload payload)
		{
			if (string.IsNullOrEmpty(payload?.Value))
			{
				return Ok(new { });
			}

			var result = "";
			try
			{
				using var _httpClient = new HttpClient();
				//string _pmcURL = "https://" + "lm-10-22-173-149.onesitedev.realpage.com";
				//byte[] data = Convert.FromBase64String("ODMxQjQyOUMtN0FCNi00Q0ZGLThDNUMtRjU4ODU4MjU0RjBF");
				//string secretKey = Encoding.ASCII.GetString(data);
				//string _authToken = GetAuthenticationTokenForClient(_pmcURL + "/api/core/authentication/login", "OS_KONG_RPX", secretKey, "4341841");
				//string appContext = GetAppContext();

				//var methodUrl = String.Format("/api/renewals/RenewalsView/v1/company/4341841/property/4341871/expiring/Stabilized/Offers", "");
				//const string mediaTypeName = "application/json";

				string _pmcURL = "https://" + "sat2016g.sat.realpage.com";
				byte[] data = Convert.FromBase64String("ODMxQjQyOUMtN0FCNi00Q0ZGLThDNUMtRjU4ODU4MjU0RjBF");
				string secretKey = Encoding.ASCII.GetString(data);
				string _authToken = GetAuthenticationTokenForClient(_pmcURL + "/api/core/authentication/login", "OS_KONG_RPX", secretKey, "4341841");
				string appContext = GetAppContext();

				var methodUrl = String.Format("/api/renewals/RenewalsView/v1/company/7696378/property/7596389/expiring/Stabilized/Offers", "");
				const string mediaTypeName = "application/json";

				_httpClient.BaseAddress = new Uri(_pmcURL);
				_httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue(mediaTypeName));
				_httpClient.DefaultRequestHeaders.Add("company-id", "4341841");
				_httpClient.DefaultRequestHeaders.Add("property-id", "4341871");
				_httpClient.DefaultRequestHeaders.Add("user-id", "1234567");
				_httpClient.DefaultRequestHeaders.Add("AppContext", appContext);
				_httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _authToken);
				StringContent Content = new StringContent("");

				HttpResponseMessage response = _httpClient.GetAsync(methodUrl).Result;

				if (response.IsSuccessStatusCode)
				{
					result = response.Content.ReadAsStringAsync().Result;
				}
			}
			catch (Exception ex)
			{
				string message = ex.Message;
			}

			return Ok(result);
		}

		// DTO to represent the incoming data from the frontend
		public class NewOfferDto
		{
			public string SelectedType { get; set; }
			public string SendUserEmail { get; set; }
			public string SendUserFullName { get; set; }
			public DateTime DateTime { get; set; }
			public string UserEmail { get; set; }
		}

		// This represents the structure of the object we'll save to the JSON file
		public class OfferRecord : NewOfferDto
		{
			public Guid Guid { get; set; }
		}

		[HttpPost("NewOffer")]
		public async Task<IActionResult> SendNewOffer([FromBody] NewOfferDto offerDetails)
		{
			if (offerDetails == null)
			{
				return BadRequest("Offer details cannot be null.");
			}

			try
			{
				var offerRecord = new OfferRecord
				{
					Guid = Guid.NewGuid(), // Generate GUID on the backend
					SelectedType = offerDetails.SelectedType,
					SendUserEmail = offerDetails.SendUserEmail,
					SendUserFullName = offerDetails.SendUserFullName,
					DateTime = offerDetails.DateTime,
					UserEmail = offerDetails.UserEmail
				};

				var filePath = Path.Combine(Directory.GetCurrentDirectory(), "offers.json");

				List<OfferRecord> offers = new List<OfferRecord>();

				if (System.IO.File.Exists(filePath))
				{
					var existingJson = await System.IO.File.ReadAllTextAsync(filePath);
					if (!string.IsNullOrWhiteSpace(existingJson))
					{
						offers = System.Text.Json.JsonSerializer.Deserialize<List<OfferRecord>>(existingJson);
					}
				}

				offers.Add(offerRecord);

				var newJson = System.Text.Json.JsonSerializer.Serialize(offers, new JsonSerializerOptions { WriteIndented = true });
				await System.IO.File.WriteAllTextAsync(filePath, newJson);

				Console.WriteLine($"RenewalController: Attempting to send 'ReceiveOffer' to group {offerDetails.UserEmail}.");
				await _offerHubContext.Clients.Group(offerDetails.UserEmail).SendAsync("ReceiveOffer", offerRecord);

				return Ok(new { message = "New offer saved successfully." });
			}
			catch (Exception ex)
			{
				// Log the exception (e.g., using a logging framework)
				Console.WriteLine($"Error saving new offer: {ex.Message}");
				return StatusCode(500, "An internal server error occurred.");
			}
		}


		[HttpGet("GetOffers")]
		public async Task<IActionResult> GetOffers([FromQuery] string email)
		{
			if (string.IsNullOrEmpty(email))
			{
				return BadRequest("Email parameter is required.");
			}

			var filePath = Path.Combine(Directory.GetCurrentDirectory(), "offers.json");

			if (!System.IO.File.Exists(filePath))
			{
				return Ok(new List<OfferRecord>()); // Return an empty list if the file doesn't exist
			}

			try
			{
				var json = await System.IO.File.ReadAllTextAsync(filePath);
				if (string.IsNullOrWhiteSpace(json))
				{
					return Ok(new List<OfferRecord>()); // Return an empty list if the file is empty
				}

				var allOffers = System.Text.Json.JsonSerializer.Deserialize<List<OfferRecord>>(json);

				// Filter the offers for the specified email, ignoring case
				var userOffers = allOffers
					.Where(o => o.UserEmail.Equals(email, StringComparison.OrdinalIgnoreCase))
					.ToList();

				// Enrich offers with sender's full name if it's missing
				var usersFilePath = Path.Combine(Directory.GetCurrentDirectory(), "users.json");
				if (System.IO.File.Exists(usersFilePath))
				{
					var usersJson = await System.IO.File.ReadAllTextAsync(usersFilePath);
					var userData = System.Text.Json.JsonSerializer.Deserialize<UserData>(usersJson, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
					var userLookup = userData.Users.ToDictionary(u => u.Username, u => u.FullName, StringComparer.OrdinalIgnoreCase);

					foreach (var offer in userOffers)
					{
						if (string.IsNullOrWhiteSpace(offer.SendUserFullName) && userLookup.TryGetValue(offer.SendUserEmail, out var fullName))
						{
							offer.SendUserFullName = fullName;
						}
					}
				}

				return Ok(userOffers);
			}
			catch (Exception ex)
			{
				// Log the exception for debugging
				Console.WriteLine($"Error reading or deserializing offers.json: {ex.Message}");
				return StatusCode(500, "An internal server error occurred while fetching offers.");
			}
		}



		private string GetAuthenticationTokenForClient(string uri, string clientName, string clientSecret, string entityId)
		{
			ObjectCache cache = System.Runtime.Caching.MemoryCache.Default;
			CacheItemPolicy policy = new CacheItemPolicy();
			string authenticationToken = string.Empty;
			string tokenExpirationTime = string.Empty;
			string cacheToken = cache["Cache_AuthenticationToken_" + entityId] as string;
			if (string.IsNullOrEmpty(cacheToken))
			{
				HttpClient _client = new HttpClient();
				var requestMessage = new HttpRequestMessage(HttpMethod.Post, uri);
				_client.DefaultRequestHeaders.TryAddWithoutValidation("Content-Type", "application/json; charset=utf-8");
				requestMessage.Content = new StringContent("client_id=" + clientName + "&grant_type=client_credentials&client_secret=" + clientSecret, System.Text.Encoding.UTF8, "application/json");
				var jsonString = _client.SendAsync(requestMessage);
				var jObject = Newtonsoft.Json.Linq.JObject.Parse(jsonString.Result.Content.ReadAsStringAsync().Result);
				if (jObject["access_token"] != null)
				{
					authenticationToken = (string)jObject["access_token"];
				}
				if (jObject["expires_in"] != null)
				{
					tokenExpirationTime = jObject["expires_in"].ToString();
				}
				int reloadTime = string.IsNullOrWhiteSpace(tokenExpirationTime) ? 3600 : Convert.ToInt32(tokenExpirationTime);
				policy.AbsoluteExpiration = DateTimeOffset.Now.AddSeconds(reloadTime - 60);
				cache.Set("Cache_AuthenticationToken_" + entityId, authenticationToken, policy);
			}
			else
			{
				authenticationToken = cacheToken;
			}
			return authenticationToken;
		}

		private string GetAppContext()
		{
			string pmcJson = JsonConvert.SerializeObject(new { PMCId = 4341841 }).ToString();
			var plainTextBytes = System.Text.Encoding.UTF8.GetBytes(pmcJson);
			return System.Convert.ToBase64String(plainTextBytes);
		}
	}

	public class RequestPayload
	{
		public string Value { get; set; }
	}

	public class MarkAsReadRequest
	{
		public Guid OfferId { get; set; }
	}
}
