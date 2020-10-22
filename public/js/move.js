function go_to_sell() {
    location="http://10.10.202.239:2000/post_thing";
}


function not_login() {
    alert("로그인을 해주십시오.");
    location="http://10.10.202.239:2000/main_login";
}

function myBtn_1(x) {
    window.location="http://10.10.202.239:2000/category_1?id="+document.getElementById(x).getAttribute('value');
}
   
function sign_up(){
    location="http://10.10.202.239:2000/sign_up";
}

function go_get_money_seller(x){
    let tar = x.getAttribute('num');
    location="http://10.10.202.239:2000/get_money_seller?tar="+tar;
}

function go_get_money_buyer(x){
    let tar = x.getAttribute('num');
    location="http://10.10.202.239:2000/get_money_buyer?tar="+tar;
}

function posted_front(){
    console.log("작동함");
    console.log(document.getElementsByName('pic_front'));
    document.getElementById('pic_front').value='true';
    var reader = new FileReader();
    var img = document.getElementById('thumbnail1').children[0];    //div 밑에 있는 img element가져오기
    reader.onload = function(event){
        
            
            img.setAttribute("src",event.target.result); //src속성 설정
            img.setAttribute('width', 220)
            img.setAttribute('height',230);
        // document.querySelector("div#thumbnail1").appendChild(img);  //div에 넣어줌
        
        
    };
    reader.readAsDataURL(event.target.files[0])     //읽어옴
}

function posted_side(){
    console.log("작동함1");
    document.getElementById('pic_side').value='true';
    var reader = new FileReader();

    reader.onload = function(event){
        var img = document.getElementById('thumbnail2').children[0];    //img elemment생성
        img.setAttribute("src",event.target.result) //src속성 설정
        img.setAttribute('width', 220)
        img.setAttribute('height',230);

        // document.querySelector("div#thumbnail2").appendChild(img);  //div에 넣어줌
    };
    reader.readAsDataURL(event.target.files[0])     //읽어옴

}

function posted_back(){
    console.log("작동함2");
    document.getElementById('pic_back').value='true';
    var reader = new FileReader();

    reader.onload = function(event){
        var img = document.getElementById('thumbnail3').children[0];    //img elemment생성
        img.setAttribute("src",event.target.result) //src속성 설정
        img.setAttribute('width', 220)
        img.setAttribute('height',230);

        // document.querySelector("div#thumbnail3").appendChild(img);  //div에 넣어줌
    };
    reader.readAsDataURL(event.target.files[0])     //읽어옴

}

function move_detailpage(clicked_id){
    if(clicked_id=='no_product'){
        console.log(clicked_id)        
    }else{
        location="http://10.10.202.239:2000/main_detail?tar="+clicked_id;
    }

}

function go_to_rewrite(x){
    
    location="http://10.10.202.239:2000/post_thing_rewrite?tar="+x.substring(2,);
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
                document.getElementById("price_name"+i).innerHTML = data.result[i].post_price+"원";
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

function search(){
    xhttp.onreadystatechange = function(){
        if(this.readyState == 4 &&(this.status == 200 || this.status == 201)){
            var data =this.response;
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
        val : document.getElementById('search_data').value
    }
    console.log('searchdata:',data)
    var send_data = JSON.stringify(data)
    console.log('send-data:', send_data)

    xhttp.open("GET", "search_data?data="+data.val, true);
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.send(send_data)
}

function click_buy(x){
    var click = document.getElementById(x);
    let limit = document.getElementById('limit').innerText;
    console.log(limit)
    var coin_offer = document.getElementById('coin_offer').value;
    console.log(coin_offer)
    if(coin_offer>=limit){
        xhttp.onreadystatechange=function(){
            if(this.readyState ==4 &&(this.status ==200 || this.status == 201)){
                document.getElementById('coin_offer').outerHTML = "구매요청이 완료되었습니다. 약간의 시간이 소요됩니다."
                document.getElementById('eth').outerHTML = "";
                click.outerHTML = "";
            }
        }
    
        xhttp.open("GET", "main_detail_buy?tar="+x+"&coin_offer="+coin_offer, true);
        xhttp.setRequestHeader('Content-Type', 'application/json');
        xhttp.send();
    }else{
        alert("최소 거래 가능 금액보다 적습니다.");
    }
    
};


function click_sell(x){
    var click = document.getElementById(x);
    var sell = document.getElementsByClassName('sell_button');
    console.log("거래요청 완료")
    console.log(sell);
    xhttp.onreadystatechange=function(){
        if(this.readyState ==4 &&(this.status ==200 || this.status == 201)){
            click.outerHTML = "거래가 시작되었습니다.";
            for(var i =0; i<sell.length; i++){
                sell[i].disabled = true;
            }
        }
    }
    var data = {
        fixed_buyer : click.getAttribute('id'),
        num : click.getAttribute('num')
    }
    var data_json = JSON.stringify(data);
    console.log(data_json);
    xhttp.open("POST", "main_detail_sell", true);
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.send(data_json);
};



function category_list(x){
    console.log(x);
    xhttp.onreadystatechange=function(){
        if (this.readyState == 4 &&(this.status ==200 || this.status == 201)){
            var data = this.response;
            var y ='';
            for (var i=0; i<data.result.length;i++){
                y = y+"<option value='"+data.result[i].name+"'>"+data.result[i].name+"</option>"
            }
            console.log(data.result);
            document.getElementById('detail').innerHTML = y
        }
    }
        var data = {
            val : x
        };
        var data_json = JSON.stringify(data);
        console.log(data);
        xhttp.open("POST", "for_category_list", true); //data.val는 위에 변수data 안의 val값.
        //비동기 get형식으로 불러올때는 url에 쿼리값 같이 줘야됨.
        xhttp.setRequestHeader('Content-Type', 'application/json');
        xhttp.send(data_json);
}

function offer_again(){
    let limit = document.getElementById('limit').innerText;
    let tar = document.getElementsByName('coin_offer')[0].getAttribute('num');
    let coin_offer = document.getElementsByName('coin_offer')[0].value;
    if(coin_offer>=limit){
        location="http://10.10.202.239:2000/offer_again?tar="+tar+"&coin_offer="+coin_offer;
    }else{
        alert("최소 거래 가능 금액보다 적습니다.")
    }
}
    

function offer_cancel(){
    let tar = document.getElementsByName('coin_offer')[0].getAttribute('num');
    let coin_offer = document.getElementsByName('coin_offer')[0].value;
    location="http://10.10.202.239:2000/offer_cancel?tar="+tar+"&coin_offer="+coin_offer;
}

function get_ether(){
    let x = confirm("원래는 결제 진행창입니다.");
    let coin = document.getElementById('expected_eth').innerText;
    if(x){
        alert("코인이 들어오기까지 수 분정도 소요됩니다.")
        location="http://10.10.202.239:2000/exchanging?value="+coin;
    }
}