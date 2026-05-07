import React from "react";
import { Bell } from "lucide-react";
import { formatDateTime } from "@/lib/utils/formatters";

interface UserEvent {
  id: string;
  title: string;
  time: string;
}

interface UserNotificationsProps {
  events: UserEvent[];
}

export const UserNotifications: React.FC<UserNotificationsProps> = ({ events }) => {
  return (
    <div className="rounded-[28px] border border-border/70 bg-card p-5 shadow-card">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-lg font-semibold text-foreground">
            Notifications
          </h3>
          <p className="text-sm text-muted-foreground">
            Updated every 30 seconds
          </p>
        </div>
        <div className="rounded-full bg-primary/10 p-2 text-primary">
          <Bell className="h-4 w-4" />
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {events.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/70 px-4 py-8 text-center text-sm text-muted-foreground">
            No recent user events yet.
          </div>
        ) : (
          events.map((event) => (
            <div
              key={event.id}
              className="rounded-2xl border border-border/70 bg-muted/20 p-4"
            >
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-primary/10 p-2 text-primary">
                  <Bell className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{event.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatDateTime(event.time)}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
