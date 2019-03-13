import React, { Component } from 'react';
import Person from '../../components/POI/Person/Person';
import classes from './NewPerson.module.scss'

class NewPerson extends Component {
    // constructor(props) {
    //     super(props);
    // }

    render() {
        let posY = this.props.spacingY * (this.props.row - 1) + this.props.widthHeight * (this.props.row - 1) + this.props.offsetTop;
        let POIs = this.props.state.POIs;
        let x = 1;

        //Get list of POI's.  Display those without a position in order of priority

        let personContainerStyle = {
            width: this.props.appWidth - this.props.offsetLeft * 2,
            height: this.props.widthHeight + "px",
            top: posY + "px",
            left: this.props.offsetLeft + "px"
        }

        POIs.sort(function (a, b) {
            return (a.importance - b.importance);
        });


        let persons = POIs.map(POI => {

            if (POI.position !== null) {
                return null;
            }

            //TODO: basically hardcoded to get a partial cut off of the last element. Could calculate this instead
            let posX = (this.props.spacingX - 35) * (x - 1) + this.props.imageWidthHeight * (x - 1);

            let image = " ";

            if (this.props.state.parsedImage !== undefined && this.props.state.parsedImage[POI.id] !== undefined) {
                image = "data:image/jpeg;charset=utf-8;base64," + this.props.state.parsedImage[POI.id].image;
            }

            x = x + 1;

            return (
                <Person
                    key={POI.id}
                    posX={posX}
                    posY={0}
                    widthHeight={this.props.widthHeight}
                    imgWidthHeight={this.props.imageWidthHeight}
                    imgSource={image}
                    onClick={(event) => this.props.newPOIClickedHander(event, POI.id)}
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
