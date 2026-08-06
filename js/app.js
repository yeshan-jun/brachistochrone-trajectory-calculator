import {
  calculateTrajectory,
  convertAccelerationToMps2,
  convertDistanceToMeters,
  formatDistance,
  formatDuration,
  formatVelocity,
  sampleTrajectory,
} from './calculator.js';
import { PLANETS, findPlanet, getPresetDistanceAu } from './presets.js';

const elements = {
  form: document.querySelector('#trajectory-form'),
  modeInputs: [...document.querySelectorAll('input[name="mode"]')],
  planetFields: document.querySelector('#planet-fields'),
  customFields: document.querySelector('#custom-fields'),
  origin: document.querySelector('#origin'),
  destination: document.querySelector('#destination'),
  presetDistance: document.querySelector('#preset-distance'),
  distance: document.querySelector('#distance'),
  distanceUnit: document.querySelector('#distance-unit'),
  acceleration: document.querySelector('#acceleration'),
  accelerationUnit: document.querySelector('#acceleration-unit'),
  accelerationPresets: [...document.querySelectorAll('[data-acceleration]')],
  error: document.querySelector('#form-error'),
  resultState: document.querySelector('#result-state'),
  observerTime: document.querySelector('#observer-time'),
  shipTime: document.querySelector('#ship-time'),
  flipTime: document.querySelector('#flip-time'),
  peakVelocity: document.querySelector('#peak-velocity'),
  peakLightSpeed: document.querySelector('#peak-light-speed'),
  flipDistance: document.querySelector('#flip-distance'),
  routeLabel: document.querySelector('#route-label'),
  modelTitle: document.querySelector('#model-title'),
  modelDetail: document.querySelector('#model-detail'),
  relativisticDifference: document.querySelector('#relativistic-difference'),
  copyResult: document.querySelector('#copy-result'),
  copyLink: document.querySelector('#copy-link'),
  distanceChart: document.querySelector('#distance-chart'),
  velocityChart: document.querySelector('#velocity-chart'),
  copyrightYear: document.querySelector('#copyright-year'),
};

let latestSummary = '';
let feedbackTimer = null;

function fillPlanetOptions() {
  const options = PLANETS.map((planet) => `<option value="${planet.id}">${planet.name}</option>`).join('');
  elements.origin.innerHTML = options;
  elements.destination.innerHTML = options;
  elements.origin.value = 'earth';
  elements.destination.value = 'mars';
}

function selectedMode() {
  return elements.modeInputs.find((input) => input.checked)?.value ?? 'planet';
}

function setMode(mode) {
  const safeMode = mode === 'custom' ? 'custom' : 'planet';
  for (const input of elements.modeInputs) {
    input.checked = input.value === safeMode;
  }
  elements.planetFields.hidden = safeMode !== 'planet';
  elements.customFields.hidden = safeMode !== 'custom';
}

function updatePresetDistance() {
  try {
    const distanceAu = getPresetDistanceAu(elements.origin.value, elements.destination.value);
    elements.presetDistance.textContent = `${distanceAu.toLocaleString('en-US', {
      maximumFractionDigits: 4,
    })} au`;
    elements.error.textContent = '';
  } catch (error) {
    elements.presetDistance.textContent = 'Choose two planets';
  }
}

function updateAccelerationPresetState() {
  const unit = elements.accelerationUnit.value;
  const value = Number(elements.acceleration.value);
  for (const button of elements.accelerationPresets) {
    const presetValue = Number(button.dataset.acceleration);
    button.classList.toggle('active', unit === 'g' && Math.abs(value - presetValue) < 1e-9);
  }
}

function readJourneyInput() {
  const mode = selectedMode();
  let distanceMeters;
  let routeName;
  let modelTitle;

  if (mode === 'planet') {
    const distanceAu = getPresetDistanceAu(elements.origin.value, elements.destination.value);
    distanceMeters = convertDistanceToMeters(distanceAu, 'au');
    const origin = findPlanet(elements.origin.value);
    const destination = findPlanet(elements.destination.value);
    routeName = `${origin.name} → ${destination.name}`;
    modelTitle = 'Orbital-radius estimate';
  } else {
    const value = Number(elements.distance.value);
    distanceMeters = convertDistanceToMeters(value, elements.distanceUnit.value);
    routeName = 'Custom route';
    modelTitle = 'Custom straight-line distance';
  }

  const accelerationValue = Number(elements.acceleration.value);
  const accelerationMps2 = convertAccelerationToMps2(
    accelerationValue,
    elements.accelerationUnit.value,
  );

  return {
    mode,
    distanceMeters,
    routeName,
    modelTitle,
    accelerationValue,
    accelerationUnit: elements.accelerationUnit.value,
  };
}

