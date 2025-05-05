// import { Given, When, Then } from '@cucumber/cucumber';
// import assert from 'assert';

// // Reuse existing login step or define it again
// Given('I am logged in as a regular user', async function() {
//   await page.goto(`${BASE_URL}/login`);
//   await page.type('input[name="username"]', 'testuser');
//   await page.type('input[name="password"]', 'SecurePassword123!');
//   await page.click('button[type="submit"]');
//   
//   await page.waitForFunction(() => {
//     return localStorage.getItem('authToken') !== null;
//   });
// });

// Given('there are products in the system', async function() {
//   // This step assumes products are already seeded in the database
// });

// When('I navigate to the product list page', async function() {
//   await page.goto(`${BASE_URL}/products`);
//   await page.waitForSelector('.product-list');
// });

// When('I click on a product named {string}', async function(productName) {
//   const productXPath = `//div[contains(@class, "product-item")]//h3[contains(text(), "${productName}")]`;
//   await page.waitForXPath(productXPath);
//   const [productElement] = await page.$x(productXPath);
//   await productElement.click();
// });

// Given('I am viewing the profile for product {string}', async function(productName) {
//   await page.goto(`${BASE_URL}/products`);
//   await page.waitForSelector('.product-list');
//   
//   const productXPath = `//div[contains(@class, "product-item")]//h3[contains(text(), "${productName}")]`;
//   await page.waitForXPath(productXPath);
//   const [productElement] = await page.$x(productXPath);
//   await productElement.click();
//   
//   await page.waitForSelector('.product-profile');
// });

// When('I click on "Write a Review" button', async function() {
//   await page.click('button.btn-primary');
//   await page.waitForSelector('.review-modal-content');
// });

// When('I provide the following product ratings', async function(dataTable) {
//   const ratings = dataTable.rowsHash();
//   
//   for (const [category, rating] of Object.entries(ratings)) {
//     const ratingRow = `.rating-row:has(.rating-label:contains("${category.charAt(0).toUpperCase() + category.slice(1)}:"))`;
//     await page.waitForSelector(ratingRow);
//     
//     const cookieIndex = Math.round(parseFloat(rating) * 2) - 1;
//     await page.click(`${ratingRow} .cookie-rating .cookie:nth-child(${cookieIndex})`);
//   }
// });

// When('I enter {string} as review text', async function(reviewText) {
//   await page.type('textarea.comments-input', reviewText);
// });

// When('I submit the review', async function() {
//   await page.click('button:contains("Submit Review")');
// });

// Then('I should see the product details', async function() {
//   await page.waitForSelector('.product-profile');
//   const productName = await page.$eval('.product-name', el => el.textContent);
//   assert(productName.length > 0, 'Product name should be displayed');
// });

// Then('I should see the product\'s average rating', async function() {
//   await page.waitForSelector('.product-rating');
// });

// Then('I should see a success message', async function() {
//   await page.waitForSelector('.notification-success', { timeout: 5000 });
// });

// Then('my review should appear in the product\'s review list', async function() {
//   await page.waitForSelector('.reviews-list');
//   await page.waitForXPath('//div[contains(@class, "review-card")]//p[contains(text(), "Delicious and worth every penny")]');
// });