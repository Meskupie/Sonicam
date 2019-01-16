import React from 'react';
// import classes from './EqualizerButton.module.scss';
import LogoSVG from './equalizergraphic.inline.svg';

const equalizerButton = () => <LogoSVG/>;

// const equalizerButton = (props) => {
//     let equalizerClass = [classes.Equalizer];

//     //later add switch statement to determine how to display the image
//     //and set class accordingly

//     return (
//         <div className={equalizerClass.join(' ')}>
//             <LogoSVG></LogoSVG>
//         </div>
//     );
// }

export default equalizerButton;