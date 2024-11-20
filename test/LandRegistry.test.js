const { expect } = require("chai");
const { ethers } = require("hardhat");

// Test suite for LandRegistry contract
describe("LandRegistry", function () {
  let LandRegistry;
  let landRegistry;
  let owner;
  let addr1;
  let addr2;
  let addr3;

  beforeEach(async function () {
    // Deploy the contract before each test
    LandRegistry = await ethers.getContractFactory("LandRegistry");
    [owner, addr1, addr2, addr3] = await ethers.getSigners();
    landRegistry = await LandRegistry.deploy();
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
});
