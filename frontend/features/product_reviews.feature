Feature: Product Reviews
  As a user of CrumbCompass
  I want to browse bakery products and leave reviews
  So that I can share my opinions on specific items

  Background:
    Given I am logged in as a regular user

  Scenario: View product details
    Given there are products in the system
    When I navigate to the product list page
    And I click on a product named "Test Product"
    Then I should see the product details
    And I should see the product's average rating

  Scenario: Submit a product review
    Given I am viewing the profile for product "Test Product"
    When I click on "Write a Review" button
    And I provide the following product ratings
      | overall      | 4.5 |
      | taste        | 5   |
      | price        | 3.5 |
      | presentation | 4   |
    And I enter "Delicious and worth every penny" as review text
    And I submit the review
    Then I should see a success message
    And my review should appear in the product's review list