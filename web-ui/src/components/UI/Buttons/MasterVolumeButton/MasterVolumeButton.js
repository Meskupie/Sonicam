import React from 'react';
import classes from './MasterVolumeButton.module.scss';

const masterVolumeButton = (props) => {
    let masterVolumeButtonStyle = {
        right: props.params.spacingUI + props.params.buttonSmallWidth + 'px',
        width: props.params.buttonLargeWidth + 'px',
        height: props.params.buttonHeight + 'px'
    };

    let sliderOverlayStyle = {
        width: props.volume / 2 + "%"
    }

    return (
        <div className={classes.VolumeButton} style={masterVolumeButtonStyle}>
            <div className={classes.SliderContainer}>
                <div className={classes.SliderActive}>
                    <input className={classes.Slider} onChange={props.changed} type="range" min="0" max="200" value={props.volume}></input>
                    <div className={classes.SliderOverlay} style={sliderOverlayStyle} />
                </div>
            </div>
        </div>
    );
}


export default masterVolumeButton