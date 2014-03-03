node-calc
=========

*node-calc* is a node.js web interface for
[hcalc](https://github.com/SimSaladin/hcalc).


Features
--------

- Import and export csv files
- Edit spreadsheets collaboratively
- Completely keyboard-based navigation
- Three spreadsheet cell types
   * String literals
   * Numerals
   * Simple formulas whose value depend on (relative) numeral cells

Install
-------

### Dependencies

- executables: npm, grunt, ruby, compass (install via `gem install
  compass`, hcalc (see below)
- `npm install grunt-karma --save-dev`

#### Installing hcalc

Install `cabal-install`, and run `cabal update && cabal install hcalc`

XXX: not uploaded to hackage yet

### Tests

`grunt test`

`grunt serve` run development server

### For production

`grunt`

Development Schedule & Tasks
-----------------

Task | Completed?
--- | ---
Setup necessary NodeJS frameworks                     | n
Import csv's from the web interface                   | n
Spreadsheet column rendering in browser               | n
Design the keyboard navigation                        | n
Setup (socket.io?) multiuser collaborative stuff      | n
hcalc: import and export csv (with formulas or with values!) | n
Export csv from browser (with formulas or with values) | n
hcalc: Extend and document the DSL                     | n
Write install instructions                             | n
Upload hcalc to hackage                                | n


Technical details
-----------------

- UI and interactions with **AngularJS**
- Server-side app including real-time communication between server and clients **express.io**
