/*
    Ejercicio: Se da una lista ligada con numeros naturales, se busca
    modificar esta misma lista para que los numeros impares esten primero y
    despues los pares, y que permanezcan ordenados.
    Se asume que los numeros ya estan ordenados. 
    Ejemplo:
    input: 1 - 2 - 3 - 4 - 5 - 6
    output: 1 - 3 - 5 - 2 - 4 - 6
*/

//Funciones auxiliares para usar linked list

function Node(value, next){
    this.value = value;
    this.next = next;
}

function LinkedList(root){
    this.root = root;
}

LinkedList.prototype.arrToLinkedList = function(arr){
    this.root = new Node(arr[0], null);
    let current = this.root;
    for(let i = 1; i < arr.length; i++){
        current.next = new Node(arr[i], null)
        current = current.next;
    }
}

LinkedList.prototype.printList = function(){
    let current = this.root;
    let printS = "";
    while(current){
        printS += current.value;
        if(current.next) printS += " -> "
        current = current.next
    }
    console.log(printS)
}

//main Function

LinkedList.prototype.rearrangeOddsEvens = function(){
    //primero buscar los minimos de tanto par como impar y tener una referencia de ellos como roots
    //para despues unirlos al final
    //esto se hace porque no se sabe cuando apareceran el primer impar y el primer par.

    let minOdd;
    let minEven;
    let current = this.root;

    while(current){
        if(!minEven && current.value % 2 === 0) {
            minEven = current;
        }else if(!minOdd &&  current.value % 2 !== 0){
            minOdd = current;
        }
        current = current.next;   
    }
    //ahora, recorrer la lista, agregando cada par o impar a su propia fila.

    let nextOdd = minOdd;
    let nextEven = minEven;
    current = this.root;
    let tmp;
    while(current){
        if(current.value === minOdd.value || current.value === minEven.value){
            current = current.next;
            continue;
        }  
        if(current.value % 2 == 0){
            nextEven.next = current;
            nextEven = current;
        }else{
            nextOdd.next = current;
            nextOdd = current;
        }
        current = current.next;
    }

    //ahora, unir las lista, y sustituir root
    nextOdd.next = minEven;
    this.root = minOdd;
}

//Test

let initialValues = [1,2,3,4,5,6]
let list = new LinkedList();
list.arrToLinkedList(initialValues);
list.printList(); //printing input
console.log("---------------------")
list.rearrangeOddsEvens();
console.log(list)
list.printList(); //printing output
