import { TimelineEvent } from "@/types";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";

function formatTimestamp(iso: string) {
  return new Intl.DateTimeFormat("es", {
    dateStyle: "short",
    timeStyle: "medium",
  }).format(new Date(iso));
}

interface TimelineItemProps {
  event: TimelineEvent;
  eventConfig: Record<
    string,
    {
      label: string;
      icon: React.ElementType;
      color: string;
    }
  >;
}

export function TimelineItem({ event, eventConfig }: TimelineItemProps) {
  const config = eventConfig[event.type];
  const Icon = config.icon;

  return (
    <Collapsible className="pb-6 last:pb-0 hover:bg-slate-100 rounded-2xl transition-colors">
      <div className="relative flex gap-4 group">
        <div className="absolute left-3.75 top-8 bottom-0 w-0.5 bg-slate-200 group-last:hidden" />

        <div
          className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white ${config.color}`}
        >
          <Icon size={14} />
        </div>

        <div className="flex-1 min-w-0">
          <CollapsibleTrigger className="w-full text-left cursor-pointer ">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-bold text-slate-900">
                {config.label}
              </span>
              <span className="text-[10px] text-slate-400 font-medium shrink-0">
                {formatTimestamp(event.timestamp)}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Fuente: {event.source} &middot; {event.eventId.slice(0, 8)}...
            </p>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <div className="mt-2 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
              <div className="grid gap-1 text-slate-600">
                <div>
                  <span className="font-semibold">Event ID:</span>{" "}
                  {event.eventId}
                </div>
                <div>
                  <span className="font-semibold">Correlation ID:</span>{" "}
                  {event.correlationId}
                </div>
                <div>
                  <span className="font-semibold">User ID:</span> {event.userId}
                </div>
              </div>
              {Object.keys(event.payload).length > 0 && (
                <pre className="mt-2 p-2 bg-white rounded-lg border text-[10px] overflow-x-auto">
                  {JSON.stringify(event.payload, null, 2)}
                </pre>
              )}
            </div>
          </CollapsibleContent>
        </div>
      </div>
    </Collapsible>
  );
}
