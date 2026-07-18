// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.2 <0.9.0;

contract Sender {

    uint256 private cantidad;
    address public cuentaInicial;

    constructor(uint256 _valorCantidad) {
        cantidad = _valorCantidad;
        cuentaInicial = msg.sender;
    }

    function obtenerCantidad() public view returns (uint256) {
        return cantidad;
    }


}