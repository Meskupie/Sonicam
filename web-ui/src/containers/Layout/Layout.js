import React, {Component} from 'react';
import classes from './Layout.module.css';
import EqualizerButton from '../../components/UI/Buttons/EqualizerButton/EqualizerButton';

class Layout extends Component {
    render() {
        return (
            <div className={classes.Layout}>
                <EqualizerButton></EqualizerButton>
            </div>
        );
    }
}

export default Layout;