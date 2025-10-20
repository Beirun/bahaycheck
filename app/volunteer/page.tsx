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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Calendar,
  Clock,
  Home,
  CheckCircle,
  Loader,
  LogOut,
  User,
  AlertTriangle,
} from "lucide-react";
import { ModeToggle } from "@/components/theme-toggle";
import { useAuthStore } from "@/stores/useAuthStore";
import { useRouter } from "next/navigation";
import { useVolunteerStore } from "@/stores/useVolunteerStore";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Request } from "@/models/request";
import MapView from "@/components/nossr/mapview";
import { useMediaQuery } from "@/hooks/use-media-query";

type StatusConfig = {
  [key: string]: {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline" | "progress";
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  };
};

export default function VolunteerDashboard() {
  const { user, logout } = useAuthStore();
  const {
    evaluations,
    requests,
    license,
    loading,
    updateRequestStatus,
    createEvaluation,
  } = useVolunteerStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [assessmentNote, setAssessmentNote] = useState("");
  const [houseCategoryId, setHouseCategoryId] = useState("");
  const [damageCategoryId, setDamageCategoryId] = useState("");
  const [openMap, setOpenMap] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const handleLogout = async () => {
    await logout(router);
  };


  const handleAccountSettings = () => {
    router.push("/account");
  };

  const handleUpdateStatus = async (requestId: number) => {
    const res = await updateRequestStatus(requestId);
    if (res) setSelectedRequest(null);
  };

  const handleCreateEvaluation = async () => {
    const data = {
      requestId: selectedRequest?.requestId ?? 0,
      houseCategoryId: Number(houseCategoryId),
      damageCategoryId: Number(damageCategoryId),
      note: assessmentNote,
    };
    const res = await createEvaluation(data);
    if (res) {
      setSelectedRequest(null);
      setDamageCategoryId("");
      setHouseCategoryId("");
      setAssessmentNote("");
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: StatusConfig = {
      assigned: { label: "Assigned", variant: "destructive", icon: Clock },
      "in progress": {
        label: "In Progress",
        variant: "progress",
        icon: Loader,
      },
      completed: {
        label: "Completed",
        variant: "secondary",
        icon: CheckCircle,
      },
    };
    const config = statusConfig[status] || statusConfig.assigned;
    const IconComponent = config.icon;
    return (
      <Badge
        variant={config.variant}
        className={
          status === "completed"
            ? "flex items-center gap-1 text-black"
            : "flex items-center gap-1 text-white"
        }
      >
        <IconComponent className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const filteredRequests = requests.filter((r) =>
    activeTab === "all"
      ? true
      : r.requestStatus?.toLowerCase() === activeTab.toLowerCase()
  );

  const renderSkeletons = (count = 3) =>
    Array.from({ length: count }).map((_, i) => (
      <Card key={i} className="border-border">
        <CardContent className="space-y-3 p-4">
          <div className="flex justify-between items-center">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
          <div className="flex justify-end">
            <Skeleton className="h-8 w-24 rounded-md" />
          </div>
        </CardContent>
      </Card>
    ));

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
            <div className="flex gap-2 items-center justify-end">
              <ModeToggle />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full hover:bg-accent"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {user?.firstName?.[0] || ""}
                        {user?.lastName?.[0] || ""}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.phoneNumber
                          ? `${user.phoneNumber.substring(
                              0,
                              4
                            )} ${user.phoneNumber.substring(
                              4,
                              7
                            )} ${user.phoneNumber.substring(7)}`
                          : ""}
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

        {/* Alerts */}
        {license?.isRejected && (
          <Alert
            variant="destructive"
            className="mb-6 border-red-500 bg-red-500/5"
          >
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>License Rejected</AlertTitle>
            <AlertDescription>
              Your license has been rejected. Please update your license
              information to continue receiving assignments.
              <Button
                variant="outline"
                size="sm"
                className="ml-3 text-red-600 border-red-400 hover:bg-red-50"
                onClick={() => router.push("/account")}
              >
                Update License
              </Button>
            </AlertDescription>
          </Alert>
        )}
        {license && !license?.isVerified && !license.isRejected && (
          <Alert
            variant="default"
            className="mb-6 border-amber-500 bg-amber-500/5"
          >
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertTitle>License Pending Review</AlertTitle>
            <AlertDescription>
              Your license is currently under review. You will be notified once
              verification is complete.
            </AlertDescription>
          </Alert>
        )}

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
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="assigned">Assigned</TabsTrigger>
                <TabsTrigger value="in progress">In Progress</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="space-y-4 mt-4">
                {loading && renderSkeletons(4)}
                {!loading &&(
                  <>
                    <p className="font-bold">
                      Total
                      {activeTab !== "all" && " "}
                      <span className="capitalize"> {activeTab}</span>:{" "}
                      {filteredRequests.length}
                    </p>

                    {filteredRequests.map((r) => (
                      <Card
                        key={r.requestId}
                        className="cursor-pointer hover:bg-accent/50 transition-colors border-border"
                        onClick={() => setSelectedRequest(r)}
                      >
                        <CardContent>
                          <div className="flex flex-col space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Home className="h-4 w-4 text-muted-foreground" />
                                <span className="font-semibold text-card-foreground">
                                  {r.requestId}
                                </span>
                              </div>
                              {getStatusBadge(r.requestStatus.toLowerCase())}
                            </div>

                            <div>
                              <h3 className="font-semibold text-card-foreground">
                                {r.userName}
                              </h3>
                            </div>

                            <div>
                              <p className="text-sm text-card-foreground line-clamp-2">
                                {r.requestDetails}
                              </p>
                            </div>

                            <div className="flex justify-between text-xs text-muted-foreground">
                              <div className="flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                Requested:{" "}
                                {new Date(r.dateCreated).toLocaleDateString()}
                              </div>
                              {r.dateUpdated && (
                                <div className="flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  Assigned:{" "}
                                  {new Date(r.dateUpdated).toLocaleDateString()}
                                </div>
                              )}
                            </div>

                            <div className="flex justify-end">
                              {r.requestStatus.toLowerCase() === "assigned" ? (
                                <Button
                                  disabled={loading}
                                  size="sm"
                                  // onClick={(e) => {
                                  //   e.stopPropagation();
                                  //   handleUpdateStatus(r.requestId);
                                  // }}
                                >
                                  View Request
                                </Button>
                              ) : (
                                <Button
                                  disabled={loading}
                                  size="sm"
                                  variant={
                                    r.requestStatus.toLowerCase() ===
                                    "completed"
                                      ? "outline"
                                      : "default"
                                  }
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedRequest(r);
                                  }}
                                  className={
                                    r.requestStatus.toLowerCase() ===
                                    "completed"
                                      ? ""
                                      : "text-white"
                                  }
                                >
                                  {r.requestStatus.toLowerCase() === "completed"
                                    ? "View Assessment"
                                    : "Make Assessment"}
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </>
                )}
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
                      <div className="col-span-2">
                        <Label className="text-xs text-muted-foreground">
                          Citizen
                        </Label>
                        <p className="font-medium text-card-foreground space-x-2">
                          {selectedRequest.userName}{" "}
                          <span className="p-1 px-3 text-card-foreground/60 bg-gray-200 rounded-full w-fit">
                            {selectedRequest.phoneNumber.substring(0, 4) +
                              " " +
                              selectedRequest.phoneNumber.substring(4, 7) +
                              " " +
                              selectedRequest.phoneNumber.substring(7)}
                          </span>
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
                    <div className="relative ">
                      <div className="w-full h-35 overflow-hidden [mask-image:linear-gradient(to_top,transparent,black)] [--tw-mask-image:linear-gradient(to_top,transparent,black)]">
                        <MapView
                          useMarker={false}
                          className="-mt-75 pointer-events-none"
                          latitude={selectedRequest.latitude?.toString() || ""}
                          longitude={
                            selectedRequest.longitude?.toString() || ""
                          }
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
                  {selectedRequest.requestStatus.toLowerCase() ==
                    "in progress" && (
                    <div className="space-y-3 border-t pt-4">
                      <div className="flex w-full gap-2">
                        <div className="space-y-2 w-1/2">
                          <Label className="text-xs text-muted-foreground">
                            Damage Category
                          </Label>
                          <Select
                            value={damageCategoryId}
                            onValueChange={setDamageCategoryId}
                          >
                            <SelectTrigger className="h-8 text-sm w-full">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">
                                Partially Damaged
                              </SelectItem>
                              <SelectItem value="2">Totally Damaged</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2 w-1/2">
                          <Label className="text-xs text-muted-foreground">
                            House Category
                          </Label>
                          <Select
                            value={houseCategoryId}
                            onValueChange={setHouseCategoryId}
                          >
                            <SelectTrigger className="h-8 text-sm w-full">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">Safe</SelectItem>
                              <SelectItem value="2">
                                Needs Retrofitting
                              </SelectItem>
                              <SelectItem value="3">
                                Requires Rebuilding
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">
                          Assessment Notes
                        </Label>
                        <Textarea
                          placeholder="Enter your structural assessment..."
                          value={assessmentNote}
                          onChange={(e) => setAssessmentNote(e.target.value)}
                          rows={4}
                          className="text-sm min-h-[100px]"
                        />
                      </div>

                      <div className="bg-amber-50 border border-amber-200 rounded p-3">
                        <p className="text-xs text-amber-800">
                          <strong>Note:</strong> Your assessment will be
                          reviewed by LGU officials.
                        </p>
                      </div>
                    </div>
                  )}
                  {evaluations
                    .filter((e) => e.requestId === selectedRequest.requestId)
                    .map((e) => {
                      return (
                        <>

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

                <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-4">
                  {selectedRequest.requestStatus.toLowerCase() !==
                    "completed" && (
                    <>
                      <Button
                        disabled={loading}
                        variant="outline"
                        onClick={() => setSelectedRequest(null)}
                        className="h-9 text-sm w-full sm:w-24"
                      >
                        Cancel
                      </Button>
                      {selectedRequest.requestStatus.toLowerCase() ===
                        "in progress" && (
                        <Button
                          disabled={loading}
                          onClick={async () => await handleCreateEvaluation()}
                          className="h-9 text-sm"
                        >
                          Submit Assessment
                        </Button>
                      )}
                      {selectedRequest.requestStatus.toLowerCase() !==
                        "in progress" && (
                        <Button
                          disabled={loading}
                          onClick={async () =>
                            await handleUpdateStatus(selectedRequest.requestId)
                          }
                          className="h-9 text-sm w-full sm:w-32"
                        >
                          Start Assessment
                        </Button>
                      )}
                    </>
                  )}
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
        {isDesktop ? (
          <Dialog open={openMap} onOpenChange={setOpenMap}>
            <DialogContent className="md:max-w-[47.5rem] space-y-4">
              <DialogHeader>
                <DialogTitle>Select Property Location</DialogTitle>
                <DialogDescription>
                  Click on the map to select your property location or use
                  current location
                </DialogDescription>
              </DialogHeader>
              <MapView
                latitude={selectedRequest?.latitude?.toString() || ""}
                longitude={selectedRequest?.longitude?.toString() || ""}
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
                  Click on the map to select your property location or use
                  current location
                </DrawerDescription>
              </DrawerHeader>
              <MapView
                latitude={selectedRequest?.latitude?.toString() || ""}
                longitude={selectedRequest?.longitude?.toString() || ""}
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
      </div>
    </div>
  );
}
