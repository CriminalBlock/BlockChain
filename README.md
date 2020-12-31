# Blocket
<!--
*** Thanks for checking out the Best-README-Template. If you have a suggestion
*** that would make this better, please fork the repo and create a pull request
*** or simply open an issue with the tag "enhancement".
*** Thanks again! Now go create something AMAZING! :D
-->



<!-- PROJECT SHIELDS -->
<!--
*** I'm using markdown "reference style" links for readability.
*** Reference links are enclosed in brackets [ ] instead of parentheses ( ).
*** See the bottom of this document for the declaration of the reference variables
*** for contributors-url, forks-url, etc. This is an optional, concise syntax you may use.
*** https://www.markdownguide.org/basic-syntax/#reference-style-links
-->



<!-- TABLE OF CONTENTS -->
<details open="open">
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#install">Install</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgements">Acknowledgements</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project

This is a used market web page utilized blockchain-based smart contracts.   
스마트 컨트랙트를 활용한 블록체인 기반 중고거래 웹 페이지입니다.

* 사용자 메인 페이지 / user main page   
![main](https://user-images.githubusercontent.com/68729868/102982462-e4e5dd00-454d-11eb-829c-6fdebcc5ece7.png)

* 관리자 메인 페이지 / manager main page   
![manager_main](https://user-images.githubusercontent.com/68729868/102987739-25e1ef80-4556-11eb-9ed6-1f6b1f5e59c7.png)
![manager_main2](https://user-images.githubusercontent.com/68729868/102988128-ce904f00-4556-11eb-9ab0-4208bbebab03.PNG)



## Tool
* [Bootstrap](https://getbootstrap.com)
* [JQuery](https://jquery.com)
* [Node.js](https://nodejs.org/ko)
* [express.js](https://expressjs.com/ko)
* [Ethereum](https://geth.ethereum.org)
* [MySQL](https://www.mysql.com)


### Prerequisites
* express.js version < 4   
* download Node.js   
* download GETH   


### Install

* npm
  ```
  npm install ejs
  ```
  ```
  npm install -g solc
  ```
  ```
  npm install express
  ```
  ```
  npm install web3
  
  ```
  
## Getting Started

1. Start to Geth and attach to RPC Client (It depends on your GETH settings)
  ```
  geth --networkid 4386 --nodiscover --maxpeers 0 --datadir "C:\ether1" --rpc --rpcapi "eth,web3,miner,admin,personal,net" --rpccorsdomain "*" --allow-insecure-unlock --mine --minerthreads 1 --etherbase 1
  ```
  ```
  geth attach rpc:http://localhost:8545
  ```
  
2. Start to mining
  ```
  miner.start(1)
  ```
  
3. Start to Server
  ```
  node main.js
  ```
  
4. You can access to 'Blocket'   
* url: http://www.ipaddress:2000/main


<!-- USAGE EXAMPLES -->
## Usage

Use this space to show useful examples of how a project can be used. Additional screenshots, code examples and demos work well in this space. You may also link to more resources.

_For more examples, please refer to the [Documentation](https://example.com)_


<!-- CONTACT -->
## Contact

Yuna Song - yuna1370@gmaile.com   
Jongwon Yun - [@your_twitter](https://twitter.com/your_username) - email@youremail.com   
Boseon Lee -    

Project Link: [https://github.com/CriminalBlock/semi-final](https://github.com/CriminalBlock/semi-final)

