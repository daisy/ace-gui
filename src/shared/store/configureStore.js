import { createStore, applyMiddleware, compose } from 'redux';
// import { persistState } from 'redux-devtools';
import thunk from 'redux-thunk';
// import promise from 'redux-promise';
// import createLogger from 'redux-logger';
// import { hashHistory } from 'react-router';
// import { routerMiddleware } from 'react-router-redux';
import getRootReducer from '../reducers';

// NEW electron-redux: https://github.com/klarna/electron-redux/issues/258
// Alternative: https://github.com/partheseas/electron-redux
// import {
//   // forwardToMain,
//   // forwardToRenderer,
//   // triggerAlias,
//   // replayActionMain,
//   // replayActionRenderer,
//   composeWithStateSync,
// } from 'electron-redux';

const isDev = process && process.env && (process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true');

/**
 * @param  {Object} initialState
 * @param  {String} [scope='main|renderer']
 * @return {Object} store
 */
export default function configureStore(electronReduxcomposeWithStateSync, initialState, scope = 'main') {
  // const logger = createLogger({
  //   level: scope === 'main' ? undefined : 'info',
  //   collapsed: true,
  // });
  //const router = routerMiddleware(hashHistory);

  let middleware = [
    thunk,
    // promise,
  ];

  if (isDev) {
    // middleware.push(logger);
  }

  // OLD electron-redux
  // (NEW does not depend on electron.remote)
  // if (scope === 'renderer') {
  //   middleware = [
  //     forwardToMain,
  //     ...middleware,
  //   ];
  // }
  // if (scope === 'main') {
  //   middleware = [
  //     triggerAlias,
  //     ...middleware,
  //     forwardToRenderer,
  //   ];
  // }

  const v1 = applyMiddleware(...middleware);
  const v2 = electronReduxcomposeWithStateSync(v1);
  const enhanced = [
    v2,
  ];

  // if (/*isDev && */scope === 'renderer') {
  //   enhanced.push(DevTools.instrument());
  //   enhanced.push(persistState(
  //     window.location.href.match(
  //       /[?&]debug_session=([^&]+)\b/
  //     )
  //   ));
  // }

  const rootReducer = getRootReducer(scope);

  let enhancer = null;
  if (isDev) {
    // https://github.com/zalmoxisus/redux-devtools-extension#14-using-in-production
    // redux-devtools-extension/developmentOnly
    const { composeWithDevTools } = require("redux-devtools-extension");
    enhancer = composeWithDevTools(...enhanced);
  } else {
    enhancer = compose(...enhanced);
  }
  const store = initialState /* scope === 'main' */ ? createStore(rootReducer, initialState, enhancer) : createStore(rootReducer, enhancer);

  // if (isDev && module.hot) {
  //   module.hot.accept('../reducers', () => {
  //     store.replaceReducer(require('../reducers'));
  //   });
  // }

  // OLD electron-redux
  // (NEW does not depend on electron.remote)
  // if (scope === 'main') {
  //   replayActionMain(store);
  // } else {
  //   replayActionRenderer(store);
  // }

  return store;
}
