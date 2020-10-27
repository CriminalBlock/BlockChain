
function check1(){
    var name = document.getElementsByName("id");
    console.log(name[0].value);
    location="http://192.168.0.105:2000/newacc_correct?"+"id="+name[0].value;
};

function check2(){
    location="http://192.168.0.105:2000/al3?num=1";
};
function check3(){
    location="http://192.168.0.105:2000/admin_user?num=1";
};

var xhttp = new XMLHttpRequest();
    xhttp.responseType = 'json';
function check_id(){
    
    xhttp.onreadystatechange=function(){
        if (this.readyState == 4 &&(this.status ==200 || this.status == 201)){
            var data = this.response;
            if(typeof data.result[0] == 'undefined'){
                alert("사용가능한 아이디입니다.");
                document.getElementsByName("id")[0].value = data.origin
            }else{
                alert("중복된 아이디입니다.");
                location.reload();
            }        
        
            }
    }
    var data = {
        id_val : document.getElementsByName("id")[0].value
    };
    var data_json = JSON.stringify(data);
    xhttp.open("POST", "sign_up_check", true);
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.send(data_json);
}

function check_all(){                                   //form 체크하는 함수
    var x = document.getElementsByTagName('input');
    var tar = 0;
    for(var i =1;i<x.length;i++){
        console.log(x[i].value);
        if(x[i].value != ''){
            tar = tar +1;
        }
    }
    console.log(tar);
    if(tar!=10){
        alert("정확히 입력해주세요!!!");
        location.reload();

    }else{
        document.getElementById("frm").submit();
    }
    
    

    
}

function check_all_temp(){                                   //form 체크하는 함수(임시 저장 페이지에서)
    var x = document.getElementsByTagName('input');
    var y = document.getElementsByName('hidden_num');
    var tar = 0;
    var tru = 0;
    var tar_array = [];

    
    xhttp.onreadystatechange=function(){
        if(this.readyState ==4 &&(this.status ==200 || this.status == 201)){
            var data = this.response;
            for(var i =1;i<x.length;i++){
                console.log(x[i].value);
                if(x[i].value != ''){
                    tar = tar +1;
                }
                
                if(x[i].value =='true'){
                    tar = tar -1;
                    tru = tru +1;
                    tar_array.push(1)
                }else if(x[i].value =='false'){
                    tar_array.push(0)
                }
            }
            if(data.array[0]!=tar_array[0] && data.array[1]!=tar_array[1] && data.array[2]!=tar_array[2]){
                console.log("동작동작")
                tar = tar + tru + data.num
            }else{
                if(tru > data.num){
                    tar = tar + tru
                }else{
                    tar = tar + data.num;
                }
            }
            console.log(data.array);
            console.log(tar_array);
        
            console.log(tar);
            if(tar!=11){
                alert("정확히 입력해주세요!!!");
                location.reload();
        
            }else{
                document.getElementById("frm").submit();
            }

        }
    }

    xhttp.open("GET", "check_site?tar="+y[0].value, true);
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.send();
    

    
}

function offer_check(){
    var x = document.getElementsByClassName('need')[0].getAttribute('num');
    xhttp.onreadystatechange=function(){
        if(this.readyState == 2 || this.readyState ==3){
            document.getElementsByName('click').innerText = "로딩 중...."
        }else if (this.readyState ==4 &&(this.status == 200 || this.status == 201)){
            var data = this.response;
            for(var i =0; i<data.amount.length; i++){
                document.getElementsByName('click')[i].innerText = data.amount[i]/1000000000000000000
            }
        }
    }
    xhttp.open("GET", "offer_check?tar="+x, true);
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.send();
}

function seller(x){
    console.log(x)
    var click_id = document.getElementById(x);

    xhttp.onreadystatechange=function(){
        if(this.readyState == 4 &&(this.status ==200 || this.status == 201)){
            var data = this.response;
            alert("판매자에게 eth 전송이 완료되었습니다.")
        }
    }
    var data ={
        trans_num : click_id.getAttribute('id')
    }
    var data_json = JSON.stringify(data)
    console.log(data)
    xhttp.open("GET","seller_win?trans_num="+data.trans_num, true);
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.send(data_json)
}

function buyer(x){
    console.log(x)
    var click_id = document.getElementById(x);

    xhttp.onreadystatechange=function(){
        if(this.readyState == 4 &&(this.status ==200 || this.status == 201)){
            var data = this.response;
            alert("구매자에게 eth 전송이 완료되었습니다.")
        }
    }
    var data ={
        trans_num : click_id.getAttribute('id')
    }
    var data_json = JSON.stringify(data)
    console.log(data)
    xhttp.open("GET","buyer_win?trans_num="+data.trans_num, true);
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.send(data_json)
}

function exchange_refused(x){
    console.log(x)
    var ex_num = document.getElementById(x);

    xhttp.onreadystatechange=function(){
        if(this.readyState == 4 &&(this.status ==200 || this.status == 201)){
            var data = this.response;
            alert('요청취소 처리가 완료되었습니다')
        }
    }
    var data ={
        ex_num : ex_num.getAttribute('id')
    }
    console.log(data)
    var data_json = JSON.stringify(data)
    xhttp.open("GET","exchange_denied?ex_num="+data.ex_num, true);
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.send(data_json)
}

function exchange_success(x){
    var ex_num = document.getElementById(x);
    xhttp.onreadystatechange=function(){
        if(this.readyState == 4 &&(this.status ==200 || this.status == 201)){
            var data = this.response;
            alert('eth 송금 완료')
        }
    }
    var data ={
        ex_num : ex_num.getAttribute('id')
    }
    console.log(data)
    var data_json = JSON.stringify(data)
    xhttp.open("GET","exchange_success?ex_num="+data.ex_num, true);
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.send(data_json)
}


function final_check(){
    xhttp.onreadystatechange=function(){
        if(this.readyState == 2 || this.readyState ==3){
            alert("로딩 중....")
        }else if (this.readyState ==4 &&(this.status == 200 || this.status == 201)){
            var data = this.response;
            if(data.check){
                let y = confirm("상품이 맞습니까?");
                if(y){
                    document.getElementsByName('booln')[0].value = y;
                    document.getElementById("auth_code").submit();
                }else{
                    document.getElementsByName('booln')[0].value = y;
                    document.getElementById("auth_code").submit();
                }
            }else{
                document.getElementById("auth_code").submit();
            }
        }
    }
    var data ={
        num : document.getElementsByName('num')[0].value,
        author : document.getElementsByName('author')[0].value
    }
    var data_json = JSON.stringify(data)
    xhttp.open("POST", "pre_authorize", true);
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.send(data_json);
}

function final_check_seller(){
    xhttp.onreadystatechange=function(){
        if(this.readyState == 2 || this.readyState ==3){
            alert("로딩 중....")
        }else if (this.readyState ==4 &&(this.status == 200 || this.status == 201)){
            var data = this.response;
            if(data.check){
                let y = confirm("상품이 맞습니까?");
                if(y){
                    document.getElementsByName('booln')[0].value = y;
                    document.getElementById("auth_code").submit();
                }else{
                    document.getElementsByName('booln')[0].value = y;
                    document.getElementById("auth_code").submit();
                }
            }else{
                document.getElementById("auth_code").submit();
            }
        }
    }
    var data ={
        num : document.getElementsByName('num')[0].value,
        author : document.getElementsByName('author')[0].value
    }
    var data_json = JSON.stringify(data)
    xhttp.open("POST", "pre_authorize_seller", true);
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.send(data_json);
}