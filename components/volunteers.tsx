"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import VolunteerView from "./volunteerview";
import { Evaluation } from "@/models/evaluation";
import { User } from "@/models/user";
import { License } from "@/models/license";
import { Request } from "@/models/request";


interface VolunteersTabProps {
  licenses: License[];
  volunteers: User[];
  pendingVolunteers: User[];
  approvedVolunteers: User[];
  onViewVolunteer: (volunteer: User) => void;
}

export default function VolunteersTab({ 
  licenses,
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
              licenses={licenses}
              onViewVolunteer={onViewVolunteer} 
            />
          </TabsContent>
          
          <TabsContent value="pending" className="mt-6">
            <VolunteerView 
              licenses={licenses}
              volunteers={pendingVolunteers} 
              onViewVolunteer={onViewVolunteer} 
            />
          </TabsContent>
          
          <TabsContent value="approved" className="mt-6">
            <VolunteerView 
              licenses={licenses}
              volunteers={approvedVolunteers} 
              onViewVolunteer={onViewVolunteer} 
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}