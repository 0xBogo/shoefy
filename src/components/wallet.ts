import Web3 from 'web3';
import Web3Modal, { providers } from 'web3modal';
import WalletConnectProvider from '@walletconnect/web3-provider';
import { Contract } from 'web3-eth-contract';

export class Wallet {
	private _chainId: number = 4;
	private _address: string = null;
	private _provider: any = null;
	private web3Modal = new Web3Modal({
		network: "binance", // TODO: change this network option to be changable according
		// network: "rinkeby",
		cacheProvider: false,
		providerOptions: this.getProviderOptions()
	});

	private _web3: Web3 = null;

	public getProviderOptions(): any {
		const providerOptions = {

			walletconnect: {
				package: WalletConnectProvider,
				options: {
					// rpc: {
					// 	// 4: 'https://rinkeby-light.eth.linkpool.io/',
					// 	97: 'https://data-seed-prebsc-1-s1.binance.org:8545'
					// },
					network: 'mainnet',
					chainId: this._chainId,
					infuraId: 'TR4KMIQ72NEDFNJ2ZP5C1BGGTD6DSTTGGT '
				}
			}
		};

		return providerOptions;
	};

	public async connect(): Promise<boolean> {
		let modaldom = document.getElementsByClassName('web3modal-modal-card')
		let carditemdom = document.getElementsByClassName('web3modal-provider-wrapper')

		let temptitledom = document.getElementById('titledom')
		let tempcontentdom1 = document.getElementById('contentdom1')
		let tempcontentdom2 = document.getElementById('contentdom2')

		if (temptitledom) {
			temptitledom.remove()
			tempcontentdom1.remove()
			tempcontentdom2.remove()
		}

		var titledom = document.createElement("h3");
		var contentdom1 = document.createElement("p");
		var contentdom2 = document.createElement("p");

		var textnode = document.createTextNode("Connect Wallet");
		titledom.appendChild(textnode);
		titledom.setAttribute("id", "titledom");

		textnode = document.createTextNode("Please connect your wallet to continue.");
		contentdom1.appendChild(textnode);
		contentdom1.setAttribute("id", "contentdom1");

		textnode = document.createTextNode("The system supports the following wallets");
		contentdom2.appendChild(textnode);
		contentdom2.setAttribute("id", "contentdom2");

		modaldom[0].insertBefore(titledom, carditemdom[0]);
		modaldom[0].insertBefore(contentdom1, carditemdom[0]);
		modaldom[0].insertBefore(contentdom2, carditemdom[0]);

		const wnd: any = window;
		if ((window.ethereum || {}).selectedAddress) {
			try {
				this._provider = window.ethereum;
			}
			catch (e) {
				this._provider = await this.web3Modal.connect();
			}
		}
		else {
			this._provider = await this.web3Modal.connect();
		}

		// Subscribe to provider disconnection
		this._provider.on("disconnect", async (error: { code: number; message: string }) => {
			this._web3 = null;
			this._address = null;
			console.log(error);
		});
		// if (!!wnd.ethereum) {
		if (!this._web3) {
			this._web3 = new Web3(this._provider);
		}

		const accounts = await this._web3.eth.getAccounts();
		const selectedAccount = accounts[0];

		const provider: any = this._web3.eth.currentProvider;
		if (!provider || ((provider.chainId != this._chainId) && (provider.networkVersion != this._chainId))) {
			if (provider.isMetaMask) {
				console.log("DDDDD");
				const t = "0x" + this._chainId.toString(16);
				const networkinfo = [{
					chainId: t,

				}]
				await window.web3.ethereum.request({ method: 'wallet_addEthereumChain', params: networkinfo }).catch(function () {
					document.getElementById('modalswitch').click();
					throw 'Please choose the BSC Testnet network as the current network in your wallet app !'
				})
			}
			else {
				document.getElementById('modalswitch').click();
				throw 'Please choose the BSC Testnet network as the current network in your wallet app !';
			}
		}

		this._address = selectedAccount;
		return this.isConnected();
	}

	public async disconnect(): Promise<boolean> {
		this._web3 = null;
		this._address = null;
		if (this._provider.close) {
			await this._provider.close();

			// If the cached provider is not cleared,
			// WalletConnect will default to the existing session
			// and does not allow to re-scan the QR code with a new wallet.
			// Depending on your use case you may want or want not his behavir.
			await this.web3Modal.clearCachedProvider();
			this._provider = null;
		}
		return this.isConnected();
	}

	public isConnected(): boolean {
		return !!this._address;
	}
	public currentAddress(): string {
		return this._address;
	}

	public connectToContract(address: string, abi: any): Contract {
		if (!this._web3) {
			throw 'Wallet is not connected';
		}

		return new this._web3.eth.Contract(abi, address);
	}

	public setChainId(id: number) {
		this._chainId = id;
	}
	public getChainId() {
		return this._chainId;
	}
	public getAddress(){
		return this._address;
	}
}