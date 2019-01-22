import React, { Component } from 'react';
import classes from './App.module.scss';
import People from './containers/People/People';
import Layout from './containers/Layout/Layout';
import ModifyingPerson from './containers/ModifyingPerson/ModifyingPerson';

const SPACING_Y = 90;
const SPACING_X = 80;
const WIDTH_HEIGHT = 300;
const IMAGE_WIDTH_HEIGHT = 215;
const VOLUME_WIDTH = 30;
const SPACING_UI = 50;
const BUTTON_HEIGHT = 180;
const BUTTON_SMALL_WIDTH = 180;
const BUTTON_LARGE_WIDTH = 560;

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: 100
    };
  }

  render() {
    return (
      <div className={classes.App}>
        <Layout 
          offsetTop = {SPACING_UI}
          spacingUI = {SPACING_UI}
          buttonHeight = {BUTTON_HEIGHT}
          buttonSmallWidth = {BUTTON_SMALL_WIDTH}
          buttonLargeWidth = {BUTTON_LARGE_WIDTH}
        />
        <People 
          offsetTop = {SPACING_UI*2 + BUTTON_HEIGHT}
          offsetLeft = {SPACING_UI}
          spacingY = {SPACING_Y}
          spacingX = {SPACING_X}
          widthHeight = {WIDTH_HEIGHT}
          imageWidthHeight = {IMAGE_WIDTH_HEIGHT}
          volumeWidth = {VOLUME_WIDTH}
        />
        <ModifyingPerson 
          offsetTop = {SPACING_UI*2 + BUTTON_HEIGHT}
          offsetLeft = {SPACING_UI}
          spacingY = {SPACING_Y}
          spacingX = {SPACING_X}
          widthHeight = {WIDTH_HEIGHT}
          imageWidthHeight = {IMAGE_WIDTH_HEIGHT}
        />
      </div>
    );
  }
}

export default App;
