#!/bin/bash

cd packages/parser
npx rollup -c

cd -

mv packages/parser/dist/tsaid.js docs/online/srv/tsaid.js

bun build.online.js

