import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: "New Chat",
      trim: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    messages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
      },
    ],

    isPinned: {
      type: Boolean,
      default: false,
    },

    lastMessage: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Chat = mongoose.model("Chat", chatSchema);

export default Chat;