"use client";

import type { VisitorLog } from "@/types/tracking";
import { InfoRow } from "@/components/admin/analytics/info-row";

/**
 * The expanded detail for one visitor log.
 *
 * Moved here from the old card-based `LogsSection` unchanged in content — the
 * same eight fields, the same cookie chips and the same per-log event list — but
 * rendered inside the AdminTable's full-width detail row so it sits under the
 * table's own borders, spacing and responsive rules instead of inside a
 * separately styled card.
 */
export function LogDetail({ log }: { log: VisitorLog }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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

      {log.events.length > 0 ? (
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
      ) : (
        <p className="text-xs text-muted">No events recorded for this session.</p>
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
