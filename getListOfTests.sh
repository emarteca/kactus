#!/bin/bash

npm run test:unit -- --listTests --o | tail -n+5 > $1
