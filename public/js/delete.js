function delete1(){
    var num = document.getElementById("number").innerText;
    console.log(num);
    location="http://localhost:2000/del?num="+num;
};