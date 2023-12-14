import { ethers } from "hardhat"
import { RLP } from '@ethereumjs/rlp'
import { equalsBytes, hexToBytes } from '@ethereumjs/util'
import { Trie } from '@ethereumjs/trie'
import { expect } from "chai";

describe('verify proof', () => {
  let storageAddress: string
  let storageSlot: string
  before(async function () {
    // https://sepolia.etherscan.io/address/0xD907B959E9de1852D6dDdd8B5BF26A6EC54387F1#code
    const Storage = await ethers.getContractFactory("Storage")
    const storage = await Storage.deploy()
    await storage.waitForDeployment()
    storageAddress = await storage.getAddress()

    const tx = await storage.getFunction('setStorage').send()
    await tx.wait()

    const signers = await ethers.getSigners()
    const signer = signers[0]
    const slot = '0x1'
    storageSlot = getStorageSlot(signer.address, slot)
  })

  it('getStorageAt', async () => {
    const pos0Hex = await ethers.provider.getStorage(storageAddress, '0x0')
    const pos0 = parseInt(pos0Hex, 16);
    expect(pos0).to.equal(1234)

    const pos1Hex = await ethers.provider.getStorage(storageAddress, storageSlot)
    const pos1 = parseInt(pos1Hex, 16);
    expect(pos1).to.equal(5678)
  })

  it('getProof verify success', async () => {
    const getProof = await ethers.provider.send('eth_getProof', [storageAddress, [storageSlot], 'latest']);
    const rootHash = getProof.storageHash
    expect(rootHash).to.equal('0x55b990cc1a1e53034bf577f5060958fc716a051a343f575d8e8b9f80a228c16d')
    const key = getProof.storageProof[0].key
    const value = getProof.storageProof[0].value
    const proofNodes = getProof.storageProof[0].proof
    const root = hexToBytes(rootHash)
    const proof = proofNodes.map((node: string) => hexToBytes(node))
    const proofTrie = await Trie.create({useKeyHashing: true})

    let errorOccurred = false
    try {
      const verifiedValue = await proofTrie.verifyProof(root, hexToBytes(key), proof)
      expect(equalsBytes(RLP.decode(verifiedValue!) as Uint8Array, hexToBytes(value)), 'Invalid proof or value').to.be.true
    } catch (error) {
      errorOccurred = true
      console.error('Proof verification failed:', error)
    }
    expect(errorOccurred).to.equal(false);
  })

  it('getProof verify fail', async () => {
    const getProof = await ethers.provider.send('eth_getProof', [storageAddress, [storageSlot], 'latest']);
    const rootHash = '0x3fa9ba7eae02e5f813c5cbfe8fbfc1b092b839aba7f307437a27953c0c924e5a'
    console.log(getProof.storageHash)
    const key = getProof.storageProof[0].key
    const proofNodes = getProof.storageProof[0].proof
    const root = hexToBytes(rootHash)
    const proof = proofNodes.map((node: string) => hexToBytes(node))
    const proofTrie = await Trie.create({useKeyHashing: true})

    let errorOccurred = false
    try {
      await proofTrie.verifyProof(root, hexToBytes(key), proof)
    } catch (error: unknown) {
      const message = (error as Error).message
      console.log(message)
      expect(message).to.equal('Invalid proof provided')
      errorOccurred = true
    }
    expect(errorOccurred).to.equal(true);
  })
})

function getStorageSlot(key: string, mappingSlot: string) {
  // Pad the key and the mapping slot to 32 bytes
  const keyPadded = ethers.zeroPadValue(key, 32);
  const formattedSlot = mappingSlot.length % 2 === 0 ? mappingSlot : `0x0${mappingSlot.slice(2)}`;
  const slotPadded = ethers.zeroPadValue(formattedSlot, 32);

  // Concatenate the padded key and slot
  const combined = keyPadded + slotPadded.slice(2); // Remove '0x' prefix from the second value

  // Calculate the keccak256 hash of the combined string
  return ethers.keccak256(combined);
}

describe('call system contracts', () => {
  const systemContracts = ['0xffffffffffffffffffffffffffffffffffffff00', '0xffffffffffffffffffffffffffffffffffffff01', '0xffffffffffffffffffffffffffffffffffffff02', '0xffffffffffffffffffffffffffffffffffffff03']
  it('call getStorageAt to system contracts', async () => {
    let errorCount = 0
    for (let i = 0; i < systemContracts.length; i++) {
      try {
        await ethers.provider.getStorage(systemContracts[0], '0x0')
      } catch (error: unknown) {
        const message = (error as Error).message
        if (message === 'Not allow to call system contract address') {
          errorCount++
        }
      }
    }
    expect(errorCount).to.equal(systemContracts.length)
  })

  it('call getProof to system contracts', async () => {
    let errorCount = 0
    for (let i = 0; i < systemContracts.length; i++) {
      try {
        await ethers.provider.send('eth_getProof', [systemContracts[0], ['0x0'], 'latest'])
      } catch (error: unknown) {
        const message = (error as Error).message
        if (message === 'Not allow to call system contract address') {
          errorCount++
        }
      }
    }
    expect(errorCount).to.equal(systemContracts.length)
  })
})
