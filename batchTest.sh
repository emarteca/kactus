#!/bin/bash

for x in $(eval echo {1..$1}); do
	echo "Running test suite: " $x
	npm run test:unit 2>> $2
	echo "Done running test suite, cleaning up now..."
	rm -rf /tmp/desktop-*
	rm -rf /tmp/some-other-worktree-path*
	rm -rf /tmp/github-desktop-worktree*
	rm -rf /tmp/get-top-level*
	rm -rf /tmp/no-*
	rm -rf /tmp/new-readme*
	rm -rf /tmp/blank-folder*
	rm -rf /tmp/global-config-here*
	rm /tmp/repo-test*
done
