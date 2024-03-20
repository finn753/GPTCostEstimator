<script lang="ts">
    import Dropzone from "$lib/components/Dropzone.svelte";
    import Analytics from "$lib/components/Analytics.svelte";

    let files: File[]

    let conversationsFile: File | undefined
    $: conversationsFile = files?.find(file => file.name === "conversations.json")
</script>

<div class="h-dvh w-dvw flex flex-col justify-center items-center">
    {#if !conversationsFile}
        <Dropzone class="w-40 h-40" bind:value={files} />
    {:else}
        <Analytics conversationsFile={conversationsFile} />
    {/if}
</div>