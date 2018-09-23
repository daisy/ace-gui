# Ace-GUI

A desktop GUI for Ace, the EPUB accessibility checker by the [DAISY Consortium](daisy.org).

# Development Notes

This was started from this boilerplate project:
https://github.com/pastahito/electron-react-webpack

## Work Items

* redux
  - remember table filter selections after tab change
  - remember everything
  - write all or part of store to disk
* messages window
  - scroll to bottom
  - use aria-live regions?
* table styling tweaks
 - sorting sometimes changes header col width
 - metadata name column inexplicably right-aligned
* logo
  - check that logo is set on all platforms
  - 'about' dialog
  - app tray
* persist state
  - replace userprefs.json

### Ideas

* persist recent files too
* implementing style with HoC seems popular in material-ui ... consider it for the tables at least

## Polishing

* default prefs location + outdir should be app data dir
* overall wording and layout review
  - are there too many heading elements?
  - should we use material-ui drawers anywhere/everywhere?

# Limitations

* Open file vs directory behavior: https://github.com/electron/electron/blob/master/docs/api/dialog.md#dialogshowopendialogbrowserwindow-options-callback
* Dynamic menu support missing in electron
