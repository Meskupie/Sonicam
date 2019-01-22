import React, { Component } from 'react';
import Person from '../../components/POI/Person/Person';
import classes from './ModifyingPerson.module.scss'

class ModifyingPerson extends Component {
    constructor(props) {
        super(props);
    }

    //TODO: Remove hardcoded position values from here and .scss file

    render() {
        let pos = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        let row = 1;
        let posY = this.props.spacingY * (row - 1) + this.props.widthHeight * (row - 1) + this.props.offsetTop;

        let personContainerStyle = {
            width: "1820px",
            height: this.props.widthHeight + "px",
            top: posY + "px",
            left: this.props.offsetLeft + "px"
        }

        let persons = pos.map(index => {
            console.log(index);
            let x = index

            let posX = this.props.spacingX * (x - 1) + this.props.imageWidthHeight * (x - 1);

            return (
                <Person
                    key={index}
                    posX={posX}
                    posY={0}
                    widthHeight={this.props.widthHeight}
                    imgWidthHeight={this.props.imageWidthHeight}
                />
            );
        });

        return (
            <div className={classes.PersonContainer} style={personContainerStyle}>
                {persons}
            </div>
        );
    }
}

export default ModifyingPerson;
