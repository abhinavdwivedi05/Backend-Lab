const http = require('http');
const url = require('url');
const todoRepo = require('./todoRepository');

const PORT = 3000;

function sendJSON(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function getRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', () => {
      try {
        const json = JSON.parse(body);
        resolve(json);
      } catch (e) {
        reject(e);
      }
    });
  });
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const method = req.method;

  try {
    if (path === '/items' && method === 'GET') {
      const items = await todoRepo.getAllItems();
      return sendJSON(res, 200, items);
    }

    if (path === '/items' && method === 'POST') {
      const body = await getRequestBody(req);
      if (!body.title) return sendJSON(res, 400, { error: 'Title is required' });

      const newItem = await todoRepo.createItem(body.title);
      return sendJSON(res, 201, newItem);
    }

    if (path.startsWith('/items/') && method === 'GET') {
      const id = path.split('/')[2];
      const item = await todoRepo.getItemById(id);
      if (!item) return sendJSON(res, 404, { error: 'Item not found' });
      return sendJSON(res, 200, item);
    }

    if (path.startsWith('/items/') && method === 'PUT') {
      const id = path.split('/')[2];
      const body = await getRequestBody(req);
      const updatedItem = await todoRepo.updateItem(id, body);
      if (!updatedItem) return sendJSON(res, 404, { error: 'Item not found or no update data' });
      return sendJSON(res, 200, updatedItem);
    }

    if (path.startsWith('/items/') && method === 'DELETE') {
      const id = path.split('/')[2];
      const deleted = await todoRepo.deleteItem(id);
      if (!deleted) return sendJSON(res, 404, { error: 'Item not found' });
      return sendJSON(res, 200, { message: 'Item deleted' });
    }

    sendJSON(res, 404, { error: 'Route not found' });
  } catch (e) {
    sendJSON(res, 500, { error: 'Internal Server Error' });
  }
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


process.on('SIGINT', async () => {
  console.log('\nShutting down...');
  await todoRepo.close();
  process.exit(0);
});
