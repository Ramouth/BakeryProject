// import { Given, When, Then } from '@cucumber/cucumber';
// import assert from 'assert';

// // Shared steps
// Given('I am logged in as an administrator', async function() {
//   await page.goto(`${BASE_URL}/login`);
//   await page.type('input[name="username"]', 'admin');
//   await page.type('input[name="password"]', 'admin123');
//   await page.click('button[type="submit"]');
//   
//   // Wait for login to complete and redirect to admin dashboard
//   await page.waitForNavigation();
//   await page.waitForSelector('.admin-container');
// });

// // Bakery review management steps
// Given('there are bakery reviews in the system', async function() {
//   // This step assumes reviews are already seeded in the database
// });

// When('I navigate to the admin bakery review list', async function() {
//   await page.goto(`${BASE_URL}/admin-dashboard/bakery-reviews`);
//   await page.waitForSelector('.table');
// });

// Then('I should see all bakery reviews', async function() {
//   const reviewCount = await page.$$eval('table tbody tr', rows => rows.length);
//   assert(reviewCount > 0, 'Expected to see at least one review');
// });

// When('I click the "Delete" button for a review', async function() {
//   // Find the first review's delete button and click it
//   const deleteButtonSelector = 'table tbody tr:first-child button:contains("Delete")';
//   await page.waitForSelector(deleteButtonSelector);
//   
//   // Store the current number of rows to verify deletion later
//   this.initialRowCount = await page.$$eval('table tbody tr', rows => rows.length);
//   
//   // Click delete and confirm in the dialog
//   await page.click(deleteButtonSelector);
//   await page.on('dialog', async dialog => {
//     await dialog.accept();
//   });
// });

// Then('the review should be removed from the list', async function() {
//   // Wait for the table to update
//   await page.waitForTimeout(1000);
//   
//   // Check that there's one fewer row
//   const newRowCount = await page.$$eval('table tbody tr', rows => rows.length);
//   assert.strictEqual(newRowCount, this.initialRowCount - 1, 'A row should have been removed');
// });

// // Product management steps
// Given('there are products in the system', async function() {
//   // This step assumes products are already seeded in the database
// });

// When('I navigate to the admin product list', async function() {
//   await page.goto(`${BASE_URL}/admin-dashboard/products`);
//   await page.waitForSelector('.table');
// });

// When('I click the "Update" button for {string}', async function(productName) {
//   const updateButtonXPath = `//tr[contains(.,"${productName}")]//button[contains(text(),"Edit")]`;
//   await page.waitForXPath(updateButtonXPath);
//   const [updateButton] = await page.$x(updateButtonXPath);
//   await updateButton.click();
//   
//   // Wait for the edit modal to appear
//   await page.waitForSelector('.modal');
// });

// When('I change the price to {string}', async function(newPrice) {
//   await page.type('input[name="price"]', newPrice, { clear: true });
// });

// When('I save the changes', async function() {
//   await page.click('.modal button:contains("Update")');
// });

// Then('I should see a success message', async function() {
//   await page.waitForSelector('.notification-success', { timeout: 5000 });
// });

// Then('the product price should be updated to {string}', async function(expectedPrice) {
//   // Reload the page to verify the changes persisted
//   await page.reload();
//   
//   // Find the product and check its price
//   const priceXPath = `//tr[contains(.,"Test Product")]//td[contains(@class,"price")]`;
//   await page.waitForXPath(priceXPath);
//   const [priceCell] = await page.$x(priceXPath);
//   const actualPrice = await page.evaluate(el => el.textContent.trim(), priceCell);
//   
//   assert.strictEqual(actualPrice, expectedPrice, `Expected price to be ${expectedPrice}`);
// });