/* eslint-disable @next/next/no-img-element */
"use client";
import { MapView } from "./mapview";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Clock, CheckCircle, AlertCircle, Home, MapPin } from "lucide-react";
import { Request } from "@/models/request";
import { formatDateTime } from "@/lib/convert";
interface RequestStatusProps {
  activeRequest: Request;
  userRequestsData: Request[];
  setOpenMap: (val: boolean) => void;
  setSelectedRequest: (r: Request) => void;
}
type BadgeVariant =
  | "secondary"
  | "default"
  | "destructive"
  | "outline"
  | "progress";

const getStatusBadge = (status: string) => {
  const statusConfig: Record<
    string,
    {
      label: string;
      variant: BadgeVariant;
      icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    }
  > = {
    pending: { label: "Pending", variant: "secondary", icon: Clock },
    "in progress": { label: "In Progress", variant: "default", icon: Clock },
    completed: {
      label: "Completed",
      variant: "destructive",
      icon: CheckCircle,
    },
    cancelled: { label: "Cancelled", variant: "outline", icon: AlertCircle },
  };

  const config = statusConfig[status.toLowerCase()] || statusConfig.pending;
  const IconComponent = config.icon;

  return (
    <Badge variant={config.variant} className="flex items-center gap-1">
      <IconComponent className="h-3 w-3" />
      {config.label}
    </Badge>
  );
};

export default function RequestStatus({
  activeRequest,
  userRequestsData,
  setOpenMap,
  setSelectedRequest
}: RequestStatusProps) {
  return (
    <div className="min-h-screen w-screen bg-background p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              Current Request Status
            </CardTitle>
            <CardDescription>
              You have an active request. Please wait for it to be completed
              before submitting a new one.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Request Status Overview */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-blue-900">
                    Request #{activeRequest.requestId}
                  </h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Submitted on{" "}
                    {formatDateTime(activeRequest.dateCreated)}
                  </p>
                </div>
                {getStatusBadge(activeRequest.requestStatus.toLowerCase())}
              </div>
            </div>

            {/* Request Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Property Image</Label>
                  <div className="mt-2 w-full h-48 border rounded-lg overflow-hidden">
                    <img
                      src={activeRequest.requestImage!}
                      alt="Property"
                      className="w-full h-full object-cover"
                    />
                  </div>
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
                      <span>You&apos;ll receive assessment results</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative w-full">
              <div className="w-full h-35 overflow-hidden [mask-image:linear-gradient(to_top,transparent,black)] [--tw-mask-image:linear-gradient(to_top,transparent,black)]">
                <MapView
                  useMarker={false}
                  className="-mt-75 pointer-events-none"
                  latitude={activeRequest.latitude?.toString() || ""}
                  longitude={activeRequest.longitude?.toString() || ""}
                  zoom={13}
                />
              </div>
              <Button
                onClick={() => setOpenMap(true)}
                className="absolute right-1/2 translate-x-1/2 bottom-4"
              >
                View Map
              </Button>
            </div>
            {activeRequest.volunteerId &&(
              <div className="flex justify-between">
              <div>
                <Label>Volunteer Name</Label>
                <div>{activeRequest.volunteerName}</div>
              </div>
              <div className="flex flex-col items-end">
                <Label>Date Assigned</Label>
                <div className="text-sm text-black/70">{formatDateTime(activeRequest.dateAssigned!)}</div>
              </div>
            </div>
            )}

            {/* Completed Requests History */}
          </CardContent>
        </Card>
        {userRequestsData.filter(
          (req) => req.requestStatus.toLowerCase() === "completed"
        ).length > 0 && (
          <Card>
            <CardContent>
              <h3 className="text-lg font-semibold mb-4">
                Previous Completed Requests
              </h3>
              <div className="space-y-3">
                {userRequestsData
                  .filter(
                    (req) => req.requestStatus.toLowerCase() === "completed"
                  )
                  .map((request) => (
                    <Card key={request.requestId} className="p-4 cursor-pointer" onClick={() => setSelectedRequest(request)}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">
                            Request #{request.requestId}
                          </p>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {request.requestDetails}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Completed on{" "}
                            {new Date(
                              request.dateUpdated!
                            ).toLocaleDateString()}
                          </p>
                        </div>
                        {getStatusBadge(request.requestStatus.toLowerCase())}
                      </div>
                    </Card>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
