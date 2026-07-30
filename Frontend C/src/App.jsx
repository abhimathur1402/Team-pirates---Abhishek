import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import hospitals from './seed_hospitals.json';

function getColor(quantity) {
  if (quantity < 5) return 'red';
  if (quantity < 12) return 'orange';
  return 'green';
}

function App() {
  return (
    <MapContainer center={[23.2599, 77.4126]} zoom={13} style={{ height: '100vh', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />
      {hospitals.map((h, i) => (
        <CircleMarker
          key={i}
          center={[h.lat, h.lng]}
          radius={10}
          pathOptions={{ color: getColor(h.quantity), fillOpacity: 0.8 }}
        >
          <Popup>{h.name}<br/>{h.resource_type}: {h.quantity}</Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}

export default App;
