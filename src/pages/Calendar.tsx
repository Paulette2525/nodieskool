import { MainLayout } from "@/components/layout/MainLayout";
import { EventCard } from "@/components/calendar/EventCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { useState } from "react";
import { format, addDays, addHours, setHours, setMinutes } from "date-fns";
import { Video, Plus } from "lucide-react";

// Helper to create dates
const today = new Date();
const createDate = (daysFromNow: number, hour: number) => {
  return setMinutes(setHours(addDays(today, daysFromNow), hour), 0);
};

// Mock data
const mockEvents = [
  {
    id: "1",
    title: "Weekly Q&A Session",
    description: "Join us for our weekly community Q&A where you can ask anything about the courses.",
    startTime: createDate(0, 15),
    endTime: createDate(0, 16),
    type: "qa" as const,
    hostName: "David Kim",
    attendeesCount: 42,
    meetingUrl: "https://zoom.us/j/example",
  },
  {
    id: "2",
    title: "Marketing Masterclass: Social Media Strategies",
    description: "Deep dive into advanced social media marketing techniques that drive real results.",
    startTime: createDate(1, 10),
    endTime: createDate(1, 12),
    type: "masterclass" as const,
    hostName: "Sarah Johnson",
    attendeesCount: 89,
    meetingUrl: "https://zoom.us/j/example",
  },
  {
    id: "3",
    title: "Sales Workshop: Closing Techniques",
    description: "Interactive workshop on mastering the art of closing deals with confidence.",
    startTime: createDate(3, 14),
    endTime: createDate(3, 16),
    type: "workshop" as const,
    hostName: "Alex Martinez",
    attendeesCount: 56,
    meetingUrl: "https://zoom.us/j/example",
  },
  {
    id: "4",
    title: "Live: Building Your Personal Brand",
    description: "Special live session on creating and growing your personal brand in 2024.",
    startTime: createDate(5, 18),
    endTime: createDate(5, 19),
    type: "live" as const,
    hostName: "Emily Rodriguez",
    attendeesCount: 124,
    meetingUrl: "https://zoom.us/j/example",
  },
];

export default function Calendar() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(today);

  // Get upcoming events (sorted by date)
  const upcomingEvents = mockEvents
    .filter(event => event.startTime >= today)
    .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Calendar</h1>
            <p className="text-muted-foreground mt-1">Upcoming events and sessions</p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Event
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Events List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Upcoming Events</h2>
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((event) => (
                <EventCard
                  key={event.id}
                  id={event.id}
                  title={event.title}
                  description={event.description}
                  startTime={event.startTime}
                  endTime={event.endTime}
                  type={event.type}
                  hostName={event.hostName}
                  attendeesCount={event.attendeesCount}
                  meetingUrl={event.meetingUrl}
                  onJoin={() => console.log("Join event:", event.id)}
                />
              ))
            ) : (
              <Card className="p-8 text-center">
                <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium text-foreground">No upcoming events</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Check back later for new events and sessions
                </p>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Calendar */}
            <Card className="p-4">
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md"
              />
            </Card>

            {/* Quick Stats */}
            <Card className="p-4">
              <h3 className="font-semibold text-foreground mb-4">This Month</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-2xl font-bold text-foreground">{upcomingEvents.length}</p>
                  <p className="text-xs text-muted-foreground">Events</p>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-2xl font-bold text-foreground">3</p>
                  <p className="text-xs text-muted-foreground">Attended</p>
                </div>
              </div>
            </Card>

            {/* Event Types Legend */}
            <Card className="p-4">
              <h3 className="font-semibold text-foreground mb-3">Event Types</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-sm text-muted-foreground">Live Session</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  <span className="text-sm text-muted-foreground">Masterclass</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-sm text-muted-foreground">Workshop</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm text-muted-foreground">Q&A</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
