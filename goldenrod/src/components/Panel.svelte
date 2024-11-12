<script lang="ts">
  import { interactionTracker } from "src/state/interaction-tracker";
  import {
    currentSubgraphToDOT,
    graph,
    pointerPos,
    selectedNodeIds,
  } from "src/state/state/index";
  import { get } from "svelte/store";
  import ShortcutList from "./ShortcutList.svelte";
  import { lastSync, pauseSync } from "./syncer/store";

  const { nodes } = graph;

  let nodeId: string;
  let nodeName: string;
  $: nodeName = get($nodes[nodeId]?.attr.text);

  const handleClick = () => {
    const url = "http://127.0.0.1:5000/cluster";
    fetch(url, {
      method: "POST",
      body: currentSubgraphToDOT(),
    })
      .then((resp) => resp.json())
      .then((clusters) => {
        graph.insertClusterLevel(clusters);
      })
      .catch(console.log);
  };

  const { activeLeaves } = interactionTracker;
</script>

<div class="container">
  <br />

  <div>Pause sync <input type="checkbox" bind:checked={$pauseSync} /></div>
  <div>
    Last sync: {$lastSync}
  </div>
  <div>
    Pointer: {Math.round($pointerPos.x)}, {Math.round($pointerPos.y)}
  </div>
  <div>
    Selected: {[...$selectedNodeIds]}
  </div>
  <div>
    Node id: <input type="text" bind:value={nodeId} />
    Node name: {nodeName}
  </div>
  <div>
    cluster zoom
    <button on:click={graph.clusterZoomIn}>+</button>
    <button on:click={graph.clusterZoomOut}>-</button>
  </div>
  <button on:click={handleClick}>cluster</button>

  <br />

  <ShortcutList></ShortcutList>

  <div>Active leaves: {[...$activeLeaves].join(", ")}</div>
</div>

<style>
  .container {
    padding: 14px;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    background-color: lightsteelblue;
  }
  /* Write your CSS here */
</style>
