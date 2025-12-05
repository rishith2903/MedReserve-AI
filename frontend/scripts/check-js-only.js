#!/usr/bin/env node
/**
 * JavaScript-Only Enforcement Script
 * Checks for TypeScript files and configurations
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 JAVASCRIPT-ONLY PROJECT VALIDATION');
console.log('='.repeat(50));

let hasErrors = false;

// Check for TypeScript files in src directory
function checkForTypeScriptFiles(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  const tsFiles = [];

  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory() && !file.name.startsWith('.') && file.name !== 'node_modules') {
      tsFiles.push(...checkForTypeScriptFiles(fullPath));
    } else if (file.isFile() && (file.name.endsWith('.ts') || file.name.endsWith('.tsx'))) {
      tsFiles.push(fullPath);
    }
  }

  return tsFiles;
}

// Check for TypeScript configuration files
function checkForTSConfig() {
  const tsConfigFiles = [
    'tsconfig.json',
    'tsconfig.app.json',
    'tsconfig.node.json',
    'tsconfig.build.json'
  ];

  return tsConfigFiles.filter(file => fs.existsSync(file));
}

// Check for TypeScript dependencies in package.json
function checkForTSDependencies() {
  if (!fs.existsSync('package.json')) {
    return [];
  }

  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const allDeps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies
  };

  const tsDeps = Object.keys(allDeps).filter(dep => 
    dep === 'typescript' ||
    dep.startsWith('@types/') ||
    dep.includes('ts-loader') ||
    dep.includes('ts-node') ||
    dep === 'tslib'
  );

  return tsDeps;
}

// Main validation
console.log('\n1. Checking for TypeScript files in src/...');
const tsFiles = checkForTypeScriptFiles('src');
if (tsFiles.length > 0) {
  console.log('❌ TypeScript files found:');
  tsFiles.forEach(file => console.log(`   - ${file}`));
  hasErrors = true;
} else {
  console.log('✅ No TypeScript files found');
}

console.log('\n2. Checking for TypeScript configuration files...');
const tsConfigFiles = checkForTSConfig();
if (tsConfigFiles.length > 0) {
  console.log('❌ TypeScript config files found:');
  tsConfigFiles.forEach(file => console.log(`   - ${file}`));
  hasErrors = true;
} else {
  console.log('✅ No TypeScript config files found');
}

console.log('\n3. Checking for TypeScript dependencies...');
const tsDeps = checkForTSDependencies();
if (tsDeps.length > 0) {
  console.log('⚠️ TypeScript dependencies found (may be transitive):');
  tsDeps.forEach(dep => console.log(`   - ${dep}`));
  console.log('   Note: @types/* packages from dependencies are acceptable');
} else {
  console.log('✅ No explicit TypeScript dependencies found');
}

console.log('\n4. Checking file extensions...');
const jsFiles = checkForJSFiles('src');
console.log(`✅ Found ${jsFiles.js} .js files and ${jsFiles.jsx} .jsx files`);

function checkForJSFiles(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  let jsCount = 0;
  let jsxCount = 0;

  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory() && !file.name.startsWith('.')) {
      const subCounts = checkForJSFiles(fullPath);
      jsCount += subCounts.js;
      jsxCount += subCounts.jsx;
    } else if (file.isFile()) {
      if (file.name.endsWith('.js')) jsCount++;
      if (file.name.endsWith('.jsx')) jsxCount++;
    }
  }

  return { js: jsCount, jsx: jsxCount };
}

// Final result
console.log('\n' + '='.repeat(50));
if (hasErrors) {
  console.log('❌ VALIDATION FAILED');
  console.log('\n📝 TO FIX:');
  console.log('1. Rename .ts files to .js');
  console.log('2. Rename .tsx files to .jsx');
  console.log('3. Remove TypeScript syntax (types, interfaces, etc.)');
  console.log('4. Delete tsconfig.json files');
  console.log('5. Remove TypeScript dependencies from package.json');
  process.exit(1);
} else {
  console.log('✅ VALIDATION PASSED');
  console.log('🎉 Project is JavaScript-only compliant!');
}
