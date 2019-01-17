import React, { Component } from 'react';
import Aux from '../../hoc/Aux/Aux';
import Person from '../../components/POI/Person/Person';

// const OFFSET_TOP_Y = 280;
// const OFFSET_LEFT_X = 50;
// const SPACING_Y = 90;
// const SPACING_X = 105;
// const WIDTH_HEIGHT = 280;
// const IMAGE_WIDTH_HEIGHT = 215;
// const VOLUME_WIDTH = 22;

const OFFSET_TOP_Y = 280;
const OFFSET_LEFT_X = 50;
const SPACING_Y = 90;
const SPACING_X = 80;
const WIDTH_HEIGHT = 300;
const IMAGE_WIDTH_HEIGHT = 215;
const VOLUME_WIDTH = 30;

// const OFFSET_TOP_Y = 320;
// const OFFSET_LEFT_X = 50;
// const SPACING_Y = 50;
// const SPACING_X = 100;
// const WIDTH_HEIGHT = 540;
// const IMAGE_WIDTH_HEIGHT = 400;
// const VOLUME_WIDTH = 50;

class People extends Component {
    render() {
        let pos = [[1, 1], [1, 2], [2, 1], [2, 2], [3, 1], [3, 2], [4, 1], [4, 2], [5, 1], [5, 2]]
        // let pos = [[1, 1], [1, 2], [2, 1], [2, 2], [3, 1], [3, 2], [4, 1], [4, 2]]
        // let pos = [[1, 1], [2, 1], [3, 1]]

        //volume variables will be passed in from app state
        //100 volume is a quarter of the circle
        let multiplierVolume = 100; //is equivalent to 1.05x multiplier
        let normalizerVolume = 10 + multiplierVolume; //in percentage

        let persons = pos.map(index => {
            console.log(index);
            let x = index[0];
            let y = index[1];

            let multiplierVolume = 90 + Math.random()*20; //is equivalent to 1.05x multiplier
            let normalizerVolume = Math.random()*30 + multiplierVolume; //in percentage

            let stateOdds = Math.random();

            let state = null

            if(stateOdds > .4){
                state = "normal"
            }
            else if(stateOdds > .2){
                state = "muted"
            }
            else if(stateOdds > .1){
                state = "poor"
            }
            else{
                state = "lost"
                normalizerVolume = 0;
            }

            let pos_x = SPACING_X * (x - 1) + WIDTH_HEIGHT * (x - 1) + OFFSET_LEFT_X;
            let pos_y = SPACING_Y * (y - 1) + WIDTH_HEIGHT * (y - 1) + OFFSET_TOP_Y;

            return (
                <Person
                    key={index}
                    pos_x={pos_x}
                    pos_y={pos_y}
                    widthHeight={WIDTH_HEIGHT}
                    imgWidthHeight={IMAGE_WIDTH_HEIGHT}
                    volumeWidth={VOLUME_WIDTH}
                    normalizerVolume={normalizerVolume}
                    multiplierVolume={multiplierVolume}
                    state={state}
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
