using Fabric.API.Data;
using Fabric.API.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace Fabric.API.Services.Review;

public interface IReviewService
{
    Task<HumanReview?> GetNextReviewAsync(string reviewerId);
    Task<HumanReview?> AssignReviewAsync(string reviewId, string reviewerId);
    Task<ReviewResponse> CompleteReviewAsync(string reviewId, string reviewerId, string decision, string? finalLabel, string? notes);
    Task<List<HumanReview>> GetReviewQueueAsync(int page = 1, int pageSize = 20);
}

public class ReviewService(FabricDbContext db) : IReviewService
{
    public async Task<HumanReview?> GetNextReviewAsync(string reviewerId)
    {
        // Get next unassigned review, or one assigned to this reviewer
        return await db.HumanReviews
            .Include(r => r.CustomerProject)
            .Where(r => r.Status == ReviewStatus.Pending ||
                       (r.Status == ReviewStatus.InProgress && r.AssignedToId == reviewerId))
            .OrderBy(r => r.CreatedAt)
            .FirstOrDefaultAsync();
    }

    public async Task<HumanReview?> AssignReviewAsync(string reviewId, string reviewerId)
    {
        var review = await db.HumanReviews.FindAsync(reviewId);
        if (review == null) return null;

        review.AssignedToId = reviewerId;
        review.Status = ReviewStatus.InProgress;
        await db.SaveChangesAsync();
        return review;
    }

    public async Task<ReviewResponse> CompleteReviewAsync(
        string reviewId, string reviewerId, string decision, string? finalLabel, string? notes)
    {
        var review = await db.HumanReviews
            .Include(r => r.CustomerProject)
            .FirstOrDefaultAsync(r => r.Id == reviewId)
            ?? throw new KeyNotFoundException($"Review {reviewId} not found");

        var response = new ReviewResponse
        {
            HumanReviewId = reviewId,
            ReviewerId = reviewerId,
            Decision = decision,
            FinalLabel = finalLabel,
            Notes = notes
        };

        db.ReviewResponses.Add(response);
        review.Status = ReviewStatus.Completed;
        review.CompletedAt = DateTime.UtcNow;

        // Create final result
        db.FinalResults.Add(new FinalResult
        {
            CustomerProjectId = review.CustomerProjectId,
            ItemContent = review.ItemContent,
            FinalLabel = finalLabel ?? decision,
            Source = "Human",
            ReviewerId = reviewerId,
            ConfidenceScore = 1.0
        });

        await db.SaveChangesAsync();
        return response;
    }

    public async Task<List<HumanReview>> GetReviewQueueAsync(int page = 1, int pageSize = 20) =>
        await db.HumanReviews
            .Include(r => r.CustomerProject)
            .Include(r => r.AssignedTo)
            .Where(r => r.Status == ReviewStatus.Pending || r.Status == ReviewStatus.InProgress)
            .OrderBy(r => r.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
}

// ── Duplicate Detection ───────────────────────────────────────────────────────

public interface IDuplicateDetectionService
{
    Task<List<DuplicateMatch>> FindDuplicatesAsync(string projectId, double threshold = 0.85);
}

public record DuplicateMatch(string TaskId1, string TaskId2, double Similarity, string Algorithm);

public class DuplicateDetectionService(FabricDbContext db) : IDuplicateDetectionService
{
    public async Task<List<DuplicateMatch>> FindDuplicatesAsync(string projectId, double threshold = 0.85)
    {
        var tasks = await db.Tasks
            .Where(t => t.ProjectId == projectId)
            .Select(t => new { t.Id, t.Content })
            .ToListAsync();

        var duplicates = new List<DuplicateMatch>();

        for (int i = 0; i < tasks.Count; i++)
        {
            for (int j = i + 1; j < tasks.Count; j++)
            {
                var jaccardSim = JaccardSimilarity(tasks[i].Content, tasks[j].Content);
                if (jaccardSim >= threshold)
                {
                    duplicates.Add(new DuplicateMatch(tasks[i].Id, tasks[j].Id, jaccardSim, "Jaccard"));
                }
            }
        }

        return duplicates;
    }

    private static double JaccardSimilarity(string a, string b)
    {
        var setA = a.ToLower().Split(' ').ToHashSet();
        var setB = b.ToLower().Split(' ').ToHashSet();
        var intersection = setA.Intersect(setB).Count();
        var union = setA.Union(setB).Count();
        return union == 0 ? 0 : (double)intersection / union;
    }
}
