<script lang="ts">
 import CodeBlock from "./CodeBlock.svelte"
 import Button from "./Button.svelte"

 interface IProps {
 }
</script>

<div class="TopArea m-10 text-center flex flex-col justify-center items-center">
 <div class="">
  <p class="text-[96px] font-bold max-w-[800px] fg3">HTML with more bite than bark.</p>
 </div>

 <div class="flex justify-center items-center">
  <CodeBlock />
  <CodeBlock />
 </div>

 <div class="flex justify-center items-center">
  <Button Text="Install" ClickButton={() => {}} />
  <Button Text="Migrating from Pug" ClickButton={() => {}} />
 </div>


 <p class="text-[20px] flex justify-center items-center text-white fg3 max-w-[1100px]">Beagle makes HTML a joy to write. It significantly shortens the amount of code you need to write a beautiful, production-grade website. Beagle is an actively-maintained, modernized fork of Pug with better support for frontend-frameworks, full type safety, and cleaner code.</p>
</div>
