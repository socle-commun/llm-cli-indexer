Feature: Add CLI Command
  As a user
  I want to add a CLI command to the llm-cli index
  So that it can be invoked by an AI

  Scenario: Add a new local command with minimal information
    Given the llm-cli index is initialized locally
    And a script "./path/to/my-script.sh" exists and responds to "--help" with "My script description."
    When I run "llm-cli add ./path/to/my-script.sh --name my-script"
    Then the command "my-script" should be added to the local index
    And its URL should be "file:///absolute/path/to/my-script.sh"
    And its tags should be empty
    And its dev flag should be false
    And its global flag should be false
    And its description should be "My script description."

  Scenario: Add a new global command with tags and dev flag
    Given the llm-cli index is initialized globally
    And a script "./path/to/another-script.py" exists and responds to "--help" with "Another script description."
    When I run "llm-cli add ./path/to/another-script.py --name another-script -t python -t utility --dev --global"
    Then the command "another-script" should be added to the global index
    And its URL should be "file:///absolute/path/to/another-script.py"
    And its tags should be "python", "utility"
    And its dev flag should be true
    And its global flag should be true
    And its description should be "Another script description."

  Scenario: Add a command with a custom llm-help source
    Given the llm-cli index is initialized locally
    And a script "./path/to/help-script.js" exists and responds to "--ai-doc" with "Help script AI documentation."
    When I run "llm-cli add ./path/to/help-script.js --name help-script --llm-help='--ai-doc'"
    Then the command "help-script" should be added to the local index
    And its llmHelpSource should be "--ai-doc"
    And its description should be "Help script AI documentation."

  Scenario: Attempt to add a command that does not respond to --help
    Given the llm-cli index is initialized locally
    And a script "./path/to/non-responsive-script.sh" exists but does not respond to "--help"
    When I run "llm-cli add ./path/to/non-responsive-script.sh --name non-responsive"
    Then an error message "Command 'non-responsive' did not respond to --help or returned an error." should be displayed
    And the local index should not be modified

  Scenario: Add a command with a custom description
    Given the llm-cli index is initialized locally
    And a script "./path/to/custom-desc-script.sh" exists and responds to "--help" with "This is the help description."
    When I run "llm-cli add ./path/to/custom-desc-script.sh --name custom-desc --description "My custom description."
    Then the command "custom-desc" should be added to the local index
    And its description should be "My custom description."

  Scenario: Attempt to add a command with a duplicate name
    Given the llm-cli index is initialized locally
    And the command "existing-command" is already in the local index
    And a script "./path/to/new-script.sh" exists and responds to "--help" with "New script description."
    When I run "llm-cli add ./path/to/new-script.sh --name existing-command"
    Then an error message "Command with name 'existing-command' already exists." should be displayed
    And the local index should not be modified