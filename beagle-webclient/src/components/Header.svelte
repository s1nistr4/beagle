<script lang="ts">
 import { goto } from "$app/navigation";

 function onclick():void {
 }
</script>

<header class="flex m-5 justify-between items-center">
 <div class="cursor-pointer">
  <p class="text-amber-50 font-bold text-[24px] right-full">Beagle</p>
 </div>

 <button {onclick} class="bg-indigo-400 px-3 py-2 text-white text-bold rounded-full border-2 border-dotted border-indigo-600 cursor-pointer hover:bg-indigo-500 duration-150 transition-colors">Docs</button>
</header>
