"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import VolunteerView from "./volunteerview";

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

interface VolunteersTabProps {
  volunteers: VolunteerApplication[];
  pendingVolunteers: VolunteerApplication[];
  approvedVolunteers: VolunteerApplication[];
  onViewVolunteer: (volunteer: VolunteerApplication) => void;
}

export default function VolunteersTab({ 
  volunteers, 
  pendingVolunteers, 
  approvedVolunteers, 
  onViewVolunteer 
}: VolunteersTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-card-foreground">Volunteer Management</CardTitle>
        <CardDescription>
          Verify and manage volunteer structural engineers
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="all">All Volunteers</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-6">
            <VolunteerView 
              volunteers={volunteers} 
              onViewVolunteer={onViewVolunteer} 
            />
          </TabsContent>
          
          <TabsContent value="pending" className="mt-6">
            <VolunteerView 
              volunteers={pendingVolunteers} 
              onViewVolunteer={onViewVolunteer} 
            />
          </TabsContent>
          
          <TabsContent value="approved" className="mt-6">
            <VolunteerView 
              volunteers={approvedVolunteers} 
              onViewVolunteer={onViewVolunteer} 
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}