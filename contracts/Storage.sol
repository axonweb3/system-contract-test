// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.8.20;

contract Storage {
    uint pos0;
    mapping(address => uint) pos1;
    function setStorage() public {
        pos0 = 1234;
        pos1[msg.sender] = 5678;
    }
}
