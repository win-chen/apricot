<script lang="ts">
  import { createRequest, getContextClient } from "@urql/svelte";
  import { UpdateNodeDocument } from "src/gql/graphql";
  import { onMount } from "svelte";
  import { lastSync, pauseSync } from "./store";
  import { get } from "svelte/store";
  import { graph } from "src/state/state";

  $: nodes = graph.nodes;

  const client = getContextClient();
  const updateAllNodes = () => {
    $lastSync = Date.now().toLocaleString();
    for (const [id, node] of Object.entries($nodes)) {
      const { text, x, y } = node.attr;
      const variables = {
        id,
        input: {
          text: get(text),
          x: get(x),
          y: get(y),
        },
      };

      client.executeMutation(createRequest(UpdateNodeDocument, variables)).then(
        (val) => console.log("success syncing", val),
        (err) => console.log("error syncing", err),
      );
    }
  };
  let interval: NodeJS.Timeout;
  let mounted = false;

  onMount(() => {
    mounted = true;

    return () => clearInterval(interval);
  });

  $: !$pauseSync && mounted && (interval = setInterval(updateAllNodes, 1000));
  $: $pauseSync && mounted && clearInterval(interval);
</script>
