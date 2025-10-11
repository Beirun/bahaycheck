"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  MapPin,
  Calendar,
  Clock,
  FileText,
  Home,
  CheckCircle,
  AlertCircle,
  Loader,
} from "lucide-react";
import { ModeToggle } from "@/components/theme-toggle";

// Define types for our data
interface Request {
  id: string;
  citizenName: string;
  barangay: string;
  sitio: string;
  phone: string;
  houseDescription: string;
  coordinates: string;
  status: "assigned" | "in-progress" | "completed" | "pending";
  dateRequested: string;
  priority: "high" | "medium" | "low";
  assignedDate: string;
}

// Mock data for volunteer requests
const mockRequests: Request[] = [
  {
    id: "REQ-001",
    citizenName: "Maria Santos",
    barangay: "Poblacion",
    sitio: "Sitio Proper",
    phone: "09123456789",
    houseDescription:
      "Two-story concrete house with visible cracks on the foundation and leaning walls",
    coordinates: "11.2345°N, 125.1234°E",
    status: "assigned",
    dateRequested: "2024-01-15",
    priority: "high",
    assignedDate: "2024-01-16",
  },
  {
    id: "REQ-002",
    citizenName: "Juan Dela Cruz",
    barangay: "San Isidro",
    sitio: "Sitio Bagsakan",
    phone: "09123456789",
    houseDescription:
      "Single-story wooden house with termite damage and weak roof structure",
    coordinates: "11.2356°N, 125.1245°E",
    status: "in-progress",
    dateRequested: "2024-01-10",
    priority: "medium",
    assignedDate: "2024-01-11",
  },
  {
    id: "REQ-003",
    citizenName: "Ana Reyes",
    barangay: "Sta. Cruz",
    sitio: "Sitio Crossing",
    phone: "09123456789",
    houseDescription:
      "Mixed materials house with erosion concerns near the foundation",
    coordinates: "11.2334°N, 125.1223°E",
    status: "completed",
    dateRequested: "2024-01-05",
    priority: "low",
    assignedDate: "2024-01-06",
  },
];

type StatusConfig = {
  [key: string]: {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline" | "progress";
    icon: React.ComponentType<any>;
  };
};

type PriorityConfig = {
  [key: string]: {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  };
};

