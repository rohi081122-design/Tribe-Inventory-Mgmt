// config/places.js
// Approximate map positions (latitude, longitude) used to work out the DELIVERY DISTANCE
// between a seller and a buyer - without any paid map service.
//
// How a place is found:
//   1. the district inside the given state (district headquarters town), e.g. "Dhanbad, Jharkhand"
//   2. if the district is not in the list: the state capital, e.g. any other district of Bihar -> Patna
// All Jharkhand districts are listed, plus the bigger districts of the neighbouring states and big cities.
// To add a place: put [name, latitude, longitude, ...other spellings] in the right state.

const PLACES = {
  Jharkhand: {
    capital: [23.3441, 85.3096], // Ranchi
    districts: [
      ['Bokaro', 23.6693, 86.1511, 'Bokaro Steel City', 'Chas'],
      ['Chatra', 24.2068, 84.8708],
      ['Deoghar', 24.4823, 86.6957, 'Baidyanath Dham'],
      ['Dhanbad', 23.7957, 86.4304],
      ['Dumka', 24.2676, 87.2497],
      ['East Singhbhum', 22.8046, 86.2029, 'Purbi Singhbhum', 'Purba Singhbhum', 'Jamshedpur', 'Tatanagar'],
      ['Garhwa', 24.16, 83.8075],
      ['Giridih', 24.1854, 86.3003],
      ['Godda', 24.827, 87.2125],
      ['Gumla', 23.0441, 84.5379],
      ['Hazaribagh', 23.9925, 85.3637, 'Hazaribag'],
      ['Jamtara', 23.962, 86.803],
      ['Khunti', 23.0717, 85.2789],
      ['Koderma', 24.4677, 85.594, 'Kodarma', 'Jhumri Telaiya'],
      ['Latehar', 23.7444, 84.4997],
      ['Lohardaga', 23.4337, 84.6799],
      ['Pakur', 24.6383, 87.84],
      ['Palamu', 24.03, 84.07, 'Palamau', 'Daltonganj', 'Medininagar'],
      ['Ramgarh', 23.63, 85.52],
      ['Ranchi', 23.3441, 85.3096],
      ['Sahebganj', 25.24, 87.63, 'Sahibganj'],
      ['Seraikela Kharsawan', 22.7, 85.93, 'Saraikela Kharsawan', 'Seraikela', 'Saraikela', 'Kharsawan'],
      ['Simdega', 22.617, 84.5121],
      ['West Singhbhum', 22.55, 85.8, 'Pashchimi Singhbhum', 'Paschimi Singhbhum', 'Chaibasa'],
    ],
  },
  Bihar: {
    capital: [25.5941, 85.1376], // Patna
    districts: [
      ['Patna', 25.5941, 85.1376],
      ['Gaya', 24.7955, 85.0002, 'Bodh Gaya'],
      ['Nawada', 24.8867, 85.5435],
      ['Aurangabad', 24.7521, 84.3742],
      ['Bhagalpur', 25.2425, 86.9842],
      ['Banka', 24.8855, 86.922],
      ['Jamui', 24.9196, 86.224],
      ['Munger', 25.3708, 86.4734, 'Monghyr'],
      ['Rohtas', 24.948, 84.031, 'Sasaram'],
      ['Kaimur', 25.04, 83.61, 'Bhabua'],
      ['Nalanda', 25.1982, 85.5149, 'Bihar Sharif'],
      ['Muzaffarpur', 26.1209, 85.3647],
      ['Darbhanga', 26.1542, 85.8918],
      ['Purnia', 25.7771, 87.4753, 'Purnea'],
      ['Begusarai', 25.4182, 86.1272],
    ],
  },
  'West Bengal': {
    capital: [22.5726, 88.3639], // Kolkata
    districts: [
      ['Kolkata', 22.5726, 88.3639, 'Calcutta'],
      ['Howrah', 22.5958, 88.2636],
      ['Purulia', 23.3321, 86.3652],
      ['Bankura', 23.2324, 87.0746],
      ['Paschim Bardhaman', 23.6739, 86.9524, 'Asansol', 'Durgapur', 'West Bardhaman', 'West Burdwan'],
      ['Purba Bardhaman', 23.2324, 87.8615, 'Bardhaman', 'Burdwan', 'East Bardhaman'],
      ['Birbhum', 23.91, 87.53, 'Suri', 'Bolpur', 'Shantiniketan'],
      ['Jhargram', 22.455, 86.9974],
      ['Paschim Medinipur', 22.4257, 87.3199, 'Midnapore', 'Medinipur', 'West Medinipur'],
      ['Purba Medinipur', 22.2955, 87.9224, 'Tamluk', 'East Medinipur'],
      ['Hooghly', 22.9089, 88.3967, 'Chinsurah'],
      ['North 24 Parganas', 22.7225, 88.4819, 'Barasat'],
      ['South 24 Parganas', 22.1667, 88.4333, 'Alipore'],
      ['Nadia', 23.4, 88.5, 'Krishnanagar'],
      ['Murshidabad', 24.1, 88.25, 'Berhampore', 'Baharampur'],
      ['Malda', 25.0108, 88.1411, 'English Bazar'],
      ['Darjeeling', 27.041, 88.2663, 'Siliguri'],
    ],
  },
  Odisha: {
    capital: [20.2961, 85.8245], // Bhubaneswar
    districts: [
      ['Khordha', 20.2961, 85.8245, 'Bhubaneswar', 'Khurda'],
      ['Cuttack', 20.4625, 85.883],
      ['Puri', 19.8135, 85.8312],
      ['Sundargarh', 22.1167, 84.0333, 'Rourkela'],
      ['Mayurbhanj', 21.9333, 86.7333, 'Baripada'],
      ['Keonjhar', 21.6297, 85.5817, 'Kendujhar'],
      ['Sambalpur', 21.4669, 83.9812],
      ['Balasore', 21.4934, 86.9135, 'Baleswar'],
      ['Koraput', 18.8135, 82.7123],
      ['Ganjam', 19.3149, 84.7941, 'Berhampur', 'Brahmapur'],
    ],
  },
  Chhattisgarh: {
    capital: [21.2514, 81.6296], // Raipur
    districts: [
      ['Raipur', 21.2514, 81.6296],
      ['Jashpur', 22.887, 84.138, 'Jashpur Nagar'],
      ['Surguja', 23.118, 83.196, 'Ambikapur'],
      ['Balrampur', 23.6097, 83.6119],
      ['Bilaspur', 22.0797, 82.1409],
      ['Raigarh', 21.8974, 83.395],
      ['Korba', 22.3595, 82.7501],
      ['Durg', 21.1904, 81.2849, 'Bhilai'],
      ['Bastar', 19.0748, 82.0335, 'Jagdalpur'],
    ],
  },
  'Uttar Pradesh': {
    capital: [26.8467, 80.9462], // Lucknow
    districts: [
      ['Lucknow', 26.8467, 80.9462],
      ['Varanasi', 25.3176, 82.9739, 'Banaras', 'Benares'],
      ['Sonbhadra', 24.688, 83.068, 'Robertsganj'],
      ['Mirzapur', 25.1337, 82.5644],
      ['Prayagraj', 25.4358, 81.8463, 'Allahabad'],
      ['Kanpur Nagar', 26.4499, 80.3319, 'Kanpur'],
      ['Agra', 27.1767, 78.0081],
      ['Gautam Buddh Nagar', 28.5355, 77.391, 'Noida', 'Greater Noida'],
      ['Ghaziabad', 28.6692, 77.4538],
      ['Gorakhpur', 26.7606, 83.3732],
      ['Meerut', 28.9845, 77.7064],
    ],
  },
  Delhi: {
    capital: [28.6139, 77.209],
    districts: [['New Delhi', 28.6139, 77.209, 'Delhi']],
  },
  Maharashtra: {
    capital: [19.076, 72.8777], // Mumbai
    districts: [
      ['Mumbai', 19.076, 72.8777, 'Bombay', 'Mumbai City', 'Mumbai Suburban'],
      ['Pune', 18.5204, 73.8567],
      ['Nagpur', 21.1458, 79.0882],
      ['Thane', 19.2183, 72.9781],
    ],
  },
  Karnataka: { capital: [12.9716, 77.5946], districts: [['Bengaluru', 12.9716, 77.5946, 'Bangalore', 'Bengaluru Urban']] },
  'Tamil Nadu': { capital: [13.0827, 80.2707], districts: [['Chennai', 13.0827, 80.2707, 'Madras']] },
  Telangana: { capital: [17.385, 78.4867], districts: [['Hyderabad', 17.385, 78.4867]] },
  Gujarat: { capital: [23.2156, 72.6369], districts: [['Ahmedabad', 23.0225, 72.5714], ['Surat', 21.1702, 72.8311]] },
  Haryana: { capital: [30.7333, 76.7794], districts: [['Gurugram', 28.4595, 77.0266, 'Gurgaon'], ['Faridabad', 28.4089, 77.3178]] },
  Rajasthan: { capital: [26.9124, 75.7873], districts: [['Jaipur', 26.9124, 75.7873]] },
  'Madhya Pradesh': { capital: [23.2599, 77.4126], districts: [['Bhopal', 23.2599, 77.4126], ['Indore', 22.7196, 75.8577]] },
  'Andhra Pradesh': { capital: [16.5131, 80.5165], districts: [['Visakhapatnam', 17.6868, 83.2185, 'Vizag']] },
  'Arunachal Pradesh': { capital: [27.0844, 93.6053], districts: [] },
  Assam: { capital: [26.1433, 91.7898], districts: [['Kamrup Metropolitan', 26.1445, 91.7362, 'Guwahati']] },
  Goa: { capital: [15.4909, 73.8278], districts: [] },
  'Himachal Pradesh': { capital: [31.1048, 77.1734], districts: [] },
  Kerala: { capital: [8.5241, 76.9366], districts: [['Ernakulam', 9.9816, 76.2999, 'Kochi', 'Cochin']] },
  Manipur: { capital: [24.817, 93.9368], districts: [] },
  Meghalaya: { capital: [25.5788, 91.8933], districts: [] },
  Mizoram: { capital: [23.7271, 92.7176], districts: [] },
  Nagaland: { capital: [25.6751, 94.1086], districts: [] },
  Punjab: { capital: [30.7333, 76.7794], districts: [['Ludhiana', 30.901, 75.8573], ['Amritsar', 31.634, 74.8723]] },
  Sikkim: { capital: [27.3389, 88.6065], districts: [] },
  Tripura: { capital: [23.8315, 91.2868], districts: [] },
  Uttarakhand: { capital: [30.3165, 78.0322], districts: [] },
  'Andaman and Nicobar Islands': { capital: [11.6234, 92.7265], districts: [] },
  Chandigarh: { capital: [30.7333, 76.7794], districts: [] },
  'Dadra and Nagar Haveli and Daman and Diu': { capital: [20.3974, 72.8328], districts: [] },
  'Jammu and Kashmir': { capital: [34.0837, 74.7973], districts: [['Jammu', 32.7266, 74.857]] },
  Ladakh: { capital: [34.1526, 77.5771], districts: [] },
  Lakshadweep: { capital: [10.5669, 72.642], districts: [] },
  Puducherry: { capital: [11.9416, 79.8083], districts: [] },
};

