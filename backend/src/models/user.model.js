import mongoose from "mongoose";
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
    {
        fullName : {
            type : String,
            required : true,
            trim : true
        },
        username : {
            type : String,
            required : true,
            unique : true,
            trim : true,
            lowercase : true,
        },
        email : {
            type : String,
            required : true,
            unique : true,
            lowercase : true,
            trim : true,
        },
        password : {
            type : String,
            required : true,
            minLength : 6,
        },
       verified : {
        type : Boolean,
        default : false,
       },
        // chats : [
        //     {
        //         type : mongoose.Schema.Types.ObjectId,
        //         ref : 'Chat',
        //     }
        // ]
    },
    {
        timestamps : true
    }
);

//hashing the password before storing into database
userSchema.pre('save',async function(next) {
    if(!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password,10)

    next();
});
//verifying
userSchema.method.comparePassword = function (candidatePassword){
    return bcrypt.compare(candidatePassword, this.password)
}

const user = mongoose.model("user", userSchema)

export default user
