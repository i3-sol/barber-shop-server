import { Response } from "express";

import platformDatas from "../data-access";
import uerServices from "../../auth/services";
import { bufferToImage, bufferToTempFile } from "../../utils";
import { getErrorCode } from "../../utils/platform";
import { ValidateError } from "../../@types/customError";
import { createNewChatHistory } from "../services/chatHistory";
import { getChatSummaryPrompt, getChatUsingChatGPT } from "../services/useChatGPT";
import { getSpeechToText } from "../services/google-cloud";
import authDatas from "../../auth/data-access";
import { setlog } from "../../utils/setlog";

const getSystemContent = (summary: string, userName: string): string => {
	if (!!summary) {
		return `Here are chat summary with user: '${summary}'\n please answer to user question.`
	} else {
		return `Hi ${userName}, how can I assist you?`
	}
}

const platformController = {
	sendContent: async (req: any, res: Response) => {
		try {
			const startTime = +new Date()
			const email = req.user.email;
			const { content, lang } = req.body;
			const textLang = lang === "he" ? 'he' : 'en-US';

			let imageUrl = "";
			if (req?.files?.image?.data) {
				const imageData = req.files.image.data;
				// imageUrl = await fileUploadToIpfs(imageData);
				imageUrl = bufferToImage(imageData, 'png');
			}

			const userData = await uerServices.checkUserData(email);
			const userName = `${userData.firstName} ${userData.lastName}`;
			await createNewChatHistory(userData.email, "user", content, imageUrl);

			const messages: ChatContentObject[] = [
				{
					image: "",
					role: "system",
					content: "We are Avichai's barbershop Company. You are a memeber of Avichai's barbershop support team.",
				}, {
					image: "",
					role: "system",
					content: getSystemContent(userData.chatSummary, userName),
				}, {
					role: "user",
					content: content,
					image: imageUrl,
				},
			]

			const result: any = await getChatUsingChatGPT(messages, textLang, req?.files?.image?.data);

			const resultData = {
				role: "assistant",
				content: result.content,
				image: result.image,
				audioUrl: result.audioUrl
			}

			const summaryMessages: ChatContentObject[] = [
				...messages, {
					role: "assistant",
					content: result.content,
					image: result.image,
				}, {
					image: "", role: "system",
					content: "Here are the chat history with the user.\n We need details prompt summary.\n We have to remember all chat of user and assistant",
				}
			]

			const chatSummary = await getChatSummaryPrompt(summaryMessages);
			await authDatas.AuthDB.update({
				filter: { email: userData.email },
				update: { chatSummary: chatSummary },
			})

			console.log("chat_summary_result::", chatSummary);
			console.log(result.content);

			await createNewChatHistory(email, "assistant", result.content, result.image);
			res.status(200).json(resultData);
			setlog("total time: ", (+new Date() - startTime).toLocaleString() + "s")
		} catch (err: any) {
			console.log("sendContent_error::", err.message);
			const { errCode, errMsg } = getErrorCode(err);
			return res.status(errCode).send({ message: errMsg });
		}
	},

	getChatHistories: async (req: any, res: Response) => {
		try {
			const email = req.user.email;
			const userData = await uerServices.checkUserData(email);
			const chatHistorys: ChatContentObject[] = await platformDatas.ChatHistoryDB.findChatHistorys(userData.email);
			res.status(200).json(chatHistorys);
		} catch (err: any) {
			const { errCode, errMsg } = getErrorCode(err);
			return res.status(errCode).send({ message: errMsg });
		}
	},

	speechToText: async (req: any, res: Response) => {
		try {
			const { lang } = req.body;
			const audioFile = req.files.audioFile;
			const textLang = lang === "he" ? 'he' : 'en-US';

			if (!audioFile?.name) {
				throw new ValidateError("Audio file is not exists!");
			}

			const filePath = bufferToTempFile(audioFile.data, ".mp4");
			const text = await getSpeechToText(filePath, textLang);
			// const text = await speechToText(filePath);

			console.log("speechText::", text);
			res.status(200).json({ text: text });
		} catch (err: any) {
			console.log("SpeechToText_error::", err.message)
			const { errCode, errMsg } = getErrorCode(err);
			return res.status(errCode).send({ message: errMsg });
		}
	},
}

export default platformController;
