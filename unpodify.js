var {
  removeEmptyFolders,
  renameFile,
  getUnpodifiedState,
  walkPaths,
  getWorkingDirectoryName,
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
  unpodifyImports(newPath, parentFolder, unpodified);
}

function unpodifyImports(path, parentFolder, unpodified) {
  let data = fs.readFileSync(path, 'utf8');
  const appName = getWorkingDirectoryName();
  data = unpodifyDotImports(data, appName, parentFolder, unpodified);
  data = unpodifyComponentImports(data, appName);
  data = unpodifyComponentTemplateImports(data, appName);
  const types = ['adapter', 'model', 'route', 'serializer', 'service', 'transform', 'initializer', 'instance-initializer', 'controller'];
  for (const type of types) {
    data = unpodifyImportsByType(data, appName, type);
  }
  fs.writeFileSync(path, data, 'utf8');
}

function unpodifyDotImports(data, appName, parentFolder, unpodified) {
  return data.replaceAll(/from '.\/(.*){1}';/g, `from '${appName}/${parentFolder}${unpodified.folderName}${unpodified.fileName}/$1';`);
}

function unpodifyImportsByType(data, appName, type) {
  const regex = new RegExp(`from '${appName}/(.*){1}/${type}';`, 'g');
  return data.replaceAll(regex, `from '${appName}/${type}s/$1';`);
}

function unpodifyComponentImports(data, appName) {
  const regex = new RegExp(`from '${appName}/components/(.*){1}/component';`, 'g');
  return data.replaceAll(regex, `from '${appName}/components/$1';`);
}

function unpodifyComponentTemplateImports(data, appName) {
  const regex = new RegExp(`from '${appName}/components/(.*){1}/template';`, 'g');
  return data.replaceAll(regex, `from '${appName}/templates/components/$1';`);
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
  unpodifyTestImports(newPath);
}

function unpodifyTestImports(path) {
  let data = fs.readFileSync(path, 'utf8');
  const appName = getWorkingDirectoryName();
  const types = ['adapter', 'model', 'route', 'serializer', 'service', 'transform', 'initializer', 'instance-initializer', 'controller'];
  for (const type of types) {
    data = unpodifyImportsByType(data, appName, type);
  }
  fs.writeFileSync(path, data, 'utf8');
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
