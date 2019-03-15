import React, { Component } from 'react';
import classes from './VideoFeed.module.scss';

class VideoFeed extends Component {
    render() {

        var videoFeedStyle = {
            top: this.props.offsetTop
        }

        return (
            <div className={classes.VideoFeed}>

            </div>
        );
    }
}

export default VideoFeed;