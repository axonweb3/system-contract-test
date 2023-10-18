#!/bin/bash
hardfork_start_number="$1"
axon_path="/Users/sunchengzhu/tmp/axon"

node_ids=(1 2 3 4)

for id in "${node_ids[@]}"; do
  kill "$(lsof -t -i:800"${id}")"
done

sleep 10

cd $axon_path || exit

for id in "${node_ids[@]}"; do
  target/debug/axon hardfork -c devtools/chain/nodes/node_"${id}".toml \
    --hardfork-start-number "$hardfork_start_number" --feature andromeda &
  sleep 3
done

sleep 10

for id in "${node_ids[@]}"; do
  target/debug/axon run \
    --config devtools/chain/nodes/node_"${id}".toml \
    >>/tmp/node_"${id}".log &
done
