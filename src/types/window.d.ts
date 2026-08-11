import type { Player } from "daap-player";
import type { FontPreloader } from "../objects/font-preloader";
import type animejs from "animejs";

declare global {
  interface Window {
    // Player bundle entry point (exposed for embedding)
    WebSliderPlayer: typeof Player;
    // Animation engine (exposed so external object extensions can use it)
    animejs: typeof animejs;
    // Font preloader singleton
    WSFontPreloader: FontPreloader;
    // WordPress-specific settings injected by the PHP plugin
    daapForcerefreshSettings?: {
      baseMediaUrl?: string;
      homePage?: string;
      apiUrl?: string;
      nonce?: string;
      [key: string]: unknown;
    };
    // WordPress dirty-state flag for unsaved changes detection
    DAAP_isDirty?: boolean;
    // Stage panel global state (rotation, mouse-down tracking)
    DAAP?: Record<string, unknown>;
  }
}
