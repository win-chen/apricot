## State management

..is basically pubsub

state is in state.ts file

## Concepts
- actions are functions that update the state

- fsms are both actions and state (eventually split up the two?)

- state can be writable or derived. State can write to other state through subscriptions


## Common pitfalls

Remember to add your childfsm (interaction/your-interaction/fsm) to the root-fsm

Check listener.on vs listener.off

Check :enter vs :exit
