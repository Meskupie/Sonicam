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
      selectedPOI: 2,
      masterVolume: 1,
      POIs: [{
        id: 2,
        is_visible: null,
        is_known: null,
        importance: 2,
        name: "Name",
        mute: null,
        volumeMultiplier: 1,
        volumeNormaliser: Math.random() * .3,
        thumb: "https://images.unsplash.com/photo-1485178575877-1a13bf489dfe?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1291&q=80",
        position: [1, 1],
        soundStatus: "normal"
      },
      {
        id: 3,
        is_visible: null,
        is_known: null,
        importance: 2,
        name: "Name",
        mute: null,
        volumeMultiplier: 1,
        volumeNormaliser: Math.random() * .3,
        thumb: "https://images.unsplash.com/photo-1485178575877-1a13bf489dfe?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1291&q=80",
        position: [1, 2],
        soundStatus: "muted"
      },
      {
        id: 1,
        is_visible: null,
        is_known: null,
        importance: 2,
        name: "Name",
        mute: null,
        volumeMultiplier: 1,
        volumeNormaliser: Math.random() * .3,
        thumb: "https://images.unsplash.com/photo-1485178575877-1a13bf489dfe?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1291&q=80",
        position: [2, 1],
        soundStatus: "poor"
      }]
    };
  }

  masterVolumeChangeHandler = (event) => {
    this.setState({ masterVolume: event.target.value / 100 });
  }

  userVolumeChangeHandler = (event, upOrDown) => {
    const personIndex = this.state.POIs.findIndex(x => x.id === this.state.selectedPOI);

    const POI = {
      ...this.state.POIs[personIndex]
    }

    if (upOrDown === 'up') {
      POI.volumeMultiplier = POI.volumeMultiplier + .01;
    }
    else if (upOrDown === 'down') {
      POI.volumeMultiplier = POI.volumeMultiplier - .01;
    }

    const POIs = [...this.state.POIs];
    POIs[personIndex] = POI;

    this.setState({ POIs: POIs });
  }

  POIClickedHandler = (selectedPOI) => {
    this.setState({ selectedPOI, selectedPOI });
  }

  render() {



    return (
      <div className={classes.App}>
        <Layout
          offsetTop={SPACING_UI}
          spacingUI={SPACING_UI}
          buttonHeight={BUTTON_HEIGHT}
          buttonSmallWidth={BUTTON_SMALL_WIDTH}
          buttonLargeWidth={BUTTON_LARGE_WIDTH}
          masterVolumeChangeHandler={this.masterVolumeChangeHandler}
          masterVolume={this.state.masterVolume}
          userVolume={this.state.POIs.find(x => x.id === this.state.selectedPOI).volumeMultiplier}
          userVolumeChangeHandler={this.userVolumeChangeHandler}
        />
        <People
          offsetTop={SPACING_UI * 2 + BUTTON_HEIGHT}
          offsetLeft={SPACING_UI}
          spacingY={SPACING_Y}
          spacingX={SPACING_X}
          widthHeight={WIDTH_HEIGHT}
          imageWidthHeight={IMAGE_WIDTH_HEIGHT}
          volumeWidth={VOLUME_WIDTH}
          state={this.state}
          POIClickedHandler={this.POIClickedHandler}
        />
        {/* <ModifyingPerson 
          offsetTop = {SPACING_UI*2 + BUTTON_HEIGHT}
          offsetLeft = {SPACING_UI}
          spacingY = {SPACING_Y}
          spacingX = {SPACING_X}
          widthHeight = {WIDTH_HEIGHT}
          imageWidthHeight = {IMAGE_WIDTH_HEIGHT}
        /> */}
      </div>
    );
  }
}

export default App;
