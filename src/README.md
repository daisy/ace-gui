This was started from this boilerplate project:
https://github.com/pastahito/electron-react-webpack

#TODO

* a11y review
  - change messages window to be a list; make new items obvious
  - have a command to copy contents of messages window
  - use live regions
* table sort + filter
* include logo on 'about' dialog and in app tray
* default prefs location + outdir should be app data dir
* set min width on rule column of violations table
* add show-in-finder option for reports

# Limitations

* Open file vs directory behavior: https://github.com/electron/electron/blob/master/docs/api/dialog.md#dialogshowopendialogbrowserwindow-options-callback
* Dynamic menu support missing in electron (we could use it to list all open reports in a menu)

# questions

* dev environment not always picking up changes
* will material-ui tabs re-render each time and forget things like table sort? it seems likely (need to implement table sort to test it)

# future
optionally write reports to disk, rather than always
