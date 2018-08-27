This was started from this boilerplate project:
https://github.com/pastahito/electron-react-webpack

#TODO

* persist preferences
* integrate ace
* prompt to save report
* add feature: given a report, run ace again
* a11y review

# ARGH

* New tab doesn't get focus automatically upon opening a new report / Can't force a particular tab to display
* Report section tab resets every time the report is selected
* Logo not showing on splash screen

# Limitations

* Open file vs directory behavior: https://github.com/electron/electron/blob/master/docs/api/dialog.md#dialogshowopendialogbrowserwindow-options-callback
* Dynamic menu support missing in electron
