"use client";

import { TaskStatus } from "@/types";

interface Props {
  notes: string;
  onNotesChange: (v: string) => void;
  onSubmit: () => void;
  onSkip: () => void;
  saving: boolean;
  draftState: "idle" | "saving" | "saved" | "error";
  canSubmit: boolean;
  taskStatus: TaskStatus;
  annotationStatus?: "DRAFT" | "SUBMITTED";
}

export function AnnotationPanel({
  notes,
  onNotesChange,
  onSubmit,
  onSkip,
  saving,
  draftState,
  canSubmit,
  taskStatus,
  annotationStatus,
}: Props) {
  const isSubmitted = annotationStatus === "SUBMITTED" || taskStatus === "SUBMITTED";

  return (
    <div
      className="flex-shrink-0 border-t px-5 py-4 transition-colors duration-300"
      style={{
        background: isSubmitted
          ? "color-mix(in srgb, var(--bg-secondary) 92%, #22c55e 8%)"
          : "var(--bg-secondary)",
        borderColor: isSubmitted ? "#22c55e44" : "var(--border)",
      }}
    >
      {/* ── Status bar ── */}
      <div
        className="mb-3 px-3 py-2 rounded-lg flex items-center gap-2 text-xs font-medium transition-all duration-300"
        style={{
          background: isSubmitted
            ? "rgba(34,197,94,0.12)"
            : draftState === "saved"
            ? "rgba(99,102,241,0.1)"
            : draftState === "saving"
            ? "rgba(59,130,246,0.08)"
            : draftState === "error"
            ? "rgba(239,68,68,0.1)"
            : "var(--bg-surface)",
          border: `1px solid ${
            isSubmitted
              ? "rgba(34,197,94,0.35)"
              : draftState === "saved"
              ? "rgba(99,102,241,0.3)"
              : draftState === "saving"
              ? "rgba(59,130,246,0.25)"
              : draftState === "error"
              ? "rgba(239,68,68,0.3)"
              : "var(--border)"
          }`,
          color: isSubmitted
            ? "#22c55e"
            : draftState === "saved"
            ? "var(--brand)"
            : draftState === "saving"
            ? "#60a5fa"
            : draftState === "error"
            ? "#f87171"
            : "var(--text-muted)",
        }}
      >
        {isSubmitted && (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <span>Submitted — you can move to the next question</span>
          </>
        )}
        {!isSubmitted && draftState === "saved" && (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
            </svg>
            <span>Draft saved — press Submit when ready</span>
          </>
        )}
        {!isSubmitted && draftState === "saving" && (
          <>
            <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
            <span>Saving draft...</span>
          </>
        )}
        {!isSubmitted && draftState === "error" && (
          <>
            <span>⚠ Draft save failed</span>
          </>
        )}
        {!isSubmitted && draftState === "idle" && (
          <span>Select an answer below then Submit</span>
        )}
      </div>

      {/* ── Notes ── */}
      <div className="mb-3">
        <label className="block text-xs mb-1.5" style={{ color: "var(--text-muted)" }}>
          Notes / Comments
          <span className="ml-2" style={{ color: "var(--text-muted)" }}>(Enter = new line · Ctrl+Enter = submit)</span>
        </label>
        <textarea
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
              e.preventDefault();
              if (canSubmit) onSubmit();
            }
          }}
          placeholder="Optional notes about this annotation..."
          rows={2}
          className="w-full rounded-lg px-3 py-2 text-sm outline-none transition-colors resize-none"
          style={{
            background: "var(--bg-primary)",
            border: "1px solid var(--border)",
            color: "var(--text-primary)",
          }}
        />
      </div>

      {/* ── Actions ── */}
      <div className="flex items-center justify-between">
        <button
          onClick={onSkip}
          className="text-xs px-4 py-2 rounded-lg border transition-colors"
          style={{
            background: "var(--bg-surface)",
            borderColor: "var(--border)",
            color: "var(--text-secondary)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.color = "#facc15";
            (e.currentTarget as HTMLElement).style.borderColor = "rgba(202,138,4,0.5)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
            (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
          }}
        >
          Skip
        </button>

        <button
          onClick={onSubmit}
          disabled={saving || !canSubmit}
          className="px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
          style={{
            background: isSubmitted
              ? "linear-gradient(135deg,#16a34a,#15803d)"
              : "linear-gradient(135deg,#6366f1,#4f46e5)",
            color: "#fff",
            boxShadow: isSubmitted
              ? "0 2px 12px rgba(22,163,74,0.35)"
              : "0 2px 12px rgba(99,102,241,0.35)",
          }}
        >
          {saving ? (
            <>
              <svg className="animate-spin" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
              Saving...
            </>
          ) : isSubmitted ? (
            <>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Update
            </>
          ) : (
            <>
              Submit
              <span className="text-indigo-300 text-xs hidden sm:inline">↵</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
