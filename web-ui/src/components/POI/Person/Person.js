import React from 'react';
import classes from './Person.module.css'
import Image from './Image/Image'
import Volume from './Volume/Volume'

//Where the face video/images will be displayed
//either when tracked, when adding new faces or when
//modifying a current tracked face

const person = (props) => {
    let personClass = [];
    personClass.push(classes.Person);

    //later add switch statement to determine how to display the faces
    //and set class accordingly

    personClass.push(classes.Overview);

    var posStyle = {
        left: props.pos_x + 'px',
        top: props.pos_y + 'px',
        height: props.widthHeight + 'px',
        width: props.widthHeight + 'px',
    }

    return (
        <div className={personClass.join(' ')} style={posStyle}>
            <Volume
                widthHeight={props.widthHeight}
                volume={props.normalizerVolume}
                volumeWidth={props.volumeWidth}
                voulumeSpacing={props.voulumeSpacing}
                type={"normalizer"}
            />
            <Volume
                widthHeight={props.widthHeight}
                volume={props.multiplierVolume}
                volumeWidth={props.volumeWidth}
                voulumeSpacing={props.voulumeSpacing}
                type={"multiplier"}
            />
            <Image
                posXY={(props.widthHeight - props.imgWidthHeight) / 2}
                widthHeight={props.imgWidthHeight}
            />
        </div>
    );
}

export default person;