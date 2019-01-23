import React, { Component } from 'react';
import Person from '../../components/POI/Person/Person';
import PersonSelector from '../../components/UI/Indicators/PersonSelector/PersonSelector';
import classes from './People.module.scss'
import Aux from '../../hoc/Aux/Aux';

class People extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        let selected = this.props.state.POIs.find(x => x.id === this.props.state.selectedPOI);
        let selectPosX = null;
        let selectPosY = null;
        let borderWidth = (this.props.widthHeight - this.props.imageWidthHeight - this.props.volumeWidth * 2 - 3) / 2

        let personsContainerStyle = {
            top: this.props.offsetTop,
            height: this.props.widthHeight + this.props.widthHeight + borderWidth * 2 + this.props.spacingY
        }

        let persons = this.props.state.POIs.map(POI => {
            let x = POI.position[0];
            let y = POI.position[1];

            console.log(this.props);

            let multiplierVolume = POI.volumeMultiplier * this.props.state.masterVolume;
            let normalizerVolume = POI.volumeNormaliser + multiplierVolume;

            let posX = this.props.spacingX * (x - 1) + this.props.widthHeight * (x - 1) + this.props.offsetLeft;
            let posY = this.props.spacingY * (y - 1) + this.props.widthHeight * (y - 1);

            if (selected.position[0] === x && selected.position[1] === y) {
                selectPosX = posX;
                selectPosY = posY;
            }

            return (
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
                    clicked={(event) => this.props.POIClickedHandler(POI.id)}
                />
            );
        });

        return (
            <Aux>
                <div className={[classes.PeopleContainer, classes.Scrollable].join(' ')} style={personsContainerStyle}>
                    {persons}
                </div>
                <PersonSelector
                    borderWidth={borderWidth}
                    widthHeight={this.props.widthHeight + borderWidth * 2}
                    posX={selectPosX - borderWidth * 2}
                    posY={selectPosY - borderWidth * 2 + this.props.offsetTop}

                />
            </Aux>
        );
    }
}

export default People;
