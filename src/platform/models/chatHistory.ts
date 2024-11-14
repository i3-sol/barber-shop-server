import mongoose from "mongoose";
const Schema = mongoose.Schema;

const ChatHistorySchema = new Schema({
	email: { type: String, required: true },
	role: { type: String, required: true },
	text: { type: String, default: "" },
	image: { type: String, default: "" },
}, {
	timestamps: true
})

const ChatHistoryModel = mongoose.model("chatHistory", ChatHistorySchema);

export { ChatHistoryModel };