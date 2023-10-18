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
sed -i 's/hardforks = \[\]/hardforks = ["None"]/g' devtools/chain/specs/multi_nodes_short_epoch_len/chain-spec.toml
# If on Mac, please use this sed command.
sed -i '' 's/hardforks = \[\]/hardforks = ["None"]/g' devtools/chain/specs/multi_nodes_short_epoch_len/chain-spec.toml
# Check the hardforks configuration.
grep "hardforks" devtools/chain/specs/single_node/chain-spec.toml
```
3. Start multiple Axon nodes
```shell
cargo build

node_ids=(1 2 3 4)
for id in "${node_ids[@]}"; do
  target/debug/axon init \
    --config devtools/chain/nodes/node_${id}.toml \
    --chain-spec devtools/chain/specs/multi_nodes_short_epoch_len/chain-spec.toml \
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

  curl_command="curl -sS -X POST ${url} -H 'Content-Type: application/json' -d '{\"jsonrpc\":\"2.0\",\"method\":\"axon_getHardforkInfo\",\"params\":[],\"id\":1}' | jq"

  eval "${curl_command}"
done
```

5. Run hardfork.sh
```shell
# 1. Update the $axon_path in hardfork.sh with your own Axon repository path.
# 2. Get the current block height
curl http://localhost:8001 -X POST -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params": [],"id":1}' | jq
# 3. Activate the Andromeda hardfork by providing a value greater than the current block height, for example, 100.
bash hardfork.sh 100
```
