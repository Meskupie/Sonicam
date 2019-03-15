import React, {Component} from 'react';
import classes from './UserVolumeButton.module.scss';

class UserVolumeButton extends Component {
    shouldComponentUpdate(nextProps, nextState) {
        if(this.props.volume === nextProps.volume){
            return false;
        }
        return true;
    }
    render() {

        var userVolumeButtonStyle = {
            width: this.props.params.buttonLargeWidth + 'px',
            height: this.props.params.buttonHeight + 'px'
        };

        let volumeButtonContainerStyle = {
            width: 410 * this.props.params.buttonLargeWidth / 560 + 'px',
            height: 80 * this.props.params.buttonHeight / 180 + 'px'
        }

        let textStyle = {
            fontSize: 68 * this.props.params.buttonHeight / 180
        }

        let minusPlusStyle = {
            height: 80 * this.props.params.buttonHeight / 180 + 'px',
            width: 80 * this.props.params.buttonHeight / 180 + 'px'
        }

        return (
            <div className={classes.VolumeButton} style={userVolumeButtonStyle}>
                <div className={classes.ButtonMinus} onPointerDown={this.props.clickedMinus} onPointerUp={this.props.onPointerUpOrOut} onPointerOut={this.props.onPointerUpOrOut}></div>
                <div className={classes.ButtonPlus} onPointerDown={this.props.clickedPlus} onPointerUp={this.props.onPointerUpOrOut} onPointerOut={this.props.onPointerUpOrOut}></div>
                <div className={classes.VolumeButtonContainer} style={volumeButtonContainerStyle}>
                    <div className={classes.Minus} style={minusPlusStyle}>


                        <svg width="102px" height="22px" viewBox="0 0 102 22" version="1.1" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink">
                            <defs>
                                <filter x="-4.0%" y="-21.9%" width="108.3%" height="143.8%" filterUnits="objectBoundingBox" id="filter-1">
                                    <feOffset dx="0" dy="0" in="SourceAlpha" result="shadowOffsetOuter1"></feOffset>
                                    <feGaussianBlur stdDeviation="3.5" in="shadowOffsetOuter1" result="shadowBlurOuter1"></feGaussianBlur>
                                    <feColorMatrix values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.22 0" type="matrix" in="shadowBlurOuter1" result="shadowMatrixOuter1"></feColorMatrix>
                                    <feMerge>
                                        <feMergeNode in="shadowMatrixOuter1"></feMergeNode>
                                        <feMergeNode in="SourceGraphic"></feMergeNode>
                                    </feMerge>
                                </filter>
                            </defs>
                            <g id="Mockup-Without-Video-Unscaled" fillRule="evenodd" strokeLinecap="round">
                                <g id="Main" stroke="#25266C" strokeWidth="10">
                                    <g id="Button-Modifier">
                                        <g id="Group">
                                            <g filter="url(#filter-1)">
                                                <path d="M11,11 L91, 11" id="Line"></path>
                                                <path stroke="none" d="M0,0 L102,22"></path>
                                            </g>
                                        </g>
                                    </g>
                                </g>
                            </g>
                        </svg>

                    </div>
                    <div className={classes.TextBackground} style={textStyle}>
                        {(this.props.volume/3).toFixed(2)}
                    </div>
                    <div className={classes.Plus} style={minusPlusStyle}>
                        <svg width="102px" height="101px" viewBox="0 0 102 101" version="1.1" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink">
                            <defs>
                                <filter x="-4.0%" y="-21.9%" width="108.3%" height="143.8%" filterUnits="objectBoundingBox" id="filter-1">
                                    <feOffset dx="0" dy="0" in="SourceAlpha" result="shadowOffsetOuter1"></feOffset>
                                    <feGaussianBlur stdDeviation="3.5" in="shadowOffsetOuter1" result="shadowBlurOuter1"></feGaussianBlur>
                                    <feColorMatrix values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.22 0" type="matrix" in="shadowBlurOuter1" result="shadowMatrixOuter1"></feColorMatrix>
                                    <feMerge>
                                        <feMergeNode in="shadowMatrixOuter1"></feMergeNode>
                                        <feMergeNode in="SourceGraphic"></feMergeNode>
                                    </feMerge>
                                </filter>
                            </defs>
                            <g id="Mockup-Without-Video-Unscaled" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd" strokeLinecap="round">
                                <g id="Main" stroke="#25266C" strokeWidth="10">
                                    <g id="Button-Modifier">
                                        <g id="Group">
                                            <g filter="url(#filter-1)">
                                                <path d="M11,50.5 L91, 50.5" id="Line"></path>
                                                <path d="M51,11 L51,91" id="Line"></path>
                                                <path stroke="none" d="M0,0 L102,22"></path>
                                            </g>
                                        </g>
                                    </g>
                                </g>
                            </g>
                        </svg>
                    </div>
                </div>
            </div >
        );
    }
}

export default UserVolumeButton