pragma solidity ^0.5.16;
contract MulitiplyContract{
    address payable buyer;
    address payable manager;
    
    constructor(address payable _manager) public
        {
            manager = _manager;     //(_manager)매개변수로 받은값을 manager로 저장.
        }
        function Execution (address payable _buyer) public payable {
            require(msg.sender == manager);    //msg.sender(호출자의 지갑주소)가 manager일때만 함수 실행.
            buyer = _buyer;                    //(_buyer)매개변수로 받은값을 buyer로 저장.
            buyer.transfer(msg.value);         
        }
}
