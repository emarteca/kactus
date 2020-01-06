Forked from kactus-io/kactus

This is a bare bones README, with the basic instructions relevant to what I'm doing with this project. 
For a full, descriptive README refer to the original README in kactus-io/kactus


## Installing

- cd to the root directory of this project (i.e. the kactus directory)
- `npm install`

## Running the unit tests
`npm run test:unit`

Note: some of the tests were failing with an error "fatal: Not a git repository (or any parent up to mount parent /home/kozi) Stopping at filesystem boundary (GIT\_DISCOVERY\_ACROSS\_FILESYSTEM not set)."
If this is happening to you, my fix was to manually create this environment variable: `export GIT_DISCOVERY_ACROSS_FILESYSTEM=1`

Source: https://stackoverflow.com/questions/16853624/git-discovery-across-filesystem-not-set


