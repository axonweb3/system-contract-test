import hre, { ethers } from "hardhat";
import axios from 'axios';

describe("update metadata", function () {
  it("update max_contract_limit", async () => {
    const signers = await ethers.getSigners();
    const randomId = Math.ceil(Math.random() * 4);
    const signer = signers[randomId];
    console.log("signer: ", signer.address)
    const metadataManagerBase = await ethers.getContractAt("MetadataManager", "0xffffffffffffffffffffffffffffffffffffff01");
    const metadataManager = metadataManagerBase.connect(signer)
    const consensusConfig = {
      propose_ratio: 0xfn,             // 15
      prevote_ratio: 0xan,             // 10
      precommit_ratio: 0xan,           // 10
      brake_ratio: 0xan,               // 10
      tx_num_limit: 0x4e20n,           // 20000
      max_tx_size: 0x186a0000n,        // 409600000
      gas_limit: 0x3e7fffffc18n,       // 4294967295000
      interval: 0xbb8n,                // 3000
      max_contract_limit: 0x8000n      // 32768
    };
    const from = signer.address
    const feeData = await ethers.provider.getFeeData();
    const gasPrice = "0x" + (feeData?.gasPrice?.toString(16) ?? "defaultValue");
    const to = "0xffffffffffffffffffffffffffffffffffffff01"
    const data = metadataManager.interface.encodeFunctionData("updateConsensusConfig", [consensusConfig]);
    console.log(`Encoded data: ${data}`);

    const tx = await ethers.provider.send("eth_sendTransaction", [{
      from,
      to,
      // 21000
      "gas": "0x5208",
      "gasPrice": gasPrice,
      "data": data
    }])

    const receipt = await getTxReceipt(tx, 100);
    console.log(receipt ? `Transaction confirmed in block: ${receipt.blockNumber}` : 'Transaction receipt is null.');

  }).timeout(60000)
})


export async function getMaxContractLimit(): Promise<bigint> {
  const network = hre.network.name
  const networkConfig = hre.config.networks[network];
  const URL = (networkConfig as any).url;
  const response = await axios.post(URL, {
    jsonrpc: '2.0',
    method: 'axon_getCurrentMetadata',
    params: [],
    id: 1
  }, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
  const maxContractLimitHex = response.data.result.consensus_config.max_contract_limit;

  return BigInt(maxContractLimitHex);
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

async function sleep(timeOut: number | undefined) {
  await new Promise(r => setTimeout(r, timeOut));
}
