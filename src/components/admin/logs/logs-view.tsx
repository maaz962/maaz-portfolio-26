"use client";

import { useEffect, useMemo } from "react";
import {
  ChevronDown,
  ChevronRight,
  Globe,
  Monitor,
  RefreshCw,
  ScrollText,
  Search,
  Smartphone,
  Tablet,
  X,
} from "lucide-react";
import { buttonStyles } from "@/components/ui/button";
import { AdminPage, AdminPageHeader } from "@/components/admin/admin-page";
import {
  AdminPagination,
  AdminTable,
  type AdminColumn,
  type AdminSort,
} from "@/components/admin/admin-table";
import { EmptyState } from "@/components/admin/empty-state";
import { ToastProvider, useToast } from "@/components/admin/toast";
import { LogDetail } from "./log-detail";
import { useLogs } from "./use-logs";
import type { VisitorLog } from "@/types/tracking";

/**
 * `/admin/logs` — every retained visitor session, paged on the server.
 *
 * This was the expandable list at the bottom of the Overview page, capped at the
 * newest 100 rows inside the analytics response. It has its own route and its
 * own endpoint now, so the Overview stays a summary and the Logs route costs one
 * page per request. Expanding a row still shows the same detail it always did —
 * it just lives inside the AdminTable's detail row.
 */
export function LogsView() {
  return (
    <ToastProvider>
      <LogsPage />
    </ToastProvider>
  );
}

function DeviceIcon({ device }: { device: string }) {
  if (device === "Mobile") return <Smartphone className="h-3.5 w-3.5" strokeWidth={1.75} />;
  if (device === "Tablet") return <Tablet className="h-3.5 w-3.5" strokeWidth={1.75} />;
  return <Monitor className="h-3.5 w-3.5" strokeWidth={1.75} />;
}

