import React from 'react'
import {render} from 'react-dom'
import tmp from 'tmp';
import App from './App'


render(
  <App
  save={true}
  outdir={tmp.dirSync({ unsafeCleanup: true }).name}
  organize={true}
  overwrite={false}
  />,
  document.getElementById('react-root')
);
