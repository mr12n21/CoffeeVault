import * as cheerio from "cheerio";

export interface ParsedKofioBean {
  name: string;
  roaster: string;
  origin_country: string;
  variety?: string;
  process?: string;
  roast_level?: string;
  tasting_notes: string[];
  recommended_methods: string[];
  source_url?: string;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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

  const name =
    productName.replace(new RegExp(`^${escapeRegExp(roaster)}\\s*`), "").trim() ||
    productName ||
    $("h1").first().text().trim();

  const process = [params["Proces"]?.join(", "), params["Fermentace"]?.join(", ")].filter(Boolean).join(" — ");

  return {
    name: name || "Unknown bean",
    roaster: roaster || "Unknown roaster",
    origin_country: params["Země původu"]?.[0] ?? "",
    variety: params["Odrůda"]?.join(", ") || undefined,
    process: process || undefined,
    roast_level: params["Stupeň pražení"]?.[0] || undefined,
    tasting_notes: params["Chuťový profil"] ?? [],
    recommended_methods: params["Metoda přípravy"] ?? [],
    source_url: sourceUrl,
  };
}
