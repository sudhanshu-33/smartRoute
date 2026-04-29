import React, { useState } from 'react';
import { MapPin, Navigation, Clock, Activity, Search, X } from 'lucide-react';
import axios from 'axios';

const Sidebar = ({ setRouteData, setDijkstraNodes, setSourcePoint, setDestinationPoint }) => {
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const geocode = async (query) => {
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}, India&limit=1`
      );

      if (response.data?.length) {
        return {
          lat: parseFloat(response.data[0].lat),
          lng: parseFloat(response.data[0].lon),
          name: response.data[0].display_name.split(',')[0]
        };
      }

      throw new Error('Location not found');
    } catch {
      throw new Error(`Could not find "${query}"`);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!source.trim() || !destination.trim()) {
      setError('Please enter both locations');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const sourceCoords = await geocode(source);
      const destCoords = await geocode(destination);

      setSourcePoint(sourceCoords);
      setDestinationPoint(destCoords);

      const res = await axios.post('http://localhost:5000/api/route', {
        source: sourceCoords,
        destination: destCoords
      });

      const data = res.data;
      setResult(data);
      setDijkstraNodes(data.path);

      try {
        const waypoints = [sourceCoords, ...data.path, destCoords]
          .map(p => `${p.lng},${p.lat}`)
          .join(';');

        const osrm = await axios.get(
          `https://router.project-osrm.org/route/v1/driving/${waypoints}?overview=full&geometries=geojson`
        );

        const routeDataObj = osrm.data?.routes?.[0];
        const route = routeDataObj?.geometry?.coordinates;

        if (route) {
          setRouteData(route.map(c => ({ lat: c[1], lng: c[0] })));
          
          setResult(prev => ({
            ...prev,
            distance: Math.round(routeDataObj.distance / 1000),
            timeMinutes: Math.round(routeDataObj.duration / 60)
          }));
        } else {
          setRouteData(data.path);
        }

      } catch {
        setRouteData(data.path);
      }

    } catch (err) {
      setError(err.message);
      setRouteData(null);
      setDijkstraNodes(null);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setResult(null);
    setError('');
    setRouteData(null);
    setDijkstraNodes(null);
  };

  return (
    <div className="sidebar">

      <div className="app-header">
        <h1 className="app-title">
          <Navigation size={20} />
          SmartRoute
        </h1>
        <p className="app-subtitle">
          Discover the optimal route across India
        </p>
      </div>

      <form onSubmit={handleSearch} className="search-form">

        <div className="input-group">
          <label>Source</label>
          <div className="input-wrapper">
            <MapPin size={16} className="input-icon" />
            <input
              className="custom-input"
              placeholder="Delhi"
              value={source}
              onChange={(e) => setSource(e.target.value)}
            />
          </div>
        </div>

        <div className="input-group">
          <label>Destination</label>
          <div className="input-wrapper">
            <MapPin size={16} className="input-icon" />
            <input
              className="custom-input"
              placeholder="Mumbai"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
            />
          </div>
        </div>

        <button className="btn-primary" disabled={loading}>
          {loading ? "Loading..." : (
            <>
              <Search size={16} />
              Find Route
            </>
          )}
        </button>

      </form>

      {error && <div className="error-message">{error}</div>}

      {result && (
        <div className="results-panel">

          <div className="results-header">
            <h3>Route Summary</h3>
            <button className="clear-btn" onClick={clearResults}>
              <X size={16} />
            </button>
          </div>

          <div className="result-item">
            <div className="result-label">
              <Activity size={14} />
              Distance
            </div>
            <div className="result-value">{result.distance} km</div>
          </div>

          <div className="result-item">
            <div className="result-label">
              <Clock size={14} />
              Time
            </div>
            <div className="result-value">
              {Math.floor(result.timeMinutes / 60)}h {result.timeMinutes % 60}m
            </div>
          </div>

          <div className="path-section">
            <div className="result-label">Path</div>

            <div className="path-nodes">
              {result.path.map((node, i) => (
                <React.Fragment key={i}>
                  <span className="node-tag">{node.name}</span>
                  {i < result.path.length - 1 && <span className="arrow">→</span>}
                </React.Fragment>
              ))}
              {result.path.length === 0 && (
                <span className="node-tag">Direct Route</span>
              )}
            </div>
          </div>

          <div className="traffic-legend">
            <div className="result-label">Traffic Map Legend</div>
            <div className="legend-items">
              <div className="legend-item">
                <span className="legend-color" style={{ backgroundColor: '#22c55e' }}></span> Low
              </div>
              <div className="legend-item">
                <span className="legend-color" style={{ backgroundColor: '#f97316' }}></span> Medium
              </div>
              <div className="legend-item">
                <span className="legend-color" style={{ backgroundColor: '#ef4444' }}></span> High
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

export default Sidebar;