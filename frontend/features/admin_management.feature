Feature: Admin Management
  As an administrator of CrumbCompass
  I want to manage bakeries, products, and reviews
  So that I can maintain quality content on the platform

  Background:
    Given I am logged in as an administrator

  Scenario: View and delete bakery review
    Given there are bakery reviews in the system
    When I navigate to the admin bakery review list
    Then I should see all bakery reviews
    When I click the "Delete" button for a review
    Then the review should be removed from the list
    And I should see a success message

  Scenario: Update a product
    Given there are products in the system
    When I navigate to the admin product list
    And I click the "Update" button for "Test Product"
    And I change the price to "55.00"
    And I save the changes
    Then I should see a success message
    And the product price should be updated to "55.00"