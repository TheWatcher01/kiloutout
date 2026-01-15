"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const businessIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const clientIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface MapComponentProps {
  businessLocation: {
    lat: number;
    lon: number;
    address: string;
  };
  clientLocation: {
    lat: number;
    lon: number;
  };
}

export default function MapComponent({
  businessLocation,
  clientLocation,
}: MapComponentProps) {
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
      iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    });
  }, []);

  const center: [number, number] = [
    (businessLocation.lat + clientLocation.lat) / 2,
    (businessLocation.lon + clientLocation.lon) / 2,
  ];

  const businessPos: [number, number] = [businessLocation.lat, businessLocation.lon];
  const clientPos: [number, number] = [clientLocation.lat, clientLocation.lon];

  return (
    <div className="h-96 rounded-lg overflow-hidden border border-gray-200">
      <MapContainer
        center={center}
        zoom={10}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <Marker position={businessPos} icon={businessIcon}>
          <Popup>
            <div className="text-sm">
              <p className="font-semibold">Kiloutout Services</p>
              <p>{businessLocation.address}</p>
            </div>
          </Popup>
        </Marker>

        <Marker position={clientPos} icon={clientIcon}>
          <Popup>
            <div className="text-sm">
              <p className="font-semibold">Votre adresse</p>
            </div>
          </Popup>
        </Marker>

        <Polyline
          positions={[businessPos, clientPos]}
          color="#3b82f6"
          weight={3}
          opacity={0.7}
          dashArray="10, 10"
        />
      </MapContainer>
    </div>
  );
}
