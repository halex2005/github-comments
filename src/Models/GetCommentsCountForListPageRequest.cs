using System.ComponentModel.DataAnnotations;

namespace csharp.Models
{
    public class GetCommentsCountForListPageRequest
    {
        [Required(ErrorMessage = "'pagesize' query parameter is required")]
        [RegularExpression(ValidationConstants.ValidatePositiveNumber, ErrorMessage = "'pagesize' query string parameter must be positive integer")]
        public string PageSize { get; set; }

        [RegularExpression(ValidationConstants.ValidateBase64, ErrorMessage = "unsupported data for 'offset' query string parameter")]
        public string After { get; set; }

        public bool Pretty { get; set; }
    }
}