This was started from this boilerplate project:
https://github.com/pastahito/electron-react-webpack

#TODO

* persist preferences
* integrate ace
* prompt to save report
* add feature: given a report, run ace again
* a11y review
* more css
* review dependencies

# ARGH

* Report view not refreshing when a new file gets opened
* Logo not showing on splash screen

# Limitations

* Open file vs directory behavior: https://github.com/electron/electron/blob/master/docs/api/dialog.md#dialogshowopendialogbrowserwindow-options-callback
* Dynamic menu support missing in electron (we could use it to list all open reports in a menu)

# rejected UI components

* react-table: not accessible
* react-data-grid: not accessible

# questions

* dev environment not always picking up changes
* will material-ui tabs re-render each time and forget things like table sort? it seems likely (need to implement table sort to test it)
