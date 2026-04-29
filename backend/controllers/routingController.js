const { runDijkstra, findNearestCity, cities } = require('../utils/dijkstra');
const Route = require('../models/Route');

exports.calculateRoute = async (req, res) => {
  try {
    const { source, destination } = req.body;

    // source and destination can be lat/lng objects from the map click or search
    if (!source || !destination) {
      return res.status(400).json({ error: 'Source and destination are required' });
    }

    // Find the nearest cities in our graph
    const startNode = findNearestCity(source.lat, source.lng);
    const endNode = findNearestCity(destination.lat, destination.lng);

    if (!startNode || !endNode) {
      return res.status(400).json({ error: 'Could not snap coordinates to graph' });
    }

    // Run custom Dijkstra
    const { path, distance } = runDijkstra(startNode, endNode);

    if (path.length === 0 && startNode !== endNode) {
      return res.status(404).json({ error: 'No route found between these locations' });
    }

    // Prepare coordinates for the frontend to draw
    const pathCoordinates = path.map(city => ({
      name: city,
      lat: cities[city].lat,
      lng: cities[city].lng
    }));

    // Assume average speed is 60 km/h
    const timeHours = distance / 60;
    const timeMinutes = Math.round(timeHours * 60);

    // Save to database
    const newRoute = new Route({
      sourceNode: startNode,
      destinationNode: endNode,
      distance: distance,
      path: path
    });
    
    await newRoute.save();

    res.json({
      startNode,
      endNode,
      distance,
      timeMinutes,
      path: pathCoordinates,
      dbId: newRoute._id
    });

  } catch (error) {
    console.error('Error calculating route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const history = await Route.find().sort({ createdAt: -1 }).limit(10);
    res.json(history);
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
