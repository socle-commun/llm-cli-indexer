Feature: Add CLI Command with Auto-Inference
  As a user
  I want the `add` command to automatically infer description and tags
  So that I don't have to provide them manually for every command

  Scenario: Auto-infer description from --llm output
    Given the llm-cli index is initialized locally
    And a script "my-auto-script.js" exists and responds to "--llm" with "This is an auto-inferred description."
    When I run "llm-cli add my-auto-script.js --name auto-script"
    Then the command "auto-script" should be in the local index
    And its description should be "This is an auto-inferred description."

  Scenario: Auto-infer tags from file extension
    Given the llm-cli index is initialized locally
    And a script "python-script.py" exists and responds to "--llm" with "A Python script."
    When I run "llm-cli add python-script.py --name py-script"
    Then the command "py-script" should be in the local index
    And its tags should contain "python"

  Scenario: Auto-infer tags from file extension (multiple)
    Given the llm-cli index is initialized locally
    And a script "shell-script.sh" exists and responds to "--llm" with "A shell script."
    When I run "llm-cli add shell-script.sh --name sh-script"
    Then the command "sh-script" should be in the local index
    And its tags should contain "shell", "bash"

  Scenario: Explicit description overrides auto-inference
    Given the llm-cli index is initialized locally
    And a script "overridden-script.js" exists and responds to "--llm" with "This description should be ignored."
    When I run "llm-cli add overridden-script.js --name override-desc -d "My custom description."
    Then the command "override-desc" should be in the local index
    And its description should be "My custom description."

  Scenario: Explicit tags override auto-inference
    Given the llm-cli index is initialized locally
    And a script "overridden-tags.py" exists and responds to "--llm" with "A script with tags."
    When I run "llm-cli add overridden-tags.py --name override-tags -t custom-tag"
    Then the command "override-tags" should be in the local index
    And its tags should contain "custom-tag"
    And its tags should not contain "python"

  Scenario: Auto-inference for commands added via config file
    Given the llm-cli index is initialized locally
    And a script "config-script.js" exists and responds to "--llm" with "Description from config script."
    And a configuration file "auto-config.json" exists with the following content:
      """
      [
        {
          "name": "config-cmd",
          "url": "file:///path/to/config-script.js"
        }
      ]
      """
    When I run "llm-cli add --config auto-config.json"
    Then the command "config-cmd" should be in the local index
    And its description should be "Description from config script."
    And its tags should contain "javascript"
