function go_to_sell() {
    location="http://localhost:2000/post_thing";
}

function temp_save() {
    location="http://localhost:5500/9.html";
}

function not_login() {
    alert("로그인을 해주십시오.");
    location="http://localhost:2000/main_login";
}

function myBtn_1(x) {
    window.location="http://localhost:2000/category_1?id="+document.getElementById(x).getAttribute('value');
}
   
// function myBtn_2() {
//     window.location="http://localhost:2000/category_2";
// }

// function myBtn_3() {
//     console.log("작동중");
//     window.location="http://localhost:2000/category_3";
// }

// function myBtn_4() {
//     window.location="http://localhost:2000/category_4";
// }

// function myBtn_5() {
//     window.location="http://localhost:2000/category_5";
// }

// function myBtn_6() {
//     window.location="http://localhost:2000/category_6";
// }

// function myBtn_7() {
//     console.log("작동중");
//     window.location="http://localhost:2000/category_7";
// }

function posted_front(){
    console.log("작동함");
    console.log(document.getElementsByName('pic_front'));
    document.getElementById('pic_front').value='true';
    var reader = new FileReader();

    reader.onload = function(event){
        var img = document.createElement("img");    //img elemment생성
        img.setAttribute("src",event.target.result) //src속성 설정
        img.setAttribute('width', 220)
        img.setAttribute('height',230);
        document.querySelector("div#thumbnail1").appendChild(img);  //div에 넣어줌
    };
    reader.readAsDataURL(event.target.files[0])     //읽어옴
}

function posted_side(){
    console.log("작동함1");
    document.getElementById('pic_side').value='true';
    var reader = new FileReader();

    reader.onload = function(event){
        var img = document.createElement("img");    //img elemment생성
        img.setAttribute("src",event.target.result) //src속성 설정
        img.setAttribute('width', 220)
        img.setAttribute('height',230);

        document.querySelector("div#thumbnail2").appendChild(img);  //div에 넣어줌
    };
    reader.readAsDataURL(event.target.files[0])     //읽어옴

}

function posted_back(){
    console.log("작동함2");
    document.getElementById('pic_back').value='true';
    var reader = new FileReader();

    reader.onload = function(event){
        var img = document.createElement("img");    //img elemment생성
        img.setAttribute("src",event.target.result) //src속성 설정
        img.setAttribute('width', 220)
        img.setAttribute('height',230);

        document.querySelector("div#thumbnail3").appendChild(img);  //div에 넣어줌
    };
    reader.readAsDataURL(event.target.files[0])     //읽어옴

}

function move_detailpage(clicked_id){
    //location="http://localhost:2000/14.ejs";

    //var dom = document.getElementById(clicked_id);
    location="http://localhost:2000/main_detail?tar="+clicked_id;
    console.log(clicked_id)
    console.log("bbbbb")
    //location="http://localhost:2000/22.ejs"
    // dom.setAttribute('href','/14.ejs')
    // console.log(dom.outerHTML)
    //var input = document.querySelector('#result0');
    // console.log(input.datset)
}

function go_to_rewrite(x){
    
    location="http://localhost:2000/post_thing_rewrite?tar="+x.substring(2,);
}
var xhttp = new XMLHttpRequest();
    xhttp.responseType = 'json';
function ww_click(w) {
    xhttp.onreadystatechange=function(){
    if (this.readyState == 4 &&(this.status ==200 || this.status == 201)){
        var data = this.response;
        for(var i =0; i<16; i++){
            if(typeof data.result[i] == 'undefined'){
                document.getElementById("image_name"+i).src = data.noimg;
                document.getElementById("title_name"+i).innerHTML = data.noproduct;
                document.getElementById("price_name"+i).innerHTML = data.noprice;
                document.getElementsByName("link_name"+i)[0].removeAttribute('onclick');
            }else{
                document.getElementById("image_name"+i).src = "/img/upload/"+data.result[i].post_picname_front+"jpg"
                document.getElementById("title_name"+i).innerHTML = data.result[i].post_title;
                document.getElementById("price_name"+i).innerHTML = data.result[i].post_price;
                document.getElementsByName('link_name'+i)[0].setAttribute('id',data.result[i].trans_num);
                document.getElementsByName('link_name'+i)[0].setAttribute('onclick','move_detailpage(this.id)');
            }        
            }
        }
    }
    var data = {
        val : document.getElementById(w).value
    };
    var data_json = JSON.stringify(data);
    console.log(data);
    xhttp.open("GET", "category_1_test?data1="+data.val, true); //data.val는 위에 변수data 안의 val값.
    //비동기 get형식으로 불러올때는 url에 쿼리값 같이 줘야됨.
    console.log();
    xhttp.setRequestHeader('Content-Type', 'application/json');
    console.log();
    xhttp.send(data_json);
};