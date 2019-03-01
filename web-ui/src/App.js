import React, { Component } from 'react';
import classes from './App.module.scss';
import People from './containers/People/People';
import Layout from './containers/Layout/Layout';
import NewPerson from './containers/NewPerson/NewPerson';

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
      backgroundClicked: false,
      backgroundHeld: false,
      POIClicked: false,
      POIHeld: false,
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
    console.log("POI clicked")

    this.setState({POIClicked: true});
    this.setState({POIHeld: false });
    setTimeout(() => {this.POIHeldHandler()}, 500);
  }

  backgroundMouseDownHandler = (event) => {
    console.log('background mouse down');
    this.setState({backgroundClicked: true});
    this.setState({backgroundHeld: false });
    setTimeout(() => {this.backgroundHeldHandler()}, 500);
  }

  backgroundMouseUpHandler = (event) => {
    console.log('background released');
    this.setState({backgroundClicked: false});
    // this.setState({POIClicked: false});
  }

  backgroundHeldHandler(){
    if(this.state.backgroundClicked === true){
      console.log('background held');
      this.setState({backgroundHeld: true });
    }
  }

  POIMouseUpHandler = (event) => {
    console.log('POI released');
    this.setState({POIClicked: false});
  }

  POIHeldHandler(){
    if(this.state.POIClicked === true){
      console.log('POI held');
      this.setState({POIHeld: true });
    }
  }

  newPersonClickedHandler

  render() {

    if(this.state.backgroundHeld===true){
      var addPerson =
        <NewPerson 
          appWidth = {APP_WIDTH}
          offsetTop = {SPACING_UI*2 + BUTTON_HEIGHT}
          offsetLeft = {SPACING_UI}
          spacingY = {SPACING_Y}
          spacingX = {SPACING_X}
          widthHeight = {WIDTH_HEIGHT}
          imageWidthHeight = {IMAGE_WIDTH_HEIGHT}
          //A list of new people needs to be passed in
        />
    }

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
          onBackgroundMouseDown={this.backgroundMouseDownHandler}
          onBackgroundMouseUp={this.backgroundMouseUpHandler}
          onPOIMouseUp={this.POIMouseUpHandler}
          shouldRefresh={!this.state.backgroundHeld}
        />
        {addPerson}
      </div>
    );
  }
}

export default App;
