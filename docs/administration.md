# Administration

1. Run the migrations (if applicable):
   - When the service is running:
     ```bash
     docker compose exec core deno task migrate
     ```
   - When the service is not running:
     ```bash
     docker compose run --rm --remove-orphans core deno task migrate
     ```

## Environment variables

The core app reads the following variables in addition to the standard
`DATABASE_URL`, `BETTER_AUTH_URL`, `BETTER_AUTH_SECRET`,
`GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`:

| Variable | Default | Purpose |
| --- | --- | --- |
| `DATA_REPO_URL` | `https://codeberg.org/healthcheck/data.git` | Source repository cloned for HEALTHCHECK definitions. |
| `DATA_REPO_PATH` | `${TMPDIR}/healthcheck-data` | Local clone location. |
| `CODEBERG_BASE_URL` | `https://codeberg.org` | Forgejo base URL used for the API and the push remote. |
| `CODEBERG_OWNER` | `healthcheck` | Repository owner that receives pull requests. |
| `CODEBERG_REPO` | `data` | Repository name that receives pull requests. |
| `CODEBERG_TOKEN` | _(required for the "Define a HEALTHCHECK" flow)_ | Forgejo personal access token with `write:repository` scope. Used both for pushing the branch and for creating the pull request. Treat as a secret. |
