/* =========================================================
   999920.com — SITE CONFIG (edit this file to go live)
   ---------------------------------------------------------
   Every form on the site is delivered to ONE inbox. The address
   is stored obfuscated and only assembled in the browser at the
   moment a form is sent, so it never appears in page text/HTML.
   ========================================================= */
window.SITE_CONFIG = {
  siteName: "999920",
  siteTagline: "久久久久爱你 · Love You Forever & Ever",
  siteUrl: "https://999920.com",

  /* Obfuscated destination inbox (do not paste a plain address here). */
  _k: 57,
  _m: [84, 86, 90, 23, 85, 80, 88, 84, 94, 121, 8, 88, 74, 82, 75, 86, 78, 91, 92, 78],

  /* Optional: after FormSubmit activation, paste the random alias string it
     emails you (e.g. "a1b2c3d4e5...") here — it replaces the address in the endpoint. */
  formAlias: "",

  /* Owner / acquisition contact banner shown at the top of every page */
  ownerContactUrl: "https://web.works/contact",

  /* ---------- Monetization ---------- */
  adsense: {
    enabled: false,                         // set true once approved
    client: "ca-pub-XXXXXXXXXXXXXXXX",      // your AdSense publisher ID
    slots: { top: "0000000000", inArticle: "0000000000", sidebar: "0000000000", footer: "0000000000" }
  },

  /* Donation / support buttons. Leave "" to hide a button. */
  donate: {
    kofi: "",            // e.g. "https://ko-fi.com/yourname"
    buymeacoffee: "",    // e.g. "https://buymeacoffee.com/yourname"
    paypalMe: "",        // e.g. "https://paypal.me/yourname"
    stripeLink: "",      // e.g. "https://buy.stripe.com/xxxx"
    githubSponsors: "",  // e.g. "https://github.com/sponsors/yourname"
    patreon: ""
  },

  /* YouTube: your channel + video IDs (11-char IDs) to feature. */
  youtube: {
    channelUrl: "",      // e.g. "https://www.youtube.com/@yourchannel"
    featured: [
      /* { id: "XXXXXXXXXXX", title: "What does 999920 mean?" } */
    ]
  },

  /* Affiliate tag (optional) appended to outbound shop links */
  amazonTag: "",

  /* Social profiles */
  social: { youtube: "", instagram: "", tiktok: "", pinterest: "", x: "", facebook: "" }
};
