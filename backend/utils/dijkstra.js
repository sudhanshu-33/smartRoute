const cities = {
  Delhi: { lat: 28.7041, lng: 77.1025 },
  Mumbai: { lat: 19.0760, lng: 72.8777 },
  Bangalore: { lat: 12.9716, lng: 77.5946 },
  Hyderabad: { lat: 17.3850, lng: 78.4867 },
  Chennai: { lat: 13.0827, lng: 80.2707 },
  Kolkata: { lat: 22.5726, lng: 88.3639 },
  Ahmedabad: { lat: 23.0225, lng: 72.5714 },
  Pune: { lat: 18.5204, lng: 73.8567 },
  Jaipur: { lat: 26.9124, lng: 75.7873 },
  Lucknow: { lat: 26.8467, lng: 80.9462 },
  Patna: { lat: 25.5941, lng: 85.1376 },
  Bhopal: { lat: 23.2599, lng: 77.4126 },
  Nagpur: { lat: 21.1458, lng: 79.0882 },
  Kochi: { lat: 9.9312, lng: 76.2673 },
  Guwahati: { lat: 26.1445, lng: 91.7362 },
  Kanpur: { lat: 26.4499, lng: 80.3319 },
  Agra: { lat: 27.1767, lng: 78.0081 },
  Varanasi: { lat: 25.3176, lng: 82.9739 },
  Prayagraj: { lat: 25.4358, lng: 81.8463 },
  Bareilly: { lat: 28.3670, lng: 79.4304 },
  Gorakhpur: { lat: 26.7606, lng: 83.3732 },
  Dehradun: { lat: 30.3165, lng: 78.0322 },
  Meerut: { lat: 28.9845, lng: 77.7064 },
  Chandigarh: { lat: 30.7333, lng: 76.7794 },
  Indore: { lat: 22.7196, lng: 75.8577 },
  Surat: { lat: 21.1702, lng: 72.8311 }
};

const graph = {
  Delhi: { Jaipur: 280, Agra: 230, Bareilly: 260, Meerut: 70, Chandigarh: 250 },
  Jaipur: { Delhi: 280, Ahmedabad: 680, Agra: 240, Indore: 600 },
  Ahmedabad: { Jaipur: 680, Mumbai: 530, Surat: 260, Indore: 390 },
  Mumbai: { Ahmedabad: 530, Pune: 150, Surat: 280 },
  Pune: { Mumbai: 150, Bangalore: 840, Indore: 600 },
  Bangalore: { Pune: 840, Chennai: 350, Kochi: 550, Hyderabad: 570 },
  Kochi: { Bangalore: 550 },
  Chennai: { Bangalore: 350, Hyderabad: 630 },
  Hyderabad: { Chennai: 630, Bangalore: 570, Nagpur: 500 },
  Nagpur: { Hyderabad: 500, Bhopal: 350, Kolkata: 1100, Prayagraj: 600, Indore: 440 },
  Bhopal: { Nagpur: 350, Agra: 540, Kanpur: 520, Indore: 190 },
  Lucknow: { Kanpur: 90, Bareilly: 250, Gorakhpur: 270, Prayagraj: 200 },
  Patna: { Varanasi: 250, Kolkata: 580, Gorakhpur: 270 },
  Kolkata: { Patna: 580, Nagpur: 1100, Guwahati: 1000 },
  Guwahati: { Kolkata: 1000 },
  Kanpur: { Lucknow: 90, Agra: 280, Prayagraj: 210, Bhopal: 520 },
  Agra: { Delhi: 230, Jaipur: 240, Kanpur: 280, Bhopal: 540 },
  Varanasi: { Prayagraj: 120, Patna: 250, Gorakhpur: 200 },
  Prayagraj: { Lucknow: 200, Kanpur: 210, Varanasi: 120, Nagpur: 600 },
  Bareilly: { Delhi: 260, Lucknow: 250, Meerut: 200 },
  Gorakhpur: { Lucknow: 270, Varanasi: 200, Patna: 270 },
  Dehradun: { Meerut: 170, Chandigarh: 170 },
  Meerut: { Delhi: 70, Bareilly: 200, Dehradun: 170 },
  Chandigarh: { Delhi: 250, Dehradun: 170 },
  Indore: { Bhopal: 190, Pune: 600, Ahmedabad: 390, Jaipur: 600, Surat: 450, Nagpur: 440 },
  Surat: { Mumbai: 280, Ahmedabad: 260, Indore: 450 }
};

class PriorityQueue {
  constructor() {
    this.elements = [];
  }
  enqueue(item, priority) {
    this.elements.push({ item, priority });
    this.elements.sort((a, b) => a.priority - b.priority);
  }
  dequeue() {
    return this.elements.shift();
  }
  isEmpty() {
    return this.elements.length === 0;
  }
}

// Function to find the nearest city in our graph given lat/lng
function findNearestCity(lat, lng) {
  let nearest = null;
  let minDist = Infinity;
  for (const [city, coords] of Object.entries(cities)) {
    // Simple Euclidean distance for snapping (sufficient for this scale)
    const dist = Math.sqrt(Math.pow(coords.lat - lat, 2) + Math.pow(coords.lng - lng, 2));
    if (dist < minDist) {
      minDist = dist;
      nearest = city;
    }
  }
  return nearest;
}

function runDijkstra(startNode, endNode) {
  const distances = {};
  const previous = {};
  const pq = new PriorityQueue();

  for (const city in graph) {
    if (city === startNode) {
      distances[city] = 0;
      pq.enqueue(city, 0);
    } else {
      distances[city] = Infinity;
      pq.enqueue(city, Infinity);
    }
    previous[city] = null;
  }

  while (!pq.isEmpty()) {
    const current = pq.dequeue().item;

    if (current === endNode) {
      // Build path
      const path = [];
      let curr = endNode;
      while (curr) {
        path.unshift(curr);
        curr = previous[curr];
      }
      
      // If start and end snap to the same node, don't force routing through it
      if (path.length === 1 && path[0] === startNode) {
        return { path: [], distance: 0 };
      }
      
      return { path, distance: distances[endNode] };
    }

    if (distances[current] !== Infinity) {
      for (const neighbor in graph[current]) {
        const alt = distances[current] + graph[current][neighbor];
        if (alt < distances[neighbor]) {
          distances[neighbor] = alt;
          previous[neighbor] = current;
          pq.enqueue(neighbor, alt);
        }
      }
    }
  }

  return { path: [], distance: Infinity };
}

module.exports = {
  cities,
  graph,
  findNearestCity,
  runDijkstra
};
