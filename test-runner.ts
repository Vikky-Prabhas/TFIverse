import { calculateOccupancy, calculateTrend, calculateContribution, mapCityToTerritory } from './src/lib/api/box-office/utils';
import assert from 'assert';

console.log('Running quick validation tests...');

// Occupancy
assert.strictEqual(calculateOccupancy(50, 100), 50);
assert.strictEqual(calculateOccupancy(10, 0), null);
assert.strictEqual(calculateOccupancy(110, 100), 100);

// Trend
assert.strictEqual(calculateTrend(150, 100), 50);
assert.strictEqual(calculateTrend(100, 0), null);

// Contribution
assert.strictEqual(calculateContribution(25, 100), 25);
assert.strictEqual(calculateContribution(10, 0), null);

// Territory Mapper
assert.strictEqual(mapCityToTerritory('Hyderabad', 'Telangana'), 'NIZAM');
assert.strictEqual(mapCityToTerritory('Tirupati', 'Andhra Pradesh'), 'CEDED');
assert.strictEqual(mapCityToTerritory('Vizag', 'AP'), 'UA');
assert.strictEqual(mapCityToTerritory('Bhimavaram', 'Andhra Pradesh'), 'WEST');
assert.strictEqual(mapCityToTerritory('Ongole', 'Andhra Pradesh'), 'UNKNOWN');
assert.strictEqual(mapCityToTerritory('Chennai', 'Tamil Nadu'), 'TAMIL_NADU');
assert.strictEqual(mapCityToTerritory('Kochi', 'Kerala'), 'KERALA');
assert.strictEqual(mapCityToTerritory('Mumbai', 'Maharashtra'), 'NORTH_INDIA');
assert.strictEqual(mapCityToTerritory('Chicago', 'USA'), 'OVERSEAS');
assert.strictEqual(mapCityToTerritory('FakeCity', 'Andhra Pradesh'), 'UNKNOWN');
assert.strictEqual(mapCityToTerritory(null, null), 'UNKNOWN');

console.log('All tests passed successfully!');
