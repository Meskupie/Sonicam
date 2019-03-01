import React from 'react';
import classes from './Image.module.css'

//Where the face video/images will be displayed
//either when tracked, when adding new faces or when
//modifying a current tracked face

const person = (props) => {
    let imageClass = [classes.Image];

    //later add switch statement to determine how to display the image
    //and set class accordingly

    var posStyle = {
        left: props.posXY + 'px',
        top: props.posXY + 'px',
        width: props.widthHeight + 'px',
        height: props.widthHeight + 'px',
    }

    return (
        <img alt="POI Video Feed" src={props.imgSource} className={imageClass.join(' ')} onMouseDown={props.clicked} onMouseUp = {props.onMouseUp} style={posStyle}/>
    );
}

export default person;