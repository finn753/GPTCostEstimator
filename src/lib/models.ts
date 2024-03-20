export type AuthorRole = "user" | "assistant" | "system" | "tool";

export interface MessageAuthor {
    role: AuthorRole;
    name: string | null;
    metadata: Record<string, any>;
}

export interface MessageContent {
    content_type: string;
    parts: string[] | null;
    text: string | null;
    result: string | null;
}

export interface MessageMetadata {
    model_slug: string | null;
    invoked_plugin: Record<string, any> | null;
    is_user_system_message: boolean | null;
    user_context_message_data: Record<string, any> | null;
}

export interface Message {
    id: string;
    author: MessageAuthor;
    create_time: number | null;
    update_time: number | null;
    content: MessageContent;
    status: string;
    end_turn: boolean | null;
    weight: number;
    metadata: MessageMetadata;
    recipient: string;
}

export interface Node {
    id: string;
    message: Message | null;
    parent: string | null;
    children: string[];
    parent_node: Node | null;
    children_nodes: Node[];
}

export interface Conversation {
    title: string;
    create_time: number;
    update_time: number;
    mapping: Record<string, Node>;
    moderation_results: any[];
    current_node: string;
    plugin_ids: string[] | null;
    conversation_id: string;
    conversation_template_id: string | null;
    id: string | null;
}

export type ConversationSet = Conversation[]