import { MongoClient } from "mongodb";

if (!process.env.MONGODB_URI) {
    // Try to use a default or throw an error if missing
    console.warn('Invalid/Missing environment variable: "MONGODB_URI"');
}

const uri = process.env.MONGODB_URI || "mongodb+srv://heyadarshhere_db_user:GH0Sqbv3ZktM8Bui@cluster0.1mrfioj.mongodb.net/100dayschallenge?retryWrites=true&w=majority&appName=Cluster0";
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
    let globalWithMongo = global as typeof globalThis & {
        _mongoClientPromise?: Promise<MongoClient>;
    };

    if (!globalWithMongo._mongoClientPromise) {
        client = new MongoClient(uri, options);
        globalWithMongo._mongoClientPromise = client.connect();
    }
    clientPromise = globalWithMongo._mongoClientPromise;
} else {
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
}

export default clientPromise;
