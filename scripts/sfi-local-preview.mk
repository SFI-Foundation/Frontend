# Loaded by the ignored GNUmakefile installed for this checkout. The selected
# worktree lives in local Git config, never in credentials or committed paths.
.DEFAULT_GOAL := default
HOST ?= localhost
PORT ?= 4500
BASEURL ?=
PREVIEW_DESTINATION ?= _site_preview/$(PORT)
SFI_PREVIEW_COMMAND = python3 "$(SFI_PREVIEW_SOURCE)/scripts/sfi-local-preview.py" --source "$(SFI_PREVIEW_SOURCE)" --host "$(HOST)" --port "$(PORT)" --baseurl "$(BASEURL)" --destination "$(PREVIEW_DESTINATION)"

.PHONY: default serve serve-current dev jekyll-serve reload refresh stop preview-status
default serve serve-current dev jekyll-serve:
	@$(SFI_PREVIEW_COMMAND) start
reload refresh:
	@$(SFI_PREVIEW_COMMAND) restart
stop:
	@$(SFI_PREVIEW_COMMAND) stop
preview-status:
	@$(SFI_PREVIEW_COMMAND) status

# Retain the repository's existing explicit build/conversion targets. Startup
# itself neither cleans generated content nor touches any backend/database.
%:
	@$(MAKE) -C "$(SFI_PREVIEW_SOURCE)" -f Makefile "$@"
