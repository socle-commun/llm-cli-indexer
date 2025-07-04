# 🧠 `llm-cli` — LLM-Friendly Command Line Index

Un outil pour exposer des scripts, binaires ou outils CLI à une IA (ou à vous-même)  
grâce à une interface standardisée, locale ou globale, compatible LLM.

---

## 🚀 Installation

Aucune dépendance externe. Copiez le binaire, utilisez avec `deno run` ou compilez votre version.

```bash
llm-cli add -t analyze -t ast "comet analyze"
````

---

## 🧰 Commandes disponibles

### 🔧 `llm-cli add`

Enregistre une commande CLI pour qu’elle soit connue et invocable par l’IA.

```bash
llm-cli add [options] <command-path> 
```

#### Options

| Flag         | Alias      | Type       | Description                                                    |
| ------------ | ---------- | ---------- | -------------------------------------------------------------- |
| `-n`         | `--name`   | `string`   | Nom explicite de la commande (obligatoire si ambigüe)          |
| `-t`         | `--tag`    | `string[]` | Tag(s) associé(s), répétables (`-t analyze -t ast`)            |
| `-g`         | `--global` | `boolean`  | Enregistre dans `~/.llm-cli/` au lieu de `./.llm-cli/`         |
| `--dev`      | –          | `boolean`  | Marque la commande comme disponible uniquement en dev          |
| `--help`     | –          | `string`   | Commande à exécuter pour générer une doc IA (default: `--help`)|

---

### ➖ `llm-cli remove`

```bash
llm-cli remove [-g] <name> 
```

Supprime une commande enregistrée.

---

### 🔁 `llm-cli update`

```bash
llm-cli update [options] <name>
```

Modifie un ou plusieurs champs d'une commande enregistrée.

---

### 📜 `llm-cli list`

```bash
llm-cli [--include-dev] list 
```

Liste les commandes disponibles (hors `dev` par défaut).

---

### 🔎 `llm-cli search`

```bash
llm-cli search [--include-dev] <keywords...> 
```

Recherche des commandes enregistrées par nom, description ou tag.

---

### ✅ `llm-cli validate`

```bash
llm-cli [-g] validate 
```

Valide la structure de l’index JSON et la présence réelle des binaires.

---

## 📂 Exemple d’ajout complet

```bash
llm-cli add \
  -n "comet analyze" \
  -t project -t analyze -t tree -t ast \
  --llm-help="--help" \
  comet analyze
```

Résultat dans `~/.llm-cli/index.json` :

```json
{
  "name": "comet analyze",
  "command": "comet",
  "description": "Analyse du projet",
  "tags": ["project", "analyze", "tree", "ast"],
  "llmHelpSource": "--help",
  "dev": false
}
```

---

## 🧾 Spécification du fichier `index.json`

> 📍 Fichier : `./.llm-cli/index.json` ou `~/.llm-cli/index.json`

### 🧱 TypeScript

```ts
export type LLMCommand = {
  name: string;
  url?: string; // ex: "file:///absolute/path/to/script.sh"
  command?: string;
  description?: string;
  tags: string[];
  llmHelpSource: string; // default to --help
  dev?: boolean;
};
```

---

## 🧪 Bonnes pratiques et validation

* Ne jamais mettre de chemin relatif dans `url`
* Toujours tester vos ajouts avec `llm-cli validate`
* Utiliser `--dev` pour les scripts temporaires ou non publiables

---

## 🤖 Utilisation avec une IA

Un agent peut :

* Explorer : `llm-cli list` / `llm-cli search`
* Comprendre : `llm-cli help "<name>"`
* Exécuter : charger `url`, parser `--llm`, exécuter la commande

Les commandes marquées `"dev": true` sont **invisibles** par défaut
(sauf si l’agent ou l’humain utilise `--include-dev`)

---

## 🛣️ Roadmap

* [ ] Support des commandes distantes (`url: "https://..."`)
* [ ] Tags hiérarchiques
* [ ] Support du format Markdown dans `--llm-help`

---

## 🧼 Linter / Validator CLI

> Pour vérifier la validité d’un `index.json` :

```bash
llm-cli validate
```

Renvoie les erreurs suivantes :

* Fichier absent ou malformé ou `commande --help` non reçue.
* Chemin inexistant
* Champ manquant (nom, url, etc.)
* Doublon de nom

---

## 🔐 Licence

MIT — Utilisation libre, juste soyez plus rigoureux que ce README si vous forkez 😉

---

## 🧠 Pour aller plus loin

Tu veux que l’IA **pilote tes scripts comme un shell augmenté** ?
Tu veux que chaque commande exposée puisse s’autodécrire en JSON ?
Tu veux ajouter un `ai.md` dans ton repo et que ça marche out of the box ?

**Bienvenue. `llm-cli` est là pour ça.**
