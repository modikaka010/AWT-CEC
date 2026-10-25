// India's 28 states + 8 union territories.
// lat/lon = capital city; used ONLY as a fallback when a district can't be geocoded.
// aliases = other spellings the geocoder (or old records) may use.
const STATES = [
  { name: 'Andhra Pradesh', lat: 16.5062, lon: 80.648 },
  { name: 'Arunachal Pradesh', lat: 27.0844, lon: 93.6053 },
  { name: 'Assam', lat: 26.1445, lon: 91.7362 },
  { name: 'Bihar', lat: 25.5941, lon: 85.1376 },
  { name: 'Chhattisgarh', lat: 21.2514, lon: 81.6296 },
  { name: 'Goa', lat: 15.4909, lon: 73.8278 },
  { name: 'Gujarat', lat: 23.2156, lon: 72.6369 },
  { name: 'Haryana', lat: 30.7333, lon: 76.7794 },
  { name: 'Himachal Pradesh', lat: 31.1048, lon: 77.1734 },
  { name: 'Jharkhand', lat: 23.3441, lon: 85.3096 },
  { name: 'Karnataka', lat: 12.9716, lon: 77.5946 },
  { name: 'Kerala', lat: 8.5241, lon: 76.9366 },
  { name: 'Madhya Pradesh', lat: 23.2599, lon: 77.4126 },
  { name: 'Maharashtra', lat: 19.076, lon: 72.8777 },
  { name: 'Manipur', lat: 24.817, lon: 93.9368 },
  { name: 'Meghalaya', lat: 25.5788, lon: 91.8933 },
  { name: 'Mizoram', lat: 23.7271, lon: 92.7176 },
  { name: 'Nagaland', lat: 25.6747, lon: 94.1086 },
  { name: 'Odisha', lat: 20.2961, lon: 85.8245, aliases: ['Orissa'] },
  { name: 'Punjab', lat: 30.7333, lon: 76.7794 },
  { name: 'Rajasthan', lat: 26.9124, lon: 75.7873 },
  { name: 'Sikkim', lat: 27.3314, lon: 88.6138 },
  { name: 'Tamil Nadu', lat: 13.0827, lon: 80.2707 },
  { name: 'Telangana', lat: 17.385, lon: 78.4867 },
  { name: 'Tripura', lat: 23.8315, lon: 91.2868 },
  { name: 'Uttar Pradesh', lat: 26.8467, lon: 80.9462 },
  { name: 'Uttarakhand', lat: 30.3165, lon: 78.0322, aliases: ['Uttaranchal'] },
  { name: 'West Bengal', lat: 22.5726, lon: 88.3639 },
  // Union territories
  { name: 'Andaman and Nicobar Islands', lat: 11.6234, lon: 92.7265, aliases: ['Andaman and Nicobar'] },
  { name: 'Chandigarh', lat: 30.7333, lon: 76.7794 },
  { name: 'Dadra and Nagar Haveli and Daman and Diu', lat: 20.3974, lon: 72.8328, aliases: ['Dadra and Nagar Haveli', 'Daman and Diu'] },
  { name: 'Delhi', lat: 28.6139, lon: 77.209, aliases: ['National Capital Territory of Delhi', 'NCT of Delhi'] },
  { name: 'Jammu and Kashmir', lat: 34.0837, lon: 74.7973 },
  { name: 'Ladakh', lat: 34.1526, lon: 77.5771 },
  { name: 'Lakshadweep', lat: 10.5667, lon: 72.6417 },
  { name: 'Puducherry', lat: 11.9416, lon: 79.8083, aliases: ['Pondicherry'] },
];

/** lower-case, strip accents/punctuation, '&' → 'and' */
const norm = (s) =>
  String(s || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

/** like norm() but also drops the word "district" ("Etah district" → "etah") */
const normPlace = (s) => norm(s).replace(/\bdistrict\b/g, '').replace(/\s+/g, ' ').trim();

const keyed = STATES.map((st) => ({
  st,
  keys: [st.name, ...(st.aliases || [])].map(norm),
}));

/** Canonical state record for any accepted spelling, or null. */
const findState = (input) => {
  const k = norm(input);
  if (!k) return null;
  const hit = keyed.find((e) => e.keys.includes(k));
  return hit ? hit.st : null;
};

/** Does a geocoder `admin1` value refer to this state? */
const stateMatches = (admin1, state) => {
  const found = findState(admin1);
  return !!found && found.name === state.name;
};

module.exports = { STATES, findState, stateMatches, norm, normPlace };