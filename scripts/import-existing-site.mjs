import { mkdir, writeFile } from "node:fs/promises";

const source = "https://www.alceufogacaimoveis.com.br";
const paths = ["/", "/institucional", "/venda", "/alugar"];

function extractMeta(html, name) {
  const pattern = new RegExp(`<meta[^>]+(?:name|property)=["']${name}["'][^>]+content=["']([^"']+)["']`, "i");
  return html.match(pattern)?.[1] ?? null;
}

function extractJsonLd(html) {
  const matches = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  return matches
    .map((match) => {
      try {
        return JSON.parse(match[1]);
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

async function fetchPage(path) {
  const url = `${source}${path}`;
  const response = await fetch(url, {
    headers: {
      "user-agent": "Alceu-Fogaca-Migration-Audit/0.1"
    }
  });
  if (!response.ok) {
    return { url, ok: false, status: response.status };
  }
  const html = await response.text();
  return {
    url,
    ok: true,
    status: response.status,
    title: html.match(/<title>(.*?)<\/title>/i)?.[1] ?? null,
    description: extractMeta(html, "description"),
    canonical: html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)?.[1] ?? null,
    jsonLd: extractJsonLd(html),
    detectedBackendHints: {
      propertyList: html.includes("/real-estate-data/property/list"),
      propertyFilters: html.includes("/real-estate-data/property/filter/tabs/options")
    }
  };
}

const pages = [];
for (const path of paths) {
  pages.push(await fetchPage(path));
}

const report = {
  generatedAt: new Date().toISOString(),
  source,
  note: "Importacao opcional. Use este relatorio como apoio; cadastre e revise os imoveis reais pelo dashboard antes de publicar.",
  pages
};

await mkdir("tmp", { recursive: true });
await writeFile("tmp/import-alceu.json", `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log("Relatorio salvo em tmp/import-alceu.json");
