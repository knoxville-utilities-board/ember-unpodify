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

module.exports = {
  removeEmptyFolders,
  renameFile,
  getUnpodifiedState,
  walkPaths,
};
