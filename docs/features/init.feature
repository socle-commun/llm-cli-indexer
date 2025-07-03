Feature: Initialize llm-cli
  As a user
  I want to initialize the llm-cli project
  So that I can start managing my CLI commands

  Scenario: Initialize local llm-cli directory and index.json
    Given the llm-cli directory does not exist locally
    When I run "llm-cli init"
    Then a ".llm-cli" directory should be created locally
    And an "index.json" file should be created inside ".llm-cli" locally
    And the "index.json" file should be empty (containing "[]")

  Scenario: Initialize global llm-cli directory and index.json
    Given the llm-cli directory does not exist globally
    When I run "llm-cli init --global"
    Then a ".llm-cli" directory should be created globally
    And an "index.json" file should be created inside ".llm-cli" globally
    And the "index.json" file should be empty (containing "[]")

  Scenario: Re-initializing local llm-cli directory and index.json
    Given the llm-cli directory exists locally
    And the "index.json" file exists inside ".llm-cli" locally
    When I run "llm-cli init"
    Then the ".llm-cli" directory should not be recreated locally
    And the "index.json" file should not be recreated inside ".llm-cli" locally

  Scenario: Re-initializing global llm-cli directory and index.json
    Given the llm-cli directory exists globally
    And the "index.json" file exists inside ".llm-cli" globally
    When I run "llm-cli init --global"
    Then the ".llm-cli" directory should not be recreated globally
    And the "index.json" file should not be recreated inside ".llm-cli" globally
