<script lang="ts">
  import { createRequest, getContextClient } from "@urql/svelte";
  import Panel from "src/components/Panel.svelte";
  import { initClient } from "src/graphql/client";
  import { onMount } from "svelte";
  import GraphModal from "./components/GraphModal.svelte";
  import NodeEditor2 from "./components/NodeEditor.svelte";
  import InfiniteCanvasGraphContent from "./components/pixi-graph/InfiniteCanvasGraphContent.svelte";
  import Application from "./components/pixi-svelte/Application.svelte";
  import Syncer from "./components/syncer/Syncer.svelte";
  import { InitialQueryDocument } from "./graphql/queries";
  import { createResizeStore } from "./lib/resize-store";
  import { interactionTracker } from "./state/interaction-tracker";
  import { setGraphFromGraphfull } from "./state/lib/utils";
  import { graphModalState } from "./state/stores";
  import { editingNodeId } from "./state/stores/ui";

  initClient();
  const client = getContextClient();

  let leftPanel: HTMLDivElement;
  const { store: appDimensions, observer } = createResizeStore();

  interactionTracker.init(document);

  onMount(async () => {
    observer.observe(leftPanel);

    try {
      const requestAssets = createRequest(InitialQueryDocument, {});
      const result = await client.executeQuery(requestAssets);

      if (result.error) {
        throw new Error(result.error.message);
      }

      // TODO: better type checking
      const graph = result.data?.graph;

      if (!graph) {
        throw new Error("Response data for graph undefined");
      }

      setGraphFromGraphfull(graph);
    } catch (err) {
      console.log("error getting graph", err);
      // Handle error
    }
  });
</script>

<main>
  <Syncer></Syncer>
  <div bind:this={leftPanel} class="left-panel">
    <Application top={0} left={0} {...$appDimensions}>
      <InfiniteCanvasGraphContent {...$appDimensions}
      ></InfiniteCanvasGraphContent>
      {#if $editingNodeId}
        <NodeEditor2 id={$editingNodeId}></NodeEditor2>
      {/if}
      {#if $graphModalState.isOpen}
        <GraphModal></GraphModal>
      {/if}
    </Application>
  </div>
  <div class="right-panel">
    <Panel></Panel>
  </div>
</main>

<style>
  * :global(*) {
    margin: 0;
  }

  main {
    width: 100%;
    height: 100%;
    display: grid;
    grid-template-columns: 1fr 300px;
  }

  @media (max-width: 600px) {
    main {
      grid-template-columns: 1fr 150px;
    }
  }
</style>
