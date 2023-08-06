import mongoose from 'mongoose';

interface ChatAttrs {
    username: string;
    createdAt: number;
    text: string;
    room: string;
}

interface ChatModel extends mongoose.Model<ChatDoc> {
    build(attrs: ChatAttrs): ChatDoc;
}

export interface ChatDoc extends mongoose.Document {
    username: string;
    createdAt: number;
    text: string;
    room: string;
}

const chatSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
        },
        createdAt: {
            type: Number,
            required: true,
        },
        text: {
            type: String,
            required: true,
        },
        room: {
            type: String,
            required: true,
        },
    },
    {
        toJSON: {
            transform(doc, ret) {
                ret.id = ret._id;
                delete ret._id;
            },
        },
    }
);

chatSchema.statics.build = (attrs: ChatAttrs) => {
    return new Chat(attrs);
};

export const Chat = mongoose.model<ChatDoc, ChatModel>('Chat', chatSchema);
