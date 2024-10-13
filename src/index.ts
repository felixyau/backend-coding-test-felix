import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import express from "express";
import { readFileSync } from "fs";
import resolvers from "./resolvers";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import http from "node:http";
import cors from "cors";
import "dotenv/config";

// Middleware to check for Bearer token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return res.sendStatus(401); // Unauthorized

  if (token !== process.env.TOKEN) {
    return res.sendStatus(403); // Forbidden
  }

  next(); // Token is valid, continue to GraphQL handling
};

const app = express();
const httpServer = http.createServer(app);

const typeDefs = readFileSync("./src/schema.graphql", { encoding: "utf-8" });

const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

await server.start();

app.use("/", authenticateToken);

// Set up our Express middleware to handle CORS, body parsing,
// and our expressMiddleware function.
app.use(
  "/",
  cors<cors.CorsRequest>(),
  // 50mb is the limit that `startStandaloneServer` uses, but you may configure this to suit your needs
  express.json({ limit: "50mb" }),
  expressMiddleware(server)
);

await new Promise<void>((resolve) =>
  httpServer.listen({ port: 4001 }, resolve)
);
console.log(`🚀 Server ready at http://localhost:4001/`);
