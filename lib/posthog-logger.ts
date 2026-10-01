"use client";

import posthog from "posthog-js";

export const eventDiscoveryLogger = {
  explorationRequested() {
    posthog.logger.info("Event exploration requested", {
      interaction: "explore_events",
    });
  },

  detailsRequested(eventSlug: string) {
    posthog.logger.info("Event details requested", {
      event_slug: eventSlug,
    });
  },
};
