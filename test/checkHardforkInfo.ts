import { expect } from "chai";
import hre, { ethers } from "hardhat";
import axios from "axios";
import fs from "fs";


describe("check hardfork info", function () {
  it("check hardfork info before hardfork", async () => {
    const info = await getHardforkInfo()
    console.log(`hardforkInfo: ${JSON.stringify(info)}`);
    expect(info).to.deep.equal({});
  }).timeout(30000)

  it("check hardfork info after hardfork", async () => {
    let attempts = 0;
    let diff;
    let blockNumber;
    let shouldExitLoop = false;

    const startNumberStr = fs.readFileSync('hardfork_start_number.txt', 'utf8');
    const startNumber = Number(startNumberStr);

    while (attempts < 30 && !shouldExitLoop) {
      blockNumber = await ethers.provider.getBlockNumber();
      diff = blockNumber - startNumber;

      let expectedInfo;
      const info = await getHardforkInfo();
      console.log(`Diff: ${diff}, hardforkInfo: ${JSON.stringify(info)}`);
      if (attempts === 0 && diff < 0) {
        expect(info.Andromeda).to.satisfy((status: string) => status === 'proposed' || status === 'determined');
      } else if (diff >= 0) {
        expectedInfo = {"Andromeda": "enabled"};
        expect(info).to.deep.equal(expectedInfo);
      } else {
        expectedInfo = {"Andromeda": "determined"};
        expect(info).to.deep.equal(expectedInfo);
      }

      if (diff >= 0) {
        shouldExitLoop = true;
        continue;  // Skip the rest of the loop if diff is non-negative
      }
      if (diff < 0) {
        await new Promise(res => setTimeout(res, 5000));  // Sleep for 5 seconds if diff is negative
      }

      attempts++;
    }
  }).timeout(180000);
})

async function getHardforkInfo(): Promise<Record<string, string>> {
  const network = hre.network.name;
  const networkConfig = hre.config.networks[network];
  const URL = (networkConfig as any).url;

  const response = await axios.post(URL, {
    jsonrpc: '2.0',
    method: 'axon_getHardforkInfo',
    params: [],
    id: 1
  }, {
    headers: {
      'Content-Type': 'application/json'
    }
  });

  return response.data.result;
}
