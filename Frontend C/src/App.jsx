import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import hospitals from './seed_hospitals.json';

// Where the three demo patients are (same point Person A uses in /docs)
const PATIENT_LOCATION = [23.24, 77.41];

// Colour of each dot, based on how many are available
function getColor(quantity) {
  if (quantity < 5) return 'red';
  if (quantity < 12) return 'orange';
  return 'green';
}

// Turn the raw code from the data into a readable label
function getLabel(resourceType) {
  if (resourceType === 'ICU') return 'ICU beds';
  if (resourceType === 'GENERAL_BED') return 'General beds';
  if (resourceType.startsWith('BLOOD_')) {
    return 'Blood group ' + resourceType.replace('BLOOD_', '') + ' (units)';
  }
  return resourceType;
}

const legendItems = [
  { color: 'green', text: '12 or more available' },
  { color: 'orange', text: '5 to 11 available' },
  { color: 'red', text: 'Less than 5 available' },
];

function Legend() {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 24,
        right: 12,
        zIndex: 1000,
        background: 'white',
        color: '#222',
        padding: '10px 14px',
        borderRadius: 8,
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
        fontSize: 14,
        textAlign: 'left',
        lineHeight: 1.7,
      }}
    >
      <b>Availability</b>
      {legendItems.map((item) => (
        <div key={item.color}>
          <span
            style={{
              display: 'inline-block',
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: item.color,
              marginRight: 8,
            }}
          />
          {item.text}
        </div>
      ))}
      <div>
        <span
          style={{
            display: 'inline-block',
            width: 12,
            height: 12,
            borderRadius: '50%',
            background: '#2563eb',
            marginRight: 8,
          }}
        />
        Patient location
      </div>
    </div>
  );
}

function App() {
  return (
    <div style={{ position: 'relative' }}>
      <MapContainer center={PATIENT_LOCATION} zoom={12} style={{ height: '100vh', width: '100%' }}>
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
            <Popup>
              <b>{h.name}</b>
              <br />
              {getLabel(h.resource_type)}: {h.quantity}
            </Popup>
          </CircleMarker>
        ))}

        {/* Patient marker drawn last so it sits on top */}
        <CircleMarker
          center={PATIENT_LOCATION}
          radius={12}
          pathOptions={{ color: '#1e3a8a', fillColor: '#2563eb', fillOpacity: 1, weight: 3 }}
        >
          <Tooltip permanent direction="top" offset={[0, -8]}>Patient</Tooltip>
          <Popup>
            <b>Demo patient location</b>
            <br />
            Lat 23.24, Lng 77.41
            <br />
            All three /docs requests start here.
          </Popup>
        </CircleMarker>
      </MapContainer>
      <Legend />
    </div>
  );
}

export default App;