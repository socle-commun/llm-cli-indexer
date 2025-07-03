Feature: List CLI Commands
  As a user
  I want to list the CLI commands in the llm-cli index
  So that I can see available commands

  Scenario: List all local commands (excluding dev by default)
    Given the llm-cli index is initialized locally
    And the command "command1" is in the local index
    And the command "command2" with dev flag true is in the local index
    When I run "llm-cli list"
    Then the output should contain "command1"
    And the output should not contain "command2"

  Scenario: List all local commands including dev
    Given the llm-cli index is initialized locally
    And the command "command1" is in the local index
    And the command "command2" with dev flag true is in the local index
    When I run "llm-cli list --include-dev"
    Then the output should contain "command1"
    And the output should contain "command2"

  Scenario: List all global commands
    Given the llm-cli index is initialized globally
    And the command "global-command1" is in the global index
    When I run "llm-cli list --global"
    Then the output should contain "global-command1"

  Scenario: List commands when index is empty
    Given the llm-cli index is initialized locally and is empty
    When I run "llm-cli list"
    Then the output should be empty or indicate no commands found
