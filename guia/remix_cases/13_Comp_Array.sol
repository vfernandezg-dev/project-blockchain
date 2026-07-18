// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.2 <0.9.0;

contract CompArrays {
    //Struct
    struct Alumno {
        string nombre;
        uint edad;
    }

    uint256[] public numeros;

    Alumno[] private alumnos;

    function agregarNumero(uint _num) public{
        numeros.push(_num);
    }

    function obtenerNumeros() public view returns(uint256[] memory){
        return numeros;
    }

    function getTamanioArray() public view returns(uint) {
        return numeros.length;
    }

    //function numeros(uint256 indice) public view returns(uint) --> Crea el compilador

    //Para arreglo
    function agregarAlumno(string memory _nombre, uint _edad) public {
        alumnos.push(Alumno(_nombre, _edad));
    }

    function mostrarAlumno(uint256 i) public view returns(string memory, uint) {
        //version 1
        Alumno memory a = alumnos[i];   
        return (a.nombre, a.edad);

        //version 2
        //return (alumnos[i].nombre, alumnos[i].edad);
    }

}