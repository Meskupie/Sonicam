import React from 'react';
import classes from './PersonSelector.module.scss';

//Where the face video/images will be displayed
//either when tracked, when adding new faces or when
//modifying a current tracked face

const personSelector = (props) => {
    
    let personSelectorStyle = {
        top: props.posY + "px",
        left: props.posX + "px",
        width: props.widthHeight + "px",
        height: props.widthHeight + "px",
        borderWidth: props.borderWidth + "px",
    }
    
    return (
        <div className = {classes.Selector} style = {personSelectorStyle}/>
    );
}

export default personSelector;