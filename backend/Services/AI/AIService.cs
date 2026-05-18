using Anthropic.SDK;
using Anthropic.SDK.Messaging;
using Fabric.API.Configuration;
using Microsoft.Extensions.Options;
using OpenAI;
using OpenAI.Chat;

namespace Fabric.API.Services.AI;

public interface IAIService
{
    Task<AIEvaluationResult> EvaluateAsync(string content, string guidelines, string modelProvider = "anthropic");
    Task<string> ApplyGuidelineAsync(string content, string guidelineText);
}

public record AIEvaluationResult(
    string Result,
    double ConfidenceScore,
    bool RequiresHumanReview,
    string RawResponse
);

public class AIService(IOptions<AppSettings> settings, ILogger<AIService> logger) : IAIService
{
    private readonly AppSettings _settings = settings.Value;

    public async Task<AIEvaluationResult> EvaluateAsync(
        string content, string guidelines, string modelProvider = "anthropic")
    {
        try
        {
            return modelProvider.ToLower() switch
            {
                "openai" => await EvaluateWithOpenAIAsync(content, guidelines),
                _ => await EvaluateWithAnthropicAsync(content, guidelines)
            };
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "AI evaluation failed for provider {Provider}", modelProvider);
            throw;
        }
    }

    public async Task<string> ApplyGuidelineAsync(string content, string guidelineText)
    {
        var client = new AnthropicClient(_settings.AnthropicApiKey);

        var prompt = $"""
            You are a data annotation assistant. Apply the following guidelines to evaluate the content.
            
            Guidelines:
            {guidelineText}
            
            Content to evaluate:
            {content}
            
            Respond with JSON: {{"label": "...", "confidence": 0.0-1.0, "reasoning": "..."}}
            """;

        var response = await client.Messages.GetClaudeMessageAsync(new MessageParameters
        {
            Model = AnthropicModels.Claude3Sonnet,
            MaxTokens = 1024,
            Messages = [new Message(RoleType.User, prompt)]
        });

        return response.Content[0].Text;
    }

    private async Task<AIEvaluationResult> EvaluateWithAnthropicAsync(string content, string guidelines)
    {
        var client = new AnthropicClient(_settings.AnthropicApiKey);

        var prompt = BuildEvaluationPrompt(content, guidelines);

        var response = await client.Messages.GetClaudeMessageAsync(new MessageParameters
        {
            Model = AnthropicModels.Claude3Sonnet,
            MaxTokens = 1024,
            Messages = [new Message(RoleType.User, prompt)]
        });

        var raw = response.Content[0].Text;
        return ParseAIResponse(raw);
    }

    private async Task<AIEvaluationResult> EvaluateWithOpenAIAsync(string content, string guidelines)
    {
        var client = new OpenAIClient(_settings.OpenAIApiKey);
        var chatClient = client.GetChatClient("gpt-4o");

        var prompt = BuildEvaluationPrompt(content, guidelines);

        var result = await chatClient.CompleteChatAsync(
        [
            ChatMessage.CreateSystemMessage("You are a precise data annotation evaluator. Always respond with valid JSON."),
            ChatMessage.CreateUserMessage(prompt)
        ]);

        var raw = result.Value.Content[0].Text;
        return ParseAIResponse(raw);
    }

    private static string BuildEvaluationPrompt(string content, string guidelines) => $"""
        You are an expert data annotation evaluator.

        Annotation Guidelines:
        {guidelines}

        Content to evaluate:
        {content}

        Evaluate the content according to the guidelines and respond with ONLY valid JSON:
        {{
          "label": "your classification label",
          "confidence": 0.95,
          "reasoning": "brief explanation",
          "flagged": false
        }}

        confidence must be between 0.0 and 1.0.
        """;

    private static AIEvaluationResult ParseAIResponse(string raw)
    {
        try
        {
            var json = System.Text.Json.JsonDocument.Parse(raw.Trim('`').Replace("```json", "").Replace("```", "").Trim());
            var root = json.RootElement;

            var label = root.GetProperty("label").GetString() ?? "unknown";
            var confidence = root.GetProperty("confidence").GetDouble();

            return new AIEvaluationResult(
                Result: label,
                ConfidenceScore: confidence,
                RequiresHumanReview: confidence < 0.75,
                RawResponse: raw
            );
        }
        catch
        {
            return new AIEvaluationResult(
                Result: "parse_error",
                ConfidenceScore: 0.0,
                RequiresHumanReview: true,
                RawResponse: raw
            );
        }
    }
}
