import test from 'node:test';
import assert from 'node:assert/strict';

import {
  AU_METERS,
  C,
  G0,
  LIGHT_YEAR_METERS,
  calculateTrajectory,
  convertAccelerationToMps2,
  convertDistanceToMeters,
  formatDuration,
  formatVelocity,
  sampleTrajectory,
} from '../js/calculator.js';

test('converts supported distance units to meters', () => {
  assert.equal(convertDistanceToMeters(1, 'km'), 1_000);
  assert.equal(convertDistanceToMeters(1, 'million-km'), 1_000_000_000);
  assert.equal(convertDistanceToMeters(1, 'au'), AU_METERS);
  assert.equal(convertDistanceToMeters(1, 'light-second'), C);
  assert.equal(convertDistanceToMeters(1, 'light-minute'), C * 60);
  assert.equal(convertDistanceToMeters(1, 'light-hour'), C * 3_600);
  assert.equal(convertDistanceToMeters(1, 'light-year'), LIGHT_YEAR_METERS);
});

test('converts acceleration units to meters per second squared', () => {
  assert.equal(convertAccelerationToMps2(1, 'mps2'), 1);
  assert.equal(convertAccelerationToMps2(1, 'g'), G0);
});

test('calculates a symmetric one-au one-g flip-and-burn trajectory', () => {
  const result = calculateTrajectory({ distanceMeters: AU_METERS, accelerationMps2: G0 });

  assert.ok(result.observerTimeSeconds > 0);
  assert.ok(result.shipTimeSeconds > 0);
  assert.ok(result.observerTimeSeconds >= result.shipTimeSeconds);
  assert.ok(result.peakVelocityMps > 0);
  assert.ok(result.peakVelocityMps < C);
  assert.equal(result.flipDistanceMeters, AU_METERS / 2);
  assert.equal(result.flipObserverTimeSeconds, result.observerTimeSeconds / 2);
  assert.equal(result.flipShipTimeSeconds, result.shipTimeSeconds / 2);
});

test('approaches the Newtonian solution for a short, slow journey', () => {
  const result = calculateTrajectory({ distanceMeters: 1_000, accelerationMps2: 1 });
  const fractionalDifference = Math.abs(result.observerTimeSeconds - result.newtonianTimeSeconds)
    / result.newtonianTimeSeconds;

  assert.ok(fractionalDifference < 1e-9);
});

test('samples trajectory endpoints and midpoint correctly', () => {
  const result = calculateTrajectory({ distanceMeters: AU_METERS, accelerationMps2: G0 });
  const samples = sampleTrajectory(result, 41);
  const start = samples[0];
  const midpoint = samples[20];
  const end = samples[40];

  assert.equal(start.timeSeconds, 0);
  assert.equal(start.distanceMeters, 0);
  assert.equal(start.velocityMps, 0);
  assert.ok(Math.abs(midpoint.distanceMeters - AU_METERS / 2) < 0.1);
  assert.ok(Math.abs(midpoint.velocityMps - result.peakVelocityMps) < 0.1);
  assert.ok(Math.abs(end.timeSeconds - result.observerTimeSeconds) < 1e-9);
  assert.ok(Math.abs(end.distanceMeters - AU_METERS) < 0.1);
  assert.ok(Math.abs(end.velocityMps) < 0.1);
});

test('rejects non-positive and non-finite inputs', () => {
  for (const input of [
    { distanceMeters: 0, accelerationMps2: G0 },
    { distanceMeters: -1, accelerationMps2: G0 },
    { distanceMeters: AU_METERS, accelerationMps2: 0 },
    { distanceMeters: AU_METERS, accelerationMps2: Number.NaN },
  ]) {
    assert.throws(() => calculateTrajectory(input), /greater than zero/);
  }
});

test('formats compact durations and velocities for display', () => {
  assert.equal(formatDuration(65), '1 min 5 sec');
  assert.match(formatDuration(3_600 * 24 * 400), /year/);
  assert.equal(formatVelocity(500), '500 m/s');
  assert.equal(formatVelocity(12_345), '12.35 km/s');
});
