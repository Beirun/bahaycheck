"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Eye } from "lucide-react";

// Types
type VolunteerStatus = "pending" | "approved" | "rejected";

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

interface VolunteerViewProps {
  volunteers: VolunteerApplication[];
  onViewVolunteer: (volunteer: VolunteerApplication) => void;
}

export default function VolunteerView({ volunteers, onViewVolunteer }: VolunteerViewProps) {
  const getStatusBadge = (status: VolunteerStatus) => {
    const variants: Record<VolunteerStatus, string> = {
      pending: "bg-chart-4/20 text-chart-4 border-chart-4/30",
      approved: "bg-chart-2/20 text-chart-2 border-chart-2/30",
      rejected: "bg-destructive/20 text-destructive border-destructive/30"
    };
    return <Badge variant="outline" className={variants[status]}>{status}</Badge>;
  };

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden lg:block">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-card-foreground whitespace-nowrap">Volunteer</TableHead>
                <TableHead className="text-card-foreground whitespace-nowrap">Contact</TableHead>
                <TableHead className="text-card-foreground whitespace-nowrap">Specialization</TableHead>
                <TableHead className="text-card-foreground whitespace-nowrap">License</TableHead>
                <TableHead className="text-card-foreground whitespace-nowrap">Status</TableHead>
                <TableHead className="text-card-foreground whitespace-nowrap">Date Applied</TableHead>
                <TableHead className="text-card-foreground whitespace-nowrap">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {volunteers.map((volunteer) => (
                <TableRow key={volunteer.id} className="hover:bg-accent/50 transition-colors" onClick={() => onViewVolunteer(volunteer)}>
                  <TableCell className="whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {volunteer.firstName[0]}{volunteer.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-card-foreground">
                          {volunteer.firstName} {volunteer.lastName}
                        </div>
                        <div className="text-sm text-muted-foreground truncate max-w-[150px]">
                          {volunteer.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-card-foreground whitespace-nowrap">{volunteer.phone}</TableCell>
                  <TableCell className="text-card-foreground whitespace-nowrap">{volunteer.specialization}</TableCell>
                  <TableCell className="font-mono text-sm text-card-foreground whitespace-nowrap">{volunteer.licenseNumber}</TableCell>
                  <TableCell className="whitespace-nowrap">{getStatusBadge(volunteer.status)}</TableCell>
                  <TableCell className="text-card-foreground whitespace-nowrap">{new Date(volunteer.dateApplied).toLocaleDateString()}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    <Button
                      variant="outline"
                      size="sm"
                      
                    >
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
        {volunteers.map((volunteer) => (
          <Card 
  key={volunteer.id} 
  className="cursor-pointer hover:bg-accent/50 transition-colors border-border"
  onClick={() => onViewVolunteer(volunteer)}
>
  <CardContent>
    <div className="flex flex-col h-full">
      {/* Top Section: Avatar and Name */}
      <div className="flex items-start space-x-3 mb-4">
        <Avatar className="h-10 w-10 flex-shrink-0">
          <AvatarFallback className="bg-primary text-primary-foreground text-sm">
            {volunteer.firstName[0]}{volunteer.lastName[0]}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-card-foreground text-sm truncate">
              {volunteer.firstName} {volunteer.lastName}
            </h3>
            {getStatusBadge(volunteer.status)}
          </div>
          <p className="text-muted-foreground text-xs mt-1">
            {volunteer.specialization}
          </p>
        </div>
      </div>

      {/* Middle Section: License Info */}
      <div className="mb-4">
        <p className="text-xs text-muted-foreground mb-1">License Number</p>
        <p className="font-mono text-xs text-card-foreground bg-muted px-2 py-1 rounded">
          {volunteer.licenseNumber}
        </p>
      </div>

      {/* Bottom Section: Contact and Date - Aligned horizontally */}
      <div className="mt-auto grid grid-cols-2 gap-4 text-xs">
        <div>
          <p className="text-muted-foreground mb-1">Contact</p>
          <p className="text-card-foreground truncate">{volunteer.phone}</p>
        </div>
        <div>
          <p className="text-muted-foreground mb-1">Date Applied</p>
          <p className="text-card-foreground">
            {new Date(volunteer.dateApplied).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  </CardContent>
</Card>
        ))}
      </div>
    </>
  );
}