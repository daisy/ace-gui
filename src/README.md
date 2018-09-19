This was started from this boilerplate project:
https://github.com/pastahito/electron-react-webpack

#TODO

## High prio

* change messages window so that new items are obvious (both to screenreader users and sighted users)
* persist table filter selections
* sorting sometimes changes header col width ?!
* table styling tweaks

## Ideas

* add redux for cleaner state storage
* persist recent files too
* implementing style with HoC seems popular in material-ui ... consider it for the tables at least

## Polishing

* include logo on 'about' dialog and in app tray
* default prefs location + outdir should be app data dir
* overall wording and layout review
  - are there too many heading elements?
  - should we use material-ui drawers anywhere/everywhere?

# Limitations

* Open file vs directory behavior: https://github.com/electron/electron/blob/master/docs/api/dialog.md#dialogshowopendialogbrowserwindow-options-callback
* Dynamic menu support missing in electron
