import platformDatas from "../data-access";

const createNewChatHistory = async (email: string, role: string, text: string, image: string) => {
	await platformDatas.ChatHistoryDB.create({
		email: email, role: role, text: text, image: image
	})
}

export { createNewChatHistory };