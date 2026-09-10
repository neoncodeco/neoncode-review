import dns from "node:dns";
import { MongoClient } from "mongodb";

try {
  dns.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4"]);
} catch {
  /* ignore */
}

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("Please add MONGODB_URI to .env.local");
}

if (/<db_password>|YOUR_PASSWORD|<|>/i.test(uri)) {
  throw new Error(
    "MONGODB_URI still has a password placeholder. Put the real Atlas password in .env.local."
  );
}

const isLocal = /localhost|127\.0\.0\.1/i.test(uri);

const options = {
  family: 4,
  serverSelectionTimeoutMS: 12000,
  connectTimeoutMS: 12000,
};

if (!isLocal) {
  options.serverApi = {
    version: "1",
    strict: true,
    deprecationErrors: true,
  };
}

function friendlyAuthError(err) {
  const msg = String(err?.message || err || "");
  if (/bad auth|authentication failed/i.test(msg)) {
    return new Error(
      "MongoDB authentication failed. Fix MONGODB_URI user/password in .env.local."
    );
  }
  if (/ENOTFOUND|querySrv/i.test(msg)) {
    return new Error(
      "MongoDB host not found. Check cluster hostname in MONGODB_URI."
    );
  }
  return err;
}

function connectWithDiagnostics() {
  const client = new MongoClient(uri, options);
  return client.connect().catch((err) => {
    const nice = friendlyAuthError(err);
    console.error("MongoDB connection failed:", nice.message || err?.message);
    throw nice;
  });
}

let clientPromise;

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise || global._mongoClientUri !== uri) {
    global._mongoClientUri = uri;
    global._mongoClientPromise = connectWithDiagnostics();
  }
  clientPromise = global._mongoClientPromise;
} else {
  clientPromise = connectWithDiagnostics();
}

export default clientPromise;
