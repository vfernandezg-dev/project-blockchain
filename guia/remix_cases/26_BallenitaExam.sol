// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.2 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BallenitaExamToken is ERC20, Ownable {

    uint256 public precioToken = 0.001 ether; //es igual a 1000000000000000
    mapping(address => uint) public donadores;

    event CompraTokens(address indexed invocador, uint256 bft, uint256 ethEnviado);

    constructor() ERC20("Ballenita Club Token", "BET") Ownable(msg.sender) { 
             
        _mint(owner(), 1000 * 10**18);
    }

    function mintear(address to, uint256 cantidad) public onlyOwner {
        _mint(to, cantidad * 10 ** 18);
    }

    function esSocio(address cuenta) public view returns (bool) {
        return balanceOf(cuenta) > 0;
    }

    function balanceOfBFT(address cuenta) public view returns(uint256) {
        return balanceOf(cuenta) / 10**18;
    }

    function comprarTokens() public payable { //me mandan 0.000000000001 tokens
        require(msg.value > 0, "Debes enviar un valor minimo de ETH");
        uint256 cantidadBFT = msg.value / precioToken;
        require(cantidadBFT > 0, "El ETH enviado es insuficiente");

        //Mint son tokens nuevos
        uint256 cantidadAjustada = cantidadBFT * 10 ** 18; 
        _mint(msg.sender, cantidadAjustada);

        donadores[msg.sender] += msg.value;
        emit CompraTokens(msg.sender, cantidadAjustada, msg.value);

    }

    function retirar() public onlyOwner {
        payable(owner()).transfer(address(this).balance);
    } 

}