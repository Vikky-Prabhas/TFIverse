import { calculateOccupancy, calculateTrend, calculateBookingVelocity, normalizeDataState, calculateContribution } from '../../../lib/api/box-office/utils';

describe('Box Office Utils', () => {

  describe('calculateOccupancy', () => {
    it('calculates correct occupancy', () => {
      expect(calculateOccupancy(50, 100)).toBe(50);
      expect(calculateOccupancy(75, 100)).toBe(75);
    });

    it('returns null for 0 capacity', () => {
      expect(calculateOccupancy(10, 0)).toBeNull();
    });

    it('returns null for missing data', () => {
      expect(calculateOccupancy(null, 100)).toBeNull();
      expect(calculateOccupancy(50, null)).toBeNull();
    });

    it('caps occupancy at 100%', () => {
      expect(calculateOccupancy(110, 100)).toBe(100);
    });

    it('floors occupancy at 0%', () => {
      expect(calculateOccupancy(-10, 100)).toBe(0);
    });
  });

  describe('calculateTrend', () => {
    it('calculates correct positive trend', () => {
      expect(calculateTrend(150, 100)).toBe(50);
    });

    it('calculates correct negative trend', () => {
      expect(calculateTrend(50, 100)).toBe(-50);
    });

    it('returns null if previous value is 0', () => {
      expect(calculateTrend(100, 0)).toBeNull(); // Avoids Infinity
    });

    it('returns null for missing data', () => {
      expect(calculateTrend(null, 100)).toBeNull();
      expect(calculateTrend(100, null)).toBeNull();
    });
  });

  describe('calculateBookingVelocity', () => {
    it('calculates velocity identically to trend', () => {
      expect(calculateBookingVelocity(120, 100)).toBe(20);
      expect(calculateBookingVelocity(100, 0)).toBeNull();
    });
  });

  describe('normalizeDataState', () => {
    it('passes through valid states', () => {
      expect(normalizeDataState('LIVE')).toBe('LIVE');
      expect(normalizeDataState('ESTIMATED')).toBe('ESTIMATED');
    });

    it('normalizes case', () => {
      expect(normalizeDataState('live')).toBe('LIVE');
    });

    it('returns UNKNOWN for invalid states', () => {
      expect(normalizeDataState('FAKE_STATE')).toBe('UNKNOWN');
      expect(normalizeDataState('')).toBe('UNKNOWN');
      expect(normalizeDataState(null)).toBe('UNKNOWN');
    });
  });

  describe('calculateContribution', () => {
    it('calculates percentage contribution correctly', () => {
      expect(calculateContribution(25, 100)).toBe(25);
    });

    it('returns null if total is 0', () => {
      expect(calculateContribution(10, 0)).toBeNull();
    });
  });
});
