"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MapPin, Home, User, CheckCircle, Clock } from "lucide-react";

// Types
type RequestStatus = "pending" | "in-progress" | "completed" | "cancelled";
type VolunteerStatus = "pending" | "approved" | "rejected";

interface SafetyRequest {
  id: string;
  citizenName: string;
  phone: string;
  barangay: string;
  sitio: string;
  houseDescription: string;
  status: RequestStatus;
  dateRequested: string;
  coordinates?: string;
  assignedVolunteer?: string;
  assessment?: string;
  notes?: string;
}

interface VolunteerApplication {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  licenseNumber: string;
  licenseImage: string;
  specialization: "Structural Engineer" | "Civil Engineer" | "Architect" | "Building Inspector";
  experience: string;
  status: VolunteerStatus;
  dateApplied: string;
}

interface OverviewTabProps {
  requests: SafetyRequest[];
  volunteers: VolunteerApplication[];
  onViewRequest: (request: SafetyRequest) => void;
  onViewVolunteer: (volunteer: VolunteerApplication) => void;
  setActiveTab: (tab: string) => void;
}

export default function OverviewTab({ 
  requests, 
  volunteers, 
  onViewRequest, 
  onViewVolunteer, 
  setActiveTab 
}: OverviewTabProps) {
  const pendingRequests = requests.filter(req => req.status === "pending");
  const inProgressRequests = requests.filter(req => req.status === "in-progress");
  const pendingVolunteers = volunteers.filter(vol => vol.status === "pending");
  const approvedVolunteers = volunteers.filter(vol => vol.status === "approved");

  const getStatusBadge = (status: RequestStatus) => {
    const variants: Record<RequestStatus, string> = {
      pending: "bg-chart-4/20 text-chart-4 border-chart-4/30",
      "in-progress": "bg-chart-3/20 text-chart-3 border-chart-3/30",
      completed: "bg-chart-2/20 text-chart-2 border-chart-2/30",
      cancelled: "bg-destructive/20 text-destructive border-destructive/30"
    };
    return <Badge variant="outline" className={variants[status]}>{status.replace("-", " ")}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Total Requests</CardTitle>
            <Home className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">{requests.length}</div>
            <p className="text-xs text-primary">
              +2 from yesterday
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-chart-4/10 to-chart-4/5 border-chart-4/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Pending Requests</CardTitle>
            <Clock className="h-4 w-4 text-chart-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">{pendingRequests.length}</div>
            <p className="text-xs text-chart-4">
              Requires attention
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-chart-3/10 to-chart-3/5 border-chart-3/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Volunteer Applications</CardTitle>
            <User className="h-4 w-4 text-chart-3" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">{pendingVolunteers.length}</div>
            <p className="text-xs text-chart-3">
              Awaiting verification
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-chart-2/10 to-chart-2/5 border-chart-2/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Verified Volunteers</CardTitle>
            <CheckCircle className="h-4 w-4 text-chart-2" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">{approvedVolunteers.length}</div>
            <p className="text-xs text-chart-2">
              Active engineers
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Requests */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-card-foreground">Recent Safety Requests</CardTitle>
              <CardDescription>Latest evaluation requests</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => setActiveTab("requests")}>
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {requests.slice(0, 4).map((request) => (
                <div 
                  key={request.id} 
                  className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-accent/50 transition-colors" 
                  onClick={() => onViewRequest(request)}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      request.status === "pending" ? "bg-chart-4" :
                      request.status === "in-progress" ? "bg-chart-3" : "bg-chart-2"
                    }`} />
                    <div>
                      <p className="font-medium text-sm text-card-foreground">{request.citizenName}</p>
                      <p className="text-xs text-muted-foreground flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {request.barangay}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(request.status)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pending Volunteers */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-card-foreground">Pending Verifications</CardTitle>
              <CardDescription>Volunteer applications</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => setActiveTab("volunteers")}>
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingVolunteers.slice(0, 4).map((volunteer) => (
                <div 
                  key={volunteer.id} 
                  className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors" 
                  onClick={() => onViewVolunteer(volunteer)}
                >
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {volunteer.firstName[0]}{volunteer.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm text-card-foreground">{volunteer.firstName} {volunteer.lastName}</p>
                      <p className="text-xs text-muted-foreground">{volunteer.specialization}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-chart-4/20 text-chart-4 border-chart-4/30">
                    Pending
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-card-foreground">Requests by Status</CardTitle>
          </CardHeader>
          <CardContent>
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
                <span className="font-medium text-card-foreground">{requests.filter(r => r.status === "completed").length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-card-foreground">Request Locations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Array.from(new Set(requests.map(r => r.barangay))).map(barangay => {
                const count = requests.filter(r => r.barangay === barangay).length;
                return (
                  <div key={barangay} className="flex justify-between text-sm">
                    <span className="text-card-foreground">{barangay}</span>
                    <span className="font-medium text-card-foreground">{count}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-card-foreground">Volunteer Specializations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {["Structural Engineer", "Civil Engineer", "Architect", "Building Inspector"].map(spec => {
                const count = volunteers.filter(v => v.specialization === spec).length;
                return count > 0 ? (
                  <div key={spec} className="flex justify-between text-sm">
                    <span className="text-card-foreground">{spec}</span>
                    <span className="font-medium text-card-foreground">{count}</span>
                  </div>
                ) : null;
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}