// import { Given, When, Then, Before, After } from '@cucumber/cucumber';
// import puppeteer from 'puppeteer';
// import assert from 'assert';

// let browser;
// let page;
// const BASE_URL = 'http://localhost:5173'; // Your dev server URL

// // Hooks
// Before(async function() {
//   browser = await puppeteer.launch({ 
//     headless: false, // Set to true in CI environments
//     slowMo: 50 // Slows down by 50ms
//   });
//   page = await browser.newPage();
// });

// After(async function() {
//   await browser.close();
// });

// // Given steps
// Given('I am on the registration page', async function() {
//   await page.goto(`${BASE_URL}/register`);
//   // Wait for the form to be visible
//   await page.waitForSelector('form');
// });

// Given('I am on the login page', async function() {
//   await page.goto(`${BASE_URL}/login`);
//   await page.waitForSelector('form');
// });

// // When steps
// When('I enter valid registration details', async function(dataTable) {
//   const formData = dataTable.rowsHash();
//   await page.type('input[name="username"]', formData.username);
//   await page.type('input[name="email"]', formData.email);
//   await page.type('input[name="password"]', formData.password);
// });

// When('I submit the registration form', async function() {
//   await page.click('button[type="submit"]');
// });

// When('I enter valid login credentials', async function(dataTable) {
//   const formData = dataTable.rowsHash();
//   await page.type('input[name="username"]', formData.username);
//   await page.type('input[name="password"]', formData.password);
// });

// When('I submit the login form', async function() {
//   await page.click('button[type="submit"]');
// });

// // Then steps
// Then('I should be redirected to the login page', async function() {
//   await page.waitForNavigation();
//   const currentUrl = page.url();
//   assert(currentUrl.includes('/login'), `Expected URL to include /login but got ${currentUrl}`);
// });

// Then('I should see a success message', async function() {
//   await page.waitForSelector('.message.success');
//   const messageText = await page.$eval('.message.success', el => el.textContent);
//   assert(messageText.length > 0, 'Success message should not be empty');
// });

// Then('I should be logged in successfully', async function() {
//   // Wait for JWT token to be stored in localStorage
//   await page.waitForFunction(() => {
//     return localStorage.getItem('authToken') !== null;
//   });
// });

// Then('I should see my user profile', async function() {
//   await page.waitForSelector('.user-profile', { timeout: 5000 });
// });