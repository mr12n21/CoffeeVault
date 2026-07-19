# ☕ Coffee Vault & Recipe Prototyper

Moderní, plně kontejnerizovaná self-hosted webová aplikace navržená pro hardcore nadšence do výběrové kávy, baristy a sběratele kávových zrn. Aplikace řeší kompletní lifecycle kávových zrn – od nákupu a automatického importu dat, přes precizní logování zmrazovacích cyklů v mrazáku, až po pokročilé prototypování a ladění extrakčních receptů pro high-end hračky (Zero-Bypass, HiFlux, variable-bottom drippery).

---

## Klíčové vlastnosti

### 1. Inteligentní Kofio Metadata Parser
Zapomeň na ruční přepisování. Aplikace obsahuje parser vrstvu, do které stačí vložit odkaz nebo surový textový dump z webu Kofio.cz. Systém automaticky vyextrahuje a strukturovaně uloží:
*   Pražírnu, zemi původu a přesné sub-variety (např. Castillo, SL28 Peaberry, 74158).
*   Detaily zpracování (metoda, délka a typ anaerobní fermentace, thermal shock).
*   Kompletní chuťový profil (parsování chuťových tónů do tagů).
*   Doporučené metody přípravy a stupně pražení.

### 2. Advanced Freezer Tracking ("True Resting Age")
Káva v mrazáku nestárne, respektive stárne výrazně pomaleji. Aplikace disponuje pokročilou logikou pro sledování freeze/thaw cyklů a počítá **skutečné stáří kávy od pražení (True Resting Age)**:
*   `True Age = (Aktuální datum - Datum pražení) - Dny strávené v mrazáku`
*   Vizuální časová osa a kalendář ti přesně řeknou, kdy je káva po vytažení z mrazáku v ideálním extrakčním okně (peak flavor).

### 3. Barista Recipe Engine & Prototypování
Recepty pro náročné. Databázová schémata a UI jsou přizpůsobeny pro moderní soutěžní trendy v brewingu:
*   **Hardware tracking:** Podpora pro pokročilé drippery (Mazelab Solo + HiFlux, Orea V4 s Open/Fast/Classic dny) a přesné nastavení mlýnků v mikronech/clicích (např. 1Zpresso ZP6).
*   **Fyzika nálevů:** Logování pokročilých technik – split-temperature recepty (např. 95 °C pro aciditu, drop na 86 °C pro sladkost), typy papírových filtrů (Sibarist flat vs. wave vs. negotiated/vyhlazený) a hybridní práce s horní sprchou (dispersion screen).

---

## Použitý Tech Stack

Projekt je postaven jako distribuovaná, mikroslužební architektura běžící lokálně přes **Docker Compose**:

*   **Reverse Proxy:** `Caddy` – zajišťuje bezpečné lokální směrování, SSL a serving statických souborů.
*   **Frontend:** `Nuxt 3 / Vue 3` + `Tailwind CSS` – rychlé, reaktivní a vysoce skenovatelné baristické UI.
*   **Backend API:** `Node.js / TypeScript` – zabezpečené pomocí **JWT (JSON Web Tokens)** pro relace a **bcrypt** pro hashování hesel.
*   **Databáze:** `SurrealDB` – moderní multi-model databáze běžící v kontejneru. Využívá dokumentový model pro profily káv a grafové relace pro mapování receptů a zmrazovacích cyklů.

---

## Rychlé spuštění (Local Deployment)

Aplikace je navržena pro snadné nasazení na domácím serveru (např. Raspberry Pi, NAS, lokální PC).

1. Klonuj repozitář:
   ```bash
   git clone https://github.com/vys-uzivatelske-jmeno/coffee-vault.git
   cd coffee-vault
   ```

2. Zkopíruj a uprav proměnné prostředí:
   ```bash
   cp .env.example .env
   ```

3. Spusť celý stack přes Docker Compose:
   ```bash
   docker compose up --build
   ```

4. Otevři aplikaci v prohlížeči na [http://localhost](http://localhost).

---

## Stav projektu

Aktuálně obsahuje repozitář základní kostru (scaffold) celého stacku:
*   Docker Compose síť se všemi 4 službami (Caddy, Nuxt, API, SurrealDB).
*   SurrealDB schéma pro kávová zrna, zmrazovací cykly a recepty.
*   Funkční registrace a přihlášení (JWT + bcrypt).

Kofio parser a plné UI pro recepty/mrazák jsou plánované jako další iterace.
