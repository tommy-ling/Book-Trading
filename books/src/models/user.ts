import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

interface UserAttrs {
    id: string;
    email: string;
    password: string;
    name: string;
    userName: string;
    city: string;
}

interface UserModel extends mongoose.Model<UserDoc> {
    build(attrs: UserAttrs): UserDoc;
    findByEvent(event: { id: string; version: number }): Promise<UserDoc | null>;
}

export interface UserDoc extends mongoose.Document {
    email: string;
    version: string;
    password: string;
    name: string;
    userName: string;
    city: string;
}

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        userName: {
            type: String,
            required: true,
        },
        city: {
            type: String,
            required: true,
        },
    },
    {
        toJSON: {
            transform(doc, ret) {
                ret.id = ret._id;
                delete ret._id;
                delete ret.password;
            },
        },
    }
);

userSchema.set('versionKey', 'version');
userSchema.plugin(updateIfCurrentPlugin);

userSchema.statics.findByEvent = (event: { id: string; version: number }) => {
    return User.findOne({
        _id: event.id,
        version: event.version - 1,
    });
};
userSchema.statics.build = (attrs: UserAttrs) => {
    return new User({
        _id: attrs.id,
        email: attrs.email,
        password: attrs.password,
        userName: attrs.userName,
        city: attrs.city,
        name: attrs.name,
    });
};

export const User = mongoose.model<UserDoc, UserModel>('User', userSchema);
