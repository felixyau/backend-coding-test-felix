import { GraphQLBigInt, GraphQLJSON } from "graphql-scalars";
import nodes from "../data/node.json";
import actions from "../data/action.json";
import resourceTemplates from "../data/resourceTemplate.json";
import responses from "../data/response.json";
import triggers from "../data/trigger.json";

function findById(collection, id) {
  return id ? collection.find((item) => item._id === id) : null;
}

function findByCompositeId(collection, id) {
  return id ? collection.find((item) => item.compositeId === id) : null;
}

const resolvers = {
  Long: GraphQLBigInt,
  JSON: GraphQLJSON,
  Query: {
    node: (_, { nodeId }) => findById(nodes, nodeId),
  },
  NodeObject: {
    parentIds: (node) => node.parents,
    triggerId: (node) => node.trigger,
    responseIds: (node) => node.responses,
    actionIds: (node) => node.actions,

    trigger: (node) => findById(triggers, node.trigger),
    parents: (node) => {
      if (!node.parents) return null;
      if (node.parents.length === 0) return [];

      return node.parents
        .map((id) => findByCompositeId(nodes, id))
        .filter(Boolean); //parents link to composite id
    },

    responses: (node) => {
      if (!node.parents) return null;
      if (node.parents.length === 0) return [];

      return node.responses
        .map((id) => findById(responses, id))
        .filter(Boolean);
    },

    actions: (node) => {
      if (!node.actions) return null;
      if (node.actions.length === 0) return [];
      
      return node.actions.map((id) => findById(actions, id)).filter(Boolean);
    },
  },
  Action: {
    resourceTemplate: (action) =>
      findById(resourceTemplates, action.resourceTemplateId),
  },
  Trigger: {
    resourceTemplate: (trigger) =>
      findById(resourceTemplates, trigger.resourceTemplateId),
  },
};

export default resolvers;
