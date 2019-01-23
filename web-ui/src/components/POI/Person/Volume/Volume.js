import React from 'react';
import classes from './Volume.module.scss';
import Aux from '../../../../hoc/Aux/Aux';

//Where the face video/images will be displayed
//either when tracked, when adding new faces or when
//modifying a current tracked face

const volume = (props) => {
    let circleClass = [classes.CircularChart]
    
    var circleStyle = {
        strokeWidth: props.volumeWidth / (props.widthHeight / 36),
    }

    var viewBoxStyle = {
        width: props.widthHeight,
        height: props.widthHeight,
    }

    if(props.type === "multiplier"){
        circleClass.push(classes.Multiplier);
    }
    else if(props.type === "normalizer"){
        circleClass.push(classes.Normalizer);
    }
    else{
        //Throw error
    }

    switch(props.state){
        case "normal":
            circleClass.push(classes.Normal);
            break;
        case "muted":
            circleClass.push(classes.Muted);
            break;
        case "poor":
            circleClass.push(classes.Poor);
            break;
        default:
            circleClass.push(classes.Lost);
    }



    //Need if volume 0 then don't return
    //Need to calculate circumference 

    return (
        <Aux>
            <svg viewBox="0 0 36 36" className={circleClass.join(' ')} style={viewBoxStyle}>
                <path className={classes.Circle} style={circleStyle}
                    strokeDasharray={(props.volume * 100 / 4) / (100 / (((props.widthHeight / 2 - props.volumeWidth / 2) / (props.widthHeight / 36)) * 2 * Math.PI)) + ", " + (((props.widthHeight / 2 - props.volumeWidth / 2) / (props.widthHeight / 36)) * 2 * Math.PI)}
                    d={"M " + (props.widthHeight / 2) / (props.widthHeight / 36) + " " + props.volumeWidth / 2 / (props.widthHeight / 36) +
                        " a " + (props.widthHeight / 2 - props.volumeWidth / 2) / (props.widthHeight / 36) + " " + (props.widthHeight / 2 - props.volumeWidth / 2) / (props.widthHeight / 36) + " 0 0 1 0 " + (props.widthHeight - props.volumeWidth) / (props.widthHeight / 36) +
                        " a " + (props.widthHeight / 2 - props.volumeWidth / 2) / (props.widthHeight / 36) + " " + (props.widthHeight / 2 - props.volumeWidth / 2) / (props.widthHeight / 36) + " 0 0 1 0 " + (-props.widthHeight + props.volumeWidth) / (props.widthHeight / 36)}
                />
            </svg>
        </Aux>
    );
}

export default volume;