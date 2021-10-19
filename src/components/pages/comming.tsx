import React from 'react';
import './comming.css';

import GridViewIcon from '@mui/icons-material/GridView';

import { BaseComponent, IShellPage, ShellErrorHandler } from '../shellInterfaces';
import { Wallet } from '../wallet';
import { Shoefy } from '../contracts/shoefy';
import { TFunction, withTranslation, WithTranslation } from 'react-i18next';

import Countdown from "react-countdown";

export type DashboardProps = {
    pages: IShellPage[];
};
export type DashboardState = {
    currentPage?: IShellPage;
    wallet?: Wallet,
    shoefy?: Shoefy,
    address?: string,
};

const renderer = ({ hours, minutes, seconds, completed }) => {
  if (completed) {
    // Render a complete state
    return <span>...</span>;
  } else {
    // Render a countdown
    return (
        <div className="countdown">
        	<div>
	        	<h3>00{/*{hours < 10 ? '0'+hours : hours }*/}</h3>
	        	<span>Days</span>
        	</div>
        	<div>
	        	<h3>{hours < 10 ? '0'+hours : hours }</h3>
	        	<span>Hours</span>
        	</div>
        	<div>
	        	<h3>{minutes < 10 ? '0'+minutes : minutes }</h3>
	        	<span>Seconds</span>
        	</div>
        	<div>
	        	<h3>{seconds < 10 ? '0'+seconds : seconds }</h3>
	        	<span>Minutes</span>
        	</div>
      	</div>
    );
  }
};

class Dashboard extends BaseComponent<DashboardProps & WithTranslation, DashboardState> {
    constructor(props: DashboardProps) {
        super(props);
    }

    render() {
        const imgs = ["images/NFT-1.png", "images/NFT-2.png", "images/NFT-3.png", "images/NFT-4.png", "images/NFT-5.png", "images/NFT-6.png", "images/NFT-7.png"]

        const t: TFunction<"translation"> = this.readProps().t;
        const state = this.readState();

        let presaleTime = new Date('2022-12-12T00:00:00');
  		let currentTime = new Date();

        return (
            <div className="comming" style={{backgroundImage:'url(images/Frame1342.png)'}}>
                <div style={{ width: '55%', margin: '0 auto', position: 'relative', paddingBottom: '100px'}}>
                	<div className="image imageleft" style={{ width: "120px", position: "absolute", top: "80px", left: "50px" }}>
                        <img src="/images/NFT-2.png" style={{ width: "100%" }} />
                        <div className="star1">
                            <img src="images/star.png" />
                        </div>
                        <div className="star2">
                            <img src="images/star.png" />
                        </div>
                    </div>
                    <div className="image imageright" style={{ width: "120px", position: "absolute", top: "80px", right: "50px" }}>
                        <img src="/images/NFT-1.png" style={{ width: "100%" }} />
                        <div className="star1">
                            <img src="images/star.png" />
                        </div>
                        <div className="star2">
                            <img src="images/star.png" />
                        </div>
                    </div>
                    <div className="image imageleft" style={{ width: "240px", position: "absolute", bottom: "0", left: "-100px" }}>
                        <img src="/images/NFT-7.png" style={{ width: "100%" }} />
                        <div className="star1">
                            <img src="images/star.png" />
                        </div>
                        <div className="star2">
                            <img src="images/star.png" />
                        </div>
                    </div>
                    <div className="image imageright" style={{ width: "240px", position: "absolute", bottom: "0", right: "-100px" }}>
                        <img src="/images/NFT-5.png" style={{ width: "100%" }} />
                        <div className="star1">
                            <img src="images/star.png" />
                        </div>
                        <div className="star2">
                            <img src="images/star.png" />
                        </div>
                    </div>
                    <div className="comingtitle">COMING SOON</div>
                    <div>
                    	<Countdown date={presaleTime} renderer={renderer} />
                    </div>
                    {/*<img src="images/Frame 1342.png" />*/}
                </div>
            </div>
        );
    }
}

export default withTranslation()(Dashboard);