function LogsPage() {
  const {
    data,
    loading,
    loaded,
    feedback,
    query,
    device,
    sort,
    page,
    pageSize,
    expandedId,
    setQuery,
    setDevice,
    setSort,
    setPage,
    setPageSize,
    setExpandedId,
    refresh,
  } = useLogs();

  const { notify } = useToast();

  useEffect(() => {
    if (feedback) notify(feedback.message, feedback.variant);
  }, [feedback, notify]);

  const columns = useMemo<AdminColumn<VisitorLog>[]>(
    () => [
      {
        key: "time",
        header: "Time",
        sortable: true,
        defaultDirection: "desc",
        className: "whitespace-nowrap",
        render: (row) => (
          <span className="text-mono text-sm text-muted">
            {new Date(row.timestamp).toLocaleString()}
          </span>
        ),
      },
      {
        key: "ip",
        header: "IP",
        sortable: true,
        defaultDirection: "asc",
        className: "whitespace-nowrap",
        render: (row) => <span className="text-mono text-sm font-medium text-foreground">{row.ip}</span>,
      },
      {
        key: "page",
        header: "Page",
        sortable: true,
        defaultDirection: "asc",
        render: (row) => <span className="truncate text-sm text-muted">{row.page}</span>,
      },
      {
        key: "device",
        header: "Device",
        sortable: true,
        defaultDirection: "asc",
        hideBelow: "sm",
        className: "whitespace-nowrap",
        render: (row) => (
          <span className="flex items-center gap-1.5 text-sm text-muted">
            <DeviceIcon device={row.device} />
            {row.device}
          </span>
        ),
      },
      {
        key: "browser",
        header: "Browser",
        sortable: true,
        defaultDirection: "asc",
        hideBelow: "lg",
        className: "whitespace-nowrap text-sm text-muted",
        render: (row) => row.browser,
      },
      {
        key: "os",
        header: "OS",
        sortable: true,
        defaultDirection: "asc",
        hideBelow: "xl",
        className: "whitespace-nowrap text-sm text-muted",
        render: (row) => row.os,
      },
      {
        key: "location",
        header: "Location",
        hideBelow: "md",
        className: "whitespace-nowrap text-sm text-muted",
        render: (row) =>
          row.location ? (
            <span className="flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5" strokeWidth={1.75} />
              {row.location.city}, {row.location.country}
            </span>
          ) : (
            <span className="text-muted/50">&mdash;</span>
          ),
      },
      {
        key: "events",
        header: "Events",
        className: "text-right whitespace-nowrap",
        render: (row) => <span className="text-mono text-sm text-muted">{row.events.length}</span>,
      },
      {
        key: "expand",
        header: <span className="sr-only">Details</span>,
        className: "w-10 text-right",
        render: (row) => {
          const open = expandedId === row.id;
          return (
            <button
              type="button"
              onClick={() => setExpandedId(open ? null : row.id)}
              aria-expanded={open}
              aria-label={`${open ? "Hide" : "Show"} details for session from ${row.ip}`}
              className="-mr-1 inline-flex items-center justify-center rounded-lg p-1 text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            >
              {open ? (
                <ChevronDown className="h-4 w-4" strokeWidth={1.75} />
              ) : (
                <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
              )}
            </button>
          );
        },
      },
    ],
    [expandedId, setExpandedId]
  );

  const rows = data?.rows ?? [];
  const searching = query.trim().length > 0;
  const filtering = device.length > 0;

  return (
    <AdminPage>
      <AdminPageHeader
        icon={ScrollText}
        title="Visitor Logs"
        description="Every tracked session, with full request and event detail"
        actions={
          <button
            onClick={refresh}
            disabled={loading}
            className={buttonStyles({ variant: "outline", size: "sm", className: "rounded-xl" })}
          >
            <RefreshCw className={loading ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
            Refresh
          </button>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted"
            strokeWidth={1.75}
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by IP or page path"
            aria-label="Search visitor logs"
            className="h-11 w-full rounded-xl border border-border bg-card pr-10 pl-10 text-sm text-foreground outline-none transition-colors placeholder:text-muted focus:border-primary/60"
          />
          {searching && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-1 text-muted transition-colors hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" strokeWidth={2} />
            </button>
          )}
        </div>

        <label className="flex items-center gap-2 text-sm whitespace-nowrap text-muted">
          Device
          <select
            value={device}
            onChange={(event) => setDevice(event.target.value)}
            aria-label="Filter by device type"
            className="h-11 rounded-xl border border-border bg-card px-3 text-sm text-foreground outline-none focus:border-primary/60"
          >
            <option value="">All</option>
            {(data?.devices ?? []).map((d) => (
              <option key={d.name} value={d.name}>
                {d.name} ({d.count})
              </option>
            ))}
          </select>
        </label>

        <p className="text-sm whitespace-nowrap text-muted">
          <span className="text-foreground">{data?.total ?? 0}</span> sessions
        </p>
      </div>

      <AdminTable<VisitorLog>
        caption="Visitor sessions"
        columns={columns}
        rows={rows}
        getRowKey={(row) => row.id}
        sort={sort}
        onSortChange={setSort as (next: AdminSort) => void}
        loading={!loaded}
        emptyColSpan={columns.length}
        expandedRowKey={expandedId}
        renderExpanded={(row) => <LogDetail log={row} />}
        empty={
          searching || filtering ? (
            <EmptyState
              icon={Search}
              title="No sessions match these filters"
              description="Try a different IP or path, or reset the device filter to see everything."
            />
          ) : (
            <EmptyState
              icon={ScrollText}
              title="No visitor logs yet"
              description="Sessions appear here as soon as the analytics tracker records a pageview."
            />
          )
        }
      />

      <AdminPagination
        page={data?.page ?? page}
        pageCount={data?.pageCount ?? 1}
        pageSize={pageSize}
        total={data?.total ?? 0}
        itemNoun="sessions"
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />
    </AdminPage>
  );
}
