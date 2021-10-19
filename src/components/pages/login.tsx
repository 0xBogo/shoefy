import * as React from 'react';
import * as numeral from 'numeral';

import { BaseComponent, ShellErrorHandler } from '../shellInterfaces';
import { Wallet } from '../wallet';
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
import FoxImg from '../../images/fox.png';
import './login.css';

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

import mark_circle from "../../images/mark_circle.png"
import down from "../../images/down.png"

import planetData from "./planetData";

export type StakingProps = {};
export type StakingState = {
	shoefy?: Shoefy,
	wallet?: Wallet,
	looping?: boolean,

	// actual set values
	address?: string,
	balance?: number,
	balance_eth ?: number,
	stakedBalance?: number,
	pendingRewards?: number,
	apr?: number,

	// values pending to be set
	ctPercentageStake?: number,
	ctValueStake?: number,
	ctPercentageUnstake?: number,
	ctValueUnstake?: number,
	pending?: boolean
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

function Sun() {
  return (
    <mesh>
      <sphereGeometry args={[2.5, 32, 32]} />
      <meshStandardMaterial color="#E1DC59"  />
    </mesh>
  );
}

function Planet({ planet: { color, xRadius, zRadius, size } }) {
  const planetRef = React.useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const x = xRadius * Math.sin(t);
    const z = zRadius * Math.cos(t);
    planetRef.current.position.x = x;
    planetRef.current.position.z = z;
  });

  return (
    <>
      <mesh ref={planetRef}>
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <Ecliptic xRadius={xRadius} zRadius={zRadius} />
    </>
  );
}

function Lights() {
  return (
    <>
      <ambientLight />
      <pointLight position={[0, 0, 0]} />
    </>
  );
}

function Ecliptic({ xRadius = 1, zRadius = 1 }) {
  const points = [];
  for (let index = 0; index < 64; index++) {
    const angle = (index / 64) * 2 * Math.PI;
    const x = xRadius * Math.cos(angle);
    const z = zRadius * Math.sin(angle);
    points.push(new THREE.Vector3(x, 0, z));
  }

  points.push(points[0]);

  const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
  return (
    <line geometry={lineGeometry}>
      <lineBasicMaterial attach="material" color="#BFBBDA" linewidth={10} />
    </line>
  );
}

class Login extends BaseComponent<StakingProps & WithTranslation, StakingState> {

	private _timeout: any = null;

	constructor(props: StakingProps & WithTranslation) {
		super(props);

		this.handleStakeSlider = this.handleStakeSlider.bind(this);
		this.handleUnstakeSlider = this.handleUnstakeSlider.bind(this);
		this.handleInputStake = this.handleInputStake.bind(this);
		this.handleInputUnstake = this.handleInputUnstake.bind(this);
		this.connectWallet = this.connectWallet.bind(this);
		this.disconnectWallet = this.disconnectWallet.bind(this);
		this.state = {};
	}

	handleStakeSlider(event) {
		this.setStakePercentage(event.target.value);
	}
	handleUnstakeSlider(event) {
		this.setUnstakePercentage(event.target.value);
	}
	handleInputStake(event) {
		this.setStakeValue(event.target.value);
	}
	handleInputUnstake(event) {
		this.setUnstakeValue(event.target.value);
	}

	handleError(error) {
		ShellErrorHandler.handle(error);
	}

	async componentDidMount() {
		if ((window.ethereum || {}).selectedAddress) {
			this.connectWallet();
		}
	}

	componentWillUnmount() {
		if (!!this._timeout) {
			clearTimeout(this._timeout);
		}
		this.updateState({ shoefy: null, looping: false });
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
					apr: shoefy.apr,
					balance_eth: shoefy.balance_eth
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

			this.updateState({ shoefy: null, wallet: null, address: null, looping: false, pending: false });
		}
		catch (e) {
			this.updateState({ pending: false });
			this.handleError(e);
		}
	}

	render() {
		let detail = ['0px','0px','0px','0px'];

		const state = this.readState();
		const t: TFunction<"translation"> = this.readProps().t;

		return (<div className="staking-container">
				<div className="row login-body mt-1">
					<div className="rotateimages">
						<div className="sun">
							<img src="/images/Image/PNG/Frame 1288.png" />
						</div>
						{/*<div className="saturn1">
							<img src="/images/rotateitem1.png" />
						</div>*/}
						{/*<div className="saturn2">
							<img src="/images/rotateitem1.png" />
						</div>*/}
						{/*<div className="saturn3">
							<img src="/images/rotateitem1.png" />
						</div>*/}
						{/*<div className="saturn4">
							<img src="/images/rotateitem1.png" />
						</div>*/}
						{/*<div className="saturn5">
							<img src="/images/rotateitem1.png" />
						</div>*/}
						{/*<div className="saturn6">
							<img src="/images/rotateitem1.png" />
						</div>*/}
					</div>
					<div className="main">
						<div className="main-content">
							<h1>SHOEFY LEGENDARY</h1>
							<p>Unleash the legendary SHOEFY that are being sealed.</p>
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
						</div>
					</div>
				</div>
			</div>)
			
	}
}

export default withTranslation()(Login);