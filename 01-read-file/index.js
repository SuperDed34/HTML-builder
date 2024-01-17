const path = require('path');
const fs = require('fs');
const filePath = path.join(__dirname, 'text.txt');
const readStream = fs.createReadStream(filePath, 'utf-8');

readStream.on('data', (chunk) => {
  console.log(`File contains: \n "${chunk}"`);
});

readStream.on('end', () => {
  console.log('Reading is finish');
});

readStream.on('error', (err) => {
  console.error(`Error in thee reading stream: ${err}`);
});
