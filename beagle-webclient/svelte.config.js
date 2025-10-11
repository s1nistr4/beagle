import adapter from '@sveltejs/adapter-static';
import { sveltePreprocess } from "svelte-preprocess"

export default {
 preprocess: sveltePreprocess({
  pug: true
 }),

 kit: {
  adapter: adapter({
   pages: 'build',
   assets: 'build',
   fallback: "src/app.html"
  })
 }
};
