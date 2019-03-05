import React from 'react';
import classes from './Image.module.scss'
import Aux from '../../../../hoc/Aux/Aux';

//Where the face video/images will be displayed
//either when tracked, when adding new faces or when
//modifying a current tracked face

const person = (props) => {
    var posStyle = {
        left: props.posXY + 'px',
        top: props.posXY + 'px',
        width: props.widthHeight + 'px',
        height: props.widthHeight + 'px',
    }

    let image = null

    if (props.isBackground === true) {
        var backgroundStyle = {
            left: props.posXY + 'px',
            top: props.posXY + 'px',
            width: props.widthHeight - props.borderWidth * 2 + 'px',
            height: props.widthHeight - props.borderWidth * 2 + 'px',
            padding: props.borderWidth + 'px'
        }

        image =
            <svg style={backgroundStyle} className={classes.Background} width="230px" height="230px" viewBox="0 0 230 230" version="1.1" xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink">
                <defs>
                    <circle id="path-1" cx="115" cy="115" r="115"></circle>
                </defs>
                <g id="Symbols" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                    <g id="Oval">
                        <mask id="mask-2" fill="white">
                            <use href="#path-1"></use>
                        </mask>
                        <g></g>
                        <path d="M172.992949,119.508609 L271.76028,220.739327 C273.41324,222.311136 273.41324,224.851525 271.76028,226.420741 L172.992949,327.496575 C171.339989,329.310549 168.660011,329.512777 167.007051,327.940969 L68.2397202,226.710251 C66.5867599,224.893684 66.5867599,221.944636 68.2397202,220.130661 L167.007051,119.054828 C168.660011,117.485612 171.339989,117.692043 172.992949,119.508609 Z" id="Rectangle" fill="#25266C" mask="url(#mask-2)"></path>
                        <path d="M99.9929494,137.508609 L198.76028,238.739327 C200.41324,240.311136 200.41324,242.851525 198.76028,244.420741 L99.9929494,345.496575 C98.3399891,347.310549 95.6600109,347.512777 94.0070506,345.940969 L-4.76027977,244.710251 C-6.41324008,242.893684 -6.41324008,239.944636 -4.76027977,238.130661 L94.0070506,137.054828 C95.6600109,135.485612 98.3399891,135.692043 99.9929494,137.508609 Z" id="Rectangle" fill="#25266C" mask="url(#mask-2)"></path>
                        <rect id="Rectangle" fill="#25266C" mask="url(#mask-2)" x="23" y="185" width="163" height="138"></rect>
                        <circle fill="#25266C" mask="url(#mask-2)" cx="103" cy="76" r="19"></circle>
                    </g>
                </g>
            </svg>
    }
    else {
        image = <img alt="POI Video Feed" src={props.imgSource} className={classes.Image} style={posStyle} />
    }

    return (
        <div onMouseDown={props.clicked} onMouseUp={props.onMouseUp}>
            {image}
        </div>
    );
}

export default person;