namespace csharp.Models
{
    public class ValidationConstants
    {
        public const string ValidatePositiveNumber = @"^[1-9][0-9]*$";
        public const string ValidateBase64 = @"^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$";
    }
}