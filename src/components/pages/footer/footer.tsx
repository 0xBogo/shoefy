import React from 'react';
import './footer.css';

import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import PhotoCameraBackIcon from '@mui/icons-material/PhotoCameraBack';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

function Footer() {
    return (
        <div className="i_footer"> 
            <div className="if_left">
                <span className="ifl1">©</span>
                <span className="ifl2">ShoeFy</span>
                <span className="ifl1">All Rigjts Reserved</span>
            </div>
            <div className="if_right">
                <FacebookIcon className="ifr_icon" sx={{ fontSize: 20}}/>
                <PhotoCameraBackIcon className="ifr_icon" sx={{ fontSize: 20 }}/>
                <TwitterIcon className="ifr_icon" sx={{ fontSize: 20 }}/>
                <HelpOutlineIcon className="ifr_icon1" sx={{ fontSize: 20 }}/>
                <span>Help Center</span>
            </div>
        </div>
    );
}

export { Footer };