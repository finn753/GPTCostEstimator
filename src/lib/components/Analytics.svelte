<script lang="ts">
    import type {ConversationSet} from "$lib/models";
    import {
        type CostEstimate, estimateCostPerMonth,
    } from "$lib/analyizer";

    export let conversationsFile: File;

    let data: ConversationSet = []

    let costAnalysis: CostEstimate

    $: if (conversationsFile) {
        loadConversationData()
    }

    async function loadConversationData() {
        const text = await conversationsFile.text()
        data = await JSON.parse(text)

        costAnalysis = estimateCostPerMonth(data)
    }
</script>

<pre class="w-full max-w-full overflow-auto">{JSON.stringify(costAnalysis, null, 2)}</pre>
