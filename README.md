# webcordis

基于 **Vite + React + Tailwind CSS** 的 Web 客户端,通过 **Cordis** 作为插件化运行时内核(`Context` / `plugin` / `slots`)组装界面,并使用 **Nitro**(经 `nitro/vite` 插件集成)提供同进程的 HTTP API 与生产构建产物。

> 项目当前为纯客户端(CSR)应用:无 SSR、无 TanStack Router 页面路由。API 由 Nitro 提供,入口为 `index.html` → `src/main.ts`。

## 技术栈

| 领域       | 选型                                                                                                                           |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------ |
| 构建       | [Vite](https://vite.dev) 7 + [TypeScript](https://www.typescriptlang.org) 6                                                    |
| UI         | React 18 + [Tailwind CSS](https://tailwindcss.com) 4(`@tailwindcss/vite`)                                                      |
| 运行时内核 | [@deepseek-ai/cordis](https://www.npmjs.com/package/@deepseek-ai/cordis)(插件化 Context/生命周期)                              |
| UI 组装    | `@deepseek-ai/dsh-client-ui-slots`(slot 注册表)+ `@mrthanlon/dsh-client-ui-renderer`(React slot 绑定 / `ctx.uiRenderer.mount`) |
| 服务端     | [Nitro](https://nitro.build) 3(`nitro/vite` 插件,`server/` 目录自动扫描)                                                       |
| 包管理     | pnpm(workspace 根工程)                                                                                                         |

## 目录结构

```text
webcordis/
├── index.html               # HTML 入口:挂载点 #app,加载 src/main.ts
├── vite.config.ts           # Vite 配置:react + tailwindcss + nitro(serverDir: ./server)
├── package.json             # scripts:dev / build / start
├── pnpm-workspace.yaml      # pnpm 构建策略(允许 esbuild 等)
├── tsconfig.json
├── server/                  # Nitro 服务端目录(自动扫描)
│   └── api/
│       └── hello.ts         # GET /api/hello → { "hello": "API" }
└── src/                     # 客户端源码
    ├── main.ts              # 应用入口:创建 Cordis Context 并启动(等效 boot)
    ├── style.css            # Tailwind 样式
    ├── vite-env.d.ts
    └── plugins/
        └── counter.tsx        # 示例插件:通过 slots 注册 "Counter" UI
```

## 快速开始

```bash
# 安装依赖
pnpm install

# 开发模式(默认 http://localhost:3000,支持 HMR)
pnpm dev

# 生产构建(输出到 .output/)
pnpm build

# 运行生产构建(默认端口 3000)
pnpm start
```

验证 API 是否生效:

```bash
curl http://localhost:3000/api/hello
# => {"hello":"API"}
```

## 关键文件说明

### `vite.config.ts`

```ts
nitro({
  debug: true,
  logLevel: 4,
  serverDir: "./server", // 关键:让 Nitro 扫描 ./server 下的 api/、routes/、middleware/ 等
});
```

- Nitro 以 Vite 插件形式运行:开发模式与 Vite dev server 同进程,生产构建则产出 `.output/server/index.mjs` + `.output/public`。
- `serverDir: "./server"` 是 API 能被扫描到的前提(Nitro 默认不扫任何目录)。不要用 `routesDir` 传路径——它只是目录名,真正决定扫描根的是 `serverDir` / `scanDirs`。

### `src/main.ts` — 应用入口

启动流程:

1. `new Context()` 创建 Cordis 应用实例。
2. `ctx.plugin({ inject: [], apply: rendererApply })` 加载 UI 渲染器插件,注入 `slots` 与 `uiRenderer` 能力。
3. 安装一个空的 `session` slot scope(当前无会话数据时先占位)。
4. `ctx.plugin(counter)` 注册业务插件(见下)。
5. `ctx.uiRenderer.mount(container)` 把 React 根挂载到 `#app`。

### `src/plugins/counter.tsx` — 插件示例

演示 Cordis + slots 的最小插件形态:

- `export const inject = ["slots"]`:声明依赖注入。
- `ctx.slots.register({ name: "root", ... })`:注册根容器。
- `ctx.slots.inject("app", ...)`:向 `app` slot 注入一个 `Counter` 组件。

新增界面插件时,复制该结构即可:注册自己的 slot 或在 `app` 内追加内容,并在 `src/main.ts` 中 `apply` 它。

### `server/api/hello.ts` — API 示例

```ts
import { defineHandler } from "nitro";

export default defineHandler((event) => {
  return { hello: "API" };
});
```

## 扩展指南

### 新增 API 端点

在 `server/api/` 下按路径放文件即可,Nitro 自动映射(文件路由):

```text
server/api/hello.ts          → GET /api/hello
server/api/users/index.ts    → GET /api/users
server/api/users/[id].ts     → GET /api/users/:id
server/api/posts.post.ts     → 仅 POST /api/posts(方法后缀)
```

### 新增客户端插件

1. 在 `src/plugins/` 下创建 `xxx.tsx`(参考 `counter.tsx`)。
2. 在 `src/main.ts` 中 `import { apply as xxxApply }` 并调用 `xxxApply(fiber)`。

### 端口与环境变量

- 开发 / 生产默认端口均为 `3000`。
- 可用 `PORT`(或 `NITRO_PORT`)覆盖;宿主绑定用 `HOST` / `NITRO_HOST`。
