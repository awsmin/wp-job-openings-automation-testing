require("dotenv").config();

const puppeteer = require("puppeteer");
const utils = require("./utils");
const fs = require("fs");
const jsonfile = require("jsonfile");

// Form Data.
const dataObj = jsonfile.readFileSync("./data.json");

// create results directory if doesn't exist,
const resultsDirName = "results";
if (!fs.existsSync(`./${resultsDirName}`)) {
	fs.mkdirSync(`./${resultsDirName}`);
}

(async () => {
	const width = parseInt(process.env.WIDTH, 10);
	const height = parseInt(process.env.HEIGHT, 10);
	let launchOptions = {};
	if (utils.argv.preview) {
		launchOptions = {
			headless: false,
			defaultViewport: {
				width: width,
				height: height,
			},
			args: [`--window-size=${width},${height}`],
			ignoreDefaultArgs: ['--enable-automation']
		};
	}
	launchOptions.ignoreHTTPSErrors = true;
	const browser = await puppeteer.launch(launchOptions);
	const page = await browser.newPage();

	const jobURL = utils.buildUrl([
		process.env.SITE_URL,
		process.env.JOBS_SLUG,
		process.env.JOB_SLUG,
	]);

	await page.setViewport({ width: width, height: height });

	await page.goto(jobURL);

	utils.logTask("Job Detail Page View");

	if (!utils.argv.preview) {
		await page.screenshot({
			path: `${resultsDirName}/001-job-page.png`,
			fullPage: true,
		});
	}

	await page.waitForSelector(".awsm-job-form #awsm-applicant-name");
	try {
		await page.focus(".awsm-job-form #awsm-applicant-name");
	} catch (e) {}
	
	if (utils.argv.preview) {
		await page.waitFor(1000);
	}

	await page.type(".awsm-job-form #awsm-applicant-name", dataObj.form.name);

	if (utils.argv.preview) {
		await page.waitFor(1000);
	}

	await page.waitForSelector(".awsm-job-form #awsm-application-submit-btn");
	try {
		await page.click(".awsm-job-form #awsm-application-submit-btn");
	} catch (e) {
		await page.evaluate(() =>
			document
				.querySelector(".awsm-job-form #awsm-application-submit-btn")
				.click()
		);
	}
	
	utils.logTask("Test Form Validation");

	if (!utils.argv.preview) {
		await page.screenshot({
			path: `${resultsDirName}/002-form-validation.png`,
			fullPage: true,
		});
	}

	await page.waitForSelector(".awsm-job-form #awsm-applicant-email");
	try {
		await page.click(".awsm-job-form #awsm-applicant-email");
	} catch (e) {}
	
	await page.type(".awsm-job-form #awsm-applicant-email", dataObj.form.email);

	await page.waitForSelector(".awsm-job-form #awsm-applicant-phone");
	await page.type(".awsm-job-form #awsm-applicant-phone", dataObj.form.phone);

	await page.waitForSelector(".awsm-job-form #awsm-cover-letter");
	await page.type(
		".awsm-job-form #awsm-cover-letter",
		dataObj.form.coverLetter
	);

	await page.waitForSelector(".awsm-job-form #awsm-application-file");
	const [fileChooser] = await Promise.all([
		page.waitForFileChooser(),
		page.evaluate(() =>
			document
				.querySelector(".awsm-job-form #awsm-application-file")
				.click()
		),
	]);
	await fileChooser.accept([utils.argv.file]);

	await page.waitForSelector(".awsm-job-form #awsm_form_privacy_policy");
	try {
		await page.click(".awsm-job-form #awsm_form_privacy_policy");
	} catch (e) {
		await page.evaluate(() =>
		document
			.querySelector(".awsm-job-form #awsm_form_privacy_policy")
			.click()
		);
	}
	if (utils.argv.preview) {
		await page.waitFor(3000);
	}
	
	if (!utils.argv.preview) {
		await page.screenshot({
			path: `${resultsDirName}/003-application-before-submission.png`,
			fullPage: true,
		});
	}

	await page.waitForSelector(".awsm-job-form #awsm-application-submit-btn");
	try {
		await page.click(".awsm-job-form #awsm-application-submit-btn");
	} catch (e) {
		await page.evaluate(() =>
		document
			.querySelector(".awsm-job-form #awsm-application-submit-btn")
			.click()
		);
	}

	let isSuccess = 0;
	try {
		await page.waitForSelector(
			"div.awsm-application-message.awsm-success-message"
		);
		isSuccess = await page.$$eval(
			"div.awsm-application-message.awsm-success-message",
			(divs) => divs.length
		);
	} catch (e) {
		isSuccess = 0;
	}

	if (isSuccess) {
		utils.logTask("Application form successfully submitted!");
	} else {
		utils.logTask("Error in submitting application!", false);
	}

	await page.waitFor(3000);

	if (!utils.argv.preview) {
		await page.screenshot({
			path: `${resultsDirName}/004-application-submission.png`,
			fullPage: true,
		});
	}

	if (isSuccess) {
		// Login
		const loginURL = utils.buildUrl([process.env.SITE_URL, "wp-login.php"]);
		await page.goto(loginURL);

		await page.waitFor(3000);

		await page.waitForSelector("#loginform #user_login");
		await page.type("#loginform #user_login", process.env.WP_LOGIN_USER);

		await page.waitForSelector("#loginform #user_pass");
		await page.type("#loginform #user_pass", process.env.WP_LOGIN_PASS);

		await page.waitForSelector("#loginform #wp-submit");

		let loggedIn = false;
		try {
			const [response] = await Promise.all([
				page.waitForNavigation(),
				page.click("#loginform #wp-submit"),
			]);
			loggedIn = response ? true : false;
		} catch (e) {
			utils.logTask("Login Failed!", false);
		}

		if (loggedIn) {
			utils.logTask("Logged In!");

			// View Application
			const applicationURL = utils.buildUrl([
				process.env.SITE_URL,
				"wp-admin/edit.php?post_type=awsm_job_application",
			]);
			await page.goto(applicationURL, { waitUntil: "domcontentloaded" });

			await page.waitForSelector("#the-list .row-title:first-child");
			await Promise.all([
				page.waitForNavigation(),
				page.click("#the-list .row-title:first-child"),
			]);

			utils.logTask("View Submitted Application");

			if (!utils.argv.preview) {
				await page.screenshot({
					path: `${resultsDirName}/005-application-edit.png`,
					fullPage: true,
				});
			}
		}
	}

	if (!utils.argv.preview) {
		await browser.close();
	}
})();
