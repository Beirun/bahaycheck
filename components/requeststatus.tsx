"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Clock, CheckCircle, AlertCircle, Home, MapPin } from "lucide-react";

interface RequestStatusProps {
  activeRequest: any;
  userRequestsData: any[];
  userData: any;
}

const getStatusBadge = (status: string) => {
  const statusConfig: any = {
    pending: { label: "Pending", variant: "secondary", icon: Clock },
    "in-progress": { label: "In Progress", variant: "default", icon: Clock },
    completed: { label: "Completed", variant: "destructive", icon: CheckCircle },
    cancelled: { label: "Cancelled", variant: "outline", icon: AlertCircle },
  };

  const config = statusConfig[status] || statusConfig.pending;
  const IconComponent = config.icon;

  return (
    <Badge variant={config.variant} className="flex items-center gap-1">
      <IconComponent className="h-3 w-3" />
      {config.label}
    </Badge>
  );
};

export default function RequestStatus({ activeRequest, userRequestsData, userData }: RequestStatusProps) {
  return (
    <div className="min-h-screen w-screen bg-background p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              Current Request Status
            </CardTitle>
            <CardDescription>
              You have an active request. Please wait for it to be completed before submitting a new one.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Request Status Overview */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-blue-900">Request #{activeRequest.requestId}</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Submitted on {new Date(activeRequest.dateCreated).toLocaleDateString()}
                  </p>
                </div>
                {getStatusBadge(activeRequest.requestStatus)}
              </div>
            </div>

            {/* Request Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Property Image</Label>
                  <div className="mt-2 w-full h-48 border rounded-lg overflow-hidden">
                    <img 
                      src={activeRequest.requestImage} 
                      alt="Property" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Location</Label>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {activeRequest.latitude}, {activeRequest.longitude}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Request Details</Label>
                  <p className="mt-1 text-sm text-muted-foreground bg-muted p-3 rounded">
                    {activeRequest.requestDetails}
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium">Next Steps</Label>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>Waiting for volunteer assignment</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>Volunteer will visit your location</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-muted-foreground" />
                      <span>You'll receive assessment results</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Completed Requests History */}
            {userRequestsData.filter(req => req.requestStatus === "completed").length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">Previous Completed Requests</h3>
                <div className="space-y-3">
                  {userRequestsData
                    .filter(req => req.requestStatus === "completed")
                    .map(request => (
                      <Card key={request.requestId} className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Request #{request.requestId}</p>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {request.requestDetails}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Completed on {new Date(request.dateUpdated!).toLocaleDateString()}
                            </p>
                          </div>
                          {getStatusBadge(request.requestStatus)}
                        </div>
                      </Card>
                    ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}