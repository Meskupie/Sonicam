import React, { PureComponent } from "react";
import Aux from "../../../../hoc/Aux/Aux";
import classes from "./SoundStatus.module.scss"

class SoundStatus extends PureComponent {

    render() {
        let indicator = null;

        switch (this.props.status) {
            case "normal":
                indicator =
                    <svg className={classes.Status} width="23px" height="16px" viewBox="0 0 23 16" version="1.1" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink">
                        <defs>
                            <linearGradient x1="64.517401%" y1="0%" x2="64.517401%" y2="100%" id="linearGradient-normalStatus1">
                                <stop stopColor="#19E2A4" offset="0%"></stop>
                                <stop stopColor="#08B781" offset="100%"></stop>
                            </linearGradient>
                            <linearGradient x1="96.9613989%" y1="0%" x2="96.9613989%" y2="100%" id="linearGradient-normalStatus2">
                                <stop stopColor="#21F8B6" offset="0%"></stop>
                                <stop stopColor="#00A170" offset="100%"></stop>
                            </linearGradient>
                            <linearGradient x1="-12.1980366%" y1="-12.4285337%" x2="112.95325%" y2="111.663614%" id="linearGradient-normalStatus3">
                                <stop stopColor="#19E3A5" offset="0%"></stop>
                                <stop stopColor="#08B681" offset="100%"></stop>
                            </linearGradient>
                        </defs>
                        <g id="Symbols" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                            <g id="Normal-Audio-Symbol" transform="translate(0.000000, -1.000000)">
                                <g id="Group-2" transform="translate(0.000000, 1.000000)">
                                    <rect id="Rectangle" fill="url(#linearGradient-normalStatus1)" x="0" y="4" width="5" height="8" rx="1.5"></rect>
                                    <path d="M3.29593883,4.1486604 L6.91252213,0.539159371 C7.35069625,0.0595813752 8.11323259,-0.141337609 8.61543971,0.106648078 C8.87820369,0.23980907 9.0288072,0.480980447 9.0284664,0.766168648 L9.01117789,15.2335349 C9.01052667,15.7784954 8.4731577,16.1069497 7.81089968,15.9682357 C7.46431377,15.8961184 7.13472357,15.7103321 6.9070405,15.4605442 L3.30494751,11.8510432 C3.11408569,11.6772325 3.00878112,11.4703846 3.00851664,11.2674254 L3.0000005,4.73227822 C2.99973602,4.52931899 3.10485134,4.32247106 3.29593883,4.1486604 Z" id="Rectangle" fill="url(#linearGradient-normalStatus2)"></path>
                                    <path d="M15.0355339,10.5355339 C15.0355339,9.08059219 14.4140971,7.77079483 13.4221729,6.85709125 C12.531463,6.03662037 11.3420159,5.53553391 10.0355339,5.53553391" id="Path" stroke="url(#linearGradient-normalStatus3)" strokeWidth="1.5" strokeLinecap="round" transform="translate(12.535534, 8.035534) rotate(45.000000) translate(-12.535534, -8.035534) "></path>
                                    <path d="M23.863961,12.563961 C23.863961,9.94506595 22.7453748,7.58743069 20.9599113,5.94276425 C19.3566333,4.46591666 17.2156287,3.56396103 14.863961,3.56396103" id="Path" stroke="url(#linearGradient-normalStatus3)" strokeWidth="1.5" strokeLinecap="round" transform="translate(19.363961, 8.063961) rotate(45.000000) translate(-19.363961, -8.063961) "></path>
                                    <path d="M19.4497475,11.4497475 C19.4497475,9.41282907 18.5797359,7.57911276 17.1910421,6.29992775 C15.9440482,5.15126851 14.2788223,4.44974747 12.4497475,4.44974747" id="Path" stroke="url(#linearGradient-normalStatus3)" strokeWidth="1.5" strokeLinecap="round" transform="translate(15.949747, 7.949747) rotate(45.000000) translate(-15.949747, -7.949747) "></path>
                                </g>
                            </g>
                        </g>
                    </svg>
                break;
            case "muted":
                indicator =
                    <svg className={classes.Status} width="14px" height="16px" viewBox="0 0 14 16" version="1.1" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink">
                        <defs>
                            <linearGradient x1="96.9613989%" y1="-49.7626412%" x2="96.9613989%" y2="150.958178%" id="linearGradient-mutedStatus1">
                                <stop stopColor="#FE4D4D" offset="0%"></stop>
                                <stop stopColor="#C42121" offset="100%"></stop>
                            </linearGradient>
                            <linearGradient x1="96.9613989%" y1="-86.2577271%" x2="96.9613989%" y2="181.687181%" id="linearGradient-mutedStatus2">
                                <stop stopColor="#FE4D4D" offset="0%"></stop>
                                <stop stopColor="#C42121" offset="100%"></stop>
                            </linearGradient>
                        </defs>
                        <g id="Symbols" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                            <g id="Mute-Symbol" transform="translate(-1.000000, -1.000000)">
                                <g id="Group-2" transform="translate(1.000000, 1.000000)">
                                    <path d="M5.38758205,3.05915492 L7.91252213,0.539159371 C8.35069625,0.0595813752 9.11323259,-0.141337609 9.61543971,0.106648078 C9.87820369,0.23980907 10.0288072,0.480980447 10.0284664,0.766168648 L10.0201903,7.69176319 L5.38758205,3.05915492 Z M10.0134384,13.3418656 L10.0111779,15.2335349 C10.0105267,15.7784954 9.4731577,16.1069497 8.81089968,15.9682357 C8.46431377,15.8961184 8.13472357,15.7103321 7.9070405,15.4605442 L4.45359862,12 L2.5,12 C1.67157288,12 1,11.3284271 1,10.5 L1,5.5 C1,5.16958456 1.10683294,4.86412129 1.28784095,4.61626807 L10.0134384,13.3418656 Z" id="Combined-Shape" fill="url(#linearGradient-mutedStatus1)"></path>
                                    <rect id="Rectangle" fill="url(#linearGradient-mutedStatus2)" transform="translate(7.000000, 7.500000) rotate(-45.000000) translate(-7.000000, -7.500000) " x="6" y="-1" width="2" height="17" rx="1"></rect>
                                </g>
                            </g>
                        </g>
                    </svg>
                break;
            case "poor":
                indicator =
                    <svg className={classes.Status} width="14px" height="16px" viewBox="0 0 14 16" version="1.1" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink">
                        <defs>
                            <linearGradient x1="96.9613989%" y1="-50.9869347%" x2="96.9613989%" y2="149.519132%" id="linearGradient-poorStatus1">
                                <stop stopColor="#FDA757" offset="0%"></stop>
                                <stop stopColor="#D97212" offset="100%"></stop>
                            </linearGradient>
                            <linearGradient x1="96.9613989%" y1="1.66533454e-14%" x2="96.9613989%" y2="100%" id="linearGradient-poorStatus2">
                                <stop stopColor="#FDA757" offset="0%"></stop>
                                <stop stopColor="#D97212" offset="100%"></stop>
                            </linearGradient>
                            <linearGradient x1="50%" y1="-13.6120902%" x2="50%" y2="114.349037%" id="linearGradient-poorStatus3">
                                <stop stopColor="#FDA757" offset="0%"></stop>
                                <stop stopColor="#D97212" offset="100%"></stop>
                            </linearGradient>
                        </defs>
                        <g id="Symbols" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                            <g id="Poor-Audio-Symbol" transform="translate(0.000000, -1.000000)">
                                <g id="Group" transform="translate(0.000000, 1.000000)">
                                    <rect id="Rectangle" fill="url(#linearGradient-poorStatus1)" x="0" y="4" width="8" height="8" rx="1.5"></rect>
                                    <path d="M3.29454138,4.1486604 L6.89404684,0.539159371 C7.33015186,0.0595813752 8.08908743,-0.141337609 8.58892309,0.106648078 C8.85044627,0.23980907 9.00033862,0.480980447 8.99999943,0.766168648 L8.98279256,15.2335349 C8.98214441,15.7784954 8.44731295,16.1069497 7.78818217,15.9682357 C7.44323287,15.8961184 7.11519903,15.7103321 6.8885911,15.4605442 L3.30350752,11.8510432 C3.11354696,11.6772325 3.00873966,11.4703846 3.00847642,11.2674254 L3.0000005,4.73227822 C2.99973726,4.52931899 3.10435622,4.32247106 3.29454138,4.1486604 Z" id="Rectangle" fill="url(#linearGradient-poorStatus2)"></path>
                                    <rect id="Rectangle" fill="url(#linearGradient-poorStatus3)" x="12.25" y="3" width="1.5" height="7.8" rx="0.75"></rect>
                                    <rect id="Rectangle" fill="#DE791A" x="12.25" y="11.5" width="1.5" height="1.5" rx="0.75"></rect>
                                </g>
                            </g>
                        </g>
                    </svg>
                break;
            default:
                indicator =
                    <svg className={classes.Status} width="18px" height="16px" viewBox="0 0 18 16" version="1.1" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink">
                        <defs>
                            <linearGradient x1="50%" y1="-50.3041955%" x2="50%" y2="149.740307%" id="linearGradient-lostStatus1">
                                <stop stopColor="#4E4FBF" offset="0%"></stop>
                                <stop stopColor="#3D3E96" offset="100%"></stop>
                            </linearGradient>
                            <linearGradient x1="50%" y1="-2.48949813e-15%" x2="50%" y2="100%" id="linearGradient-lostStatus2">
                                <stop stopColor="#4E4FBF" offset="0%"></stop>
                                <stop stopColor="#3D3E96" offset="100%"></stop>
                            </linearGradient>
                        </defs>
                        <g id="Symbols" stroke="none" strokeWidth="1" fill="none" fill-rule="evenodd">
                            <g id="Untracked-Symbol" transform="translate(0.000000, -1.000000)">
                                <g id="Group-2" transform="translate(0.000000, 1.000000)">
                                    <rect id="Rectangle" fill="url(#linearGradient-lostStatus1)" x="0" y="4" width="6" height="8" rx="1.5"></rect>
                                    <path d="M3.29593883,4.1486604 L6.91252213,0.539159371 C7.35069625,0.0595813752 8.11323259,-0.141337609 8.61543971,0.106648078 C8.87820369,0.23980907 9.0288072,0.480980447 9.0284664,0.766168648 L9.01117789,15.2335349 C9.01052667,15.7784954 8.4731577,16.1069497 7.81089968,15.9682357 C7.46431377,15.8961184 7.13472357,15.7103321 6.9070405,15.4605442 L3.30494751,11.8510432 C3.11408569,11.6772325 3.00878112,11.4703846 3.00851664,11.2674254 L3.0000005,4.73227822 C2.99973602,4.52931899 3.10485134,4.32247106 3.29593883,4.1486604 Z" id="Rectangle" fill="url(#linearGradient-lostStatus2)"></path>
                                    <text id="?" fontFamily="ProximaNovaSoft-Semibold, Proxima Nova Soft" fontSize="15" fontWeight="500" letterSpacing="-0.306" fill="#4546AB">
                                        <tspan x="11.5" y="13">?</tspan>
                                    </text>
                                </g>
                            </g>
                        </g>
                    </svg>
        }


        return (
            <Aux>
                {indicator}
            </Aux>
        );
    }
}

export default SoundStatus;