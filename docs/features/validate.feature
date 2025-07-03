Feature: Validate CLI Index
  As a user
  I want to validate the llm-cli index
  So that I can ensure its integrity and correctness

  Scenario: Validate a valid local index
    Given the llm-cli index is initialized locally
    And the local index contains valid commands
    When I run "llm-cli validate"
    Then the output should indicate success

  Scenario: Validate a valid global index
    Given the llm-cli index is initialized globally
    And the global index contains valid commands
    When I run "llm-cli validate --global"
    Then the output should indicate success

  Scenario: Validate an index with a missing file
    Given the llm-cli index is initialized locally
    And the local index contains a command with a non-existent URL
    When I run "llm-cli validate"
    Then the output should indicate an error about the missing file

  Scenario: Validate an index with a malformed JSON file
    Given the llm-cli index is initialized locally
    And the local index file is malformed JSON
    When I run "llm-cli validate"
    Then the output should indicate an error about the malformed JSON

  Scenario: Validate an index with a missing required field
    Given the llm-cli index is initialized locally
    And the local index contains a command with a missing required field (e.g., name)
    When I run "llm-cli validate"
    Then the output should indicate an error about the missing field

  Scenario: Validate an index with a duplicate command name
    Given the llm-cli index is initialized locally
    And the local index contains commands with duplicate names
    When I run "llm-cli validate"
    Then the output should indicate an error about duplicate names
