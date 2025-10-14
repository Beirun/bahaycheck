"use client";

import React, { useState, useEffect, useRef, DragEvent } from "react";
import L, { Map as LeafletMap, Marker, LeafletMouseEvent } from "leaflet";
import { useTheme } from "next-themes";
import {
  MapPin,
  Upload,
  Loader2,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import { useMediaQuery } from "@/hooks/use-media-query";
import Image from "next/image";

interface RequestFormProps {
  userRequestsData: any[];
  userData: any;
  onNewRequest: (request: any) => void;
}

interface FormData {
  requestDetails: string;
  requestStatus: string;
  longitude: string;
  latitude: string;
  requestImage: File | null;
}

declare global {
  interface Window {
    L: typeof L;
  }
}

type MapWithLayer = LeafletMap & { currentTileLayer?: L.TileLayer };

export default function RequestForm({
  userRequestsData,
  userData,
  onNewRequest,
}: RequestFormProps) {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    requestDetails: "",
    requestStatus: "pending",
    longitude: "",
    latitude: "",
    requestImage: null,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [openMap, setOpenMap] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDrawer, setOpenDrawer] = useState(false);

  const isDesktop = useMediaQuery("(min-width: 768px)");
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<MapWithLayer | null>(null);
  const markerRef = useRef<Marker | null>(null);

  useEffect(() => {
    if (!openMap || mapInstanceRef.current) return;

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js";
    script.onload = () => {
      if (mapRef.current && window.L) {
        const map: MapWithLayer = L.map(mapRef.current, {
          attributionControl: false,
        }).setView([11.132592, 123.983116], 13);
        const tiles =
          theme === "dark"
            ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
        const tileLayer = L.tileLayer(tiles, { subdomains: "abcd" }).addTo(map);
        map.currentTileLayer = tileLayer;

        map.on("click", (e: LeafletMouseEvent) => {
          const { lat, lng } = e.latlng;
          setFormData((prev) => ({
            ...prev,
            latitude: lat.toFixed(6),
            longitude: lng.toFixed(6),
          }));
          if (markerRef.current) markerRef.current.setLatLng([lat, lng]);
          else markerRef.current = L.marker([lat, lng]).addTo(map);
        });

        mapInstanceRef.current = map;
      }
    };
    document.body.appendChild(script);
  }, [openMap, theme]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    if (map.currentTileLayer) map.removeLayer(map.currentTileLayer);

    const tiles =
      theme === "dark"
        ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
    map.currentTileLayer = L.tileLayer(tiles, { subdomains: "abcd" }).addTo(
      map
    );
  }, [theme]);

  const getCurrentLocation = () => {
    setLocationLoading(true);
    if (!navigator.geolocation) {
      setLocationLoading(false);
      toast.error("Geolocation not supported");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setFormData((prev) => ({
          ...prev,
          latitude: latitude.toFixed(6),
          longitude: longitude.toFixed(6),
        }));
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([latitude, longitude], 16);
          if (markerRef.current)
            markerRef.current.setLatLng([latitude, longitude]);
          else
            markerRef.current = L.marker([latitude, longitude]).addTo(
              mapInstanceRef.current
            );
        }
        setLocationLoading(false);
        toast.success("Location acquired successfully");
      },
      (err) => {
        setLocationLoading(false);
        toast.error("Unable to get location: " + err.message);
      }
    );
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file || !file.type.startsWith("image/")) return;
    setFormData((prev) => ({ ...prev, requestImage: file }));
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => e.preventDefault();

  const resetForm = () => {
    setFormData({
      requestDetails: "",
      requestStatus: "pending",
      latitude: "",
      longitude: "",
      requestImage: null,
    });
    setImagePreview(null);
    markerRef.current?.remove();
    markerRef.current = null;
  };

  const handleSubmit = async () => {
    if (!formData.requestImage || !formData.latitude || !formData.longitude) {
      toast.error("Please complete all required fields");
      return;
    }

    setLoading(true);
    try {
      const dataToSend = new FormData();
      dataToSend.append("requestImage", formData.requestImage);
      dataToSend.append("requestDetails", formData.requestDetails);
      dataToSend.append("requestStatus", formData.requestStatus);
      dataToSend.append("longitude", formData.longitude);
      dataToSend.append("latitude", formData.latitude);

      const res = await fetch("/api/request", {
        method: "POST",
        body: dataToSend,
      });
      const data = await res.json();

      if (res.ok) {
        toast.success("Request created successfully!");

        // Create new request object
        const newRequest = {
          requestId: userRequestsData.length + 1,
          userId: userData.userId,
          requestImage: URL.createObjectURL(formData.requestImage),
          requestDetails: formData.requestDetails,
          requestStatus: "pending",
          longitude: parseFloat(formData.longitude),
          latitude: parseFloat(formData.latitude),
          volunteerId: null,
          dateCreated: new Date(),
          dateUpdated: null,
          dateDeleted: null,
        };

        // Call parent handler
        onNewRequest(newRequest);

        // Reset form and close modal
        resetForm();
        setOpenDialog(false);
        setOpenDrawer(false);
      } else {
        toast.error(data.error || "Failed to create request");
      }
    } catch {
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: any = {
      pending: { label: "Pending", variant: "secondary", icon: Clock },
      "in-progress": {
        label: "In Progress",
        variant: "default",
        icon: Loader2,
      },
      completed: {
        label: "Completed",
        variant: "destructive",
        icon: CheckCircle,
      },
      cancelled: { label: "Cancelled", variant: "outline", icon: AlertCircle },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const IconComponent = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <IconComponent className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  // Request Form Content Component
  const RequestFormContent = () => (
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
          id="details"
          placeholder="Describe your property, any visible damages, structural concerns, and specific areas you're worried about..."
          value={formData.requestDetails}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, requestDetails: e.target.value }))
          }
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

  // Request Form Footer Component
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

  return (
    <div className="min-h-[calc(100vh-4rem)] w-screen bg-background p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Completed Requests History */}
        {userRequestsData.filter((req) => req.requestStatus === "completed")
          .length > 0 && (
          <>
            {/* Conditional rendering based on screen size */}
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
                  <RequestFormContent />
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
                  <DrawerHeader className="text-left">
                    <DrawerTitle>
                      Create New Safety Evaluation Request
                    </DrawerTitle>
                    <DrawerDescription>
                      Upload image, add details, and select location for your
                      property assessment
                    </DrawerDescription>
                  </DrawerHeader>
                  <div className="px-4 overflow-y-auto">
                    <RequestFormContent />
                  </div>
                  <DrawerFooter className="pt-4 mb-4">
                    <RequestFormFooter />
                  </DrawerFooter>
                </DrawerContent>
              </Drawer>
            )}
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      Previous Completed Requests
                    </CardTitle>
                    <CardDescription>
                      Your previous safety evaluation requests
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {userRequestsData
                    .filter((req) => req.requestStatus === "completed")
                    .map((request) => (
                      <div
                        key={request.requestId}
                        className="p-3 bg-muted rounded-lg"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">
                              Request #{request.requestId}
                            </p>
                            <p className="text-sm text-muted-foreground line-clamp-5">
                              {request.requestDetails}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Completed on{" "}
                              {new Date(
                                request.dateUpdated!
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Show the create request card if no completed requests exist */}
        {userRequestsData.filter((req) => req.requestStatus === "completed")
          .length === 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Create New Safety Evaluation Request</CardTitle>
              <CardDescription>
                Upload image, add details, and select location for your property
                assessment
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col space-y-6">
              <RequestFormContent />
              <RequestFormFooter />
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={openMap} onOpenChange={setOpenMap}>
        <DialogContent className="md:max-w-[47.5rem] space-y-4">
          <DialogHeader>
            <DialogTitle>Select Property Location</DialogTitle>
            <DialogDescription>
              Click on the map to select your property location or use current
              location
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 relative">
            <Button
              type="button"
              onClick={getCurrentLocation}
              disabled={locationLoading}
              size="lg"
              className="absolute z-1000 bottom-0 left-[50%] -translate-x-1/2"
            >
              {locationLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Getting Location...
                </>
              ) : (
                <>
                  <MapPin className="mr-2 h-4 w-4" />
                  Use Current Location
                </>
              )}
            </Button>
            <div
              ref={mapRef}
              className="h-[600px] rounded-lg border shadow-sm"
            ></div>
          </div>
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
    </div>
  );
}
