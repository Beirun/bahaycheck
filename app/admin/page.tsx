"use client";

import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  XCircle,
  Download,
  AlertCircle,
  UserPlus,
  FileCheck,
  Bell,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

// Import the components
import OverviewTab from "@/components/overview";
import RequestsTab from "@/components/requests";
import VolunteersTab from "@/components/volunteers";
import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";
import MobileSearch from "@/components/mobilesearch";

// Mock data types
type RequestStatus = "pending" | "in-progress" | "completed" | "cancelled";
type VolunteerStatus = "pending" | "approved" | "rejected";
type NotificationType = "new_volunteer" | "new_request" | "request_update";

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
  specialization:
    | "Structural Engineer"
    | "Civil Engineer"
    | "Architect"
    | "Building Inspector";
  experience: string;
  status: VolunteerStatus;
  dateApplied: string;
}

interface Notification {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  type: NotificationType;
  read: boolean;
  relatedId?: string;
}

export default function LGUDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [requests, setRequests] = useState<SafetyRequest[]>([]);
  const [volunteers, setVolunteers] = useState<VolunteerApplication[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<SafetyRequest | null>(
    null
  );
  const [selectedVolunteer, setSelectedVolunteer] =
    useState<VolunteerApplication | null>(null);
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [isVolunteerDialogOpen, setIsVolunteerDialogOpen] = useState(false);
  const [assessmentNote, setAssessmentNote] = useState("");
  const [assignedEngineer, setAssignedEngineer] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Mock data
  useEffect(() => {
    // Mock safety requests
    const mockRequests: SafetyRequest[] = [
      {
        id: "REQ-001",
        citizenName: "Maria Santos",
        phone: "0912 345 6789",
        barangay: "Barangay 1",
        sitio: "Sitio Pag-asa",
        houseDescription:
          "2-storey concrete house with visible cracks on walls",
        status: "pending",
        dateRequested: "2024-01-15",
        coordinates: "14.5995° N, 120.9842° E",
      },
      {
        id: "REQ-002",
        citizenName: "Juan Dela Cruz",
        phone: "0917 890 1234",
        barangay: "Barangay 2",
        sitio: "Sitio Matiwasay",
        houseDescription: "Single-storey wooden house, foundation shifted",
        status: "in-progress",
        dateRequested: "2024-01-14",
        assignedVolunteer: "Engr. Roberto Garcia",
        assessment:
          "Initial inspection completed, requires structural analysis",
      },
      {
        id: "REQ-003",
        citizenName: "Ana Reyes",
        phone: "0918 765 4321",
        barangay: "Barangay 3",
        sitio: "Sitio Malinis",
        houseDescription: "3-storey building, minor cracks observed",
        status: "completed",
        dateRequested: "2024-01-10",
        assignedVolunteer: "Engr. Maria Lopez",
        assessment: "Structure is safe for occupancy with minor repairs needed",
      },
      {
        id: "REQ-004",
        citizenName: "Carlos Lim",
        phone: "0916 543 2109",
        barangay: "Barangay 4",
        sitio: "Sitio Bagong Buhay",
        houseDescription: "Single-storey mixed materials, roof damage",
        status: "pending",
        dateRequested: "2024-01-16",
        coordinates: "14.6001° N, 120.9850° E",
      },
    ];

    // Mock volunteer applications
    const mockVolunteers: VolunteerApplication[] = [
      {
        id: "VOL-001",
        firstName: "Roberto",
        lastName: "Garcia",
        phone: "0919 876 5432",
        email: "roberto.garcia@email.com",
        licenseNumber: "PRC-123456",
        licenseImage: "/license-sample.jpg",
        specialization: "Structural Engineer",
        experience: "10 years in structural assessment",
        status: "approved",
        dateApplied: "2024-01-05",
      },
      {
        id: "VOL-002",
        firstName: "Maria",
        lastName: "Lopez",
        phone: "0918 765 4321",
        email: "maria.lopez@email.com",
        licenseNumber: "PRC-654321",
        licenseImage: "/license-sample.jpg",
        specialization: "Civil Engineer",
        experience: "8 years in building inspection",
        status: "approved",
        dateApplied: "2024-01-06",
      },
      {
        id: "VOL-003",
        firstName: "Carlos",
        lastName: "Santos",
        phone: "0917 654 3210",
        email: "carlos.santos@email.com",
        licenseNumber: "PRC-789012",
        licenseImage: "/license-sample.jpg",
        specialization: "Structural Engineer",
        experience: "5 years in earthquake engineering",
        status: "pending",
        dateApplied: "2024-01-15",
      },
      {
        id: "VOL-004",
        firstName: "Elena",
        lastName: "Rodriguez",
        phone: "0915 432 1098",
        email: "elena.rodriguez@email.com",
        licenseNumber: "PRC-345678",
        licenseImage: "/license-sample.jpg",
        specialization: "Architect",
        experience: "7 years in building design and assessment",
        status: "pending",
        dateApplied: "2024-01-14",
      },
    ];

    // Mock notifications
    const mockNotifications: Notification[] = [
      {
        id: "NOT-001",
        title: "New Volunteer Registration",
        description:
          "Elena Rodriguez has submitted a volunteer application for Architect position.",
        date: "2024-01-16",
        time: "10:30 AM",
        type: "new_volunteer",
        read: false,
        relatedId: "VOL-004",
      },
      {
        id: "NOT-002",
        title: "New Safety Request",
        description:
          "Carlos Lim has submitted a new house evaluation request in Barangay 4.",
        date: "2024-01-16",
        time: "09:15 AM",
        type: "new_request",
        read: false,
        relatedId: "REQ-004",
      },
      {
        id: "NOT-003",
        title: "Request Status Updated",
        description:
          "Juan Dela Cruz's request has been updated to In Progress.",
        date: "2024-01-15",
        time: "03:45 PM",
        type: "request_update",
        read: true,
        relatedId: "REQ-002",
      },
      {
        id: "NOT-004",
        title: "New Volunteer Registration",
        description:
          "Carlos Santos has submitted a volunteer application for Structural Engineer position.",
        date: "2024-01-15",
        time: "02:20 PM",
        type: "new_volunteer",
        read: true,
        relatedId: "VOL-003",
      },
      {
        id: "NOT-005",
        title: "Request Completed",
        description:
          "Ana Reyes's safety evaluation has been completed by Engr. Maria Lopez.",
        date: "2024-01-14",
        time: "11:10 AM",
        type: "request_update",
        read: true,
        relatedId: "REQ-003",
      },
    ];

    setRequests(mockRequests);
    setVolunteers(mockVolunteers);
    setNotifications(mockNotifications);
  }, []);

  // Close notifications when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setNotificationOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filteredRequests = requests.filter(
    (request) =>
      request.citizenName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.barangay.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.sitio.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingRequests = requests.filter((req) => req.status === "pending");
  const inProgressRequests = requests.filter(
    (req) => req.status === "in-progress"
  );
  const pendingVolunteers = volunteers.filter(
    (vol) => vol.status === "pending"
  );
  const approvedVolunteers = volunteers.filter(
    (vol) => vol.status === "approved"
  );
  const unreadNotifications = notifications.filter(
    (notification) => !notification.read
  );

  const handleViewRequest = (request: SafetyRequest) => {
    setSelectedRequest(request);
    setAssessmentNote(request.assessment || "");
    setAssignedEngineer(request.assignedVolunteer || "");
    setIsRequestDialogOpen(true);
  };

  const handleViewVolunteer = (volunteer: VolunteerApplication) => {
    setSelectedVolunteer(volunteer);
    setIsVolunteerDialogOpen(true);
  };

  const handleUpdateRequest = () => {
    if (selectedRequest) {
      setRequests((prev) =>
        prev.map((req) =>
          req.id === selectedRequest.id
            ? {
                ...req,
                assessment: assessmentNote,
                assignedVolunteer: assignedEngineer,
                status: assignedEngineer ? "in-progress" : req.status,
              }
            : req
        )
      );
      setIsRequestDialogOpen(false);
    }
  };

  const handleVolunteerAction = (
    volunteerId: string,
    action: "approve" | "reject"
  ) => {
    setVolunteers((prev) =>
      prev.map((vol) =>
        vol.id === volunteerId
          ? { ...vol, status: action === "approve" ? "approved" : "rejected" }
          : vol
      )
    );
    setIsVolunteerDialogOpen(false);
  };

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
  };

  const handleNotificationClick = (notification: Notification) => {
    handleMarkAsRead(notification.id);

    // Navigate based on notification type
    if (notification.type === "new_volunteer") {
      setActiveTab("volunteers");
      const volunteer = volunteers.find((v) => v.id === notification.relatedId);
      if (volunteer) {
        setTimeout(() => handleViewVolunteer(volunteer), 100);
      }
    } else if (
      notification.type === "new_request" ||
      notification.type === "request_update"
    ) {
      setActiveTab("requests");
      const request = requests.find((r) => r.id === notification.relatedId);
      if (request) {
        setTimeout(() => handleViewRequest(request), 100);
      }
    }

    setNotificationOpen(false);
  };

  const getStatusBadge = (status: RequestStatus) => {
    const variants: Record<RequestStatus, string> = {
      pending: "bg-chart-4/20 text-chart-4 border-chart-4/30",
      "in-progress": "bg-chart-3/20 text-chart-3 border-chart-3/30",
      completed: "bg-chart-2/20 text-chart-2 border-chart-2/30",
      cancelled: "bg-destructive/20 text-destructive border-destructive/30",
    };
    return (
      <Badge variant="outline" className={variants[status]}>
        {status.replace("-", " ")}
      </Badge>
    );
  };

  const getVolunteerStatusBadge = (status: VolunteerStatus) => {
    const variants: Record<VolunteerStatus, string> = {
      pending: "bg-chart-4/20 text-chart-4 border-chart-4/30",
      approved: "bg-chart-2/20 text-chart-2 border-chart-2/30",
      rejected: "bg-destructive/20 text-destructive border-destructive/30",
    };
    return (
      <Badge variant="outline" className={variants[status]}>
        {status}
      </Badge>
    );
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case "new_volunteer":
        return <UserPlus className="h-4 w-4 text-chart-3" />;
      case "new_request":
        return <FileCheck className="h-4 w-4 text-chart-4" />;
      case "request_update":
        return <AlertCircle className="h-4 w-4 text-chart-2" />;
      default:
        return <Bell className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <div className="flex">
        <div className="md:pl-64 flex flex-col flex-1 w-full">
          <Navbar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            unreadNotifications={unreadNotifications.length}
            notifications={notifications}
            handleMarkAllAsRead={handleMarkAllAsRead}
            handleNotificationClick={handleNotificationClick}
            getNotificationIcon={getNotificationIcon}
            setActiveTab={setActiveTab}
            setSidebarOpen={setSidebarOpen}
            notificationOpen={notificationOpen}
            setNotificationOpen={setNotificationOpen}
            notificationRef={notificationRef as React.RefObject<HTMLDivElement>}
          />

          <main className="flex-1 p-4 sm:p-6 w-full">
            <MobileSearch
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />

            {/* Main Content */}
            {activeTab === "overview" && (
              <OverviewTab
                requests={requests}
                volunteers={volunteers}
                onViewRequest={handleViewRequest}
                onViewVolunteer={handleViewVolunteer}
                setActiveTab={setActiveTab}
              />
            )}

            {activeTab === "requests" && (
              <RequestsTab
                filteredRequests={filteredRequests}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                onViewRequest={handleViewRequest}
              />
            )}

            {activeTab === "volunteers" && (
              <VolunteersTab
                volunteers={volunteers}
                pendingVolunteers={pendingVolunteers}
                approvedVolunteers={approvedVolunteers}
                onViewVolunteer={handleViewVolunteer}
              />
            )}
          </main>
        </div>
      </div>

      {/* Request Details Dialog */}
      <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
        <DialogContent className="max-w-md w-[90vw] p-4 sm:p-6">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-lg sm:text-xl text-card-foreground">
              Safety Request
            </DialogTitle>
            <DialogDescription className="text-sm">
              Review and update house evaluation request
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto text-sm">
              {/* Compact grid for citizen info */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Citizen
                  </Label>
                  <p className="font-medium text-card-foreground truncate">
                    {selectedRequest.citizenName}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Contact
                  </Label>
                  <p className="font-medium text-card-foreground">
                    {selectedRequest.phone}
                  </p>
                </div>
                <div className="col-span-2">
                  <Label className="text-xs text-muted-foreground">
                    Address
                  </Label>
                  <p className="font-medium text-card-foreground truncate">
                    {selectedRequest.sitio}, {selectedRequest.barangay}
                  </p>
                </div>
              </div>

              {/* Status and ID */}
              <div className="flex justify-between items-center pt-2 border-t">
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Request ID
                  </Label>
                  <p className="font-medium text-card-foreground text-xs">
                    {selectedRequest.id}
                  </p>
                </div>
                <div className="text-right">
                  <Label className="text-xs text-muted-foreground">
                    Status
                  </Label>
                  <div className="scale-90 origin-right">
                    {getStatusBadge(selectedRequest.status)}
                  </div>
                </div>
              </div>

              {/* House Description */}
              <div>
                <Label className="text-xs text-muted-foreground">
                  House Description
                </Label>
                <p className="mt-1 text-xs bg-muted p-2 rounded text-card-foreground line-clamp-3">
                  {selectedRequest.houseDescription}
                </p>
              </div>

              {/* Coordinates */}
              {selectedRequest.coordinates && (
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Coordinates
                  </Label>
                  <p className="mt-1 text-xs font-mono bg-muted p-2 rounded text-card-foreground truncate">
                    {selectedRequest.coordinates}
                  </p>
                </div>
              )}

              {/* Engineer Assignment */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">
                  Assign Volunteer
                </Label>
                <Select
                  defaultValue="Unassigned"
                  value={assignedEngineer}
                  onValueChange={setAssignedEngineer}
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Select engineer" />
                  </SelectTrigger>
                  <SelectContent align="start">
                    <SelectItem value="Unassigned">Unassigned</SelectItem>
                    {approvedVolunteers.map((volunteer) => (
                      <SelectItem
                        key={volunteer.id}
                        value={`${volunteer.firstName} ${volunteer.lastName}`}
                      >
                        {volunteer.firstName} {volunteer.lastName} -{" "}
                        {volunteer.specialization}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Assessment Notes
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">
                  Assessment Notes
                </Label>
                <Textarea
                  placeholder="Enter assessment notes..."
                  value={assessmentNote}
                  onChange={(e) => setAssessmentNote(e.target.value)}
                  rows={3}
                  className="text-sm min-h-[60px]"
                />
              </div> */}
            </div>
          )}

          <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsRequestDialogOpen(false)}
              className="h-9 text-sm w-full sm:w-24"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateRequest}
              className="h-9 text-sm w-full sm:w-32"
            >
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Volunteer Verification Dialog */}
      <Dialog
        open={isVolunteerDialogOpen}
        onOpenChange={setIsVolunteerDialogOpen}
      >
        <DialogContent className="max-w-md w-[90vw] p-4 sm:p-6">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-lg sm:text-xl text-card-foreground">
              Volunteer Review
            </DialogTitle>
            <DialogDescription className="text-sm">
              Verify credentials and license
            </DialogDescription>
          </DialogHeader>

          {selectedVolunteer && (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto text-sm">
              {/* Volunteer Header */}
              <div className="flex items-center space-x-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="text-sm bg-primary text-primary-foreground">
                    {selectedVolunteer.firstName[0]}
                    {selectedVolunteer.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-card-foreground text-sm">
                    {selectedVolunteer.firstName} {selectedVolunteer.lastName}
                  </h3>
                  <p className="text-muted-foreground text-xs">
                    {selectedVolunteer.specialization}
                  </p>
                </div>
              </div>

              {/* Contact and License */}
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Contact
                  </Label>
                  <p className="text-card-foreground text-xs">
                    {selectedVolunteer.phone}
                  </p>
                  <p className="text-card-foreground text-xs truncate">
                    {selectedVolunteer.email}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">
                    License Number
                  </Label>
                  <p className="text-xs font-mono text-card-foreground">
                    {selectedVolunteer.licenseNumber}
                  </p>
                </div>
              </div>

              {/* Experience */}
              {/* <div>
                <Label className="text-xs text-muted-foreground">
                  Experience
                </Label>
                <p className="text-xs bg-muted p-2 rounded text-card-foreground line-clamp-3">
                  {selectedVolunteer.experience}
                </p>
              </div> */}

              {/* License Document */}
              <div>
                <Label className="text-xs text-muted-foreground">
                  License Document
                </Label>
                <div className="mt-1 border border-border rounded p-3 bg-muted">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Professional License
                    </span>
                    <Button variant="outline" size="sm" className="h-7 text-xs">
                      <Download className="h-3 w-3 mr-1" />
                      View
                    </Button>
                  </div>
                </div>
              </div>

              {/* Verification Note */}
              <div className="bg-chart-4/20 border border-chart-4/30 rounded p-3">
                <p className="text-xs text-chart-4">
                  <strong>Note:</strong> Verify license with PRC database.
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() =>
                handleVolunteerAction(selectedVolunteer?.id || "", "reject")
              }
              className="h-9 text-sm text-destructive border-destructive/30 hover:bg-destructive/10 w-full sm:w-auto"
            >
              <XCircle className="h-3 w-3 mr-1" />
              Reject
            </Button>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={() => setIsVolunteerDialogOpen(false)}
                className="h-9 text-sm flex-1"
              >
                Later
              </Button>
              <Button
                onClick={() =>
                  handleVolunteerAction(selectedVolunteer?.id || "", "approve")
                }
                className="h-9 text-sm flex-1 bg-chart-2 hover:bg-chart-2/90 text-chart-2-foreground"
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Approve
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Volunteer Verification Dialog */}
      <Dialog
        open={isVolunteerDialogOpen}
        onOpenChange={setIsVolunteerDialogOpen}
      >
        <DialogContent className="max-w-md w-[90vw] p-4 sm:p-6">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-lg sm:text-xl text-card-foreground">
              Volunteer Review
            </DialogTitle>
            <DialogDescription className="text-sm">
              Verify credentials and license
            </DialogDescription>
          </DialogHeader>

          {selectedVolunteer && (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto text-sm">
              {/* Volunteer Header */}
              <div className="flex items-center space-x-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="text-sm bg-primary text-primary-foreground">
                    {selectedVolunteer.firstName[0]}
                    {selectedVolunteer.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-card-foreground text-sm">
                    {selectedVolunteer.firstName} {selectedVolunteer.lastName}
                  </h3>
                  <p className="text-muted-foreground text-xs">
                    {selectedVolunteer.specialization}
                  </p>
                </div>
              </div>

              {/* Contact and License */}
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Contact
                  </Label>
                  <p className="text-card-foreground text-xs">
                    {selectedVolunteer.phone}
                  </p>
                  <p className="text-card-foreground text-xs truncate">
                    {selectedVolunteer.email}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">
                    License Number
                  </Label>
                  <p className="text-xs font-mono text-card-foreground">
                    {selectedVolunteer.licenseNumber}
                  </p>
                </div>
              </div>

              {/* Experience */}
              {/* <div>
                <Label className="text-xs text-muted-foreground">
                  Experience
                </Label>
                <p className="text-xs bg-muted p-2 rounded text-card-foreground line-clamp-3">
                  {selectedVolunteer.experience}
                </p>
              </div> */}

              {/* License Document */}
              <div>
                <Label className="text-xs text-muted-foreground">
                  License Document
                </Label>
                <div className="mt-1 border border-border rounded p-3 bg-muted">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Professional License
                    </span>
                    <Button variant="outline" size="sm" className="h-7 text-xs">
                      <Download className="h-3 w-3 mr-1" />
                      View
                    </Button>
                  </div>
                </div>
              </div>

              {/* Verification Note */}
              <div className="bg-chart-4/20 border border-chart-4/30 rounded p-3">
                <p className="text-xs text-chart-4">
                  <strong>Note:</strong> Verify license with PRC database.
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() =>
                handleVolunteerAction(selectedVolunteer?.id || "", "reject")
              }
              className="h-9 text-sm text-destructive border-destructive/30 hover:bg-destructive/10 w-full sm:w-auto"
            >
              <XCircle className="h-3 w-3 mr-1" />
              Reject
            </Button>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={() => setIsVolunteerDialogOpen(false)}
                className="h-9 text-sm flex-1"
              >
                Later
              </Button>
              <Button
                onClick={() =>
                  handleVolunteerAction(selectedVolunteer?.id || "", "approve")
                }
                className="h-9 text-sm flex-1 bg-chart-2 hover:bg-chart-2/90 text-chart-2-foreground"
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Approve
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Volunteer Verification Dialog */}
      <Dialog
        open={isVolunteerDialogOpen}
        onOpenChange={setIsVolunteerDialogOpen}
      >
        <DialogContent className="max-w-2xl w-[95vw] sm:w-full">
          <DialogHeader>
            <DialogTitle className="text-card-foreground">
              Volunteer Application Review
            </DialogTitle>
            <DialogDescription>
              Verify volunteer credentials and professional license
            </DialogDescription>
          </DialogHeader>

          {selectedVolunteer && (
            <div className="space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-lg bg-primary text-primary-foreground">
                    {selectedVolunteer.firstName[0]}
                    {selectedVolunteer.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold text-card-foreground">
                    {selectedVolunteer.firstName} {selectedVolunteer.lastName}
                  </h3>
                  <p className="text-muted-foreground">
                    {selectedVolunteer.specialization}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-card-foreground">
                    Contact Information
                  </Label>
                  <p className="text-sm mt-1 text-card-foreground">
                    {selectedVolunteer.phone}
                  </p>
                  <p className="text-sm text-card-foreground">
                    {selectedVolunteer.email}
                  </p>
                </div>
                <div>
                  <Label className="text-card-foreground">
                    Professional License
                  </Label>
                  <p className="text-sm mt-1 font-mono text-card-foreground">
                    {selectedVolunteer.licenseNumber}
                  </p>
                </div>
                {/* <div className="sm:col-span-2">
                  <Label className="text-card-foreground">Experience</Label>
                  <p className="text-sm mt-1 bg-muted p-3 rounded-lg text-card-foreground">
                    {selectedVolunteer.experience}
                  </p>
                </div> */}
              </div>

              <div>
                <Label className="text-card-foreground">
                  License Verification
                </Label>
                <div className="mt-2 border border-border rounded-lg p-4 bg-muted">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Professional License Document
                    </span>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      View License
                    </Button>
                  </div>
                </div>
              </div>

              <div className="bg-chart-4/20 border border-chart-4/30 rounded-lg p-4">
                <p className="text-sm text-chart-4">
                  <strong>Verification Required:</strong> Please verify the
                  professional license with the PRC database and check the
                  authenticity of the uploaded documents.
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="flex flex-col sm:flex-row justify-between gap-2">
            <div>
              <Button
                variant="outline"
                onClick={() =>
                  handleVolunteerAction(selectedVolunteer?.id || "", "reject")
                }
                className="text-destructive border-destructive/30 hover:bg-destructive/10 w-full sm:w-auto"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => setIsVolunteerDialogOpen(false)}
                className="w-full sm:w-auto"
              >
                Review Later
              </Button>
              <Button
                onClick={() =>
                  handleVolunteerAction(selectedVolunteer?.id || "", "approve")
                }
                className="bg-chart-2 hover:bg-chart-2/90 text-chart-2-foreground w-full sm:w-auto"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve Volunteer
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
