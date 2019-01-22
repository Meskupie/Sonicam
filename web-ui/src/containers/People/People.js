import React, { Component } from 'react';
import Person from '../../components/POI/Person/Person';
import PersonSelector from '../../components/UI/Indicators/PersonSelector/PersonSelector';
import classes from './People.module.scss'

class People extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        let pos = [[1, 1], [1, 2], [2, 1], [2, 2], [3, 1], [3, 2], [4, 1], [4, 2], [5, 1], [5, 2], [6, 1]];
        let selected = [1, 2];
        let selectPosX = null;
        let selectPosY = null;
        let borderWidth = (this.props.widthHeight - this.props.imageWidthHeight - this.props.volumeWidth * 2 - 3) / 2

        let personsContainerStyle = {
            top: this.props.offsetTop,
            height: this.props.widthHeight + this.props.widthHeight + borderWidth * 2 + this.props.spacingY
        }

        // let pos = [[1, 1], [1, 2], [2, 1], [2, 2], [3, 1], [3, 2], [4, 1], [4, 2]]
        // let pos = [[1, 1], [2, 1], [3, 1]]

        //volume variables will be passed in from app state
        //100 volume is a quarter of the circle
        // let multiplierVolume = 100; //is equivalent to 1.05x multiplier
        // let normalizerVolume = 10 + multiplierVolume; //in percentage

        let persons = pos.map(index => {
            console.log(index);
            let x = index[0];
            let y = index[1];

            let multiplierVolume = 60 + Math.random() * 90; //is equivalent to 1.05x multiplier
            let normalizerVolume = Math.random() * 30 + multiplierVolume; //in percentage

            let stateOdds = Math.random();

            let volumeState = null

            if (stateOdds > .4) {
                volumeState = "normal"
            }
            else if (stateOdds > .2) {
                volumeState = "muted"
            }
            else if (stateOdds > .1) {
                volumeState = "poor"
            }
            else {
                volumeState = "lost"
                normalizerVolume = 0;
            }

            let posX = this.props.spacingX * (x - 1) + this.props.widthHeight * (x - 1) + this.props.offsetLeft;
            let posY = this.props.spacingY * (y - 1) + this.props.widthHeight * (y - 1);

            if (selected[0] === index[0] && selected[1] === index[1]) {
                selectPosX = posX;
                selectPosY = posY;
            }

            return (
                <Person
                    key={index}
                    posX={posX}
                    posY={posY}
                    widthHeight={this.props.widthHeight}
                    imgWidthHeight={this.props.imageWidthHeight}
                    volumeWidth={this.props.volumeWidth}
                    normalizerVolume={normalizerVolume}
                    multiplierVolume={multiplierVolume}
                    volumeState={volumeState}
                />
            );
        });

        return (
            <div className={[classes.PeopleContainer, classes.Scrollable].join(' ')} style={personsContainerStyle}>
                {persons}
                <PersonSelector
                    borderWidth={borderWidth}
                    widthHeight={this.props.widthHeight + borderWidth * 2}
                    posX={selectPosX - borderWidth * 2}
                    posY={selectPosY - borderWidth * 2}

                />
            </div>
        );
    }
}

export default People;
