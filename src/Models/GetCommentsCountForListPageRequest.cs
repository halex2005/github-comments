using System.ComponentModel.DataAnnotations;

namespace csharp.Models
{
    public class GetCommentsCountForListPageRequest
    {
        [Required(ErrorMessage = "'pagesize' query parameter is required")]
        public string PageSize { get; set; }

        [RegularExpression(ValidationConstants.ValidateBase64, ErrorMessage = "unsupported data for 'offset' query string parameter")]
        public string Offset { get; set; }
    }
}