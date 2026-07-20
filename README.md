# Coffee Vault & Recipe Prototyper

A modern, fully containerized, **self-hosted** web application for hardcore specialty coffee enthusiasts, home baristas, and bean collectors. Everything — data, photos, OCR — runs on your own hardware. No cloud account, no subscription, no external service required.

It manages the complete lifecycle of a coffee bean: from purchase and automated data import, through precise logging of single-dose freezer cycles, to advanced extraction prototyping for high-end gear (Zero-Bypass, HiFlux, variable-bottom drippers).

---

## Key Features

### 1. Intelligent Bean Import (Web Scraping & OCR)
Forget manual data entry:
* **Web scraping** — paste a product URL (Kofio.cz/Kofio.co or any other public roaster page) and the parser pulls out roaster, origin, variety, process, roast level, and tasting notes automatically.
* **OCR import** — no listing online? Photograph the bag (up to 3 photos) and the built-in OCR engine reads the label text and pre-fills what it can recognize.
* **Structured metadata** — sub-varieties (Castillo, SL28 Peaberry, 74158...), processing details (co-ferment, anaerobic, thermal shock...), and tasting notes all land in searchable, taggable fields.

### 2. Advanced Freezer Tracking ("True Resting Age")
Built for anyone who portions and freezes beans in single-dose vials:
* Log each freeze/thaw cycle per vial, with a 2-digit vial ID and gram weight so you know at a glance what's in tube #01.
* The app computes **True Resting Age**: `True Age = (Today − Roast Date) − Days Spent Frozen`.
* A calendar view shows roast dates and freeze/thaw events, and flags each bean's current stage — resting, peak window, declining, or past peak.

### 3. Barista Recipe Engine & Brew Mode
Recipes built for competition-level brewing:
* **Hardware tracking** — dripper, filter type, grind setting (1Zpresso ZP6, Timemore C3...), and split-temperature water profiles (95 °C for acidity, dropping to 86 °C for sweetness).
* **Timestamped steps** — write steps as plain `MM:SS action` lines, a format simple enough that an AI can generate a recipe you just paste in.
* **Brew Mode** — run the recipe full-screen with an auto-advancing timer, so you're not touching your phone mid-pour.

---

## Tech Stack

A distributed, containerized architecture running entirely via **Docker Compose**:

* **Reverse Proxy:** `Caddy` — local routing and static file serving.
* **Frontend:** `Nuxt 3` / `Vue 3` + `Tailwind CSS`.
* **Backend API:** `Node.js` / `TypeScript` (Express) — `JWT` sessions, `bcrypt` password hashing, `zod` input validation, rate limiting.
* **Database:** `SurrealDB` — a multi-model database using a document model for bean/recipe records and record links for relations between beans, freezer cycles, and recipes.
* **OCR:** `Tesseract.js`, running fully locally — no external API calls, no images leave your server.

There's no public sign-up. A single admin account (plus any others you list) is created from environment variables on first boot — see `.env.example`.

---

## Quick Start (Local Deployment)

Designed for easy deployment on a home server — Raspberry Pi, NAS, or any local machine.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/mr12n21/CoffeeVault.git
   cd CoffeeVault
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` — at minimum set `JWT_SECRET`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD`.

3. **Start the stack:**
   ```bash
   docker compose up --build -d
   ```

4. **Open the app:**
   Visit [http://localhost](http://localhost) in your browser.
