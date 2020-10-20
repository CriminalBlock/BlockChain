pragma solidity ^0.5.16;
contract MulitiplyContract{
    address payable buyer;
    address payable manager;
    constructor(address payable _manager) public
        {
            manager = _manager;
        }
        function Execution (address payable _buyer) public payable {
            require(msg.sender == manager);
            buyer = _buyer;
            buyer.transfer(msg.value);
        }
        // function result (address _buyer, address _manager) public {
        // }
}