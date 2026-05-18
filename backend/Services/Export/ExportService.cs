using ClosedXML.Excel;
using CsvHelper;
using Fabric.API.Data;
using Fabric.API.Models.Entities;
using Microsoft.EntityFrameworkCore;
using System.Globalization;
using System.Text;
using System.Text.Json;

namespace Fabric.API.Services.Export;

public interface IExportService
{
    Task<ExportResult> ExportProjectResultsAsync(string projectId, ExportFormat format, string exportedById);
}

public record ExportResult(byte[] Data, string FileName, string ContentType);

public class ExportService(FabricDbContext db) : IExportService
{
    public async Task<ExportResult> ExportProjectResultsAsync(
        string projectId, ExportFormat format, string exportedById)
    {
        var results = await db.FinalResults
            .Where(r => r.CustomerProjectId == projectId)
            .OrderBy(r => r.FinalizedAt)
            .ToListAsync();

        var project = await db.CustomerProjects.FindAsync(projectId)
            ?? throw new KeyNotFoundException($"Project {projectId} not found");

        // Log the export
        db.ExportLogs.Add(new ExportLog
        {
            CustomerProjectId = projectId,
            Format = format,
            ExportedById = exportedById
        });
        await db.SaveChangesAsync();

        return format switch
        {
            ExportFormat.CSV => ExportToCsv(results, project.Name),
            ExportFormat.JSON => ExportToJson(results, project.Name),
            ExportFormat.Excel => ExportToExcel(results, project.Name),
            _ => throw new ArgumentOutOfRangeException(nameof(format))
        };
    }

    private static ExportResult ExportToCsv(List<FinalResult> results, string projectName)
    {
        using var ms = new MemoryStream();
        using var writer = new StreamWriter(ms, Encoding.UTF8);
        using var csv = new CsvWriter(writer, CultureInfo.InvariantCulture);

        csv.WriteHeader<CsvRow>();
        csv.NextRecord();
        foreach (var r in results)
        {
            csv.WriteRecord(new CsvRow(r.ItemContent, r.FinalLabel, r.Source,
                r.ConfidenceScore?.ToString("F2") ?? "", r.FinalizedAt.ToString("O"), r.ReviewerId ?? ""));
            csv.NextRecord();
        }

        writer.Flush();
        return new ExportResult(ms.ToArray(), $"{projectName}_results.csv", "text/csv");
    }

    private static ExportResult ExportToJson(List<FinalResult> results, string projectName)
    {
        var data = results.Select(r => new
        {
            r.ItemContent,
            r.FinalLabel,
            r.Source,
            r.ConfidenceScore,
            r.FinalizedAt,
            r.ReviewerId
        });

        var json = JsonSerializer.Serialize(data, new JsonSerializerOptions { WriteIndented = true });
        return new ExportResult(
            Encoding.UTF8.GetBytes(json),
            $"{projectName}_results.json",
            "application/json");
    }

    private static ExportResult ExportToExcel(List<FinalResult> results, string projectName)
    {
        using var workbook = new XLWorkbook();
        var ws = workbook.Worksheets.Add("Results");

        // Header row
        var headers = new[] { "Content", "Label", "Source", "Confidence", "Finalized At", "Reviewer" };
        for (int i = 0; i < headers.Length; i++)
        {
            var cell = ws.Cell(1, i + 1);
            cell.Value = headers[i];
            cell.Style.Font.Bold = true;
            cell.Style.Fill.BackgroundColor = XLColor.FromHtml("#009688");
            cell.Style.Font.FontColor = XLColor.White;
        }

        // Data rows
        for (int i = 0; i < results.Count; i++)
        {
            var r = results[i];
            var row = i + 2;
            ws.Cell(row, 1).Value = r.ItemContent;
            ws.Cell(row, 2).Value = r.FinalLabel;
            ws.Cell(row, 3).Value = r.Source;
            ws.Cell(row, 4).Value = r.ConfidenceScore?.ToString("F2") ?? "";
            ws.Cell(row, 5).Value = r.FinalizedAt.ToString("O");
            ws.Cell(row, 6).Value = r.ReviewerId ?? "";
        }

        ws.Columns().AdjustToContents();

        using var ms = new MemoryStream();
        workbook.SaveAs(ms);
        return new ExportResult(
            ms.ToArray(),
            $"{projectName}_results.xlsx",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    }

    private record CsvRow(string Content, string Label, string Source,
        string Confidence, string FinalizedAt, string ReviewerId);
}
