import React, { Component } from 'react';
import classes from './App.module.scss';
import People from './containers/People/People';
import Layout from './containers/Layout/Layout';
import Settings from './containers/Settings/Settings';
import NewPerson from './containers/NewPerson/NewPerson';
import { getVideoFeed } from './hoc/GetVideoFeed/GetVideoFeed';

const APP_WIDTH = 800;
//Display issues (non 1:1 pixel aspect ratio) causes the app height 451 
//pixels with stetching instead of 480
const APP_HEIGHT = 451;
const ROWS = 2;
const COLUMNS = 4;
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
      displaySettings: false,
      POIs: [
        {
          id: "background",
          is_visible: null,
          is_known: null,
          importance: null,
          name: "Background",
          mute: false,
          volumeMultiplier: (.5 + Math.random() * .7).toFixed(2),
          volumeNormalizer: 0,
          position: [1, 1],
          soundStatus: "normal"
        },
        {
          id: 5,
          is_visible: null,
          is_known: null,
          importance: 2,
          name: "Name",
          mute: false,
          volumeMultiplier: (1).toFixed(2),
          volumeNormalizer: Math.random() * .3,
          position: [2, 2],
          soundStatus: "normal"
        },
        {
          id: 0,
          is_visible: null,
          is_known: null,
          importance: 4,
          name: "Name",
          mute: false,
          volumeMultiplier: (.5 + Math.random() * .7).toFixed(2),
          volumeNormalizer: Math.random() * .3,
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
          volumeMultiplier: (.5 + Math.random() * .7).toFixed(2),
          volumeNormalizer: Math.random() * .3,
          position: [3, 1],
          soundStatus: "normal"
        },
        {
          id: 2,
          is_visible: null,
          is_known: null,
          importance: 11,
          name: "Name",
          mute: false,
          volumeMultiplier: (.5 + Math.random() * .7).toFixed(2),
          volumeNormalizer: Math.random() * .3,
          position: [4, 1],
          soundStatus: "normal"
        },
        {
          id: 3,
          is_visible: null,
          is_known: null,
          importance: 6,
          name: "Name",
          mute: false,
          volumeMultiplier: (.5 + Math.random() * .7).toFixed(2),
          volumeNormalizer: Math.random() * .3,
          position: [1, 2],
          soundStatus: "normal"
        }],
      selectedSource: "camera",
      sources: [
        {
          id: "camera",
          name: "Camera",
        },
        {
          id: "0",
          name: "File: test1-fast-movement",
        },
        {
          id: "1",
          name: "File: test2-stationary",
        }
      ]
    };
  }

  componentDidMount() {
    getVideoFeed((err, image) => {
      let parsedImage = JSON.parse(image);
      this.setState({ parsedImage });
    });
  }

  masterVolumeChangeHandler = (event) => {
    this.setState({ masterVolume: event.target.value / 100 });

    for (var i = 0; i < this.state.POIs.length; i++) {
      if ((this.state.POIs[i].volumeMultiplier * this.state.masterVolume + this.state.POIs[i].volumeNormalizer) > 3) {
        const POI = {
          ...this.state.POIs[i]
        }

        POI.volumeMultiplier = ((3 - this.state.POIs[i].volumeNormalizer) / this.state.masterVolume);
        POI.volumeMultiplier = POI.volumeMultiplier.toFixed(2);

        const POIs = [...this.state.POIs];

        POIs[i] = POI;
        this.setState({ POIs: POIs });
      }
    }
  }

  userVolumeMouseDownHandler = (event, upOrDown) => {
    event.stopPropagation();
    const personIndex = this.state.POIs.findIndex(x => x.id === this.state.selectedPOI);

    const POI = {
      ...this.state.POIs[personIndex]
    }

    if (upOrDown === 'up') {
      if ((POI.volumeMultiplier * this.state.masterVolume + POI.volumeNormalizer) < 3) {
        POI.volumeMultiplier = (parseFloat(POI.volumeMultiplier) + .01).toFixed(2);
      }
    }
    else if (upOrDown === 'down') {
      if (POI.volumeMultiplier - .01 > 0) {
        POI.volumeMultiplier = (parseFloat(POI.volumeMultiplier) - .01).toFixed(2);
      }
    }

    const POIs = [...this.state.POIs];
    POIs[personIndex] = POI;

    this.setState({ POIs: POIs });

    holdUserVolumeButton = setTimeout(() => { this.userVolumeButtonHeldHandler(upOrDown, 300) }, 300);
  }

  //The user volume should saturate when the master volume is changed.  Once reached saturation, the user volume should adjust such that the user
  //volume is saturated.  Then when the master volume is decreased it will go down immediately.
  userVolumeButtonHeldHandler = (upOrDown, delay) => {
    const personIndex = this.state.POIs.findIndex(x => x.id === this.state.selectedPOI);

    const POI = {
      ...this.state.POIs[personIndex]
    }

    if (upOrDown === 'up') {
      if ((POI.volumeMultiplier * this.state.masterVolume + POI.volumeNormalizer) + .02 <= 3) {
        POI.volumeMultiplier = (parseFloat(POI.volumeMultiplier) + .02).toFixed(2);
      }
    }
    else if (upOrDown === 'down') {
      if (POI.volumeMultiplier - .02 > 0) {
        POI.volumeMultiplier = (parseFloat(POI.volumeMultiplier) - .02).toFixed(2);
      }
    }

    const POIs = [...this.state.POIs];
    POIs[personIndex] = POI;

    this.setState({ POIs: POIs });

    if (delay >= 50) {
      delay *= 0.90;
    }

    holdUserVolumeButton = setTimeout(() => { this.userVolumeButtonHeldHandler(upOrDown, delay) }, delay);

  }

  userVolumeMouseUpOrOutHandler = (event) => {
    clearInterval(holdUserVolumeButton);
  }

  settingsButtonClickedHandler = (event) => {
    let tempDisplaySettings = !this.state.displaySettings;
    this.setState({ displaySettings: tempDisplaySettings });
  }

  sourceClickedHandler = (selectedId) => {
    console.log("source clicked");
    this.setState({ selectedSource: selectedId });
  }

  newPOIClickedHander = (event, selectedId) => {
    console.log("selected POI: " + selectedId);
  }

  POIMouseDownHandler = (event, selectedId) => {
    event.stopPropagation();
    this.setState({ selectedPOI: selectedId });

    //delete POI handler
    if (this.state.POIHeld === selectedId) {
      const POIs = [...this.state.POIs];

      POIs.sort(function (a, b) {
        return a.position[0] * Math.pow(a.position[1], 3) - b.position[0] * Math.pow(b.position[1], 3)
      });

      const personIndex = POIs.findIndex(x => x.id === selectedId);

      const POI = {
        ...POIs[personIndex]
      }

      POIs.splice(personIndex, 1)

      for (let i = personIndex; i < POIs.length; i++) {
        POIs[i].position[0] = POIs[i].position[0] - 1;
        if (POIs[i].position[0] === 0) {
          if (POIs[i].position[1] == 1) {

          }
          else {
            POIs[i].position[1] = POIs[i].position[1] - 1;
            POIs[i].position[0] = 4;
          }
        }
      }

      this.setState({selectedPOI: "background"})
      //If position exists then move up all the POIs after the one deleted
      //   if (POIs[i].position !== null && (POI.position[0] * Math.pow(POI.position[1], 2)) < (POIs[i].position[0] * Math.pow(POIs[i].position[1], 2))) {
      //     console.log(POI.position + " < " + POIs[i].position + " : " + (POI.position[0] * (POI.position[1] ^ 2)) + " < " + (POIs[i].position[0] * (POIs[i].position[1] ^ 2)));
      //     POIs[i].position[0] = POIs[i].position[0] - 1;
      //     if (POIs[i].position[0] === 0) {
      //       if (POIs[i].position[1] == 1) {

      //       }
      //       else {
      //         POIs[i].position[1] = POIs[i].position[1] - 1;
      //         POIs[i].position[0] = 4;
      //       }
      //     }
      //     if(POI.position[0] === POIs[i].position[0] && POI.position[1] === POIs[i].position[1]){
      //       this.setState({ selectedPOI: POIs[i].id });
      //     }
      //   }
      // }

      this.setState({ POIs: POIs });

      if (this.state.selectedPOI === POI.id) {
        // this.state.selectedPOI
      }

    }



    this.setState({ backgroundHeld: false });
    this.setState({ POIHeld: null });
    this.setState({ displaySettings: false });
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

  POIMouseOutHandler = (event) => {
    console.log("POI mouse out");
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
    this.setState({ displaySettings: false });
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
    var settings = null;

    if (this.state.displaySettings) {
      settings =
        <Settings
          offsetUI={SPACING_UI}
          offsetTop={SPACING_UI * 2 + BUTTON_HEIGHT}
          width={APP_WIDTH - SPACING_UI - (SPACING_UI + WIDTH_HEIGHT * 3 + SPACING_X * 2.5)}
          selectedSource={this.state.selectedSource}
          sources={this.state.sources}
          sourceClickedHandler={this.sourceClickedHandler}
        />
    }

    if (this.state.backgroundHeld) {
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
          newPOIClickedHander={this.newPOIClickedHander}
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
          newPOIClickedHander={this.newPOIClickedHander}
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
          POIs={this.state.POIs}
          selectedPOI={this.state.selectedPOI}
          userVolumeMouseDownHandler={this.userVolumeMouseDownHandler}
          userVolumeMouseUpOrOutHandler={this.userVolumeMouseUpOrOutHandler}
          settingsButtonClickedHandler={this.settingsButtonClickedHandler}
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
          onPOIClick={this.POIMouseDownHandler}
          onPOIMouseOut={this.POIMouseOutHandler}
          onPOIDoubleClick={this.POIDoubleClickHandler}
          onBackgroundMouseDown={this.backgroundMouseDownHandler}
          onBackgroundMouseUp={this.backgroundMouseUpHandler}
          onPOIMouseUp={this.POIMouseUpHandler}
          shouldRefresh={!(this.state.backgroundHeld || this.state.POIHeld !== null)}
          POIHeld={this.state.POIHeld}
        />
        {addPerson}
        {settings}
      </div>
    );
  }
}

export default App;
