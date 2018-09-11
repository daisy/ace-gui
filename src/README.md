This was started from this boilerplate project:
https://github.com/pastahito/electron-react-webpack

#TODO

## High prio

* change messages window so that new items are obvious (both to screenreader users and sighted users)
* table filter
* set min width on rule column of violations table

## Ideas

* sidebar as series of expanders
* drawer-style sidebar
* drawer-style messages area?

## Polishing

* include logo on 'about' dialog and in app tray
* default prefs location + outdir should be app data dir
* overall wording review

# Limitations

* Open file vs directory behavior: https://github.com/electron/electron/blob/master/docs/api/dialog.md#dialogshowopendialogbrowserwindow-options-callback
* Dynamic menu support missing in electron
