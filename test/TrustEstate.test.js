const { expect } = require("chai");
const { ethers } = require("hardhat");

// Test suite for TrustEstate contract
describe("TrustEstate", function () {
    let TrustEstate;
    let landRegistry;
    let owner;
    let addr1;
    let addr2;
    let addr3;

    beforeEach(async function () {
        // Deploy the contract before each test
        TrustEstate = await ethers.getContractFactory("TrustEstate");
        [owner, addr1, addr2, addr3] = await ethers.getSigners();
        landRegistry = await TrustEstate.deploy();
        await landRegistry.waitForDeployment();
    });

    it("Should mint a new plot of land with initial ownership", async function () {
        const owners = [owner.address, addr1.address];
        const shares = [6000, 4000]; // Shares are scaled by 10^4 (i.e., 60% and 40%)
        const totalShares = 10000;
        const ipfsHash = "QmTestHash12345";

        await expect(
            landRegistry.mintPlot(owners, shares, totalShares, ipfsHash)
        )
            .to.emit(landRegistry, "Transfer")
            .withArgs(ethers.ZeroAddress, owner.address, 1);

        const plot = await landRegistry.getPlot(1);
        expect(plot.id).to.equal(1);
        expect(plot.ipfsHash).to.equal(ipfsHash);
        expect(plot.totalShares).to.equal(totalShares);
        expect(plot.owners.length).to.equal(2);
        expect(plot.owners[0].owner).to.equal(owners[0]);
        expect(plot.owners[0].share).to.equal(shares[0]);
    });

    it("Should create a split proposal", async function () {
        const owners = [owner.address, addr1.address];
        const shares = [6000, 4000];
        const totalShares = 10000;
        const ipfsHash = "QmTestHash12345";

        await landRegistry.mintPlot(owners, shares, totalShares, ipfsHash);

        const split1 = {
            owners: [owner.address],
            shares: [10000],
            totalShares: 10000,
            ipfsHash: "QmSplitHash1",
        };

        const split2 = {
            owners: [addr1.address],
            shares: [10000],
            totalShares: 10000,
            ipfsHash: "QmSplitHash2",
        };

        await expect(landRegistry.createSplitProposal(1, split1, split2))
            .to.emit(landRegistry, "ProposalCreated")
            .withArgs(1, 1);

        const proposal = await landRegistry.proposals(1);
        expect(proposal.plotId).to.equal(1);
        expect(proposal.executed).to.equal(false);
    });

    it("Should approve a proposal", async function () {
        const owners = [owner.address, addr1.address];
        const shares = [6000, 4000];
        const totalShares = 10000;
        const ipfsHash = "QmTestHash12345";

        await landRegistry.mintPlot(owners, shares, totalShares, ipfsHash);

        const split1 = {
            owners: [owner.address],
            shares: [10000],
            totalShares: 10000,
            ipfsHash: "QmSplitHash1",
        };

        const split2 = {
            owners: [addr1.address],
            shares: [10000],
            totalShares: 10000,
            ipfsHash: "QmSplitHash2",
        };

        await landRegistry.createSplitProposal(1, split1, split2);

        await expect(landRegistry.connect(owner).approveProposal(1))
            .to.emit(landRegistry, "ProposalApproved")
            .withArgs(1, 1, owner.address);

        const proposal = await landRegistry.proposals(1);
        // Check if the proposal exists and is not executed
        expect(proposal.plotId).to.equal(1);
        expect(proposal.executed).to.equal(false);

        // Verify that the owner is marked as an approver by trying to approve again
        await expect(
            landRegistry.connect(owner).approveProposal(1)
        ).to.be.revertedWith("Already approved");
    });

    it("Should execute a split proposal", async function () {
        const owners = [owner.address, addr1.address];
        const shares = [6000, 4000];
        const totalShares = 10000;
        const ipfsHash = "QmTestHash12345";

        await landRegistry.mintPlot(owners, shares, totalShares, ipfsHash);

        const split1 = {
            owners: [owner.address],
            shares: [10000],
            totalShares: 10000,
            ipfsHash: "QmSplitHash1",
        };

        const split2 = {
            owners: [addr1.address],
            shares: [10000],
            totalShares: 10000,
            ipfsHash: "QmSplitHash2",
        };

        await landRegistry.createSplitProposal(1, split1, split2);
        await landRegistry.connect(owner).approveProposal(1);
        await landRegistry.connect(addr1).approveProposal(1);

        await expect(landRegistry.executeProposal(1))
            .to.emit(landRegistry, "ProposalExecuted")
            .withArgs(1, 1);

        const plot1 = await landRegistry.getPlot(2);
        expect(plot1.ipfsHash).to.equal("QmSplitHash1");
        expect(plot1.totalShares).to.equal(10000);

        const plot2 = await landRegistry.getPlot(3);
        expect(plot2.ipfsHash).to.equal("QmSplitHash2");
        expect(plot2.totalShares).to.equal(10000);
    });

    it("should allow owner to merge two plots", async function () {
        const owners1 = [owner.address, addr1.address];
        const shares1 = [6000, 4000];
        const totalShares1 = 10000;
        const ipfsHash1 = "QmTestHash12345";

        const owners2 = [owner.address, addr2.address];
        const shares2 = [4000, 6000];
        const totalShares2 = 10000;
        const ipfsHash2 = "QmTestHash6789";

        await landRegistry.mintPlot(owners1, shares1, totalShares1, ipfsHash1);
        await landRegistry.mintPlot(owners2, shares2, totalShares2, ipfsHash2);

        const merge = {
            owners: [owner.address, addr1.address, addr2.address],
            shares: [5000, 5000, 5000],
            totalShares: 15000,
            ipfsHash: "QmMergeHash",
        };

        await landRegistry.createMergeProposal(1, 2, merge);
        await landRegistry.connect(owner).approveProposal(1);
        await landRegistry.connect(addr1).approveProposal(1);
        await landRegistry.connect(addr2).approveProposal(1);

        await expect(landRegistry.executeProposal(1))
            .to.emit(landRegistry, "ProposalExecuted")
            .withArgs(1, 1);

        // check if the original plots are gone (should return empty/default values)
        const plot1 = await landRegistry.getPlot(1);
        expect(plot1.id).to.equal(0n); // Default BigNumber 0
        expect(plot1.owners).to.be.empty; // Empty array
        expect(plot1.ipfsHash).to.equal(''); // Empty string
        expect(plot1.totalShares).to.equal(0n); // Default BigNumber 0

        const plot2 = await landRegistry.getPlot(2);
        expect(plot2.id).to.equal(0n);
        expect(plot2.owners).to.be.empty;
        expect(plot2.ipfsHash).to.equal('');
        expect(plot2.totalShares).to.equal(0n);

        const plot3 = await landRegistry.getPlot(3);
        expect(plot3.ipfsHash).to.equal("QmMergeHash");
        expect(plot3.totalShares).to.equal(15000);
    });
    
    it("should allow owner to split and merge a plot", async function () {
        const owners = [owner.address];
        const shares = [10000]; // Shares are scaled by 10^4 (i.e., 60% and 40%)
        const totalShares = 10000;
        const ipfsHash = "QmPlot1";
        // mint a plot
        await landRegistry.mintPlot(owners, shares, totalShares, ipfsHash);

        const plotInfo = {
            owners,
            shares,
            totalShares,
            ipfsHash,
        };

        await expect(landRegistry.createSplitProposal(1, plotInfo, plotInfo))
            .to.emit(landRegistry, "ProposalCreated")
            .withArgs(1, 1);

        await landRegistry.connect(owner).approveProposal(1);

        await expect(landRegistry.executeProposal(1))
            .to.emit(landRegistry, "ProposalExecuted")
            .withArgs(1, 1);


        // merge plot 1 and plot 2
        await landRegistry.createMergeProposal(2, 3, plotInfo);

        await landRegistry.connect(owner).approveProposal(2);

        await expect(landRegistry.executeProposal(2))
            .to.emit(landRegistry, "ProposalExecuted")
            .withArgs(2, 2);

        const plot1 = await landRegistry.getPlot(2);
        expect(plot1.id).to.equal(0n);
        expect(plot1.owners).to.be.empty;
        expect(plot1.ipfsHash).to.equal('');
        expect(plot1.totalShares).to.equal(0n);

        const plot2 = await landRegistry.getPlot(3);
        expect(plot2.id).to.equal(0n);
        expect(plot2.owners).to.be.empty;
        expect(plot2.ipfsHash).to.equal('');
        expect(plot2.totalShares).to.equal(0n);

        const plot3 = await landRegistry.getPlot(4);
        expect(plot3.ipfsHash).to.equal(plotInfo.ipfsHash);
        expect(plot3.totalShares).to.equal(plotInfo.totalShares);
    });

    it("Should allow owners to transfer plots", async () => {
        const owners = [owner.address, addr1.address];
        const shares = [6000, 4000];
        const totalShares = 10000;
        const ipfsHash = "QmTestHash12345";

        await landRegistry.mintPlot(owners, shares, totalShares, ipfsHash);

        const transfer = {
            owners: [addr2.address, addr3.address],
            shares: [9000, 2000],
            totalShares: 11000,
            ipfsHash: "QmTransferHash",
        };

        await landRegistry.createTransferProposal(1, transfer);

        await expect(landRegistry.connect(owner).approveProposal(1))
            .to.emit(landRegistry, "ProposalApproved")
            .withArgs(1, 1, owner.address);

        await expect(landRegistry.connect(addr1).approveProposal(1))
            .to.emit(landRegistry, "ProposalApproved")
            .withArgs(1, 1, addr1.address);

        await expect(landRegistry.executeProposal(1))
            .to.emit(landRegistry, "ProposalExecuted")
            .withArgs(1, 1);


        const plot = await landRegistry.getPlot(2);
        expect(plot.id).to.equal(2);
        expect(plot.ipfsHash).to.equal(transfer.ipfsHash);
        expect(plot.totalShares).to.equal(transfer.totalShares);
        expect(plot.owners.length).to.equal(transfer.owners.length);
        expect(plot.owners[0].owner).to.equal(transfer.owners[0]);
        expect(plot.owners[1].owner).to.equal(transfer.owners[1]);
        expect(plot.owners[0].share).to.equal(transfer.shares[0]);
        expect(plot.owners[1].share).to.equal(transfer.shares[1]);
    });
});
