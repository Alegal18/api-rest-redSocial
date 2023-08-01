const { Schema, model} = require('mongoose')

const UserSchema = Schema({
    name: {
        type: String,
        required: true
    },
    surname: String,
    nick: {
        type: String,
        required: true        
    },
    bio: String,
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: "role_user"
    },
    image: {
        type: String,
        default: "default.png"
    },
    crated_at: {
        type: Date,
        default: Date.now,
    }
});

module.exports= model("User", UserSchema, "users")