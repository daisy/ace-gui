import {SHOW_MODAL, HIDE_MODAL} from '../actions/modal';

const initialState = {
  modalType: null,
  modalProps: {}
}
  
export default function modal(state = initialState, action) {
  state = JSON.parse(JSON.stringify(state));

  switch (action.type) {
    case SHOW_MODAL:
      return {
        modalType: action.modalType,
        modalProps: action.modalProps
      }
    case HIDE_MODAL:
      return {
        ...initialState,
      };
    default:
      return state
  }
}
  