import { Injectable } from '@angular/core';
import Web3, { Contract, ContractAbi } from 'web3';
import TrustEstate from '../../../contracts/TrustEstate';
import { Plot } from '../type/plot.type';
import { Ownership } from '../type/ownership.type';

@Injectable({
  providedIn: 'root'
})
export class EthereumService {
  private readonly NETWORK_URL: string = 'http:///localhost:8545';
  private readonly CONTRACT_ADDRESS_URL: string = '/assets/addresses/addresses.json';
  private web3: Web3 = new Web3(this.NETWORK_URL);

  private contract: any;
  private accounts: string[] = [];

  constructor(
  ) {
    this.init().catch((error) => console.error('Initialization failed:', error));
  }

  getAccounts(): string[] {
    return this.accounts;
  }

  async connectMetaMask(): Promise<void> {
    if (typeof window.ethereum !== "undefined") {
      try {
        this.accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });

        this.web3 = new Web3(window.ethereum);

        console.log("Connected to MetaMask with accounts:", this.accounts);
      } catch (error) {
        console.error("User denied account access or an error occurred:", error);
      }
    } else {
      console.error("MetaMask is not installed. Please install MetaMask to continue.");
    }
  }

  async init(): Promise<void> {
    await this.connectMetaMask();

    const address = await this.getContractAddress();
    this.contract = new Contract(TrustEstate.abi as ContractAbi, address, this.web3);
  }

  async getContractAddress() {
    const address = await fetch(this.CONTRACT_ADDRESS_URL).then(response => response.json());
    return address.TrustEstate.address;
  }

  async getPlot(id: number): Promise<Plot | undefined> {
    if (this.contract === undefined) return;
    return await this.contract.methods.getPlot(id).call();
  }

  async getOwnership(id: number): Promise<Ownership[] | undefined> {
    if (this.contract === undefined) return;
    return await this.contract.methods.getOwnership(id).call();
  }

  async transferOwnershipShare(id: number, share: number, to: string): Promise<void> {
    if (this.contract === undefined) return;
    await this.contract.methods.transferOwnershipShare(this.accounts[0], to, id, share).call()
  }

  async createSplitProposal(id: number, split: number, to: string): Promise<void> {
    throw new Error("Not implemented");
    if (this.contract === undefined) return;
    await this.contract.methods.createSplitProposal().call() // FIXME
  }

  async createMergeProposal(id: number, to: string): Promise<void> {
    throw new Error("Not implemented");
    if (this.contract === undefined) return;
    await this.contract.methods.createMergeProposal().call() // FIXME
  }

  async createTransferProposal(id: number, to: string): Promise<void> {
    throw new Error("Not implemented");
    if (this.contract === undefined) return;
    await this.contract.methods.createTransferProposal().call() // FIXME
  }

  async register(did: string, didDocument: string): Promise<void> {
    throw new Error("Not implemented");
    if (this.contract === undefined) return;
    await this.contract.methods.register().call() // FIXME
  }

  async approveProposal(id: number): Promise<void> {
    throw new Error("Not implemented");
    if (this.contract === undefined) return;
    await this.contract.methods.approveProposal().call() // FIXME
  }

  async mintPlot(owners: Ownership[], ipfsHash: string, allowIndividualTransfer: boolean): Promise<void> {
    throw new Error("Not implemented");
    if (this.contract === undefined) return;
    await this.contract.methods.mintPlot().call() // FIXME
  }


}
