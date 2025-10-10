"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search, Filter, Eye, MapPin } from "lucide-react";

// Types
type RequestStatus = "pending" | "in-progress" | "completed" | "cancelled";

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

interface RequestsTabProps {
  filteredRequests: SafetyRequest[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onViewRequest: (request: SafetyRequest) => void;
}

export default function RequestsTab({
  filteredRequests,
  searchTerm,
  setSearchTerm,
  onViewRequest,
}: RequestsTabProps) {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-card-foreground">
          Safety Evaluation Requests
        </CardTitle>
        <CardDescription>
          Manage all house evaluation requests from citizens
        </CardDescription>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search requests..."
              className="pl-10 bg-background w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" className="sm:w-auto">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Desktop Table View */}
        <div className="hidden lg:block">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-card-foreground whitespace-nowrap">
                    Request ID
                  </TableHead>
                  <TableHead className="text-card-foreground whitespace-nowrap">
                    Citizen
                  </TableHead>
                  <TableHead className="text-card-foreground whitespace-nowrap">
                    Location
                  </TableHead>
                  <TableHead className="text-card-foreground whitespace-nowrap">
                    Status
                  </TableHead>
                  <TableHead className="text-card-foreground whitespace-nowrap">
                    Date
                  </TableHead>
                  <TableHead className="text-card-foreground whitespace-nowrap">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow
                    key={request.id}
                    className="cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => onViewRequest(request)}
                  >
                    <TableCell className="w-1/6 font-medium text-card-foreground whitespace-nowrap">
                      {request.id}
                    </TableCell>
                    <TableCell className="w-1/6 text-card-foreground whitespace-nowrap">
                      {request.citizenName}
                    </TableCell>
                    <TableCell className="w-1/4 whitespace-nowrap">
                      <div className="flex items-center text-card-foreground">
                        <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                        <span className="truncate">
                          {request.barangay}, {request.sitio}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="w-1/6 whitespace-nowrap">
                      {getStatusBadge(request.status)}
                    </TableCell>
                    <TableCell className="w-1/6 text-card-foreground whitespace-nowrap">
                      {new Date(request.dateRequested).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="w-1/6 whitespace-nowrap">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden space-y-4">
          {filteredRequests.map((request) => (
            <Card
              key={request.id}
              className="cursor-pointer hover:bg-accent/50 transition-colors border-border group"
              onClick={() => onViewRequest(request)}
            >
              <CardContent>
                <div className="flex items-start justify-between ">
                  {/* Left Section - Main Content */}
                  <div className="flex-1 min-w-0">
                    {/* Header Row */}
                    <div className="flex items-center gap-2 mb-3">
                      <div
                        className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          request.status === "pending"
                            ? "bg-chart-4"
                            : request.status === "in-progress"
                            ? "bg-chart-3"
                            : "bg-chart-2"
                        }`}
                      />
                      <h3 className="font-semibold text-card-foreground truncate text-sm">
                        {request.barangay}, {request.sitio}
                      </h3>
                      <div className="flex-shrink-0 ml-auto">
                        {getStatusBadge(request.status)}
                      </div>
                    </div>

                    {/* Details - Location first, then aligned row */}
                    <div className="space-y-2 text-sm">
                      {/* First Row: Location */}
                      <div className="space-x-1 flex items-center">
                        <p className="text-xs text-muted-foreground font-medium">
                          Name:
                        </p>
                        <div className="flex items-center text-card-foreground">
                          {/* <MapPin className="h-3 w-3 mr-1.5 flex-shrink-0 text-muted-foreground" /> */}
                          <span className="truncate text-md">
                            {request.citizenName}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0 text-right">
                          <p className="text-xs text-muted-foreground font-medium">
                            Date & Time
                          </p>
                          <p className="text-card-foreground text-xs">
                            {new Date(request.dateRequested).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                              }
                            )}
                            <span className="text-muted-foreground ml-1">
                              {new Date(
                                request.dateRequested
                              ).toLocaleTimeString("en-US", {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: false,
                              })}
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Second Row: Request ID and Date aligned */}
                      {/* <div className="flex justify-between items-center gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground font-medium">
                Request ID
              </p>
              <p className="font-medium text-card-foreground truncate text-xs">
                {request.id}
              </p>
            </div>
            
            
          </div> */}
                    </div>
                  </div>

                  {/* Right Section - Action Button */}
                  {/* <div className="flex-shrink-0">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            onViewRequest(request);
          }}
        >
          <Eye className="h-3.5 w-3.5 text-muted-foreground" />
        </Button>
      </div> */}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
