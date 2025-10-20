"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MapPin, Home, User as User2, CheckCircle, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { PackageOpen } from "lucide-react";
import { Evaluation } from "@/models/evaluation";
import { User } from "@/models/user";
import { License } from "@/models/license";
import { Request } from "@/models/request";
import { useAdminStore } from "@/stores/useAdminStore";

interface OverviewTabProps {
  requests: Request[];
  volunteers: User[];
  licenses: License[];
  onViewRequest: (request: Request) => void;
  onViewVolunteer: (volunteer: User) => void;
  setActiveTab: (tab: string) => void;
}

export default function OverviewTab({
  requests,
  volunteers,
  licenses,
  onViewRequest,
  onViewVolunteer,
  setActiveTab,
}: OverviewTabProps) {
  const pendingRequests = requests.filter((req) => req.requestStatus.toLowerCase() === "pending");
  const inProgressRequests = requests.filter((req) => req.requestStatus.toLowerCase() === "in progress");
  const currentVolunteers = licenses.map((l) => {
    const volunteer = volunteers.find((v) => v.roleId === 2 && l.userId === v.userId);
    return {
      ...volunteer,
      ...l,
    };
  });
  const { loading } = useAdminStore();
  const pendingVolunteers = currentVolunteers.filter((p) => p.isVerified === false && p.isRejected === false);
  const approvedVolunteers = currentVolunteers.filter((p) => p.isVerified === true);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      pending: "bg-chart-4/20 text-chart-4 border-chart-4/30",
      "in progress": "bg-chart-3/20 text-chart-3 border-chart-3/30",
      completed: "bg-chart-2/20 text-chart-2 border-chart-2/30",
      cancelled: "bg-destructive/20 text-destructive border-destructive/30",
    };
    return <Badge variant="outline" className={variants[status]}>{status.replace("-", " ")}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {[
          { label: "Total Requests", value: requests.length, icon: <Home className="h-4 w-4 text-primary" /> },
          { label: "Pending Requests", value: pendingRequests.length, icon: <Clock className="h-4 w-4 text-chart-4" /> },
          { label: "Volunteer Applications", value: pendingVolunteers.length, icon: <User2 className="h-4 w-4 text-chart-3" /> },
          { label: "Verified Volunteers", value: approvedVolunteers.length, icon: <CheckCircle className="h-4 w-4 text-chart-2" /> },
        ].map((item, idx) => (
          <Card
            key={idx}
            className={`bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">
                {loading ? <Skeleton className="h-4 w-20" /> : item.label}
              </CardTitle>
              {item.icon}
            </CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-8 w-12" /> : <div className="text-2xl font-bold text-card-foreground">{item.value}</div>}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Requests */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-card-foreground">{loading ? <Skeleton className="h-4 w-32" /> : "Recent Safety Requests"}</CardTitle>
              <CardDescription>{loading ? <Skeleton className="h-3 w-48 mt-1" /> : "Latest evaluation requests"}</CardDescription>
            </div>
            {!loading && <Button variant="outline" size="sm" onClick={() => setActiveTab("requests")}>View All</Button>}
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-lg" />)
              ) : requests.length === 0 ? (
                <Empty className="border border-dashed">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <PackageOpen />
                    </EmptyMedia>
                    <EmptyTitle>No Requests</EmptyTitle>
                    <EmptyDescription>
                      There are currently no evaluation requests.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              ) : (
                requests.slice(0, 4).map((request) => (
                  <div
                    key={request.requestId}
                    className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                    onClick={() => onViewRequest(request)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        request.requestStatus.toLowerCase() === "pending" ? "bg-chart-4" :
                        request.requestStatus.toLowerCase() === "in progress" ? "bg-chart-3" : "bg-chart-2"
                      }`} />
                      <div>
                        <p className="font-medium text-sm text-card-foreground">{request.userName}</p>
                      </div>
                    </div>
                    {getStatusBadge(request.requestStatus.toLowerCase())}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pending Volunteers */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-card-foreground">{loading ? <Skeleton className="h-4 w-32" /> : "Pending Verifications"}</CardTitle>
              <CardDescription>{loading ? <Skeleton className="h-3 w-48 mt-1" /> : "Volunteer applications"}</CardDescription>
            </div>
            {!loading && <Button variant="outline" size="sm" onClick={() => setActiveTab("volunteers")}>View All</Button>}
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-lg" />)
              ) : pendingVolunteers.length === 0 ? (
                <Empty className="border border-dashed">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <PackageOpen />
                    </EmptyMedia>
                    <EmptyTitle>No Pending Volunteers</EmptyTitle>
                    <EmptyDescription>
                      There are currently no pending volunteers that need license verifications.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              ) : (
                pendingVolunteers.slice(0, 4).map((volunteer) => (
                  <div
                    key={volunteer.userId}
                    className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
                    onClick={() =>
                      onViewVolunteer(volunteers.find((v) => v.userId === volunteer.userId)!)
                    }
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {(volunteer.firstName ?? "U")[0]}{(volunteer.lastName ?? "")[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm text-card-foreground">{volunteer.firstName} {volunteer.lastName}</p>
                        <p className="text-xs text-muted-foreground">{volunteer.specialization}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-chart-4/20 text-chart-4 border-chart-4/30">Pending</Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-card-foreground">{loading ? <Skeleton className="h-4 w-28" /> : "Requests by Status"}</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-4 w-full my-2" />)
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-card-foreground">Pending</span>
                  <span className="font-medium text-card-foreground">{pendingRequests.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-card-foreground">In Progress</span>
                  <span className="font-medium text-card-foreground">{inProgressRequests.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-card-foreground">Completed</span>
                  <span className="font-medium text-card-foreground">{requests.filter(r => r.requestStatus.toLowerCase() === "completed").length}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-card-foreground">{loading ? <Skeleton className="h-4 w-36" /> : "Volunteer Specializations"}</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-4 w-full my-2" />)
            ) : currentVolunteers.length === 0 ? (
              <Empty className="border border-dashed">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <PackageOpen />
                  </EmptyMedia>
                  <EmptyTitle>No Volunteers</EmptyTitle>
                  <EmptyDescription>
                    There are currently no volunteers with licenses.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <div className="space-y-2">
                {["Structural Engineer", "Civil Engineer", "Architect", "Building Inspector"].map((spec) => {
                  const count = currentVolunteers.filter((v) => v.specialization === spec && !v.isRejected).length;
                  return count > 0 ? (
                    <div key={spec} className="flex justify-between text-sm">
                      <span className="text-card-foreground">{spec}</span>
                      <span className="font-medium text-card-foreground">{count}</span>
                    </div>
                  ) : null;
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
