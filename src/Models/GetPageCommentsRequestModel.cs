using System.ComponentModel.DataAnnotations;

namespace csharp.Models
{
    public class GetPageCommentsRequestModel
    {

        [Required(ErrorMessage = "'number' query string parameter is required")]
        [RegularExpression(ValidationConstants.ValidatePositiveNumber, ErrorMessage = "'number' query string parameter must be positive integer")]
        public string Number { get; set; }

        [RegularExpression(ValidationConstants.ValidateBase64, ErrorMessage = "unsupported data for 'after' query string parameter")]
        public string After { get; set; }
    }
}