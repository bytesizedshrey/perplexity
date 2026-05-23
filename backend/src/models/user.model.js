import mongoose from "mongoose";
import bcrypt from 'bcrypt';   

const userSchema = new mongoose.Schema(
    {
        fullname : {
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
userSchema.pre('save',async function() {
    if(!this.isModified('password')) return ;
    this.password = await bcrypt.hash(this.password,10)

    
});
//verifying
userSchema.methods.comparePassword = async function (candidatePassword){
    return await bcrypt.compare(candidatePassword, this.password)
}

const userModel = mongoose.model("user", userSchema)

export default userModel