function accelerationLabel(value, unit) {
  return unit === 'g'
    ? `${Number(value).toLocaleString('en-US', { maximumFractionDigits: 3 })}g`
    : `${Number(value).toLocaleString('en-US', { maximumFractionDigits: 3 })} m/s²`;
}

function formatPercent(value, maximumFractionDigits = 4) {
  return value.toLocaleString('en-US', {
    maximumFractionDigits,
    minimumFractionDigits: 0,
  });
}

function svgChart(samples, valueAccessor, maximum, label, strokeClass) {
  const width = 600;
  const height = 240;
  const left = 52;
  const right = 16;
  const top = 18;
  const bottom = 34;
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  const safeMaximum = maximum > 0 ? maximum : 1;
  const points = samples.map((sample) => {
    const x = left + sample.progress * plotWidth;
    const y = top + plotHeight - (valueAccessor(sample) / safeMaximum) * plotHeight;
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  }).join(' ');
  const horizontalLines = [0, 0.5, 1].map((ratio) => {
    const y = top + plotHeight - ratio * plotHeight;
    return `<line class="chart-grid-line" x1="${left}" y1="${y}" x2="${width - right}" y2="${y}" />`;
  }).join('');
  const midpointX = left + plotWidth / 2;

  return `
    <style>
      .chart-grid-line{stroke:rgba(159,176,201,.13);stroke-width:1}
      .chart-axis{stroke:rgba(159,176,201,.32);stroke-width:1}
      .chart-midpoint{stroke:#67e8c7;stroke-width:1.2;stroke-dasharray:5 6;opacity:.8}
      .chart-line{fill:none;stroke:${strokeClass};stroke-width:4;stroke-linecap:round;stroke-linejoin:round}
      .chart-label{fill:#9fb0c9;font:12px system-ui,sans-serif}
      .chart-value{fill:#c4d1e4;font:11px system-ui,sans-serif}
    </style>
    ${horizontalLines}
    <line class="chart-axis" x1="${left}" y1="${top + plotHeight}" x2="${width - right}" y2="${top + plotHeight}" />
    <line class="chart-midpoint" x1="${midpointX}" y1="${top}" x2="${midpointX}" y2="${top + plotHeight}" />
    <polyline class="chart-line" points="${points}" />
    <text class="chart-label" x="${left}" y="${height - 8}">Departure</text>
    <text class="chart-label" x="${midpointX}" y="${height - 8}" text-anchor="middle">Flip</text>
    <text class="chart-label" x="${width - right}" y="${height - 8}" text-anchor="end">Arrival</text>
    <text class="chart-value" x="${left - 8}" y="${top + 4}" text-anchor="end">${label}</text>
  `;
}

function renderCharts(result) {
  const samples = sampleTrajectory(result, 101);
  elements.distanceChart.innerHTML = svgChart(
    samples,
    (sample) => sample.distanceMeters,
    result.distanceMeters,
    '100%',
    '#67e8c7',
  );
  elements.velocityChart.innerHTML = svgChart(
    samples,
    (sample) => sample.velocityMps,
    result.peakVelocityMps,
    'Peak',
    '#74a8ff',
  );
}

function buildSummary(input, result) {
  return [
    'Brachistochrone Flip-and-Burn Journey',
    `Route: ${input.routeName}`,
    `Distance: ${formatDistance(result.distanceMeters)}`,
    `Acceleration: ${accelerationLabel(input.accelerationValue, input.accelerationUnit)}`,
    `Observer time: ${formatDuration(result.observerTimeSeconds)}`,
    `Ship time: ${formatDuration(result.shipTimeSeconds)}`,
    `Flip after: ${formatDuration(result.flipObserverTimeSeconds)}`,
    `Flip point: ${formatDistance(result.flipDistanceMeters)}`,
    `Peak velocity: ${formatVelocity(result.peakVelocityMps)}`,
    `Peak velocity: ${formatPercent(result.peakVelocityFractionC * 100, 5)}% of light speed`,
    'Profile: accelerate halfway, flip, then decelerate.',
  ].join('\n');
}

function updateUrl() {
  const params = new URLSearchParams();
  const mode = selectedMode();
  params.set('mode', mode);
  params.set('acceleration', elements.acceleration.value);
  params.set('accelerationUnit', elements.accelerationUnit.value);

  if (mode === 'planet') {
    params.set('origin', elements.origin.value);
    params.set('destination', elements.destination.value);
  } else {
    params.set('distance', elements.distance.value);
    params.set('distanceUnit', elements.distanceUnit.value);
  }

  const newUrl = `${window.location.pathname}?${params.toString()}`;
  window.history.replaceState({}, '', newUrl);
}

