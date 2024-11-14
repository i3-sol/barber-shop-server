import sha256 from "sha256";

const getHashPassword = (param: string) => {
	return String(sha256.x2(param));
}
const session = {} as {[key: string]: string};

const generateCode = () => {
    return Math.floor(100000 + Math.random() * 900000);
}

export { getHashPassword, session, generateCode };