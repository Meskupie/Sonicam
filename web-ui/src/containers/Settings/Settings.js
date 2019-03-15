import React, { PureComponent } from 'react';
import classes from './Settings.module.scss'
import Aux from '../../hoc/Aux/Aux';

class Settings extends PureComponent {

    render() {

        let settingsWrapperStyle = {
            top: this.props.offsetTop + "px",
            right: this.props.offsetUI + "px",
            paddingLeft: this.props.offsetUI + "px",
            paddingRight: this.props.offsetUI + "px",
            paddingBottom: 3 * this.props.offsetUI / 4 + "px",
            paddingTop: 3 * this.props.offsetUI / 4 + "px",
        }

        let settingsContainerStyle = {
            // paddingRight: this.props.offsetUI
        }

        let subSettingStyle = {
            paddingBottom: this.props.offsetUI / 4 + "px",
            paddingTop: this.props.offsetUI / 4 + "px"
        }

        let titleStyle = {
            // paddingBottom: this.props.offsetUI / 4 + "px"
        }

        let status = null;
        let sourceList = null;
        let ShowSceneStatusClass = [classes.ShowSceneStatusClass];

        if (this.props.sources !== null && this.props.sources !== undefined) {
            sourceList = this.props.sources.map(source => {

                let StatusPlayClass = [classes.Play];
                let StatusLoadingSpinnerClass = [classes.LoadingSpinner];
                let StatusPlayingSpinnerClass = [classes.PlayingSpinner];
                let SpinnerBackgroundClass = [classes.SpinnerBackground];
                let SourceSubSettingClass = [classes.Source, classes.TextBackground];

                //Disable this when loading
                StatusLoadingSpinnerClass.push(classes.Hidden);

                if (source === this.props.selectedSource) {
                    if (this.props.videoState === "ready") {
                        StatusPlayingSpinnerClass.push(classes.Hidden);
                        SourceSubSettingClass.push(classes.NoClick);
                    }
                    else if (this.props.videoState === "playing") {
                        StatusLoadingSpinnerClass.push(classes.Hidden);
                        SpinnerBackgroundClass.push(classes.Hidden);
                    }
                    StatusPlayClass.push(classes.Hidden);
                }
                else {
                    StatusPlayingSpinnerClass.push(classes.Hidden);
                    StatusLoadingSpinnerClass.push(classes.Hidden);
                }

                status =
                    <div className={classes.StatusContainer}>
                        <svg className={StatusPlayClass.join(' ')} width="20px" height="20px" viewBox="0 0 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink">
                            <g id="Symbols" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                                <g id="Play-Symbol" stroke="#25266c">
                                    <polygon id="Triangle" strokeWidth="1.5" fill="#25266c" strokeLinejoin="round" transform="translate(10.500000, 10.000000) rotate(90.000000) translate(-10.500000, -10.000000) " points="10.5 6.5 14.5 13.5 6.5 13.5"></polygon>
                                </g>
                            </g>
                        </svg>
                        <svg className={SpinnerBackgroundClass.join(' ')} width="20px" height="20px" viewBox="0 0 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink">
                            <g id="Symbols" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                                <g id="Playing-Symbol" stroke="#25266c" strokeWidth="2.5">
                                    <circle id="Oval" cx="10" cy="10" r="8.75"></circle>
                                </g>
                            </g>
                        </svg>
                        <svg className={StatusLoadingSpinnerClass.join(' ')} width="20px" height="20px" viewBox="0 0 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink">
                            <g id="Symbols" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                                <g id="Playing-Symbol" strokeWidth="2.5">
                                    <circle id="Oval" strokeOpacity="0" stroke="#25266c" cx="10" cy="10" r="8.75"></circle>
                                    <path d="M10,1.25 C5.16750844,1.25 1.25,5.16750844 1.25,10" id="Path" stroke="#21F8B6" strokeLinecap="round"></path>
                                </g>
                            </g>
                        </svg>
                        <svg className={StatusPlayingSpinnerClass.join(' ')} width="20px" height="20px" viewBox="0 0 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink">
                            <g id="Symbols" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                                <g id="Playing-Symbol" stroke="#21F8B6" strokeWidth="2.5">
                                    <circle id="Oval" cx="10" cy="10" r="8.75"></circle>
                                </g>
                            </g>
                        </svg>
                    </div >

                return (
                    <Aux key={source}>
                        <div style={subSettingStyle} className={SourceSubSettingClass.join(' ')} onClick={(event) => this.props.sourceClickedHandler(source)}>
                            {status}
                            {source}
                        </div>


                    </Aux >
                );
            });
        }
        else {
            sourceList =
                <div style={subSettingStyle} className={[classes.Source, classes.TextBackground].join(' ')}>
                    No sources availiable
            </div>
        }

        if(!this.props.showSceneStatus){
            ShowSceneStatusClass.push(classes.Hidden);
        }

        let subSettingShowSceneStatus =
            <div className={classes.StatusContainer}>
                <svg className={classes.SpinnerBackground} width="20px" height="20px" viewBox="0 0 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink">
                    <g id="Symbols" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                        <g id="Playing-Symbol" stroke="#25266c" strokeWidth="2.5">
                            <circle id="Oval" cx="10" cy="10" r="8.75"></circle>
                        </g>
                    </g>
                </svg>
                <svg className={ShowSceneStatusClass.join(' ')} width="20px" height="20px" viewBox="0 0 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink">
                    <g id="Symbols" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                        <g id="Playing-Symbol" stroke="#21F8B6" strokeWidth="2.5">
                            <circle id="Oval" cx="10" cy="10" r="8.75"></circle>
                        </g>
                    </g>
                </svg>
            </div >

        return (
            <div style={settingsWrapperStyle} className={classes.Settings} >
                <div style={settingsContainerStyle} className={classes.SettingsContainer}>
                    <div style={titleStyle} className={[classes.Title, classes.TextBackground].join(' ')}>
                        Settings
                    </div>
                    <div style={subSettingStyle} className={[classes.Source, classes.TextBackground].join(' ')} onPointerDown={this.props.clickedShowSceneStatus}>
                        {subSettingShowSceneStatus}
                        Show Scene
                    </div>
                </div>
                <hr className={classes.SettingsBreak}></hr>
                <div className={classes.SourceContainer}>
                    <div style={titleStyle} className={[classes.Title, classes.TextBackground].join(' ')}>
                        Video Source
                    </div>
                    {sourceList}
                </div>
            </div>
        );
    }
}

export default Settings;