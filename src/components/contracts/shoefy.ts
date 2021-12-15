import { Wallet } from '../wallet';
import { Contract } from 'web3-eth-contract';


// import { ethers } from 'ethers';
import * as web3 from 'web3-utils';
import Web3 from 'web3';
export const ShoeFyAddress = {
	4: "0x868c05b8c8a51c72e362cdc50364ed86595f7b8e",
	97: "0x4c687a9158F31321aD76eC7185C458201B375582"
};
export const StakingAddress = "0x86bdb4ea03f1b5158229c8fd15dca51310dc4661";
export const DonationWalletAddress = "0x50dF6f99c75Aeb6739CB69135ABc6dA77C588f93";

export const Staking2Address = {
	4: "0x13e16236d8eb65138d6e17dda846231df0407004",
	97: "0xce1856678ab1fcb27c28785ffb6a990f4475f2d0"
};

export const NFTAddress = {
	4 : "0x55ce195424f478f87c69dc158112ebdb285e140c",
	97 : "0x3129997dc8e9efd0d36749f6a9c62b0c85fc9fa8"
}

export const SaleAddress = {
	4 : "0x55a0451bc9f9d214bf5a7107e71f81138b26dc25",
	97: "0xcb2ef1dd6a8ff15d6f5dc7dd8df247adf3045988"
}
export class Shoefy {
	private readonly _wallet: Wallet;
	private readonly _contract: Contract;
	private readonly _shoeFyContract: Contract;
	private readonly _stakingContract: Contract;
	private readonly _staking2Contract: Contract;
	private readonly _NFTContract: Contract;
	private readonly _SaleContract: Contract;

	private _balance: number = 0;
	private _stake: number = 0;
	private _claimRewards: number = 0;
	private _pendingRewards: number = 0;
	private _pendingRewards2: any = [];
	private _claimedRewards2: any = [];
	private _lockedBalance2: number = 0;
	private _apr: number = 0;
	private _balance_eth: number = 0;
	private _locktime: number = 0;
	private _stake2: any = [];
	private _unstake2: any = [];
	private _totalclaim: number = 0;
	private _unstakable: any = [];
	private _allowance: number = 0;
	private _allowance2: number = 0;
	private _tokencaps2: any = [];
	constructor(wallet: Wallet) {
		this._wallet = wallet;
		// this._stakingContract = wallet.connectToContract(StakingAddress, require('./staking.abi.json'));
		this._shoeFyContract = wallet.connectToContract(ShoeFyAddress[this._wallet.getChainId()], require('./shoefy.abi.json'));
		this._staking2Contract = wallet.connectToContract(Staking2Address[this._wallet.getChainId()], require('./staking2.abi.json'));

		this._NFTContract = wallet.connectToContract(NFTAddress[this._wallet.getChainId()], require('./nft.abi.json'));
		this._SaleContract = wallet.connectToContract(SaleAddress[this._wallet.getChainId()], require('./sale.abi.json'));
		this.stake2 = this.stake2.bind(this);
	}



	get contract(): Contract {
		return this._contract;
	}

	get wallet(): Wallet {
		return this._wallet;
	}
	get balance(): number {
		return this._balance;
	}
	get balance_eth(): number {
		return this._balance_eth;
	}
	get stakedBalance(): number {
		return this._stake;
	}

	get pendingStakeRewards(): number {
		return this._pendingRewards;
	}
	get claimRewards(): number {
		return this._claimRewards;
	}
	get apr(): number {
		return this._apr;
	}
	get locktime(): number {
		return this._locktime;
	}
	get allowance(): number {
		return this._allowance
	}
	get allowance2(): number {
		return this._allowance2
	}
	get stakedBalance2(): any {
		return this._stake2;
	}
	get pendingRewards2(): any {
		return this._pendingRewards2;
	}
	get claimedRewards2(): any {
		return this._claimedRewards2;
	}
	get lockedBalance2(): number {
		return this._lockedBalance2;
	}
	get unstakeBlanace2(): any {
		return this._unstake2;
	}
	get totalclaim(): number {
		return this._totalclaim;
	}
	get unstakable(): any {
		return this._unstakable;
	}
	get tokencaps(): any {
		return this._tokencaps2;
	}
	async approve(amount: number): Promise<void> {
		let flag = await this._shoeFyContract.methods.approve(StakingAddress, amount).send({ 'from': this._wallet._address });
		return flag;

	}

	async approve2(amount: any): Promise<void> {

		let flag = await this._shoeFyContract.methods.approve(Staking2Address[this.wallet.getChainId()], amount).send({ 'from': this._wallet._address });
		return flag

	}

	async stake2(amount: number, stakestep: number): Promise<void> {
		if (this._balance >= amount) {
			await this._staking2Contract.methods.stake(web3.toWei(String(amount), 'ether'), stakestep).send({ 'from': this._wallet._address });
		}
		else {
			throw 'Your shoefy balance is not sufficient to stake this amount';
		}
	}

