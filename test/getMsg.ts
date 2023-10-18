import { ethers } from "hardhat";

describe("get msg", function () {
  it("get block msg", async () => {
    const blockNumber = await ethers.provider.getBlockNumber()
    const chainId = (await ethers.provider.getNetwork()).chainId
    const feeData = await ethers.provider.getFeeData()
    console.log(`latest block number: ${blockNumber}`)
    console.log(`chain id: ${chainId}`)
    console.log(feeData)
  }).timeout(30000)

  it("get accounts msg", async () => {
    const signers = await ethers.getSigners();
    const addresses = signers.map(signer => signer.address);
    const nonces = await Promise.all(addresses.map(address => ethers.provider.getTransactionCount(address)));
    const balances = await Promise.all(addresses.map(address => ethers.provider.getBalance(address)));
    for (let i = 0; i < signers.length; i++) {
      console.log(`account${i} ${signers[i].address} balance: ${ethers.formatEther(balances[i])} eth,nonce: ${nonces[i]}`);
    }
  }).timeout(60000)
})
