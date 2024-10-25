import { writable } from "svelte/store";

enum Status {
  IDLE,
  PENDING,
  SUCCESS,
  RETRYING
}

type Entity = any

interface SyncConfig<Context> {
  type: string,
  getEntities: (context: Context) => Record<string, Entity>
  create: (entity: Entity, context: Context) => any,
  update: (entity: Entity, context: Context) => any,
  delete: (entity: Entity, context: Context) => any
}

const createSyncer = <Context>(
  getContext: (...args: any[]) => Context,
  configs: SyncConfig<Context>[]
) => {
  // State sync last successful persist
  let lastPersistedState: Context;
  // 
  let lastPersistedTimestamp = writable(Date.now());

  // Status of the current update request if any
  let status: Status = Status.IDLE;

  // When this is toggled to true, syncs the state
  const touched = writable(false);

  touched.
}