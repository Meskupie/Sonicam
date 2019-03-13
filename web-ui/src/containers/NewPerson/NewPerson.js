import React, { Component } from 'react';
import Person from '../../components/POI/Person/Person';
import classes from './NewPerson.module.scss'

class NewPerson extends Component {
    constructor(props) {
        super(props);
        this.state = {

        }
    }

    componentDidMount() {
        setTimeout((data) => {
            fetch('http://localhost:8080/http://localhost:5000/api/poisverbose/', {
                method: "GET",
            })
                .then(
                    (response) => {
                        if (response.status !== 200) {
                            console.log('Looks like there was a problem. Status Code: ' +
                                response.status);
                            return;
                        }

                        // Examine the text in the response
                        response.json().then((data) => {
                            this.setState({ newPOIs: data })
                        });
                    }
                )
                .catch(function (err) {
                    console.log('Fetch Error :-S', err);
                });
            console.log("getting");
        }, 100)
    }

    render() {
        if (this.state.newPOIs === null || this.state.newPOIs === undefined) {
            return null;
        }

        let posY = this.props.spacingY * (this.props.row - 1) + this.props.widthHeight * (this.props.row - 1) + this.props.offsetTop;
        let POIs = [...this.state.newPOIs];

        let x = 1;

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

            for (let i = 0; i < this.props.state.POIs.length; i++) {
                if (this.props.state.POIs[i].id === POI.id) {
                    return null;

                }
            }

            //TODO: basically hardcoded to get a partial cut off of the last element. Could calculate this instead
            let posX = (this.props.spacingX - 35) * (x - 1) + this.props.imageWidthHeight * (x - 1);

            let image = "data:image/jpeg;charset=utf-8;base64," + POI.frame;

            x = x + 1;

            return (
                <Person
                    key={POI.id}
                    posX={posX}
                    posY={0}
                    widthHeight={this.props.widthHeight}
                    imgWidthHeight={this.props.imageWidthHeight}
                    imgSource={image}
                    onClick={(event) => this.props.newPOIClickedHander(event, POI)}
                    name={POI.id}
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
