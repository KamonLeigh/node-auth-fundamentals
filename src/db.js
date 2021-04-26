
import mongo from 'mongodb';
//mongodb+srv://Leigh:<password>@cluster0.nfspo.mongodb.net/myFirstDatabase?retryWrites=true&w=majority
const { MongoClient } = mongo;

const url = process.env.MONGO_URL;


export const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });

export async function connectDb() {
    try {
        await client.connect();

        // Confirm connection
        await client.db('admin').command({ ping: 1});
        console.log('connected to DB Success');
        
    } catch (error) {
        console.error(error);
        // if there is a problem close connection to db
        await client.close();
        
    }
}