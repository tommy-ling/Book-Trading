import mongoose from 'mongoose';
import { randomBytes } from 'crypto';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import { Password } from '../resources/password';

interface UserAttrs {
    email: string;
    password: string;
    name: string;
    userName: string;
    city: string;
}

interface UserModel extends mongoose.Model<UserDoc> {
    build(attrs: UserAttrs): UserDoc;
}

interface UserDoc extends mongoose.Document {
    email: string;
    password: string;
    name: string;
    userName: string;
    city: string;
    version: number;
    bookId?: string[];
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
        bookId: {
            type: [String],
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

userSchema.pre('save', async function (done) {
    if (this.isModified('password')) {
        const salt = randomBytes(8).toString('hex');
        const hashed = await Password.toHash(this.password, salt);
        this.set('password', hashed);
    }
    done();
});

userSchema.statics.build = (attrs: UserAttrs) => {
    return new User(attrs);
};

export const User = mongoose.model<UserDoc, UserModel>('User', userSchema);
