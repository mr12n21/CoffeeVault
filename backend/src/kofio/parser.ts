import * as cheerio from "cheerio";

export interface ParsedKofioBean {
  name: string;
  roaster: string;
  origin_country: string;
  variety?: string;
  process?: string;
  roast_level?: string;
  roast_date?: string;
  tasting_notes: string[];
  recommended_methods: string[];
  notes?: string;
  source_url?: string;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// kofio.cz (Czech) and kofio.co (English) render identical markup — same class names,
// same parameter table — just with the label text translated. Each field is looked up
// under every known label so both site locales parse the same way.
function firstParam(params: Record<string, string[]>, labels: string[]): string[] | undefined {
  for (const label of labels) {
    if (params[label]?.length) return params[label];
  }
  return undefined;
}

// Kofio shows the roast date as "DD.MM.YYYY" (e.g. "06.07.2026 (13 dnů)" / "03.07.2026 (16 days)")
// on both locales. Parsed manually rather than via Date.parse(), which doesn't reliably handle
// dot-separated day-first dates and would silently misread day/month.
function parseKofioDate(value: string): string | undefined {
  const match = value.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/);
  if (!match) return undefined;
  const [, day, month, year] = match;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

export function parseKofioHtml(html: string, sourceUrl?: string): ParsedKofioBean {
  const $ = cheerio.load(html);

  let roaster = "";
  let productName = "";
  const ldJson = $('script[type="application/ld+json"]').first().html();
  if (ldJson) {
    try {
      const data = JSON.parse(ldJson);
      if (typeof data.brand === "string") roaster = data.brand;
      else if (typeof data.brand?.name === "string") roaster = data.brand.name;
      if (typeof data.name === "string") productName = data.name;
    } catch {
      // malformed JSON-LD — fall back to DOM-based extraction below
    }
  }

  const params: Record<string, string[]> = {};
  $("tr.product_parameter_item").each((_, row) => {
    const cells = $(row).find("td");
    const label = cells.first().text().trim();
    const valueCell = cells.eq(1).clone();
    valueCell.find(".xs_product_parameter_item_title").remove();

    const links = valueCell
      .find("a")
      .map((_, a) => $(a).text().trim())
      .get()
      .filter(Boolean);
    const values = links.length ? links : [valueCell.text().trim()].filter(Boolean);

    if (label && values.length) params[label] = values;
  });

  if (!roaster) roaster = firstParam(params, ["Pražírna", "Roastery"])?.[0] ?? "";

  const name =
    productName.replace(new RegExp(`^${escapeRegExp(roaster)}\\s*`), "").trim() ||
    productName ||
    $("h1").first().text().trim();

  const process = [
    firstParam(params, ["Proces", "Process"])?.join(", "),
    firstParam(params, ["Fermentace", "Fermentation"])?.join(", "),
  ]
    .filter(Boolean)
    .join(" — ");

  const roastDateRaw = firstParam(params, ["Datum pražení", "Roast Date"])?.[0];
  const roast_date = roastDateRaw ? parseKofioDate(roastDateRaw) : undefined;

  const notes = $(".product_description_body")
    .find("p, li")
    .map((_, el) => $(el).text().trim())
    .get()
    .filter(Boolean)
    .join("\n\n")
    .slice(0, 5000);

  return {
    name: name || "Unknown bean",
    roaster: roaster || "Unknown roaster",
    origin_country: firstParam(params, ["Země původu", "Coffee Origin", "Origin"])?.[0] ?? "",
    variety: firstParam(params, ["Odrůda", "Variety"])?.join(", ") || undefined,
    process: process || undefined,
    roast_level: firstParam(params, ["Stupeň pražení", "Roast Level"])?.[0] || undefined,
    roast_date,
    tasting_notes: firstParam(params, ["Chuťový profil", "Flavour Profile", "Flavor Profile"]) ?? [],
    recommended_methods: firstParam(params, ["Metoda přípravy", "Brewing Method"]) ?? [],
    notes: notes || undefined,
    source_url: sourceUrl,
  };
}
