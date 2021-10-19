import * as React from 'react';

import { NavLink, useLocation } from 'react-router-dom';
import { BaseComponent, IShellPage, ShellErrorHandler } from './shellInterfaces';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { TFunction, withTranslation, WithTranslation } from 'react-i18next';
import { supportedLanguages, languageCodeOnly } from '../i18n';
import Collapsible from 'react-collapsible';
import './shellNav.css';
import './shellNav.icons.css';
import { Wallet } from './wallet';
import { ShoefyNFTStaking } from './contracts/nftStaking';

import CachedIcon from '@mui/icons-material/Cached';
import AppsIcon from '@mui/icons-material/Apps';
import InputIcon from '@mui/icons-material/Input';

import mark from '../../src/images/mark.png';
import mark1 from '../../src/images/mark1.png';
import FoxImg from '../images/fox.png';

import { Shoefy } from './contracts/shoefy';

export type ShellNavProps = {
	pages: IShellPage[];
};
export type ShellNavState = {
	currentPage?: IShellPage;
	wallet?: Wallet,
	shoefy?: Shoefy,
	address?: string,
};

class ShellNav extends BaseComponent<ShellNavProps & WithTranslation, ShellNavState> {
	private collapseRef = React.createRef<HTMLButtonElement>();
	constructor(props: ShellNavProps & WithTranslation) {
		super(props);

		this.connectWallet = this.connectWallet.bind(this);
	}

	toggleMenu = (e) => {
		if (window.innerWidth < 990)
			this.collapseRef.current.click();
	}

	collapsedNavItem(title) {
		return <li className="sudo-nav-link">
			<a href="" className={`d-flex justify-content-between nav-item ${title.toLowerCase()}`}>
				<p>{title}</p>
				<p>▼</p>
			</a>
		</li>
	}

	expandedNavItem(title) {
		return <li className="sudo-nav-link">
			<a href="" className={`d-flex justify-content-between nav-item ${title.toLowerCase()}`}>
				<p>{title}</p>
				<p>▲</p>
			</a>
		</li>
	}

	checkCurrentRoute() {
		const location = window.location;

		console.log(location);

		if (location.pathname == "/launch" || location.pathname == "/lock" || location.pathname == "/swap" || location.pathname == "/liquidity") {
			return true;
		}
		return false;
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

	handleError(error) {
		ShellErrorHandler.handle(error);
	}

	render() {
		const pages: IShellPage[] = (this.readProps().pages || []);
		const t: TFunction<"translation"> = this.readProps().t;
		const i18n = this.readProps().i18n;

		const pages1 = pages.slice(0, 2);
		const pages2 = pages.slice(3, 7);

		const state = this.readState();

		return (
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
						<li className="nav_letter1"><NavLink className="link_letter" to="nftStaking">NFTs Staking</NavLink></li>
						<li className="nav_letter"><NavLink className="link_letter" to="shoefyStaking">Shoe Staking</NavLink></li>
						<li className="nav_letter"><NavLink className="link_letter" to="nftFarming">Farm</NavLink></li>
						<li className="nav_letter"><NavLink className="link_letter" to="shoefyStaking2">Booster NFTs</NavLink></li>
						<li className="nav_letter">
							{state.address ?
								<div onClick={this.disconnectWallet} className="wallet-connect">
									{state.pending && <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true" > </span>}
									<span className="ih_rtext">{t('staking.disconnect_wallet')}</span>
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
		)
	}
}

export default withTranslation()(ShellNav);
