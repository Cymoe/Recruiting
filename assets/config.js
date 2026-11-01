/**
 * FUNNEL CONFIG — edit this file to make the funnel yours.
 * Everything brand/integration-specific lives here.
 */
window.FUNNEL_CONFIG = {
  brand: {
    name: "RepForce Recruiting",          // Your agency name
    tagline: "Sales hiring for home service companies",
    phone: "",                            // e.g. "(555) 123-4567" — leave blank to hide
    email: "hello@example.com",
  },

  // Booking calendar. Paste your Calendly (or Cal.com) event URL.
  // Calendly: https://calendly.com/your-name/strategy-call
  // Cal.com:  https://cal.com/your-name/strategy-call
  calendarUrl: "",

  // Where application answers are POSTed as JSON (Zapier/Make/n8n webhook,
  // GoHighLevel inbound webhook, your CRM, etc.). Leave blank to skip.
  leadWebhookUrl: "",

  // Optional analytics. Leave blank to disable.
  metaPixelId: "",
  googleAnalyticsId: "",                  // e.g. "G-XXXXXXX"

  // Qualification: applicants matching ANY of these go to a polite
  // "not a fit yet" page instead of the calendar.
  disqualify: {
    revenue: ["Under $500K"],
    timeline: ["Just researching"],
  },

  // Social proof — replace with REAL results only. Empty arrays hide the section.
  stats: [
    // { value: "120+", label: "Reps placed" },
  ],
  testimonials: [
    // { quote: "…", name: "Jane Doe", company: "Doe Roofing, Dallas TX" },
  ],
};
