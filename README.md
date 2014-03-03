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
Setup necessary NodeJS frameworks                      | Done
Spreadsheet column rendering in browser                | Started
Spreadsheet editing: the cursor, text input            | n
Concurrent edits: updates from users' edits            | n
Import csv's from the web interface                    | n
Export csv from browser (with formulas or with values) | n
Design the keyboard navigation                         | n
Setup (socket.io?) multiuser collaborative stuff       | Done
Write install instructions                             | Started
Setup in heroku or somewhere                           | n
hcalc: Extend and document the DSL                     | n
hcalc: Upload to hackage                               | n
hcalc: import/export csv (formulas or with values!)    | n

See also activity_log.md

### UI

Main UI components:

- info bar at top
   * title of current sheet
   * actions: export, import
   * list of users
- Sheet view
   * Static row and column labels
   * Dynamic user cursors
- Changelog

UI sketch below:

![UI design sketch](ui_design.jpg)

Technical details
-----------------

- UI and interactions with **AngularJS**
- Server-side app including real-time communication between server and clients **express.io**


### Files of interest 
**server/index.js** The node app


-----

**Disclaimer:** *I think I had absolutely no idea what I was actually doing 99%
of the time I spent on this. In my opinion the architecture is extremely crappy
and illogical. But then again, I am no JS expert.*
