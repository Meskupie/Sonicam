import React, { Component } from 'react';
import Person from '../../components/POI/Person/Person';
import PersonSelector from '../../components/UI/Indicators/PersonSelector/PersonSelector';
import classes from './People.module.scss'
import Aux from '../../hoc/Aux/Aux';
import { getVideoFeed } from '../../hoc/GetVideoFeed/GetVideoFeed';

class People extends Component {
    constructor(props) {
        super(props);
        getVideoFeed((err, image) => {
            let parsedImage = JSON.parse(image);
            //This needs to change.  Setting state in constructor can lead to bad behaviour
            this.setState({ parsedImage });
        });
    }

    render() {
        let selectedPOI = this.props.state.POIs.find(x => x.id === this.props.state.selectedPOI);
        let selectPosX = null;
        let selectPosY = null;
        let selectedIndicator;
        let isSelected = null;
        let borderWidth = (this.props.widthHeight - this.props.imageWidthHeight - (this.props.volumeWidth * 2)) / 2 - 2;

        let personsContainerStyle = {
            top: this.props.offsetTop,
            height: this.props.height
        }

        let persons = this.props.state.POIs.map(POI => {
            let x = POI.position[0];
            let y = POI.position[1];
            let isBackground = null;
            selectedIndicator = null;
            isSelected = false;

            let multiplierVolume = POI.volumeMultiplier * this.props.state.masterVolume;
            let normalizerVolume = POI.volumeNormaliser + multiplierVolume;

            let posX = this.props.spacingX * (x - 1) + this.props.widthHeight * (x - 1) + this.props.offsetLeft;
            let posY = this.props.spacingY * (y - 1) + this.props.widthHeight * (y - 1);

            if(POI.id === "background"){
                isBackground = true;
            }

            //if (selectedPOI.position[0] === x && selectedPOI.position[1] === y && this.props.shouldRefresh === true) {
            if (selectedPOI.position[0] === x && selectedPOI.position[1] === y) {
                isSelected = true;
                selectPosX = posX;
                selectPosY = posY;
                selectedIndicator =
                    <PersonSelector
                        borderWidth={borderWidth}
                        widthHeight={this.props.imageWidthHeight}
                        posX={selectPosX + ((this.props.widthHeight - this.props.imageWidthHeight) / 2)}
                        posY={selectPosY + ((this.props.widthHeight - this.props.imageWidthHeight) / 2)}
                    />;
            }

            let image = " ";

            if (this.state != null) {
                image = "data:image/jpeg;charset=utf-8;base64," + this.state.parsedImage[POI.id];
            }

            return (
                <Aux key={POI.id}>
                    <Person
                        key={POI.id}
                        posX={posX}
                        posY={posY}
                        widthHeight={this.props.widthHeight}
                        imgWidthHeight={this.props.imageWidthHeight}
                        volumeWidth={this.props.volumeWidth}
                        normalizerVolume={normalizerVolume}
                        multiplierVolume={multiplierVolume}
                        volumeState={POI.soundStatus}
                        clicked={(event) => this.props.POIClickedHandler(event, POI.id)}
                        onMouseUp={(event) => this.props.onPOIMouseUp(event)}
                        imgSource={image}
                        borderWidth={borderWidth}
                        isBackground={isBackground}
                        name={POI.name}
                        isSelected={isSelected}
                        shouldRefresh={this.props.shouldRefresh}
                        isHeld={POI.id === this.props.POIHeld}
                    />
                    {selectedIndicator}
                </Aux>
            );
        });

        return (
            <div className={[classes.PeopleContainer, classes.Scrollable].join(' ')} style={personsContainerStyle} onMouseDown={this.props.onBackgroundMouseDown} onMouseUp={this.props.onBackgroundMouseUp}>
                {persons}
            </div>
        );
    }
}

export default People;
