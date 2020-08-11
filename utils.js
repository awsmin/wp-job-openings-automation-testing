const yargs = require("yargs");
const colors = require("colors/safe");

const argv = yargs
	.usage("Usage: $0 [options]")
	.example("$0 -f resume.docx")
	.alias("f", "file")
	.nargs("f", 1)
	.describe("f", "Resume for Upload")
	.default("f", "./assets/resume.pdf")
	.alias("p", "preview")
	.describe("p", "Preview Mode")
	.help("h")
	.alias("h", "help")
	.boolean(['p'])
	.argv;

colors.setTheme({
	success: ["green", "bold"],
	error: ["red", "bold"],
});

const logTask = (msg, isSuccess = true) => {
	if (isSuccess) {
		console.log(`${colors.success("\u2713")} ${msg}`);
	} else {
		console.log(`${colors.error("\u2717")} ${msg}`);
	}
};

const removeSlash = (str) => {
	return str.replace(/^\/|\/$/g, "");
};

const buildUrl = (data) => {
	let urlData = data.map(removeSlash);
	return urlData.join("/");
};

module.exports = { argv, logTask, buildUrl };
