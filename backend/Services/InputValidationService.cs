using System.Text.RegularExpressions;

namespace SecurePaymentsPortal.Services
{
    /// <summary>
    /// Centralised whitelist-based input validation.
    /// All regex patterns are anchored to prevent partial matches.
    /// </summary>
    public static class InputValidationService
    {
        // Letters and spaces only (2–100 chars)
        private static readonly Regex FullNameRegex =
            new(@"^[A-Za-z\s]{2,100}$", RegexOptions.Compiled);

        // Exactly 13 digits
        private static readonly Regex IdNumberRegex =
            new(@"^\d{13}$", RegexOptions.Compiled);

        // 8–12 digits
        private static readonly Regex AccountNumberRegex =
            new(@"^\d{8,12}$", RegexOptions.Compiled);

        // Positive decimal with up to 2 decimal places (max 15 digits before dp)
        private static readonly Regex AmountRegex =
            new(@"^\d{1,15}(\.\d{1,2})?$", RegexOptions.Compiled);

        // SWIFT/BIC: 8 or 11 uppercase alphanumeric characters
        private static readonly Regex SwiftCodeRegex =
            new(@"^[A-Z0-9]{8}([A-Z0-9]{3})?$", RegexOptions.Compiled);

        // Currency: 3–10 uppercase letters (e.g. USD, EUR, GBP)
        private static readonly Regex CurrencyRegex =
            new(@"^[A-Z]{3,10}$", RegexOptions.Compiled);

        // Password: min 8 chars, at least one uppercase, lowercase, digit, special char
        private static readonly Regex PasswordRegex =
            new(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&\-_])[A-Za-z\d@$!%*#?&\-_]{8,128}$",
                RegexOptions.Compiled);

        public static bool IsValidFullName(string value)      => FullNameRegex.IsMatch(value?.Trim() ?? "");
        public static bool IsValidIdNumber(string value)      => IdNumberRegex.IsMatch(value?.Trim() ?? "");
        public static bool IsValidAccountNumber(string value) => AccountNumberRegex.IsMatch(value?.Trim() ?? "");
        public static bool IsValidAmount(decimal amount)      => amount > 0 && AmountRegex.IsMatch(amount.ToString("F2"));
        public static bool IsValidSwiftCode(string value)     => SwiftCodeRegex.IsMatch(value?.Trim() ?? "");
        public static bool IsValidCurrency(string value)      => CurrencyRegex.IsMatch(value?.Trim() ?? "");
        public static bool IsValidPassword(string value)      => PasswordRegex.IsMatch(value ?? "");

        /// <summary>
        /// Strips dangerous HTML/script characters to prevent XSS when
        /// values are reflected back in responses.
        /// </summary>
        public static string Sanitize(string input)
        {
            if (string.IsNullOrWhiteSpace(input)) return string.Empty;
            return input
                .Replace("&", "&amp;")
                .Replace("<", "&lt;")
                .Replace(">", "&gt;")
                .Replace("\"", "&quot;")
                .Replace("'", "&#x27;")
                .Replace("/", "&#x2F;");
        }
    }
}
