import { Calendar as CalendarIcon, Clock, Users, Video, Check } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, isToday, isTomorrow } from "date-fns";
import { cn } from "@/lib/utils";

interface EventCardProps {
  id: string;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  type: 'live' | 'masterclass' | 'workshop' | 'qa';
  hostName: string;
  hostAvatar?: string;
  attendeesCount: number;
  meetingUrl?: string;
  isRegistered?: boolean;
  onJoin?: () => void;
}

export function EventCard({
  title,
  description,
  startTime,
  endTime,
  type,
  hostName,
  hostAvatar,
  attendeesCount,
  meetingUrl,
  isRegistered,
  onJoin,
}: EventCardProps) {
  const getTypeConfig = () => {
    const configs = {
      live: { label: "Live", color: "bg-red-100 text-red-700" },
      masterclass: { label: "Masterclass", color: "bg-purple-100 text-purple-700" },
      workshop: { label: "Workshop", color: "bg-blue-100 text-blue-700" },
      qa: { label: "Q&A", color: "bg-green-100 text-green-700" },
    };
    return configs[type] || configs.live;
  };

  const getDateLabel = () => {
    if (isToday(startTime)) return "Today";
    if (isTomorrow(startTime)) return "Tomorrow";
    return format(startTime, "MMM d");
  };

  const typeConfig = getTypeConfig();
  const now = new Date();
  const isUpcoming = startTime > now;
  const isLive = now >= startTime && now <= endTime;

  return (
    <Card className={cn(
      "p-5 transition-all hover:shadow-md",
      isLive && "ring-2 ring-red-500 bg-red-50/50"
    )}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Type badge */}
          <div className="flex items-center gap-2 mb-2">
            <Badge className={cn("text-xs font-medium", typeConfig.color)} variant="secondary">
              {typeConfig.label}
            </Badge>
            {isLive && (
              <Badge className="bg-red-500 text-white text-xs animate-pulse">
                LIVE NOW
              </Badge>
            )}
            {isRegistered && !isLive && (
              <Badge className="bg-success/10 text-success text-xs gap-1" variant="secondary">
                <Check className="h-3 w-3" />
                Registered
              </Badge>
            )}
          </div>

          {/* Title */}
          <h3 className="font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{description}</p>

          {/* Date & Time */}
          <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <CalendarIcon className="h-4 w-4" />
              <span>{getDateLabel()}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              <span>{format(startTime, "h:mm a")} - {format(endTime, "h:mm a")}</span>
            </div>
          </div>

          {/* Host & Attendees */}
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={hostAvatar} />
                <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                  {hostName.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground">
                Hosted by <span className="font-medium text-foreground">{hostName}</span>
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{attendeesCount} attending</span>
            </div>
          </div>
        </div>

        {/* Action */}
        {(isLive || isUpcoming) && (
          <Button 
            size="sm" 
            onClick={onJoin}
            variant={isRegistered ? "outline" : "default"}
            className={cn(
              "gap-1.5 ml-4",
              isLive && "bg-red-500 hover:bg-red-600"
            )}
          >
            {isLive ? (
              <>
                <Video className="h-4 w-4" />
                Join Now
              </>
            ) : isRegistered ? (
              "Cancel"
            ) : (
              "Register"
            )}
          </Button>
        )}
      </div>
    </Card>
  );
}
