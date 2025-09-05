const { MongoClient, ObjectId } = require('mongodb');

const uri = 'mongodb://localhost:27017';
const dbName = 'todoApp';
const collectionName = 'items';

let client;
let collection;

async function connect() {
  if (collection) return collection;

  client = new MongoClient(uri, { useUnifiedTopology: true });
  await client.connect();
  const db = client.db(dbName);
  collection = db.collection(collectionName);

  return collection;
}

async function getAllItems() {
  const col = await connect();
  const items = await col.find({}).toArray();
  return items.map(item => ({
    id: item._id.toString(),
    title: item.title,
    completed: item.completed,
  }));
}

async function getItemById(id) {
  const col = await connect();
  try {
    const item = await col.findOne({ _id: new ObjectId(id) });
    if (!item) return null;
    return {
      id: item._id.toString(),
      title: item.title,
      completed: item.completed,
    };
  } catch {
    return null; 
  }
}

async function createItem(title) {
  const col = await connect();
  const result = await col.insertOne({ title, completed: false });
  return {
    id: result.insertedId.toString(),
    title,
    completed: false,
  };
}

async function updateItem(id, data) {
  const col = await connect();
  try {
    const updateDoc = {};
    if (data.title !== undefined) updateDoc.title = data.title;
    if (data.completed !== undefined) updateDoc.completed = data.completed;

    if (Object.keys(updateDoc).length === 0) return null;

    const result = await col.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateDoc },
      { returnDocument: 'after' }
    );

    if (!result.value) return null;

    return {
      id: result.value._id.toString(),
      title: result.value.title,
      completed: result.value.completed,
    };
  } catch {
    return null;
  }
}

async function deleteItem(id) {
  const col = await connect();
  try {
    const result = await col.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  } catch {
    return false;
  }
}

async function close() {
  if (client) await client.close();
}

module.exports = {
  getAllItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  close,
};
