// Please make sure you have configured services to nest-cli.json before building.
// Must be executed at project root (Same folder with .json configuration files)
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const nestConfig = JSON.parse(
  fs.readFileSync(path.join(rootDir, 'nest-cli.json'), 'utf8'),
);

const applications = Object.entries(nestConfig.projects || {})
  .filter(([, project]) => project.type === 'application')
  .map(([name]) => name);

const targets = process.argv.slice(2);
const appsToBuild = targets.length ? targets : applications;
const invalid = appsToBuild.filter((name) => !applications.includes(name));

if (invalid.length) {
  console.error(`Unknown application: ${invalid.join(', ')}`);
  console.error(`Available applications: ${applications.join(', ')}`);
  process.exit(1);
}

for (const appName of appsToBuild) {
  console.log(`Building ${appName}...`);

  try {
    execSync(`npx nest build ${appName}`, {
      cwd: rootDir,
      stdio: 'inherit',
    });
  } catch {
    console.error(`Failed to build ${appName}`);
    process.exit(1);
  }
}

console.log(`Built: ${appsToBuild.join(', ')}`);
