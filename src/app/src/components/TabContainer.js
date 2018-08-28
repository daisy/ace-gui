import React from 'react';
import PropTypes from 'prop-types';

export default class TabContainer extends React.Component {
  render() {
    return (
      <div>
        {this.props.children}
      </div>
    );
  }
}

TabContainer.propTypes = {
  children: PropTypes.node.isRequired,
};
