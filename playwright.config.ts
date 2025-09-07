import { defineConfig } from "@playwright/test";

export default defineConfig({
	testDir: "./tests/unit",

	/* Run tests in files in parallel but not within files */
	fullyParallel: false,

	/* Fail the build on CI if you accidentally left test.only in the source code. */
	forbidOnly: !!process.env.CI,

	/* Retry on CI only */
	retries: process.env.CI ? 2 : 0,

	/* Use single worker to avoid state conflicts */
	workers: 1,

	/* Reporter to use. See https://playwright.dev/docs/test-reporters */
	reporter: "html",

	/* Shared settings for all the projects below. */
	use: {
		/* Base URL to use in actions like `await page.goto('/')`. */
		baseURL: "http://localhost:3000",

		/* Collect trace when retrying the failed test. */
		trace: "on-first-retry",
	},

	/* Configure projects for major browsers */
	projects: [
		{
			name: "unit-tests",
			testMatch: "**/*.test.ts",
		},
	],

	/* Run your local dev server before starting the tests */
	webServer: {
		command: "npm run dev",
		url: "http://localhost:3000",
		reuseExistingServer: !process.env.CI,
		timeout: 120000,
	},
});
