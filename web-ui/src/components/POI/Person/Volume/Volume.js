import React, { Component } from 'react';
import classes from './Volume.module.scss';
import Aux from '../../../../hoc/Aux/Aux';

//Where the face video/images will be displayed
//either when tracked, when adding new faces or when
//modifying a current tracked face

//const volume = (this.props) => {
class Volume extends Component {

    shouldComponentUpdate(nextProps, nextState) {
        if(this.props.volume === nextProps.volume && this.props.status === nextProps.status){
            return false;
        }
        return true;
    }

    render() {
        let circleClass = [classes.CircularChart]

        var circleStyle = {
            strokeWidth: this.props.volumeWidth / (this.props.widthHeight / 36),
        }

        var viewBoxStyle = {
            width: this.props.widthHeight,
            height: this.props.widthHeight,
        }

        switch (this.props.type) {
            case "multiplier":
                circleClass.push(classes.Multiplier);
                break;
            case "normalizer":
                circleClass.push(classes.Normalizer);
                break;
            case "background":
                circleClass.push(classes.Background);
                break;
            default:
            //throw error
        }

        switch (this.props.status) {
            case "poor":
                circleClass.push(classes.Poor);
                break;
            case "lost":
                circleClass.push(classes.Lost);
                break;
            default:
                circleClass.push(classes.Normal);
                break;
        }

        if (this.props.isMuted) {
            circleClass.push(classes.Muted);
        }



        //Need if volume 0 then don't return
        //Need to calculate circumference 

        return (
            <Aux>
                <svg viewBox="0 0 36 36" className={circleClass.join(' ')} style={viewBoxStyle}>
                    <path className={classes.Circle} style={circleStyle}
                        strokeDasharray={(this.props.volume * 100 / 4) / (100 / (((this.props.widthHeight / 2 - this.props.volumeWidth / 2) / (this.props.widthHeight / 36)) * 2 * Math.PI)) + ", " + (((this.props.widthHeight / 2 - this.props.volumeWidth / 2) / (this.props.widthHeight / 36)) * 2 * Math.PI)}
                        d={"M " + (this.props.widthHeight / 2) / (this.props.widthHeight / 36) + " " + this.props.volumeWidth / 2 / (this.props.widthHeight / 36) +
                            " a " + (this.props.widthHeight / 2 - this.props.volumeWidth / 2) / (this.props.widthHeight / 36) + " " + (this.props.widthHeight / 2 - this.props.volumeWidth / 2) / (this.props.widthHeight / 36) + " 0 0 1 0 " + (this.props.widthHeight - this.props.volumeWidth) / (this.props.widthHeight / 36) +
                            " a " + (this.props.widthHeight / 2 - this.props.volumeWidth / 2) / (this.props.widthHeight / 36) + " " + (this.props.widthHeight / 2 - this.props.volumeWidth / 2) / (this.props.widthHeight / 36) + " 0 0 1 0 " + (-this.props.widthHeight + this.props.volumeWidth) / (this.props.widthHeight / 36)}
                    />
                </svg>
            </Aux>
        );
    }
}

export default Volume;