/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import OverviewTab from "@/components/overview";
import RequestsTab from "@/components/requests";
import VolunteersTab from "@/components/volunteers";
import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";
import MobileSearch from "@/components/mobilesearch";
import { useAdminStore } from "@/stores/useAdminStore";
import { useMediaQuery } from "@/hooks/use-media-query";
import MapView from "@/components/nossr/mapview";
import { User } from "@/models/user";
import { Request } from "@/models/request";

export default function LGUDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const {
    requests,
    users,
    licenses,
    evaluations,
    loading,
    assignRequest,
    rejectVolunteer,
    verifyVolunteer,
  } = useAdminStore();

  const [confirmAction, setConfirmAction] = useState<"approve" | "reject" | null>(null);
  const [confirmVolunteerDialog, setConfirmVolunteerDialog] = useState(false);
  const [openMap, setOpenMap] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [selectedVolunteer, setSelectedVolunteer] = useState<User | null>(null);
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [isVolunteerDialogOpen, setIsVolunteerDialogOpen] = useState(false);
  const [assignedVolunteer, setAssignedVolunteer] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isDesktop = useMediaQuery("(min-width: 768px)");

  const approvedVolunteers = users.filter(u => licenses.find(l => l.userId === u.userId)?.isVerified);
  const pendingVolunteers = users.filter(u => {
    const l = licenses.find(l => l.userId === u.userId);
    return l && !l.isVerified && !l.isRejected;
  });
  const filteredRequests = requests.filter(r => r.userName?.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleViewRequest = (r: Request) => {
    setSelectedRequest(r);
    const v = users.find(u => u.userId === r.volunteerId);
    setAssignedVolunteer(v ? v.userId.toString() : "0");
    setIsRequestDialogOpen(true);
  };

  const handleViewVolunteer = (u: User) => {
    setSelectedVolunteer(u);
    setIsVolunteerDialogOpen(true);
  };

  const handleUpdateRequest = async (requestId: number) => {
    if (!selectedRequest) return;
    const res = await assignRequest(requestId, Number(assignedVolunteer));
    if (res) setIsRequestDialogOpen(false);
  };

  const handleVolunteerAction = async (id: number, action: "approve" | "reject") => {
    const res = action === "approve" ? await verifyVolunteer(id) : await rejectVolunteer(id);
    if (res) {
      setIsVolunteerDialogOpen(false);
      setConfirmVolunteerDialog(false);
    }
  };

  const renderRequestContent = (
    <div className="space-y-4 text-sm">
      {selectedRequest && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Citizen</Label>
              <p className="font-medium">{selectedRequest.userName}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Status</Label>
              <p className="font-medium">{selectedRequest.requestStatus}</p>
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Contact</Label>
            <p className="font-medium">{selectedRequest.phoneNumber}</p>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Details</Label>
            <p className="text-xs bg-muted p-2 rounded">{selectedRequest.requestDetails}</p>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">House Image</Label>
            <div className="w-full flex justify-center border bg-gray-100">
              <img
                key={selectedRequest.requestId}
                src={selectedRequest.requestImage!}
                alt="License Preview"
                className="h-32 w-32 object-contain rounded border"
              />
            </div>
          </div>

          <div className="relative ">
            <div className="w-full h-35 overflow-hidden [mask-image:linear-gradient(to_top,transparent,black)] [--tw-mask-image:linear-gradient(to_top,transparent,black)]">
              <MapView
                useMarker={false}
                className="-mt-75 pointer-events-none"
                latitude={selectedRequest.latitude?.toString() || ""}
                longitude={selectedRequest.longitude?.toString() || ""}
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

          {evaluations.filter(e => e.requestId === selectedRequest.requestId).map(e => (
            <div key={e.requestId}>
              <div className="w-full flex justify-center text-lg font-medium pt-4">Assessment Details</div>
              <div>
                <Label className="text-xs text-muted-foreground">Volunteer Name</Label>
                <div>{selectedRequest.volunteerName}</div>
              </div>
              <div className="flex w-full gap-2">
                <div className="space-y-2 w-1/2">
                  <Label className="text-xs text-muted-foreground">Damage Category</Label>
                  <div>{e.damageCategory}</div>
                </div>
                <div className="space-y-2 w-1/2">
                  <Label className="text-xs text-muted-foreground">House Category</Label>
                  <div>{e.houseCategory}</div>
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Assessment Note</Label>
                <p className="mt-1 pl-4 py-4 text-xs bg-muted p-2 rounded text-card-foreground">
                  {e.note ?? "This volunteer didn't left any note."}
                </p>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );

  const renderVolunteerContent = (
    <div className="space-y-4 text-sm">
      {selectedVolunteer && (
        <>
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback>
                {selectedVolunteer.firstName[0]}
                {selectedVolunteer.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{selectedVolunteer.firstName} {selectedVolunteer.lastName}</p>
              <p className="text-xs text-muted-foreground">
                {licenses.find(l => l.userId === selectedVolunteer.userId)?.specialization}
              </p>
            </div>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Phone</Label>
            <p className="text-xs">{selectedVolunteer.phoneNumber}</p>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">License Document</Label>
            <div className="mt-1 border border-border rounded p-3 bg-muted flex flex-col gap-2">
              {licenses.filter(l => l.userId === selectedVolunteer.userId).map(l => (
                <img
                  key={l.licenseId}
                  src={typeof l.licenseImage === "string" ? l.licenseImage : URL.createObjectURL(l.licenseImage)}
                  alt="License Preview"
                  className="h-32 w-32 object-contain rounded border"
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderConfirmationContent = (
    <div className="flex flex-col sm:flex-row gap-2">
      <Button disabled={loading} variant="outline" onClick={() => setConfirmVolunteerDialog(false)}>
        {loading && <Loader2 className="animate-spin h-3 w-3 mr-1" />}
        Cancel
      </Button>
      <Button
        disabled={loading}
        className={
          confirmAction === "approve"
            ? "bg-primary hover:bg-primary/90 text-primary-foreground"
            : "bg-destructive/80 hover:bg-destructive/90 text-destructive-foreground"
        }
        onClick={() => handleVolunteerAction(selectedVolunteer!.userId, confirmAction!)}
      >
        {confirmAction === "approve" ? <CheckCircle className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
        {confirmAction === "approve" ? "Confirm Approve" : "Confirm Reject"}
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="flex">
        <div className="md:pl-64 flex flex-col flex-1 w-full">
          <Navbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} setSidebarOpen={setSidebarOpen} />
          <main className="flex-1 p-4 sm:p-6 w-full">
            <MobileSearch searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
            {activeTab === "overview" && <OverviewTab licenses={licenses} requests={requests} volunteers={users} onViewRequest={handleViewRequest} onViewVolunteer={handleViewVolunteer} setActiveTab={setActiveTab} />}
            {activeTab === "requests" && <RequestsTab filteredRequests={filteredRequests} searchTerm={searchTerm} setSearchTerm={setSearchTerm} onViewRequest={handleViewRequest} />}
            {activeTab === "volunteers" && <VolunteersTab licenses={licenses} volunteers={users} pendingVolunteers={pendingVolunteers} approvedVolunteers={approvedVolunteers} onViewVolunteer={handleViewVolunteer} />}
          </main>
        </div>
      </div>

      {/* Request Dialog/Drawer */}
      {isDesktop ? (
        <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
          <DialogContent className="max-w-md w-[90vw] p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle>Safety Request</DialogTitle>
              <DialogDescription>Review and update house evaluation request</DialogDescription>
            </DialogHeader>
            {renderRequestContent}
            <DialogFooter className="pt-4 flex gap-2">
              {!selectedRequest?.volunteerId && (
                <>
                  <Button variant="outline" onClick={() => setIsRequestDialogOpen(false)}>Cancel</Button>
                  <Button disabled={!assignedVolunteer || assignedVolunteer === "0"} onClick={() => handleUpdateRequest(selectedRequest?.requestId || 0)}>Update</Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : (
        <Drawer open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
          <DrawerContent className="h-[95dvh] max-h-[95dvh] min-h-[55dvh]">
            <DrawerHeader>
              <DrawerTitle>Safety Request</DrawerTitle>
              <DrawerDescription>Review and update house evaluation request</DrawerDescription>
            </DrawerHeader>
            {renderRequestContent}
            <DrawerFooter className="pt-4 flex gap-2">
              {!selectedRequest?.volunteerId && (
                <>
                  <Button variant="outline" onClick={() => setIsRequestDialogOpen(false)}>Cancel</Button>
                  <Button disabled={!assignedVolunteer || assignedVolunteer === "0"} onClick={() => handleUpdateRequest(selectedRequest?.requestId || 0)}>Update</Button>
                </>
              )}
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      )}

      {/* Volunteer Dialog/Drawer */}
      {isDesktop ? (
        <Dialog open={isVolunteerDialogOpen} onOpenChange={setIsVolunteerDialogOpen}>
          <DialogContent className="max-w-md w-[90vw] p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle>Volunteer Review</DialogTitle>
              <DialogDescription>Verify license and specialization</DialogDescription>
            </DialogHeader>
            {renderVolunteerContent}
            <DialogFooter className="pt-4 flex flex-col sm:flex-row gap-2">
              {licenses.find(l => !l.isVerified && !l.isRejected && selectedVolunteer?.userId === l.userId) && (
                <>
                  <Button disabled={loading} variant="outline" onClick={() => { setConfirmAction("reject"); setConfirmVolunteerDialog(true); }} className="text-destructive border-destructive/30 hover:bg-destructive/10"><XCircle className="h-3 w-3 mr-1" /> Reject</Button>
                  <Button disabled={loading} onClick={() => { setConfirmAction("approve"); setConfirmVolunteerDialog(true); }} className="bg-primary hover:bg-primary/90 text-primary-foreground"><CheckCircle className="h-3 w-3 mr-1" /> Approve</Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : (
        <Drawer open={isVolunteerDialogOpen} onOpenChange={setIsVolunteerDialogOpen}>
          <DrawerContent className="h-[95dvh] max-h-[95dvh] min-h-[55dvh]">
            <DrawerHeader>
              <DrawerTitle>Volunteer Review</DrawerTitle>
              <DrawerDescription>Verify license and specialization</DrawerDescription>
            </DrawerHeader>
            {renderVolunteerContent}
            <DrawerFooter className="pt-4 flex flex-col sm:flex-row gap-2">
              {licenses.find(l => !l.isVerified && !l.isRejected && selectedVolunteer?.userId === l.userId) && (
                <>
                  <Button disabled={loading} variant="outline" onClick={() => { setConfirmAction("reject"); setConfirmVolunteerDialog(true); }} className="text-destructive border-destructive/30 hover:bg-destructive/10"><XCircle className="h-3 w-3 mr-1" /> Reject</Button>
                  <Button disabled={loading} onClick={() => { setConfirmAction("approve"); setConfirmVolunteerDialog(true); }} className="bg-primary hover:bg-primary/90 text-primary-foreground"><CheckCircle className="h-3 w-3 mr-1" /> Approve</Button>
                </>
              )}
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      )}

      {/* Confirmation Dialog/Drawer */}
      {isDesktop ? (
        <Dialog open={confirmVolunteerDialog} onOpenChange={setConfirmVolunteerDialog}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>{confirmAction === "approve" ? "Approve Volunteer?" : "Reject Volunteer?"}</DialogTitle>
              <DialogDescription>{confirmAction === "approve" ? "This will approve the volunteer and grant access to the system." : "This will reject the volunteer’s application permanently."}</DialogDescription>
            </DialogHeader>
            <DialogFooter>{renderConfirmationContent}</DialogFooter>
          </DialogContent>
        </Dialog>
      ) : (
        <Drawer open={confirmVolunteerDialog} onOpenChange={setConfirmVolunteerDialog}>
          <DrawerContent className="h-[40dvh] max-h-[40dvh] min-h-[30dvh]">
            <DrawerHeader>
              <DrawerTitle>{confirmAction === "approve" ? "Approve Volunteer?" : "Reject Volunteer?"}</DrawerTitle>
              <DrawerDescription>{confirmAction === "approve" ? "This will approve the volunteer and grant access to the system." : "This will reject the volunteer’s application permanently."}</DrawerDescription>
            </DrawerHeader>
            <DrawerFooter>{renderConfirmationContent}</DrawerFooter>
          </DrawerContent>
        </Drawer>
      )}

      {/* Map Dialog/Drawer */}
      {isDesktop ? (
        <Dialog open={openMap} onOpenChange={setOpenMap}>
          <DialogContent className="md:max-w-[47.5rem] space-y-4">
            <DialogHeader>
              <DialogTitle>Select Property Location</DialogTitle>
              <DialogDescription>Click on the map to select your property location or use current location</DialogDescription>
            </DialogHeader>
            <MapView latitude={selectedRequest?.latitude?.toString() || ""} longitude={selectedRequest?.longitude?.toString() || ""} />
            <DialogFooter>
              <Button size="lg" className="w-full" onClick={() => setOpenMap(false)}>Done</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : (
        <Drawer open={openMap} onOpenChange={setOpenMap}>
          <DrawerContent className="h-[95dvh] max-h-[95dvh] min-h-[55dvh]">
            <DrawerHeader>
              <DrawerTitle>Select Property Location</DrawerTitle>
              <DrawerDescription>Click on the map to select your property location or use current location</DrawerDescription>
            </DrawerHeader>
            <MapView latitude={selectedRequest?.latitude?.toString() || ""} longitude={selectedRequest?.longitude?.toString() || ""} />
            <DrawerFooter className="pt-4 mb-8">
              <Button size="lg" className="w-full" onClick={() => setOpenMap(false)}>Done</Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      )}
    </div>
  );
}
