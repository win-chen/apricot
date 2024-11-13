import { createRequest } from "@urql/svelte";
import { graph } from "src/state/stores/index";
import { get } from "svelte/store";
import { v4 as uuid } from "uuid";
import { client } from "./client";
import {
  CreateEdgeDocument,
  CreateNodeDocument,
  DeleteNodeDocument,
  UpdateNodeDocument,
} from "./queries";

export const updateNode = (id: string) => {
  const store = get(graph.nodes)[id];

  if (!store) {
    throw new Error(`Node with id ${id} not found attempting to update node`);
  }

  const { text, x, y } = store.attr;

  const variables = {
    id,
    input: {
      text: get(text),
      x: get(x),
      y: get(y),
    },
  };

  client.executeMutation(createRequest(UpdateNodeDocument, variables)).then(
    (val) => console.log("node updated", val),
    (err) => console.log("error updating node", err)
  );
};

export const createEdge = (srcId: string, destId: string) => {
  const variables = {
    srcId,
    destId,
  };

  return client
    .executeMutation(createRequest(CreateEdgeDocument, variables))
    .then(
      (val) => console.log("edge created", val),
      (err) => console.log("error creating edge", err)
    );
};

export const addNodeRequest = (x: number, y: number) => {
  const node = {
    id: uuid(),
    text: "",
    x,
    y,
  };

  const { id, ...rest } = node;

  const variables = {
    id,
    input: rest,
  };

  return {
    node,
    execute: () => {
      return client
        .executeMutation(createRequest(CreateNodeDocument, variables))
        .then(
          (val) => console.log("created node", val),
          (err) => console.log("error creating node", err)
        );
    },
  };
};

export const executeDeleteNode = (id: string) => {
  return client.executeMutation(createRequest(DeleteNodeDocument, { id })).then(
    (val) => console.log("delete node", val),
    (err) => console.log("err deleting node", err)
  );
};
