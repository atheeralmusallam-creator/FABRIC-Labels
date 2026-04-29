// src/components/annotators/AudioTranscriptionRenderer.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { AudioTranscriptionConfig, AudioTranscriptionResult, AudioTaskData } from "@/types";

interface Props {
  data: AudioTaskData;
  config: AudioTranscriptionConfig;
  result: AudioTranscriptionResult | null;
  onChange: (r: AudioTranscriptionResult) => void;
}

export function AudioTranscriptionRenderer({ data, config, result, onChange }: Props) {
  const [transcript, setTranscript] = useState(result?.transcript ?? "");
  const [language, setLanguage] = useState(result?.language ?? (config.languages?.[0] ?? "English"));
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (result) {
      setTranscript(result.transcript ?? "");
      setLanguage(result.language ?? config.languages?.[0] ?? "English");
    }
  }, [result]);

  const handleTranscriptChange = (v: string) => {
    setTranscript(v);
    onChange({ transcript: v, language });
  };

  const handleLanguageChange = (v: string) => {
    setLanguage(v);
    onChange({ transcript, language: v });
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || duration === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    audioRef.current.currentTime = pct * duration;
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5 fade-in">
      {config.instructions && (
        <div className="text-xs text-[var(--text-muted)] bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg px-4 py-3">
          📋 {config.instructions}
        </div>
      )}

      {/* Audio info */}
      {data.description && (
        <div className="text-sm text-[var(--text-secondary)] font-medium">{data.description}</div>
      )}

      {/* Audio Player */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-5 space-y-4">
        <audio
          ref={audioRef}
          src={data.audioUrl}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
          onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime ?? 0)}
          onLoadedMetadata={() => setDuration(audioRef.current?.duration ?? 0)}
          preload="metadata"
        />

        <div className="flex items-center gap-4">
          {/* Play/Pause button */}
          <button
            onClick={togglePlay}
            className="w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center transition-colors flex-shrink-0"
          >
            {playing ? (
              <svg className="w-4 h-4 text-[var(--text-primary)]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-[var(--text-primary)] ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          {/* Waveform / Progress bar */}
          <div className="flex-1 space-y-1">
            <div
              className="h-2 bg-[#2a2d3e] rounded-full cursor-pointer overflow-hidden"
              onClick={seek}
            >
              <div
                className="h-full bg-indigo-500 rounded-full transition-all"
                style={{ width: duration > 0 ? `${(currentTime / duration) * 100}%` : "0%" }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-600">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Speed */}
          <select
            defaultValue="1"
            className="bg-[var(--bg-primary)] border border-[var(--border)] text-xs text-[var(--text-secondary)] rounded px-2 py-1"
            onChange={(e) => { if (audioRef.current) audioRef.current.playbackRate = parseFloat(e.target.value); }}
          >
            <option value="0.5">0.5x</option>
            <option value="0.75">0.75x</option>
            <option value="1">1x</option>
            <option value="1.25">1.25x</option>
            <option value="1.5">1.5x</option>
          </select>
        </div>

        {/* Keyboard shortcut hint */}
        <p className="text-xs text-[var(--text-muted)]">
          Tip: Space bar plays/pauses · Adjust speed for faster review
        </p>
      </div>

      {/* Language selector */}
      {config.languages && config.languages.length > 1 && (
        <div>
          <label className="block text-xs text-[var(--text-muted)] mb-2 uppercase tracking-wide">Language</label>
          <div className="flex flex-wrap gap-2">
            {config.languages.map((lang) => (
              <button
                key={lang}
                onClick={() => handleLanguageChange(lang)}
                className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${
                  language === lang
                    ? "border-indigo-500 bg-indigo-500/10 text-indigo-300"
                    : "border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Transcription textarea */}
      <div>
        <label className="block text-xs text-[var(--text-muted)] uppercase tracking-wide mb-2">
          Transcription
        </label>
        <textarea
          value={transcript}
          onChange={(e) => handleTranscriptChange(e.target.value)}
          placeholder="Type what you hear... Use [unclear] for inaudible sections."
          rows={6}
          className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] focus:border-indigo-500/50 rounded-xl px-4 py-3 text-sm text-[var(--text-secondary)] placeholder:text-[var(--text-muted)] outline-none transition-colors resize-none font-mono"
        />
        <div className="flex justify-between mt-1">
          <span className="text-xs text-[var(--text-muted)]">{transcript.length} characters</span>
          <span className="text-xs text-[var(--text-muted)]">{transcript.trim().split(/\s+/).filter(Boolean).length} words</span>
        </div>
      </div>
    </div>
  );
}
