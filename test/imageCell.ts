import { ethers } from "hardhat";
import { Signer } from "ethers";
import { ImageCellType } from "../typechain-types";
import { expect } from "chai";

describe("ImageCell", function () {
  let imageCellContract: ImageCellType;
  let imageCellContract0: ImageCellType;
  let signer: Signer;
  let signer0: Signer;

  const script = {
    codeHash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    hashType: 0,
    args: "0x123456"
  };

  const outPoint = {
    txHash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
    index: 0
  };

  const cellInfo = {
    outPoint: outPoint,
    output: {
      capacity: 1000000,
      lock: script,
      type_: [script]
    },
    data: "0x1234567890abcdef"
  };

  const blockUpdate = [{
    blockNumber: 1,
    txInputs: [
      {txHash: "0x06064193f7827ba7d962ab5fd392c14ecec1df2d2cf77f563e6424536cdf0706", index: 0}
    ],
    txOutputs: [cellInfo]
  }];

  const blockRollback = {
    txInputs: [outPoint],
    txOutputs: [outPoint]
  };


  beforeEach(async function () {
    const signers: Signer[] = await ethers.getSigners();
    const randomId = Math.ceil(Math.random() * 4);
    signer = signers[randomId];
    signer0 = signers[0];

    const imageCellContractAddress = "0xffffffffffffffffffffffffffffffffffffff03";
    imageCellContract = await ethers.getContractAt("ImageCellType", imageCellContractAddress, signer);
    imageCellContract0 = await ethers.getContractAt("ImageCellType", imageCellContractAddress, signer0);
  });


  it("set state by validator", async function () {
    const tx = await imageCellContract.setState(true);
    expect(tx.hash.length).to.equal(66)
    await tx.wait();
  });

  it("set state by non-validator", async function () {
    try {
      await imageCellContract0.setState(true);
    } catch (error: unknown) {
      const errorMessage = (error as Error).message;
      expect(errorMessage).to.contain("check authorization error")
    }
  });

  it("update blocks by validator", async function () {
    const tx = await imageCellContract.update(blockUpdate);
    expect(tx.hash.length).to.equal(66)
    await tx.wait();
  });

  it("update blocks by non-validator", async function () {
    let errorOccurred = false;
    try {
      await imageCellContract0.update(blockUpdate);
    } catch (error: unknown) {
      errorOccurred = true;
      const errorMessage = (error as Error).message;
      expect(errorMessage).to.contain("check authorization error")
    }
    expect(errorOccurred, "Expected an error to occur during contract deployment, but none did.").to.equal(true);
  });

  it("rollback blocks by validator", async function () {
    const blockHash = Uint8Array.from(Array(32).fill(1));
    const tx = await imageCellContract.rollback([blockRollback]);
    expect(tx.hash.length).to.equal(66)
    await tx.wait();
  });

  it("rollback blocks by non-validator", async function () {
    const blockHash = Uint8Array.from(Array(32).fill(1));
    try {
      await imageCellContract0.rollback([blockRollback]);
    } catch (error: unknown) {
      const errorMessage = (error as Error).message;
      expect(errorMessage).to.contain("check authorization error")
    }
  });
});
