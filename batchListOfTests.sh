#!/bin/bash

for x in $(eval echo {1..$1}); do
	echo "Running test suite: " $x
	npm run test:unit -- --runInBand --runTestsByPath $(cat $2) 2>> $3 
	sed -rin "s/\x1B\[([0-9]{1,3}(;[0-9]{1,2})?)?[mGK]//g" $3
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
