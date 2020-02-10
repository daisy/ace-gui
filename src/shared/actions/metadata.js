import {SHOW_MODAL} from './modal';

export const EDIT_METADATA = 'EDIT_METADATA';

export function showMetadataEditor() {
  return {
    type: SHOW_MODAL,
    modalType: EDIT_METADATA,
  };
}
