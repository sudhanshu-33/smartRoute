import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import MapComponent from './components/MapComponent';
import './index.css';

function App() {
  const [routeData, setRouteData] = useState(null);
  const [dijkstraNodes, setDijkstraNodes] = useState(null);
  const [sourcePoint, setSourcePoint] = useState(null);
  const [destinationPoint, setDestinationPoint] = useState(null);

  return (
    <div className="app-container">
      <Sidebar 
        setRouteData={setRouteData} 
        setDijkstraNodes={setDijkstraNodes}
        setSourcePoint={setSourcePoint}
        setDestinationPoint={setDestinationPoint}
      />
      <MapComponent 
        routeData={routeData} 
        dijkstraNodes={dijkstraNodes}
        sourcePoint={sourcePoint}
        destinationPoint={destinationPoint}
      />
    </div>
  );
}

export default App;
