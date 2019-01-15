import React, { Component } from 'react';
import Aux from '../../hoc/Aux/Aux';
import Person from '../../components/POI/Person/Person';

const OFFSET_TOP_Y = 280;
const OFFSET_LEFT_X = 50;
const SPACING_Y = 90;
const SPACING_X = 105;
const WIDTH_HEIGHT = 280;
const IMAGE_WIDTH_HEIGHT = 220;
const VOLUME_WIDTH = 25;
const VOLUME_SPACING = (WIDTH_HEIGHT - IMAGE_WIDTH_HEIGHT - VOLUME_WIDTH) / 2;

class People extends Component {
    render() {
        let pos = [[1, 1], [1, 2], [2, 1], [2, 2], [3, 1], [3, 2], [4, 1], [4, 2], [5, 1], [5, 2]]

        //volume variables will be passed in from app state
        //100 volume is a quarter of the circle
        let multiplierVolume = 105; //is equivalent to 1.05x multiplier
        let normalizerVolume = 10 + multiplierVolume; //in percentage

        let persons = pos.map(index => {
            console.log(index);
            let x = index[0];
            let y = index[1];

            let pos_x = SPACING_X * (x - 1) + WIDTH_HEIGHT * (x - 1) + OFFSET_LEFT_X;
            let pos_y = SPACING_Y * (y - 1) + WIDTH_HEIGHT * (y - 1) + OFFSET_TOP_Y;
            return (
                <Person
                    key={index}
                    pos_x={pos_x}
                    pos_y={pos_y}
                    widthHeight={WIDTH_HEIGHT}
                    imgWidthHeight={IMAGE_WIDTH_HEIGHT}
                    volumeSpacing={VOLUME_SPACING}
                    volumeWidth={VOLUME_WIDTH}
                    normalizerVolume={normalizerVolume}
                    multiplierVolume={multiplierVolume}
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
