#!/bin/bash

if [ "$1" ]; then
  axon_path="$1"
else
  axon_path="/Users/sunchengzhu/tmp/axon"
fi

cd $axon_path || exit
node_ids=(1 2 3 4)

for id in "${node_ids[@]}"; do
  port=$((8000 + id))
  PIDS=$(lsof -t -i:${port})
  if [[ -n $PIDS ]]; then
    echo "Killing processes on port 800${id}: $PIDS"
    echo "$PIDS" | while read pid; do
      kill $pid
    done
  else
    echo "No process found listening on port 800${id}"
  fi
done

sleep 5

rm -rf ./devtools/chain/data

if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' 's/hardforks = \[\]/hardforks = ["None"]/g' devtools/chain/specs/multi_nodes/chain-spec.toml
else
    sed -i 's/hardforks = \[\]/hardforks = ["None"]/g' devtools/chain/specs/multi_nodes/chain-spec.toml
fi

grep "hardforks" devtools/chain/specs/multi_nodes/chain-spec.toml


for id in "${node_ids[@]}"; do
  target/debug/axon init \
    --config devtools/chain/nodes/node_${id}.toml \
    --chain-spec devtools/chain/specs/multi_nodes/chain-spec.toml \
    >/tmp/node_${id}.log
done

for id in "${node_ids[@]}"; do
  target/debug/axon run \
    --config devtools/chain/nodes/node_"${id}".toml \
    >>/tmp/node_"${id}".log &
done

sleep 20

for id in "${node_ids[@]}"; do
  port=$((8000 + id))
  url="http://127.0.0.1:${port}"
  result_hex=$(curl -sS -X POST ${url} -H 'Content-Type: application/json' -d "{\"jsonrpc\":\"2.0\",\"method\":\"eth_blockNumber\",\"params\":[],\"id\":$id}" | jq -r '.result')
  result_decimal=$(( $result_hex ))
  echo "node_$id height: $result_decimal"
done

for id in "${node_ids[@]}"; do
  port=$((8000 + id))
  url="http://127.0.0.1:${port}"
  curl_command="curl -sS -X POST ${url} -H 'Content-Type: application/json' -d '{\"jsonrpc\":\"2.0\",\"method\":\"axon_getHardforkInfo\",\"params\":[],\"id\":"$id"}' | jq"
  eval "${curl_command}"
done
