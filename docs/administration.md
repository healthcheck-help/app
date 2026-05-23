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
