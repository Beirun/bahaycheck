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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Settings, LogOut, User, Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import { ModeToggle } from "@/components/theme-toggle";

// Mock current user data
const currentUser = {
  userId: 1,
  roleId: 2, // Assuming 2 is for regular users
  firstName: "Maria",
  lastName: "Santos",
  phoneNumber: "09123456789",
  passwordHash: "hashed_password",
  isVerified: true,
  dateCreated: new Date("2024-01-01"),
  dateUpdated: null,
  dateDeleted: null,
};

// Mock requests for the current user
const userRequests = [
  {
    requestId: 1,
    userId: 1,
    requestImage: "/images/house1.jpg",
    requestDetails:
      "Two-story concrete house with visible cracks on the foundation and leaning walls. Need structural assessment for safety.",
    requestStatus: "completed", // Active request - will prevent new request
    longitude: 125.1234,
    latitude: 11.2345,
    volunteerId: null,
    dateCreated: new Date("2024-01-15"),
    dateUpdated: null,
    dateDeleted: null,
  },
  {
    requestId: 2,
    userId: 1,
    requestImage: "/images/house2.jpg",
    requestDetails:
      "Single-story wooden house with termite damage and weak roof structure",
    requestStatus: "completed", // Completed request - won't prevent new request
    longitude: 125.1245,
    latitude: 11.2356,
    volunteerId: 3,
    dateCreated: new Date("2024-01-10"),
    dateUpdated: new Date("2024-01-12"),
    dateDeleted: null,
  },
];

export default function UserPage() {
  const router = useRouter();
  const [userData, setUserData] = useState(currentUser);
  const [userRequestsData, setUserRequestsData] = useState(userRequests);
  const [hasActiveRequest, setHasActiveRequest] = useState(false);
  const [activeRequest, setActiveRequest] = useState<any>(null);

  // Check if user has any active (non-completed) requests
  useEffect(() => {
    const activeRequests = userRequestsData.filter(
      (request) =>
        request.requestStatus !== "completed" &&
        request.requestStatus !== "cancelled"
    );

    if (activeRequests.length > 0) {
      setHasActiveRequest(true);
      setActiveRequest(activeRequests[0]); // Take the first active request
    } else {
      setHasActiveRequest(false);
      setActiveRequest(null);
    }
  }, [userRequestsData]);

  // Function to handle new request submission
  const handleNewRequest = (newRequest: any) => {
    setUserRequestsData((prev) => [newRequest, ...prev]);
  };

  // Handle account settings navigation
  const handleAccountSettings = () => {
    router.push("/account");
  };

  // Handle logout
  const handleLogout = () => {
    // In a real app, this would clear tokens and redirect to login
    console.log("Logging out...");
    router.push("/signin");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Settings Dropdown */}
      <div className="border-b px-5 w-screen">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center h-16">
            {/* Left side - Title */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-card-foreground">
                Safety Evaluation
              </h1>
              <p className="text-sm text-muted-foreground">
                {hasActiveRequest ? "Request Status" : "Create New Request"}
              </p>
            </div>

            {/* Right side - Settings Dropdown */}
            <div className="flex items-center justify-end flex-1">
              <ModeToggle />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full hover:bg-accent"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {userData.firstName[0]}
                        {userData.lastName[0]}
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
                        {userData.firstName} {userData.lastName}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {userData.phoneNumber}
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
            activeRequest={activeRequest}
            userRequestsData={userRequestsData}
            userData={userData}
          />
        ) : (
          /* If no active request, show the request form */
          <RequestForm
            userRequestsData={userRequestsData}
            userData={userData}
            onNewRequest={handleNewRequest}
          />
        )}
      </div>
    </div>
  );
}
