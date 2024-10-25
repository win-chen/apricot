SESSION = session
FE_DIR = goldenrod
BE_DIR = proto-server
PY_DIR = pythie

build-frontend:
	cd goldenrod && \
	npm install

build-backend-go:
	cd proto-server && \
	go build server.go

build-backend-py:
	cd pythie && \
	poetry build

build: build-frontend build-backend
	printf "npm"

run-dev:
	@printf "running dev tmux"
	# Create new session
	@tmux new-session -d -s $(SESSION)

	# Split into quarters
	@tmux split-window -h
	@tmux split-window -v
	@tmux select-pane -t 0
	@tmux split-window -v
	@tmux select-pane -t 0
	@tmux split-window -h

	# Configure each pane
	# Top left - Frontend Server
	@tmux select-pane -t 0
	@tmux send-keys "cd $(CURDIR)/$(FE_DIR) && clear && echo 'Starting Frontend Server...' && npm run dev" C-m

	# Bottom left - Backend Server
	@tmux select-pane -t 1
	@tmux send-keys "cd $(CURDIR)/$(BE_DIR) && clear && echo 'Starting Backend Server...' && go run github.com/99designs/gqlgen generate . && go run server.go" C-m

	# Top right - Frontend Codegen
	@tmux select-pane -t 2
	@tmux send-keys "cd $(CURDIR)/$(FE_DIR) && clear && echo 'Starting Frontend Codegen...' && npm run codegen" C-m

	# Bottom Right - Python server
	@tmux select-pane -t 3
	@tmux send-keys "cd $(CURDIR)/$(PY_DIR) && clear && echo 'Starting python server...' && flask --app main run" C-m

	# Bottom - Command shell
	@tmux select-pane -t 4
	@tmux send-keys "cd $(CURDIR) && clear && echo 'Command shell ready...'" C-m

	# Set equal pane sizes
	@tmux select-layout tiled

	# Attach to session
	@tmux attach-session -t $(SESSION)
