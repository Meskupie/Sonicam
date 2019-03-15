import React, { Component } from 'react';
import classes from './App.module.scss';
import People from './containers/People/People';
import Layout from './containers/Layout/Layout';
import Settings from './containers/Settings/Settings';
import NewPerson from './containers/NewPerson/NewPerson';
import VideoFeed from './containers/VideoFeed/VideoFeed';
import { getPOIFeed, getVideoFeedState, getVideoFeed } from './Functions/GetVideoFeed/GetVideoFeed';
//import { getVideoFeedState } from './Functions/GetVideoFeed/GetVideoFeedState';

const APP_WIDTH = 800;
//Display issues (non 1:1 pixel aspect ratio) causes the app height 451 
//pixels with stetching instead of 480
var APP_HEIGHT = 451
var APP_HEIGHT_STYLE = APP_HEIGHT;
// const ROWS = 2;
// const COLUMNS = 4;
const WIDTH_HEIGHT = 150;
const IMAGE_WIDTH_HEIGHT = 115;
const VOLUME_WIDTH = 12;
const SPACING_UI = 16;
//For video feed with resolution: 768x432
const VIDEO_FEED_HEIGHT = 432;
const VIDEO_FEED_WIDTH = 768;
const VIDEO_FEED_OFFSET = VIDEO_FEED_HEIGHT + SPACING_UI * 2;
const BUTTON_HEIGHT = 70;
const BUTTON_SMALL_WIDTH = 70;
const BUTTON_LARGE_WIDTH = 215;
const SPACING_Y = 25;
const SPACING_X = (APP_WIDTH - SPACING_UI * 2 - WIDTH_HEIGHT * 4) / 3;
var ON_JETSON = false;
var holdPOIOrBackground;
var holdUserVolumeButton;
var displayNoNewPersonTimeout;
var toggleEqualizerButton = true;
// var sendPOSTVolume = true;
const initialState = {
  selectedPOI: -1,
  masterVolume: 1,
  refreshNewPersonList: false,
  backgroundClicked: false,
  backgroundHeld: false,
  POIClicked: false,
  POIHeld: null,
  displaySettings: false,
  selectedSource: null,
  parsedPOIs: undefined,
  videoState: "null",
  videoFeed: null,
  displayNoNewPerson: false,
  POIs: [
    {
      id: -1,
      height: null,
      is_visible: null,
      is_known: null,
      importance: null,
      name: "Background",
      soundStatus: "normal",
      mute: false,
      volumeMultiplier: (2.25).toFixed(2),
      volumeNormalizer: 0,
      position: [1, 1],
    }],
};


var isEqual = function (value, other) {

  // Get the value type
  var type = Object.prototype.toString.call(value);

  // If the two objects are not the same type, return false
  if (type !== Object.prototype.toString.call(other)) return false;

  // If items are not an object or array, return false
  if (['[object Array]', '[object Object]'].indexOf(type) < 0) return false;

  // Compare the length of the length of the two items
  var valueLen = type === '[object Array]' ? value.length : Object.keys(value).length;
  var otherLen = type === '[object Array]' ? other.length : Object.keys(other).length;
  if (valueLen !== otherLen) return false;

  // Compare two items
  var compare = function (item1, item2) {

    // Get the object type
    var itemType = Object.prototype.toString.call(item1);

    // If an object or array, compare recursively
    if (['[object Array]', '[object Object]'].indexOf(itemType) >= 0) {
      if (!isEqual(item1, item2)) return false;
    }

    // Otherwise, do a simple comparison
    else {

      // If the two items are not the same type, return false
      if (itemType !== Object.prototype.toString.call(item2)) return false;

      // Else if it's a function, convert to a string and compare
      // Otherwise, just compare
      if (itemType === '[object Function]') {
        if (item1.toString() !== item2.toString()) return false;
      } else {
        if (item1 !== item2) return false;
      }

    }
  };

  // Compare properties
  if (type === '[object Array]') {
    for (var i = 0; i < valueLen; i++) {
      if (compare(value[i], other[i]) === false) return false;
    }
  } else {
    for (var key in value) {
      if (value.hasOwnProperty(key)) {
        if (compare(value[key], other[key]) === false) return false;
      }
    }
  }

  // If nothing failed, return true
  return true;

};

