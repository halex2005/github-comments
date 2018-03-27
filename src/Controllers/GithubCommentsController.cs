using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using System.ComponentModel.DataAnnotations;
using System.Net.Http;
using System.Text;
using csharp.Models;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace csharp.Controllers
{
    [Route("api/[controller]")]
    public class ValuesController : Controller
    {
        IOptions<GithubSettings> githubSettings;

        public ValuesController(IOptions<GithubSettings> githubSettings)
        {
            this.githubSettings = githubSettings;
        }

        // GET api/values
        [HttpGet]
        [Route("/page-comments")]
        public Task<ActionResult> GetPageComments(
            [FromQuery] GetPageCommentsRequestModel model)
        {
            if (!ModelState.IsValid) {
                return Task.FromResult<ActionResult>(new ContentResult() {
                    Content = JsonConvert.SerializeObject(ModelState.SelectMany(x => x.Value.Errors)),
                    StatusCode = 400
                });
            }

            var afterKeyFilter = string.IsNullOrEmpty(model.After)
                ? ""
                : $", after: \"{model.After}\"";
            var pageCommentsQuery = $@"
issue(number: {model.Number}) {{
    url
    comments(first:100{afterKeyFilter}) {{
        totalCount
        pageInfo {{
            startCursor
            endCursor
            hasNextPage
        }}
        nodes {{
            bodyHTML
            createdAt
            author {{
                login
                avatarUrl
                url
            }}
        }}
    }}
}}";
            return FetchGithubGraphQl(pageCommentsQuery);
        }

        // GET api/values/5
        [HttpGet]
        [Route("/list-page-comments-count")]
        public Task<ActionResult> GetCommentsCountForListPage(GetCommentsCountForListPageRequest model)
        {
            if (!ModelState.IsValid)
            {
                return Task.FromResult<ActionResult>(new ContentResult() {
                    Content = JsonConvert.SerializeObject(ModelState.SelectMany(x => x.Value.Errors)),
                    StatusCode = 400
                });
            }

            var afterKeyFilter = string.IsNullOrEmpty(model.Offset)
                ? ""
                : $", after: \"{model.Offset}\"";
            var commentsCountQuery = $@"
issues(first: {model.PageSize}, orderBy:{{direction:DESC, field:CREATED_AT}}{afterKeyFilter}) {{
    totalCount
    pageInfo {{
        startCursor
        endCursor
        hasNextPage
    }}
    nodes {{
        number
        title
        comments {{
            totalCount
        }}
    }}
}}
";
            return FetchGithubGraphQl(commentsCountQuery);
        }

        private async Task<ActionResult> FetchGithubGraphQl(string repositoryLevelQuery)
        {
            var settings = githubSettings.Value;
            var httpClient = new HttpClient();
            var query = $@"
query {{
    repository(owner: ""{settings.Owner}"", name: ""{settings.Repository}"") {{
        {repositoryLevelQuery}
    }}
    rateLimit {{
        limit
        cost
        remaining
        resetAt
    }}
}}";
            var requestBody = $@"{{ ""query"": {JsonConvert.SerializeObject(query)} }}";
            var request = new HttpRequestMessage() {
                RequestUri = new Uri(settings.ApiEndpoint),
                Method = HttpMethod.Post,
                Headers = {
                    { "Authorization", $"bearer {githubSettings.Value.OAuthToken}" }
                },
                Content = new StringContent(
                    requestBody,
                    Encoding.UTF8,
                    "application/json"
                ),
            };
            foreach (var kv in Request.Headers.Where(kv => !DisabledRequestHeaders.Contains(kv.Key)))
            {
                request.Headers.Add(kv.Key, kv.Value.ToArray());
            }

            var response = await httpClient.SendAsync(request).ConfigureAwait(false);
            var content = await response.Content.ReadAsStringAsync().ConfigureAwait(false);

            foreach (var kv in response.Headers.Where(kv => EnabledResponseHeaders.Contains(kv.Key)))
            {
                Response.Headers.Add(kv.Key, kv.Value.ToArray());
            }
            return new ContentResult() {
                Content =  JValue.Parse(content).ToString(Formatting.Indented),
                ContentType = response.Content.Headers.ContentType.ToString(),
                StatusCode = (int)response.StatusCode
            };
        }

        static string[] DisabledRequestHeaders = {
            "Accept",
            "Accept-Encoding",
            "Connection",
            "Cookie",
            "Host",
            "Upgrade-Insecure-Requests",
        };

        static string[] EnabledResponseHeaders = {
            "Cache-Control",
            "Content-Security-Policy",
            "Date",
            "Server",
            "Strict-Transport-Security",
            "ETag",
            "Link",
            "Retry-After",
            "X-Poll-Interval",
            "X-GitHub-Media-Type",
            "X-GitHub-Request-Id",
            "X-Frame-Options",
            "X-XSS-Protection"
        };
    }
}
