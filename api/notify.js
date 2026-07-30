// api/notify.js — Vercel Serverless Function
// Trimite o notificare push către dispozitivele adminului (telefonul tău)
// atunci când cineva aplică. Cheia privată VAPID stă DOAR aici, pe server.
//
// Variabile de mediu necesare în Vercel (Settings → Environment Variables):
//   VAPID_PUBLIC        = cheia publică VAPID
//   VAPID_PRIVATE       = cheia privată VAPID
//   VAPID_SUBJECT       = mailto:support@wejobs.ro
//   SUPABASE_URL        = https://cmpagnbvympkrtcjnefz.supabase.co
//   SUPABASE_SERVICE_KEY= (Service Role key din Supabase → Settings → API)

const webpush = require("web-push");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_KEY;
const VAPID_PUBLIC  = process.env.VAPID_PUBLIC;
const VAPID_PRIVATE = process.env.VAPID_PRIVATE;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || "mailto:support@wejobs.ro";

function readBody(req) {
  return new Promise((resolve) => {
    if (req.body) { // Vercel may pre-parse
      try { return resolve(typeof req.body === "string" ? JSON.parse(req.body) : req.body); }
      catch { return resolve({}); }
    }
    let raw = "";
    req.on("data", (c) => (raw += c));
    req.on("end", () => { try { resolve(JSON.parse(raw || "{}")); } catch { resolve({}); } });
    req.on("error", () => resolve({}));
  });
}

module.exports = async (req, res) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  if (req.method !== "POST") {
    res.statusCode = 405; return res.end(JSON.stringify({ ok: false, error: "Method not allowed" }));
  }
  if (!SUPABASE_URL || !SERVICE_KEY || !VAPID_PUBLIC || !VAPID_PRIVATE) {
    // Nu bloca aplicarea dacă push-ul nu e configurat încă.
    res.statusCode = 200; return res.end(JSON.stringify({ ok: false, error: "Push not configured" }));
  }

  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);

  const data = await readBody(req);
  const name  = (data.name  || "Cineva").toString().slice(0, 80);
  const job   = (data.job   || "un job").toString().slice(0, 120);
  const phone = (data.phone || "").toString().slice(0, 40);

  // Ia toate dispozitivele abonate
  let subs = [];
  try {
    const r = await fetch(SUPABASE_URL + "/rest/v1/push_subscriptions?select=*", {
      headers: { apikey: SERVICE_KEY, Authorization: "Bearer " + SERVICE_KEY }
    });
    if (r.ok) subs = await r.json();
  } catch (e) {
    res.statusCode = 200; return res.end(JSON.stringify({ ok: false, error: "DB read failed" }));
  }

  const payload = JSON.stringify({
    title: "Aplicație nouă — WeJobs.ro",
    body: name + " a aplicat pentru: " + job + (phone ? " · " + phone : ""),
    url: "/admin.html",
    tag: "wejobs-application"
  });

  let sent = 0, removed = 0;
  await Promise.all(subs.map(async (s) => {
    const subscription = { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } };
    try {
      await webpush.sendNotification(subscription, payload);
      sent++;
    } catch (err) {
      // 404/410 = abonament expirat → îl ștergem
      if (err && (err.statusCode === 404 || err.statusCode === 410)) {
        try {
          await fetch(SUPABASE_URL + "/rest/v1/push_subscriptions?endpoint=eq." + encodeURIComponent(s.endpoint), {
            method: "DELETE",
            headers: { apikey: SERVICE_KEY, Authorization: "Bearer " + SERVICE_KEY }
          });
          removed++;
        } catch {}
      }
    }
  }));

  res.statusCode = 200;
  res.end(JSON.stringify({ ok: true, sent, removed, total: subs.length }));
};
