Feature: Add CLI Commands from Configuration File
  As a user
  I want to add multiple CLI commands from a single configuration file
  So that I can easily manage and import a collection of commands

  Scenario: Add multiple local commands from a JSON file
    Given the llm-cli index is initialized locally
    And a configuration file "commands.json" exists with the following content:
      """
      [
        {
          "name": "script-a",
          "url": "file:///path/to/script-a.js",
          "description": "Description for script A",
          "tags": ["utility", "js"]
        },
        {
          "name": "script-b",
          "url": "file:///path/to/script-b.sh",
          "description": "Description for script B",
          "tags": ["shell"]
        }
      ]
      """
    And the script "/path/to/script-a.js" exists
    And the script "/path/to/script-b.sh" exists
    When I run "llm-cli add --config commands.json"
    Then the command "script-a" should be in the local index
    And the command "script-b" should be in the local index
    And their properties should match the configuration

  Scenario: Attempt to add commands from a non-existent configuration file
    Given the llm-cli index is initialized locally
    When I run "llm-cli add --config non-existent.json"
    Then an error message "Configuration file 'non-existent.json' not found." should be displayed
    And the local index should not be modified

  Scenario: Attempt to add commands from a malformed configuration file
    Given the llm-cli index is initialized locally
    And a configuration file "malformed.json" exists with malformed JSON content
    When I run "llm-cli add --config malformed.json"
    Then an error message "Invalid JSON format in configuration file 'malformed.json'." should be displayed
    And the local index should not be modified

  Scenario: Attempt to add commands with missing required fields in config
    Given the llm-cli index is initialized locally
    And a configuration file "invalid-commands.json" exists with a command missing a required field (e.g., name)
    When I run "llm-cli add --config invalid-commands.json"
    Then an error message "Command from configuration is missing required fields" should be displayed
    And the local index should not be modified

  Scenario: Attempt to add commands with duplicate names in config
    Given the llm-cli index is initialized locally
    And a configuration file "duplicate-names.json" exists with commands having duplicate names
    When I run "llm-cli add --config duplicate-names.json"
    Then an error message "Duplicate command name found in configuration" should be displayed
    And the local index should not be modified

  Scenario: Attempt to add commands with existing names in index
    Given the llm-cli index is initialized locally
    And the command "existing-command" is already in the local index
    And a configuration file "new-commands.json" exists with a command named "existing-command"
    When I run "llm-cli add --config new-commands.json"
    Then an error message "Command with name 'existing-command' already exists in the index." should be displayed
    And the local index should not be modified
