// api/sitemap.js  —  Vercel Serverless Function (Node)
// Generează sitemap.xml LA CERERE, direct din Supabase.
// Orice job activ adăugat din admin apare automat aici, fără rebuild.

const SUPABASE_URL = "https://cmpagnbvympkrtcjnefz.supabase.co";
const SUPABASE_KEY = "sb_publishable_B66wSpD1Xd2a7PkCUAZBQQ_qYY6650Q";
const SITE = "https://wejobs.ro";

const esc = s => String(s == null ? "" : s)
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;").replace(/'/g, "&#39;");

module.exports = async (req, res) => {
  let jobs = [];
  try {
    const r = await fetch(SUPABASE_URL + "/rest/v1/jobs?active=eq.true&select=id,created_at&order=sort.asc", {
      headers: { apikey: SUPABASE_KEY, Authorization: "Bearer " + SUPABASE_KEY }
    });
    if (r.ok) jobs = await r.json();
  } catch (e) { console.error(e); }

  const today = new Date().toISOString().slice(0, 10);

  const staticUrls = [
    { loc: SITE + "/",      changefreq: "daily",  priority: "1.0", lastmod: today },
    { loc: SITE + "/legal", changefreq: "yearly", priority: "0.3", lastmod: today }
  ];

  const jobUrls = jobs.map(j => ({
    loc: SITE + "/job?id=" + encodeURIComponent(j.id),
    changefreq: "weekly",
    priority: "0.8",
    lastmod: (j.created_at || today).slice(0, 10)
  }));

  const urls = [...staticUrls, ...jobUrls].map(u =>
    `  <url>
    <loc>${esc(u.loc)}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  res.statusCode = 200;
  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=86400");
  res.end(xml);
};
