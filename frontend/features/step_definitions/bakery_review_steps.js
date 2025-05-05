import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'assert';


Given('I am logged in as a regular user', async function() {
  await page.goto(`${BASE_URL}/login`);
  await page.type('input[name="username"]', 'testuser');
  await page.type('input[name="password"]', 'SecurePassword123!');
  await page.click('button[type="submit"]');
  
  // Wait for authentication to complete
  await page.waitForFunction(() => {
    return localStorage.getItem('authToken') !== null;
  });
});

Given('there are bakeries in the system', async function() {
  // This step assumes bakeries are already seeded in your database
  // If needed, you can make an API call here to ensure data is present
});

When('I navigate to the bakery list page', async function() {
  await page.goto(`${BASE_URL}/bakeries`);
  await page.waitForSelector('.bakery-list');
});

When('I click on a bakery named {string}', async function(bakeryName) {
  const bakeryLink = await page.$x(`//div[contains(@class, 'bakery-card')]//h3[contains(text(), '${bakeryName}')]/..`);
  if (bakeryLink.length > 0) {
    await bakeryLink[0].click();
  } else {
    throw new Error(`Bakery named "${bakeryName}" not found`);
  }
  await page.waitForNavigation();
});

Given('I am viewing the profile for {string}', async function(bakeryName) {
  await page.goto(`${BASE_URL}/bakeries`);
  await page.waitForSelector('.bakery-list');
  
  const bakeryLink = await page.$x(`//div[contains(@class, 'bakery-card')]//h3[contains(text(), '${bakeryName}')]/..`);
  if (bakeryLink.length > 0) {
    await bakeryLink[0].click();
  } else {
    throw new Error(`Bakery named "${bakeryName}" not found`);
  }
  await page.waitForNavigation();
});

When('I click on "Write a Review" button', async function() {
  await page.click('button.btn-primary');
  await page.waitForSelector('.review-form');
});

When('I provide the following ratings', async function(dataTable) {
  const ratings = dataTable.rowsHash();
  
  for (const [category, rating] of Object.entries(ratings)) {
    // Find the rating component for this category
    const ratingSelector = `.rating-category[data-category="${category}"]`;
    await page.waitForSelector(ratingSelector);
    
    // Calculate which cookie to click based on the rating value
    const cookieIndex = Math.round(parseFloat(rating) * 2) - 1; // Convert rating to index
    await page.click(`${ratingSelector} .cookie-wrapper:nth-child(${cookieIndex})`);
  }
});

When('I enter {string} as review text', async function(reviewText) {
  await page.type('textarea[name="review"]', reviewText);
});

When('I submit the review', async function() {
  await page.click('button[type="submit"]');
});

Then('I should see the bakery details', async function() {
  await page.waitForSelector('.bakery-profile');
  const bakeryName = await page.$eval('.bakery-name', el => el.textContent);
  assert(bakeryName.length > 0, 'Bakery name should be displayed');
});

Then('I should see the bakery\'s average rating', async function() {
  await page.waitForSelector('.bakery-rating');
});

Then('I should see my review on the bakery profile', async function() {
  await page.waitForSelector('.reviews-list');
  await page.waitForXPath('//div[contains(@class, "review-card")]//p[contains(text(), "Great bakery with delicious pastries")]');
});