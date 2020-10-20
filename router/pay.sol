pragma solidity ^0.5.16;
contract escrow {
    struct buyer {
        address payable wallet_name_buyer;
        uint coin;
    }
    uint price;                                                                     // price of product
    bytes32 product;                                                               // value of product (string to hex)
    bytes32 re_product;
    uint8 target_person;                                                            // 판매하기로 확정된 사람
    address payable manager;
    constructor(uint _price, bytes32 _product, address payable _manager) public{
        price = _price;                                                             // price of product
        product = _product;
        manager = _manager;
    }
    address payable public seller_address = tx.origin;                              //최초의 계약 발행한 사람 (판매자)
    // constant address payable judgement = ''
    mapping (uint8 =>buyer) public buyers;
    uint8 nop;                                                                      //number of people who want to buy used product
    function set_buyers()  public payable {
        require(
            (msg.value >= price*1000000000000000000) &&                             // 기본적으로 wei 값으로 따짐
            (msg.sender != seller_address)
        );
        nop = nop + 1;
        buyers[nop].wallet_name_buyer = msg.sender;
        buyers[nop].coin = msg.value;
    }
    function sell_to_buyer(uint8 tar) public {                                      //구매자를 확정하는 함수
        require(msg.sender == seller_address);
        for(uint8 i = 1; i<=nop; i++){
            if(i == tar){
                target_person = i;
            }else{
                buyers[i].wallet_name_buyer.transfer(buyers[i].coin);
                buyers[i].coin = 0;
            }
        }
    }
    // function certificate_product(bytes32 check_product) public {                    //인증하는 함수
    //     require(msg.sender != seller_address);
    //     if(product == check_product){
    //         seller_address.transfer(buyers[target_person].coin);
    //         buyers[target_person].coin = 0;
    //     }else{
    //         msg.sender.transfer(buyers[target_person].coin);
    //         buyers[target_person].coin = 0;
    //     }
    // }
    function how_much() public view returns(uint[] memory){                         //제시가격 보여주는 함수
        uint[] memory coins = new uint[](nop);
        for(uint8 i = 0; i < nop; i++) {
            coins[i] = buyers[i+1].coin;
        }
        return coins;
    }
    function offer_again(uint8 tar) public payable {                                //제시가격 수정하는 함수
        require(
            msg.sender == buyers[tar].wallet_name_buyer &&
            buyers[tar].coin != 0
            );
        msg.sender.transfer(buyers[tar].coin);
        buyers[tar].coin = msg.value;
    }
    function certificate_product(bytes32 check_product) public returns(bool){                    //인증하는 함수
        require(msg.sender != seller_address);
        if(product == check_product){
            seller_address.transfer(buyers[target_person].coin);
            buyers[target_person].coin = 0;
            return true;
        }
        re_product = check_product;
        return false;
    }
    function certificate_product_seller(bytes32 check_product2) public returns(bool){                    //인증하는 함수
        require(msg.sender == seller_address);
        if(re_product == check_product2){
            buyers[target_person].wallet_name_buyer.transfer(buyers[target_person].coin);
            buyers[target_person].coin = 0;
            return true;
        }
        return false;
    }
    function seller_win() public payable {                                  //인증이 안됐을 때 관리자가 개입하는 함수
        require(
            (msg.sender == manager)
        );      //msg.sender: 송금자의 주소
            seller_address.transfer(buyers[target_person].coin);
            buyers[target_person].coin = 0;
    }
    function buyer_win() public payable{
        require(
            (msg.sender == manager)
            );
            buyers[target_person].wallet_name_buyer.transfer(buyers[target_person].coin);
            buyers[target_person].coin = 0;
    }
    
    function cancel(uint8 tar) public payable {
        require(msg.sender == buyers[tar].wallet_name_buyer);
        msg.sender.transfer(buyers[tar].coin);
        buyers[tar].coin=0;
        nop = nop -1;
        for(uint8 i = tar; i < nop+1; i++){
            buyers[i].wallet_name_buyer = buyers[i+1].wallet_name_buyer;
            buyers[i].coin = buyers[i+1].coin;
        }
        if(nop==0){
            delete buyers[1];
        }else{
            delete buyers[nop+1];
        }
    }
    
    function get_money() public payable {
        require(
            (msg.sender == seller_address) ||
            (msg.sender == buyers[target_person].wallet_name_buyer)
            );
        msg.sender.transfer(buyers[target_person].coin);
    }
    

}