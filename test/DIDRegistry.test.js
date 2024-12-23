const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DIDRegistry", function () {
  let DIDRegistry;
  let registry;
  let owner;
  let addr1;
  let addr2;

  const testDID = "did:example:123";
  const testDocument = "QmTest123";
  const testCredentialType = "EducationCredential";
  const testVCHash = "QmVC456";

  beforeEach(async function () {
    DIDRegistry = await ethers.getContractFactory("DIDRegistry");
    [owner, addr1, addr2] = await ethers.getSigners();
    registry = await DIDRegistry.deploy();
    await registry.waitForDeployment();
  });

  describe("DID Registration", function () {
    it("Should register a new DID", async function () {
      await expect(registry.register(testDID, testDocument, true))
        .to.emit(registry, "DIDRegistered")
        .withArgs(testDID, owner.address);

      const isValid = await registry.verify(testDID);
      expect(isValid).to.be.true;
    });

    it("Should not allow registering the same DID twice", async function () {
      await registry.register(testDID, testDocument, true);
      await expect(
        registry.register(testDID, testDocument, true)
      ).to.be.revertedWith("DID already registered");
    });
  });

  describe("DID Document Updates", function () {
    beforeEach(async function () {
      await registry.register(testDID, testDocument, true);
    });

    it("Should update DID document", async function () {
      const newDocument = "QmNewTest456";
      await expect(registry.updateDocument(testDID, newDocument))
        .to.emit(registry, "DIDUpdated")
        .withArgs(testDID, newDocument);
    });

    it("Should not allow non-owner to update DID document", async function () {
      await expect(
        registry.connect(addr1).updateDocument(testDID, "QmNewTest789")
      ).to.be.revertedWith("Not DID owner");
    });
  });

  describe("Verifiable Credentials", function () {
    beforeEach(async function () {
      await registry.register(testDID, testDocument, true);
    });

    it("Should add a verifiable credential", async function () {
      await expect(
        registry.addVerifiableCredential(testDID, testCredentialType, testVCHash)
      )
        .to.emit(registry, "CredentialAdded")
        .withArgs(testDID, testCredentialType, testVCHash);

      const storedVC = await registry.getCredential(testDID, testCredentialType);
      expect(storedVC).to.equal(testVCHash);
    });

    it("Should not allow non-owner to add credentials", async function () {
      await expect(
        registry
          .connect(addr1)
          .addVerifiableCredential(testDID, testCredentialType, testVCHash)
      ).to.be.revertedWith("Not DID owner");
    });

    it("Should return empty string for non-existent credential", async function () {
      const nonExistentVC = await registry.getCredential(
        testDID,
        "NonExistentType"
      );
      expect(nonExistentVC).to.equal("");
    });
  });

  describe("DID Verification", function () {
    it("Should return false for non-registered DID", async function () {
      const isValid = await registry.verify("did:example:nonexistent");
      expect(isValid).to.be.false;
    });

    it("Should return true for registered DID", async function () {
      await registry.register(testDID, testDocument, true);
      const isValid = await registry.verify(testDID);
      expect(isValid).to.be.true;
    });
  });
});
