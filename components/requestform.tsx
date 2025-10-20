"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "./ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Plus, Loader2, MapPin, Upload } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useUserStore } from "@/stores/useUserStore";
import Map from "./nossr/map";
import { Request } from "@/models/request";
interface RequestFormProps {
  userRequestsData: Request[];
  setSelectedRequest: (r: Request) => void;
}

interface FormData {
  requestDetails: string;
  requestStatusId: number;
  longitude: string;
  latitude: string;
  requestImage: File | null;
}

export default function RequestForm({ userRequestsData, setSelectedRequest }: RequestFormProps) {
  const [formData, setFormData] = useState<FormData>({
    requestDetails: "",
    requestStatusId: 1,
    longitude: "",
    latitude: "",
    requestImage: null,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [openMap, setOpenMap] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDrawer, setOpenDrawer] = useState(false);

  const { createRequest, loading } = useUserStore();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file || !file.type.startsWith("image/")) return;
    setFormData((prev) => ({ ...prev, requestImage: file }));
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) =>
    e.preventDefault();

  const resetForm = () => {
    setFormData({
      requestDetails: "",
      requestStatusId: 1,
      latitude: "",
      longitude: "",
      requestImage: null,
    });
    setImagePreview(null);
    setOpenDialog(false);
  };

  const handleSubmit = async () => {
    if (!formData.requestImage || !formData.latitude || !formData.longitude) {
      toast.error("Please complete all required fields");
      return;
    }
    const dataToSend = new FormData();
    dataToSend.append("requestImage", formData.requestImage);
    dataToSend.append("requestDetails", formData.requestDetails);
    dataToSend.append("requestStatusId", formData.requestStatusId.toString());
    dataToSend.append("longitude", formData.longitude);
    dataToSend.append("latitude", formData.latitude);

    const res = await createRequest(dataToSend);
    if (res) resetForm();
  };

  const RequestFormFooter = () => (
    <Button
      type="button"
      onClick={handleSubmit}
      disabled={loading}
      className="w-full text-white h-12"
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Submitting Request...
        </>
      ) : (
        <>
          <Upload className="mr-2 h-4 w-4" />
          Submit Safety Evaluation Request
        </>
      )}
    </Button>
  );

  const renderRequestForm = () => (
    <div className="space-y-6">
      <div>
        <Label htmlFor="image">Property Image *</Label>
        <div
          className="mt-2 w-full h-64 border-dashed border-2 border-gray-400 rounded-lg flex items-center justify-center cursor-pointer relative overflow-hidden"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => document.getElementById("image")?.click()}
        >
          {imagePreview ? (
            <Image
              src={imagePreview}
              alt="Preview"
              fill
              style={{ objectFit: "contain" }}
              className="rounded-lg"
            />
          ) : (
            <span className="text-gray-500 text-sm text-center px-4">
              Drag & drop an image or click to select
            </span>
          )}
        </div>
        <Input
          id="image"
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file || !file.type.startsWith("image/")) return;
            setFormData((prev) => ({ ...prev, requestImage: file }));
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result as string);
            reader.readAsDataURL(file);
          }}
          className="hidden"
        />
      </div>
      <div>
        <Label htmlFor="details">Property Details & Concerns *</Label>
        <Textarea
          value={formData.requestDetails}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, requestDetails: e.target.value }))
          }
          id="details"
          placeholder="Describe your property..."
          className="mt-2 min-h-[100px]"
          required
        />
      </div>
      <div className="space-y-2">
        <Label>Property Location *</Label>
        <Button
          type="button"
          variant="outline"
          onClick={() => setOpenMap(true)}
          className="w-full"
        >
          <MapPin className="mr-2 h-4 w-4" />
          {formData.latitude && formData.longitude
            ? `Selected: ${formData.latitude}, ${formData.longitude}`
            : "Select Location on Map"}
        </Button>
        <p className="text-xs text-muted-foreground">
          Click to select your property location on the map
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-[calc(100vh-4rem)] w-screen bg-background p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Conditional: Completed Requests */}
        {userRequestsData.filter((req) => req.requestStatus.toLowerCase() === "completed")
          .length > 0 && (
          <>
            {isDesktop ? (
              <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                <DialogTrigger asChild>
                  <Button className="w-full h-12 flex items-center gap-2 mb-6">
                    <Plus className="h-4 w-4" />
                    New Request
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      Create New Safety Evaluation Request
                    </DialogTitle>
                    <DialogDescription>
                      Upload image, add details, and select location for your
                      property assessment
                    </DialogDescription>
                  </DialogHeader>
                  {renderRequestForm()}
                  <DialogFooter>
                    <RequestFormFooter />
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            ) : (
              <Drawer open={openDrawer} onOpenChange={setOpenDrawer}>
                <DrawerTrigger asChild>
                  <Button className="w-full h-12 flex items-center gap-2 mb-6">
                    <Plus className="h-4 w-4" />
                    New Request
                  </Button>
                </DrawerTrigger>
                <DrawerContent className="h-[95dvh] max-h-[95dvh] min-h-[55dvh]">
                  <DrawerHeader>
                    <DrawerTitle>
                      Create New Safety Evaluation Request
                    </DrawerTitle>
                    <DrawerDescription>
                      Upload image, add details, and select location for your
                      property assessment
                    </DrawerDescription>
                  </DrawerHeader>
                  <div className="px-4 overflow-y-auto">
                    {renderRequestForm()}
                  </div>
                  <DrawerFooter className="pt-4 mb-4">
                    <RequestFormFooter />
                  </DrawerFooter>
                </DrawerContent>
              </Drawer>
            )}

            {/* Previous Completed Requests */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">
                  Previous Completed Requests
                </CardTitle>
                <CardDescription>
                  Your previous safety evaluation requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {userRequestsData
                    .filter((req) => req.requestStatus.toLowerCase() === "completed")
                    .map((request) => (
                      <div
                        onClick={() => setSelectedRequest(request)}
                        key={request.requestId}
                        className="p-3 bg-muted rounded-lg cursor-pointer hover:brightness-95 transition-all duration-300 active:brightness-90"
                      >
                        <p className="font-medium">
                          Request #{request.requestId}
                        </p>
                        <p className="text-sm text-muted-foreground line-clamp-5">
                          {request.requestDetails}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Completed on{" "}
                          {new Date(request.dateUpdated!).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {loading && (
          <>
          <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">
          <Skeleton className="h-5 w-48" />
        </CardTitle>
        <CardDescription>
          <Skeleton className="h-4 w-72 mt-1" />
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="p-3 bg-muted rounded-lg space-y-2"
            >
              <Skeleton className="h-4 w-32" /> {/* Request ID */}
              <Skeleton className="h-3 w-full" /> {/* Request details line 1 */}
              <Skeleton className="h-3 w-5/6" /> {/* Request details line 2 */}
              <Skeleton className="h-3 w-1/3 mt-2" /> {/* Completed date */}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
          </>
        )}
        {/* No Completed Requests */}
        {userRequestsData.filter((req) => req.requestStatus.toLowerCase() === "completed")
          .length === 0 && !loading && (
          <Card>
            <CardHeader>
              <CardTitle>Create New Safety Evaluation Request</CardTitle>
              <CardDescription>
                Upload image, add details, and select location for your property
                assessment
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col space-y-6">
              {renderRequestForm()}
              <RequestFormFooter />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Map Dialog */}
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
            <Map
              latitude={formData.latitude}
              longitude={formData.longitude}
              onChange={(lat, lng) =>
                setFormData((prev) => ({
                  ...prev,
                  latitude: lat,
                  longitude: lng,
                }))
              }
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
            <Map
              latitude={formData.latitude}
              longitude={formData.longitude}
              onChange={(lat, lng) =>
                setFormData((prev) => ({
                  ...prev,
                  latitude: lat,
                  longitude: lng,
                }))
              }
            />{" "}
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
  );
}
