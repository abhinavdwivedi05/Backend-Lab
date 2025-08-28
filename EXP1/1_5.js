const fs = require('fs');

const writableStream = fs.createWriteStream('output.txt');

writableStream.on('error', (err) => {
  console.error('An error occurred:', err.message);
});

writableStream.write('Hello, Node.js!');

writableStream.end(() => {
  console.log('Data successfully written to output.txt');
});
