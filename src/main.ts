import { Context } from "@deepseek-ai/cordis";
import { apply as rendererApply } from "@mrthanlon/dsh-client-ui-renderer/src/client/index.ts";
import * as counter from "./plugins/counter";
import "./style.css";

async function boot() {
  const container = document.getElementById("app");
  if (!container) {
    throw new Error("No container found");
  }

  const ctx = new Context();
  const rendererFiber = ctx.plugin({ inject: [], apply: rendererApply });
  await rendererFiber.await();

  await ctx.inject(["slots", "uiRenderer"], async (fiber) => {
    const emptyScope = {
      key: undefined,
      hooks: {},
      keyedHooks: {},
      props: {},
    };
    fiber.slots.installScope("session", {
      current: {
        getSnapshot: () => emptyScope,
        subscribe: () => () => {},
      },
      resolve: () => {},
    });

    await ctx.plugin(counter);

    ctx.uiRenderer.mount(container);
  });
}

void boot().catch((err) =>
  console.error("Failed to boot the application:", err),
);
