import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

// 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
const privateKey0 = "ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
// 0x8ab0CF264DF99D83525e9E11c7e4db01558AE1b1、0xF386573563C3a75dBbd269FCe9782620826dDAc2、0x8af204AC5D7cB8815A6c53a50B72D01E729d3B22、0xf4cC1652DceC2e5De9cE6Fb1b6F9fA9456E957F1
const verifierPrivateKey1 = "37aa0f893d05914a4def0460c0a984d3611546cfb26924d7a7ca6e0db9950a2d"
const verifierPrivateKey2 = "383fcff8683b8115e31613949be24254b4204ffbe43c227408a76334a2e3fb32"
const verifierPrivateKey3 = "51ce21643b911347c5d5c85c323d9d5421810dc89f46b688720b2715f5e8e936"
const verifierPrivateKey4 = "69ff51f4c22f30615f68b88efa740f8f1b9169e88842b83d189748d06f1a948e"
const proofPrivateKey = "5af7968aa9b98c864e716ec42ea37d75a7904f0a5adc040405c24562a9f186ee"

const config: HardhatUserConfig = {
  solidity: "0.8.19",
  defaultNetwork: "node_1",
  networks: {
    node_0: {
      url: "http://127.0.0.1:8000",
      accounts: [privateKey0, verifierPrivateKey1]
    },
    node_1: {
      url: "http://127.0.0.1:8001",
      accounts: [privateKey0, verifierPrivateKey1, verifierPrivateKey2, verifierPrivateKey3, verifierPrivateKey4]
    },
    node_2: {
      url: "http://127.0.0.1:8002",
      accounts: [privateKey0, verifierPrivateKey1, verifierPrivateKey2, verifierPrivateKey3, verifierPrivateKey4]
    },
    node_3: {
      url: "http://127.0.0.1:8003",
      accounts: [privateKey0, verifierPrivateKey1, verifierPrivateKey2, verifierPrivateKey3, verifierPrivateKey4]
    },
    node_4: {
      url: "http://127.0.0.1:8004",
      accounts: [privateKey0, verifierPrivateKey1, verifierPrivateKey2, verifierPrivateKey3, verifierPrivateKey4]
    },
    proof: {
      url: "http://127.0.0.1:8001",
      accounts: [proofPrivateKey]
    }
  }
};
export default config;
