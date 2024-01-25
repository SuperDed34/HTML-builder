const path = require('path');
const promise = require('fs/promises');
const root = path.join(__dirname);
const bundlePath = path.join(__dirname, 'project-dist');
const srcPath = path.join(__dirname, 'styles');
const createReadStream = require('fs').createReadStream;
const createWriteStream = require('fs').createWriteStream;
const bundle = createWriteStream(path.join(bundlePath, 'bundle.css'));
bundleStyles();

async function bundleStyles() {
  if (findStyles()) {
    const rf = await promise.readdir(srcPath, { withFileTypes: true });
    for (const file of rf) {
      const fileRes = file.name.split('.')[1];
      if (file.isFile() && fileRes === 'css') {
        console.log(typeof path.join(file.path, file.name));
        const readstream = createReadStream(
          path.join(file.path, file.name),
          'utf-8',
        );
        readstream.on('data', (chunk) => {
          bundle.write(chunk);
        });
        readstream.on('end', () => {
          console.log(`Bundle ${file.name} is finished`);
        });
      }
    }
  }
}

async function findStyles() {
  try {
    await promise.access(srcPath);
    return true;
  } catch (err) {
    return false;
  }
}
