# Development

1. Make sure you have [Docker](https://docs.docker.com/get-docker/) up and running
1. Get [Visual Studio Code](https://code.visualstudio.com/) with [Dev Containers](https://code.visualstudio.com/docs/devcontainers/containers) ready
1. Install the dependencies with `deno install`
1. Open the project in the Dev Container and run `deno task dev`
1. Set environment variables in `apps/core/.env` (see `.env.example` for reference)
1. Run tests with `deno task test`

## Upgrade dependencies

1. Run `deno outdated -r -i -u` to see which dependencies are outdated and select the ones you want to update
