import dynamic from "next/dynamic";

const MapView = dynamic(() => import("@/components/mapview").then(mod => mod.MapView), {
  ssr: false,
});

export default MapView;
