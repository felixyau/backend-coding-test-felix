// For clarity in this example we included our typeDefs and resolvers above our test,
import { describe, expect, test, it, beforeAll, afterAll } from "@jest/globals";
import { ApolloServer } from "@apollo/server";
import assert from "node:assert";
import { readFileSync } from "node:fs";
import resolvers from "./resolvers";

const typeDefs = readFileSync("./src/schema.graphql", { encoding: "utf-8" });

describe("GraphQL API", () => {
  let testServer;

  beforeAll(() => {
    testServer = new ApolloServer({
      typeDefs,
      resolvers,
    });
  });

  it("returns null for non-existent node ID", async () => {
    const response = await testServer.executeOperation({
      query: `#graphql
        query ($nodeId: ID) {
          node(nodeId: $nodeId) {
            _id
            name
          }
        }
      `,
      variables: { nodeId: "nonExistentId" },
    });

    assert(response.body.kind === "single");
    expect(response.body.singleResult.errors).toBeUndefined();
    expect(response.body.singleResult.data?.node).toBeNull();
  });

  it("returns node data for valid node ID", async () => {
    const response = await testServer.executeOperation({
      query: `#graphql
        query ($nodeId: ID) {
          node(nodeId: $nodeId) {
            _id
            name
          }
        }
      `,
      variables: { nodeId: "6296be3470a0c1052f89cccb" },
    });
    assert(response.body.kind === "single");
    expect(response.body.singleResult.errors).toBeUndefined();
    expect(response.body.singleResult.data?.node).toEqual({
      _id: "6296be3470a0c1052f89cccb",
      name: "Greeting Message",
    });
  });

  it("handles querying without providing nodeId", async () => {
    const response = await testServer.executeOperation({
      query: `#graphql
        query {
          node {
            _id
            name
          }
        }
      `,
    });

    assert(response.body.kind === "single");
    expect(response.body.singleResult.errors).toBeUndefined();
    expect(response.body.singleResult.data?.node).toBeNull();
  });

  it("handles querying nested objects", async () => {
    const response = await testServer.executeOperation({
      query: `#graphql
        query ($nodeId: ID) {
          node(nodeId: $nodeId) {
            _id
            name
            trigger {
              _id
              name
            }
            responses {
              _id
              name
            }
            actions {
              _id
              name
            }

          }
        }
      `,
      variables: { nodeId: "6296be3470a0c1052f89cccb" },
    });

    assert(response.body.kind === "single");
    expect(response.body.singleResult.errors).toBeUndefined();
    expect(response.body.singleResult.data?.node?.trigger).toBeDefined();
    expect(response.body.singleResult.data?.node?.responses).toBeDefined();
    expect(response.body.singleResult.data?.node?.actions).toBeDefined();
  });

  it("handles querying resourceTemplate", async () => {
    const response = await testServer.executeOperation({
      query: `#graphql
        query($nodeId: ID)  {
          node(nodeId: $nodeId  ) {
            trigger {
              resourceTemplate {
                _id
              }
            }
          }
        }
      `,
      variables: { nodeId: "6297164810f52524ba1a9300" },
    });

    assert(response.body.kind === "single");
    expect(response.body.singleResult.errors).toBeUndefined();
    expect(
      response.body.singleResult.data?.node?.trigger?.resourceTemplate?._id
    ).toEqual("61e9ba20f9b581f25a2dbf51");
  });
});
