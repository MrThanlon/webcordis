import type { Context } from "@deepseek-ai/cordis";
import type {} from "@mrthanlon/dsh-client-ui-renderer/client";
import type {} from "@deepseek-ai/dsh-client-ui-slots";
import { useState } from "react";

declare module "@deepseek-ai/dsh-client-ui-slots" {
  interface SlotMap {
    app: { kind: "list"; scope: "root" };
  }
}

export const inject = ["slots"];

export function apply(ctx: Context) {
  ctx.slots.register(
    {
      name: "root",
      children: {
        app: { kind: "list", scope: "root" },
      },
    },
    ({ renderSlot }) => renderSlot("app", {}),
  );

  ctx.slots.inject("app", () =>
    ctx.slots.register(
      {
        name: "app",
        id: "counter",
      },
      Counter,
    ),
  );
}

function Counter() {
  const [count, setCount] = useState(0);
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <button
        className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded"
        onClick={() => setCount((c) => c + 1)}
      >
        Count: {count}
      </button>
    </div>
  );
}
