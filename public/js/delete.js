function delete1(){
    var num = document.getElementById("number").innerText;
    console.log(num);
    location="http://10.10.202.239:2000/del?num="+num;
};