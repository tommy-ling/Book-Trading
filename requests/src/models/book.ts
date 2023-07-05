import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import { UserDoc } from './user';

interface BookAttrs {
    id: string;
    title: string;
    user: UserDoc;
}

interface BookModel extends mongoose.Model<BookDoc> {
    build(attrs: BookAttrs): BookDoc;
    findByEvent(event: { id: string; version: number }): Promise<BookDoc | null>;
}

export interface BookDoc extends mongoose.Document {
    version: string;
    title: string;
    user: UserDoc;
    currentStatus?: string;
}

const bookSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        currentStatus: {
            type: String,
            default: null,
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

bookSchema.set('versionKey', 'version');
bookSchema.plugin(updateIfCurrentPlugin);

bookSchema.statics.findByEvent = (event: { id: string; version: number }) => {
    return Book.findOne({
        _id: event.id,
        version: event.version - 1,
    });
};
bookSchema.statics.build = (attrs: BookAttrs) => {
    return new Book({
        _id: attrs.id,
        title: attrs.title,
        user: attrs.user,
    });
};

export const Book = mongoose.model<BookDoc, BookModel>('Book', bookSchema);
