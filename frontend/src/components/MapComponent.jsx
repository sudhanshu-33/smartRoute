import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet's default icon path issues
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icon for destination
const destIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const defaultIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const nodeIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [15, 24],
  iconAnchor: [7, 24],
  popupAnchor: [1, -24],
  shadowSize: [24, 24]
});

// Component to dynamically fit bounds when path changes
const MapBounds = ({ pathData, sourcePoint, destinationPoint }) => {
  const map = useMap();

  useEffect(() => {
    if (pathData && pathData.length > 0) {
      const bounds = L.latLngBounds(pathData.map(node => [node.lat, node.lng]));
      if (sourcePoint) bounds.extend([sourcePoint.lat, sourcePoint.lng]);
      if (destinationPoint) bounds.extend([destinationPoint.lat, destinationPoint.lng]);
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (sourcePoint && destinationPoint) {
      const bounds = L.latLngBounds([
        [sourcePoint.lat, sourcePoint.lng],
        [destinationPoint.lat, destinationPoint.lng]
      ]);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [pathData, sourcePoint, destinationPoint, map]);

  return null;
};

const MapComponent = ({ routeData, dijkstraNodes, sourcePoint, destinationPoint }) => {
  // Center of India
  const defaultCenter = [20.5937, 78.9629];
  
  // Generate segments with traffic colors to simulate traffic conditions
  const trafficSegments = [];
  if (routeData && routeData.length > 0) {
    let currentSegment = [routeData[0]];
    let currentColor = '#22c55e'; // default green

    for (let i = 1; i < routeData.length; i++) {
      const node = routeData[i];
      currentSegment.push(node);
      
      // Change color every ~20 points to simulate traffic zones
      if (i % 20 === 0 || i === routeData.length - 1) {
        // Pseudo-random based on coordinates to keep it somewhat consistent
        const seed = Math.abs(Math.sin(node.lat * node.lng * i));
        
        if (seed > 0.85) currentColor = '#ef4444'; // Red (High traffic)
        else if (seed > 0.6) currentColor = '#f97316'; // Orange (Medium traffic)
        else currentColor = '#22c55e'; // Green (Low traffic)
        
        trafficSegments.push({
          positions: currentSegment.map(n => [n.lat, n.lng]),
          color: currentColor
        });
        
        // Start next segment with the last node to ensure continuity
        currentSegment = [node];
      }
    }
  }

  return (
    <div className="map-container">
      <MapContainer center={defaultCenter} zoom={5} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {sourcePoint && (
          <Marker position={[sourcePoint.lat, sourcePoint.lng]} icon={defaultIcon}>
            <Popup>Source: {sourcePoint.name || 'Selected Location'}</Popup>
          </Marker>
        )}

        {destinationPoint && (
          <Marker position={[destinationPoint.lat, destinationPoint.lng]} icon={destIcon}>
            <Popup>Destination: {destinationPoint.name || 'Selected Location'}</Popup>
          </Marker>
        )}

        {/* Only draw markers for the actual Dijkstra nodes chosen by backend */}
        {dijkstraNodes && dijkstraNodes.map((node, idx) => (
          <Marker key={`node-${idx}`} position={[node.lat, node.lng]} icon={nodeIcon}>
            <Popup>Dijkstra Node: {node.name}</Popup>
          </Marker>
        ))}

        {routeData && (
          <>
            {trafficSegments.map((segment, idx) => (
              <Polyline 
                key={`segment-${idx}`}
                positions={segment.positions} 
                color={segment.color} 
                weight={6} 
                opacity={0.8}
              />
            ))}
            {sourcePoint && dijkstraNodes && dijkstraNodes.length > 0 && (
              <Polyline 
                positions={[[sourcePoint.lat, sourcePoint.lng], [dijkstraNodes[0].lat, dijkstraNodes[0].lng]]} 
                color="#6b7280" 
                weight={3} 
                dashArray="5, 10" 
                opacity={0.7}
              />
            )}
            {destinationPoint && dijkstraNodes && dijkstraNodes.length > 0 && (
              <Polyline 
                positions={[[dijkstraNodes[dijkstraNodes.length - 1].lat, dijkstraNodes[dijkstraNodes.length - 1].lng], [destinationPoint.lat, destinationPoint.lng]]} 
                color="#6b7280" 
                weight={3} 
                dashArray="5, 10" 
                opacity={0.7}
              />
            )}
          </>
        )}

        <MapBounds 
          pathData={routeData} 
          sourcePoint={sourcePoint} 
          destinationPoint={destinationPoint} 
        />
      </MapContainer>
    </div>
  );
};

export default MapComponent;
