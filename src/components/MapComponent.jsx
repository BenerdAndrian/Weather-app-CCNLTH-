import { useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import placeholder from '../assets/img/placeholder.png'

// Configured once when this (lazy-loaded) module is first imported.
L.Marker.prototype.options.icon = L.icon({ iconUrl: placeholder, iconSize: [38, 38] });

// Hanoi, used until the first forecast arrives.
const FALLBACK_POSITION = [21.03, 105.85];

// Moves the existing map when the position changes (a side effect, so it
// belongs in useEffect, not in render).
function ChangeMapView({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom());
  }, [map, lat, lng]);
  return null;
}

// The position is derived from the forecast prop; no extra state needed.
export default function MapComponent({ forecast }) {
  const position = forecast ? [forecast.latitude, forecast.longitude] : FALLBACK_POSITION;
  return (
      <MapContainer center={position} zoom={11} className="map-canvas">
      <ChangeMapView lat={position[0]} lng={position[1]} />
      <TileLayer
        attribution={`&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors`}
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {forecast && (
        <Marker position={position}>
          <Popup>{forecast.resolvedAddress}</Popup>
        </Marker>
      )}
    </MapContainer>
  )
}
