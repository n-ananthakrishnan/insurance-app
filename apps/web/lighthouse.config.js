module.exports = {
  ci: {
    collect: {
      url: process.env.LIGHTHOUSE_PAGES?.split("\n").map((s) => s.trim()),
      numberOfRuns: 3,
      settings: {
        // Emulate a mid-tier mobile device for the mobile score.
        emulatedFormFactor: "mobile",
        throttlingMethod: "simulate",
        throttling: {
          rtcDownload: "slow-10mbps-1infty",
          rtcUpload: "slow-10mbps-1infty",
          rttMs: 150,
          cpuSlowdownMultiplier: 4,
        },
      },
      startServerCommand: "npx serve apps/web/.next -l 3000",
      startServerReadyPattern: "Accepting connections",
    },
    assert: {
      assertions: {
        "categories:performance": ["error", { minScore: 0.9 }],
        "categories:accessibility": ["error", { minScore: 0.9 }],
        "categories:best-practices": ["error", { minScore: 0.9 }],
        "categories:seo": ["error", { minScore: 0.9 }],
      },
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
};
