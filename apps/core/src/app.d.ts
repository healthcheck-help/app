declare global {
  namespace App {
    interface Locals {
      session: Awaited<
        ReturnType<typeof import("$lib/server/auth").auth.api.getSession>
      >;
      bodyClass?: string;
    }
    interface PageData {
      bodyClass?: string;
    }
  }
}

import "@poppanator/sveltekit-svg/dist/svg.d.ts";
import "unplugin-icons/types/svelte";
