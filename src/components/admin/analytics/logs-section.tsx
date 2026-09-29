"use client";

import {
  ChevronDown,
  ChevronUp,
  Globe,
  Monitor,
  ScrollText,
  Smartphone,
  Tablet,
} from "lucide-react";
import type { VisitorLog } from "@/types/tracking";
import { EmptyState } from "@/components/admin/empty-state";
import { InfoRow } from "./info-row";

export interface LogsSectionProps {
  logs: VisitorLog[];
  expandedLog: string | null;
  setExpandedLog: (id: string | null) => void;
}

/**
 * Latest visitor sessions. This is a preview on the Overview page; it becomes
 * the dedicated Logs route with search and filtering in a later step.
 */
export function LogsSection({ logs, expandedLog, setExpandedLog }: LogsSectionProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-foreground">
        <ScrollText className="h-4 w-4 text-primary" strokeWidth={1.75} /> Visitor Logs
        {logs.length > 0 && (
          <span className="text-sm font-normal text-muted">Latest {logs.length}</span>
        )}
      </h3>

      {logs.length === 0 ? (
        <EmptyState
          compact
          icon={ScrollText}
          title="No visitor logs yet"
          description="Sessions appear here as soon as the analytics tracker records a pageview."
        />
      ) : (
        <div className="space-y-2">
          {logs.map((log) => (
            <div key={log.id} className="rounded-xl border border-border bg-background-secondary/30">
              <button
                onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                aria-expanded={expandedLog === log.id}
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
              >
                <div className="flex min-w-0 flex-wrap items-center gap-3 text-sm">
                  <span className="text-mono font-medium text-foreground">{log.ip}</span>
                  <span className="flex items-center gap-1.5 text-muted">
                    {log.device === "Mobile" ? (
                      <Smartphone className="h-3.5 w-3.5" />
                    ) : log.device === "Tablet" ? (
                      <Tablet className="h-3.5 w-3.5" />
                    ) : (
                      <Monitor className="h-3.5 w-3.5" />
                    )}
                    {log.browser} / {log.os}
                  </span>
                  {log.location && (
                    <span className="flex items-center gap-1.5 text-muted">
                      <Globe className="h-3.5 w-3.5" />
                      {log.location.city}, {log.location.country}
                    </span>
                  )}
                  <span className="truncate text-muted/70">{log.page}</span>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-mono text-xs text-muted/70">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                  {expandedLog === log.id ? (
                    <ChevronUp className="h-4 w-4 text-muted" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted" />
                  )}
                </div>
              </button>

              {expandedLog === log.id && (
                <div className="space-y-3 border-t border-border px-4 py-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <InfoRow label="IP Address" value={log.ip} />
                    <InfoRow label="User Agent" value={log.userAgent.slice(0, 80)} />
                    <InfoRow label="Language" value={log.language} />
                    <InfoRow label="Timezone" value={log.timezone} />
                    <InfoRow label="Screen" value={log.screenResolution} />
                    <InfoRow label="Referrer" value={log.referrer} />
                    <InfoRow label="ISP" value={log.location?.isp || "Unknown"} />
                    <InfoRow
                      label="Coordinates"
                      value={log.location ? `${log.location.lat}, ${log.location.lon}` : "Unknown"}
                    />
                  </div>

                  {Object.keys(log.cookies).length > 0 && (
                    <div>
                      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted">
                        Cookies
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {Object.entries(log.cookies).map(([k, v]) => (
                          <span
                            key={k}
                            className="text-mono rounded-md border border-border bg-background-secondary px-2 py-0.5 text-xs text-muted"
                          >
                            {k}={v.slice(0, 30)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {log.events.length > 0 && (
                    <div>
                      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted">
                        Events ({log.events.length})
                      </p>
                      <div className="max-h-40 space-y-1 overflow-y-auto">
                        {log.events.map((evt, i) => (
                          <div key={i} className="flex flex-wrap items-center gap-2 text-xs">
                            <EventTypeBadge type={evt.type} />
                            <span className="text-foreground/70">{evt.target}</span>
                            {evt.data && <span className="text-muted">{evt.data}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EventTypeBadge({ type }: { type: string }) {
  const tone =
    type === "pageview"
      ? "bg-primary/10 text-primary"
      : type === "click"
        ? "bg-secondary/10 text-secondary"
        : type === "scroll"
          ? "bg-accent/10 text-accent"
          : "bg-muted/10 text-muted";
  return (
    <span className={`shrink-0 rounded px-1.5 py-0.5 text-mono text-xs ${tone}`}>{type}</span>
  );
}
