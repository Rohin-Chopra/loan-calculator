import { execSync } from 'child_process';
import { mkdirSync, existsSync, writeFileSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const distDir = join(rootDir, 'dist');
const packageDir = join(rootDir, 'packages');

const functions = ['create-loan', 'get-loan', 'list-loans', 'update-loan', 'delete-loan'];

// Ensure packages directory exists
if (!existsSync(packageDir)) {
  mkdirSync(packageDir, { recursive: true });
}

console.log('Packaging Lambda functions...\n');

// Read package.json to get dependencies
const packageJson = JSON.parse(readFileSync(join(rootDir, 'package.json'), 'utf-8'));
const dependencies = packageJson.dependencies || {};

for (const func of functions) {
  console.log(`Packaging ${func}...`);
  
  const funcDistFile = join(distDir, 'functions', `${func}.js`);
  const funcPackageDir = join(packageDir, func);
  
  // Create function package directory
  if (!existsSync(funcPackageDir)) {
    mkdirSync(funcPackageDir, { recursive: true });
  }
  
  // Copy compiled JS file
  const funcFile = join(funcPackageDir, 'index.js');
  const compiledCode = readFileSync(funcDistFile, 'utf-8');
  writeFileSync(funcFile, compiledCode);
  
  // Create package.json with only runtime dependencies
  const funcPackageJson = {
    name: func,
    version: '1.0.0',
    main: 'index.js',
    dependencies: dependencies,
  };
  writeFileSync(
    join(funcPackageDir, 'package.json'),
    JSON.stringify(funcPackageJson, null, 2)
  );
  
  // Install production dependencies
  console.log(`  Installing dependencies for ${func}...`);
  execSync('npm install --production --no-save', {
    cwd: funcPackageDir,
    stdio: 'inherit',
  });
  
  // Create zip file
  const zipFile = join(packageDir, `${func}.zip`);
  console.log(`  Creating ${func}.zip...`);
  execSync(`cd ${funcPackageDir} && zip -r ${zipFile} . -x "*.zip" "node_modules/.bin/*" "*.log" "*.map"`, {
    stdio: 'inherit',
  });
  
  console.log(`✓ ${func} packaged\n`);
}

console.log('All functions packaged successfully!');
