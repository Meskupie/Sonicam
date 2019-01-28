import React, {Component} from 'react';
import classes from './Layout.module.scss';
import EqualizerButton from '../../components/UI/Buttons/EqualizerButton/EqualizerButton';
import UserVolumeButton from '../../components/UI/Buttons/UserVolumeButton/UserVolumeButton';
import SettingsButton from '../../components/UI/Buttons/SettingsButton/SettingsButton';
import MasterVolumeButton from '../../components/UI/Buttons/MasterVolumeButton/MasterVolumeButton';

class Layout extends Component {
    render() {        
        let buttonParameters = {
            offsetTop: this.props.offsetTop,
            spacingUI: this.props.spacingUI,
            buttonHeight: this.props.buttonHeight,
            buttonSmallWidth: this.props.buttonSmallWidth,
            buttonLargeWidth: this.props.buttonLargeWidth
        };

        let buttonContainerStyle = {
            top: this.props.spacingUI,
            left: this.props.spacingUI,
            right: this.props.spacingUI,
            height: this.props.buttonHeight
        }

        return (
            <div className={classes.Layout} style={buttonContainerStyle}>
                <UserVolumeButton 
                    params={buttonParameters} 
                    volume={(this.props.userVolume).toFixed(2)}
                    clickedPlus={(event) => this.props.userVolumeChangeHandler(event, 'up')}
                    clickedMinus={(event) => this.props.userVolumeChangeHandler(event, 'down')}/>
                <EqualizerButton params={buttonParameters}/>
                <MasterVolumeButton 
                    params={buttonParameters}
                    changed={(event) => this.props.masterVolumeChangeHandler(event)}
                    volume={this.props.masterVolume * 100}/>
                <SettingsButton params={buttonParameters}/>
            </div>
        );
    }
}

export default Layout;