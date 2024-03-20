import type {AuthorRole, Conversation, ConversationSet, Message} from "$lib/models";
import {encode} from "gpt-tokenizer";
import {getMonthIndex} from "$lib/utils";

type MessageData = {
    tokens: number,
    maxContext: number,
    monthIndex: number,
    role: AuthorRole,
    model: string
}

export type TokenEstimate = ReturnType<typeof estimateTokensPerMonth>;
export type CostEstimate = ReturnType<typeof estimateCostPerMonth>;

const pricePerToken = {
    gpt3: {
        input: 0.0005/1000,
        output: 0.0015/1000
    },
    gpt4: {
        input: 0.01/1000,
        output: 0.03/1000
    }
}

export function getMessageDataPerMonth(data: ConversationSet){
    let messagesPerMonth: Record<number, MessageData[]> = {};

    data.forEach((conversation) => {
        let contextSum = 0;

        getAllMessagesInConversation(conversation).forEach((message) => {
            let monthIndex = message.create_time ? getMonthIndex(new Date(message.create_time * 1000)) : null;
            let model = message.metadata.model_slug || "";
            let tokens = 0;

            try {
                let text = getMessageText(message);
                tokens = encode(text).length;
            } catch (e) {
                console.error(`Error encoding message: ${message.id}`);
                console.error(e);
            }

            if(monthIndex === null) {
                return;
            }

            messagesPerMonth[monthIndex] = messagesPerMonth[monthIndex] || [];
            messagesPerMonth[monthIndex].push({
                tokens,
                maxContext: contextSum,
                monthIndex,
                role: message.author.role,
                model
            })

            contextSum += tokens;
        })
    })

    return messagesPerMonth;
}

export function estimateTokensPerMonth(data: ConversationSet, contextSize = 4096, contextRate = 0.5) {
    let tokensPerMonth: Record<number, Record<string, {input: number, output: number}>> = {};
    // Month > Model > Input, Output

    let messagesPerMonth = getMessageDataPerMonth(data);

    for (let messagesPerMonthKey in messagesPerMonth) {
        let messages = messagesPerMonth[messagesPerMonthKey];

        messages.forEach((message) => {
            if (message.role !== "assistant") {
                return;
            }

            let model = message.model;

            tokensPerMonth[message.monthIndex] = tokensPerMonth[message.monthIndex] || {};
            tokensPerMonth[message.monthIndex][model] = tokensPerMonth[message.monthIndex][model] || {input: 0, output: 0};

            tokensPerMonth[message.monthIndex][model].input += Math.min(message.maxContext * contextRate, contextSize);
            tokensPerMonth[message.monthIndex][model].output += message.tokens;
        })
    }

    return tokensPerMonth;
}

export function estimateCostPerMonth(data: ConversationSet) {
    let tokensPerMonth = estimateTokensPerMonth(data);
    let costPerMonth: Record<number, number> = {};

    for (let monthIndex in tokensPerMonth) {
        let monthCost = 0;

        for (let model in tokensPerMonth[monthIndex]) {
            let modelData = tokensPerMonth[monthIndex][model];

            let inputPrice = pricePerToken.gpt3.input;
            let outputPrice = pricePerToken.gpt3.output;

            if(model.includes("gpt-4")) {
                inputPrice = pricePerToken.gpt4.input
                outputPrice = pricePerToken.gpt4.output
            }

            let inputCost = modelData.input * inputPrice;
            let outputCost = modelData.output * outputPrice

            monthCost += inputCost + outputCost;
        }

        costPerMonth[monthIndex] = monthCost;
    }

    return costPerMonth;
}

function getMessageText(message: Message): string {
    if(message.content.parts) {
        return message.content.parts[0]
    }

    if(message.content.text) {
        return message.content.text
    }

    if(message.content.result) {
        return message.content.result
    }

    let errMsg = `No valid content found in message: ${message.id}`;
    throw new Error(errMsg);
}

function getAllMessagesInConversation(conversation: Conversation): Message[] {
    let messages: Message[] = [];

    Object.values(conversation.mapping).forEach((node) => {
        if(node.message) {
            messages.push(node.message);
        }
    })

    return messages;
}