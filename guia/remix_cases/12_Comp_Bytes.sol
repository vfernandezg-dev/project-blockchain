// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.2 <0.9.0;

contract CompBytes {

    bytes private datos;

    function guardarDatos(bytes memory _datos) public {
        datos = _datos;
    }

    function guardarDatosDesdeTexto(string memory _texto) public {
        datos = bytes(_texto);
    }

    function agregarDatos(bytes memory _datos) public {
        datos = bytes.concat(datos, _datos);
    }
    

    function obtenerDatos() public view returns(bytes memory) {
        return datos;
    }

    function obtenerDatosComoString() public view returns(string memory) {
        return string(datos);
    }

}