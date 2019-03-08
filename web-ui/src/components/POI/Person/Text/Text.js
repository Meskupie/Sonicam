import React, { PureComponent } from 'react';
import classes from './Text.module.scss';

//Where the face video/images will be displayed
//either when tracked, when adding new faces or when
//modifying a current tracked face

class Text extends PureComponent {
    render() {
        let name = this.props.name;
        let textClass = [];
        textClass.push(classes.Text);

        if (this.props.isSelected) {
            textClass.push(classes.Selected);
        }
        else {
            textClass.push(classes.Unselected);
        }

        if (this.props.isHeld) {
            name = "Edit - " + this.props.name;
        }

        return (
            <div className={textClass.join(' ')}>
                {name}
            </div>
        );
    }
}

export default Text;