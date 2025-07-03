Feature: Remove CLI Command
  As a user
  I want to remove a CLI command from the llm-cli index
  So that it is no longer invoked by an AI

  Scenario: Remove an existing local command
    Given the llm-cli index is initialized locally
    And the command "my-script" is in the local index
    When I run "llm-cli remove my-script"
    Then the command "my-script" should be removed from the local index

  Scenario: Remove an existing global command
    Given the llm-cli index is initialized globally
    And the command "global-script" is in the global index
    When I run "llm-cli remove global-script --global"
    Then the command "global-script" should be removed from the global index

  Scenario: Attempt to remove a non-existent command locally
    Given the llm-cli index is initialized locally
    And the command "non-existent-command" is not in the local index
    When I run "llm-cli remove non-existent-command"
    Then an error message "Command 'non-existent-command' not found." should be displayed
    And the local index should not be modified

  Scenario: Attempt to remove a non-existent command globally
    Given the llm-cli index is initialized globally
    And the command "non-existent-command" is not in the global index
    When I run "llm-cli remove non-existent-command --global"
    Then an error message "Command 'non-existent-command' not found." should be displayed
    And the global index should not be modified
