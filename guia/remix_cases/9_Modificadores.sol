// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.2 <0.9.0;

contract Modificadores {
    uint256 private fondos = 0;
    address private owner;

    constructor() {
        owner = msg.sender;
    }

    modifier isOwner() {
       require(msg.sender == owner, "No eres el propietario");
       _;
    }

    modifier notCero() {
        require(fondos > 0, "Fondo en cero");
        _;
    }

    function depositarFondos(uint256 monto) public {
        fondos = fondos + monto; //fondos = += monto;
    }

    function retirarFondos(uint256 monto) public isOwner notCero {
        //require(msg.sender == owner, "No eres el propietario");
        require(fondos >= monto, "Saldo insuficiente");
        fondos = fondos - monto; //fondos = -= monto;
    }

    function limpiarFondo() public isOwner notCero {
        //require(msg.sender == owner, "No eres el propietario");
        fondos = 0;
    }

    function consultarFondos() public view returns (uint256) {
        return fondos;
    }

}