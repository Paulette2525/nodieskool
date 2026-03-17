import { Bell, Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications } from "@/hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

const typeIcons: Record<string, string> = {
  like: "❤️",
  comment: "💬",
  event: "📅",
  follow: "👤",
};

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const navigate = useNavigate();

  const handleNotificationClick = (notification: typeof notifications[0]) => {
    if (!notification.is_read) {
      markAsRead.mutate(notification.id);
    }

    // Navigate based on type
    if (notification.reference_id) {
      if (notification.type === "like" || notification.type === "comment") {
        navigate("/community");
      } else if (notification.type === "event") {
        navigate("/calendar");
      }
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center font-medium">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto py-1 px-2 text-xs"
              onClick={() => markAllAsRead.mutate()}
            >
              <Check className="h-3 w-3 mr-1" />
              Tout marquer comme lu
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[300px]">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground text-sm">
              Aucune notification
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={cn(
                  "flex items-start gap-3 p-3 cursor-pointer",
                  !notification.is_read && "bg-muted/50"
                )}
                onClick={() => handleNotificationClick(notification)}
              >
                <span className="text-lg flex-shrink-0">
                  {typeIcons[notification.type] || "📢"}
                </span>
                <div className="flex-1 min-w-0">
                  <p className={cn("text-sm", !notification.is_read && "font-medium")}>
                    {notification.title}
                  </p>
                  {notification.message && (
                    <p className="text-xs text-muted-foreground truncate">
                      {notification.message}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(notification.created_at), {
                      addSuffix: true,
                      locale: fr,
                    })}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 flex-shrink-0 opacity-0 group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification.mutate(notification.id);
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
