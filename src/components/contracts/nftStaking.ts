import {Wallet} from '../wallet';
import {Contract} from 'web3-eth-contract';
// import { ethers } from 'ethers';
import * as web3 from 'web3-utils';
import { requestAPICall } from '../../helpers/apiService';

export const ShoeFyAddress = "0xfBA067325d5F679D89f2933f4eA4c0158389455a";
export const ShoeFyNFTAddress = "0x72DbF51BC4Dc948DA21e6790b4935521f86483D1";
export const NFTStakingAddress = "0x6f92ee699376dd8693903dcB8F07b2BEBB948690";

export class ShoefyNFTStaking {
	private readonly _wallet: Wallet;
	private readonly _contract: Contract;
	private readonly _shoeFyContract: Contract;
    private readonly _shoeFyNFTContract: Contract;
	private readonly _nftStakingContract: Contract;

	private _balance: number = 0;
    private _userNFTs: Array<any> = [];
	private _stakedNFTs: Array<any> = [];
	private _pendingRewards: number = 0;
	private _apr: number = 0;

	constructor(wallet: Wallet) {
		this._wallet = wallet;
		this._shoeFyContract =  wallet.connectToContract(ShoeFyAddress, require('./shoefy.abi.json'));
        this._shoeFyNFTContract = wallet.connectToContract(ShoeFyNFTAddress, require('./shoefyNft.abi.json'));
        this._nftStakingContract =  wallet.connectToContract(NFTStakingAddress, require('./nftStaking.abi.json'));
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
	get userNFTs(): Array<any> {
		return this._userNFTs;
	}
	get stakedNFTs(): Array<any> {
		return this._stakedNFTs;
	}
	get pendingStakeRewards(): number {
		return this._pendingRewards;
	}
	get apr(): number {
		return this._apr;
	}

	async stake(_id: number): Promise<void> {
		await this.refresh();
		const nftPrice: number = 50000000;
		const fee: number = 4;

		if (_id >= 0) {
			await this._shoeFyContract.methods.approve(NFTStakingAddress, web3.toWei((nftPrice*(fee+1)/100).toString(),'ether')).send({'from': this._wallet.currentAddress});
			await this._shoeFyNFTContract.methods.approve(NFTStakingAddress, _id).send({'from': this._wallet.currentAddress});
			await this._nftStakingContract.methods.stakeIn(_id, web3.toWei(nftPrice.toString(),'ether')).send({'from': this._wallet.currentAddress});
		}
		else {
			throw 'Your shoefy NFT is not sufficient to stake';
		}
	}
	async unstakeAndClaim(_id: number): Promise<void> {
		await this.refresh();

		if (_id >= 0) {
			await this._nftStakingContract.methods.withdrawStake(_id).send({'from': this._wallet.currentAddress});
		}
		else {
			throw 'Your staked shoefy balance is not sufficient to unstake this id';
		}
	}
	async claim(): Promise<void> {
		await this._nftStakingContract.methods.claimStakingRewards().send({'from': this._wallet.currentAddress});
		await this.refresh();
	}
	async refresh(): Promise<void> {
        const userNFTs = [];
        const stakedNFTs = [];
		this._balance = await this._shoeFyNFTContract.methods.balanceOf(this._wallet.currentAddress).call();
        for (let i = 0; i < this._balance; i++) {
            const tokenId = await this._shoeFyNFTContract.methods.tokenOfOwnerByIndex(this._wallet.currentAddress, i).call();
            const tokenURI = await this._shoeFyNFTContract.methods.tokenURI(tokenId).call();
            const nftData = await requestAPICall(tokenURI).then(res => {
                // console.log('IPFS Data', res.data)
                return res.data
            })
            userNFTs.push({
                id: tokenId,
                img: nftData.image,
                title: nftData.name,
                description: nftData.description
            })
        }
        this._userNFTs = userNFTs;
        console.log("All NFTs", this._userNFTs);

        let stakedTokenIds = [];
		stakedTokenIds = await this._nftStakingContract.methods.getNFTsOfUser(this._wallet.currentAddress).call();
        for (let i = 0; i < stakedTokenIds.length; i++) {
            const tokenURI = await this._shoeFyNFTContract.methods.tokenURI(stakedTokenIds[i]).call();
            const nftData = await requestAPICall(tokenURI).then(res => {
                // console.log('IPFS Data', res.data)
                return res.data
            })
            stakedNFTs.push({
                id: stakedTokenIds[i],
                img: nftData.image,
                title: nftData.name,
                description: nftData.description
            })
        }
        this._stakedNFTs = stakedNFTs;
        console.log("Staked NFTs", this._stakedNFTs);

		this._pendingRewards = await this._nftStakingContract.methods.pendingRewards(this._wallet.currentAddress).call() / (10 ** 18);
        console.log("Pending Rewards: ", this._pendingRewards);
		this._apr = await this._nftStakingContract.methods.getCurrentAPR().call();
		console.log("User Apr: ", this._apr);
	}
}
