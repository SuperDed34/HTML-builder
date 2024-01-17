const promise = require('fs/promises');
const path = require('path');
const fs = require('fs');
const folderPath = path.join(__dirname, 'secret-folder');

readFolder();

async function readFolder() {
  try {
    const files = await promise.readdir(folderPath, { withFileTypes: true });
    for (const file of files) {
      if (file.isFile()) {
        const fileName = file.name.split('.');
        const stats = fs.stat(
          path.join(folderPath, file.name),
          (err, stats) => {
            console.log(
              `${fileName[0]} - ${fileName[1]} - ${Math.ceil(
                stats.size / 1024,
              )} KB`,
            );
          },
        );
      }
    }
  } catch (err) {
    console.log(err);
  }
}
