// let's use React.js
import React from 'react';
import ReactDOM from 'react-dom';
import Modal from 'react-modal';
import {createWeb3ReactRoot, Web3ReactProvider} from '@web3-react/core';

// and bootstrap
import 'bootstrap';

// with our own theme
import './index.css';

// with custom packages for the fallback loader
import { ClipLoader } from 'react-spinners';
import { css } from 'styled-components';

// now all the components
import {Shell} from './components/shell';
import Dashboard from './components/pages/dashboard/dashboard';
import StakingComponent from './components/pages/stakingComponent';
import Staking2Component from './components/pages/staking2Component';
import NFTStakingComponent from './components/pages/nftStakingComponent';

import './i18n';

const pagesInNavigator = [
	{ id: 'home', title: 'Home', component: Dashboard },
	{ id: 'shoefyStaking', title: 'sNFT Staking', component: StakingComponent },
	{ id: 'nftStaking', title: 'sNFT Farming', component: NFTStakingComponent},
	{ id: 'snftStaking', title: '$Shoe Staking', component: NFTStakingComponent},
	{ id: 'shoefyStaking2', title: 'Static $Shoe Staking', component: Staking2Component},
];

const overrideCss = css`
	margin-left: 50%
`;

// import {getLibrary} from './utils/getLibrary';

// const NetworkContextName = `${new Date().getTime()}-NETWORK`;
// const Web3ProviderNetwork = createWeb3ReactRoot(NetworkContextName);
// <Web3ReactProvider getLibrary={getLibrary}>

// initialize modals
Modal.setAppElement('#root');
// and render our app into the "root" element!
ReactDOM.render(
	<React.Suspense fallback={<ClipLoader color={"#FFFFFF"} css={overrideCss}/>}>
		<Shell pages={pagesInNavigator} />
	</React.Suspense>
	,document.getElementById('root')
);