class App extends Component {
  constructor(props) {
    super(props);
    this.state = initialState;
  }

  componentDidMount() {
    this.httpGetSources();

    getVideoFeedState((err, videoState) => {
      console.log(videoState);
      this.setState({ videoState: videoState });
      if (this.state.videoState === "eof") {
        this.reset();
        this.setState({ displaySettings: true });
      }
    });
    getPOIFeed((err, feeds) => {
      let parsedPOIs = JSON.parse(feeds);
      this.setState({ parsedPOIs });
    });
    getVideoFeed((err, videoFeed) => {
      this.setState({ videoFeed: videoFeed });
    });

    if (window.screen.width < 900) {
      ON_JETSON = true;
    }
  }

  masterVolumeChangeHandler = (event) => {
    this.setState({ masterVolume: event.target.value / 100 });
    const POIs = [...this.state.POIs];

    for (var i = 0; i < this.state.POIs.length; i++) {
      if ((this.state.POIs[i].volumeMultiplier * this.state.masterVolume + this.state.POIs[i].volumeNormalizer) > 3) {
        const POI = {
          ...this.state.POIs[i]
        }

        POI.volumeMultiplier = ((3 - this.state.POIs[i].volumeNormalizer) / this.state.masterVolume);
        POI.volumeMultiplier = POI.volumeMultiplier.toFixed(2);

        POIs[i] = POI;

        this.setState({ POIs: POIs });
      }
    }

    //Sending the event.target.value in the POST becuase of the asynchronous nature of setState.
    //If the master volume is pulled from the state in the POST request then it will be outdated.
    //This way, the master volume is pulled from the event on it's change such that the POST
    //request gets the most recent value.
    this.httpPost(this.httpPostPreparePOIs(POIs, event.target.value / 100), '/api/pois/');
  }

  userVolumeMouseDownHandler = (event, upOrDown) => {
    event.stopPropagation();
    const personIndex = this.state.POIs.findIndex(x => x.id === this.state.selectedPOI);

    const POI = {
      ...this.state.POIs[personIndex]
    }

    if (upOrDown === 'up') {
      if ((POI.volumeMultiplier * this.state.masterVolume + POI.volumeNormalizer + 0.03) < 3) {
        POI.volumeMultiplier = (parseFloat(POI.volumeMultiplier) + .03).toFixed(2);
      }
    }
    else if (upOrDown === 'down') {
      if (POI.volumeMultiplier - .03 > 0) {
        POI.volumeMultiplier = (parseFloat(POI.volumeMultiplier) - .03).toFixed(2);
      }
    }

    const POIs = [...this.state.POIs];
    POIs[personIndex] = POI;

    this.httpPost(this.httpPostPreparePOIs(POIs), '/api/pois/');

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
      if ((POI.volumeMultiplier * this.state.masterVolume + POI.volumeNormalizer) + .03 <= 3) {
        POI.volumeMultiplier = (parseFloat(POI.volumeMultiplier) + .03).toFixed(2);
      }
    }
    else if (upOrDown === 'down') {
      if (POI.volumeMultiplier - .03 > 0) {
        POI.volumeMultiplier = (parseFloat(POI.volumeMultiplier) - .03).toFixed(2);
      }
    }

    const POIs = [...this.state.POIs];
    POIs[personIndex] = POI;

    this.httpPost(this.httpPostPreparePOIs(POIs), '/api/pois/');

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

