// 가격에 , 찍는 함수
var numberCustom = function(value){
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}