export default function VolunteerDashboard() {
  const [activeTab, setActiveTab] = useState("assigned");
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [assessmentNote, setAssessmentNote] = useState("");
  const [assessmentStatus, setAssessmentStatus] = useState("");

  const getStatusBadge = (status: string) => {
    const statusConfig: StatusConfig = {
      assigned: { label: "Assigned", variant: "destructive", icon: Clock },
      "in-progress": { label: "In Progress", variant: "progress", icon: Loader },
      completed: {
        label: "Completed",
        variant: "secondary",
        icon: CheckCircle,
      },

    };

    const config = statusConfig[status] || statusConfig.pending;
    const IconComponent = config.icon;

    return (
      <Badge variant={config.variant} className={status == "completed" ? "flex items-center gap-1 text-black":"flex items-center gap-1 text-white"}>
        <IconComponent className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig: PriorityConfig = {
      high: { label: "High", variant: "destructive" },
      medium: { label: "Medium", variant: "default" },
      low: { label: "Low", variant: "secondary" },
    };

    const config = priorityConfig[priority] || priorityConfig.medium;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const filteredRequests = mockRequests.filter((request) =>
    activeTab === "all" ? true : request.status === activeTab
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-card-foreground">
                Volunteer Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">Structural Engineer</p>
            </div>
            <div className="flex items-center space-x-4">
              <ModeToggle />
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary dark:text-white text-card-foreground">
                  SE
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        {/* <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Assigned Requests
                  </p>
                  <p className="text-2xl font-bold text-card-foreground">2</p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    In Progress
                  </p>
                  <p className="text-2xl font-bold text-card-foreground">1</p>
                </div>
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Loader className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Completed
                  </p>
                  <p className="text-2xl font-bold text-card-foreground">1</p>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div> */}

        {/* Request Management */}
        <Card>
          <CardHeader>
            <CardTitle>Safety Evaluation Requests</CardTitle>
            <CardDescription>
              Manage your assigned house evaluation requests and submit
              assessments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4 ">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="assigned">Assigned</TabsTrigger>
                <TabsTrigger value="in-progress">In Progress</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="space-y-4 mt-4">
                <p className="font-bold">
                  Total<span>{activeTab != "all" ? " " : ""}</span>
                  <span className="capitalize">
                    {activeTab != "all" ? activeTab : ""}
                  </span>
                  : {filteredRequests.length}
                </p>
                {filteredRequests.map((request) => (
                  <Card
                    key={request.id}
                    className="cursor-pointer hover:bg-accent/50 transition-colors border-border"
                    onClick={() => setSelectedRequest(request)}
                  >
                    <CardContent>
                      <div className="flex flex-col space-y-3">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Home className="h-4 w-4 text-muted-foreground" />
                            <span className="font-semibold text-card-foreground">
                              {request.id}
                            </span>
                            {/* {getPriorityBadge(request.priority)} */}
                          </div>
                          {getStatusBadge(request.status)}
                        </div>

                        {/* Citizen Info */}
                        <div>
                          <h3 className="font-semibold text-card-foreground">
                            {request.citizenName}
                          </h3>
                          <div className="flex items-center text-sm text-muted-foreground mt-1">
                            <MapPin className="h-3 w-3 mr-1" />
                            {request.barangay}, {request.sitio}
                          </div>
                        </div>

                        {/* House Description */}
                        <div>
                          <p className="text-sm text-card-foreground line-clamp-2">
                            {request.houseDescription}
                          </p>
                        </div>

                        {/* Dates */}
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            Requested:{" "}
                            {new Date(
                              request.dateRequested
                            ).toLocaleDateString()}
                          </div>
                          {request.assignedDate && (
                            <div className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              Assigned:{" "}
                              {new Date(
                                request.assignedDate
                              ).toLocaleDateString()}
                            </div>
                          )}
                        </div>

                        {/* Action Button */}
                        <div className="flex justify-end">
                          <Button
                            size="sm"
                            variant={
                              request.status === "completed"
                                ? "outline"
                                : "default"
                            }
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedRequest(request);
                            }}
                            className={
                              request.status === "completed" ? "" : "text-white"
                            }
                          >
                            {request.status === "completed"
                              ? "View Assessment"
                              : "Start Assessment"}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Assessment Dialog */}
        <Dialog
          open={!!selectedRequest}
          onOpenChange={() => setSelectedRequest(null)}
        >
          <DialogContent className="max-w-md w-[90vw] p-4 sm:p-6">
            {selectedRequest && (
              <>
                <DialogHeader className="pb-4">
                  <DialogTitle className="text-lg sm:text-xl text-card-foreground">
                    House Safety Assessment
                  </DialogTitle>
                  <DialogDescription className="text-sm">
                    Submit your evaluation and recommendations
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 max-h-[60vh] overflow-y-auto text-sm">
                  {/* Request Details */}
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Request ID
                        </Label>
                        <p className="font-medium text-card-foreground">
                          {selectedRequest.id}
                        </p>
                      </div>
                      {/* <div>
                        <Label className="text-xs text-muted-foreground">
                          Priority
                        </Label>
                        <div>{getPriorityBadge(selectedRequest.priority)}</div>
                      </div> */}
                      <div className="col-span-2">
                        <Label className="text-xs text-muted-foreground">
                          Citizen
                        </Label>
                        <p className="font-medium text-card-foreground">
                          {selectedRequest.citizenName}{" "}
                          <span className="p-1 px-3 bg-gray-200 rounded-full w-fit">
                            {selectedRequest.phone}
                          </span>
                        </p>
                      </div>
                      <div className="col-span-2">
                        <Label className="text-xs text-muted-foreground">
                          Address
                        </Label>
                        <p className="font-medium text-card-foreground">
                          {selectedRequest.sitio}, {selectedRequest.barangay}
                        </p>
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs text-muted-foreground">
                        House Description
                      </Label>
                      <p className="mt-1 text-xs bg-muted p-2 rounded text-card-foreground">
                        {selectedRequest.houseDescription}
                      </p>
                    </div>

                    {selectedRequest.coordinates && (
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Coordinates
                        </Label>
                        <p className="mt-1 text-xs font-mono bg-muted p-2 rounded text-card-foreground">
                          {selectedRequest.coordinates}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Assessment Form */}
                  <div className="space-y-3 border-t pt-4">
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">
                        Assessment Status
                      </Label>
                      <Select
                        value={assessmentStatus}
                        onValueChange={setAssessmentStatus}
                      >
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="in-progress">
                            In Progress
                          </SelectItem>
                          <SelectItem value="needs-followup">
                            Needs Follow-up
                          </SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">
                        Assessment Notes
                      </Label>
                      <Textarea
                        placeholder="Enter your structural assessment, observations, safety recommendations, and any immediate concerns..."
                        value={assessmentNote}
                        onChange={(e) => setAssessmentNote(e.target.value)}
                        rows={4}
                        className="text-sm min-h-[100px]"
                      />
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded p-3">
                      <p className="text-xs text-amber-800">
                        <strong>Note:</strong> Your assessment will be reviewed
                        by LGU officials and used for safety recommendations to
                        the homeowner.
                      </p>
                    </div>
                  </div>
                </div>

                <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedRequest(null)}
                    className="h-9 text-sm w-full sm:w-24"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      // Handle assessment submission
                      console.log("Assessment submitted:", {
                        requestId: selectedRequest.id,
                        assessmentNote,
                        assessmentStatus,
                      });
                      setSelectedRequest(null);
                      setAssessmentNote("");
                      setAssessmentStatus("");
                    }}
                    className="h-9 text-sm w-full sm:w-32"
                  >
                    Submit Assessment
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
