NPM_BIN = ./node_modules/.bin
ENB = $(NPM_BIN)/enb
JSHINT = $(NPM_BIN)/jshint
JSCS = $(NPM_BIN)/jscs

.PHONY: validate
validate: lint

.PHONY: lint
lint: npm_deps
	$(JSHINT) .
	$(JSCS) -c .jscs.js .

.PHONY: npm_deps
npm_deps:
	npm install
