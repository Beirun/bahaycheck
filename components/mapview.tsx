"use client";

import dynamic from "next/dynamic";
import React, { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";

interface Props {
  latitude: string;
  longitude: string;
  zoom?: number;
  className?: string;
  useMarker?: boolean;
}

const DEFAULT_POSITION: [number, number] = [11.132592, 123.983116];

// Dynamically import react-leaflet components (client only)
const MapContainer = dynamic(
  async () => (await import("react-leaflet")).MapContainer,
  { ssr: false }
);
const TileLayer = dynamic(
  async () => (await import("react-leaflet")).TileLayer,
  { ssr: false }
);
const Marker = dynamic(
  async () => (await import("react-leaflet")).Marker,
  { ssr: false }
);

export const MapView: React.FC<Props> = ({
  latitude,
  longitude,
  zoom = 15,
  className = "",
  useMarker = true,
}) => {
  const [L, setL] = useState<typeof import("leaflet") | null>(null);

  // Import Leaflet only on client
  useEffect(() => {
    import("leaflet").then((leaflet) => setL(leaflet));
  }, []);

  if (!L) return <div className="h-[600px] w-full bg-gray-100 dark:bg-gray-700/20" />;

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
    iconAnchor: [37.5, 75],
    popupAnchor: [0, -75],
  });

  const tilesUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  const position: [number, number] =
    latitude && longitude
      ? [parseFloat(latitude), parseFloat(longitude)]
      : DEFAULT_POSITION;

  return (
    <div className={`relative ${className}`}>
      <MapContainer
        center={position}
        zoom={zoom}
        style={{ height: "600px", width: "100%" }}
      >
        <TileLayer
          url={tilesUrl}
          className="dark:[filter:brightness(0.6)_invert(1)_contrast(3)_hue-rotate(200deg)_saturate(0.3)_brightness(0.7)]"
        />
        {useMarker && <Marker position={position} icon={lucideMarker} />}
      </MapContainer>
    </div>
  );
};
