# backgammon-web

## 🧩 Project Setup

This repository contains:

- **Play Framework web server** — the main application (root project)
- **`game/`** — the Backgammon engine, included as a **Git submodule**

---

### 🪄 1. Clone the repository (with submodule)
Make sure to clone recursively so that the `game` submodule is included:

```bash
git clone --recursive https://github.com/schlageterlars/backgammon-web.git
cd backgammon-web
```

If you already cloned it without --recursive, initialize and update the submodule manually:
```bash
git submodule update --init --recursive
```

###  ⚙️ 2. Publish the game project locally
The Play app depends on the game engine as a locally published library.

From the root of the repo, run:
```bash
cd game
sbt publishLocal
cd ..
```

This compiles and publishes the game engine into your local Ivy cache at:
```bash
~/.ivy2/local/backgammon/backgammon_3/0.1.0-SNAPSHOT/
```

### 🚀 3. Run the Play server
Start the Play Framework server (from the root directory, not inside game/):
```bash
sbt run
```