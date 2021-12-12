import React from 'react';
import './sale.css';
import { compose } from 'recompose';

import GridViewIcon from '@mui/icons-material/GridView';

import { BaseComponent, IShellPage, ShellErrorHandler } from '../shellInterfaces';
import { Wallet } from '../wallet';
import { Shoefy } from '../contracts/shoefy';
import { TFunction, withTranslation, WithTranslation } from 'react-i18next';

import Countdown from "react-countdown";

import { withWallet } from '../walletContext';

import mark from '../../../src/images/mark.png';
import mark1 from '../../../src/images/mark1.png';
import FoxImg from '../../images/fox.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars } from '@fortawesome/free-solid-svg-icons';

import { NavLink, useLocation } from 'react-router-dom';

import { Footer } from './footer';

import '../shellNav.css';
import '../shellNav.icons.css';

export type DashboardProps = {
    pages: IShellPage[];
    wallet?: Wallet,
};
export type DashboardState = {
    currentPage?: IShellPage;
    shoefy?: Shoefy,
    address?: string,
    accountEllipsis?: string
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
                    <h3>{hours < 10 ? '0' + hours : hours}</h3>
                    <span>Hours</span>
                </div>
                <div>
                    <h3>{minutes < 10 ? '0' + minutes : minutes}</h3>
                    <span>Minutes</span>
                </div>
                <div>
                    <h3>{seconds < 10 ? '0' + seconds : seconds}</h3>
                    <span>Seconds</span>
                </div>
            </div>
        );
    }
};

class Dashboard extends BaseComponent<DashboardProps & WithTranslation, DashboardState> {
    constructor(props: DashboardProps) {
        super(props);

        this.connectWallet = this.connectWallet.bind(this);
        this.disconnectWallet = this.disconnectWallet.bind(this);
        this.updateOnce = this.updateOnce.bind(this);
    }

    async componentDidMount() {
        if (window.ethereum) {
            const accounts = await window.ethereum
                .request({ method: 'eth_accounts' })
            if (accounts.length == 0) console.log("User is not logged in to MetaMask");
            else {
                console.log(accounts[0])
                this.connectWallet();
            }
        }
        if ((window.ethereum || {}).selectedAddress) {
            this.connectWallet();
        }
    }

    async connectWallet() {
        try {
            this.updateState({ pending: true });
            // const wallet = new Wallet();
            const wallet = this.props.wallet;
            const result = await wallet.connect();

            if (!result) {
                throw 'The wallet connection was cancelled.';
            }

            const shoefy = new Shoefy(wallet);

            this.updateState({ shoefy: shoefy, wallet: wallet, looping: true, pending: false });
            this.updateOnce(true).then();
        }
        catch (e) {
            this.updateState({ pending: false });
            this.handleError(e);
        }
    }

    async disconnectWallet() {
        try {
            this.updateState({ pending: true });
            const result = await this.props.wallet.disconnect();
            if (result) {
                throw 'The wallet connection was cancelled.';
            }

            this.updateState({ nftStaking: null, wallet: null, address: null, looping: false, pending: false });
        }
        catch (e) {
            this.updateState({ pending: false });
            this.handleError(e);
        }
    }

    private async updateOnce(): Promise<boolean> {
        const shoefy = this.readState().shoefy;

        this.updateState({
            address: this.props.wallet._address,
            accountEllipsis: this.props.wallet._address ? `${this.props.wallet._address.substring(0, 4)}...${this.props.wallet._address.substring(this.props.wallet._address.length - 4)}` : '___'
        });

        return true;
    }

    handleError(error) {
        ShellErrorHandler.handle(error);
    }

