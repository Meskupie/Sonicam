import React from 'react';
import classes from './EqualizerButton.module.scss';
import Icon from './equalizergraphic.svg';

//const equalizerButton = () => <Icon/>;

const equalizerButton = (props) => {
    let equalizerClass = [classes.Equalizer];

    //later add switch statement to determine how to display the image
    //and set class accordingly

    return (
        <div className={equalizerClass.join(' ')}>
            <Icon className={classes.Icon}/>
        </div>
    );
}

export default equalizerButton;