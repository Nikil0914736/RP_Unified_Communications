using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System.Net.Http.Headers;
using System.Runtime.Caching;
using System.Text;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RenewalController : ControllerBase
    {
        [HttpPost("GetExpiringRenewals")]
        public IActionResult getExpiringRenewals([FromBody] RequestPayload payload)
        {
			if (string.IsNullOrEmpty(payload?.Value))
            {
                return Ok(new {});
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
}
