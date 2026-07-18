// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.2 <0.9.0;

contract Require {

    uint256 public numero = 295856; //CambiarA a valor 48
    address private propietario;

    constructor() {
        propietario = msg.sender;
    }

    function cambiarNumero(uint256 _num) public {
        require(msg.sender == propietario, "No eres el propietario");
        numero = _num;
    }

    function obtenerNumero() public view returns(uint256) {
        return numero;
    }

}