import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const outputDirectory = join(process.cwd(), 'out');
const requiredFiles = [
  'index.html',
  'en/index.html',
  'en/tools/index.html',
  'en/pricing/index.html',
  'en/privacy/index.html',
  'en/security/index.html',
  'en/source/index.html',
  'llms.txt',
  'manifest.webmanifest',
  'robots.txt',
  'sitemap.xml',
];

const failures = [];

for (const relativePath of requiredFiles) {
  if (!existsSync(join(outputDirectory, relativePath))) {
    failures.push(`Missing exported file: ${relativePath}`);
  }
}

for (const relativePath of [
  'en/tools/pdf-to-svg/index.html',
  'en/tools/vector-extractor/index.html',
]) {
  if (existsSync(join(outputDirectory, relativePath))) {
    failures.push(`Disabled tool was exported: ${relativePath}`);
  }
}

if (existsSync(join(outputDirectory, 'robots.txt'))) {
  const robots = readFileSync(join(outputDirectory, 'robots.txt'), 'utf8');
  const betaMode = process.env.NEXT_PUBLIC_BETA_MODE !== 'false';
  if (betaMode && !/^Disallow: \/$/m.test(robots)) {
    failures.push('Beta export does not globally disallow crawlers.');
  }
}

for (const relativePath of ['en/index.html', 'en/pricing/index.html', 'en/privacy/index.html']) {
  const absolutePath = join(outputDirectory, relativePath);
  if (!existsSync(absolutePath)) continue;
  const html = readFileSync(absolutePath, 'utf8');
  if (!html.includes('NoStressPDF')) {
    failures.push(`${relativePath} does not contain the current brand.`);
  }
  if (/HushPDF/i.test(html)) {
    failures.push(`${relativePath} contains an obsolete public brand.`);
  }
}

if (failures.length > 0) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log(`Static export smoke check passed (${requiredFiles.length} required files).`);
