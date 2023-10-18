# Axon Hardfork Test

This project implements a testing process from the state of hardfork being disabled to being enabled.

1. Clone the Axon repository
```shell
cd $your_workspace
git clone https://github.com/axonweb3/axon.git
cd axon
```
2. Configure to deactivate Andromeda hardfork activation (default is active)
```shell
sed -i 's/hardforks = \[\]/hardforks = ["None"]/g' devtools/chain/specs/multi_nodes/chain-spec.toml
# If on Mac, please use this sed command.
sed -i '' 's/hardforks = \[\]/hardforks = ["None"]/g' devtools/chain/specs/multi_nodes/chain-spec.toml
# Check the hardforks configuration.
grep "hardforks" devtools/chain/specs/multi_nodes/chain-spec.toml
```
3. Start multiple Axon nodes
```shell
cargo build

node_ids=(1 2 3 4)
for id in "${node_ids[@]}"; do
  target/debug/axon init \
    --config devtools/chain/nodes/node_${id}.toml \
    --chain-spec devtools/chain/specs/multi_nodes/chain-spec.toml \
    >/tmp/node_${id}.log
done

for id in "${node_ids[@]}"; do
  target/debug/axon run \
    --config devtools/chain/nodes/node_${id}.toml \
    >>/tmp/node_${id}.log &
done
```
4. Get the nodes' hardfork info
```shell
for id in "${node_ids[@]}"; do
  port=$((8000 + id))
  url="http://localhost:${port}"

  curl_command="curl -sS -X POST ${url} -H 'Content-Type: application/json' -d '{\"jsonrpc\":\"2.0\",\"method\":\"axon_getHardforkInfo\",\"params\":[],\"id\":"$id"}' | jq"

  eval "${curl_command}"
done
```

5. Run [hardfork.sh](https://github.com/sunchengzhu/axon-hardfork-test/blob/master/hardfork.sh)
```shell
# 1. Get the current block height
curl http://localhost:8001 -X POST -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params": [],"id":1}' | jq
# 2. Activate the Andromeda hardfork by providing a value greater than the current block height, for example, 100.
cd axon-hardfork-test
bash hardfork.sh 100 $your_workspace/axon
```
6. Get the nodes' hardfork info again  
   Until you see the return of `"Andromeda": "enabled"`.

7. Get the nodes' current metadata
```shell
for id in "${node_ids[@]}"; do
  port=$((8000 + id))
  url="http://localhost:${port}"

  curl_command="curl -sS -X POST ${url} -H 'Content-Type: application/json' --data '{\"jsonrpc\":\"2.0\",\"method\":\"axon_getCurrentMetadata\",\"params\":[],\"id\":"$id"}' | jq '.result.consensus_config.max_contract_limit'"

  eval "${curl_command}"
done
```
8. Verify max_contract_limit configuration: 0x6000
```shell
npx hardhat test --grep "deploy a big contract larger than max_contract_limit"
```
9. Select a node, for example node_2, to update the max_contract_limit
```shell
npx hardhat test --grep "update max_contract_limit" --network node_2
```
10. Get the nodes' current metadata again  
    You'll see max_contract_limit is 0x8000 (32768).
11. Verify max_contract_limit configuration: 0x8000
```shell
npx hardhat test --grep "deploy a big contract smaller than max_contract_limit"
```
