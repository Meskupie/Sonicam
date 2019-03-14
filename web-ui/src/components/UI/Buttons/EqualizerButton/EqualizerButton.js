import React, { Component } from 'react';
import classes from './EqualizerButton.module.scss';

//const equalizerButton = () => <Icon/>;

class EqualizerButton extends Component {
    shouldComponentUpdate(nextProps, nextState) {
        return false;
    }
    render() {
        let equalizerClass = [classes.Equalizer];

        let equalizerButtonStyle = {
            left: this.props.params.spacingUI + this.props.params.buttonLargeWidth + 'px',
            width: this.props.params.buttonSmallWidth + 'px',
            height: this.props.params.buttonHeight + 'px'
        };

        return (
            <div className={equalizerClass.join(' ')} style={equalizerButtonStyle}>
                <svg className={classes.Icon} width={this.props.params.buttonSmallWidth * 65 / 80 * 9 / 10 + "px"} height={this.props.params.buttonHeight * 55 / 80 * 9 / 10 + "px"} viewBox="0 0 144 122" version="1.1" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink">
                    <defs>
                        <linearGradient x1="50%" y1="100%" x2="50%" y2="-161.10244%" id="linearGradient-1">
                            <stop stopColor="#4BF48F" offset="0%"></stop>
                            <stop stopColor="#5BCDE9" offset="100%"></stop>
                        </linearGradient>
                        <linearGradient x1="50%" y1="100%" x2="50%" y2="0%" id="linearGradient-2">
                            <stop stopColor="#4BF48F" offset="0%"></stop>
                            <stop stopColor="#92E9FF" offset="100%"></stop>
                        </linearGradient>
                        <circle id="path-3" cx="10" cy="59" r="10"></circle>
                        <filter x="-135.0%" y="-135.0%" width="370.0%" height="370.0%" filterUnits="objectBoundingBox" id="filter-4">
                            <feMorphology radius="2" operator="dilate" in="SourceAlpha" result="shadowSpreadOuter1"></feMorphology>
                            <feOffset dx="0" dy="0" in="shadowSpreadOuter1" result="shadowOffsetOuter1"></feOffset>
                            <feGaussianBlur stdDeviation="7" in="shadowOffsetOuter1" result="shadowBlurOuter1"></feGaussianBlur>
                            <feComposite in="shadowBlurOuter1" in2="SourceAlpha" operator="out" result="shadowBlurOuter1"></feComposite>
                            <feColorMatrix values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.222797781 0" type="matrix" in="shadowBlurOuter1"></feColorMatrix>
                        </filter>
                        <linearGradient x1="50%" y1="100%" x2="50%" y2="-161.10244%" id="linearGradient-5">
                            <stop stopColor="#FF3E82" offset="0%"></stop>
                            <stop stopColor="#FFC084" offset="100%"></stop>
                        </linearGradient>
                        <linearGradient x1="50%" y1="100%" x2="50%" y2="0%" id="linearGradient-6">
                            <stop stopColor="#FF3E82" offset="0%"></stop>
                            <stop stopColor="#FFC084" offset="100%"></stop>
                        </linearGradient>
                        <circle id="path-7" cx="10" cy="85" r="10"></circle>
                        <filter x="-135.0%" y="-135.0%" width="370.0%" height="370.0%" filterUnits="objectBoundingBox" id="filter-8">
                            <feMorphology radius="2" operator="dilate" in="SourceAlpha" result="shadowSpreadOuter1"></feMorphology>
                            <feOffset dx="0" dy="0" in="shadowSpreadOuter1" result="shadowOffsetOuter1"></feOffset>
                            <feGaussianBlur stdDeviation="7" in="shadowOffsetOuter1" result="shadowBlurOuter1"></feGaussianBlur>
                            <feComposite in="shadowBlurOuter1" in2="SourceAlpha" operator="out" result="shadowBlurOuter1"></feComposite>
                            <feColorMatrix values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.222797781 0" type="matrix" in="shadowBlurOuter1"></feColorMatrix>
                        </filter>
                        <linearGradient x1="50%" y1="0%" x2="50%" y2="100%" id="linearGradient-9">
                            <stop stopColor="#FFE570" offset="0%"></stop>
                            <stop stopColor="#F89C34" offset="100%"></stop>
                        </linearGradient>
                        <circle id="path-10" cx="10" cy="41" r="10"></circle>
                        <filter x="-135.0%" y="-135.0%" width="370.0%" height="370.0%" filterUnits="objectBoundingBox" id="filter-11">
                            <feMorphology radius="2" operator="dilate" in="SourceAlpha" result="shadowSpreadOuter1"></feMorphology>
                            <feOffset dx="0" dy="0" in="shadowSpreadOuter1" result="shadowOffsetOuter1"></feOffset>
                            <feGaussianBlur stdDeviation="7" in="shadowOffsetOuter1" result="shadowBlurOuter1"></feGaussianBlur>
                            <feComposite in="shadowBlurOuter1" in2="SourceAlpha" operator="out" result="shadowBlurOuter1"></feComposite>
                            <feColorMatrix values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.222797781 0" type="matrix" in="shadowBlurOuter1"></feColorMatrix>
                        </filter>
                    </defs>
                    <g id="Mockup-Without-Video-Unscaled" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                        <g id="Main" transform="translate(-674.000000, -79.000000)">
                            <g id="EQ-Large" transform="translate(658.000000, 50.000000)">
                                <g id="EQ">
                                    <g id="Group" transform="translate(34.000000, 28.800000)">
                                        <g id="Slider-1" transform="translate(0.000000, 0.200000)">
                                            <rect id="Rectangle" fill="#25266C" x="7" y="0" width="10" height="122" rx="5"></rect>
                                            <rect id="Rectangle" fill="url(#linearGradient-1)" x="7" y="58" width="10" height="64" rx="5"></rect>
                                            <g id="Oval">
                                                <use fill="black" fillOpacity="1" filter="url(#filter-4)" href="#path-3"></use>
                                                <circle stroke="url(#linearGradient-2)" strokeWidth="5" strokeLinejoin="square" fill="#D5EBFF" fillRule="evenodd" cx="12" cy="61" r="9.5"></circle>
                                            </g>
                                        </g>
                                        <g id="Slider-2" transform="translate(44.000000, 0.200000)">
                                            <rect id="Rectangle" fill="#25266C" x="7" y="0" width="10" height="122" rx="5"></rect>
                                            <rect id="Rectangle" fill="url(#linearGradient-5)" x="7" y="86" width="10" height="36" rx="5"></rect>
                                            <g id="Oval">
                                                <use fill="black" fillOpacity="1" filter="url(#filter-8)" href="#path-7"></use>
                                                <circle stroke="url(#linearGradient-6)" strokeWidth="5" strokeLinejoin="square" fill="#D5EBFF" fillRule="evenodd" cx="12" cy="87" r="9.5"></circle>
                                            </g>
                                        </g>
                                        <g id="Slider-3" transform="translate(88.000000, 0.200000)">
                                            <rect id="Rectangle" fill="#25266C" x="7" y="0" width="10" height="122" rx="5"></rect>
                                            <rect id="Rectangle" fill="url(#linearGradient-9)" x="7" y="43" width="10" height="79" rx="5"></rect>
                                            <g id="Oval">
                                                <use fill="black" fillOpacity="1" filter="url(#filter-11)" href="#path-10"></use>
                                                <circle stroke="url(#linearGradient-9)" strokeWidth="5" strokeLinejoin="square" fill="#FFFFFF" fillRule="evenodd" cx="12" cy="43" r="9.5"></circle>
                                            </g>
                                        </g>
                                    </g>
                                </g>
                            </g>
                        </g>
                    </g>
                </svg>
            </div >
        );
    }
}

export default EqualizerButton;