	async stake(amount: number): Promise<void> {
		await this.refresh();

		if (this._balance >= amount) {
			await this._stakingContract.methods.stakeIn(web3.toWei(String(amount), 'ether')).send({ 'from': this._wallet._address });
		}
		else {
			throw 'Your shoefy balance is not sufficient to stake this amount';
		}
	}
	async unstakeAndClaim(amount: number): Promise<void> {
		await this.refresh();
		if (this._stake >= amount) {
			await this._stakingContract.methods.withdrawStake(web3.toWei(String(amount), 'ether')).send({ 'from': this._wallet._address });
		}
		else {
			throw 'Your staked shoefy balance is not sufficient to unstake this amount';
		}
	}
	async withdraw(step: number): Promise<void> {
		const rates = [275, 350, 500];
		// alert(amount);
		// if (amount > 0) {
		await this._staking2Contract.methods.withdraw(step).send({ 'from': this._wallet._address });
		// }
		// else {
		// throw 'Your staked shoefy balance is not sufficient to unstake this amount';
		// }
	}
	async claim(): Promise<void> {
		await this._stakingContract.methods.claimStakingRewards().send({ 'from': this._wallet._address });
		await this.refresh();
	}

	async setPlaceholderURI(uri: string): Promise<void> {
		await this._SaleContract.methods.setPlaceholderURI(uri).send({ from: this._wallet._address });
	}
	async approveSale(amount: number) {
		await this._shoeFyContract.methods.approve(SaleAddress[this._wallet.getChainId()], web3.toWei(String(amount), 'ether')).send({from : this._wallet._address});
	}
	async purchase(): Promise<void> {
		await this._SaleContract.methods.buyNFT().send({ from: this._wallet._address });
		const id = await this._NFTContract.methods.totalSupply().call();
		return id;
	}
	async setWhiteList(address : string){
		await this._SaleContract.methods.whitelist(address, true).send({from : this._wallet._address})
	}
	async setNFTAdmin(address : string){
		await this._NFTContract.methods.setAdmin(address, true).send({from : this._wallet._address})
	}
	async unlockWhitelisted(){
		await this._SaleContract.methods.unlockWhitelisted().send({from : this._wallet._address})
	}
	async refresh(): Promise<void> {
		let web3 = new Web3(window.ethereum);
		let balance_eth = await web3.eth.getBalance(this._wallet._address);
		// console.log((web3.utils.fromWei(balance_eth, "ether")+" ETH"));

		this._balance_eth = parseFloat((web3.utils.fromWei(balance_eth, "ether"))).toFixed(3);
		// console.log(this._balance_eth)
		this._balance = Math.floor(await this._shoeFyContract.methods.balanceOf(this._wallet._address).call() / (10 ** 12)) / (10 ** 6);
		// this._stake = await this._stakingContract.methods.stakedBalanceOf(this._wallet._address).call() / (10 ** 18);
		// this._pendingRewards = await this._stakingContract.methods.pendingRewards(this._wallet._address).call() / (10 ** 18);
		// this._apr = await this._stakingContract.methods.getCurrentAPR().call() / 100;
		// this._claimRewards = await this._stakingContract.methods.getClaimRewards(this._wallet._address).call() / Math.pow(10, 18);

		// this._allowance = await this._shoeFyContract.methods.allowance(this._wallet._address, StakingAddress).call() / (10 ** 18);
		this._allowance2 = await this._shoeFyContract.methods.allowance(this._wallet._address, Staking2Address[this.wallet.getChainId()]).call() / (10 ** 18);
		console.log(this._allowance2);
		const stakers = await this._staking2Contract.methods.getStakeData(this._wallet._address).call();
		const time = await this._staking2Contract.methods.getblocktime().call();
		const fees = await this._staking2Contract.methods.totalFee().call() / 1;
		const claims = await this._staking2Contract.methods.totalreward.call().call() / Math.pow(10, 18);

		this._totalclaim = claims;
		this._claimedRewards2[0] = claims;
		for (let i = 0; i < 3; i++) {
			this._unstakable[i] = -1;
			this._stake2[i] = 0;
			this._unstake2[i] = 0;
			this._pendingRewards2[i] = 0;
			this._tokencaps2[i] = 0;
		}
		for (let i = 0; i < stakers.amount.length; i++) {
			this._unstakable[i] = time - stakers.lockedtime[i];
			this._stake2[i] = stakers.amount[i] / Math.pow(10, 18);
			this._unstake2[i] = await this._staking2Contract.methods.getUnstakeValue(this._wallet._address, i).call() / Math.pow(10, 18);
			this._pendingRewards2[i] = (this._unstake2[i] - this._stake2[i]);
			console.log(this._pendingRewards2[i]);
		}
		for (let i = 0; i < 3; i++) {
			this._stake2[i] = await this._staking2Contract.methods.lockedBalance(i).call() / Math.pow(10, 18);
			const tokencaps = Math.ceil(await this._staking2Contract.methods.tokencaps(i).call() / Math.pow(10, 18));
			this._tokencaps2[i] = tokencaps;
		}
	}
}
