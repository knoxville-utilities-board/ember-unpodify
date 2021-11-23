const walkSync = require('walk-sync');
const fs = require('fs');
var pathModule = require('path');

function walkPaths(fileName) {
  return walkSync('.', {
    globs: [
      `addon/**/${fileName}`,
      `app/**/${fileName}`,
      `tests/dummy/app/**/${fileName}`,
      `tests/acceptance/**/${fileName}`,
      `tests/integration/**/${fileName}`,
      `tests/unit/**/${fileName}`,
    ],
  });
}

function getBasePath(path) {
  const basePaths = [
    'tests/dummy/app/',
    'addon/',
    'app/',
    'tests/acceptance/',
    'tests/integration/',
    'tests/unit/',
  ];
  for (const basePath of basePaths) {
    if (path.startsWith(basePath)) {
      return basePath;
    }
  }
}

function isComponentPath(path) {
  return path.includes('/components/');
}

function getUnpodifiedState(path) {
  const basePath = getBasePath(path);
  const isComponent = isComponentPath(path);
  let filePath = path.replace(basePath, '');
  if (isComponent) {
    filePath = filePath.replace('components/', '');
  }
  const folderOnlyPath = filePath.substring(0, filePath.lastIndexOf('/'));
  const fileName = folderOnlyPath.substring(
    folderOnlyPath.lastIndexOf('/') + 1
  );
  const folderName = folderOnlyPath.substring(
    0,
    folderOnlyPath.lastIndexOf('/') + 1
  );

  return {
    fileName,
    folderName,
    basePath,
    isComponent,
  };
}

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

function renameFile(oldPath, newPath) {
  if (oldPath == newPath) {
    return;
  }
  const newFolder = newPath.substring(0, newPath.lastIndexOf('/'));
  if (!fs.existsSync(newFolder)) {
    fs.mkdirSync(newFolder, { recursive: true });
  }
  fs.renameSync(oldPath, newPath);
}

function removeEmptyFolders(folder) {
  var isDir = fs.statSync(folder).isDirectory();
  if (!isDir) {
    return;
  }
  var files = fs.readdirSync(folder);
  if (files.length > 0) {
    files.forEach(function (file) {
      var fullPath = pathModule.join(folder, file);
      removeEmptyFolders(fullPath);
    });

    // re-evaluate files; after deleting subfolder
    // we may have parent folder empty now
    files = fs.readdirSync(folder);
  }

  if (files.length == 0) {
    fs.rmdirSync(folder);
    return;
  }
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
  handleTestFiles(
    'instance-initializers/',
    'instance-initializer-test.js'
  );
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
