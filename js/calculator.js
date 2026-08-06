export const C = 299_792_458;
export const G0 = 9.80665;
export const AU_METERS = 149_597_870_700;
export const LIGHT_YEAR_METERS = 9_460_730_472_580_800;

const DISTANCE_FACTORS = Object.freeze({
  km: 1_000,
  'million-km': 1_000_000_000,
  au: AU_METERS,
  'light-second': C,
  'light-minute': C * 60,
  'light-hour': C * 3_600,
  'light-year': LIGHT_YEAR_METERS,
});

const ACCELERATION_FACTORS = Object.freeze({
  mps2: 1,
  g: G0,
});

function requirePositiveFinite(value, label) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${label} must be a finite number greater than zero.`);
  }
  return value;
}

export function convertDistanceToMeters(value, unit) {
  requirePositiveFinite(value, 'Distance');
  const factor = DISTANCE_FACTORS[unit];
  if (!factor) {
    throw new RangeError(`Unsupported distance unit: ${unit}`);
  }
  return value * factor;
}

export function convertAccelerationToMps2(value, unit) {
  requirePositiveFinite(value, 'Acceleration');
  const factor = ACCELERATION_FACTORS[unit];
  if (!factor) {
    throw new RangeError(`Unsupported acceleration unit: ${unit}`);
  }
  return value * factor;
}

/**
 * Calculate an idealized symmetric flip-and-burn trajectory.
 * The ship begins and ends at rest in the observer frame and maintains
 * constant proper acceleration during each half of the journey.
 */
export function calculateTrajectory({ distanceMeters, accelerationMps2 }) {
  const distance = requirePositiveFinite(distanceMeters, 'Distance');
  const acceleration = requirePositiveFinite(accelerationMps2, 'Acceleration');

  const q = (acceleration * distance) / (2 * C * C);
  const rapidityAtFlip = 2 * Math.asinh(Math.sqrt(q / 2));
  const observerTimeSeconds = 2 * Math.sqrt(
    distance / acceleration + (distance * distance) / (4 * C * C),
  );
  const shipTimeSeconds = (2 * C * rapidityAtFlip) / acceleration;
  const betaAtFlip = Math.sqrt(q * (2 + q)) / (1 + q);
  const peakVelocityMps = C * betaAtFlip;
  const newtonianTimeSeconds = 2 * Math.sqrt(distance / acceleration);
  const newtonianPeakVelocityMps = Math.sqrt(acceleration * distance);
  const lorentzFactorAtFlip = 1 + q;
  const relativisticTimeDifferencePercent = (
    (observerTimeSeconds - newtonianTimeSeconds) / newtonianTimeSeconds
  ) * 100;

  return Object.freeze({
    distanceMeters: distance,
    accelerationMps2: acceleration,
    observerTimeSeconds,
    shipTimeSeconds,
    flipObserverTimeSeconds: observerTimeSeconds / 2,
    flipShipTimeSeconds: shipTimeSeconds / 2,
    flipDistanceMeters: distance / 2,
    peakVelocityMps,
    peakVelocityFractionC: betaAtFlip,
    lorentzFactorAtFlip,
    newtonianTimeSeconds,
    newtonianPeakVelocityMps,
    relativisticTimeDifferencePercent,
  });
}

function acceleratedPosition(timeSeconds, accelerationMps2) {
  const ratio = (accelerationMps2 * timeSeconds) / C;
  const denominator = Math.sqrt(1 + ratio * ratio) + 1;
  return (accelerationMps2 * timeSeconds * timeSeconds) / denominator;
}

function acceleratedVelocity(timeSeconds, accelerationMps2) {
  const at = accelerationMps2 * timeSeconds;
  return at / Math.sqrt(1 + (at * at) / (C * C));
}

export function sampleTrajectory(result, sampleCount = 81) {
  if (!result || !Number.isFinite(result.observerTimeSeconds)) {
    throw new TypeError('A valid trajectory result is required.');
  }
  if (!Number.isInteger(sampleCount) || sampleCount < 3) {
    throw new RangeError('Sample count must be an integer of at least 3.');
  }

  const samples = [];
  const total = result.observerTimeSeconds;
  const half = result.flipObserverTimeSeconds;

  for (let index = 0; index < sampleCount; index += 1) {
    const progress = index / (sampleCount - 1);
    const timeSeconds = total * progress;
    const phaseTime = timeSeconds <= half ? timeSeconds : total - timeSeconds;
    const phaseDistance = acceleratedPosition(phaseTime, result.accelerationMps2);
    const distanceMeters = timeSeconds <= half
      ? phaseDistance
      : result.distanceMeters - phaseDistance;
    const velocityMps = acceleratedVelocity(phaseTime, result.accelerationMps2);

    samples.push({
      progress,
      timeSeconds,
      distanceMeters,
      velocityMps,
    });
  }

  return samples;
}

function plural(value, singular) {
  return `${value} ${singular}${value === 1 ? '' : 's'}`;
}

export function formatDuration(totalSeconds) {
  requirePositiveFinite(totalSeconds, 'Duration');
  let seconds = Math.round(totalSeconds);
  const yearSeconds = 365.25 * 24 * 3_600;
  const units = [
    ['year', yearSeconds],
    ['day', 24 * 3_600],
    ['hour', 3_600],
    ['min', 60],
    ['sec', 1],
  ];
  const parts = [];

  for (const [label, size] of units) {
    if (parts.length === 2) break;
    const amount = Math.floor(seconds / size);
    if (amount > 0 || (label === 'sec' && parts.length === 0)) {
      parts.push(['min', 'sec'].includes(label) ? `${amount} ${label}` : plural(amount, label));
      seconds -= amount * size;
    }
  }

  return parts.join(' ');
}

export function formatVelocity(metersPerSecond) {
  if (!Number.isFinite(metersPerSecond) || metersPerSecond < 0) {
    throw new RangeError('Velocity must be a finite number equal to or greater than zero.');
  }
  if (metersPerSecond < 1_000) {
    return `${Math.round(metersPerSecond).toLocaleString('en-US')} m/s`;
  }
  if (metersPerSecond < 1_000_000) {
    return `${(metersPerSecond / 1_000).toLocaleString('en-US', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 0,
    })} km/s`;
  }
  return `${(metersPerSecond / 1_000).toLocaleString('en-US', {
    maximumFractionDigits: 0,
  })} km/s`;
}

export function formatDistance(meters) {
  requirePositiveFinite(meters, 'Distance');
  if (meters >= LIGHT_YEAR_METERS * 0.1) {
    return `${(meters / LIGHT_YEAR_METERS).toLocaleString('en-US', {
      maximumFractionDigits: 4,
    })} ly`;
  }
  if (meters >= AU_METERS * 0.05) {
    return `${(meters / AU_METERS).toLocaleString('en-US', {
      maximumFractionDigits: 4,
    })} au`;
  }
  if (meters >= 1_000_000_000) {
    return `${(meters / 1_000_000_000).toLocaleString('en-US', {
      maximumFractionDigits: 3,
    })} million km`;
  }
  return `${(meters / 1_000).toLocaleString('en-US', {
    maximumFractionDigits: 0,
  })} km`;
}
