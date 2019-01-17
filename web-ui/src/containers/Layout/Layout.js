import React, {Component} from 'react';
import classes from './Layout.module.css';
import EqualizerButton from '../../components/UI/Buttons/EqualizerButton/EqualizerButton';
import UserVolumeButton from '../../components/UI/Buttons/UserVolumeButton/UserVolumeButton';
import SettingsButton from '../../components/UI/Buttons/SettingsButton/SettingsButton';

//all constants should be imported from a global file
const OFFSET_TOP = 50;
const OFFSET_SIDES = 50;
const SPACING = 50;
const BUTTON_HEIGHT = 180;
const BUTTON_SMALL_WIDTH = 180;
const BUTTON_LARGE_WIDTH = 560;

class Layout extends Component {
    render() {
        var userVolumeButtonStyle = {
            top: OFFSET_TOP + 'px',
            left: OFFSET_SIDES + 'px',
            width: BUTTON_LARGE_WIDTH + 'px',
            height: BUTTON_HEIGHT + 'px'
        };

        var equalizerButtonStyle = {
            top: OFFSET_TOP + 'px',
            left: OFFSET_SIDES*2 + BUTTON_LARGE_WIDTH + 'px',
            width: BUTTON_SMALL_WIDTH + 'px',
            height: BUTTON_HEIGHT + 'px'
        };

        var settingsButtonStyle = {
            top: OFFSET_TOP + 'px',
            right: OFFSET_SIDES,
            width: BUTTON_SMALL_WIDTH + 'px',
            height: BUTTON_HEIGHT + 'px'
        };

        var masterVolumeButtonStyle = {
            top: OFFSET_TOP + 'px',
            right: OFFSET_SIDES*2 + BUTTON_SMALL_WIDTH + 'px',
            width: BUTTON_LARGE_WIDTH + 'px',
            height: BUTTON_HEIGHT + 'px'
        };

        return (
            <div className={classes.Layout}>
                <UserVolumeButton style={userVolumeButtonStyle} width={BUTTON_LARGE_WIDTH} height={BUTTON_HEIGHT} volume={(1.00).toFixed(2)}/>
                <EqualizerButton style={equalizerButtonStyle} width={BUTTON_SMALL_WIDTH} height={BUTTON_HEIGHT}/>
                <SettingsButton style={settingsButtonStyle} width={BUTTON_SMALL_WIDTH} height={BUTTON_HEIGHT}/>
            </div>
        );
    }
}

export default Layout;