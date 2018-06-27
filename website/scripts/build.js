#!/usr/bin/env node

const nunjucks = require('nunjucks');
const path = require('path');
const fs = require('fs');

const OUTPUT = 'dist/'
const SOURCE = 'src/';
const OPTIONS = {};
const POSTS = 'src/posts/';
const PROCESS = process.cwd() + '/';
const POST_TEMPLATE = 'components/interview_template.html';

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

const renderPost = (post) => {
  console.log(post.url);
  const data = nunjucks.render(
    POST_TEMPLATE,
    Object.assign(
      {},
      {
        pathToRoot: '../',
        post,
        global: globalContext,
      }
    )
  );
  const outputPath = path.resolve(PROCESS + OUTPUT + post.url);

  fs.writeFileSync(outputPath, data);
};

const buildPosts = () => {
  const postPaths = getFilesOfType(path.resolve(PROCESS + POSTS), '.json');
  const postList = [];

  // Grab each post, using the filename as the id
  postPaths.forEach(filename => {
    const postData = JSON.parse(fs.readFileSync(path.resolve(PROCESS + POSTS + filename), 'utf8'));

    postData.id = filename.split('.')[0];

    if (postData.name) {
      postData.firstname = postData.name.split(' ')[0];
    }

    postList.push(postData);
  });

  // Add posts to global context
  globalContext.posts = {};
  postList.forEach(elem => {
    globalContext.posts[elem.id] = elem;
  });

  globalContext.latest = globalContext.postOrder.slice(0,6);

  // Create the directory for output if we need to
  const postOutputDir = path.resolve(PROCESS + OUTPUT + '/posts');
  if (!fs.existsSync(postOutputDir)) {
    fs.mkdirSync(postOutputDir);
  }

  // Render each post to file
  postList.forEach(renderPost);
};

// Let's go!
buildPosts(); // Needs to be done first as pages use post data
buildPages();
