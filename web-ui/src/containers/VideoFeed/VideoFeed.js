import React, { Component } from 'react';
import classes from './VideoFeed.module.scss';

class VideoFeed extends Component {
    render() {

        var videoFeedStyle = {
            top: this.props.offsetTop - 3,
            left: this.props.offsetLeft - 3,
            width: this.props.width,
            height: this.props.height,
            border: "3px solid #21F8B6"
        }

        var image = " ";

        if (this.props.image !== undefined && this.props.image !== null) {
            image = "data:image/jpeg;charset=utf-8;base64," + this.props.image;
        }

        return (
            <img src={image} style={videoFeedStyle} alt=" " className={classes.VideoFeed}>

            </img>
        );
    }
}

export default VideoFeed;