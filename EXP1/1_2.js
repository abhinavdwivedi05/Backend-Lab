const fs = require('fs').promises;

async function readFileAsync(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    console.log('File contents:', data);
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.error('Error: File not found!');
    } else {
      console.error('An error occurred:', err);
    }
  }
}

readFileAsync('./example.txt');
