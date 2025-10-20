"use client";

import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "@/components/ui/button";
import { Loader2, MapPin } from "lucide-react";
import { toast } from "sonner";

interface Props {
  latitude: string;
  longitude: string;
  onChange: (lat: string, lng: string) => void;
}

const DEFAULT_POSITION: [number, number] = [11.132592, 123.983116];

// Create a Lucide MapPin SVG marker as a data URL
const lucideMarker = new L.Icon({
  iconUrl:
    "data:image/svg+xml;charset=utf-8," +
    encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="75" height="75" fill="oklch(0.623 0.214 259.815)" stroke="white" stroke-width="1.5" viewBox="0 0 24 24">
        <path d="M12 21s-6-5.686-6-10a6 6 0 1 1 12 0c0 4.314-6 10-6 10Z"/>
        <circle cx="12" cy="11" r="2.5"/>
      </svg>
    `),
  iconSize: [75, 75],
  iconAnchor: [37.5, 75], // center x, bottom y
  popupAnchor: [0, -75],
});


export const Map: React.FC<Props> = ({
  latitude,
  longitude,
  onChange,
}) => {
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [position, setPosition] = useState<[number, number] | null>(
    latitude && longitude ? [parseFloat(latitude), parseFloat(longitude)] : null
  );

  const MapEventsHandler = () => {
    const map = useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setPosition([lat, lng]);
        onChange(lat.toFixed(6), lng.toFixed(6));
      },
    });

    useEffect(() => {
      if (position) map.panTo(position);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [position, map]);
    return null;
  };

  const handleCurrentLocation = () => {
    setLoadingLocation(true);
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
      setLoadingLocation(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        onChange(lat.toFixed(6), lng.toFixed(6));
        setLoadingLocation(false);
        toast.success("Location acquired successfully");
      },
      (err) => {
        toast.error("Unable to get location: " + err.message);
        setLoadingLocation(false);
      }
    );
  };

  const tilesUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  const mapCenter: [number, number] =
    latitude && longitude
      ? [parseFloat(latitude), parseFloat(longitude)]
      : DEFAULT_POSITION;

  return (
    <div className="relative">
      <MapContainer
        center={mapCenter}
        zoom={13}
        style={{ height: "600px", width: "100%" }}
      >
        <TileLayer url={tilesUrl} className="dark:[filter:brightness(0.6)_invert(1)_contrast(3)_hue-rotate(200deg)_saturate(0.3)_brightness(0.7)]"/>
        {position && <Marker position={position} icon={lucideMarker} />}
        <MapEventsHandler />
      </MapContainer>

      <Button
        type="button"
        onClick={handleCurrentLocation}
        disabled={loadingLocation}
        size="lg"
        className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000]"
      >
        {loadingLocation ? (
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
    </div>
  );
};
