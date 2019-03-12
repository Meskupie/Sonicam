import React, { PureComponent } from 'react';
import classes from './Settings.module.scss'
import Aux from '../../hoc/Aux/Aux';

class Settings extends PureComponent {

    render() {

        let settingsStyle = {
            top: this.props.offsetTop + "px",
            right: this.props.offsetUI + "px",
            paddingLeft: this.props.offsetUI + "px",
            paddingRight: this.props.offsetUI + "px",
            paddingBottom: this.props.offsetUI / 2 + "px",
            paddingTop: this.props.offsetUI / 2 + "px",
        }

        let sourceStyle = {
            paddingBottom: this.props.offsetUI / 2 + "px",
            paddingTop: this.props.offsetUI / 2 + "px"
        }

        let numSources = this.props.sources.length;
        let x = 1;
        let status = null;

        let sourceList = this.props.sources.map(source => {

            if (x < numSources) {
                var line =
                    <hr className={classes.SourceBreak}>
                    </hr>
            }

            if(source.id === this.props.selectedSource){
                status=
                <div className={classes.StatusContainer}>    
                    <svg className={classes.SpinnerBackground} width="20px" height="20px" viewBox="0 0 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink">
                        <g id="Symbols" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                            <g id="Playing-Symbol" stroke="#25266c" strokeWidth="2.5">
                                <circle id="Oval" cx="10" cy="10" r="8.75"></circle>
                            </g>
                        </g>
                    </svg>
                    <svg className={classes.Spinner} width="20px" height="20px" viewBox="0 0 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink">
                        <g id="Symbols" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                            <g id="Playing-Symbol" strokeWidth="2.5">
                                <circle id="Oval" strokeOpacity="0" stroke="#25266c" cx="10" cy="10" r="8.75"></circle>
                                <path d="M10,1.25 C5.16750844,1.25 1.25,5.16750844 1.25,10" id="Path" stroke="#21F8B6" strokeLinecap="round"></path>
                            </g>
                        </g>
                    </svg>
                </div>
            }
            else{
                status=
                <div className={classes.StatusContainer}>
                    <svg className={classes.Play} width="20px" height="20px" viewBox="0 0 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink">
                        <g id="Symbols" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                            <g id="Play-Symbol" stroke="#25266c">
                                <circle id="Oval" strokeWidth="2.5" cx="10" cy="10" r="8.75"></circle>
                                <polygon id="Triangle" strokeWidth="1.5" fill="#25266c" strokeLinejoin="round" transform="translate(10.500000, 10.000000) rotate(90.000000) translate(-10.500000, -10.000000) " points="10.5 6.5 14.5 13.5 6.5 13.5"></polygon>
                            </g>
                        </g>
                    </svg>
                </div>
            }

            x++;

            return (
                <Aux>
                    <div style={sourceStyle} className={[classes.Source, classes.TextBackground].join(' ')} onClick={(event) => this.props.sourceClickedHandler(source.id)}>
                    {status}
                    {source.name}
                    </div>
                    {line}
                </Aux >
            );
    });

    return(
            <div style = { settingsStyle } className = { classes.Settings } >
            <div className={classes.SourceContainer}>
                <div className={[classes.SourceTitle, classes.TextBackground].join(' ')}>
                Video Source
                </div>
                {sourceList}
            </div>
            </div>
        );
    }
}

export default Settings;