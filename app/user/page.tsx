/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import RequestForm from "@/components/requestform";
import RequestStatus from "@/components/requeststatus";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { ModeToggle } from "@/components/theme-toggle";
import { useAuthStore } from "@/stores/useAuthStore";
import { Request } from "@/models/request";
import { useUserStore } from "@/stores/useUserStore";
import { useMediaQuery } from "@/hooks/use-media-query";
import MapView from "@/components/nossr/mapview";

export default function UserPage() {
  const router = useRouter();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);

  const { user, logout } = useAuthStore();
  const { requests, evaluations } = useUserStore();
  const [hasActiveRequest, setHasActiveRequest] = useState(false);
  const [activeRequest, setActiveRequest] = useState<Request | null>(null);
  const [openMap, setOpenMap] = useState(false);
  // Check if user has any active (non-completed) requests
  useEffect(() => {
    const activeRequests = requests.filter(
      (request) =>
        request.requestStatus.toLowerCase() !== "completed" &&
        request.requestStatus.toLowerCase() !== "cancelled"
    );

    if (activeRequests.length > 0) {
      setHasActiveRequest(true);
      setActiveRequest(activeRequests[0]); // Take the first active request
    } else {
      setHasActiveRequest(false);
      setActiveRequest(null);
    }
  }, [requests]);

  // Handle account settings navigation
  const handleAccountSettings = () => {
    router.push("/account");
  };

  // Handle logout
  const handleLogout = async () => {
    await logout(router);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Settings Dropdown */}
      <div className="h-16 border-b px-5 w-screen">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center h-16 w-full">
            {/* Left side - Title */}
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold text-card-foreground">
                Safety Evaluation
              </h1>
              <p className="text-sm text-muted-foreground">
                {hasActiveRequest ? "Request Status" : "Create New Request"}
              </p>
            </div>

            {/* Right side - Settings Dropdown */}
            <div className="flex gap-2 items-center justify-end">
              <ModeToggle />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full hover:bg-accent"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-white">
                        {user?.firstName[0] || ""}
                        {user?.lastName[0] || ""}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-56"
                  align="end"
                  forceMount
                  sideOffset={8}
                  onChange={(open) => {
                    if (open) {
                      document.body.classList.add("overflow-hidden");
                    } else {
                      document.body.classList.remove("overflow-hidden");
                    }
                  }}
                >
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user?.firstName || ""} {user?.lastName || ""}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.phoneNumber.substring(0, 4) +
                          " " +
                          user?.phoneNumber.substring(4, 7) +
                          " " +
                          user?.phoneNumber.substring(7) || ""}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleAccountSettings}
                    className="cursor-pointer"
                  >
                    <User className="mr-2 h-4 w-4" />
                    <span>Account Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-red-600 focus:text-red-600"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="">
        {/* If user has an active request, show request status */}

        {hasActiveRequest && activeRequest ? (
          <RequestStatus
            setOpenMap={setOpenMap}
            activeRequest={activeRequest}
            userRequestsData={requests}
            setSelectedRequest={setSelectedRequest}
          />
        ) : (
          /* If no active request, show the request form */
          <RequestForm
            setSelectedRequest={setSelectedRequest}
            userRequestsData={requests}
          />
        )}
      </div>
      {isDesktop ? (
        <Dialog open={openMap} onOpenChange={setOpenMap}>
          <DialogContent className="md:max-w-[47.5rem] space-y-4">
            <DialogHeader>
              <DialogTitle>Select Property Location</DialogTitle>
              <DialogDescription>
                Click on the map to select your property location or use current
                location
              </DialogDescription>
            </DialogHeader>
            <MapView
              latitude={activeRequest?.latitude?.toString() || ""}
              longitude={activeRequest?.longitude?.toString() || ""}
            />
            <DialogFooter>
              <Button
                size="lg"
                className="w-full"
                onClick={() => setOpenMap(false)}
              >
                Done
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : (
        <Drawer open={openMap} onOpenChange={setOpenMap}>
          <DrawerContent className="h-[95dvh] max-h-[95dvh] min-h-[55dvh]">
            <DrawerHeader>
              <DrawerTitle>Select Property Location</DrawerTitle>
              <DrawerDescription>
                Click on the map to select your property location or use current
                location
              </DrawerDescription>
            </DrawerHeader>
            <MapView
              latitude={activeRequest?.latitude?.toString() || ""}
              longitude={activeRequest?.longitude?.toString() || ""}
            />

            <DrawerFooter className="pt-4 mb-8">
              <Button
                size="lg"
                className="w-full"
                onClick={() => setOpenMap(false)}
              >
                Done
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      )}
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
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        Request ID
                      </Label>
                      <p className="font-medium text-card-foreground">
                        {selectedRequest.requestId}
                      </p>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground">
                      House Description
                    </Label>
                    <p className="mt-1 pl-4 py-4 text-xs bg-muted p-2 rounded text-card-foreground">
                      {selectedRequest.requestDetails}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      House Image
                    </Label>
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
                </div>
                {evaluations
                  .filter((e) => e.requestId === selectedRequest.requestId)
                  .map((e) => {
                    return (
                      <>
                        <div key={e.requestId} className="w-full flex justify-center text-lg font-medium pt-4">
                          Assessment Details
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">
                            Volunteer Name
                          </Label>
                          <div>{selectedRequest.volunteerName}</div>
                        </div>
                        <div className="flex w-full gap-2">
                          <div className="space-y-2 w-1/2">
                            <Label className="text-xs text-muted-foreground">
                              Damage Category
                            </Label>
                            <div>{e.damageCategory}</div>
                          </div>
                          <div className="space-y-2 w-1/2">
                            <Label className="text-xs text-muted-foreground">
                              House Category
                            </Label>
                            <div>{e.houseCategory}</div>
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">
                            Assessment Note
                          </Label>
                          <p className="mt-1 pl-4 py-4 text-xs bg-muted p-2 rounded text-card-foreground">
                            {e.note ?? "This volunteer didn't left any note."}
                          </p>
                        </div>
                      </>
                    );
                  })}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
