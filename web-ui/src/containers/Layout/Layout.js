import React, {PureComponent} from 'react';
import classes from './Layout.module.scss';
import EqualizerButton from '../../components/UI/Buttons/EqualizerButton/EqualizerButton';
import UserVolumeButton from '../../components/UI/Buttons/UserVolumeButton/UserVolumeButton';
import SettingsButton from '../../components/UI/Buttons/SettingsButton/SettingsButton';
import MasterVolumeButton from '../../components/UI/Buttons/MasterVolumeButton/MasterVolumeButton';

class Layout extends PureComponent {
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

        let userVolume = null;

        const POI = this.props.POIs.find(x => x.id === this.props.selectedPOI)
        
        if(POI !== null && POI !== undefined){
            userVolume = POI.volumeMultiplier
        }

        return (
            <div className={classes.Layout} style={buttonContainerStyle}>
                <UserVolumeButton 
                    params={buttonParameters} 
                    volume={userVolume}
                    clickedPlus={(event) => this.props.userVolumeMouseDownHandler(event, 'up')}
                    clickedMinus={(event) => this.props.userVolumeMouseDownHandler(event, 'down')}
                    onPointerUpOrOut={(event) => this.props.userVolumeMouseUpOrOutHandler(event)}/>
                <EqualizerButton params={buttonParameters}/>
                <MasterVolumeButton 
                    params={buttonParameters}
                    changed={(event) => this.props.masterVolumeChangeHandler(event)}
                    volume={this.props.masterVolume * 100}/>
                <SettingsButton 
                    params={buttonParameters}
                    clicked={(event) => this.props.settingsButtonClickedHandler(event)}/>
            </div>
        );
    }
}

export default Layout;