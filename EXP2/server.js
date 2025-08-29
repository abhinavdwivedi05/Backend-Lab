const http = require('http');
const url = require('url');

let items = [];
let currentId = 1;
const PORT = 3000;

const sendJSON = (res, statusCode, data) => {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
};

const parseBody = (req) => {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error('Invalid JSON'));
      }
    });
  });
};

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathSegments = parsedUrl.pathname.split('/').filter(Boolean); // ['items', '123']
  const method = req.method;

  if (pathSegments[0] !== 'items') {
    return sendJSON(res, 404, { error: 'Not Found' });
  }


  if (pathSegments.length === 1) {
    if (method === 'GET') {

      return sendJSON(res, 200, items);
    }

    if (method === 'POST') {

      try {
        const body = await parseBody(req);
        if (!body.title) {
          return sendJSON(res, 400, { error: 'Title is required' });
        }

        const newItem = { id: currentId++, title: body.title, completed: false };
        items.push(newItem);
        return sendJSON(res, 201, newItem);
      } catch (err) {
        return sendJSON(res, 400, { error: err.message });
      }
    }
  }

  if (pathSegments.length === 2) {
    const id = parseInt(pathSegments[1]);
    const item = items.find(i => i.id === id);

    if (!item) {
      return sendJSON(res, 404, { error: 'Item not found' });
    }

    if (method === 'GET') {

      return sendJSON(res, 200, item);
    }

    if (method === 'PUT') {
      try {
        const body = await parseBody(req);
        if (body.title !== undefined) item.title = body.title;
        if (body.completed !== undefined) item.completed = body.completed;
        return sendJSON(res, 200, item);
      } catch (err) {
        return sendJSON(res, 400, { error: err.message });
      }
    }

    if (method === 'DELETE') {
      items = items.filter(i => i.id !== id);
      return sendJSON(res, 200, { message: 'Item deleted' });
    }
  }

  sendJSON(res, 405, { error: 'Method Not Allowed' });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
