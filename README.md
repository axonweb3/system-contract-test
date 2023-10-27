# Axon Hardfork Test

This project implements a testing process from the state of hardfork being disabled to being enabled.

1. Build Axon from source code
    ```shell
    cd $your_workspace
    git clone https://github.com/axonweb3/axon.git
    cd axon
    cargo build
    ```
2. Start multiple Axon nodes
   `reset.sh` is used to clear data and start axon nodes. You can also use it for the first-time startup.
    ```shell
    cd axon-hardfork-test
    bash reset.sh $your_workspace/axon
    ```
    You should see an output similar to this following:
    ```
    No process found listening on port 8001
    No process found listening on port 8002
    No process found listening on port 8003
    No process found listening on port 8004
    hardforks = ["None"]
    node_1 height: 6
    node_2 height: 6
    node_3 height: 6
    node_4 height: 6
    {
      "jsonrpc": "2.0",
      "result": {},
      "id": 1
    }
    {
      "jsonrpc": "2.0",
      "result": {},
      "id": 2
    }
    {
      "jsonrpc": "2.0",
      "result": {},
      "id": 3
    }
    {
      "jsonrpc": "2.0",
      "result": {},
      "id": 4
    }
    ```

3. Enable hardfork
   `hardfork.sh` enables the hardfork by [default after 30 blocks](https://github.com/sunchengzhu/axon-hardfork-test/blob/3880c355712c77d9fbef0863aaa382f0debec12b/hardfork.sh#L18).
    ```shell
    bash hardfork.sh $your_workspace/axon
    ```
   You should see an output similar to this following:
    ```
    axon_path: /Users/sunchengzhu/tmp/axon
    hardfork-start-number: 694
    Killing processes on port 8001: 9285
    Killing processes on port 8002: 9286
    Killing processes on port 8003: 9287
    Killing processes on port 8004: 9288
    node_1 height: 670
    node_2 height: 670
    node_3 height: 670
    node_4 height: 670
    {
      "jsonrpc": "2.0",
      "result": {
        "Andromeda": "determined"
      },
      "id": 1
    }
    {
      "jsonrpc": "2.0",
      "result": {
        "Andromeda": "determined"
      },
      "id": 2
    }
    {
      "jsonrpc": "2.0",
      "result": {
        "Andromeda": "determined"
      },
      "id": 3
    }
    {
      "jsonrpc": "2.0",
      "result": {
        "Andromeda": "determined"
      },
      "id": 4
    }
    ```
4. Get the nodes' hardfork info again  
   Until you see the return of `"Andromeda": "enabled"`.

5. Get the nodes' current metadata
```shell
for id in "${node_ids[@]}"; do
  port=$((8000 + id))
  url="http://localhost:${port}"

  curl_command="curl -sS -X POST ${url} -H 'Content-Type: application/json' --data '{\"jsonrpc\":\"2.0\",\"method\":\"axon_getCurrentMetadata\",\"params\":[],\"id\":"$id"}' | jq '.result.consensus_config.max_contract_limit'"

  eval "${curl_command}"
done
```
6. Verify max_contract_limit configuration: 0x6000(24576)
```shell
npx hardhat test --grep "deploy a big contract larger than max_contract_limit"
```
7. Select a node, for example node_2, to update the max_contract_limit
```shell
npx hardhat test --grep "update max_contract_limit" --network node_2
```
8. Get the nodes' current metadata again  
    You'll see max_contract_limit is 0x8000.
9. Verify max_contract_limit configuration: 0x8000(32768)
```shell
npx hardhat test --grep "deploy a big contract smaller than max_contract_limit"
```
