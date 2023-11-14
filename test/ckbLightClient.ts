import { ethers } from "hardhat";
import { Signer } from "ethers";
import { CkbLightClient } from "../typechain-types";
import { expect } from "chai";

describe("CkbLightClient", function () {
  let ckbLightClientContract: CkbLightClient;
  let ckbLightClientContract0: CkbLightClient;
  let signer: Signer;
  let signer0: Signer;

  const header = {
    compactTarget: 0x1, // u32
    dao: Uint8Array.from(Array(32).fill(1)), // [u8; 32]
    epoch: 1n, // u64
    number: 0x1n, // u64
    parentHash: Uint8Array.from(Array(32).fill(1)), // [u8; 32]
    proposalsHash: Uint8Array.from(Array(32).fill(1)), // [u8; 32]
    timestamp: 0x1n, // u64
    transactionsRoot: Uint8Array.from(Array(32).fill(1)), // [u8; 32]
    version: 0x1, // u32
    nonce: BigInt("0x1"), // u128
    extraHash: Uint8Array.from(Array(32).fill(0)), // [u8; 32]
    extension: new Uint8Array(/* ... */), // Bytes
    blockHash: Uint8Array.from(Array(32).fill(1)), // [u8; 32]
  };

  beforeEach(async function () {
    const signers: Signer[] = await ethers.getSigners();
    const randomId = Math.ceil(Math.random() * 4);
    signer = signers[randomId];
    signer0 = signers[0];

    const ckbLightClientContractAddress = "0xffffffffffffffffffffffffffffffffffffff02";
    ckbLightClientContract = await ethers.getContractAt("CkbLightClient", ckbLightClientContractAddress, signer);
    ckbLightClientContract0 = await ethers.getContractAt("CkbLightClient", ckbLightClientContractAddress, signer0);
  });


  it("set state by validator", async function () {
    const tx = await ckbLightClientContract.setState(true);
    expect(tx.hash.length).to.equal(66)
    await tx.wait();
  });

  it("set state by non-validator", async function () {
    try {
      await ckbLightClientContract0.setState(true);
    } catch (error: unknown) {
      const errorMessage = (error as Error).message;
      expect(errorMessage).to.contain("check authorization error")
    }
  });

  it("update headers by validator", async function () {
    const tx = await ckbLightClientContract.update([header]);
    expect(tx.hash.length).to.equal(66)
    await tx.wait();
  });

  it("update headers by non-validator", async function () {
    try {
      await ckbLightClientContract.update([header]);
    } catch (error: unknown) {
      const errorMessage = (error as Error).message;
      expect(errorMessage).to.contain("check authorization error")
    }
  });

  it("rollback headers by validator", async function () {
    const blockHash = Uint8Array.from(Array(32).fill(1));
    const tx = await ckbLightClientContract.rollback([blockHash]);
    expect(tx.hash.length).to.equal(66)
    await tx.wait();
  });

  it("rollback headers by non-validator", async function () {
    const blockHash = Uint8Array.from(Array(32).fill(1));
    try {
      await ckbLightClientContract.rollback([blockHash]);
    } catch (error: unknown) {
      const errorMessage = (error as Error).message;
      expect(errorMessage).to.contain("check authorization error")
    }
  });
});
