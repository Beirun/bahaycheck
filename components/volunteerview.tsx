"use client";

import { Card, CardContent } from "@/components/ui/card";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Eye, PackageOpen } from "lucide-react";
import { User } from "@/models/user";
import { License } from "@/models/license";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";

interface VolunteerViewProps {
  licenses: License[];
  volunteers: User[];
  onViewVolunteer: (volunteer: User) => void;
}

export default function VolunteerView({
  licenses,
  volunteers,
  onViewVolunteer,
}: VolunteerViewProps) {
  const currentVolunteers = volunteers
    .map((l) => {
      const volunteer = licenses.find((v) => l.userId === v.userId);
      return {
        ...volunteer,
        ...l,
        isVerified: volunteer?.isVerified,
      };
    })
    .filter((c) => c.roleId !== 3 && c.isRejected === false && !c.isVerified);

  const getStatusBadge = (isVerified: boolean) => {
    const status = isVerified ? "Approved" : "Pending";
    const variants: Record<string, string> = {
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

  if (currentVolunteers.length === 0) {
    return (
      <Empty className="border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <PackageOpen />
          </EmptyMedia>
          <EmptyTitle>No Volunteers In This Section</EmptyTitle>
          <EmptyDescription>
            There are currently no pending volunteers that need license verification.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden lg:block">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-card-foreground whitespace-nowrap">
                  Volunteer
                </TableHead>
                <TableHead className="text-card-foreground whitespace-nowrap">
                  Contact
                </TableHead>
                <TableHead className="text-card-foreground whitespace-nowrap">
                  Specialization
                </TableHead>
                <TableHead className="text-card-foreground whitespace-nowrap">
                  Status
                </TableHead>
                <TableHead className="text-card-foreground whitespace-nowrap">
                  Date Applied
                </TableHead>
                <TableHead className="text-card-foreground whitespace-nowrap">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentVolunteers.map((volunteer) => (
                <TableRow
                  key={volunteer.userId}
                  className="hover:bg-accent/50 transition-colors"
                  onClick={() =>
                    onViewVolunteer(
                      volunteers.find((v) => volunteer.userId === v.userId)!
                    )
                  }
                >
                  <TableCell className="whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {(volunteer.firstName ?? "U")[0]}
                          {(volunteer.lastName ?? "")[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-card-foreground">
                          {volunteer.firstName} {volunteer.lastName}
                        </div>
                        <div className="text-sm text-muted-foreground truncate max-w-[150px]">
                          {volunteer.phoneNumber}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-card-foreground whitespace-nowrap">
                    {volunteer.phoneNumber}
                  </TableCell>
                  <TableCell className="text-card-foreground whitespace-nowrap">
                    {volunteer.specialization}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {getStatusBadge(volunteer.isVerified!)}
                  </TableCell>
                  <TableCell className="text-card-foreground whitespace-nowrap">
                    {new Date(volunteer.dateCreated!).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <Button variant="outline" size="sm">
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
        {currentVolunteers.map((volunteer) => (
          <Card
            key={volunteer.userId}
            className="cursor-pointer hover:bg-accent/50 transition-colors border-border"
            onClick={() =>
              onViewVolunteer(
                volunteers.find((v) => volunteer.userId === v.userId)!
              )
            }
          >
            <CardContent>
              <div className="flex h-full gap-4 items-center">
                <Avatar className="h-10 w-10 flex-shrink-0">
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    {(volunteer.firstName ?? "U")[0]}
                    {(volunteer.lastName ?? "")[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col w-full">
                  <div className="w-full flex items-start space-x-3 mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="flex items-center gap-1 font-semibold text-card-foreground text-sm truncate">
                          {volunteer.firstName} {volunteer.lastName}
                          <p className="text-muted-foreground text-xs">
                            ({volunteer.specialization})
                          </p>
                        </h3>
                        {getStatusBadge(volunteer.isVerified!)}
                      </div>
                    </div>
                  </div>

                  <div className="w-full mt-auto grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="text-card-foreground truncate">
                        {volunteer.phoneNumber}
                      </p>
                    </div>
                    <div className="flex flex-col items-end">
                      <p className="text-card-foreground">
                        {new Date(volunteer.dateCreated!).toLocaleDateString()}
                      </p>
                    </div>
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
