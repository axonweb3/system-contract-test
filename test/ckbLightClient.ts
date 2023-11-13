import { ethers } from "hardhat";
import { Signer } from "ethers";
import { CkbLightClient } from "../typechain-types";

describe("CkbLightClient", function () {
  let ckbLightClientContract: CkbLightClient;
  let signer: Signer;


  beforeEach(async function () {
    const signers: Signer[] = await ethers.getSigners();
    const randomId = Math.ceil(Math.random() * 4);
    signer = signers[randomId];

    const ckbLightClientContractAddress = "0xffffffffffffffffffffffffffffffffffffff03";
    ckbLightClientContract = await ethers.getContractAt("CkbLightClient", ckbLightClientContractAddress, signer);
  });


  it("set state", async function () {
    const tx= await ckbLightClientContract.setState(true);
    await tx.wait();
  });

  it("update headers", async function () {
    const header = {
      compactTarget: 0x1,
      dao: Uint8Array.from(new Array(32).fill(1)),
      epoch: 1n,
      blockHash: Uint8Array.from(new Array(32).fill(1)),
      number: 0x1,
      parentHash: Uint8Array.from(new Array(32).fill(1)),
      proposalsHash: Uint8Array.from(new Array(32).fill(1)),
      timestamp: 0x1,
      transactionsRoot: Uint8Array.from(new Array(32).fill(1)),
      version: 0x1,
      nonce: 0x1,
      extraHash: Uint8Array.from(new Array(32).fill(0)),
      unclesHash: Uint8Array.from(new Array(32).fill(0)),
    };
    const tx = await ckbLightClientContract.update([header]);
    await tx.wait();
  });

  it("rollback headers", async function () {
    const blockHash = "0x" + "5".repeat(64);
    const tx = await ckbLightClientContract.rollback([blockHash]);
    await tx.wait();
  });
});
