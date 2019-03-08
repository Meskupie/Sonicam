import React from 'react';
import classes from './PersonSelector.module.scss';

//Where the face video/images will be displayed
//either when tracked, when adding new faces or when
//modifying a current tracked face

const personSelector = (props) => {
    let selectorClass = [classes.Selector]

    let personSelectorStyle = {
        top: props.posY + "px",
        left: props.posX + "px",
        width: props.widthHeight + "px",
        height: props.widthHeight + "px",
        borderWidth: props.borderWidth + "px",
    }
    
    function handleClick(event) {
        event.stopPropagation();
        console.log("selector clicked");
    }

    if(props.isHidden){
        selectorClass.push(classes.Hidden)
    }

    return (
        <div className = {selectorClass.join(' ')} style = {personSelectorStyle} onClick={handleClick}/>
    );
}

export default personSelector;