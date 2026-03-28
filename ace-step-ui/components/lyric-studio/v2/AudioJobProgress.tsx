/**
 * AudioJobProgress.tsx — Full-width progress bar for active audio generation jobs.
 * Shows stage, progress percentage, queue position, and elapsed time.
 * Polls job status every 2s and auto-removes completed/failed jobs.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Loader2, Music, CheckCircle2, XCircle, X } from 'lucide-react';
import { generateApi, GenerationJob } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';

export interface ActiveJob {
  jobId: string;
  title: string;
  generationId: number;
}

interface JobStatus extends ActiveJob {
  status: 'pending' | 'queued' | 'running' | 'succeeded' | 'failed';
  progress?: number;
  stage?: string;
  queuePosition?: number;
  error?: string;
}

interface AudioJobProgressProps {
  activeJobs: ActiveJob[];
  onJobComplete: (jobId: string) => void;
  onJobRemove: (jobId: string) => void;
}

export const AudioJobProgress: React.FC<AudioJobProgressProps> = ({
  activeJobs, onJobComplete, onJobRemove,
}) => {
  const { token } = useAuth();
  const [statuses, setStatuses] = useState<Map<string, JobStatus>>(new Map());
  const [elapsed, setElapsed] = useState<Map<string, number>>(new Map());
  const startTimes = useRef<Map<string, number>>(new Map());
  const completedRef = useRef<Set<string>>(new Set());

  // Track start times for new jobs
  useEffect(() => {
    for (const job of activeJobs) {
      if (!startTimes.current.has(job.jobId)) {
        startTimes.current.set(job.jobId, Date.now());
      }
    }
  }, [activeJobs]);

  // Poll job statuses
  useEffect(() => {
    if (activeJobs.length === 0 || !token) return;

    const poll = async () => {
      const newStatuses = new Map(statuses);
      const newElapsed = new Map<string, number>();

      for (const job of activeJobs) {
        if (completedRef.current.has(job.jobId)) continue;

        try {
          const res = await generateApi.getStatus(job.jobId, token);
          const jobStatus: JobStatus = {
            ...job,
            status: res.status,
            progress: res.progress,
            stage: res.stage,
            queuePosition: res.queuePosition,
            error: res.error,
          };
          newStatuses.set(job.jobId, jobStatus);

          if (res.status === 'succeeded' || res.status === 'failed') {
            completedRef.current.add(job.jobId);
            // Auto-remove after 5s
            setTimeout(() => {
              onJobComplete(job.jobId);
              onJobRemove(job.jobId);
            }, 5000);
          }
        } catch {
          // Status endpoint failed — keep existing status
        }

        const start = startTimes.current.get(job.jobId);
        if (start) {
          newElapsed.set(job.jobId, Math.round((Date.now() - start) / 1000));
        }
      }

      setStatuses(newStatuses);
      setElapsed(newElapsed);
    };

    poll(); // Initial poll
    const interval = setInterval(poll, 2500);
    return () => clearInterval(interval);
  }, [activeJobs, token]); // deliberately not including statuses to avoid loop

  if (activeJobs.length === 0) return null;

  return (
    <div className="fixed bottom-20 left-0 right-0 z-50 px-4 pointer-events-none">
      <div className="max-w-4xl mx-auto space-y-2 pointer-events-auto">
        {activeJobs.map(job => {
          const status = statuses.get(job.jobId);
          const secs = elapsed.get(job.jobId) || 0;
          const mins = Math.floor(secs / 60);
          const secsRem = secs % 60;
          const timeStr = mins > 0
            ? `${mins}:${String(secsRem).padStart(2, '0')}`
            : `${secsRem}s`;

          const isComplete = status?.status === 'succeeded';
          const isFailed = status?.status === 'failed';
          const isQueued = status?.status === 'queued' || status?.status === 'pending';
          const progressPct = status?.progress !== undefined
            ? Math.min(100, Math.max(0, (status.progress > 1 ? status.progress / 100 : status.progress) * 100))
            : 0;

          const borderColor = isComplete
            ? 'border-green-500/30'
            : isFailed
              ? 'border-red-500/30'
              : 'border-pink-500/20';

          const bgGradient = isComplete
            ? 'from-green-500 to-emerald-600'
            : 'from-pink-500 to-purple-600';

          return (
            <div
              key={job.jobId}
              className={`rounded-xl bg-zinc-900/95 backdrop-blur-xl border ${borderColor} shadow-2xl shadow-black/40 px-4 py-3 transition-all`}
            >
              <div className="flex items-center gap-3">
                {/* Icon */}
                <div className="flex-shrink-0">
                  {isComplete ? (
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                  ) : isFailed ? (
                    <XCircle className="w-5 h-5 text-red-400" />
                  ) : (
                    <div className="relative">
                      <Music className="w-5 h-5 text-pink-400" />
                      <Loader2 className="w-3 h-3 text-pink-400 animate-spin absolute -bottom-1 -right-1" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-sm font-medium text-white truncate">
                      {isComplete ? '✓ ' : ''}{job.title || 'Untitled'}
                    </span>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[11px] text-zinc-400 font-mono">{timeStr}</span>
                      {!isComplete && progressPct > 0 && (
                        <span className="text-[11px] font-bold text-pink-400">
                          {Math.round(progressPct)}%
                        </span>
                      )}
                      <button
                        onClick={() => onJobRemove(job.jobId)}
                        className="p-0.5 rounded text-zinc-500 hover:text-white transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${bgGradient} transition-all duration-500 ${
                        !isComplete && progressPct === 0 ? 'animate-pulse opacity-40 w-full' : ''
                      }`}
                      style={progressPct > 0 || isComplete ? { width: `${isComplete ? 100 : progressPct}%` } : undefined}
                    />
                  </div>

                  {/* Stage text */}
                  <div className="mt-1">
                    <span className="text-[10px] text-zinc-500 font-medium">
                      {isComplete
                        ? 'Audio generation complete'
                        : isFailed
                          ? `Failed: ${status?.error || 'Unknown error'}`
                          : isQueued
                            ? `In queue${status?.queuePosition ? ` (#${status.queuePosition})` : ''}…`
                            : status?.stage || 'Generating…'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
