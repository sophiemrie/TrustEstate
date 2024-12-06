import { Injectable } from '@angular/core';
import Web3, { Contract, ContractAbi } from 'web3';
import TrustEstate from '../../../contracts/TrustEstate';
import { Plot } from '../type/plot.type';
import { Ownership } from '../type/ownership.type';
import { Proposal } from '../type/proposal.type';
import { PlotData } from '../type/plot-data.type';

@Injectable({
  providedIn: 'root'
})
export class EthereumService {
  private readonly NETWORK_URL: string = 'http:///localhost:8545';
  private readonly CONTRACT_ADDRESS_URL: string = '/assets/addresses/addresses.json';
  private web3: Web3 = new Web3(this.NETWORK_URL);

  private contract: any;
  private accounts: string[] = [];

  private isInitialized: boolean = false;
  private initPromise: Promise<void>;

  constructor() {
    this.initPromise = this.init().catch((error) => console.error('Initialization failed:', error));
  }

  async ensureInitialized(): Promise<void> {
    if (this.isInitialized) return;
    return this.initPromise;
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

    this.isInitialized = true;
  }

  async getContractAddress() {
    const address = await fetch(this.CONTRACT_ADDRESS_URL).then(response => response.json());
    return address.TrustEstate.address;
  }

  async getPlot(id: number): Promise<Plot> {
    await this.ensureInitialized();
    if (this.contract === undefined) throw new Error("Contract not initialized");
    return await this.contract.methods.getPlot(id).call();
  }

  async getOwnership(id: number): Promise<Ownership[]> {
    await this.ensureInitialized();
    if (this.contract === undefined) throw new Error("Contract not initialized");
    return await this.contract.methods.getOwnership(id).call();
  }

  async transferOwnershipShare(id: number, share: number, to: string): Promise<void> {
    await this.ensureInitialized();
    if (this.contract === undefined) throw new Error("Contract not initialized");
    await this.contract.methods.transferOwnershipShare(to, id, share).send({from: this.accounts[0]})
  }

  async getProposals(): Promise<Proposal[]> {
    await this.ensureInitialized();
    if (this.contract === undefined) throw new Error("Contract not initialized");
    const result = await this.contract.methods.getProposals().call();
    console.log(result);
    return result;
  }
    // function createSplitProposal(
    //     uint256 plotId,
    //     PlotDetails memory split1,
    //     PlotDetails memory split2,
    //     Ownership[] memory owners1,
    //     Ownership[] memory owners2

  async createSplitProposal(id: number, split1: PlotData, split2: PlotData, owners1: Ownership[], owners2: Ownership[]): Promise<void> {
    await this.ensureInitialized();
    if (this.contract === undefined) throw new Error("Contract not initialized");
    await this.contract.methods.createSplitProposal(id, split1, split2, owners1, owners2).send({from: this.accounts[0]})
  }

  async createMergeProposal(plotId1: number, plotId2: number, merge: PlotData, owners: Ownership[]): Promise<void> {
    await this.ensureInitialized();
    if (this.contract === undefined) throw new Error("Contract not initialized");

    await this.contract.methods.createMergeProposal(plotId1, plotId2, merge, owners).send({from: this.accounts[0]})
  }

  async createTransferProposal(plotId: number, owners: Ownership[]): Promise<void> {
    await this.ensureInitialized();
    if (this.contract === undefined) throw new Error("Contract not initialized");
    await this.contract.methods.createTransferProposal(plotId, owners).send({from: this.accounts[0]})
  }
  async register(did: string): Promise<void> {
    await this.ensureInitialized();
    if (this.contract === undefined) throw new Error("Contract not initialized");
    await this.contract.methods.register(did).send({from: this.accounts[0]})
  }

  async approveProposal(id: number): Promise<void> {
    await this.ensureInitialized();
    if (this.contract === undefined) throw new Error("Contract not initialized");
    await this.contract.methods.approveProposal(id).send({from: this.accounts[0]})
  }

  async mintPlot(owners: Ownership[], ipfsHash: string, allowIndividualTransfer: boolean): Promise<void> {
    await this.ensureInitialized();
    if (this.contract === undefined) throw new Error("Contract not initialized");
    await this.contract.methods.mintPlot(owners, ipfsHash, allowIndividualTransfer)
  }

}
