<script lang="ts">
 import CodeBlock from "./CodeBlock.svelte";
 import Highlight from "svelte-highlight";
 import xml from "svelte-highlight/languages/xml";

 interface IProps {
 }

 const codeBlock1:string = `
  <div class="closing-tags">
   <p>Closing tags are annoying</p>
  </div>
 `

 const codeBlock2:string = `
  div.no-closing-tags 
   p Much better!
 `
</script>

<div class="SayGoodbyeToClosingTags">
 <h1 class="text-[40px] font-bold fg3">Say goodbye to closing tags</h1>
 <p class="text-[24px] fg3 max-w-220">No more polluting your code with unnecessary tags. Beagle doesn't require any closing tags, just the opening tags</p>

 <div class="code-snippets">
  <code class="left text-[24px]">
   <Highlight language={xml} code={codeBlock1} />
  </code>

  <div class="right">
   <Highlight language={xml} code={codeBlock2} />
  </div>
 </div>
</div>

