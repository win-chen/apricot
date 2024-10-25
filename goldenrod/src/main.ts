import './app.css'
import App from './App.svelte'
import 'src/graphql/client' 

const app = new App({
  target: document.getElementById('app')!,
})

export default app
