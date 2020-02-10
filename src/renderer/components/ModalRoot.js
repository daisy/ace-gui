import React from 'react';
import { connect } from 'react-redux';
import PreferencesModal from './PreferencesModal'
import MetaDataEditorModal from './MetaDataEditorModal'

const MODAL_COMPONENTS = {
  EDIT_PREFS: PreferencesModal,
  EDIT_METADATA: MetaDataEditorModal,
}

const ModalRoot = ({ modalType, modalProps }) => {
  if (!modalType) {
    return null;
  }

  const SpecificModal = MODAL_COMPONENTS[modalType]
  return <SpecificModal {...modalProps} />
}

export default connect(state => state.modal)(ModalRoot);