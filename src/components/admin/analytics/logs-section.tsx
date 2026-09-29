"use client";

import { Globe, Monitor, Smartphone, Tablet, Eye, ChevronDown, ChevronUp } from "lucide-react";
import type { VisitorLog } from "@/types/tracking";
import { InfoRow } from "./info-row";

export interface LogsSectionProps {
  logs: VisitorLog[];
  expandedLog: string | null;
  setExpandedLog: (id: string | null) => void;
}

export function LogsSection({ logs, expandedLog, setExpandedLog }: LogsSectionProps) {
  return (
    <>
        {logs.length > 0 && (
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
              <Eye className="h-4 w-4 text-primary" /> Visitor Logs (Last 100)
            </h3>
            <div className="space-y-2">
              {logs.map((log) => (
                <div key={log.id} className="rounded-xl border border-border bg-background-secondary/30">
                  <button
                    onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                    className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
                  >
                    <div className="flex flex-wrap items-center gap-3 text-xs">
                      <span className="font-mono font-medium text-foreground">{log.ip}</span>
                      <span className="flex items-center gap-1 text-muted">
                        {log.device === "Mobile" ? <Smartphone className="h-3 w-3" /> :
                         log.device === "Tablet" ? <Tablet className="h-3 w-3" /> :
                         <Monitor className="h-3 w-3" />}
                        {log.browser} / {log.os}
                      </span>
                      {log.location && (
                        <span className="flex items-center gap-1 text-muted">
                          <Globe className="h-3 w-3" />
                          {log.location.city}, {log.location.country}
                        </span>
                      )}
                      <span className="text-muted/60">{log.page}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-mono text-[0.65rem] text-muted/60">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                      {expandedLog === log.id ? <ChevronUp className="h-3.5 w-3.5 text-muted" /> : <ChevronDown className="h-3.5 w-3.5 text-muted" />}
                    </div>
                  </button>

                  {expandedLog === log.id && (
                    <div className="border-t border-border px-4 py-3 space-y-3">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <InfoRow label="IP Address" value={log.ip} />
                        <InfoRow label="User Agent" value={log.userAgent.slice(0, 80)} />
                        <InfoRow label="Language" value={log.language} />
                        <InfoRow label="Timezone" value={log.timezone} />
                        <InfoRow label="Screen" value={log.screenResolution} />
                        <InfoRow label="Referrer" value={log.referrer} />
                        <InfoRow label="ISP" value={log.location?.isp || "Unknown"} />
                        <InfoRow label="Coordinates" value={log.location ? `${log.location.lat}, ${log.location.lon}` : "Unknown"} />
                      </div>

                      {Object.keys(log.cookies).length > 0 && (
                        <div>
                          <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted/60 mb-1.5">Cookies</p>
                          <div className="flex flex-wrap gap-1.5">
                            {Object.entries(log.cookies).map(([k, v]) => (
                              <span key={k} className="rounded-md bg-background-secondary border border-border px-2 py-0.5 text-[0.6rem] font-mono text-muted">
                                {k}={v.slice(0, 30)}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {log.events.length > 0 && (
                        <div>
                          <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted/60 mb-1.5">Events ({log.events.length})</p>
                          <div className="space-y-1 max-h-40 overflow-y-auto">
                            {log.events.map((evt, i) => (
                              <div key={i} className="flex items-center gap-2 text-[0.65rem]">
                                <span className={`shrink-0 rounded px-1.5 py-0.5 font-mono ${
                                  evt.type === "pageview" ? "bg-primary/10 text-primary" :
                                  evt.type === "click" ? "bg-secondary/10 text-secondary" :
                                  "bg-muted/10 text-muted"
                                }`}>
                                  {evt.type}
                                </span>
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
          </div>
        )}
    </>
  );
}
