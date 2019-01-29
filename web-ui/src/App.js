import React, { Component } from 'react';
import classes from './App.module.scss';
import People from './containers/People/People';
import Layout from './containers/Layout/Layout';

const APP_WIDTH = 800;
const APP_HEIGHT = 480;
const WIDTH_HEIGHT = 134;
const IMAGE_WIDTH_HEIGHT = 100;
const VOLUME_WIDTH = 12;
const SPACING_UI = 23;
const BUTTON_HEIGHT = 80;
const BUTTON_SMALL_WIDTH = 80;
const BUTTON_LARGE_WIDTH = 250;
const SPACING_Y = 45;
const SPACING_X = (APP_WIDTH-SPACING_UI*2-WIDTH_HEIGHT*4)/3;

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
        position: [2, 1],
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
        position: [3, 1],
        soundStatus: "poor"
      },
      {
        id: 4,
        is_visible: null,
        is_known: null,
        importance: 2,
        name: "Name",
        mute: null,
        volumeMultiplier: 1,
        volumeNormaliser: Math.random() * .3,
        thumb: "https://images.unsplash.com/photo-1485178575877-1a13bf489dfe?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1291&q=80",
        position: [4, 1],
        soundStatus: "normal"
      }]
    };
  }

  masterVolumeChangeHandler = (event) => {
    this.setState({ masterVolume: event.target.value / 100 });
  }

  userVolumeChangeHandler = (event, upOrDown) => {
    event.stopPropagation();
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

  POIClickedHandler = (event, selectedId) => {
    event.stopPropagation();
    this.setState({ selectedPOI: selectedId });
  }

  backgroundClickedHandler(event){
    console.log('div clicked');
  }

  render() {

    return (
      <div className={classes.App} onMouseDown={this.backgroundClickedHandler.bind(this)} >
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
