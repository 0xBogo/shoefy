import React from 'react';
import './dashboard.css';

import { BaseComponent, IShellPage, ShellErrorHandler } from '../../shellInterfaces';
import { Wallet } from '../../wallet';
import { Shoefy } from '../../contracts/shoefy';
import { TFunction, withTranslation, WithTranslation } from 'react-i18next';

export type DashboardProps = {
    pages: IShellPage[];
};
export type DashboardState = {
    currentPage?: IShellPage;
    wallet?: Wallet,
    shoefy?: Shoefy,
    address?: string,
};

class Dashboard extends BaseComponent<DashboardProps & WithTranslation, DashboardState> {

    constructor(props: DashboardProps) {
        super(props);

        this.connectWallet = this.connectWallet.bind(this);
        this.disconnectWallet = this.disconnectWallet.bind(this);
    }

    async connectWallet() {
        try {
            this.updateState({ pending: true });
            const wallet = new Wallet();
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
            const result = await this.state.wallet.disconnect();
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
        const cont = await self.updateOnce.call(self);

        if (cont) {
            this._timeout = setTimeout(async () => await self.loop.call(self), 1000);
        }
    }
    private async updateOnce(resetCt?: boolean): Promise<boolean> {
        const shoefy = this.readState().shoefy;

        if (!!shoefy) {
            try {
                await shoefy.refresh();
                if (!this.readState().looping) {
                    return false;
                }
                this.updateState({
                    address: shoefy.wallet.currentAddress,
                    balance: shoefy.balance,
                    stakedBalance: shoefy.stakedBalance,
                    pendingRewards: shoefy.pendingStakeRewards,
                    apr: shoefy.apr
                });

                if (resetCt) {
                    this.updateState({
                        ctPercentageStake: 0,
                        ctValueStake: 0,
                        ctPercentageUnstake: 0,
                        ctValueUnstake: 0
                    })
                }

            }
            catch (e) {
                console.warn('Unable to update staking status', e);
            }
        }
        else {
            return false;
        }

        return true;
    }

    render() {
        const imgs = ["images/NFT-1.png", "images/NFT-2.png", "images/NFT-3.png", "images/NFT-4.png", "images/NFT-5.png", "images/NFT-6.png", "images/NFT-7.png"]

        const t: TFunction<"translation"> = this.readProps().t;
        const state = this.readState();

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
                        {state.address &&
                            <div onClick={this.disconnectWallet} className="wallet-connect1">
                                {state.pending && <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true" > </span>}
                                <span className="ih_rtext">{t('staking.disconnect_wallet')}</span>
                            </div>
                        }
                        {!state.address &&
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

export default withTranslation()(Dashboard);
