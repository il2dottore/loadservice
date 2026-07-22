# LoadService Backend Development Scripts

The `dev-scripts` directory contains helper programs for building or watching multiple NestJS applications in the LoadService backend monorepo. Both scripts discover application names from `backend/nest-cli.json`, so newly registered Nest applications are picked up automatically.

## Project Map

| File | Responsibility |
|---|---|
| `build.js` | Build all applications, or a selected list, one after another |
| `watch.js` | Start all applications, or a selected list, concurrently in watch mode |

## Prerequisites

- Node.js `>=24`.
- Backend dependencies installed with `pnpm install`.
- Every target registered as an `application` under `projects` in `nest-cli.json`.
- Run commands from the `backend` directory so the Nest configuration and dependencies are available.

The currently discovered applications are:

```text
attack
common
payment
```

## Build Applications

Build every registered application sequentially:

```bash
node dev-scripts/build.js
```

Build only selected applications:

```bash
node dev-scripts/build.js common attack
```

For each target, `build.js` runs:

```text
npx nest build <application>
```

It also sets `APP_NAME` to the current application. `webpack.config.js` uses that value to select `apps/<application>/tsconfig.app.json` for `ts-loader`. The script stops immediately when one build fails.

This helper is the working aggregate build path for the current monorepo. The package-level `pnpm build` script still calls `nest build` without an application name and therefore looks for the nonexistent `backend/src/main.ts`.

## Watch Applications

Start every registered application in parallel with file watching:

```bash
node dev-scripts/watch.js
```

Start only selected applications:

```bash
node dev-scripts/watch.js common attack
```

The script composes one command per application:

```text
npx nest start <application> --watch
```

It then runs them through `concurrently` with named output streams. The `-k` option stops the remaining processes when one process exits.

## Target Validation

Both scripts validate every command-line target against `nest-cli.json`. An unknown name exits before running any build or service and prints the available applications.

Example:

```bash
node dev-scripts/build.js unknown-service
```

## Useful Checks

```bash
node dev-scripts/build.js common
node dev-scripts/build.js attack
node dev-scripts/build.js payment
```

To verify automatic discovery after editing the Nest configuration, run the script with an invalid target and inspect the printed application list.

## Troubleshooting

- `Unknown application`: add the application to `projects` in `nest-cli.json` or correct the command-line name.
- `npx` or `nest` is unavailable: run `pnpm install` in `backend` and execute the helper from that project.
- A build uses the wrong TypeScript configuration: confirm `APP_NAME` matches a directory under `apps` and that its `tsconfig.app.json` exists.
- Watch mode stops all services: this is expected when one child exits because `concurrently` is invoked with `-k`.
- Attack or Payment watch mode behaves like Common: unlike `build.js`, `watch.js` does not explicitly set `APP_NAME`; review the custom webpack loader configuration if service-specific compilation is incorrect.

## Notes For Development

- These helpers are not currently exposed through `package.json` scripts; invoke them with `node dev-scripts/<script>.js`.
- `build.js` is sequential, while `watch.js` is concurrent.
- Keep application discovery driven by `nest-cli.json` rather than duplicating a service list in these scripts.
- `execSync` receives application names only after allow-list validation against the Nest configuration.
