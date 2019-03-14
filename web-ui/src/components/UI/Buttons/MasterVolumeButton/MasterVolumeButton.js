import React, { Component } from 'react';
import classes from './MasterVolumeButton.module.scss';

class MasterVolumeButton extends Component {
    shouldComponentUpdate(nextProps, nextState){
        if(this.props.volume !== nextProps.volume){
            return true;
        }
        return false;
    }

    render() {
        let masterVolumeButtonStyle = {
            right: this.props.params.spacingUI + this.props.params.buttonSmallWidth + 'px',
            width: this.props.params.buttonLargeWidth + 'px',
            height: this.props.params.buttonHeight + 'px'
        };

        let sliderOverlayStyle = {
            width: this.props.volume / 2 + "%"
        }

        return (
            <div className={classes.VolumeButton} style={masterVolumeButtonStyle}>
                <div className={classes.SliderContainer}>
                    <div className={classes.SliderActive}>
                        <input className={classes.Slider} onChange={this.props.changed} type="range" min="0" max="200" value={this.props.volume}></input>
                        <div className={classes.SliderOverlay} style={sliderOverlayStyle} />
                    </div>
                </div>
            </div>
        );
    }
}


export default MasterVolumeButton