import React from 'react'
import {render} from 'react-dom'
import App from './App'

render(
  <App
  save={true}
  outdir="/Users/marisa/dev/out"
  organize={true}
  overwrite={false}
  />,
  document.getElementById('react-root')
);
