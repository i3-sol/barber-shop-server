import * as fs from "fs";
import axios from "axios";
import OpenAI from 'openai';
import { getTextToSpeech } from "./google-cloud";

import config from '../../config/config';
import { downloadImage } from "../../utils";
import { setlog } from "../../utils/setlog";

const client = new OpenAI({
	apiKey: config.OPENAI_API_KEY,
})

const getNikudText = async (text: string, textLang: string): Promise<string> => {
	try {
		if (textLang === "he") {
			const payload = {
				model: "gpt-4o",
				messages: [
					{ role: "system", content: "You are a helpful assistant that processes Hebrew text." },
					{ role: "system", content: "Please add Nikud to the following Hebrew text: " },
					{ role: "user", content: text }
				]
			}

			const response = await client.chat.completions.create(payload as any);
			const message = response.choices[0].message;
			return message.content;
		}

		return text;
	} catch (err: any) {
		return text;
	}
}

const getEnglishFromHebrew = async (text: string, textLang: string) => {
	try {
		if (textLang === "he") {
			const payload = {
				model: "gpt-4o",
				messages: [
					{ role: "system", content: "You are a helpful assistant that processes Hebrew text to English." },
					{ role: "user", content: text }
				]
			}

			const response = await client.chat.completions.create(payload as any);
			const message = response.choices[0].message;
			return message.content;
		}

		return text;
	} catch (err: any) {
		return text;
	}
}

const getChatUsingChatGPT = async (messages: ChatContentObject[], textLang: string, image: any) => {
	try {
		const latestMessage = messages[messages.length - 1];
		// const imgbase64 = image.toString('base64');

		if (!!latestMessage.image) {
			// const convertImageUrl = await convertImage(latestMessage.image);	
			const base64Image = image.toString('base64');
			const prompt = await getEnglishFromHebrew(latestMessage.content, textLang);

			const body = {
				"url": "base64," + base64Image,
				"width": 1024,
				"height": 1024,
				"background": {
					"generate": {
						"description": prompt,
						"adapter_type": "face"
					}
				}
			}

			console.log(body.background.generate.description)
			const response = await axios.post('https://deep-image.ai/rest_api/process_result', body, {
				headers: {
					'Content-Type': 'application/json',
					'X-Api-Key': config.DEEP_IMAGE_KEY,
				}
			})

			const outputUri = await downloadImage(response.data.result_url);
			console.log(outputUri);

			return { role: "assistant", content: "", image: outputUri, audioUrl: "" }
		} else {
			const heLang = "Please answer the user's latest question in Hebrew only, in a maximum of 4 sentences.";
			const enLang = "Please answer from only Native English about user latest question, in a maximum of 4 sentences.";

			console.log(textLang);

			const answerType = textLang === 'he' ? heLang : enLang;
			const languageTypeMessage = { role: "system", content: answerType };
			const payload = { model: 'gpt-4o', messages: [...messages, languageTypeMessage] }

			const response = await client.chat.completions.create(payload as any);
			const message = response.choices[0].message;

			const cleanMessage = message.content.replace(/[^\u0590-\u05FFa-zA-Z0-9.!:;-=?+()\\\/><$#@%& ]+/g, '');
			
			const text = await getNikudText(cleanMessage, textLang);
			const audioUrl = await getTextToSpeech(text, textLang);
			// const audioUrl = await getTalkVideo(text);

			return { role: message.role, content: cleanMessage, image: "", audioUrl: audioUrl };
		}
	} catch (error) {
		console.log("getChatUsingChatGPT: ", error)
	}
}

const getChatSummaryPrompt = async (messages: ChatContentObject[]) => {
	const payload = { model: 'gpt-4o', messages: messages }

	const response = await client.chat.completions.create(payload as any);
	const summary = response.choices[0].message;
	return summary.content;
}

const speechToText = async (filePath: string) => {
	const transcription = await client.audio.transcriptions.create({
		file: fs.createReadStream(filePath),
		model: "whisper-1",
		language: "en"
	})

	return transcription.text;
}

export { getChatUsingChatGPT, getChatSummaryPrompt, speechToText };

