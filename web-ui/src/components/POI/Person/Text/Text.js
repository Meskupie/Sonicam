import React from 'react';
import classes from './Text.module.scss';

//Where the face video/images will be displayed
//either when tracked, when adding new faces or when
//modifying a current tracked face

const indicatorText = (props) => {
    let textClass = [];
    textClass.push(classes.Text);

    if(props.isSelected === true){
        textClass.push(classes.Selected);
    }
    else{
        textClass.push(classes.Unselected);
    }
    
    return (
        <div className = {textClass.join(' ')}>
            {props.name}
        </div>
    );
}

export default indicatorText;