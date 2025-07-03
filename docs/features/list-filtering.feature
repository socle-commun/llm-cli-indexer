Feature: List CLI Commands with Filtering
  As a user
  I want to list CLI commands with filtering options
  So that I can find specific types of commands or commands with certain tags

  Scenario: List commands filtered by type/extension
    Given the llm-cli index is initialized locally
    And the command "my-script.js" with url "file:///path/to/my-script.js" is in the local index
    And the command "another-script.sh" with url "file:///path/to/another-script.sh" is in the local index
    When I run "llm-cli list --type js"
    Then the output should contain "my-script.js"
    And the output should not contain "another-script.sh"

  Scenario: List commands filtered by tag
    Given the llm-cli index is initialized locally
    And the command "build-tool" with tags "build", "ci" is in the local index
    And the command "test-tool" with tags "test" is in the local index
    When I run "llm-cli list --tag build"
    Then the output should contain "build-tool"
    And the output should not contain "test-tool"

  Scenario: List commands filtered by multiple tags
    Given the llm-cli index is initialized locally
    And the command "deploy-script" with tags "deploy", "ci" is in the local index
    And the command "lint-tool" with tags "lint" is in the local index
    When I run "llm-cli list --tag deploy --tag ci"
    Then the output should contain "deploy-script"
    And the output should not contain "lint-tool"

  Scenario: List commands with no matching filters
    Given the llm-cli index is initialized locally
    And the command "my-script.js" with url "file:///path/to/my-script.js" is in the local index
    When I run "llm-cli list --type py"
    Then the output should be empty or indicate no commands found

  Scenario: List commands with --include-dev and filters
    Given the llm-cli index is initialized locally
    And the command "prod-js" with url "file:///path/to/prod.js" is in the local index
    And the command "dev-js" with url "file:///path/to/dev.js" and dev flag true is in the local index
    When I run "llm-cli list --type js --include-dev"
    Then the output should contain "prod-js"
    And the output should contain "dev-js"
