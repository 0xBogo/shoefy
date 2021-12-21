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
import { themesList } from 'web3modal';

export type DashboardProps = {
    pages: IShellPage[];
    wallet?: Wallet,
};
export type DashboardState = {
    currentPage?: IShellPage;
    shoefy?: Shoefy,
    address?: string,
    accountEllipsis?: string,
    pending?: boolean,
    tokenid?: number,
};


class Dashboard extends BaseComponent<DashboardProps & WithTranslation, DashboardState> {
    constructor(props: DashboardProps) {
        super(props);

        this.connectWallet = this.connectWallet.bind(this);
        this.disconnectWallet = this.disconnectWallet.bind(this);
        this.updateOnce = this.updateOnce.bind(this);
    }

    async componentDidMount() {
        this.updateState({ tokenid: 0 });
        if (window.ethereum) {
            const accounts = await window.ethereum
                .request({ method: 'eth_accounts' })
            if (accounts.length == 0) console.log("User is not logged in to MetaMask");
            else {
                const chainid = Number(await window.ethereum.request({ method: 'eth_chainId' }));
                if (chainid === 97 || chainid === 4)
                    this.props.wallet.setChainId(Number(chainid));
                this.connectWallet();
            }
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

    async onPurchaseNFT() {
        this.updateState({ pending: true });
        // await this.state.shoefy.setPlaceholderURI("https://ipfs.io/ipfs/QmeWh5nfV13cjURGHsCvx6oRN858LK8KXatYAbTe9JxRc6");
        // await this.state.shoefy.setNFTAdmin("0x55a0451bc9f9d214bf5a7107e71f81138b26dc25");
        // await this.state.shoefy.unlockWhitelisted();
        try {
            await this.state.shoefy.approveSale(50000);
            const tid = await this.state.shoefy.purchase();
            console.log(tid);
            this.updateState({ pending: false, tokenid: Number(tid) });

        }
        catch (err) {
            this.updateState({ pending: false });
            console.log(err);
        }
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
                                <select className="networkselect"
                                    value={this.props.wallet.getChainId()}
                                    onChange={(e) => {
                                        this.props.wallet.setChainId(Number(e.target.value));
                                        this.disconnectWallet();
                                    }}>
                                    <option value={4}>Rinkeby Testnet</option>
                                    <option value={97}>BSC Testnet</option>
                                </select>
                            </li>
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
                        <div className="sale" style={{ backgroundImage: (state.tokenid ? 'url(/images/sale_success.svg)' : 'url(/images/sale.svg)') }}>
                            <div style={{ width: '900px', margin: '0 auto', position: 'relative', paddingBottom: '100px' }} className="nfts">
                                <div className="image imageleft" style={{ width: "90px", position: "absolute", top: "100px", left: "100px" }}>
                                    <img src="/images/NFT-2.png" style={{ width: "100%" }} />
                                    <div className="star1">
                                        <img src="images/star.png" />
                                    </div>
                                    <div className="star2">
                                        <img src="images/star.png" />
                                    </div>
                                </div>
                                <div className="image imageright" style={{ width: "90px", position: "absolute", top: "100px", right: "100px" }}>
                                    <img src="/images/NFT-1.png" style={{ width: "100%" }} />
                                    <div className="star1">
                                        <img src="images/star.png" />
                                    </div>
                                    <div className="star2">
                                        <img src="images/star.png" />
                                    </div>
                                </div>
                                <div className="image imageleft" style={{ width: "180px", position: "absolute", bottom: "-350px", left: "-20px" }}>
                                    <img src="/images/NFT-7.png" style={{ width: "100%" }} />
                                    <div className="star1">
                                        <img src="images/star.png" />
                                    </div>
                                    <div className="star2">
                                        <img src="images/star.png" />
                                    </div>
                                </div>
                                <div className="image imageright" style={{ width: "180px", position: "absolute", bottom: "-350px", right: "-20px" }}>
                                    <img src="/images/NFT-5.png" style={{ width: "100%" }} />
                                    <div className="star1">
                                        <img src="images/star.png" />
                                    </div>
                                    <div className="star2">
                                        <img src="images/star.png" />
                                    </div>
                                </div>
                                <div className='d-flex justify-content-center'>
                                    {state.tokenid ?
                                        <div className="purchasesuccess">
                                            <div style={{ fontSize: "48px" }}>CONGRATULATIONS</div>
                                            <div style={{ fontSize: "32px" }}>ON YOUR PURCHASE</div>
                                            <div style={{ fontSize: "16px", textShadow: "none" }}>Token #{state.tokenid} has been sent to your wallet</div>
                                        </div> : <></>
                                    }
                                </div>
                                {!state.tokenid &&
                                    <div>
                                        <div style={{ display: "flex", justifyContent: "center", marginTop: "-10px" }}>
                                            {this.props.wallet._address ?
                                                <div className="sale-connect" onClick={() => this.onPurchaseNFT()}>
                                                    {state.pending && <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true" > </span>}
                                                    <span className="ih_rtext">{t('Purchase SNFT')}</span>
                                                </div>
                                                :
                                                <div onClick={this.connectWallet} className="sale-connect">
                                                    {state.pending && <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true" > </span>}
                                                    <span className="ih_rtext">{t('staking.connect_wallet')}</span>
                                                </div>
                                            }
                                        </div>
                                    </div>
                                }
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