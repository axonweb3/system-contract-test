import { ethers } from "hardhat";
import { expect } from 'chai';
import { getMaxContractLimit } from "./updateMetadata";

describe("check metadata", function () {
  // Test whether max_contract_limit is effective
  it("deploy a big contract larger than max_contract_limit", async () => {
    const maxContractLimit = await getMaxContractLimit();
    console.log(`max_contract_limit: ${maxContractLimit}`)
    // expect(maxContractLimit < BigInt(27489)).to.be.true;

    const BigContract = await ethers.getContractFactory("BigContract");
    let errorOccurred = false;
    try {
      const bigContract = await BigContract.deploy();
      await bigContract.waitForDeployment();
    } catch (error: unknown) {
      errorOccurred = true;
      if (typeof error === 'object' && error !== null && 'data' in error) {
        const errorData = error.data
        expect(errorData).to.equal("CreateContractLimit", `Unexpected error data: ${errorData}`);
      }
    }
    expect(errorOccurred, "Expected an error to occur during contract deployment, but none did.").to.equal(true);
  }).timeout(60000)

  it("deploy a big contract smaller than max_contract_limit", async () => {
    const BigContract = await ethers.getContractFactory("BigContract");
    const bigContract = await BigContract.deploy();
    await bigContract.waitForDeployment();
    const address = await bigContract.getAddress();
    console.log("bigContract address:", address);
    const bytecode = bigContract.deploymentTransaction()?.data;
    if (!bytecode) {
      throw new Error("bytecode is undefined or empty");
    }
    const contractSize = (bytecode.length - 2) / 2;
    console.log(`Contract size: ${contractSize} bytes`);

    const maxContractLimit = await getMaxContractLimit();
    console.log(`max_contract_limit: ${maxContractLimit}`)
    expect(maxContractLimit).to.be.equal(32768)

    expect(contractSize && maxContractLimit >= BigInt(contractSize)).to.be.true;
  }).timeout(60000)

  it("deploy a normal contract", async () => {
    const SimpleStorage = await ethers.getContractFactory("SimpleStorage");
    const simpleStorage = await SimpleStorage.deploy();
    await simpleStorage.waitForDeployment();
    const address = await simpleStorage.getAddress();
    console.log("simpleStorage address:", address);
    const bytecode = simpleStorage.deploymentTransaction()?.data;
    console.log(bytecode ? `Contract size: ${(bytecode.length - 2) / 2} bytes` : "Unable to retrieve bytecode.");
  }).timeout(60000)
})

