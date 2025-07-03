Feature: Install CLI Commands
  As a user
  I want to install multiple CLI commands in parallel
  So that I can quickly set up my development environment

  Scenario: Install multiple commands from the index
    Given the llm-cli index is initialized locally
    And the command "script1" with install command "npm install -g script1-cli" is in the local index
    And the command "script2" with install command "pip install script2-lib" is in the local index
    When I run "llm-cli install script1 script2"
    Then the install command for "script1" should be executed
    And the install command for "script2" should be executed
    And both commands should be executed in parallel
    And the output should indicate successful installation for both

  Scenario: Attempt to install a non-existent command
    Given the llm-cli index is initialized locally
    When I run "llm-cli install non-existent-script"
    Then an error message "Command 'non-existent-script' not found in index." should be displayed
    And no install commands should be executed

  Scenario: Attempt to install a command without an install command defined
    Given the llm-cli index is initialized locally
    And the command "no-install-script" without an install command is in the local index
    When I run "llm-cli install no-install-script"
    Then an error message "Command 'no-install-script' does not have an install command defined." should be displayed
    And no install commands should be executed

  Scenario: Install commands from global index
    Given the llm-cli index is initialized globally
    And the command "global-script" with install command "npm install -g global-script-cli" is in the global index
    When I run "llm-cli install global-script --global"
    Then the install command for "global-script" should be executed

  Scenario: Handle installation failures
    Given the llm-cli index is initialized locally
    And the command "failing-script" with install command "exit 1" is in the local index
    When I run "llm-cli install failing-script"
    Then an error message "Installation of 'failing-script' failed." should be displayed
    And the process should exit with a non-zero code
