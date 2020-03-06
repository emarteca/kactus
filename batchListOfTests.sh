#!/bin/bash

# if the output files already exist, move them to avoid accidentally appending the new 
# data and therefore polluting it
if test -f "$3"; then
	mv $3 `echo $3"_old"`
fi
if test -f "$4"; then
	mv $4 `echo $4"_old"`
fi

warmups=0
if (( "$#" > 4 )); then
	warmups=$5
fi

for (( x=0; x<$warmups; x++ )); do
	echo "Warmup run: "$x" of "$warmups
	# run some tests into the void 
	npm run test:unit
done

for x in $(eval echo {1..$1}); do
	echo "Running test suite: " $x
	npm run test:unit -- --runInBand --runTestsByPath $(cat $2) 2>> $3 
	sed -rin "s/\x1B\[([0-9]{1,3}(;[0-9]{1,2})?)?[mGK]//g" $3
	python process_jest_xml_out.py $4
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
