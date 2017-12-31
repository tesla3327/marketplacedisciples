#!/usr/bin/env node

const nunjucks = require('nunjucks');
const path = require('path');
const fs = require('fs');

const OUTPUT = 'dist/'
const SOURCE = 'src/';
const OPTIONS = {};
const INTERVIEWS = 'src/interviews/';
const PROCESS = process.cwd() + '/';
const INTERVIEW_TEMPLATE = 'components/interview_template.html';

const globalContext = require(__dirname + '/../src/globalContext.json');
globalContext.resources = require(__dirname + '/../src/resources.json');
globalContext.resourceCategories = Object.keys(globalContext.resources);

// Render just the index for now
nunjucks.configure(SOURCE, OPTIONS);

const getFilesOfType = (directory, extension) => {
  return fs.readdirSync(directory)
    .filter(file => file.endsWith(extension));
};

/**
 * Render a single file into the output directory
 */
const renderPage = filename => {
  // Hard code CSS path for now
  const data = nunjucks.render(filename, {
    global: globalContext,
    pathToRoot: './',
  });
  fs.writeFileSync(path.resolve(PROCESS + OUTPUT + filename), data);
};

const buildPages = () => {
  const pages = getFilesOfType(path.resolve(PROCESS + SOURCE), '.html');
  pages.forEach(renderPage);
};

const renderInterview = (interview) => {
  console.log(interview.url);
  const data = nunjucks.render(
    INTERVIEW_TEMPLATE,
    Object.assign(
      {},
      {
        pathToRoot: '../',
        interview,
        global: globalContext,
      }
    )
  );
  const outputPath = path.resolve(PROCESS + OUTPUT + interview.url);

  fs.writeFileSync(outputPath, data);
};

const buildInterviews = () => {
  const interviewPaths = getFilesOfType(path.resolve(PROCESS + INTERVIEWS), '.json');
  const interviewList = [];

  // Grab each interview, using the filename as the id
  interviewPaths.forEach(filename => {
    const interviewData = JSON.parse(fs.readFileSync(path.resolve(PROCESS + INTERVIEWS + filename), 'utf8'));

    interviewData.id = filename.split('.')[0];

    if (interviewData.name) {
      interviewData.firstname = interviewData.name.split(' ')[0];
    }

    interviewList.push(interviewData);
  });

  // Add interviews to global context
  globalContext.interviews = {};
  interviewList.forEach(elem => {
    globalContext.interviews[elem.id] = elem;
  });

  globalContext.latest = globalContext.interviewOrder.slice(0,3);

  // Create the directory for output if we need to
  const interviewOutputDir = path.resolve(PROCESS + OUTPUT + '/interviews');
  if (!fs.existsSync(interviewOutputDir)) {
    fs.mkdirSync(interviewOutputDir);
  }

  // Render each interview to file
  interviewList.forEach(renderInterview);
};

const buildWebsite = () => {
	buildInterviews();
  buildPages();
};

buildWebsite();
