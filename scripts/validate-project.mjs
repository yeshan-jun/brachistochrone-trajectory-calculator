import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const failures = [];
const expectedCanonical = 'https://yeshan-jun.github.io/brachistochrone-trajectory-calculator/';

function fail(message) {
  failures.push(message);
}

function read(relativePath) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) {
    fail(`Missing required file: ${relativePath}`);
    return '';
  }
  return fs.readFileSync(fullPath, 'utf8');
}

function parseJson(relativePath) {
  const content = read(relativePath);
  if (!content) return null;
  try {
    return JSON.parse(content);
  } catch (error) {
    fail(`Invalid JSON in ${relativePath}: ${error.message}`);
    return null;
  }
}

const requiredFiles = [
  'index.html',
  'css/styles.css',
  'js/app.js',
  'js/calculator.js',
  'js/presets.js',
  'assets/icon.svg',
  'assets/favicon.svg',
  'assets/icon-192.png',
  'assets/icon-512.png',
  'assets/apple-touch-icon.png',
  'manifest.json',
  'sw.js',
  'robots.txt',
  'sitemap.xml',
  'README.md',
  'LICENSE',
  'repo.config.json',
  'package.json',
  'tests/calculator.test.js',
];

for (const relativePath of requiredFiles) {
  if (!fs.existsSync(path.join(root, relativePath))) {
    fail(`Missing required file: ${relativePath}`);
  }
}

const html = read('index.html');
const readme = read('README.md');
const serviceWorker = read('sw.js');
const manifest = parseJson('manifest.json');
const repoConfig = parseJson('repo.config.json');
parseJson('package.json');

const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
if (!titleMatch || !titleMatch[1].startsWith('Brachistochrone Trajectory Calculator')) {
  fail('Title must directly begin with the target keyword.');
}

const descriptionMatch = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i);
if (!descriptionMatch) {
  fail('Meta description is missing.');
} else if (/\b(cannot|may|might|perhaps|inaccurate|uncertain)\b/i.test(descriptionMatch[1])) {
  fail('Meta description contains uncertain or negative wording.');
}

if (!html.includes(`<link rel="canonical" href="${expectedCanonical}">`)) {
  fail('Canonical URL is missing or incorrect.');
}

for (let index = 1; index <= 9; index += 1) {
  if (!html.includes(`<!-- VARIABLE${index} -->`)) {
    fail(`Missing VARIABLE${index} comment.`);
  }
}
const variableMatches = html.match(/<!-- VARIABLE\d+ -->/g) ?? [];
if (variableMatches.length !== 9) {
  fail(`Expected exactly 9 VARIABLE comments, found ${variableMatches.length}.`);
}

const lastVariablePosition = html.indexOf('<!-- VARIABLE9 -->');
const headClosePosition = html.indexOf('</head>');
if (lastVariablePosition < 0 || headClosePosition < 0 || lastVariablePosition > headClosePosition) {
  fail('VARIABLE comments must appear above </head>.');
}

const githubAnchor = html.match(/<a[\s\S]*?href="https:\/\/github\.com\/yeshan-jun\/brachistochrone-trajectory-calculator"[\s\S]*?>/i)?.[0];
if (!githubAnchor || !/rel="nofollow"/i.test(githubAnchor)) {
  fail('Header GitHub link must use the expected URL and rel="nofollow".');
}

const footerMatch = html.match(/<footer>([\s\S]*?)<\/footer>/i);
if (!footerMatch || !/©/.test(footerMatch[1]) || /<a\b/i.test(footerMatch[1])) {
  fail('Footer must contain copyright only and no links.');
}

