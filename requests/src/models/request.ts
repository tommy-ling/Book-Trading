import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import { BookDoc } from './book';
import { UserDoc } from './user';

interface RequestAttrs {
    fromUser: UserDoc;
    toUser: UserDoc;
    fromBook: BookDoc;
    toBook: BookDoc;
    status: string;
}

interface RequestDoc extends mongoose.Document {
    fromUser: UserDoc;
    toUser: UserDoc;
    fromBook: BookDoc;
    toBook: BookDoc;
    status: string;
    version: number;
}

interface RequestModel extends mongoose.Model<RequestDoc> {
    build(attrs: RequestAttrs): RequestDoc;
}

const requestSchema = new mongoose.Schema(
    {
        fromUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        toUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        fromBook: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Book',
        },
        toBook: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Book',
        },
        status: {
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
requestSchema.set('versionKey', 'version');
requestSchema.plugin(updateIfCurrentPlugin);

requestSchema.statics.build = (attrs: RequestAttrs) => {
    return new Request(attrs);
};

const Request = mongoose.model<RequestDoc, RequestModel>('request', requestSchema);

export { Request };
