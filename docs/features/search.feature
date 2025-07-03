Feature: Search CLI Commands
  As a user
  I want to search for CLI commands in the llm-cli index
  So that I can find relevant commands quickly

  Scenario: Search for commands by keyword in name or description
    Given the llm-cli index is initialized locally
    And the command "analyze-code" with description "Analyzes source code" is in the local index
    And the command "build-project" is in the local index
    When I run "llm-cli search code"
    Then the output should contain "analyze-code"
    And the output should not contain "build-project"

  Scenario: Search for commands by tag
    Given the llm-cli index is initialized locally
    And the command "typescript-linter" with tags "typescript", "lint" is in the local index
    And the command "python-formatter" with tags "python", "format" is in the local index
    When I run "llm-cli search --tag lint"
    Then the output should contain "typescript-linter"
    And the output should not contain "python-formatter"

  Scenario: Search for commands including dev commands
    Given the llm-cli index is initialized locally
    And the command "prod-tool" is in the local index
    And the command "dev-tool" with dev flag true is in the local index
    When I run "llm-cli search --include-dev tool"
    Then the output should contain "prod-tool"
    And the output should contain "dev-tool"

  Scenario: Search for commands with multiple keywords
    Given the llm-cli index is initialized locally
    And the command "test-runner" with description "Runs unit tests" is in the local index
    When I run "llm-cli search run tests"
    Then the output should contain "test-runner"

  Scenario: Search for commands in global index
    Given the llm-cli index is initialized globally
    And the command "global-search-tool" is in the global index
    When I run "llm-cli search --global search-tool"
    Then the output should contain "global-search-tool"

  Scenario: No commands found for search query
    Given the llm-cli index is initialized locally
    And no commands match the search query
    When I run "llm-cli search non-existent"
    Then the output should be empty or indicate no commands found
