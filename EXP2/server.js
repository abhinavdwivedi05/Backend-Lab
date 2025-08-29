const http = require('http');
const url = require('url');

let items = [];
let currentId = 1;

const PORT = 3000;

function sendJSON(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function getRequestBody(req, callback) {
  let body = '';
  req.on('data', chunk => {
    body += chunk;
  });
  req.on('end', () => {
    try {
      const json = JSON.parse(body);
      callback(null, json);
    } catch (e) {
      callback(e);
    }
  });
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const method = req.method;

  if (path === '/items' && method === 'GET') {
    return sendJSON(res, 200, items);
  }

  if (path === '/items' && method === 'POST') {
    return getRequestBody(req, (err, body) => {
      if (err) return sendJSON(res, 400, { error: 'Invalid JSON' });
      if (!body.title) return sendJSON(res, 400, { error: 'Title is required' });

      const newItem = { id: currentId++, title: body.title, completed: false };
      items.push(newItem);
      sendJSON(res, 201, newItem);
    });
  }

  if (path.startsWith('/items/') && method === 'GET') {
    const id = parseInt(path.split('/')[2]);
    const item = items.find(i => i.id === id);
    if (!item) return sendJSON(res, 404, { error: 'Item not found' });
    return sendJSON(res, 200, item);
  }

  if (path.startsWith('/items/') && method === 'PUT') {
    const id = parseInt(path.split('/')[2]);
    const item = items.find(i => i.id === id);
    if (!item) return sendJSON(res, 404, { error: 'Item not found' });

    return getRequestBody(req, (err, body) => {
      if (err) return sendJSON(res, 400, { error: 'Invalid JSON' });
      if (body.title !== undefined) item.title = body.title;
      if (body.completed !== undefined) item.completed = body.completed;
      sendJSON(res, 200, item);
    });
  }

  if (path.startsWith('/items/') && method === 'DELETE') {
    const id = parseInt(path.split('/')[2]);
    const index = items.findIndex(i => i.id === id);
    if (index === -1) return sendJSON(res, 404, { error: 'Item not found' });

    items.splice(index, 1);
    return sendJSON(res, 200, { message: 'Item deleted' });
  }

  sendJSON(res, 404, { error: 'Route not found' });
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
