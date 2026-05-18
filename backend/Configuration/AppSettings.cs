namespace Fabric.API.Configuration;

public class AppSettings
{
    public string OpenAIApiKey { get; set; } = string.Empty;
    public string AnthropicApiKey { get; set; } = string.Empty;
    public double DefaultConfidenceThreshold { get; set; } = 0.75;
    public string AllowedOrigins { get; set; } = "http://localhost:4200";
}
