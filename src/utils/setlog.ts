import * as fs from "fs";
import colors from "colors";

function getFileName() {
	const date = new Date()
	const tempYear = date.getUTCFullYear()
	const tempDate = ("0" + date.getUTCDate()).slice(-2)
	const tempMonth = ("0" + (date.getUTCMonth() + 1)).slice(-2)
	const tempName = [tempYear, tempDate, tempMonth].join('-') + '.log'

	return __dirname + "/../../logs/" + tempName
}

function getLogContent(title: string, msg?: string, show?: boolean) {
	const date = new Date();
	const tempHour = ("0" + date.getUTCHours()).slice(-2)
	const tempMinutes = ("0" + date.getUTCMinutes()).slice(-2)
	const tempSeconds = ("0" + date.getUTCSeconds()).slice(-2)
	const tempTime = [tempHour, tempMinutes, tempSeconds].join(':')

	// if (!!show) {}
	const logTitle = colors.white(title)
	const logTime = colors.gray("[" + tempTime + "]")
	const logMessage = msg ? ": " + colors.red(msg) : ''
	console.log(logTime, logTitle, logMessage)

	return `[${tempTime}] ${title}\r\n${msg ? msg + "\r\n" : ""}`
}

const setlog = function (title: string, msg?: string, show?: boolean) {
	fs.appendFileSync(getFileName(), getLogContent(title, msg, !!show))
}

export { setlog }