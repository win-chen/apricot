import { CodegenConfig } from '@graphql-codegen/cli';
import { url } from './src/graphql/client';

const config: CodegenConfig = {
  schema: url,
  documents: ['src/**/*.ts'],
  ignoreNoDocuments: true, // for better experience with the watcher
  generates: {
    './src/gql/': {
      preset: 'client',
      config: {
        useTypeImports: true,
      },
      plugins: [],
    },
  },
};

export default config;