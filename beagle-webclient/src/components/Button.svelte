<script lang="ts">
 interface IProps {
  Text: string
  ClickButton: () => void
 }

 const { Text, ClickButton }:IProps = $props()
</script>

<button onclick={ClickButton} class="bg3 p-2 mx-1 my-2 rounded-full cursor-pointer">
 <p class="text-bold text-[24px] font-bold mx-3">{Text}</p>
</button>
