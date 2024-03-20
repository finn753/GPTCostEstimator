<script lang="ts">
    import type {HTMLInputAttributes} from "svelte/elements";
    import {cn} from "$lib/utils";
    import {Label} from "$lib/components/ui/label";

    type $$Props = HTMLInputAttributes;

    let className: $$Props["class"] = undefined;
    export {className as class};

    let fileList: FileList | null;

    export let value: File[] = [];
    $: value = fileList ? Array.from(fileList) : [];
</script>

<div class={cn("relative rounded-lg border bg-card text-card-foreground shadow-sm flex items-center justify-center", className)}>
    <input class="size-full opacity-0 absolute cursor-pointer" id="file" type="file" bind:files={fileList} webkitdirectory multiple accept=".json" />
    <Label for="file">Upload</Label>
</div>