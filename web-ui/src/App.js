import React, { Component } from 'react';
import classes from './App.module.scss';
import People from './containers/People/People';
import Layout from './containers/Layout/Layout';
import NewPerson from './containers/NewPerson/NewPerson';
import { getVideoFeed } from './hoc/GetVideoFeed/GetVideoFeed';

const APP_WIDTH = 800;
//Display issues (non 1:1 pixel aspect ratio) causes the app height 451 
//pixels with stetching instead of 480
const APP_HEIGHT = 451;
const WIDTH_HEIGHT = 150;
const IMAGE_WIDTH_HEIGHT = 115;
const VOLUME_WIDTH = 12;
const SPACING_UI = 16;
const BUTTON_HEIGHT = 70;
const BUTTON_SMALL_WIDTH = 70;
const BUTTON_LARGE_WIDTH = 215;
const SPACING_Y = 25;
const SPACING_X = (APP_WIDTH - SPACING_UI * 2 - WIDTH_HEIGHT * 4) / 3;
var holdPOIOrBackground;
var holdUserVolumeButton;

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedPOI: "background",
      masterVolume: 1,
      backgroundClicked: false,
      backgroundHeld: false,
      copyParsedImage: null,
      POIClicked: false,
      POIHeld: null,
      POIs: [
        {
          id: "background",
          is_visible: null,
          is_known: null,
          importance: null,
          name: "Background",
          mute: false,
          volumeMultiplier: .5 + Math.random() * .7,
          volumeNormaliser: 0,
          position: [1, 1],
          soundStatus: "normal"
        },
        {
          id: 2,
          is_visible: null,
          is_known: null,
          importance: 2,
          name: "Name",
          mute: false,
          volumeMultiplier: .5 + Math.random() * .7,
          volumeNormaliser: Math.random() * .3,
          position: [2, 2],
          soundStatus: "normal"
        },
        {
          id: 3,
          is_visible: null,
          is_known: null,
          importance: 4,
          name: "Name",
          mute: true,
          volumeMultiplier: .5 + Math.random() * .7,
          volumeNormaliser: Math.random() * .3,
          position: [2, 1],
          soundStatus: "normal"
        },
        {
          id: 1,
          is_visible: null,
          is_known: null,
          importance: 5,
          name: "Name",
          mute: false,
          volumeMultiplier: .5 + Math.random() * .7,
          volumeNormaliser: Math.random() * .3,
          position: [3, 1],
          soundStatus: "poor"
        },
        {
          id: 4,
          is_visible: null,
          is_known: null,
          importance: 11,
          name: "LongName",
          mute: false,
          volumeMultiplier: .5 + Math.random() * .7,
          volumeNormaliser: Math.random() * .3,
          position: [4, 1],
          soundStatus: "lost"
        },
        {
          id: 5,
          is_visible: null,
          is_known: null,
          importance: 6,
          name: "Name",
          mute: false,
          volumeMultiplier: .5 + Math.random() * .7,
          volumeNormaliser: Math.random() * .3,
          position: [1, 2],
          soundStatus: "normal"
        },
        {
          id: 6,
          is_visible: null,
          is_known: null,
          importance: 9,
          name: "Name",
          mute: false,
          volumeMultiplier: .5 + Math.random() * .7,
          volumeNormaliser: Math.random() * .3,
          position: null,
          soundStatus: "normal"
        },
        {
          id: 7,
          is_visible: null,
          is_known: null,
          importance: 8,
          name: "Name",
          mute: false,
          volumeMultiplier: .5 + Math.random() * .7,
          volumeNormaliser: Math.random() * .3,
          position: null,
          soundStatus: "normal"
        },
        {
          id: 8,
          is_visible: null,
          is_known: null,
          importance: 1,
          name: "Name",
          mute: false,
          volumeMultiplier: .5 + Math.random() * .7,
          volumeNormaliser: Math.random() * .3,
          position: null,
          soundStatus: "normal"
        }]
    };
    getVideoFeed((err, image) => {
      let parsedImage = JSON.parse(image);
      //This needs to change.  Setting state in constructor can lead to bad behaviour
      this.setState({ parsedImage });
    });
  }

  masterVolumeChangeHandler = (event) => {
    this.setState({ masterVolume: event.target.value / 100 });
  }

  userVolumeMouseDownHandler = (event, upOrDown) => {
    event.stopPropagation();
    const personIndex = this.state.POIs.findIndex(x => x.id === this.state.selectedPOI);

    const POI = {
      ...this.state.POIs[personIndex]
    }

    if (upOrDown === 'up') {
      if ((POI.volumeMultiplier + POI.volumeNormaliser) < 3) {
        POI.volumeMultiplier = POI.volumeMultiplier + .01;
      }
    }
    else if (upOrDown === 'down') {
      if ((POI.volumeMultiplier + POI.volumeNormaliser) - .01 > 0) {
        POI.volumeMultiplier = POI.volumeMultiplier - .01;
      }
    }

    const POIs = [...this.state.POIs];
    POIs[personIndex] = POI;

    this.setState({ POIs: POIs });

    holdUserVolumeButton = setTimeout(() => { this.userVolumeButtonHeldHandler(upOrDown, 200) }, 200);
  }

  userVolumeButtonHeldHandler = (upOrDown, delay) => {
    const personIndex = this.state.POIs.findIndex(x => x.id === this.state.selectedPOI);

    const POI = {
      ...this.state.POIs[personIndex]
    }

    if (upOrDown === 'up') {
      if ((POI.volumeMultiplier + POI.volumeNormaliser) < 3) {
        POI.volumeMultiplier = POI.volumeMultiplier + .01;
      }
    }
    else if (upOrDown === 'down') {
      if (POI.volumeMultiplier - .01 > 0) {
        POI.volumeMultiplier = POI.volumeMultiplier - .01;
      }
    }

    const POIs = [...this.state.POIs];
    POIs[personIndex] = POI;

    this.setState({ POIs: POIs });

    delay *= 0.9;

    holdUserVolumeButton = setTimeout(() => { this.userVolumeButtonHeldHandler(upOrDown, delay) }, delay);

  }

  userVolumeMouseUpOrOutHandler = (event) => {
    clearInterval(holdUserVolumeButton);
  }

  POIClickHandler = (event, selectedId) => {
    event.stopPropagation();
    this.setState({ selectedPOI: selectedId });
    console.log("POI clicked")
    this.setState({ backgroundHeld: false });
    this.setState({ POIHeld: null });
    clearTimeout(holdPOIOrBackground);
    holdPOIOrBackground = setTimeout(() => { this.POIHeldHandler(selectedId) }, 400);
  }

  POIDoubleClickHandler = (event, selectedId) => {
    const personIndex = this.state.POIs.findIndex(x => x.id === selectedId);

    const POI = {
      ...this.state.POIs[personIndex]
    }

    if (POI.soundStatus !== "lost") {
      if (POI.mute) {
        POI.mute = false;
      }
      else {
        POI.mute = true;
      }
    }

    const POIs = [...this.state.POIs];
    POIs[personIndex] = POI;

    this.setState({ POIs: POIs });

  }

  POIMouseUpHandler = (event) => {
    console.log('POI released');
    clearTimeout(holdPOIOrBackground);
    this.setState({ POIClicked: false });
  }

  POIHeldHandler(selectedId) {
    console.log('POI with id ' + selectedId + ' held');
    if (selectedId !== "background") {
      this.setState({ POIHeld: selectedId });
      this.setState({ copyParsedImage: this.state.parsedImage });
    }
  }

  backgroundMouseDownHandler = (event) => {
    console.log('background mouse down');
    this.setState({ backgroundHeld: false });
    this.setState({ POIHeld: null });
    clearTimeout(holdPOIOrBackground);
    holdPOIOrBackground = setTimeout(() => { this.backgroundHeldHandler() }, 400);
  }

  backgroundMouseUpHandler = (event) => {
    console.log('background released');
    clearTimeout(holdPOIOrBackground);
    // this.setState({POIClicked: false});
  }

  backgroundHeldHandler() {
    console.log('background held');
    this.setState({ backgroundHeld: true });
    this.setState({ copyParsedImage: this.state.parsedImage });
  }

  // onMouseOut can help with mouse leaving input area

  render() {
    var appStyle = {
      width: APP_WIDTH + "px",
      height: APP_HEIGHT + "px",
      //A non 1:1 pixel aspect ratio in display squishes image. Scale is used to counteract,
      //and transform moves the UI to the corners of window after scaling
      // transform: "scale(1, " + parseFloat(854 / APP_WIDTH) + ") translate(-8px, 7px)"
    }

    var addPerson = null;

    if (this.state.backgroundHeld === true) {
      addPerson =
        <NewPerson
          appWidth={APP_WIDTH}
          offsetTop={SPACING_UI * 2 + BUTTON_HEIGHT}
          offsetLeft={SPACING_UI}
          spacingY={SPACING_Y}
          spacingX={SPACING_X}
          widthHeight={WIDTH_HEIGHT}
          imageWidthHeight={IMAGE_WIDTH_HEIGHT}
          row={2}
          state={this.state}
        //A list of new people needs to be passed in
        />
    }
    else if (this.state.POIHeld !== null) {
      var POI = this.state.POIs.find(x => x.id === this.state.POIHeld);
      var row = (POI.position[1] % 2) + 1;
      addPerson =
        <NewPerson
          appWidth={APP_WIDTH}
          offsetTop={SPACING_UI * 2 + BUTTON_HEIGHT}
          offsetLeft={SPACING_UI}
          spacingY={SPACING_Y}
          spacingX={SPACING_X}
          widthHeight={WIDTH_HEIGHT}
          imageWidthHeight={IMAGE_WIDTH_HEIGHT}
          row={row}
          state={this.state}
        //A list of new people needs to be passed in
        />
    }

    return (
      <div style={appStyle} className={classes.App}>
        <Layout
          offsetTop={SPACING_UI}
          spacingUI={SPACING_UI}
          buttonHeight={BUTTON_HEIGHT}
          buttonSmallWidth={BUTTON_SMALL_WIDTH}
          buttonLargeWidth={BUTTON_LARGE_WIDTH}
          masterVolumeChangeHandler={this.masterVolumeChangeHandler}
          masterVolume={this.state.masterVolume}
          userVolume={this.state.POIs.find(x => x.id === this.state.selectedPOI).volumeMultiplier}
          userVolumeMouseDownHandler={this.userVolumeMouseDownHandler}
          userVolumeMouseUpOrOutHandler={this.userVolumeMouseUpOrOutHandler}
        />
        <People
          height={APP_HEIGHT - BUTTON_HEIGHT - (SPACING_UI * 2)}
          offsetTop={SPACING_UI * 2 + BUTTON_HEIGHT}
          offsetLeft={SPACING_UI}
          spacingY={SPACING_Y}
          spacingX={SPACING_X}
          widthHeight={WIDTH_HEIGHT}
          imageWidthHeight={IMAGE_WIDTH_HEIGHT}
          volumeWidth={VOLUME_WIDTH}
          state={this.state}
          onPOIClick={this.POIClickHandler}
          onPOIDoubleClick={this.POIDoubleClickHandler}
          onBackgroundMouseDown={this.backgroundMouseDownHandler}
          onBackgroundMouseUp={this.backgroundMouseUpHandler}
          onPOIMouseUp={this.POIMouseUpHandler}
          shouldRefresh={!(this.state.backgroundHeld || this.state.POIHeld)}
          POIHeld={this.state.POIHeld}
        />
        {addPerson}
      </div>
    );
  }
}

export default App;
