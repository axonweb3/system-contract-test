import { ethers } from "hardhat";

describe("transfer", function () {
  it("transfer demo", async () => {
    const signers = await ethers.getSigners();
    const from = signers[0].address;
    const to = "0x7752DCD7c6ce4aED048c028021D635CBEc6C001D";
    const ethValue = "10";
    const value = "0x" + ethers.parseUnits(ethValue, "ether").toString(16);
    await transfer(from, to, value);
  })

  it("transfer to verifiers", async () => {
    const signers = await ethers.getSigners();
    const from = signers[0].address;
    const ethValue = "1";
    const value = "0x" + ethers.parseUnits(ethValue, "ether").toString(16);
    for (let i = 1; i < signers.length; i++) {
      const to = signers[i].address;
      const toBalance = await ethers.provider.getBalance(to);
      if (ethers.formatEther(toBalance) > ethValue) {
        console.log(`${to} already has sufficient balance: ${ethers.formatEther(toBalance)} eth`);
        continue;
      }
      await transfer(from, to, value);
    }
  })
})


async function transfer(from: string, to: string, value: string) {
  const from_balance = ethers.formatEther(await ethers.provider.getBalance(from));
  const to_balance = ethers.formatEther(await ethers.provider.getBalance(to));
  console.log(`before transfer ${from} balance:${from_balance} eth ${to} balance:${to_balance} eth`);
  const feeData = await ethers.provider.getFeeData();
  if (!feeData || !feeData.gasPrice) {
    throw new Error("Unable to fetch gas price from fee data");
  }
  const gasPrice = "0x" + feeData.gasPrice.toString(16);
  const gas = await ethers.provider.send("eth_estimateGas", [{
    from,
    to
  }])
  const txHash = await ethers.provider.send("eth_sendTransaction", [{
    from,
    to,
    "gas": gas,
    "gasPrice": gasPrice,
    "value": value,
    "data": "0x"
  }])
  console.log("txHash:", txHash)
  await getTxReceipt(txHash, 100);
  const from_balance_sent = ethers.formatEther(await ethers.provider.getBalance(from));
  const to_balance_sent = ethers.formatEther(await ethers.provider.getBalance(to));
  console.log(`after transfer ${from} balance:${from_balance_sent} eth ${to} balance:${to_balance_sent} eth`);
}

async function getTxReceipt(txHash: string, attempts: number) {
  for (let i = 0; i < attempts; i++) {
    const receipt = await ethers.provider.getTransactionReceipt(txHash);
    if (receipt !== null) {
      return receipt;
    }
    await sleep(1000);
  }
  return null;
}

async function sleep(timeOut: number) {
  await new Promise(r => setTimeout(r, timeOut));
}
