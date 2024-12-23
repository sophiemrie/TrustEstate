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
    let government;

    beforeEach(async function () {
        // Deploy the DIDRegistry contract before each test
        DIDRegistry = await ethers.getContractFactory("DIDRegistry");
        [owner, addr1, addr2, addr3, government] = await ethers.getSigners();
        didRegistry = await DIDRegistry.deploy();
        await didRegistry.waitForDeployment();

        // Deploy the contract before each test
        TrustEstate = await ethers.getContractFactory("TrustEstate");
        landRegistry = await TrustEstate.deploy("TrustEstate", "TE", government.address, didRegistry.getAddress());
        await landRegistry.waitForDeployment();

        // Set up DIDs for all test addresses
        await didRegistry.connect(owner).register("did:example:owner", "test doc", true);
        await didRegistry.connect(addr1).register("did:example:addr1", "test doc", true);
        await didRegistry.connect(addr2).register("did:example:addr2", "test doc", true);
        await didRegistry.connect(addr3).register("did:example:addr3", "test doc", true);

        await landRegistry.connect(owner).register("did:example:owner");
        await landRegistry.connect(addr1).register("did:example:addr1");
        await landRegistry.connect(addr2).register("did:example:addr2");
        await landRegistry.connect(addr3).register("did:example:addr3");
    });

    it("Should mint a new plot of land with initial ownership", async function () {
        const owners = [
            { owner: owner.address, share: 6000 },
            { owner: addr1.address, share: 4000 }
        ];
        const ipfsHash = "QmTestHash12345";
        const allowIndividualTransfer = true;

        await landRegistry.connect(government).mintPlot(owners, ipfsHash, allowIndividualTransfer)

        const plot = await landRegistry.getPlot(0);
        expect(plot.id).to.equal(0);
        expect(plot.ipfsHash).to.equal(ipfsHash);
        expect(plot.allowIndividualTransfer).to.equal(allowIndividualTransfer);
    });

    it("Should fail if non government tries to mint", async function () {
        const owners = [
            { owner: owner.address, share: 6000 },
            { owner: addr1.address, share: 4000 }
        ];
        const ipfsHash = "QmTestHash12345";
        const allowIndividualTransfer = true;

        await expect(
            landRegistry.mintPlot(owners, ipfsHash, allowIndividualTransfer)
        ).to.be.revertedWith("Only the mandatory participant can mint plots")

    });

    it("Should create a split proposal", async function () {
        const owners = [
            { owner: owner.address, share: 6000 },
            { owner: addr1.address, share: 4000 }
        ];
        const ipfsHash = "QmTestHash12345";
        const allowIndividualTransfer = true;

        await landRegistry.connect(government).mintPlot(owners, ipfsHash, allowIndividualTransfer);

        const split1 = {
            ipfsHash: "QmSplitHash1",
            allowIndividualTransfer: true
        };
        const split2 = {
            ipfsHash: "QmSplitHash2",
            allowIndividualTransfer: true
        };

        const owners1 = [{ owner: owner.address, share: 10000 }];
        const owners2 = [{ owner: addr1.address, share: 10000 }];

        await expect(landRegistry.connect(owner).createSplitProposal(0, split1, split2, owners1, owners2))
            .to.emit(landRegistry, "ProposalCreated")
            .withArgs(0, 0);

        const proposal = await landRegistry.proposals(1);
        expect(proposal.plotId).to.equal(0);
        expect(proposal.executed).to.equal(false);
    });

    it("Should approve a proposal", async function () {
        const owners = [
            { owner: owner.address, share: 6000 },
            { owner: addr1.address, share: 4000 }
        ];
        const ipfsHash = "QmTestHash12345";
        const allowIndividualTransfer = true;

        await landRegistry.connect(government).mintPlot(owners, ipfsHash, allowIndividualTransfer);

        const split1 = {
            ipfsHash: "QmSplitHash1",
            allowIndividualTransfer: true
        };
        const split2 = {
            ipfsHash: "QmSplitHash2",
            allowIndividualTransfer: true
        };

        const owners1 = [{ owner: owner.address, share: 10000 }];
        const owners2 = [{ owner: addr1.address, share: 10000 }];

        await landRegistry.createSplitProposal(0, split1, split2, owners1, owners2);

        await expect(landRegistry.connect(owner).approveProposal(0))
            .to.emit(landRegistry, "ProposalApproved")
            .withArgs(0, 0, owner.address);

        const proposal = await landRegistry.proposals(0);
        // Check if the proposal exists and is not executed
        expect(proposal.plotId).to.equal(0);
        expect(proposal.executed).to.equal(false);

        // Verify that the owner is marked as an approver by trying to approve again
        await expect(
            landRegistry.connect(owner).approveProposal(0)
        ).to.be.revertedWith("Already approved");
    });

    it("Should execute a split proposal", async function () {
        const owners = [
            { owner: owner.address, share: 6000 },
            { owner: addr1.address, share: 4000 }
        ];
        const ipfsHash = "QmTestHash12345";
        const allowIndividualTransfer = true;

        await landRegistry.connect(government).mintPlot(owners, ipfsHash, allowIndividualTransfer);

        const split1 = {
            ipfsHash: "QmSplitHash1",
            allowIndividualTransfer: true
        };
        const split2 = {
            ipfsHash: "QmSplitHash2",
            allowIndividualTransfer: true
        };

        const owners1 = [{ owner: owner.address, share: 10000 }];
        const owners2 = [{ owner: addr1.address, share: 10000 }];

        await landRegistry.createSplitProposal(0, split1, split2, owners1, owners2);
        await landRegistry.connect(owner).approveProposal(0);
        await landRegistry.connect(addr1).approveProposal(0);
        await landRegistry.connect(government).approveProposal(0);

        const plot1 = await landRegistry.getPlot(1);
        expect(plot1.ipfsHash).to.equal("QmSplitHash1");
        expect(plot1.allowIndividualTransfer).to.equal(true);

        const plot2 = await landRegistry.getPlot(2);
        expect(plot2.ipfsHash).to.equal("QmSplitHash2");
        expect(plot2.allowIndividualTransfer).to.equal(true);
    });

    it("Should allow owner to merge two plots", async function () {
        const owners1 = [
            { owner: owner.address, share: 6000 },
            { owner: addr1.address, share: 4000 }
        ];
        const ipfsHash1 = "QmTestHash12345";
        const allowIndividualTransfer1 = true;

        const owners2 = [
            { owner: owner.address, share: 4000 },
            { owner: addr2.address, share: 6000 }
        ];
        const ipfsHash2 = "QmTestHash6789";
        const allowIndividualTransfer2 = true;

        await landRegistry.connect(government).mintPlot(owners1, ipfsHash1, allowIndividualTransfer1);
        await landRegistry.connect(government).mintPlot(owners2, ipfsHash2, allowIndividualTransfer2);

        const merge = {
            ipfsHash: "QmMergeHash",
            allowIndividualTransfer: true
        };
        const mergedOwners = [
            { owner: owner.address, share: 5000 },
            { owner: addr1.address, share: 5000 },
            { owner: addr2.address, share: 5000 }
        ];

        await landRegistry.createMergeProposal(0, 1, merge, mergedOwners);
        await landRegistry.connect(owner).approveProposal(0);
        await landRegistry.connect(addr1).approveProposal(0);
        await landRegistry.connect(addr2).approveProposal(0);
        await landRegistry.connect(government).approveProposal(0);

        const plot3 = await landRegistry.getPlot(2);
        expect(plot3.ipfsHash).to.equal("QmMergeHash");
        expect(plot3.allowIndividualTransfer).to.equal(true);
    });

    it("Should allow owners to transfer plots", async () => {
        const owners = [
            { owner: owner.address, share: 6000 },
            { owner: addr1.address, share: 4000 }
        ];
        const ipfsHash = "QmTestHash12345";
        const allowIndividualTransfer = true;

        await landRegistry.connect(government).mintPlot(owners, ipfsHash, allowIndividualTransfer);

        const transferOwners = [
            { owner: addr2.address, share: 9000 },
            { owner: addr3.address, share: 2000 }
        ];

        await landRegistry.createTransferProposal(0, transferOwners);

        await expect(landRegistry.connect(owner).approveProposal(0))
            .to.emit(landRegistry, "ProposalApproved")
            .withArgs(0, 0, owner.address);

        await expect(landRegistry.connect(addr1).approveProposal(0))
            .to.emit(landRegistry, "ProposalApproved")
            .withArgs(0, 0, addr1.address);

        const plot = await landRegistry.getPlot(0);
        expect(plot.id).to.equal(0);
        expect(plot.ipfsHash).to.equal(ipfsHash);
        expect(plot.allowIndividualTransfer).to.equal(true);
    });

    it("Should allow a plot owner to transfer ownership share", async () => {
        const owners = [
            { owner: owner.address, share: 6000 },
            { owner: addr1.address, share: 4000 }
        ];
        const ipfsHash = "QmTestHash12345";
        const allowIndividualTransfer = true;

        // Mint a new plot with initial ownership
        await landRegistry.connect(government).mintPlot(owners, ipfsHash, allowIndividualTransfer);

        // Owner transfers 2000 shares to addr2
        const transferAmount = 2000;
        await landRegistry.connect(owner).transferOwnershipShare(addr2.address, 0, transferAmount);

        // Verify updated ownership shares
        const ownerships = await landRegistry.getOwnership(0);

        // Check that owner has reduced shares
        expect(ownerships[0].owner).to.equal(owner.address);
        expect(ownerships[0].share).to.equal(4000);

        // Check that addr1 remains the same
        expect(ownerships[1].owner).to.equal(addr1.address);
        expect(ownerships[1].share).to.equal(4000);

        // Check that addr2 received the transferred shares
        expect(ownerships[2].owner).to.equal(addr2.address);
        expect(ownerships[2].share).to.equal(2000);
    });
});
