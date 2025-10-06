import React from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function RouteMap2D({small}){
  // demo coordinates near Coimbatore region
  const path = [[11.0168,76.9558],[11.3410,77.7172],[11.3644,77.7289]];
  const center = path[0];
  return (
    <MapContainer center={center} zoom={8} style={{height: small?200:320, width:'100%'}}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Polyline positions={path} color="#f59e0b" />
      {path.map((p,i)=>(
        <Marker key={i} position={p}>
          <Popup>Stop {i+1}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
