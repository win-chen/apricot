SESSION = session
FE_DIR = goldenrod
BE_DIR = proto-server

build-frontend:
	cd goldenrod && \
	npm install

build-backend:
	cd proto-server && \
	go build server.go

build: build-frontend build-backend

tmux-setup:
	@printf "hello"
	# Create new session
	@tmux new-session -d -s $(SESSION)

	# Split into quarters
	@tmux split-window -h
	@tmux split-window -v
	@tmux select-pane -t 0
	@tmux split-window -v

	# Configure each pane
	# Top left - Frontend
	@tmux select-pane -t 0
	@tmux send-keys "cd $(CURDIR)/$(FE_DIR) && clear && echo 'Starting Frontend...' && npm run dev" C-m

	# Bottom left - Backend
	@tmux select-pane -t 1
	@tmux send-keys "cd $(CURDIR)/$(BE_DIR) && clear && echo 'Starting Backend...' && go run server.go" C-m

	# Top right - System monitoring
	@tmux select-pane -t 2
	@tmux send-keys "htop" C-m

	# Bottom right - Command shell
	@tmux select-pane -t 3
	@tmux send-keys "cd $(CURDIR) && clear && echo 'Command shell ready...'" C-m

	# Set equal pane sizes
	@tmux select-layout tiled

	# Attach to session
	@tmux attach-session -t $(SESSION)


run-frontend-dev:
	tmux new-session -d -s $(SESSION) 'cd goldenrod && npm run codegen'
	tmux split-window;   
	tmux send 'cd goldenrod && npm run dev' ENTER

run-backend-dev:
	tmux split-window
	tmux send 'cd proto-server && go run github.com/99designs/gqlgen generate .';

run-all: run-frontend-dev run-backend-dev