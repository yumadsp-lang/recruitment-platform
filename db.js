(function () {
  const configured = !!(CONFIG.supabaseUrl && CONFIG.supabaseKey);
  let client = null;

  if (configured && window.supabase && window.supabase.createClient) {
    client = window.supabase.createClient(CONFIG.supabaseUrl, CONFIG.supabaseKey);
  }

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

    async getAllJobs() {
      if (!this.isConfigured()) throw new Error("Conexiune indisponibilă.");
      const { data, error } = await client
        .from("jobs").select("*")
        .order("sort", { ascending: true }).order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []).map(normalize);
    },

    async saveJob(job) {
      if (!this.isConfigured()) throw new Error("Conexiune indisponibilă.");
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
      if (!this.isConfigured()) throw new Error("Conexiune indisponibilă.");
      const { error } = await client.from("jobs").delete().eq("id", id);
      if (error) throw error;
    },

    async uploadImage(file) {
      if (!this.isConfigured()) throw new Error("Conexiune indisponibilă.");
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
      const path = "jobs/" + Date.now() + "-" + Math.random().toString(36).slice(2, 8) + "." + ext;
      const { error } = await client.storage.from("job-images").upload(path, file, {
        upsert: false, contentType: file.type || "image/jpeg"
      });
      if (error) throw error;
      const { data } = client.storage.from("job-images").getPublicUrl(path);
      return data.publicUrl;
    },

    async signIn(email, password) {
      if (!this.isConfigured()) throw new Error("Conexiune indisponibilă.");
      const { error } = await client.auth.signInWithPassword({ email, password });
      if (error) throw error;
    },
    async signOut() { if (client) await client.auth.signOut(); },
    async getSession() {
      if (!this.isConfigured()) return null;
      const { data } = await client.auth.getSession();
      return data ? data.session : null;
    },

    async getApprovedReviews() {
      if (!this.isConfigured()) return [];
      const { data, error } = await client.from("reviews").select("*")
        .eq("approved", true).order("created_at", { ascending: false });
      if (error) { console.error(error); return []; }
      return data || [];
    },
    async submitReview(r) {
      if (!this.isConfigured()) throw new Error("Conexiune indisponibilă.");
      const { error } = await client.from("reviews").insert({
        name: r.name, role: r.role || null, rating: r.rating || null,
        message: r.message, approved: false
      });
      if (error) throw error;
    },
    async adminAddReview(r) {
      if (!this.isConfigured()) throw new Error("Conexiune indisponibilă.");
      const { error } = await client.from("reviews").insert({
        name: r.name, role: r.role || null, rating: r.rating || null,
        message: r.message, approved: r.approved !== false
      });
      if (error) throw error;
    },
    async getAllReviews() {
      if (!this.isConfigured()) throw new Error("Conexiune indisponibilă.");
      const { data, error } = await client.from("reviews").select("*")
        .order("approved", { ascending: true }).order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    async setReviewApproved(id, approved) {
      if (!this.isConfigured()) throw new Error("Conexiune indisponibilă.");
      const { error } = await client.from("reviews").update({ approved }).eq("id", id);
      if (error) throw error;
    },
    async deleteReview(id) {
      if (!this.isConfigured()) throw new Error("Conexiune indisponibilă.");
      const { error } = await client.from("reviews").delete().eq("id", id);
      if (error) throw error;
    }
  };

  window.WeJobs = WeJobs;
})();