const requiredReadmeHeadings = [
  '## Project Introduction',
  '## What It Does',
  '## How To Use',
  '## Supported Formats',
  '## Technical Details',
  '## Project Structure',
  '## Deployment',
  '## Repository',
  '## Privacy',
  '## License',
  '## reference',
];
for (const heading of requiredReadmeHeadings) {
  if (!readme.includes(heading)) fail(`README is missing heading: ${heading}`);
}
const readmeWords = readme.replace(/```[\s\S]*?```/g, ' ').match(/[A-Za-z0-9][A-Za-z0-9’'/-]*/g)?.length ?? 0;
if (readmeWords < 600) {
  fail(`README must contain at least 600 words; found ${readmeWords}.`);
}

if (repoConfig) {
  const expectedKeys = [
    'repo_name', 'description', 'visibility', 'homepage', 'topics',
    'default_branch', 'create_readme', 'source_stack', 'pages_stack',
  ];
  if (JSON.stringify(Object.keys(repoConfig)) !== JSON.stringify(expectedKeys)) {
    fail('repo.config.json keys or key order do not match the required structure.');
  }
  if (repoConfig.repo_name !== 'brachistochrone-trajectory-calculator') fail('Incorrect repo_name.');
  if (repoConfig.visibility !== 'public') fail('visibility must be public.');
  if (repoConfig.homepage !== expectedCanonical) fail('Incorrect repo homepage.');
  if (repoConfig.default_branch !== 'main') fail('default_branch must be main.');
  if (repoConfig.create_readme !== false) fail('create_readme must be false.');
  if (!Array.isArray(repoConfig.topics) || repoConfig.topics.length < 3) fail('topics must contain project-specific entries.');
}

if (manifest) {
  if (manifest.start_url !== './' || manifest.scope !== './') fail('Manifest start_url and scope must both be ./.');
  for (const icon of manifest.icons ?? []) {
    const iconPath = icon.src.replace(/^\.\//, '');
    if (!fs.existsSync(path.join(root, iconPath))) fail(`Manifest icon does not exist: ${icon.src}`);
  }
}

function pngDimensions(relativePath) {
  const buffer = fs.readFileSync(path.join(root, relativePath));
  return [buffer.readUInt32BE(16), buffer.readUInt32BE(20)];
}
for (const [file, expected] of [
  ['assets/icon-192.png', 192],
  ['assets/icon-512.png', 512],
  ['assets/apple-touch-icon.png', 180],
]) {
  if (fs.existsSync(path.join(root, file))) {
    const [width, height] = pngDimensions(file);
    if (width !== expected || height !== expected) fail(`${file} must be ${expected}x${expected}; found ${width}x${height}.`);
  }
}

const appShellFiles = [
  './', './index.html', './css/styles.css', './js/app.js', './js/calculator.js',
  './js/presets.js', './manifest.json', './assets/icon.svg', './assets/favicon.svg',
  './assets/icon-192.png', './assets/icon-512.png', './assets/apple-touch-icon.png',
  './robots.txt', './sitemap.xml',
];
for (const asset of appShellFiles) {
  if (!serviceWorker.includes(`'${asset}'`)) fail(`Service worker cache list is missing ${asset}.`);
  if (asset !== './' && !fs.existsSync(path.join(root, asset.replace(/^\.\//, '')))) {
    fail(`Cached asset does not exist: ${asset}`);
  }
}
if (!serviceWorker.includes('const response = await fetch(request)')) {
  fail('Service worker must request the network before cache fallback.');
}
if (!serviceWorker.includes('await cache.match(request')) {
  fail('Service worker cache fallback is missing.');
}

const localReferences = [...html.matchAll(/(?:href|src)="(\.\/[^"?#]+)(?:[?#][^"]*)?"/g)].map((match) => match[1]);
for (const reference of new Set(localReferences)) {
  const relativePath = reference.replace(/^\.\//, '');
  if (!fs.existsSync(path.join(root, relativePath))) fail(`HTML references missing local file: ${reference}`);
}

if (failures.length > 0) {
  console.error(`Project validation failed with ${failures.length} issue(s):`);
  for (const message of failures) console.error(`- ${message}`);
  process.exit(1);
}

console.log(`Project validation passed. README word count: ${readmeWords}.`);
