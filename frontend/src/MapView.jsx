import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default marker issue
const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function MapView() {
  const [rides, setRides] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8000/rides/search")
      .then((res) => res.json())
      .then((data) => {
        setRides(data);
      })
      .catch((err) => console.error("Error fetching rides:", err));
  }, []);

  return (
    <div className="h-[80vh] w-full rounded-xl overflow-hidden shadow-lg">
      <MapContainer
        center={[43.0731, -89.4012]} // Madison center
        zoom={13}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Use real coordinates */}
        {rides
          .filter((ride) => ride.origin_lat && ride.origin_lng) // only render if coords exist
          .map((ride) => (
            <Marker
              key={ride.id}
              position={[ride.origin_lat, ride.origin_lng]}
              icon={markerIcon}
            >
              <Popup>
                <div className="text-sm">
                  <p className="font-bold">
                    {ride.origin} → {ride.destination}
                  </p>
                  <p>{ride.time}</p>
                  <p>{ride.driver}</p>
                  <p>Seats left: {ride.seats_left}</p>
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  );
}
