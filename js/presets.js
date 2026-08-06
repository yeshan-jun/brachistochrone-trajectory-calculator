export const PLANETS = Object.freeze([
  { id: 'mercury', name: 'Mercury', orbitalRadiusAu: 0.387098 },
  { id: 'venus', name: 'Venus', orbitalRadiusAu: 0.723332 },
  { id: 'earth', name: 'Earth', orbitalRadiusAu: 1 },
  { id: 'mars', name: 'Mars', orbitalRadiusAu: 1.523679 },
  { id: 'jupiter', name: 'Jupiter', orbitalRadiusAu: 5.2044 },
  { id: 'saturn', name: 'Saturn', orbitalRadiusAu: 9.5826 },
  { id: 'uranus', name: 'Uranus', orbitalRadiusAu: 19.2184 },
  { id: 'neptune', name: 'Neptune', orbitalRadiusAu: 30.1104 },
]);

export function findPlanet(id) {
  return PLANETS.find((planet) => planet.id === id) ?? null;
}

export function getPresetDistanceAu(originId, destinationId) {
  const origin = findPlanet(originId);
  const destination = findPlanet(destinationId);
  if (!origin || !destination) {
    throw new RangeError('Choose a valid origin and destination.');
  }
  if (origin.id === destination.id) {
    throw new RangeError('Origin and destination must be different.');
  }
  return Math.abs(destination.orbitalRadiusAu - origin.orbitalRadiusAu);
}
