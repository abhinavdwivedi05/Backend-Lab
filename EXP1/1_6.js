const fs = require("fs");

const readableStream = fs.createReadStream("input.txt", "utf8");
const writableStream = fs.createWriteStream("output.txt");
readableStream.pipe(writableStream);
readableStream.on("end", () => {
  console.log("File copied successfully using stream piping.");
});


// const fs = require("fs");

// const readableStream = fs.createReadStream("input.txt", "utf8");
// const writableStream = fs.createWriteStream("output.txt");

// readableStream.on("data", (chunk) => {
//   writableStream.write(chunk);
// });

// readableStream.on("end", () => {
//   writableStream.end();
//   console.log("File copied successfully (manual streaming).");
// });
