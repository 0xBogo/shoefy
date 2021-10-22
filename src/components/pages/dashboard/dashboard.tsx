import React from 'react';
import { compose } from 'recompose';
import './dashboard.css';

import { BaseComponent, IShellPage, ShellErrorHandler } from '../../shellInterfaces';
import { Shoefy } from '../../contracts/shoefy';
import { TFunction, withTranslation, WithTranslation } from 'react-i18next';
import { Wallet } from './wallet';
import { withWallet } from '../../walletContext';

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

class Dashboard extends BaseComponent<DashboardProps & WithTranslation, DashboardState> {

    constructor(props: DashboardProps) {
        super(props);

        this.connectWallet = this.connectWallet.bind(this);
        this.disconnectWallet = this.disconnectWallet.bind(this);
    }

    async componentDidMount() {
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

            this.loop().then();
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

    private async loop(): Promise<void> {
        const self = this;
        const cont = await self.updateOnce.call();

        if (cont) {
            this._timeout = setTimeout(async () => await self.loop.call(self), 1000);
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

    render() {
        const imgs = ["images/NFT-1.png", "images/NFT-2.png", "images/NFT-3.png", "images/NFT-4.png", "images/NFT-5.png", "images/NFT-6.png", "images/NFT-7.png"]

        const t: TFunction<"translation"> = this.readProps().t;
        const state = this.readState();

        const accountEllipsis = this.props.wallet._address ? `${this.props.wallet._address.substring(0, 4)}...${this.props.wallet._address.substring(this.props.wallet._address.length - 4)}` : '___';
        return (
            <div>
                <div className="back">
                    <div className="main">
                        {
                            imgs.map((data, i) => {
                                return (
                                    <div key={i} style={{ width: "120px", position: "absolute", top: "40px", left: "-60px" }}>
                                        <img src={data} style={{ width: "100%" }} />
                                        <div className="star1">
                                            <img src="images/star.png" />
                                        </div>
                                        <div className="star2">
                                            <img src="images/star.png" />
                                        </div>
                                    </div>
                                )
                            })
                        }<img src="images/main.png" style={{ position: "absolute", left: "50%", top: "0px", transform: "translate(-50% , 0%)", width: "650px" }} />
                    </div>
                    
                </div>
                <div style={{ position: "relative" }}>
                    <div className="title">SHOEFY LEGENDARY</div>
                    <div className="smalltext">Unleash the legendary SHOEFY that are being sealed.</div>
                    <div style={{ display: "flex", justifyContent: "center" }}>
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
            </div>
        );
    }
}

const DashboardWithTranlation = withTranslation()(Dashboard);

const DashboardMain = compose(
  withWallet,
)(DashboardWithTranlation);

export default DashboardMain