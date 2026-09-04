import { defineHandler } from "nitro";

export default defineHandler((event) => {
  return { hello: "API" };
});
