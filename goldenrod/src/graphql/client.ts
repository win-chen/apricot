import { Client, cacheExchange, fetchExchange, setContextClient } from '@urql/svelte';

export const url = 'http://localhost:8080/query';

export const client = new Client({
  url,
  exchanges: [cacheExchange, fetchExchange],
});

// TODO: why do we need setContext? Dependencies can be mocked out in testing. Replace with client export
export const initClient = () => setContextClient(client);