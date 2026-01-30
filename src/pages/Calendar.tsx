import { Navigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { EventCard } from "@/components/calendar/EventCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { useState } from "react";
import { Video, Plus, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useEvents } from "@/hooks/useEvents";

export default function Calendar() {
  const { user, loading, isModerator } = useAuth();
  const { events, registeredEvents, isLoading, registerForEvent, unregisterFromEvent } = useEvents();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Calendar</h1>
            <p className="text-muted-foreground mt-1">Upcoming events and sessions</p>
          </div>
          {isModerator && (
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Event
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Events List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Upcoming Events</h2>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : events.length > 0 ? (
              events.map((event) => {
                const isRegistered = registeredEvents.includes(event.id);
                return (
                  <EventCard
                    key={event.id}
                    id={event.id}
                    title={event.title}
                    description={event.description ?? ""}
                    startTime={new Date(event.start_time)}
                    endTime={new Date(event.end_time)}
                    type={event.event_type as 'live' | 'masterclass' | 'workshop' | 'qa'}
                    hostName={event.profiles?.full_name || event.profiles?.username || "Host"}
                    hostAvatar={event.profiles?.avatar_url ?? undefined}
                    attendeesCount={event.attendees_count}
                    meetingUrl={event.meeting_url ?? undefined}
                    isRegistered={isRegistered}
                    onJoin={() => {
                      if (isRegistered) {
                        unregisterFromEvent.mutate(event.id);
                      } else {
                        registerForEvent.mutate(event.id);
                      }
                    }}
                  />
                );
              })
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
                  <p className="text-2xl font-bold text-foreground">{events.length}</p>
                  <p className="text-xs text-muted-foreground">Events</p>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-2xl font-bold text-foreground">{registeredEvents.length}</p>
                  <p className="text-xs text-muted-foreground">Registered</p>
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
