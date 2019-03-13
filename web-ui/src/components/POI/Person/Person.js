import React from 'react';
import classes from './Person.module.css'
import Image from './Image/Image'
import Volume from './Volume/Volume'
import Aux from '../../../hoc/Aux/Aux';
import Text from './Text/Text';
import SoundStatus from './SoundStatus/SoundStatus'

const person = (props) => {
    let TextStatusContainerStyle = null;

    let personClass = [];
    personClass.push(classes.Person);


    var posStyle = {
        left: props.posX + 'px',
        top: props.posY + 'px',
        height: props.widthHeight + 'px',
        width: props.widthHeight + 'px',
    }

    if(!props.shouldRefresh && !props.isHeld){
        TextStatusContainerStyle={
            opacity: "0"
        }
    }

    let volume = null;

    if (props.volumeState != null) {
        volume = (
            <Aux>
                <Volume
                    widthHeight={props.widthHeight}
                    volume={3}
                    volumeWidth={props.volumeWidth}
                    voulumeSpacing={props.voulumeSpacing}
                    type={"background"}
                    status={props.volumeState}
                    isMuted={props.isMuted}
                />
                <Volume
                    widthHeight={props.widthHeight}
                    volume={props.normalizerVolume}
                    volumeWidth={props.volumeWidth}
                    voulumeSpacing={props.voulumeSpacing}
                    type={"normalizer"}
                    status={props.volumeState}
                    isMuted={props.isMuted}
                />
                <Volume
                    widthHeight={props.widthHeight}
                    volume={props.multiplierVolume}
                    volumeWidth={props.volumeWidth}
                    voulumeSpacing={props.voulumeSpacing}
                    type={"multiplier"}
                    status={props.volumeState}
                    isMuted={props.isMuted}
                />
            </Aux>
            );
    }

    return (

        <div className={personClass.join(' ')} style={posStyle}>
            <div className={classes.PersonContainer}>
                {volume}
                <Image
                    posXY={(props.widthHeight - props.imgWidthHeight) / 2}
                    widthHeight={props.imgWidthHeight}
                    imgSource={props.imgSource}
                    onClick={props.onClick}
                    onMouseUp={props.onMouseUp}
                    onMouseOut={props.onMouseOut}
                    onDoubleClick={props.onDoubleClick}
                    isSelected={props.isSelected}
                    isBackground={props.isBackground}
                    borderWidth={props.borderWidth}
                    shouldRefresh={props.shouldRefresh}
                    isHeld={props.isHeld}
                    status={props.volumeState}
                />
            </div>
            <div style={TextStatusContainerStyle} className={classes.TextStatusContainer}>
            <Text
                isSelected={props.isSelected}
                name={props.name}
                isHeld={props.isHeld}
            />
            <SoundStatus
                status={props.volumeState}
                isMuted={props.isMuted}
            />
            </div>
        </div>
    );
}

export default person;