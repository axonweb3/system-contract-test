import hre, { ethers } from "hardhat";
import axios from 'axios';

describe("update metadata", function () {
  it("update max_contract_limit", async () => {
    const network = hre.network.name
    const id = (network === "node_0") ? 1 : parseInt(network.replace("node_", ""));
    const signers = await ethers.getSigners();
    const metadataManagerBase = await ethers.getContractAt("MetadataManager", "0xffffffffffffffffffffffffffffffffffffff01");
    const metadataManager = metadataManagerBase.connect(signers[id])
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
    try {
      const tx = await metadataManager.getFunction("updateConsensusConfig").send(consensusConfig);
      console.log(`Transaction hash: ${tx.hash}`);
      const receipt = await tx.wait();
      console.log(receipt ? `Transaction confirmed in block: ${receipt.blockNumber}` : 'Transaction receipt is null.');
    } catch (error: any) {
      console.error("An error occurred:", error?.message || "Unknown error");
    }
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
