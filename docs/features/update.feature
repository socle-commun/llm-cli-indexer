Feature: Update CLI Command
  As a user
  I want to update an existing CLI command in the llm-cli index
  So that its properties are modified

  Scenario: Update a command's name
    Given the llm-cli index is initialized locally
    And the command "old-name" is in the local index
    When I run "llm-cli update old-name --new-name new-name"
    Then the command "new-name" should be in the local index
    And the command "old-name" should not be in the local index

  Scenario: Update a command's tags
    Given the llm-cli index is initialized locally
    And the command "my-script" with tags "tag1" is in the local index
    When I run "llm-cli update my-script -t tagA -t tagB"
    Then the command "my-script" should have tags "tagA", "tagB"

  Scenario: Update a command's dev flag to true
    Given the llm-cli index is initialized locally
    And the command "my-script" with dev flag false is in the local index
    When I run "llm-cli update my-script --dev"
    Then the command "my-script" should have dev flag true

  Scenario: Update a command's llm-help source
    Given the llm-cli index is initialized locally
    And the command "my-script" is in the local index
    When I run "llm-cli update my-script --llm-help='--new-llm-doc'"
    Then the command "my-script" should have llmHelpSource "--new-llm-doc"

  Scenario: Update a command's description
    Given the llm-cli index is initialized locally
    And the command "my-script" is in the local index
    When I run "llm-cli update my-script --description='New description for my script'"
    Then the command "my-script" should have description "New description for my script"

  Scenario: Attempt to update a non-existent command
    Given the llm-cli index is initialized locally
    And the command "non-existent-command" is not in the local index
    When I run "llm-cli update non-existent-command --new-name new-name"
    Then an error message "Command 'non-existent-command' not found." should be displayed
    And the local index should not be modified

  Scenario: Attempt to update a command with a new name that already exists
    Given the llm-cli index is initialized locally
    And the command "script1" is in the local index
    And the command "script2" is in the local index
    When I run "llm-cli update script1 --new-name script2"
    Then an error message "Command with new name 'script2' already exists." should be displayed
    And the local index should not be modified
