#!/usr/bin/env node

const nunjucks = require('nunjucks');
const path = require('path');
const fs = require('fs');

const OUTPUT = 'dist/'
const SOURCE = 'src/';
const OPTIONS = {};
const PROCESS = process.cwd() + '/';

// Render just the index for now
nunjucks.configure(SOURCE, OPTIONS);

/**
 * Get a list of all HTML files we need to compile
 */
const getFilesToProcess = () => {
  return fs.readdirSync(path.resolve(PROCESS + SOURCE))
    .filter(file => file.endsWith('.html'));
};

/**
 * Render a single file into the output directory
 */
const renderFile = filename => {
  // Hard code CSS path for now
  const data = nunjucks.render(filename, { cssPath: 'css/main.css' });
  fs.writeFileSync(path.resolve(PROCESS + OUTPUT + filename), data);
};

const buildWebsite = () => {
  const files = getFilesToProcess();
  files.forEach(renderFile);
};

buildWebsite();