function calculateAndRender() {
  try {
    const input = readJourneyInput();
    const result = calculateTrajectory({
      distanceMeters: input.distanceMeters,
      accelerationMps2: convertAccelerationToMps2(
        input.accelerationValue,
        input.accelerationUnit,
      ),
    });

    elements.error.textContent = '';
    elements.resultState.textContent = 'Calculated';
    elements.observerTime.textContent = formatDuration(result.observerTimeSeconds);
    elements.shipTime.textContent = formatDuration(result.shipTimeSeconds);
    elements.flipTime.textContent = formatDuration(result.flipObserverTimeSeconds);
    elements.peakVelocity.textContent = formatVelocity(result.peakVelocityMps);
    elements.peakLightSpeed.textContent = `${formatPercent(result.peakVelocityFractionC * 100, 5)}% of light speed`;
    elements.flipDistance.textContent = formatDistance(result.flipDistanceMeters);
    elements.routeLabel.textContent = `${input.routeName} at ${accelerationLabel(input.accelerationValue, input.accelerationUnit)}`;
    elements.modelTitle.textContent = input.modelTitle;
    elements.modelDetail.textContent = `Distance used: ${formatDistance(result.distanceMeters)}. Accelerate halfway, flip, then decelerate.`;
    elements.relativisticDifference.textContent = `Relativistic correction: ${formatPercent(result.relativisticTimeDifferencePercent, 6)}%`;

    latestSummary = buildSummary(input, result);
    renderCharts(result);
    updateUrl();
  } catch (error) {
    elements.error.textContent = error instanceof Error ? error.message : 'Check the journey inputs.';
    elements.resultState.textContent = 'Check input';
  }
}

function temporaryButtonText(button, text) {
  const previous = button.textContent;
  button.textContent = text;
  clearTimeout(feedbackTimer);
  feedbackTimer = window.setTimeout(() => {
    button.textContent = previous;
  }, 1_700);
}

async function copyText(text, button) {
  try {
    await navigator.clipboard.writeText(text);
    temporaryButtonText(button, 'Copied');
  } catch {
    temporaryButtonText(button, 'Copy unavailable');
  }
}

function loadUrlState() {
  const params = new URLSearchParams(window.location.search);
  const mode = params.get('mode');
  setMode(mode);

  const origin = params.get('origin');
  const destination = params.get('destination');
  if (findPlanet(origin)) elements.origin.value = origin;
  if (findPlanet(destination)) elements.destination.value = destination;

  const distance = Number(params.get('distance'));
  if (Number.isFinite(distance) && distance > 0) elements.distance.value = String(distance);

  const supportedDistanceUnits = [...elements.distanceUnit.options].map((option) => option.value);
  const distanceUnit = params.get('distanceUnit');
  if (supportedDistanceUnits.includes(distanceUnit)) elements.distanceUnit.value = distanceUnit;

  const acceleration = Number(params.get('acceleration'));
  if (Number.isFinite(acceleration) && acceleration > 0) elements.acceleration.value = String(acceleration);

  const accelerationUnit = params.get('accelerationUnit');
  if (['g', 'mps2'].includes(accelerationUnit)) elements.accelerationUnit.value = accelerationUnit;
}

function bindEvents() {
  elements.form.addEventListener('submit', (event) => {
    event.preventDefault();
    calculateAndRender();
  });

  for (const input of elements.modeInputs) {
    input.addEventListener('change', () => {
      setMode(input.value);
      calculateAndRender();
    });
  }

  for (const element of [elements.origin, elements.destination]) {
    element.addEventListener('change', () => {
      updatePresetDistance();
      calculateAndRender();
    });
  }

  for (const element of [elements.distance, elements.distanceUnit]) {
    element.addEventListener('change', calculateAndRender);
  }

  elements.acceleration.addEventListener('input', updateAccelerationPresetState);
  elements.acceleration.addEventListener('change', calculateAndRender);
  elements.accelerationUnit.addEventListener('change', () => {
    updateAccelerationPresetState();
    calculateAndRender();
  });

  for (const button of elements.accelerationPresets) {
    button.addEventListener('click', () => {
      elements.acceleration.value = button.dataset.acceleration;
      elements.accelerationUnit.value = 'g';
      updateAccelerationPresetState();
      calculateAndRender();
    });
  }

  elements.copyResult.addEventListener('click', () => copyText(latestSummary, elements.copyResult));
  elements.copyLink.addEventListener('click', () => copyText(window.location.href, elements.copyLink));
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js', { scope: './' }).catch(() => {});
    });
  }
}

fillPlanetOptions();
loadUrlState();
updatePresetDistance();
updateAccelerationPresetState();
bindEvents();
calculateAndRender();
registerServiceWorker();
elements.copyrightYear.textContent = String(new Date().getFullYear());
