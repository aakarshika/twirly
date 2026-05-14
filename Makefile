# Dev ports — chosen in the dynamic/private range to avoid clashing with
# the usual suspects (3000, 4000, 5432, 8000, etc.).
FRONTEND_PORT := 5734
BACKEND_PORT  := 8734
DB_PORT       := 7432

.PHONY: dev help kill-ports

help:
	@echo "Available targets:"
	@echo "  make dev         Start Postgres + backend + frontend (kills anything on dev ports first)"
	@echo "  make kill-ports  Kill whatever is holding the dev ports"
	@echo ""
	@echo "Dev ports: frontend=$(FRONTEND_PORT)  backend=$(BACKEND_PORT)  postgres=$(DB_PORT)"

# Free up the dev ports if anything is squatting on them.
# Containers binding the DB port are released via `docker compose down`.
# Host processes (vite, node) are killed via lsof.
kill-ports:
	@echo "→ releasing dev ports: $(FRONTEND_PORT) $(BACKEND_PORT) $(DB_PORT)"
	-@docker compose down 2>/dev/null || true
	-@for p in $(FRONTEND_PORT) $(BACKEND_PORT) $(DB_PORT); do \
	  pids=$$(lsof -t -i :$$p 2>/dev/null || true); \
	  if [ -n "$$pids" ]; then \
	    echo "  killing $$pids on :$$p"; \
	    kill -9 $$pids 2>/dev/null || true; \
	  fi; \
	done

# 1. Free any process holding the dev ports.
# 2. Bring up Postgres; --wait blocks until the healthcheck passes.
# 3. Run vite + server in foreground via concurrently.
dev: kill-ports
	docker compose up -d --wait
	pnpm run dev