  sourceClickedHandler = (selected) => {
    console.log("source clicked");
    this.reset();
    this.httpPost(selected, '/api/files/');
    this.httpPostPOIsAndGet(this.state.POIs);
    this.setState({ selectedSource: selected });
    this.setState({ displaySettings: true });
  }

  clickedShowSceneStatusHandler = () => {
    let showSceneStatusTemp = !this.state.showSceneStatus
    if (showSceneStatusTemp) {
      APP_HEIGHT_STYLE = APP_HEIGHT_STYLE + VIDEO_FEED_OFFSET;
      let postData={
        chin: true
      }
      this.httpPost(postData, '/api/uisettings/')
    }
    else {
      APP_HEIGHT_STYLE = APP_HEIGHT_STYLE - VIDEO_FEED_OFFSET;
      let postData={
        chin: false
      }
      this.httpPost(postData, '/api/uisettings/')
    }
    this.setState({ showSceneStatus: showSceneStatusTemp });
  }

  setSoundStatus = (status, id) => {
    const personIndex = this.state.POIs.findIndex(x => x.id === id);

    const POIs = [...this.state.POIs];

    if (POIs[personIndex].soundStatus !== status) {
      POIs[personIndex].soundStatus = status;
      this.setState({ POIs: POIs });
    }

  }

  toggleDisplayNoNewPerson = (state) => {
    displayNoNewPersonTimeout = setTimeout(() => {
      this.setState({ backgroundHeld: false });
      this.setState({ POIHeld: null });
      this.setState({ displaySettings: false });
    }, 300);
  }

  equalizerButtonClickedHandler = (event) => {
    if (toggleEqualizerButton) {
      var el = document.getElementById("root");
      el.requestFullscreen();
    }
    else {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
    }

    toggleEqualizerButton = !toggleEqualizerButton;
  }

  newPOIClickedHander = (event, selectedPOI) => {
    const POIs = [...this.state.POIs];

    POIs.sort(function (a, b) {
      return a.position[0] * Math.pow(a.position[1], 3) - b.position[0] * Math.pow(b.position[1], 3)
    });


    for (let i = 0; i < POIs.length; i++) {
      if (POIs[i].id === selectedPOI.id) {
        return null;
      }
    }

    //if POI is being edited (POI was held)
    if (this.state.POIHeld !== null) {
      const POIHeldIndex = this.state.POIs.findIndex(x => x.id === this.state.POIHeld);
      POIs[POIHeldIndex].id = selectedPOI.id;
      POIs[POIHeldIndex].soundStatus = selectedPOI.state;
      this.setState({ POIHeld: null });
      this.setState({ selectedPOI: POIHeldIndex });
    }
    //If new POI is being added
    else {
      const lastPOI = POIs[POIs.length - 1];

      let posX = lastPOI.position[0];
      let posY = lastPOI.position[1];

      posX++;

      if (posX > 4) {
        posX = 1;
        posY++;
      }

      selectedPOI.position = [];
      selectedPOI.position[0] = posX;
      selectedPOI.position[1] = posY;
      selectedPOI.volumeMultiplier = (2.25).toFixed(2);
      selectedPOI.volumeNormalizer = 0;
      selectedPOI.soundStatus = "normal"
      selectedPOI.mute = false;
      selectedPOI.name = ""


      POIs.push(selectedPOI);
    }

    this.httpPostPOIsAndGet(POIs);

    this.setState({ POIs: POIs });

    const refreshNewPersonListTemp = !this.state.refreshNewPersonList;
    this.setState({ refreshNewPersonList: refreshNewPersonListTemp });
  }

