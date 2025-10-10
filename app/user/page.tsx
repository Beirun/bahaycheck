"use client";

import React, { useState, useEffect, useRef, DragEvent } from "react";
import L, { Map as LeafletMap, Marker, LeafletMouseEvent } from "leaflet";
import { useTheme } from "next-themes";
import { MapPin, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "@/components/ui/dialog";
import Image from "next/image";

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

export default function UserPage() {
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

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<MapWithLayer | null>(null);
  const markerRef = useRef<Marker | null>(null);

  useEffect(() => {
    if (!openMap || mapInstanceRef.current) return;

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js";
    script.onload = () => {
      if (mapRef.current && window.L) {
        const map: MapWithLayer = L.map(mapRef.current, { attributionControl: false }).setView(
          [11.132592, 123.983116],
          13
        );
        const tiles =
          theme === "dark"
            ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
        const tileLayer = L.tileLayer(tiles, { subdomains: "abcd" }).addTo(map);
        map.currentTileLayer = tileLayer;

        map.on("click", (e: LeafletMouseEvent) => {
          const { lat, lng } = e.latlng;
          setFormData((prev) => ({ ...prev, latitude: lat.toFixed(6), longitude: lng.toFixed(6) }));
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
    map.currentTileLayer = L.tileLayer(tiles, { subdomains: "abcd" }).addTo(map);
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
          if (markerRef.current) markerRef.current.setLatLng([latitude, longitude]);
          else markerRef.current = L.marker([latitude, longitude]).addTo(mapInstanceRef.current);
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

      const res = await fetch("/api/request", { method: "POST", body: dataToSend });
      const data = await res.json();

      if (res.ok) {
        toast.success("Request created successfully!");
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
      } else toast.error(data.error || "Failed to create request");
    } catch {
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-background p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Create Request</CardTitle>
            <CardDescription>Upload image, add details, and select location</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col space-y-6">
            <div>
              <Label htmlFor="image">Request Image *</Label>
              <div
                className="mt-2 w-full h-80 border-dashed border-2 border-gray-400 rounded-lg flex items-center justify-center cursor-pointer relative overflow-hidden"
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
                  <span className="text-gray-500">Drag & drop an image or click to select</span>
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
              <Label htmlFor="details">Request Details</Label>
              <Textarea
                id="details"
                placeholder="Describe your request..."
                value={formData.requestDetails}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, requestDetails: e.target.value }))
                }
                className="mt-2 min-h-[200px]"
              />
            </div>
            <div className="space-y-2">
              <Label>Location *</Label>
              <Button type="button" variant="outline" onClick={() => setOpenMap(true)} className="w-full">
                <MapPin className="mr-2 h-4 w-4" />
                {formData.latitude && formData.longitude
                  ? `Selected: ${formData.latitude}, ${formData.longitude}`
                  : "Select Location"}
              </Button>
            </div>
            <Button type="button" onClick={handleSubmit} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Submit Request
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Dialog open={openMap} onOpenChange={setOpenMap}>
        <DialogContent className="md:max-w-[47.5rem] space-y-4">
          <DialogHeader>
            <DialogTitle>Select Location</DialogTitle>
            <DialogDescription>Click on the map or use current location</DialogDescription>
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
            <div ref={mapRef} className="h-[600px] rounded-lg border shadow-sm"></div>
          </div>
          <DialogFooter>
            <Button size="lg" className="w-full" onClick={() => setOpenMap(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
