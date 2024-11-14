import fs from "fs";
import axios from "axios";
import { SpeechClient } from "@google-cloud/speech";
import { TextToSpeechClient } from "@google-cloud/text-to-speech";

import config from "../../config/config";
import { bufferToImage } from "../../utils";

const speechClient = new SpeechClient();
const textToSpeechclient = new TextToSpeechClient();

const getTextToSpeech = async (text: string, lang: string) => {
	try {
		const request: any = {
			input: { text: text },
			voice: { languageCode: lang, ssmlGender: 'MALE' },
			audioConfig: { audioEncoding: 'MP3' },
		}

		const [response] = await textToSpeechclient.synthesizeSpeech(request);
		// const audioUrl = await fileUploadToIpfs(response.audioContent);
		const audioUrl = bufferToImage(response.audioContent, "mp3");

		return audioUrl;
	} catch (err: any) {
		console.log("getTextToSpeech_error", err.message);
		return "";
	}
}

const pollForVideoUrl = async (talkId: string) => {
	const pollInterval = 5 * 1000; // 5 seconds
	const maxPolls = 20; // 1 minutes
	let numPolls = 0;

	while (numPolls < maxPolls) {
		const response = await axios.request({
			method: "GET",
			url: `https://api.d-id.com/talks/${talkId}`,
			headers: {
				accept: "application/json",
				authorization: `Basic ${btoa(config.DID_API_KEY)}`,
			},
		})

		if (response.statusText === "OK") {
			const data = await response.data;

			console.log(data.result_url)
			if (data.result_url) {
				return data.result_url;
			}
		} else {
			throw new Error(`HTTP error! Status: ${response.status}`);
		}

		await new Promise(resolve => setTimeout(resolve, pollInterval));
		numPolls++;
	}

	throw new Error('Timed out waiting for video URL');
}

const getTalkVideo = async (text: string) => {
	try {
		const options = {
			method: "POST",
			url: "https://api.d-id.com/talks",
			headers: {
				accept: "application/json",
				"content-type": "application/json",
				Authorization: `Basic ${btoa(config.DID_API_KEY)}`,
			},
			data: {
				source_url: "https://seagull-guiding-warthog.ngrok-free.app/upload/09f08ec8082cf9d8f2515f43ca14a5b4.png",
				script: {
					type: 'text',
					input: text
				},
				audio_config: {
					enabled: false
				},
				persist: false
			}
		}

		const create_result = await axios.request(options);
		const talkVideoUrl = await pollForVideoUrl(create_result.data.id);
		return talkVideoUrl;
	} catch (err: any) {
		console.log("getTalkVideo_Error::", err.message);
		return "";
	}
}

const getSpeechToText = async (filePath: any, lang: string) => {
	try {
		const audioFile = fs.readFileSync(filePath);
		const audioBytes = audioFile.toString('base64');

		const request: any = {
			audio: {
				content: audioBytes,
			},
			config: {
				encoding: 'MP3',
				sampleRateHertz: 16000,
				languageCode: lang,
			}
		}

		const [response] = await speechClient.recognize(request);
		const transcription = response.results?.map(result => result.alternatives?.[0].transcript).join('\n');
		// const speechText = await getTextToSpeech(transcription, lang);

		// console.log(`Transcription: ${transcription}`, response.results.length);
		return transcription;
	} catch (err: any) {
		console.log(err.message);
		return "";
	}
}

export { getTextToSpeech, getSpeechToText, getTalkVideo }