import React, {Component} from 'react';
import classes from './Layout.module.css';
import EqualizerButton from '../../components/UI/Buttons/EqualizerButton/EqualizerButton';
import UserVolumeButton from '../../components/UI/Buttons/UserVolumeButton/UserVolumeButton';
import SettingsButton from '../../components/UI/Buttons/SettingsButton/SettingsButton';
import MasterVolumeButton from '../../components/UI/Buttons/MasterVolumeButton/MasterVolumeButton';

//all constants should be imported from a global file
const OFFSET_TOP = 50;
const OFFSET_SIDES = 50;
const SPACING = 50;
const BUTTON_HEIGHT = 180;
const BUTTON_SMALL_WIDTH = 180;
const BUTTON_LARGE_WIDTH = 560;

class Layout extends Component {
    render() {
        
        let buttonParameters = {
            offsetTop: OFFSET_TOP,
            offsetSides: OFFSET_SIDES,
            spacing: SPACING,
            buttonHeight: BUTTON_HEIGHT,
            buttonSmallWidth: BUTTON_SMALL_WIDTH,
            buttonLargeWidth: BUTTON_LARGE_WIDTH
        };

        console.log(buttonParameters);

        return (
            <div className={classes.Layout}>
                <UserVolumeButton params={buttonParameters} volume={(1.00).toFixed(2)}/>
                <EqualizerButton params={buttonParameters}/>
                <MasterVolumeButton params={buttonParameters}/>
                <SettingsButton params={buttonParameters}/>
            </div>
        );
    }
}

export default Layout;