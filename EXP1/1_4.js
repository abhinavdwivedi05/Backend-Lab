const fs = require('fs');
const path = './data.txt';

fs.access(path, fs.constants.F_OK, (err) => {
  if (err) {
    console.error('File does not exist:', path);
    return;
  }


  const readStream = fs.createReadStream(path, { encoding: 'utf8' });

  readStream.on('data', (chunk) => {
    console.log(chunk);
  });

  readStream.on('error', (error) => {
    console.error('Error reading the file:', error.message);
  });

  readStream.on('end', () => {
    console.log('Finished reading the file.');
  });
});
