# WP Job Openings Automation Testing

Automation Testing scripts for WP Job Openings using Puppeteer. Both headless and non-headless modes are supported.

## Setup

- Clone the Repo
- Execute `npm install` command from the root of the project
- Copy and rename the `.env.example` file to `.env` and configure the settings
- Now, execute the `npm start` command from the root of the project

### Options

`node application.js --help`

```
Usage: application.js [options]

Options:
  --version      Show version number                                   [boolean]
  -f, --file     Resume for Upload              [default: "./assets/resume.pdf"]
  -p, --preview  Preview Mode                                          [boolean]
  -h, --help     Show help                                             [boolean]

Examples:
  application.js -f resume.docx
```

## Demo

### Headless Mode

<img src="https://raw.githubusercontent.com/awsmin/wp-job-openings-automation-testing/master/assets/headless-mode.png" alt="Headless Mode"  width="600" />

### Browser Preview

<img src="https://raw.githubusercontent.com/awsmin/wp-job-openings-automation-testing/master/assets/browser-preview.gif" alt="Browser Preview"  width="600" />