  POIMouseDownHandler = (event, selectedId) => {
    event.stopPropagation();
    this.setState({ selectedPOI: selectedId });
    const POIs = [...this.state.POIs];

    //delete POI handler
    if (this.state.POIHeld === selectedId) {

      POIs.sort(function (a, b) {
        return a.position[0] * Math.pow(a.position[1], 3) - b.position[0] * Math.pow(b.position[1], 3)
      });

      const personIndex = POIs.findIndex(x => x.id === selectedId);

      POIs.splice(personIndex, 1)

      for (let i = personIndex; i < POIs.length; i++) {
        POIs[i].position[0] = POIs[i].position[0] - 1;
        if (POIs[i].position[0] === 0) {
          if (POIs[i].position[1] === 1) {

          }
          else {
            POIs[i].position[1] = POIs[i].position[1] - 1;
            POIs[i].position[0] = 4;
          }
        }
      }

      this.setState({ selectedPOI: -1 });
      this.setState({ POIs: POIs });
    }

    this.setState({ backgroundHeld: false });
    this.setState({ POIHeld: null });
    this.setState({ displaySettings: false });
    clearTimeout(holdPOIOrBackground);

    this.httpPost(this.httpPostPreparePOIs(POIs), '/api/pois/');

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

    this.httpPostPOIsAndGet(POIs);

    this.setState({ POIs: POIs });
  }

  POIMouseUpHandler = (event) => {
    // console.log('POI released');
    clearTimeout(holdPOIOrBackground);
    this.setState({ POIClicked: false });
  }

  POIMouseOutHandler = (event) => {
    // console.log("POI mouse out");
    clearTimeout(holdPOIOrBackground);
    this.setState({ POIClicked: false });
  }

  POIHeldHandler(selectedId) {
    // console.log('POI with id ' + selectedId + ' held');
    if (selectedId !== -1) {
      this.setState({ POIHeld: selectedId });
    }
  }

  backgroundMouseDownHandler = (event) => {
    // console.log('background mouse down');
    this.setState({ backgroundHeld: false });
    this.setState({ POIHeld: null });
    this.setState({ displaySettings: false });
    clearTimeout(holdPOIOrBackground);

    this.httpPost(this.httpPostPreparePOIs(this.state.POIs), '/api/pois/');

    holdPOIOrBackground = setTimeout(() => { this.backgroundHeldHandler() }, 400);
  }

  backgroundMouseUpHandler = (event) => {
    // console.log('background released');
    clearTimeout(holdPOIOrBackground);
    // this.setState({POIClicked: false});
  }

  backgroundHeldHandler() {
    // console.log('background held');
    this.setState({ backgroundHeld: true });
  }

  reset() {
    this.setState(initialState);
  }

