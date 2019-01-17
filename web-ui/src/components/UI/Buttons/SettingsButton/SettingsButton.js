import React from 'react';
import classes from './SettingsButton.module.scss';

const settingsButton = (props) => {

    let volumeButtonContainerStyle = {
        width: 410 * props.width / 560 + 'px',
        height: 80 * props.width / 560 + 'px'
    }

    let textStyle = {
        fontSize: 68 * props.height / 180
    }

    let minusPlusStyle = {
        height: 80 * props.height / 180 + 'px',
        width: 80 * props.height / 180 + 'px'
    }

    return (
        <div className={classes.Settings} style={props.style}>         
            <svg width="94px" height="72px" viewBox="0 0 94 72" version="1.1" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink">
                <g id="Mockup-Without-Video-Unscaled" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                    <g id="Main" transform="translate(-1733.000000, -104.000000)" fill="#25266C">
                        <g id="Setttings-Button" transform="translate(1733.000000, 104.000000)">
                            <g id="Settings">
                                <rect id="Rectangle" transform="translate(47.000000, 5.400000) rotate(180.000000) translate(-47.000000, -5.400000) " x="0.2" y="0" width="93.6" height="10.8" rx="5.4"></rect>
                                <rect id="Rectangle" transform="translate(47.000000, 36.000000) rotate(180.000000) translate(-47.000000, -36.000000) " x="0.2" y="30.6" width="93.6" height="10.8" rx="5.4"></rect>
                                <rect id="Rectangle" transform="translate(47.000000, 66.600000) rotate(180.000000) translate(-47.000000, -66.600000) " x="0.2" y="61.2" width="93.6" height="10.8" rx="5.4"></rect>
                            </g>
                        </g>
                    </g>
                </g>
            </svg>
        </div >
    );
}

export default settingsButton