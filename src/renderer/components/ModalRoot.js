import React from 'react';
import { connect } from 'react-redux';
import PreferencesModal from './PreferencesModal'

const MODAL_COMPONENTS = {
  EDIT_PREFS: PreferencesModal,
}

const ModalRoot = ({ modalType, modalProps }) => {
  if (!modalType) {
    return null;
  }

  const SpecificModal = MODAL_COMPONENTS[modalType]
  return <SpecificModal {...modalProps} />
}

export default connect(state => state.modal)(ModalRoot);