// Other ways people write some state names
const STATE_ALIASES = {
  orissa: 'Odisha',
  newdelhi: 'Delhi',
  nctofdelhi: 'Delhi',
  up: 'Uttar Pradesh',
  wb: 'West Bengal',
  jk: 'Jammu and Kashmir',
  pondicherry: 'Puducherry',
  uttaranchal: 'Uttarakhand',
  jharkand: 'Jharkhand',
};

// Roads are longer than a straight line on the map, so the straight distance is multiplied by this
const ROAD_FACTOR = 1.3;

// "East Singhbhum " -> "eastsinghbhum" (compare names without spaces, dots or capital letters)
function simplifyName(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/\bdistrict\b/g, '')
    .replace(/[^a-z0-9]/g, '');
}

const STATE_NAMES = Object.keys(PLACES);

function findStateName(state) {
  const key = simplifyName(state);
  if (!key) return null;
  return STATE_NAMES.find((name) => simplifyName(name) === key) || STATE_ALIASES[key] || null;
}

function findDistrict(stateName, district) {
  const key = simplifyName(district);
  if (!key) return null;
  return PLACES[stateName].districts.find(([name, , , ...otherNames]) =>
    [name, ...otherNames].some((spelling) => simplifyName(spelling) === key)
  );
}

// Returns { lat, lng, label } for a district + state, or null when the place is unknown
function findPlace(district, state) {
  const stateName = findStateName(state);

  if (stateName) {
    const match = findDistrict(stateName, district);
    if (match) {
      return { lat: match[1], lng: match[2], label: `${match[0]}, ${stateName}` };
    }
    const [lat, lng] = PLACES[stateName].capital;
    return { lat, lng, label: stateName };
  }

  // Unknown state: try to find the district in any state
  for (const name of STATE_NAMES) {
    const match = findDistrict(name, district);
    if (match) return { lat: match[1], lng: match[2], label: `${match[0]}, ${name}` };
  }
  return null;
}

// Straight-line distance between two points on Earth in km (the "haversine" formula)
function straightDistanceKm(from, to) {
  const toRadians = (degrees) => (degrees * Math.PI) / 180;
  const EARTH_RADIUS_KM = 6371;
  const dLat = toRadians(to.lat - from.lat);
  const dLng = toRadians(to.lng - from.lng);
  const a =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRadians(from.lat)) * Math.cos(toRadians(to.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));
}

// Approximate road distance in whole km between two places found with findPlace
function estimateRoadDistanceKm(from, to) {
  return Math.round(straightDistanceKm(from, to) * ROAD_FACTOR);
}

// For the checkout form: every state, and the districts we know for each state
function getPlaceNames() {
  const districts = {};
  STATE_NAMES.forEach((name) => {
    districts[name] = PLACES[name].districts.map(([districtName]) => districtName).sort();
  });
  return { states: [...STATE_NAMES].sort(), districts };
}

module.exports = { findPlace, findStateName, estimateRoadDistanceKm, getPlaceNames };
