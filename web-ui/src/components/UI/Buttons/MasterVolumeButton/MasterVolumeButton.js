import React, { Component } from 'react';
import classes from './MasterVolumeButton.module.scss';

class masterVolumeButton extends Component {
    constructor(props) {
        super(props);
        this.state = {
            value: 100
        };
    }

    handleChange(event) {
        this.setState({ value: event.target.value });
    }

    render() {
        let masterVolumeButtonStyle = {
            right: this.props.params.spacingUI + this.props.params.buttonSmallWidth + 'px',
            width: this.props.params.buttonLargeWidth + 'px',
            height: this.props.params.buttonHeight + 'px'
        };

        let sliderOverlayStyle = {
            width: this.state.value/2 + "%"
        }

        return (
            <div className={classes.VolumeButton} style={masterVolumeButtonStyle}>
                <div className={classes.SliderContainer}>
                    <div className={classes.SliderActive}>
                        <input className={classes.Slider} onChange={this.handleChange.bind(this)} type="range" min="0" max="200" value={this.value}></input>
                        <div className={classes.SliderOverlay} style={sliderOverlayStyle}/>
                    </div>
                </div>
            </div >
        );
    }
}

export default masterVolumeButton