## General directive
- Read 'readme.md' files for the module you are working with.
- Keep code readable by verbose variable names - never abbreviate to a single letter.
- Keep dependencies minimal.
- Prefer simple low-code solutions to complex ones where possible.
- Pro-actively modularize the code 
- - Split groups of functions into separate files with clean interfaces.
- - Prefer file lengths of less than 200 lines (light preference).
- - Add readme.md files at the root of each module to describe the architecture and subcomponents.
- - Ensure readme files are updated at the end of each task.
- Skip tests which require a browser (see readme)

Your work is deeply appreciated.

## Directories not to touch
/node_modules

## Test suite dependency notes
To run `npm test`, Puppeteer requires several system libraries which Agents usually do not have.
If tests fail to launch the browser due to missing `.so` libraries, install:

sudo apt-get update
sudo apt-get install -y \
  libatk1.0-0 libatk-bridge2.0-0 libcups2t64 libxkbcommon0 \
  libxcomposite1 libxdamage1 libxfixes3 libxrandr2 \
  libgbm1 libasound2t64

These packages resolved the missing-library errors in this environment.