  httpPost = (data, url) => {
    // console.log("Posting data to backend...");
    // console.log(postPOIs);
    fetch('http://localhost:8080/http://localhost:5000' + url, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }).then(function (response) {
      if (response.status !== 200) {
        console.log('Looks like there was a problem. Status Code: ' +
          response.status);
        return;
      }
      // console.log(response);
      return response.json().then((data) => {
        // console.log("response data: " + data);
        // console.log(data);
      });
    }).then((data) => {
      // sendPOSTVolume = true;
    })
      .catch(function (err) {
        console.log('Fetch Error :-S', err);
      });;
  }

  httpGetSources = () => {
    fetch('http://localhost:8080/http://localhost:5000/api/files/', {
      method: "GET",
    })
      .then(
        (response) => {
          console.log(response);
          if (response.status !== 200) {
            console.log('Looks like there was a problem. Status Code: ' +
              response.status);
            return;
          }

          // Examine the text in the response
          response.json().then((data) => {
            this.setState({ sources: data });

          });
        }
      )
      .catch(function (err) {
        console.log('Fetch Error :-S', err);
      });
    // console.log("getting");
  }

  httpPostPOIsAndGet = (POIs) => {
    let postPOIs = this.httpPostPreparePOIs(POIs);

    // console.log("Posting data to backend...");
    // console.log(postPOIs);
    fetch('http://localhost:8080/http://localhost:5000/api/pois/', {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(postPOIs),
    }).then(function (response) {
      // console.log(response);
    }).then((data) => {
      fetch('http://localhost:8080/http://localhost:5000/api/poisverbose/', {
        method: "GET",
      })
        .then(
          (response) => {
            if (response.status !== 200) {
              console.log('Looks like there was a problem. Status Code: ' +
                response.status);
              return;
            }

            // console.log("setting state")
            // this.setState({ newPOIs: data });

            // Examine the text in the response
            response.json().then((data) => {

            });
          }
        )
        .catch(function (err) {
          console.log('Fetch Error :-S', err);
        });
      // console.log("getting");
    });
  }

  httpPostPreparePOIs = (POIs, masterVolume) => {
    let postPOIs = POIs.map(POI => {
      if (masterVolume === undefined) {
        return (
          {
            id: POI.id,
            mute: POI.mute,
            volume: (POI.volumeMultiplier * this.state.masterVolume) / 3
          }
        )
      }
      else {
        return (
          {
            id: POI.id,
            mute: POI.mute,
            volume: (POI.volumeMultiplier * masterVolume) / 3
          }
        )
      }
    });


    return postPOIs;
  }

  render() {
    var appStyle = {
      width: APP_WIDTH + "px",
      height: APP_HEIGHT_STYLE + "px",
      //A non 1:1 pixel aspect ratio in display squishes image. Scale is used to counteract,
      //and transform moves the UI to the corners of window after scaling
      // transform: "scale(1, " + parseFloat(854 / APP_WIDTH) + ") translate(-8px, 7px)"
    }

    if (ON_JETSON) {
      appStyle = {
        width: APP_WIDTH + "px",
        height: APP_HEIGHT_STYLE + "px",
        //A non 1:1 pixel aspect ratio in display squishes image. Scale is used to counteract,
        //and transform moves the UI to the corners of window after scaling
        transform: "scale(1, " + parseFloat(854 / APP_WIDTH) + ") translate(-8px, 7px)"
      }
    }

    var addPerson = null;
    var settings = null;
    var videoFeed = null;

    if (this.state.showSceneStatus) {
      videoFeed =
        <VideoFeed
          offsetTop={APP_HEIGHT + SPACING_UI}
          offsetLeft={SPACING_UI}
          height={VIDEO_FEED_HEIGHT}
          width={VIDEO_FEED_WIDTH}
          image={this.state.videoFeed}
        />
    }
    if (this.state.displaySettings) {
      settings =
        <Settings
          offsetUI={SPACING_UI}
          offsetTop={SPACING_UI * 2 + BUTTON_HEIGHT}
          width={APP_WIDTH - SPACING_UI - (SPACING_UI + WIDTH_HEIGHT * 3 + SPACING_X * 2.5)}
          selectedSource={this.state.selectedSource}
          sources={this.state.sources}
          sourceClickedHandler={this.sourceClickedHandler}
          videoState={this.state.videoState}
          clickedShowSceneStatus={this.clickedShowSceneStatusHandler}
          showSceneStatus={this.state.showSceneStatus}
          noNewPerson={this.toggleDisplayNoNewPerson}
        />
    }

    if (this.state.backgroundHeld) {
      addPerson =
        <NewPerson
          key={this.state.refreshNewPersonList}
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
          noNewPerson={this.toggleDisplayNoNewPerson}
        />
    }
    else if (this.state.POIHeld !== null) {
      // console.log(this.state.POIs);
      var POI = this.state.POIs.find(x => x.id === this.state.POIHeld);
      var row = (POI.position[1] % 2) + 1;
      addPerson =
        <NewPerson
          key={this.state.refreshNewPersonList}
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
          noNewPerson={this.toggleDisplayNoNewPerson}
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
          equalizerButtonClickedHandler={this.equalizerButtonClickedHandler}
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
          setSoundStatus={this.setSoundStatus}
          noNewPerson={this.toggleDisplayNoNewPerson}
        />
        {addPerson}
        {settings}
        {videoFeed}
      </div>
    );
  }
}

export default App;
