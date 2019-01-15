import React from 'react';
import classes from './VolumeNormalizer.module.css';
import Aux from '../../../../../hoc/Aux/Aux';

//Where the face video/images will be displayed
//either when tracked, when adding new faces or when
//modifying a current tracked face

const volumeNormalizer = (props) => {
    var circleStyle = {
        strokeWidth: props.volumeWidth/(props.widthHeight/36),
        stroke: "#00A170"
    }

    var viewBoxStyle = {
        width: props.widthHeight,
        height: props.widthHeight,
    }

    //Need if volume 0 then don't return

    return (
        <Aux>
            <svg viewBox="0 0 36 36" className={classes.CircularChart} style={viewBoxStyle}>
                <path className={classes.Circle} style={circleStyle}
                    strokeDasharray={props.volume/4 + ", 100"}
                    d={"M" + (props.widthHeight / 2)/(props.widthHeight/36) + " " + 25/2/(props.widthHeight/36) + 
                    " a " + (props.widthHeight / 2 - 25/2)/(props.widthHeight/36) + " " + (props.widthHeight / 2 - 25/2)/(props.widthHeight/36) + " 0 0 1 0 " + (props.widthHeight-25)/(props.widthHeight/36) + 
                    " a " + (props.widthHeight / 2 - 25/2)/(props.widthHeight/36) + " " + (props.widthHeight / 2 - 25/2)/(props.widthHeight/36) + " 0 0 1 0 " + (-props.widthHeight+25)/(props.widthHeight/36)}
                />
            </svg>
        </Aux>
    );
}

export default volumeNormalizer;