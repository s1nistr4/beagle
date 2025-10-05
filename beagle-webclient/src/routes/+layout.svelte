<script lang="ts">
import "../app.css"
import Header from "../components/Header.svelte";
import Footer from "../components/Footer.svelte";

let { children } = $props()
</script>

<div class="wrapper">
 <Header />
 <main>
  {@render children?.()}
 </main>
 <Footer />
</div>
