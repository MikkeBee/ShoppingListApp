#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * SCSS Variable Validation Script
 * Checks if all SCSS variables used in components are defined
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

// Extract variables from variables.scss
function getDefinedVariables() {
  const variablesPath = path.join(__dirname, '../styles/variables.scss');
  const content = fs.readFileSync(variablesPath, 'utf8');
  const variableRegex = /\$([a-zA-Z0-9-_]+):/g;
  const variables = new Set();

  let match;
  while ((match = variableRegex.exec(content)) !== null) {
    variables.add(match[1]);
  }

  return variables;
}

// Find used variables in SCSS files
function getUsedVariables() {
  const scssFiles = glob.sync('**/*.scss', {
    cwd: path.join(__dirname, '..'),
    ignore: ['node_modules/**', 'styles/variables.scss'],
  });

  const usedVariables = new Map(); // variable -> [files using it]
  const variableRegex = /\$([a-zA-Z0-9-_]+)/g;

  scssFiles.forEach(file => {
    const content = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
    let match;

    while ((match = variableRegex.exec(content)) !== null) {
      const variable = match[1];
      if (!usedVariables.has(variable)) {
        usedVariables.set(variable, []);
      }
      usedVariables.get(variable).push(file);
    }
  });

  return usedVariables;
}

// Main validation
function validateVariables() {
  console.log('🔍 Validating SCSS variables...\n');

  const defined = getDefinedVariables();
  const used = getUsedVariables();

  const undefined = [];

  used.forEach((files, variable) => {
    if (!defined.has(variable)) {
      undefined.push({ variable, files });
    }
  });

  if (undefined.length === 0) {
    console.log('✅ All SCSS variables are properly defined!');
    console.log(`📊 Found ${defined.size} defined variables`);
    console.log(`📊 Found ${used.size} used variables`);
  } else {
    console.log('❌ Undefined variables found:\n');
    undefined.forEach(({ variable, files }) => {
      console.log(`🔴 $${variable}`);
      files.forEach(file => console.log(`   📁 ${file}`));
      console.log();
    });

    console.log('💡 Add these to styles/variables.scss:');
    undefined.forEach(({ variable }) => {
      console.log(`$${variable}: /* define value */;`);
    });
  }

  return undefined.length === 0;
}

// Run if called directly
if (require.main === module) {
  const success = validateVariables();
  process.exit(success ? 0 : 1);
}

module.exports = { validateVariables };
