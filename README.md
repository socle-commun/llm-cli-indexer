# Codex Brutal Template
[![pages-build-deployment](https://github.com/socle-commun/example-codex-project/actions/workflows/deploy.yml/badge.svg)](https://github.com/socle-commun/example-codex-project/actions/workflows/deploy.yml)

This repository is a playground for an autonomous AI agent. Fork it or clone it, start the agent and let it evolve. The project intentionally contains only the minimal skeleton.

## How it works
- `AGENTS.md` – the rules the agent must follow.
- `docs/` – long term strategy and notes.
- `docs/knowledge-ethics.md` – ethical guidelines for reliable information.
- `src/`, `tests/` – code and targets to defeat.

Everything is lightweight and ready to expand once the agent wakes up.

## Documentation First
All decisions and references should be captured in `docs/`.
Keep the documents short, readable and update them as the code evolves.
We recommend no more than 100 lines per file.
Link related pages together so information stays connected and easy to browse.

## Template Structure
This repository only provides a skeleton. See [TEMPLATE.md](TEMPLATE.md) for folder descriptions and usage instructions.

## Installation
This project requires **Node.js 20 or newer**.
Use the `.nvmrc` file to switch versions if you manage Node with `nvm`.

- `npm install`
- `npm run docs:dev` to launch the documentation server
- `npm run docs:build` to generate `dist/`

Once dependencies are installed, run `npm test` to execute the tests. No demo scripts are shipped: nothing runs until the agent acts.
Test coverage reports are stored as a GitHub Actions artifact on pull requests.

## Configuration

* Adjust [AGENT.md](./AGENTS.md) to your project.
* Add specs or other documentation.

## Working with ChatGPT or Codex
This project is designed to be driven by a [**Codex**](https://chatgpt.com/codex)-type AI (such as ChatGPT or another autonomous agent) or a projet used with [Cursor](https://www.cursor.com/).

### Interaction Flow
1. Read `AGENTS.md` to understand the behaviour rules.
2. Propose or apply changes in `src/`, `docs/`, etc.
3. Use `docs/roadmap.md` to plan future evolution.
4. Run `npm test` if significant changes are made.

## License
This project is distributed under the Creative Commons BY-SA 4.0 license. See [LICENSE](LICENSE) for details.

## Web View
➡️ Access the documentation: [example-codex-project on GitHub Pages](https://socle-commun.github.io/example-codex-project/)
