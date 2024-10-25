import { graphql } from "src/gql";

export const InitialQueryDocument = graphql(`
  query InitialQuery {
    graph(nodeType: "Node") {
      nodes {
        id
        text
        x
        y
      }
      edges {
        label
        source
        target
      }
    }
  }
`);

export const CreateEdgeDocument = graphql(`
  mutation CreateEdge($srcId: ID!, $destId: ID!) {
    createEdge(srcId: $srcId, destId: $destId) {
      label
      source
      target
    }
  }
`);

export const UpdateNodeDocument = graphql(`
  mutation UpdateNode($id: ID!, $input: NodeUpdate!) {
    updateNode(id: $id, input: $input) {
      id
      text
      x
      y
    }
  }
`);

export const CreateNodeDocument = graphql(`
  mutation CreateNode($id: ID!, $input: NodeCreate!) {
    createNode(id: $id, input: $input) {
      id
      text
      x
      y
    }
  }
`);

export const DeleteNodeDocument = graphql(`
  mutation DeleteNode($id: ID!) {
    deleteNode(id: $id)
  }
`);
