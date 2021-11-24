import * as React from 'react';
import * as numeral from 'numeral';
import { compose } from 'recompose';

import { BaseComponent, ShellErrorHandler } from '../shellInterfaces';
import { Wallet } from '../wallet';
import { withWallet } from '../walletContext';

import { Shoefy } from '../contracts/shoefy';
import { WithTranslation, withTranslation, TFunction, Trans } from 'react-i18next';
import { fadeInLeft, fadeInRight, pulse } from 'react-animations';
import styled, { keyframes } from 'styled-components';
import AnimatedNumber from 'animated-number-react';
import { NotificationContainer, NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';

import SearchIcon from '@mui/icons-material/Search';
import SettingsIcon from '@mui/icons-material/Settings';
import NotificationsIcon from '@mui/icons-material/Notifications';
import './stakingComponent.css';

import mark_circle from "../../images/mark_circle.png"
import down from "../../images/down.png"

import mark from '../../../src/images/mark.png';
import mark1 from '../../../src/images/mark1.png';
import FoxImg from '../../images/fox.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars } from '@fortawesome/free-solid-svg-icons';

import { NavLink, useLocation } from 'react-router-dom';

import { Footer } from './footer';

import '../shellNav.css';
import '../shellNav.icons.css';

export type StakingProps = {};
export type StakingState = {
	shoefy?: Shoefy,
	wallet?: Wallet,
	looping?: boolean,

	// actual set values
	address?: string,
	balance?: number,
	balance_eth?: number,
	stakedBalance?: number,
	stakedBalance2?: number,
	locktime?: number,
	pendingRewards?: number,
	apr?: number,
	allowance : number,
	allowance2 : number,

	// values pending to be set
	ctPercentageStake?: number,
	ctValueStake?: number,
	ctValueStake2?: number,
	ctPercentageUnstake?: number,
	ctValueUnstake?: number,
	ctValueUnstake2?: number,
	pending?: boolean,

	approveFlag: boolean,
	approveFlag1: boolean
};

const FadeInLeftAnimation = keyframes`${fadeInLeft}`;
const FadeInLeftDiv = styled.div`
  animation: ease-out 0.8s ${FadeInLeftAnimation};
`;
const FadeInRightAnimation = keyframes`${fadeInRight}`;
const FadeInRightDiv = styled.div`
  animation: ease-out 0.8s ${FadeInRightAnimation};
`;
const PulseAnimation = keyframes`${pulse}`;
const PulseDiv = styled.div`
  animation: infinite 5s ${PulseAnimation};
`;

class StakingComponent extends BaseComponent<StakingProps & WithTranslation, StakingState> {

	private _timeout: any = null;

	constructor(props: StakingProps & WithTranslation) {
		super(props);

		this.handleStakeSlider = this.handleStakeSlider.bind(this);
		this.handleUnstakeSlider = this.handleUnstakeSlider.bind(this);
		this.handleInputStake = this.handleInputStake.bind(this);
		this.handleInputUnstake = this.handleInputUnstake.bind(this);
		this.connectWallet = this.connectWallet.bind(this);
		this.disconnectWallet = this.disconnectWallet.bind(this);
		this.state = {
			approveFlag: false,
			approveFlag1: false,
		};
	}

	handleStakeSlider(event) {
		this.setStakePercentage(event.target.value);
	}
	handleUnstakeSlider(event) {
		this.setUnstakePercentage(event.target.value);
	}
	handleInputStake(type, event) {
		this.setStakeValue(type, event.target.value);
	}
	handleInputUnstake(event) {
		this.setUnstakeValue(event.target.value);
	}
	handleInputUnstake2(event) {
		this.setUnstakeValue2(event.target.value);
	}
	handleError(error) {
		ShellErrorHandler.handle(error);
	}

	async confirmStake(step): Promise<void> {
		if (step >= 0) {
			try {
				const state = this.readState();

				this.updateState({ pending: true });

				if (state.ctValueStake >= 0) {
					console.log("ctVa:", state.ctValueStake);
					await state.shoefy.stake2(state.ctValueStake, step);

					document.getElementById('modalswitch2').click();
				}
				else {
					NotificationManager.warning("Can't stake a negative amount.");
					return;
				}

				this.updateState({ pending: false });
				this.updateOnce(true).then();
			}
			catch (e) {
				this.updateState({ pending: false });
				this.handleError(e);
			}
		} else {
			try {
				const state = this.readState();
				this.updateState({ pending: true });

				if (state.ctValueStake >= 0) {
					//console.log("ctVa:", state.ctValueStake);
					await state.shoefy.stake(state.ctValueStake);

					document.getElementById('modalswitch2').click();
				}
				else {
					NotificationManager.warning("Can't stake a negative amount.");
					return;
				}

				this.updateState({ pending: false });
				this.updateOnce(true).then();
			}
			catch (e) {
				this.updateState({ pending: false });
				this.handleError(e);
			}
		}
	}

	async confirmUnstake(step): Promise<void> {
		try {
			const state = this.readState();
			this.updateState({ pending: true });

			if (Number(state.ctValueUnstake) >= 0) {
				if (step === -1)
					await state.shoefy.unstakeAndClaim(state.ctValueUnstake);
				else
					await state.shoefy.withdraw(state.ctValueUnstake);
				document.getElementById('modalswitch3').click();
			}
			else {
				NotificationManager.warning("Can't unstake a negative amount.");
				return;
			}

			this.updateState({ pending: false });
			this.updateOnce(true).then();
		}
		catch (e) {
			this.updateState({ pending: false });
			this.handleError(e);
		}
	}

	async confirmClaim(): Promise<void> {
		try {
			const state = this.readState();
			this.updateState({ pending: true });

			await state.shoefy.claim();

			this.updateState({ pending: false });
			this.updateOnce(true).then();
		}
		catch (e) {
			this.updateState({ pending: false });
			this.handleError(e);
		}
	}

	async confirmApprove(step): Promise<void> {
		try {
			const state = this.readState();
			this.updateState({ pending: true });
			let flag;
			let temp = "115792089237316195423570985008687907853269984665640564039457584007913129639935";
			if (step >= 0) {
				flag = await state.shoefy.approve2(temp);
				this.updateState({ pending: false, approveFlag1: flag.status });
			}
			else {
				flag = await state.shoefy.approve(temp);
				this.updateState({ pending: false, approveFlag: flag.status });
			}
		}
		catch (e) {
			this.updateState({ pending: false });
			this.handleError(e);
		}
	}

	componentWillUnmount() {
		if (!!this._timeout) {
			clearTimeout(this._timeout);
		}
		this.updateState({ shoefy: null, looping: false });
	}

	async componentDidMount() {
		if ((window.ethereum || {}).selectedAddress) {
			this.connectWallet();
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
				if (resetCt) {
					this.updateState({
						ctPercentageStake: 0,
						ctValueStake: 0,
						ctValueStake2: 0,
						ctPercentageUnstake: 0,
						ctValueUnstake: 0,
						address: this.props.wallet._address,
						balance: shoefy.balance,
						stakedBalance: shoefy.stakedBalance,
						stakedBalance2: shoefy.stakedBalance2,
						allowance : shoefy.allowance,
						allowance2 : shoefy.allowance2,
						locktime: shoefy.locktime,
						pendingRewards: shoefy.pendingStakeRewards,
						apr: shoefy.apr
					})
				} else {
					this.updateState({
						address: this.props.wallet._address,
						balance: shoefy.balance,
						stakedBalance: shoefy.stakedBalance,
						stakedBalance2: shoefy.stakedBalance2,
						allowance : shoefy.allowance,
						allowance2 : shoefy.allowance2,
						locktime: shoefy.locktime,
						pendingRewards: shoefy.pendingStakeRewards,
						apr: shoefy.apr
					});
				}
				console.log(this.state.stakedBalance2, this.state.locktime);
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

	async connectWallet() {
		try {
			this.updateState({ pending: true });
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

			this.updateState({
				ctPercentageStake: 0,
				ctValueStake: 0,
				ctPercentageUnstake: 0,
				ctValueUnstake: 0,
				shoefy: null,
				wallet: null,
				address: null,
				looping: false,
				pending: false,
				balance: 0,
				stakedBalance: 0,
				apr: 0
			});
		}
		catch (e) {
			this.updateState({ pending: false });
			this.handleError(e);
		}
	}

	setStakePercentage(type, percent) {
		const r = this.readState().shoefy;
		if (!r) return;

		const p = Math.max(0, Math.min(+(percent || 0), 100));
		const v = Math.min(((r.balance) * (p * 0.01)), (r.balance * 1));
		if (type == 1)
			this.updateState({
				ctPercentageStake: p,
				ctValueStake: v,
			});
		if (type == 2)
			this.updateState({
				ctPercentageStake: p,
				ctValueStake2: v,
			});
	}

	setUnStakePercentage(percent) {
		const r = this.readState().stakedBalance;
		if (!r) return;

		const p = Math.max(0, Math.min(+(percent || 0), 100));
		const v = Math.min(((r) * (p * 0.01)), (r * 1));

		this.updateState({
			ctValueUnstake: v,
		});
	}

	setUnStake2Percentage(percent) {
		const r = this.readState().stakedBalance2;
		if (!r) return;

		const p = Math.max(0, Math.min(+(percent || 0), 100));
		const v = Math.min(((r) * (p * 0.01)), (r * 1));

		this.updateState({
			ctValueUnstake2: v,
		});
	}

	setStakeValue(type, value) {
		const r = this.readState().shoefy;
		if (!r) return;

		const t = r.balance;
		const v = Math.max(0, Math.min(+(value || 0), r.balance));
		if (type == 1)
			this.updateState({
				ctPercentageStake: Math.floor(100 * v / t),
				ctValueStake: v,
			});
		if (type == 2)
			this.updateState({
				ctPercentageStake: Math.floor(100 * v / t),
				ctValueStake2: v,
			});
	}


	setUnstakeValue(value) {
		const v = Math.max(0, value);
		this.updateState({
			ctValueUnstake: v,
		});
	}

	setUnstakeValue2(value) {
		const v = Math.max(0, value);
		this.updateState({
			ctValueUnstake2: v,
		});
	}

	show_detail(index) {
		if (this.state['flag' + index] == false)
			this.setState({ ['flag' + index]: true });
		else {
			this.setState({ ['flag' + index]: false });
		}
	}

	render() {
		let detail = ['0px', '0px', '0px', '0px'];
		for (let i = 0; i < 4; i++) {
			if (this.state['flag' + i] == false) {
				detail[i] = ''
			} else {
				detail[i] = '0px'
			}
		}

		const state = this.readState();
		const t: TFunction<"translation"> = this.readProps().t;

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
						<div className="staking-container">
							<div className="container">
								<div className="row staking-body mt-5">
									<FadeInLeftDiv className="col-md-12 d-flex">
										<div className="shadow d-flex flex-column flex-fill gradient-card primary user-info">
											<h1 className="user-info-title">Your Info</h1>
											<div className="user-info-body">
												<div className="infoitem">
													<h2>{t('staking.your_info.wallet_address')}</h2>
													<span style={{ wordBreak: 'break-all' }}>{accountEllipsis}</span>
												</div>
												<div className="infoitem">
													<h2>{t('staking.your_info.tradeable')}</h2>
													<AnimatedNumber
														value={numeral(state.balance || 0).format('0.00')}
														duration="1000"
														formatValue={value => `${Number(parseFloat(value).toFixed(2)).toLocaleString('en', { minimumFractionDigits: 2 })}`}
														className="staking-info"
													>
														0 ShoeFy
													</AnimatedNumber>
												</div>
												<div className="infoitem">
													<h2>{t('staking.your_info.staked')}</h2>
													<AnimatedNumber
														value={numeral(state.stakedBalance + state.stakedBalance2 || 0).format('0.00')}
														duration="1000"
														formatValue={value => `${Number(parseFloat(value).toFixed(2)).toLocaleString('en', { minimumFractionDigits: 2 })}`}
														className="staking-info"
													>
														0 ShoeFy
													</AnimatedNumber>
												</div>
												<div className="infoitem">
													<h2>{t('staking.your_info.pending_rewards')}</h2>
													<AnimatedNumber
														value={numeral(state.pendingRewards || 0).format('0.00')}
														duration="1000"
														formatValue={value => `${Number(parseFloat(value).toFixed(2)).toLocaleString('en', { minimumFractionDigits: 2 })}`}
														className="staking-info"
													>
														0 Shoefy
													</AnimatedNumber>
												</div>
												<div className="infoitem">
													<h2>{t('staking.your_info.apr')}</h2>
													<AnimatedNumber
														value={numeral(state.apr || 0).format('0.00')}
														duration="1000"
														formatValue={value => `${Number(parseFloat(value).toFixed(2)).toLocaleString('en', { minimumFractionDigits: 2 })}%`}
														className="staking-info"
													>
														0 Shoefy
													</AnimatedNumber>
												</div>
											</div>
										</div>
									</FadeInLeftDiv>
									<FadeInRightDiv className="your_staking">
										<div className="each_element" style={{ transition: '0.3s' }}>
											<div className="each_up" style={{ height: '120px' }}>
												<div className="stake_1">
													<img src={mark_circle} width="72px" height="72px" />
												</div>
												<div className="nftdetail">
													<div className="stake2" >
														<div className="s2_up" >SHOE </div>
														<div className="s2_down" style={{ width: "150px" }}>Flexible Time</div>
													</div>
													<div className="stake1">
														<div className="s2_up">APR</div>
														<div className="s2_down">{state.apr}%</div>
													</div>
													<div className="stake2">
														<div className="s2_up">Token Cap (SHOE)</div>
														<div className="s2_down">100,000</div>
													</div>
													<div className="stake2">
														<div className="s2_up">Rewards Given</div>
														<div className="s2_down">123,288.9041</div>
													</div>
												</div>
												<div className="stake3" onClick={() => this.show_detail(0)}>
													Detail<img src={down} width="14px" height="8px"></img>
												</div>
											</div>
											<div className="each_down" style={{ maxHeight: detail[0], overflow: 'hidden' }}>
												<div className="col-md-11 d-flex">
													<div className="shadow d-flex flex-column flex-fill gradient-card ">
														<div style={{ margin: "-20px" }}>
															<div className="tab-content stake-tab-content">
																<div role="tabpanel" className="tab-pane active" id="ctl-stake">
																	<form id="staking-form">
																		<label className="form-label">{t('staking.stake.amount')}</label>
																		<div className="maxValue">
																			<input type="number" className="form-control form-control-lg" disabled={state.pending} onChange={(event) => this.handleInputStake(1, event)} value={state.ctValueStake || 0} />
																			<button className="btn btn-sm max-btn" onClick={() => this.setStakePercentage(1, 100)} type="button">MAX</button>
																		</div>
																		<div className="d-flex justify-content-center button-row margin_top">
																			{
																				this.state.allowance >= this.state.stakedBalance ?
																					<button className="btn btn-md link-dark" style={{ width: '100%', backgroundColor: "#CF3279", margin: 0, color: "white" }} disabled={state.ctValueStake <= 0 || state.pending} type="button" onClick={async () => this.confirmStake(-1)}>Stake</button> :
																					<button className="btn btn-md link-dark" style={{ width: '100%', backgroundColor: "#CF3279", margin: 0, color: "white" }} type="button" onClick={async () => this.confirmApprove(-1)}>Approve</button>
																			}
																		</div>
																	</form>
																</div>
																<div role="tabpanel" className="tab-pane active" id="ctl-unstake">
																	<form id="unstaking-form">
																		<label className="form-label">{t('staking.unstake.amount')}</label>
																		<div className="maxValue">
																			<input type="number" className="form-control form-control-lg" disabled={state.pending} onChange={this.handleInputUnstake} value={state.ctValueUnstake || 0} />
																			<button className="btn btn-sm max-btn" onClick={() => this.setUnStakePercentage(100)} type="button">MAX</button>
																		</div>
																		<div className="d-flex justify-content-center button-row margin_top">
																			<button className="btn btn-md link-dark" style={{ width: '100%', backgroundColor: "#CF3279", margin: 0, color: "white" }} disabled={state.ctValueUnstake <= 0 || state.pending} type="button" onClick={async () => this.confirmUnstake(-1)}>{t('staking.unstake.title')}</button>
																		</div>
																	</form>
																</div>
																<div role="tabpanel" className="tab-pane active" id="ctl-unstake">
																	<form id="unstaking-form">
																		<div style={{ display: "flex", }}>
																			<label className="form-label" style={{ paddingTop: "12px", paddingRight: "20px" }}>Total Rewards</label>
																			<h1 className="form-label total-amount">0.00</h1>
																		</div>
																		<div className="d-flex justify-content-center button-row margin_top">
																			<button className="btn btn-md link-dark" style={{ width: '100%', backgroundColor: "#B1B5C3", color: 'white' }} type="button" onClick={async () => this.confirmClaim()}>Claim</button>
																		</div>
																	</form>
																</div>
															</div>
														</div>
													</div>
												</div>
											</div>
										</div>
									</FadeInRightDiv>
									<FadeInRightDiv className="your_staking">
										<div className="each_element" style={{ transition: '0.3s' }}>
											<div className="each_up" style={{ height: '120px' }}>
												<div className="stake_1">
													<img src={mark_circle} width="72px" height="72px" />
												</div>
												<div className="nftdetail">
													<div className="stake2" >
														<div className="s2_up" >SHOE </div>
														<div className="s2_down" >Static Time (30days)</div>
													</div>
													<div className="stake1">
														<div className="s2_up">APR</div>
														<div className="s2_down">275%</div>
													</div>
													<div className="stake2">
														<div className="s2_up">Token Cap (SHOE)</div>
														<div className="s2_down">100,000</div>
													</div>
													<div className="stake2">
														<div className="s2_up">Rewards Given</div>
														<div className="s2_down">123,288.9041</div>
													</div>
												</div>
												<div className="stake3" onClick={() => this.show_detail(1)}>
													Detail<img src={down} width="14px" height="8px"></img>
												</div>
											</div>
											<div className="each_down" style={{ maxHeight: detail[1], overflow: 'hidden' }}>
												<div className="col-md-11 d-flex">
													<div className="shadow d-flex flex-column flex-fill gradient-card ">
														<div style={{ margin: "-20px" }}>
															<div className="tab-content stake-tab-content">
																<div role="tabpanel" className="tab-pane active" id="ctl-stake">
																	<form id="staking-form">
																		<div style={{ display: "flex", justifyContent: "space-between" }}>
																			<label className="form-label">{t('staking.stake.amount')}</label>

																		</div>
																		<div className="maxValue">
																			<input type="number" className="form-control form-control-lg" disabled={state.pending} onChange={(event) => this.handleInputStake(2, event)} value={state.ctValueStake2 || 0} />
																			<button className="btn btn-sm max-btn" onClick={() => this.setStakePercentage(2, 100)} type="button">MAX</button>
																		</div>
																		<div className="d-flex justify-content-center button-row margin_top">
																			{
																				this.state.allowance2 >= this.state.stakedBalance2 ?
																					<button className="btn btn-md link-dark" style={{ width: '100%', backgroundColor: "#CF3279", margin: 0, color: "white" }} disabled={state.ctValueStake2 <= 0 || state.locktime || state.stakedBalance2 || state.pending} type="button" onClick={async () => this.confirmStake(0)}>Stake</button> :
																					<button className="btn btn-md link-dark" style={{ width: '100%', backgroundColor: "#CF3279", margin: 0, color: "white" }}  type="button" onClick={async () => this.confirmApprove(0)}>Approve</button>
																			}
																		</div>
																	</form>
																</div>
																<div role="tabpanel" className="tab-pane active" id="ctl-unstake">
																	<form id="unstaking-form">
																		<div style={{ display: "flex", justifyContent: "space-between" }}>
																			<label className="form-label">{t('staking.unstake.amount')}</label>

																		</div>
																		<div className="maxValue">
																			<input type="number" className="form-control form-control-lg" disabled={state.pending} onChange={(event) => this.handleInputUnstake2(event)} value={state.ctValueUnstake2 || 0} />
																			<button className="btn btn-sm max-btn" onClick={() => this.setUnStake2Percentage(100)} type="button">MAX</button>
																		</div>
																		<div className="d-flex justify-content-center button-row margin_top">
																			<button className="btn btn-md link-dark" style={{ width: '100%', backgroundColor: "#CF3279", margin: 0, color: "white" }} disabled={state.stakedBalance2 == 0 || state.locktime || state.pending} type="button" onClick={async () => this.confirmUnstake(0)}>{t('staking.unstake.title')}</button>
																		</div>
																	</form>
																</div>
																<div role="tabpanel" className="tab-pane active" id="ctl-unstake">
																	<form id="unstaking-form">
																		<div style={{ display: "flex" }}>
																			<label className="form-label" style={{ paddingTop: "12px", paddingRight: "20px" }}>Total Rewards</label>
																			<h1 className="form-label total-amount">0.00</h1>
																		</div>
																		<div className="d-flex justify-content-center button-row margin_top">
																			{/*<button className="btn btn-md link-dark" style={{width: '100%', backgroundColor: "#B1B5C3", color: 'white'}} disabled={state.ctValueUnstake <= 0 || state.pending} type="button" onClick={async () => this.confirmUnstake()}>Claim</button>*/}
																		</div>
																	</form>
																</div>
															</div>
														</div>
													</div>
												</div>
											</div>
										</div>
									</FadeInRightDiv>
									<FadeInRightDiv className="your_staking">
										<div className="each_element" style={{ transition: '0.3s' }}>
											<div className="each_up" style={{ height: '120px' }}>
												<div className="stake_1">
													<img src={mark_circle} width="72px" height="72px" />
												</div>
												<div className="nftdetail">
													<div className="stake2" >
														<div className="s2_up" >SHOE </div>
														<div className="s2_down" >Static Time (60days)</div>
													</div>
													<div className="stake1">
														<div className="s2_up">APR</div>
														<div className="s2_down">350%</div>
													</div>
													<div className="stake2">
														<div className="s2_up">Token Cap (SHOE)</div>
														<div className="s2_down">100,000</div>
													</div>
													<div className="stake2">
														<div className="s2_up">Rewards Given</div>
														<div className="s2_down">123,288.9041</div>
													</div>
												</div>
												<div className="stake3" onClick={() => this.show_detail(2)}>
													Detail<img src={down} width="14px" height="8px"></img>
												</div>
											</div>
											<div className="each_down" style={{ maxHeight: detail[2], overflow: 'hidden' }}>
												<div className="col-md-11 d-flex">
													<div className="shadow d-flex flex-column flex-fill gradient-card ">
														<div style={{ margin: "-20px" }}>
															<div className="tab-content stake-tab-content">
																<div role="tabpanel" className="tab-pane active" id="ctl-stake">
																	<form id="staking-form">
																		<div style={{ display: "flex", justifyContent: "space-between" }}>
																			<label className="form-label">{t('staking.stake.amount')}</label>

																		</div>
																		<div className="maxValue">
																			<input type="number" className="form-control form-control-lg" disabled={state.pending} onChange={(event) => this.handleInputStake(2, event)} value={state.ctValueStake2 || 0} />
																			<button className="btn btn-sm max-btn" onClick={() => this.setStakePercentage(2, 100)} type="button">MAX</button>
																		</div>
																		<div className="d-flex justify-content-center button-row margin_top">
																			{
																				this.state.allowance2 >= this.state.stakedBalance2 ?
																					<button className="btn btn-md link-dark" style={{ width: '100%', backgroundColor: "#CF3279", margin: 0, color: "white" }} disabled={state.ctValueStake2 <= 0 || state.locktime || state.stakedBalance2 || state.pending} type="button" onClick={async () => this.confirmStake(1)}>Stake</button> :
																					<button className="btn btn-md link-dark" style={{ width: '100%', backgroundColor: "#CF3279", margin: 0, color: "white" }}  type="button" onClick={async () => this.confirmApprove(1)}>Approve</button>
																			}
																		</div>
																	</form>
																</div>
																<div role="tabpanel" className="tab-pane active" id="ctl-unstake">
																	<form id="unstaking-form">
																		<div style={{ display: "flex", justifyContent: "space-between" }}>
																			<label className="form-label">{t('staking.unstake.amount')}</label>

																		</div>
																		<div className="maxValue">
																			<input type="number" className="form-control form-control-lg" disabled={state.pending} onChange={(event) => this.handleInputUnstake2(event)} value={state.ctValueUnstake2 || 0} />
																			<button className="btn btn-sm max-btn" onClick={() => this.setUnStake2Percentage(100)} type="button">MAX</button>
																		</div>
																		<div className="d-flex justify-content-center button-row margin_top">
																			<button className="btn btn-md link-dark" style={{ width: '100%', backgroundColor: "#CF3279", margin: 0, color: "white" }} disabled={state.stakedBalance2 == 0 || state.locktime || state.pending} type="button" onClick={async () => this.confirmUnstake(0)}>{t('staking.unstake.title')}</button>
																		</div>
																	</form>
																</div>
																<div role="tabpanel" className="tab-pane active" id="ctl-unstake">
																	<form id="unstaking-form">
																		<div style={{ display: "flex" }}>
																			<label className="form-label" style={{ paddingTop: "12px", paddingRight: "20px" }}>Total Rewards</label>
																			<h1 className="form-label total-amount">0.00</h1>
																		</div>
																		<div className="d-flex justify-content-center button-row margin_top">
																			{/*<button className="btn btn-md link-dark" style={{width: '100%', backgroundColor: "#B1B5C3", color: 'white'}} disabled={state.ctValueUnstake <= 0 || state.pending} type="button" onClick={async () => this.confirmUnstake()}>Claim</button>*/}
																		</div>
																	</form>
																</div>
															</div>
														</div>
													</div>
												</div>
											</div>
										</div>
									</FadeInRightDiv>
									<FadeInRightDiv className="your_staking">
										<div className="each_element" style={{ transition: '0.3s' }}>
											<div className="each_up" style={{ height: '120px' }}>
												<div className="stake_1">
													<img src={mark_circle} width="72px" height="72px" />
												</div>
												<div className="nftdetail">
													<div className="stake2" >
														<div className="s2_up" >SHOE </div>
														<div className="s2_down" >Static Time (90days)</div>
													</div>
													<div className="stake1">
														<div className="s2_up">APR</div>
														<div className="s2_down">500%</div>
													</div>
													<div className="stake2">
														<div className="s2_up">Token Cap (SHOE)</div>
														<div className="s2_down">100,000</div>
													</div>
													<div className="stake2">
														<div className="s2_up">Rewards Given</div>
														<div className="s2_down">123,288.9041</div>
													</div>
												</div>
												<div className="stake3" onClick={() => this.show_detail(3)}>
													Detail<img src={down} width="14px" height="8px"></img>
												</div>
											</div>
											<div className="each_down" style={{ maxHeight: detail[3], overflow: 'hidden' }}>
												<div className="col-md-11 d-flex">
													<div className="shadow d-flex flex-column flex-fill gradient-card ">
														<div style={{ margin: "-20px" }}>
															<div className="tab-content stake-tab-content">
																<div role="tabpanel" className="tab-pane active" id="ctl-stake">
																	<form id="staking-form">
																		<div style={{ display: "flex", justifyContent: "space-between" }}>
																			<label className="form-label">{t('staking.stake.amount')}</label>

																		</div>
																		<div className="maxValue">
																			<input type="number" className="form-control form-control-lg" disabled={state.pending} onChange={(event) => this.handleInputStake(2, event)} value={state.ctValueStake2 || 0} />
																			<button className="btn btn-sm max-btn" onClick={() => this.setStakePercentage(2, 100)} type="button">MAX</button>
																		</div>
																		<div className="d-flex justify-content-center button-row margin_top">
																			{
																				this.state.allowance2 >= this.state.stakedBalance2 ?
																					<button className="btn btn-md link-dark" style={{ width: '100%', backgroundColor: "#CF3279", margin: 0, color: "white" }} disabled={state.ctValueStake2 <= 0 || state.locktime || state.stakedBalance2 || state.pending} type="button" onClick={async () => this.confirmStake(2)}>Stake</button> :
																					<button className="btn btn-md link-dark" style={{ width: '100%', backgroundColor: "#CF3279", margin: 0, color: "white" }}  type="button" onClick={async () => this.confirmApprove(2)}>Approve</button>
																			}
																		</div>
																	</form>
																</div>
																<div role="tabpanel" className="tab-pane active" id="ctl-unstake">
																	<form id="unstaking-form">
																		<div style={{ display: "flex", justifyContent: "space-between" }}>
																			<label className="form-label">{t('staking.unstake.amount')}</label>

																		</div>
																		<div className="maxValue">
																			<input type="number" className="form-control form-control-lg" disabled={state.pending} onChange={(event) => this.handleInputUnstake2(event)} value={state.ctValueUnstake2 || 0} />
																			<button className="btn btn-sm max-btn" onClick={() => this.setUnStake2Percentage(100)} type="button">MAX</button>
																		</div>
																		<div className="d-flex justify-content-center button-row margin_top">
																			<button className="btn btn-md link-dark" style={{ width: '100%', backgroundColor: "#CF3279", margin: 0, color: "white" }} disabled={state.stakedBalance2 == 0 || state.locktime || state.pending} type="button" onClick={async () => this.confirmUnstake(0)}>{t('staking.unstake.title')}</button>
																		</div>
																	</form>
																</div>
																<div role="tabpanel" className="tab-pane active" id="ctl-unstake">
																	<form id="unstaking-form">
																		<div style={{ display: "flex" }}>
																			<label className="form-label" style={{ paddingTop: "12px", paddingRight: "20px" }}>Total Rewards</label>
																			<h1 className="form-label total-amount">0.00</h1>
																		</div>
																		<div className="d-flex justify-content-center button-row margin_top">
																			{/*<button className="btn btn-md link-dark" style={{width: '100%', backgroundColor: "#B1B5C3", color: 'white'}} disabled={state.ctValueUnstake <= 0 || state.pending} type="button" onClick={async () => this.confirmUnstake()}>Claim</button>*/}
																		</div>
																	</form>
																</div>
															</div>
														</div>
													</div>
												</div>
											</div>
										</div>
									</FadeInRightDiv>
								</div>
							</div>
							<NotificationContainer />
						</div>
					</div>
					<div className="part_f">
						<Footer />
					</div>
				</div>
			</div>
		)
	}
}

const StakingComponentWithTranlation = withTranslation()(StakingComponent);

const StakingComponentMain = compose(
	withWallet,
)(StakingComponentWithTranlation);

export default StakingComponentMain