import React, { Component } from 'react';
import Aux from '../../hoc/Aux/Aux';
import Person from '../../components/POI/Person/Person';

class People extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        let pos = [[1, 1], [1, 2], [2, 1], [2, 2], [3, 1], [3, 2], [4, 1], [4, 2], [5, 1], [5, 2]]
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
            let posY = this.props.spacingY * (y - 1) + this.props.widthHeight * (y - 1) + this.props.offsetTop;

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
            <Aux>
                {persons}
            </Aux>
        );
    }
}

export default People;
