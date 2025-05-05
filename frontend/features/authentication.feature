Feature: User Authentication
  As a user of CrumbCompass
  I want to be able to register and log in
  So that I can access personalized features

  Scenario: Successful user registration
    Given I am on the registration page
    When I enter valid registration details
      | username | testuser                |
      | email    | testuser@example.com    |
      | password | SecurePassword123!      |
    And I submit the registration form
    Then I should be redirected to the login page
    And I should see a success message

  Scenario: Successful user login
    Given I am on the login page
    When I enter valid login credentials
      | username | testuser           |
      | password | SecurePassword123! |
    And I submit the login form
    Then I should be logged in successfully
    And I should see my user profile