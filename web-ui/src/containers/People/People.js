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
            this.setState({ parsedImage });
        });
    }

    render() {
        let selected = this.props.state.POIs.find(x => x.id === this.props.state.selectedPOI);
        let selectPosX = null;
        let selectPosY = null;
        let borderWidth = (this.props.widthHeight - this.props.imageWidthHeight - this.props.volumeWidth * 2 -.5) / 2;
        let selectedIndicator = null;

        let personsContainerStyle = {
            top: this.props.offsetTop - borderWidth*2,
            height: this.props.widthHeight + this.props.widthHeight + borderWidth * 2 + this.props.spacingY + borderWidth * 2
        }

        let persons = this.props.state.POIs.map(POI => {
            let x = POI.position[0];
            let y = POI.position[1];
            selectedIndicator = null;

            let multiplierVolume = POI.volumeMultiplier * this.props.state.masterVolume;
            let normalizerVolume = POI.volumeNormaliser + multiplierVolume;

            let posX = this.props.spacingX * (x - 1) + this.props.widthHeight * (x - 1) + this.props.offsetLeft;
            let posY = this.props.spacingY * (y - 1) + this.props.widthHeight * (y - 1) + borderWidth * 2;

            if (selected.position[0] === x && selected.position[1] === y && this.props.shouldRefresh === true) {
                selectPosX = posX;
                selectPosY = posY;
                selectedIndicator =
                    <PersonSelector
                        borderWidth={borderWidth}
                        widthHeight={this.props.widthHeight + borderWidth * 2}
                        posX={selectPosX - borderWidth * 2}
                        posY={selectPosY - borderWidth * 2}
                    />;
            }

            let image = " ";


            if(this.props.shouldRefresh) {

            }

            if (this.state != null && this.props.shouldRefresh) {
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
