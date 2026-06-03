/* =========================================================================
   WEJOBS.RO — STRAT DE DATE
   Vorbește cu Supabase. Dacă Supabase nu e configurat în config.js,
   folosește joburile de rezervă (FALLBACK_JOBS) — site-ul tot merge.
   NU trebuie să modifici nimic aici.
   ========================================================================= */
(function () {
  const configured = !!(CONFIG.supabaseUrl && CONFIG.supabaseKey);
  let client = null;

  if (configured && window.supabase && window.supabase.createClient) {
    client = window.supabase.createClient(CONFIG.supabaseUrl, CONFIG.supabaseKey);
  }

  // Normalizează un rând din baza de date la forma folosită de pagini
  function normalize(row) {
    return {
      id: row.id,
      active: row.active !== false,
      title: row.title || "",
      category: row.category || "",
      salary: row.salary || "",
      image: row.image || "",
      facts: row.facts || {},
      perks: row.perks || [],
      intro: row.intro || "",
      responsibilities: row.responsibilities || [],
      requirements: row.requirements || [],
      offer: row.offer || [],
      sort: typeof row.sort === "number" ? row.sort : 0
    };
  }

  const WeJobs = {
    isConfigured() { return configured && !!client; },

    // ---- PUBLIC: doar joburi active, sortate ----
    async getJobs() {
      if (!this.isConfigured()) {
        return FALLBACK_JOBS.filter(j => j.active !== false);
      }
      const { data, error } = await client
        .from("jobs").select("*").eq("active", true)
        .order("sort", { ascending: true }).order("created_at", { ascending: false });
      if (error) { console.error(error); return FALLBACK_JOBS.filter(j => j.active !== false); }
      return (data || []).map(normalize);
    },

    async getJob(id) {
      if (!this.isConfigured()) {
        return FALLBACK_JOBS.find(j => j.id === id && j.active !== false) || null;
      }
      const { data, error } = await client.from("jobs").select("*").eq("id", id).maybeSingle();
      if (error) { console.error(error); return null; }
      if (!data || data.active === false) return null;
      return normalize(data);
    },

    // ---- ADMIN (necesită logare) ----
    async getAllJobs() { // include și joburile ascunse
      if (!this.isConfigured()) throw new Error("Supabase nu este configurat.");
      const { data, error } = await client
        .from("jobs").select("*")
        .order("sort", { ascending: true }).order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []).map(normalize);
    },

    async saveJob(job) { // insert sau update (upsert după id)
      if (!this.isConfigured()) throw new Error("Supabase nu este configurat.");
      const payload = {
        id: job.id, active: job.active, title: job.title, category: job.category,
        salary: job.salary, image: job.image, facts: job.facts, perks: job.perks,
        intro: job.intro, responsibilities: job.responsibilities,
        requirements: job.requirements, offer: job.offer, sort: job.sort || 0
      };
      const { error } = await client.from("jobs").upsert(payload, { onConflict: "id" });
      if (error) throw error;
    },

    async deleteJob(id) {
      if (!this.isConfigured()) throw new Error("Supabase nu este configurat.");
      const { error } = await client.from("jobs").delete().eq("id", id);
      if (error) throw error;
    },

    // ---- AUTENTIFICARE ----
    async signIn(email, password) {
      if (!this.isConfigured()) throw new Error("Supabase nu este configurat.");
      const { error } = await client.auth.signInWithPassword({ email, password });
      if (error) throw error;
    },
    async signOut() { if (client) await client.auth.signOut(); },
    async getSession() {
      if (!this.isConfigured()) return null;
      const { data } = await client.auth.getSession();
      return data ? data.session : null;
    }
  };

  window.WeJobs = WeJobs;
})();
