import * as fs from 'fs';
import sharp from 'sharp';
import * as tmp from 'tmp';
import axios from 'axios';
import crypto from 'crypto';

import { ValidateError } from '../@types/customError';
import path from 'path';
import config from '../config/config';

const _baseUri = path.normalize(`${__dirname}/../../upload`);
const md5 = (plain: string) => (crypto.createHash('md5').update(plain).digest("hex"))

const getHashName = () => {
	return md5(Math.random().toString());
}

const Now = () => Math.round(new Date().getTime() / 1000);

const copyObject = (object: any) => {
	return JSON.parse(JSON.stringify(object))
}

const bufferToTempFile = (buffer: any, extension: string) => {
	const tmpFile = tmp.fileSync({ postfix: extension });
	fs.writeFileSync(tmpFile.name, buffer);
	return tmpFile.name;
}

const bufferToImage = (buffer: any, extension: string) => {
	if (!fs.readdirSync(path.normalize(__dirname))) {
		fs.mkdirSync(path.normalize(__dirname));
	}

	const hashedName = getHashName();
	fs.writeFileSync(`${_baseUri}/${hashedName}.${extension}`, buffer);
	return `${config.backendUrl}/upload/${hashedName}.${extension}`;
}

const bse64ToTempfile = (base64: string) => {
	const base64String = base64.replace(/^data:image\/\w+;base64,/, '');
	const buffer = Buffer.from(base64String, 'base64');
	const tmpFile = tmp.fileSync({ postfix: ".png" });

	fs.writeFileSync(tmpFile.name, buffer);
	return tmpFile.name;
}

const convertImage = async (inputPath: string, size: number = 512) => {
	// Download image from IPFS
	const response = await axios({
		url: inputPath,
		method: 'GET',
		responseType: 'arraybuffer'
	});

	// Create a temporary file to store the downloaded image
	const tmpInputFile = tmp.fileSync({ postfix: ".png" });
	fs.writeFileSync(tmpInputFile.name, response.data);

	const image = sharp(tmpInputFile.name);
	const tmpOutputFile = tmp.fileSync({ postfix: ".png" });

	// const metadata = await image.metadata();
	await image.resize(size, size, { fit: "cover" }).ensureAlpha().png().toFile(tmpOutputFile.name);

	// Check the file size and ensure it's less than 4MB
	const stats = fs.statSync(tmpOutputFile.name);
	if (stats.size > 4 * 1024 * 1024) {
		throw new ValidateError('File size exceeds 4MB limit');
	}

	return tmpOutputFile.name;
}

const downloadImage = async (inputPath: string, size: number = 512) => {
	// Download image from IPFS
	const response = await axios({
		url: inputPath,
		method: 'GET',
		responseType: 'arraybuffer'
	});

	const hashedName = getHashName();
	fs.writeFileSync(`${_baseUri}/${hashedName}.png`, response.data);

	return `${config.backendUrl}/upload/${hashedName}.png`;
}


const convertImage1 = async (inputPath: string, size: number = 512) => {
	const image = sharp(inputPath);
	const tmpOutputFile = tmp.fileSync({ postfix: ".png" });

	// const metadata = await image.metadata();
	await image.resize(size, size, { fit: "cover" }).ensureAlpha().png().toFile(tmpOutputFile.name);

	// Check the file size and ensure it's less than 4MB
	const stats = fs.statSync(tmpOutputFile.name);
	if (stats.size > 4 * 1024 * 1024) {
		throw new ValidateError('File size exceeds 4MB limit');
	}

	return tmpOutputFile.name;
}


export {
	Now,
	md5,
	copyObject,
	bufferToTempFile,
	bse64ToTempfile,
	convertImage,
	convertImage1,
	bufferToImage,
	downloadImage
}