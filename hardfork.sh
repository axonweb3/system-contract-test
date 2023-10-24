#!/bin/bash

if [ "$1" ]; then
  axon_path="$1"
else
  axon_path="/Users/sunchengzhu/tmp/axon"
fi

if [ -d "$axon_path" ]; then
  echo "axon_path: $axon_path"
else
  echo "axon_path: $axon_path does not exist."
  exit 0
fi

current_block_hex=$(curl -s http://127.0.0.1:8001 -X POST -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params": [],"id":1}' | jq -r .result)
current_block_dec=$(($current_block_hex))
wait_block=30
hardfork_start_number=$(($current_block_dec + $wait_block))

echo "hardfork-start-number: $hardfork_start_number"
echo $hardfork_start_number >hardfork_start_number.txt

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

cd $axon_path || exit

for id in "${node_ids[@]}"; do
  target/debug/axon hardfork -config devtools/chain/nodes/node_"${id}".toml \
    --hardfork-start-number "$hardfork_start_number" --feature andromeda &
  sleep 2
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
  result_decimal=$(($result_hex))
  echo "node_$id height: $result_decimal"
done

for id in "${node_ids[@]}"; do
  port=$((8000 + id))
  url="http://127.0.0.1:${port}"
  curl_command="curl -sS -X POST ${url} -H 'Content-Type: application/json' -d '{\"jsonrpc\":\"2.0\",\"method\":\"axon_getHardforkInfo\",\"params\":[],\"id\":"$id"}' | jq"
  eval "${curl_command}"
done
