Feature: Bakery Reviews
  As a user of CrumbCompass
  I want to browse bakeries and leave reviews
  So that I can share my experiences with others

  Background:
    Given I am logged in as a regular user

  Scenario: View bakery profile
    Given there are bakeries in the system
    When I navigate to the bakery list page
    And I click on a bakery named "Test Bakery"
    Then I should see the bakery details
    And I should see the bakery's average rating

  Scenario: Submit a bakery review
    Given I am viewing the profile for "Test Bakery"
    When I click on "Write a Review" button
    And I provide the following ratings
      | overall    | 4   |
      | service    | 3.5 |
      | price      | 4   |
      | atmosphere | 5   |
      | location   | 3   |
    And I enter "Great bakery with delicious pastries" as review text
    And I submit the review
    Then I should see a success message
    And I should see my review on the bakery profile