    render() {
        const imgs = ["images/NFT-1.png", "images/NFT-2.png", "images/NFT-3.png", "images/NFT-4.png", "images/NFT-5.png", "images/NFT-6.png", "images/NFT-7.png"]

        const t: TFunction<"translation"> = this.readProps().t;
        const state = this.readState();

        let presaleTime = new Date('2022-12-12T00:00:00');
        let currentTime = new Date();

        const accountEllipsis = this.props.wallet._address ? `${this.props.wallet._address.substring(0, 4)}...${this.props.wallet._address.substring(this.props.wallet._address.length - 4)}` : '___';

        return (
            <div>
                <div className="navigation-wrapper">
                    <div className="logo-wrapper">
                        <a href="/home">
                            <img src={mark} className="img-logo" alt="ShoeFy Finance" />
                            <span className="font_logo">ShoeFy</span>
                        </a>
                        <button className="navbar-toggler" type="button" data-bs-target="#mainNav" data-bs-toggle="collapse"
                            aria-controls="navbarSupportedContent" aria-label="Toggle navigation" ref={this.collapseRef}>
                            <FontAwesomeIcon icon={faBars} />
                        </button>
                    </div>
                    <nav id="mainNav">
                        <ul className="navbar-nav">
                            <li className="nav_letter1"><NavLink className="link_letter" to="sales">Sales</NavLink></li>
                            <li className="nav_letter1"><NavLink className="link_letter" to="nftStaking">NFTs Staking</NavLink></li>
                            <li className="nav_letter"><NavLink className="link_letter" to="shoefyStaking">Shoe Staking</NavLink></li>
                            <li className="nav_letter"><NavLink className="link_letter" to="nftFarming">Farm</NavLink></li>
                            <li className="nav_letter"><NavLink className="link_letter" to="shoefyStaking2">Booster NFTs</NavLink></li>
                            <li className="nav_letter">
                                {this.props.wallet._address ?
                                    <div onClick={this.disconnectWallet} className="wallet-connect">
                                        {state.pending && <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true" > </span>}
                                        <span className="ih_rtext">{accountEllipsis}</span>
                                    </div>
                                    :
                                    <div onClick={this.connectWallet} className="wallet-connect">
                                        {state.pending && <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true" > </span>}
                                        <span className="ih_rtext">{t('staking.connect_wallet')}</span>
                                    </div>
                                }
                            </li>
                        </ul>
                    </nav>
                </div>
                <div className="content-wrapper">
                    <div className="part_c">
                        <div className="sale" style={{ backgroundImage: 'url(images/sale.svg)' }}>
                            <div style={{ width: '900px', margin: '0 auto', position: 'relative', paddingBottom: '100px' }} className="nfts">
                                <div className="image imageleft" style={{ width: "90px", position: "absolute", top: "130px", left: "100px" }}>
                                    <img src="/images/NFT-2.png" style={{ width: "100%" }} />
                                    <div className="star1">
                                        <img src="images/star.png" />
                                    </div>
                                    <div className="star2">
                                        <img src="images/star.png" />
                                    </div>
                                </div>
                                <div className="image imageright" style={{ width: "90px", position: "absolute", top: "130px", right: "100px" }}>
                                    <img src="/images/NFT-1.png" style={{ width: "100%" }} />
                                    <div className="star1">
                                        <img src="images/star.png" />
                                    </div>
                                    <div className="star2">
                                        <img src="images/star.png" />
                                    </div>
                                </div>
                                <div className="image imageleft" style={{ width: "180px", position: "absolute", bottom: "279px", left: "-40px" }}>
                                    <img src="/images/NFT-7.png" style={{ width: "100%" }} />
                                    <div className="star1">
                                        <img src="images/star.png" />
                                    </div>
                                    <div className="star2">
                                        <img src="images/star.png" />
                                    </div>
                                </div>
                                <div className="image imageright" style={{ width: "180px", position: "absolute", bottom: "279px", right: "-40px" }}>
                                    <img src="/images/NFT-5.png" style={{ width: "100%" }} />
                                    <div className="star1">
                                        <img src="images/star.png" />
                                    </div>
                                    <div className="star2">
                                        <img src="images/star.png" />
                                    </div>
                                </div>
                                <div className="saleamount">
                                    <span style={{ fontSize: "16px", marginRight: "15px", marginTop: "-5px" }}>PRICE</span>
                                    <span style={{ textShadow: "3px 3px purple" }}>4000 </span>
                                    <span>SHOE</span>
                                </div>
                                <div>
                                    <div style={{ display: "flex", justifyContent: "center", marginTop: "-10px" }}>
                                        {this.props.wallet._address ?
                                            <div onClick={this.disconnectWallet} className="wallet-connect1">
                                                {state.pending && <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true" > </span>}
                                                <span className="ih_rtext">{accountEllipsis}</span>
                                            </div>
                                            :
                                            <div onClick={this.connectWallet} className="wallet-connect1">
                                                {state.pending && <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true" > </span>}
                                                <span className="ih_rtext">{t('staking.connect_wallet')}</span>
                                            </div>
                                        }
                                    </div>
                                </div>
                                {/*<img src="images/Frame 1342.png" />*/}
                            </div>
                        </div>
                    </div>
                    <div className="part_f">
                        <Footer />
                    </div>
                </div>
            </div>
        );
    }
}

const DashboardWithTranlation = withTranslation()(Dashboard);

const DashboardMain = compose(
    withWallet,
)(DashboardWithTranlation);

export default DashboardMain