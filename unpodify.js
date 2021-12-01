var {
  removeEmptyFolders,
  renameFile,
  getUnpodifiedState,
  walkPaths,
} = require('./helpers');
const fs = require('fs');

function handleTemplates() {
  for (const path of walkPaths('template.hbs')) {
    handleTemplate(path);
  }
}
function handleTemplate(path) {
  const unpodified = getUnpodifiedState(path);
  let parentFolder = 'templates/';
  if (unpodified.isComponent) {
    parentFolder = 'templates/components/';
  }
  const newPath = `${unpodified.basePath}${parentFolder}${unpodified.folderName}${unpodified.fileName}.hbs`;
  renameFile(path, newPath);
}

function handleFiles(parentFolder, fileName) {
  for (const path of walkPaths(fileName)) {
    handleFile(path, parentFolder);
  }
}
function handleFile(path, parentFolder) {
  const unpodified = getUnpodifiedState(path);
  const newPath = `${unpodified.basePath}${parentFolder}${unpodified.folderName}${unpodified.fileName}.js`;
  renameFile(path, newPath);
}

function handleTestFiles(parentFolder, fileName) {
  for (const path of walkPaths(fileName)) {
    handleTestFile(path, parentFolder);
  }
}
function handleTestFile(path, parentFolder) {
  const unpodified = getUnpodifiedState(path);
  const newPath = `${unpodified.basePath}${parentFolder}${unpodified.folderName}${unpodified.fileName}-test.js`;
  renameFile(path, newPath);
}

function unpodifyApp() {
  handleTemplates();

  handleFiles('adapters/', 'adapter.js');
  handleFiles('components/', 'component.js');
  handleFiles('models/', 'models.js');
  handleFiles('controllers/', 'controller.js');
  handleFiles('routes/', 'route.js');
  handleFiles('services/', 'service.js');
  handleFiles('serializers/', 'serializer.js');
  handleFiles('transforms/', 'transform.js');
  handleFiles('models/', 'model.js');
  handleFiles('initializers/', 'initializer.js');
  handleFiles('instance-initializers/', 'instance-initializer.js');

  handleTestFiles('adapters/', 'adapter-test.js');
  handleTestFiles('components/', 'component-test.js');
  handleTestFiles('models/', 'models-test.js');
  handleTestFiles('controllers/', 'controller-test.js');
  handleTestFiles('routes/', 'route-test.js');
  handleTestFiles('services/', 'service-test.js');
  handleTestFiles('serializers/', 'serializer-test.js');
  handleTestFiles('transforms/', 'transform-test.js');
  handleTestFiles('models/', 'model-test.js');
  handleTestFiles('initializers/', 'initializer-test.js');
  handleTestFiles('initializers/', 'initializer-test-test.js');
  handleTestFiles('instance-initializers/', 'instance-initializer-test.js');
  handleTestFiles(
    'instance-initializers/',
    'instance-initializer-test-test.js'
  );

  if (fs.existsSync('./addon')) {
    removeEmptyFolders('./addon');
  }
  removeEmptyFolders('./app');
  removeEmptyFolders('./tests');
}

module.exports = unpodifyApp;
