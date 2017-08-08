import React, {createElement} from 'react';
import PropTypes from 'prop-types';
import FirstPersonViewport from '../../viewports/first-person-viewport';
import GenericControls from '../../controls/generic-controls';
import FirstPersonState from '../../controls/first-person-state';

import EventManager from '../../utils/events/event-manager';

const propTypes = {
  /* Viewport properties */
  position: PropTypes.arrayOf(PropTypes.number), // eye position,
  lookAt: PropTypes.arrayOf(PropTypes.number), // target position
  up: PropTypes.arrayOf(PropTypes.number), // target position,

  fov: PropTypes.number, // field of view
  near: PropTypes.number,
  far: PropTypes.number,
  width: PropTypes.number.isRequired, // viewport width in pixels
  height: PropTypes.number.isRequired, // viewport height in pixels

  /* Model properties */
  bounds: PropTypes.object, // bounds in the shape of {minX, minY, minZ, maxX, maxY, maxZ}

  /* Callbacks */
  onViewportChange: PropTypes.func.isRequired,

  /* Controls */
  controls: PropTypes.object
};

const defaultProps = {
  lookAt: [0, 0, 0],
  rotationX: 0,
  rotationY: 0,
  translationX: 0,
  translationY: 0,
  distance: 10,
  zoom: 1,
  minZoom: 0,
  maxZoom: Infinity,
  fov: 50,
  near: 1,
  far: 1000
};

/*
 * Maps mouse interaction to a deck.gl Viewport
 */
export default class OrbitController extends React.Component {

  // Returns a deck.gl Viewport instance, to be used with the DeckGL component
  static getViewport(viewport) {
    return new FirstPersonViewport(viewport);
  }

  constructor(props) {
    super(props);

    this.state = {
      // Whether the cursor is down
      isDragging: false
    };

    this._controls = props.controls || new FirstPersonControls();
  }

  componentDidMount() {
    const {eventCanvas} = this.refs;

    const eventManager = new EventManager(eventCanvas);
    this._eventManager = eventManager;

    this._controls.setOptions(Object.assign({}, this.props, {
      onStateChange: this._onInteractiveStateChange.bind(this),
      eventManager
    }));
  }

  componentWillUpdate(nextProps) {
    this._controls.setOptions(nextProps);
  }

  componentWillUnmount() {
    if (this._eventManager) {
      // Must destroy because hammer adds event listeners to window
      this._eventManager.destroy();
    }
  }

  _onInteractiveStateChange({isDragging = false}) {
    if (isDragging !== this.state.isDragging) {
      this.setState({isDragging});
    }
  }

  render() {
    return (
      createElement('div', {
        ref: 'eventCanvas'
      }, this.props.children)
    );
  }
}

OrbitController.propTypes = propTypes;
OrbitController.defaultProps = defaultProps;
