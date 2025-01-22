import { GoogleGenerativeAI } from '@google/generative-ai';
import { MongoClient } from 'mongodb';

const { GOOGLE_API_KEY, MONGODB_URI } = process.env;

const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });
let cachedDb = null;


async function connectToDatabase() {
   if (cachedDb) return cachedDb;

    const client = new MongoClient(MONGODB_URI);
   await client.connect();

   cachedDb = client.db('chat-db');
     return cachedDb;
}
export default async function handler(req, res) {

  if (req.method !== 'POST') {
  return res.status(405).send({ message: 'Only POST requests are allowed.' });
  }
 try {
       const { message } = req.body;
       if(!message) throw "No Message Received";
       const result = await model.generateContent(message);
       const response = result.response.text();

  const db = await connectToDatabase();
         const collection = db.collection('chats');
    await collection.insertOne({ message, response });
    return res.status(200).json({ response });

       } catch (err) {
      console.error('Serverless Error', err);
         return res.status(500).json({ error: 'Failed to process message', details: err });
         }
  }
