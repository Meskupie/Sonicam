import React, { Component } from 'react';
import Person from '../../components/POI/Person/Person';
import classes from './NewPerson.module.scss'

class NewPerson extends Component {
    // constructor(props) {
    //     super(props);
    // }

    render() {
        let pos = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        let posY = this.props.spacingY * (this.props.row - 1) + this.props.widthHeight * (this.props.row - 1) + this.props.offsetTop;

        let personContainerStyle = {
            width: this.props.appWidth - this.props.offsetLeft*2,
            height: this.props.widthHeight + "px",
            top: posY + "px",
            left: this.props.offsetLeft + "px"
        }

        let persons = pos.map(index => {
            console.log(index);
            let x = index

            //TODO: basically hardcoded to get a partial cut off of the last element. Could calculate this instead
            let posX = (this.props.spacingX - 35) * (x - 1) + this.props.imageWidthHeight * (x - 1);

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
            <div className={[classes.PersonContainer, classes.Scrollable].join(' ')} style={personContainerStyle}>
                {persons}
            </div>
        );
    }
}

export default NewPerson;
