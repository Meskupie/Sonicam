import React from 'react';
import classes from './IndicatorText.module.scss';

//Where the face video/images will be displayed
//either when tracked, when adding new faces or when
//modifying a current tracked face

const indicatorText = (props) => {
    let personSelectorStyle = {
        
    }
    
    return (
        <div className = {classes.Text}>
            {props.name}
        </div>
    );
}

export default indicatorText;