import React, { Component } from 'react';
import Person from '../../components/POI/Person/Person';
import PersonSelector from '../../components/UI/Indicators/PersonSelector/PersonSelector';
import classes from './People.module.scss'
import Aux from '../../hoc/Aux/Aux';

class People extends Component {

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
            if(POI.position === null){
                return null;
            }
            
            let x = POI.position[0];
            let y = POI.position[1];
            let isBackground = null;
            selectedIndicator = null;
            isSelected = false;

            let multiplierVolume = POI.volumeMultiplier * this.props.state.masterVolume;
            let normalizerVolume = POI.volumeNormalizer + multiplierVolume;

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
                        isHidden={this.props.state.backgroundHeld}
                    />;
            }

            let image = " ";

            if (POI.id !== "background" && this.props.state.parsedImage !== undefined && this.props.state.parsedImage[POI.id] !== undefined && this.props.shouldRefresh) {
                image = "data:image/jpeg;charset=utf-8;base64," + this.props.state.parsedImage[POI.id].image;
            }
            else if(POI.id !== "background" && this.props.state.copyParsedImage !== null && this.props.state.copyParsedImage !== undefined && this.props.state.copyParsedImage[POI.id] !== undefined  && !this.props.shouldRefresh){
                image = "data:image/jpeg;charset=utf-8;base64," + this.props.state.copyParsedImage[POI.id].image;
            }
            // //This removes POI's if they do not have video feed.  This should not be perminant
            // else if(POI.id !== "background"){
            //     return null;
            // }

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
                        onClick={(event) => this.props.onPOIClick(event, POI.id)}
                        onMouseUp={(event) => this.props.onPOIMouseUp(event)}
                        onDoubleClick={(event) => this.props.onPOIDoubleClick(event, POI.id)}
                        imgSource={image}
                        borderWidth={borderWidth}
                        isBackground={isBackground}
                        name={POI.name}
                        isSelected={isSelected}
                        shouldRefresh={this.props.shouldRefresh}
                        isHeld={POI.id === this.props.POIHeld}
                        isMuted={POI.mute}
                    />
                    {selectedIndicator}
                </Aux>
            );
        });

        return (
            <div className={classes.PeopleContainer} style={personsContainerStyle} onMouseDown={this.props.onBackgroundMouseDown} onMouseUp={this.props.onBackgroundMouseUp}>
                {persons}
            </div>
        );
    }
}

export default People;
