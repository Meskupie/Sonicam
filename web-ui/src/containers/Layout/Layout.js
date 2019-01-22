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

        console.log(buttonParameters);

        return (
            <div className={classes.Layout} style={buttonContainerStyle}>
                <UserVolumeButton params={buttonParameters} volume={(1.00).toFixed(2)}/>
                <EqualizerButton params={buttonParameters}/>
                <MasterVolumeButton params={buttonParameters}/>
                <SettingsButton params={buttonParameters}/>
            </div>
        );
    }
}

export default Layout;