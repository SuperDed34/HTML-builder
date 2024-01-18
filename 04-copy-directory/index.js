const path = require('path');
const fs = require('fs');
const promise = require('fs/promises');
const srcPath = path.join(__dirname, 'files');
const destPath = path.join(__dirname, 'files-copy');
mkDir();

async function mkDir() {
  const files = await promise.readdir(srcPath, { withFileTypes: true });
  try {
    await promise.mkdir(destPath);
    console.log('Folder is created');
    for (const file of files) {
      promise.copyFile(
        path.join(srcPath, file.name),
        path.join(destPath, file.name),
      );
      console.log(`${file.name} succesfully copied`);
    }
  } catch (err) {
    const filesDest = await promise.readdir(destPath, { withFileTypes: true });
    for (const file of filesDest) {
      promise.unlink(path.join(destPath, file.name));
    }
    await promise.rmdir(destPath);
    console.log('Rebuilding Folder...');
    mkDir();
  }
}
