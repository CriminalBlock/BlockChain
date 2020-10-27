function delete1(){
    var num = document.getElementById("number").innerText;
    console.log(num);
    location="http://192.168.0.105:2000/del?num="+num;
};