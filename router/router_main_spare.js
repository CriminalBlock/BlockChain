var bodyParser = require("body-parser");
const { render } = require("ejs");
const { FileArray } = require("express-fileupload");
var parser = bodyParser.urlencoded({extended:false});
var fs = require("fs");
var solc = require("solc");
var Web3 = require("web3");
var web3 = new Web3('http://localhost:8545');

const mysql = require("mysql2");
const { NULL } = require("mysql2/lib/constants/types");
let conn_info = {
    host : 'localhost',
    port : 3320,
    user : 'root',
    password : '1234',
    database : 'mydb'
};

let source = fs.readFileSync(__dirname+"/pay.sol", 'utf8');             //source에 pay.sol을 utf8형식으로 불러옴
let solcInput = {                                                       //solc.compile이 json타입으로 입력되어야 하므로 꼴을 맞춰줌
    language: "Solidity",
    sources: {
        contract: {
            content: source
        }
    },
    settings: {
        outputSelection: {
            '*': {
                '*': ['*']
            }
        }
    }
}

let compiledContract = solc.compile(JSON.stringify(solcInput));
let output = JSON.parse(compiledContract);
let bytecode = output.contracts.contract['escrow'].evm.bytecode.object;     //컴파일 후 bytecode 가져오기
let abi = output.contracts.contract['escrow'].abi;                          //컴파일 후 abi 가져오기            bytecode와 abi는 deploy할 때 꼭 필요하다. abi는 배포된 계약 주소를 통해 계약 내부 메소드 호출이나 상태를 변경시키기 위한 instance를 만들 때 필요하다.

module.exports = function(app) {

    app.get('/main_1',function(req,res){
        req.session.data1 = undefined;
        let conn = mysql.createConnection(conn_info)
        var sql = "select trans_num, post_picname_front, post_picname_side, post_picname_back, post_title, post_price_max from post where determinant = 1"
        conn.query(sql, (err, result)=>{
            var data = {
                result : result,
                noproduct : '등록된 상품이 없습니다',
                noprice : '-',
                noimg : 'no image'
            }
            result.reverse();       //result를 reverse해서 가장 최신게시글이 자동으로 result[0]이 돼서 화면에 뿌려주는 코드 
            console.log("result:",result)

        res.render('./main/1.ejs', data);     //로그인 안 했을 때 메인페이지: main/1 로 먼저 데이터 뿌려주기
        
        })
    });

    app.get('/main_login', function(req,res){       
        
        res.render('./main/3.ejs');     //로그인 화면
    });

    app.get("/sign_up", function(req,res){
        res.render("./main/sign_up.ejs");
    })

    app.post("/sign_up_check", parser,function(req,res){
        let conn = mysql.createConnection(conn_info);
        let sql1 = "select user_id from guest where user_id = ?";
        conn.query(sql1, req.body.id_val,(err,result)=>{
            var data = {
                result : result,
                origin : req.body.id_val
            }
            console.log(typeof data.result);
            res.json(data);
        })
    });

    app.post("/sign_up_finished", parser, function(req,res){
        try{
            let conn = mysql.createConnection(conn_info);
            let sql = "insert into guest (user_id, password, wallet_add) values(?, ?, ?) ";
            let addr = web3.eth.personal.newAccount(req.body.pw);
            let tar = [req.body.id, req.body.pw, addr]
            conn.query(sql, tar, (err)=>{
                console.log("저장");
                res.redirect("/main_login");
            })
        }catch(error){
            console.log(error);
        }
        
    })

    app.post('/main_1_in',parser,function(req,res){
        let conn = mysql.createConnection(conn_info);
        let sql1 = "select user_id, password, wallet_add from guest where user_id = ?";
        let tar = [req.body.id, req.body.pw];
        req.session.data1 = req.body.id;
        conn.query(sql1,tar,(err,result)=>{
            console.log(result);
            if (result==''){
                console.log("실행");
                res.redirect('main_login');
            }else{
                if (result[0].password != req.body.pw){
                    res.redirect('main_login');
                }else{
                    web3.eth.personal.unlockAccount(result[0].wallet_add, result[0].password, 600);
                    let conn = mysql.createConnection(conn_info)
                    var sql = "select trans_num, post_picname_front, post_title, post_price_max from post where determinant = 1"
                    conn.query(sql, (err, result)=>{
                        result.reverse();       //result를 reverse해서 가장 최신게시글이 자동으로 result[0]이 돼서 화면에 뿌려주는 코드            
                        var render_data = {
                            name : req.body.id,
                            result : result,
                            noproduct : '등록된 상품이 없습니다',
                            noprice : '-',
                            noimg : 'no image'

                        }
                    
                    res.render('./main/1_in.ejs',render_data);      //로그인 했을 때: main/1_in
                    })
                }
            };
        });
    })

    app.get('/post_thing', function(req,res){           //물품 등록
        let conn = mysql.createConnection(conn_info)
        var sql = 'select 여성의류 from category'
        conn.query(sql, (err,result)=>{
            var render_data = {
                result : result
            }
            res.render('./main/8.ejs', render_data);
        })
        
    });

    app.post('/for_category_list', function(req,res){
        console.log("실행");
        let conn = mysql.createConnection(conn_info);
        var sql = "select "+req.body.val+" as name"+" from category";
        conn.query(sql, (err,result)=>{
            var data = {
                result : result
            }
            res.json(data);
        })
    })

    app.get('/post_thing_rewrite', function(req,res){           //임시 저장 수정 시
        let conn = mysql.createConnection(conn_info);
        var sql = "select trans_num, post_picname_front, post_picname_side, post_picname_back, post_category, post_detail_category, post_title, post_price_min, post_price_max, post_content from post where trans_num = ?";
        conn.query(sql, req.query.tar, (err, result)=>{
            
            var sql1 = "select "+result[0].post_category+" as name from category";
            conn.query(sql1,(err,result1)=>{
                var render_data = {
                    result : result,
                    array : ['여성의류','남성의류','전자기기','가구','도서','스포츠_레저'],
                    result1 : result1
                }
                console.log(result1)
                res.render('./main/8_temp.ejs', render_data);
            })
            
        })
        
    });

    app.get('/check_site',function(req,res){                    // 임시 저장에서 게시물 등록 시 필요한 요소가 있나 체크하는 곳
        let conn = mysql.createConnection(conn_info);
        var sql = 'select post_picname_front, post_picname_side, post_picname_back from post where trans_num = ?';
        var num = 0;
        var array = [0,0,0];
        conn.query(sql, req.query.tar, (err, result)=>{
            if(result[0].post_picname_front!=null){
                num = num+1
                array[0]=1
            }
            if(result[0].post_picname_side!=null){
                num = num+1
                array[1]=1
            }
            if(result[0].post_picname_back!=null){
                num = num+1
                array[2]=1
            }
            var data ={
                num : num,
                array: array
            }
            console.log(data.array);
            console.log(data.num);
            res.json(data);

        })
    })

    //임시저장
    app.post('/post_thing/temp_save',parser, function(req,res){
        
        var array_check = [req.body.pic_front,req.body.pic_side,req.body.pic_back];

        //사진 3장 첨부할 때 첨부 안해도 err 안나오게 한 코드(임시저장)
        switch(array_check.join()){
            case 'false,false,false' :
                var tar = [req.body.category, req.body.detail, req.body.title, req.body.price[0], req.body.price[1], req.body.content, req.session.data1, false];
                var sql1 = "insert into post (post_category, post_detail_category, post_title, post_price_min, post_price_max, post_content, user_id, determinant) values(?, ?, ?, ?, ?, ?, ?, ?)";
                break

            case 'true,false,false' :
                var tar = [req.body.category, req.body.detail, req.body.title, req.body.price[0], req.body.price[1], req.body.content, req.session.data1, req.files.file_name_front.name.substring(0,req.files.file_name_front.name.length-3), false];
                var sql1 = "insert into post (post_category, post_detail_category, post_title, post_price_min, post_price_max, post_content, user_id, post_picname_front, determinant) values(?, ?, ?, ?, ?, ?, ?, ?, ?)";
                req.files.file_name_front.mv(__dirname.substring(0,__dirname.length-6)+'public/img/upload/'+req.files.file_name_front.name.substring(0,req.files.file_name_front.name.length-3)+'jpg', function(err){
                    if(err){
                        console.log(err);
                    }else{
                        console.log("uploaded");
                    }
                });
                break    

            case 'false,true,false' :
                var tar = [req.body.category, req.body.detail, req.body.title, req.body.price[0], req.body.price[1], req.body.content, req.session.data1, req.files.file_name_side.name.substring(0,req.files.file_name_side.name.length-3), false];
                var sql1 = "insert into post (post_category, post_detail_category, post_title, post_price_min, post_price_max, post_content, user_id, post_picname_side, determinant) values(?, ?, ?, ?, ?, ?, ?, ?, ?)";
                req.files.file_name_side.mv(__dirname.substring(0,__dirname.length-6)+'public/img/upload/'+req.files.file_name_side.name.substring(0,req.files.file_name_side.name.length-3)+'jpg', function(err){
                    if(err){
                        console.log(err);
                    }else{
                        console.log("uploaded");
                    }
                });
                break

            case 'false,false,true' :
                var tar = [req.body.category, req.body.detail, req.body.title, req.body.price[0], req.body.price[1], req.body.content, req.session.data1, req.files.file_name_back.name.substring(0,req.files.file_name_back.name.length-3), false];
                var sql1 = "insert into post (post_category, post_detail_category, post_title, post_price_min, post_price_max, post_content, user_id, post_picname_back, determinant) values(?, ?, ?, ?, ?, ?, ?, ?)";
                req.files.file_name_back.mv(__dirname.substring(0,__dirname.length-6)+'public/img/upload/'+req.files.file_name_back.name.substring(0,req.files.file_name_back.name.length-3)+'jpg', function(err){
                    if(err){
                        console.log(err);
                    }else{
                        console.log("uploaded");
                    }
                });
                break

            case 'true,true,false' :
                var tar = [req.body.category, req.body.detail, req.body.title, req.body.price[0], req.body.price[1], req.body.content, req.session.data1, req.files.file_name_front.name.substring(0,req.files.file_name_front.name.length-3), req.files.file_name_side.name.substring(0,req.files.file_name_side.name.length-3), false];
                var sql1 = "insert into post (post_category, post_detail_category, post_title, post_price_min, post_price_max, post_content, user_id, post_picname_front, post_picname_side, determinant) values(?, ?, ?, ?, ?, ?, ?, ?, ?,?)";

                req.files.file_name_front.mv(__dirname.substring(0,__dirname.length-6)+'public/img/upload/'+req.files.file_name_front.name.substring(0,req.files.file_name_front.name.length-3)+'jpg', function(err){
                    if(err){
                        console.log(err);
                    }else{
                        console.log("uploaded");
                    }
                });

                req.files.file_name_side.mv(__dirname.substring(0,__dirname.length-6)+'public/img/upload/'+req.files.file_name_side.name.substring(0,req.files.file_name_side.name.length-3)+'jpg', function(err){
                    if(err){
                        console.log(err);
                    }else{
                        console.log("uploaded");
                    }
                });
                break

            case 'true,false,true' :
                var tar = [req.body.category, req.body.detail, req.body.title, req.body.price[0], req.body.price[1], req.body.content, req.session.data1, req.files.file_name_front.name.substring(0,req.files.file_name_front.name.length-3), req.files.file_name_back.name.substring(0,req.files.file_name_back.name.length-3), false];
                var sql1 = "insert into post (post_category, post_detail_category, post_title, post_price_min, post_price_max, post_content, user_id, post_picname_front, post_picname_back, determinant) values(?, ?, ?, ?, ?, ?, ?, ?, ?)";
                
                req.files.file_name_front.mv(__dirname.substring(0,__dirname.length-6)+'public/img/upload/'+req.files.file_name_front.name.substring(0,req.files.file_name_front.name.length-3)+'jpg', function(err){
                    if(err){
                        console.log(err);
                    }else{
                        console.log("uploaded");
                    }
                });

                req.files.file_name_back.mv(__dirname.substring(0,__dirname.length-6)+'public/img/upload/'+req.files.file_name_back.name.substring(0,req.files.file_name_back.name.length-3)+'jpg', function(err){
                    if(err){
                        console.log(err);
                    }else{
                        console.log("uploaded");
                    }
                });
                break

            case 'false,true,true' :
                var tar = [req.body.category, req.body.detail, req.body.title, req.body.price[0], req.body.price[1], req.body.content, req.session.data1, req.files.file_name_side.name.substring(0,req.files.file_name_side.name.length-3), req.files.file_name_back.name.substring(0,req.files.file_name_back.name.length-3), false];
                var sql1 = "insert into post (post_category, post_detail_category, post_title, post_price_min, post_price_max, post_content, user_id, post_picname_side, post_picname_back, determinant) values(?, ?, ?, ?, ?, ?, ?, ?, ?)";
                
                req.files.file_name_side.mv(__dirname.substring(0,__dirname.length-6)+'public/img/upload/'+req.files.file_name_side.name.substring(0,req.files.file_name_side.name.length-3)+'jpg', function(err){
                    if(err){
                        console.log(err);
                    }else{
                        console.log("uploaded");
                    }
                });

                req.files.file_name_back.mv(__dirname.substring(0,__dirname.length-6)+'public/img/upload/'+req.files.file_name_back.name.substring(0,req.files.file_name_back.name.length-3)+'jpg', function(err){
                    if(err){
                        console.log(err);
                    }else{
                        console.log("uploaded");
                    }
                });
                break
                
            default :
                var tar = [req.body.category, req.body.detail, req.body.title, req.body.price[0], req.body.price[1], req.body.content, req.session.data1, req.files.file_name_front.name.substring(0,req.files.file_name_front.name.length-3), req.files.file_name_side.name.substring(0,req.files.file_name_side.name.length-3), req.files.file_name_back.name.substring(0,req.files.file_name_back.name.length-3), false];
                var sql1 = "insert into post (post_category, post_detail_category, post_title, post_price_min, post_price_max, post_content, user_id, post_picname_front, post_picname_side, post_picname_back, determinant) values(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                
                req.files.file_name_front.mv(__dirname.substring(0,__dirname.length-6)+'public/img/upload/'+req.files.file_name_front.name.substring(0,req.files.file_name_front.name.length-3)+'jpg', function(err){
                    if(err){
                        console.log(err);
                    }else{
                        console.log("uploaded");
                    }
                });

                req.files.file_name_side.mv(__dirname.substring(0,__dirname.length-6)+'public/img/upload/'+req.files.file_name_side.name.substring(0,req.files.file_name_side.name.length-3)+'jpg', function(err){
                    if(err){
                        console.log(err);
                    }else{
                        console.log("uploaded");
                    }
                });

                req.files.file_name_back.mv(__dirname.substring(0,__dirname.length-6)+'public/img/upload/'+req.files.file_name_back.name.substring(0,req.files.file_name_back.name.length-3)+'jpg', function(err){
                    if(err){
                        console.log(err);
                    }else{
                        console.log("uploaded");
                    }
                });
            };
        let conn = mysql.createConnection(conn_info);
        conn.query(sql1,tar,function(err){
            if(err){
                console.log(err);
            }
        });

        res.redirect("/temp_list");
        // var sql = 'select * from post where determinant = 0 and user_id = ? '
        // var input_data = [req.session.data1]

        // conn.query(sql, input_data, (err, result)=>{
        //         var data = {
        //             name : req.body.id,
        //             result : result,
        //             no : '-',
        //         }
        //         console.log('err',err)
        //         console.log('result:',result)
        //         console.log("id:", req.session.data1)
        //     res.render('./main/21.ejs',data)
        // })
        
    });

    app.post('/post_thing/temp_save_update',parser, function(req,res){                          //임시저장에서 다시 임시저장
        var array_check = [req.body.pic_front,req.body.pic_side,req.body.pic_back];
        
        //사진 3장 첨부할 때 첨부 안해도 err 안나오게 한 코드(임시저장)
        switch(array_check.join()){
            case 'false,false,false' :
                var tar = [req.body.category, req.body.detail, req.body.title, req.body.price[0], req.body.price[1], req.body.content, req.body.hidden_num];
                var sql1 = "update post set post_category=?, post_detail_category=?, post_title=?, post_price_min=?, post_price_max=?, post_content=? where trans_num=?";
                console.log("here!!!!");
                break

            case 'true,false,false' :
                var tar = [req.body.category, req.body.detail, req.body.title, req.body.price[0], req.body.price[1], req.body.content, req.files.file_name_front.name.substring(0,req.files.file_name_front.name.length-3), req.body.hidden_num];
                var sql1 = "update post set post_category=?, post_detail_category=?, post_title=?, post_price_min=?, post_price_max=?, post_content=?, post_picname_front=? where trans_num=?";
                req.files.file_name_front.mv(__dirname.substring(0,__dirname.length-6)+'public/img/upload/'+req.files.file_name_front.name.substring(0,req.files.file_name_front.name.length-3)+'jpg', function(err){
                    if(err){
                        console.log(err);
                    }else{
                        console.log("uploaded");
                    }
                });
                break    

            case 'false,true,false' :
                var tar = [req.body.category, req.body.detail, req.body.title, req.body.price[0], req.body.price[1], req.body.content, req.files.file_name_side.name.substring(0,req.files.file_name_side.name.length-3), req.body.hidden_num];
                var sql1 = "update post set post_category=?, post_detail_category=?, post_title=?, post_price_min=?, post_price_max=?, post_content=?, post_picname_side=? where trans_num=?";
                req.files.file_name_side.mv(__dirname.substring(0,__dirname.length-6)+'public/img/upload/'+req.files.file_name_side.name.substring(0,req.files.file_name_side.name.length-3)+'jpg', function(err){
                    if(err){
                        console.log(err);
                    }else{
                        console.log("uploaded");
                    }
                });
                break

            case 'false,false,true' :
                var tar = [req.body.category, req.body.detail, req.body.title, req.body.price[0], req.body.price[1], req.body.content, req.files.file_name_back.name.substring(0,req.files.file_name_back.name.length-3), req.body.hidden_num];
                var sql1 = "update post set post_category=?, post_detail_category=?, post_title=?, post_price_min=?, post_price_max=?, post_content=?, post_picname_back=? where trans_num=?";
                req.files.file_name_back.mv(__dirname.substring(0,__dirname.length-6)+'public/img/upload/'+req.files.file_name_back.name.substring(0,req.files.file_name_back.name.length-3)+'jpg', function(err){
                    if(err){
                        console.log(err);
                    }else{
                        console.log("uploaded");
                    }
                });
                break

            case 'true,true,false' :
                var tar = [req.body.category, req.body.detail, req.body.title, req.body.price[0], req.body.price[1], req.body.content, req.files.file_name_front.name.substring(0,req.files.file_name_front.name.length-3), req.files.file_name_side.name.substring(0,req.files.file_name_side.name.length-3), req.body.hidden_num];
                var sql1 = "update post set post_category=?, post_detail_category=?, post_title=?, post_price_min=?, post_price_max=?, post_content=?, post_picname_front=?, post_picname_side=? where trans_num=?";

                req.files.file_name_front.mv(__dirname.substring(0,__dirname.length-6)+'public/img/upload/'+req.files.file_name_front.name.substring(0,req.files.file_name_front.name.length-3)+'jpg', function(err){
                    if(err){
                        console.log(err);
                    }else{
                        console.log("uploaded");
                    }
                });

                req.files.file_name_side.mv(__dirname.substring(0,__dirname.length-6)+'public/img/upload/'+req.files.file_name_side.name.substring(0,req.files.file_name_side.name.length-3)+'jpg', function(err){
                    if(err){
                        console.log(err);
                    }else{
                        console.log("uploaded");
                    }
                });
                break

            case 'true,false,true' :
                var tar = [req.body.category, req.body.detail, req.body.title, req.body.price[0], req.body.price[1], req.body.content,  req.files.file_name_front.name.substring(0,req.files.file_name_front.name.length-3), req.files.file_name_back.name.substring(0,req.files.file_name_back.name.length-3), req.body.hidden_num];
                var sql1 = "update post set post_category=?, post_detail_category=?, post_title=?, post_price_min=?, post_price_max=?, post_content=?, post_picname_front=?, post_picname_back=? where trans_num=?";
                
                req.files.file_name_front.mv(__dirname.substring(0,__dirname.length-6)+'public/img/upload/'+req.files.file_name_front.name.substring(0,req.files.file_name_front.name.length-3)+'jpg', function(err){
                    if(err){
                        console.log(err);
                    }else{
                        console.log("uploaded");
                    }
                });

                req.files.file_name_back.mv(__dirname.substring(0,__dirname.length-6)+'public/img/upload/'+req.files.file_name_back.name.substring(0,req.files.file_name_back.name.length-3)+'jpg', function(err){
                    if(err){
                        console.log(err);
                    }else{
                        console.log("uploaded");
                    }
                });
                break

            case 'false,true,true' :
                var tar = [req.body.category, req.body.detail, req.body.title, req.body.price[0], req.body.price[1], req.body.content, req.files.file_name_side.name.substring(0,req.files.file_name_side.name.length-3), req.files.file_name_back.name.substring(0,req.files.file_name_back.name.length-3), req.body.hidden_num];
                var sql1 = "update post set post_category=?, post_detail_category=?, post_title=?, post_price_min=?, post_price_max=?, post_content=?, post_picname_side=?, post_picname_back=? where trans_num=?";
                
                req.files.file_name_side.mv(__dirname.substring(0,__dirname.length-6)+'public/img/upload/'+req.files.file_name_side.name.substring(0,req.files.file_name_side.name.length-3)+'jpg', function(err){
                    if(err){
                        console.log(err);
                    }else{
                        console.log("uploaded");
                    }
                });

                req.files.file_name_back.mv(__dirname.substring(0,__dirname.length-6)+'public/img/upload/'+req.files.file_name_back.name.substring(0,req.files.file_name_back.name.length-3)+'jpg', function(err){
                    if(err){
                        console.log(err);
                    }else{
                        console.log("uploaded");
                    }
                });
                break
                
            default :
                var tar = [req.body.category, req.body.detail, req.body.title, req.body.price[0], req.body.price[1], req.body.content, req.files.file_name_front.name.substring(0,req.files.file_name_front.name.length-3), req.files.file_name_side.name.substring(0,req.files.file_name_side.name.length-3), req.files.file_name_back.name.substring(0,req.files.file_name_back.name.length-3), req.body.hidden_num];
                var sql1 = "update post set post_category=?, post_detail_category=?, post_title=?, post_price_min=?, post_price_max=?, post_content=?, post_picname_front=?, post_picname_side=?, post_picname_back=? where trans_num=?";
                
                req.files.file_name_front.mv(__dirname.substring(0,__dirname.length-6)+'public/img/upload/'+req.files.file_name_front.name.substring(0,req.files.file_name_front.name.length-3)+'jpg', function(err){
                    if(err){
                        console.log(err);
                    }else{
                        console.log("uploaded");
                    }
                });

                req.files.file_name_side.mv(__dirname.substring(0,__dirname.length-6)+'public/img/upload/'+req.files.file_name_side.name.substring(0,req.files.file_name_side.name.length-3)+'jpg', function(err){
                    if(err){
                        console.log(err);
                    }else{
                        console.log("uploaded");
                    }
                });

                req.files.file_name_back.mv(__dirname.substring(0,__dirname.length-6)+'public/img/upload/'+req.files.file_name_back.name.substring(0,req.files.file_name_back.name.length-3)+'jpg', function(err){
                    if(err){
                        console.log(err);
                    }else{
                        console.log("uploaded");
                    }
                });
            };
            console.log(tar);
            let conn = mysql.createConnection(conn_info);
            conn.query(sql1,tar,function(err){
            if(err){
                console.log(err);
            }
            });

        res.redirect("/temp_list");
    });

    app.get("/temp_list", function(req,res){
        let conn = mysql.createConnection(conn_info);
        var sql = 'select * from post where determinant = 0 and user_id = ? '
        var input_data = [req.session.data1]

        conn.query(sql, input_data, (err, result)=>{
                var data = {
                    name : req.session.data1,
                    result : result,
                    no : '-',
                }
            res.render('./main/21.ejs',data)
        })
    });

    //저장
    app.post('/post_thing/save',parser, async function(req,res){
        try{
            let conn = mysql.createConnection(conn_info);
            let MyContract = new web3.eth.Contract(abi);
            let deploy = MyContract.deploy({
                data: '0x'+bytecode,
                arguments: [req.body.price[0],'0xeab0a4eb9fadec8b9c20ebb284eca68800000000000000000000000000000000','0x12eeffac2b4b61eb65c514c5c88806e6260fa15e']                // constructor에 저장되는 값들 여기서는 물건 가격과 인증 코드가 해당된다.
                }).encodeABI();
            let con_addr;

            let sql2 = "select wallet_add, password from guest where user_id = ?";
            conn.query(sql2,req.session.data1, async (err,wallet_addr)=>{
                web3.eth.personal.unlockAccount(wallet_addr[0].wallet_add, wallet_addr[0].password, 600);                 //계약 배포를 위해 계정을 먼저 잠금 해제해야 한다.
                con_addr = web3.eth.sendTransaction({                                                                    //계약을 블록에 배포한 후 스마트 컨트랙트 주소를 가져오기 위해 await을 선언하여 sendTransaction이 완료된 후 다음 줄이 실행되도록 하였다.
                    from: wallet_addr[0].wallet_add,
                    data : deploy
                });
                console.log(con_addr);
                
                var array_check = [req.body.pic_front,req.body.pic_side,req.body.pic_back];

                if(array_check.join() == 'true,true,true'){
                    var tar = [req.body.category, req.body.detail, req.body.title, req.body.price[0], req.body.price[1], req.body.content, req.session.data1, req.files.file_name_front.name.substring(0,req.files.file_name_front.name.length-3), req.files.file_name_side.name.substring(0,req.files.file_name_side.name.length-3), req.files.file_name_back.name.substring(0,req.files.file_name_back.name.length-3), true, con_addr.contractAddress];
                    var sql1 = "insert into post (post_category, post_detail_category, post_title, post_price_min, post_price_max, post_content, user_id, post_picname_front, post_picname_side, post_picname_back, determinant, post_contract_address) values(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                
                    req.files.file_name_front.mv(__dirname.substring(0,__dirname.length-6)+'public/img/upload/'+req.files.file_name_front.name.substring(0,req.files.file_name_front.name.length-3)+'jpg', function(err){
                        if(err){
                            console.log(err);
                        }else{
                            console.log("uploaded");
                        }
                    });
    
                    req.files.file_name_side.mv(__dirname.substring(0,__dirname.length-6)+'public/img/upload/'+req.files.file_name_side.name.substring(0,req.files.file_name_side.name.length-3)+'jpg', function(err){
                        if(err){
                            console.log(err);
                        }else{
                            console.log("uploaded");
                        }
                    });
    
                    req.files.file_name_back.mv(__dirname.substring(0,__dirname.length-6)+'public/img/upload/'+req.files.file_name_back.name.substring(0,req.files.file_name_back.name.length-3)+'jpg', function(err){
                        if(err){
                            console.log(err);
                        }else{
                            console.log("uploaded");
                        }
                    });
                }
           
    
            
                conn.query(sql1,tar,function(err){
                    if(err){
                        console.log(err);
                    }
                    res.redirect('/main_1_in');      //로그인 했을 때: main/1_in        res.redirect가 바깥에 존재하면 병렬처리 특성 상 현재 진행한 물품이 리스트에 반영이 안된다.
                });
                

            })
            
    

            
            

        }catch(error){
            console.log(error);
        }
        
    });

    app.post('/post_thing/temp_save_post',parser, async function(req,res){                        // 임시 저장 수정페이지에서 게시물 등록할 때 여기서는 기존에 저장되었던 이미지들이 있으니까 경우를 따져주어야 함
        try{
        var array_check = [req.body.pic_front,req.body.pic_side,req.body.pic_back];
        console.log(req.body);
        //사진 3장 첨부할 때 첨부 안해도 err 안나오게 한 코드(임시저장)
        let conn = mysql.createConnection(conn_info);
        let MyContract = new web3.eth.Contract(abi);
        let deploy = MyContract.deploy({
            data: '0x'+bytecode,
            arguments: [req.body.price[0],'0xeab0a4eb9fadec8b9c20ebb284eca68800000000000000000000000000000000','0x12eeffac2b4b61eb65c514c5c88806e6260fa15e']                // constructor에 저장되는 값들 여기서는 물건 가격과 인증 코드가 해당된다.
            }).encodeABI();
        let con_addr;

        let sql2 = "select wallet_add, password from guest where user_id = ?";
        conn.query(sql2,req.session.data1, async (err,wallet_addr)=>{
            switch(array_check.join()){
                case 'false,false,false' :
                    web3.eth.personal.unlockAccount(wallet_addr[0].wallet_add, wallet_addr[0].password, 600);                 //계약 배포를 위해 계정을 먼저 잠금 해제해야 한다.
                    con_addr = web3.eth.sendTransaction({                                                                    //계약을 블록에 배포한 후 스마트 컨트랙트 주소를 가져오기 위해 await을 선언하여 sendTransaction이 완료된 후 다음 줄이 실행되도록 하였다.
                        from: wallet_addr[0].wallet_add,
                        data : deploy
                    });
                    console.log(con_addr);
                    var tar = [req.body.category, req.body.detail, req.body.title, req.body.price[0], req.body.price[1], req.body.content, true, con_addr.contractAddress, req.body.hidden_num];
                    var sql1 = "update post set post_category=?, post_detail_category=?, post_title=?, post_price_min=?, post_price_max=?, post_content=?, determinant=?, post_contract_address=? where trans_num=?";
                    console.log("here1111!!!!");
                    break

                case 'true,false,false' :
                    web3.eth.personal.unlockAccount(wallet_addr[0].wallet_add, wallet_addr[0].password, 600);                 //계약 배포를 위해 계정을 먼저 잠금 해제해야 한다.
                    con_addr = web3.eth.sendTransaction({                                                                    //계약을 블록에 배포한 후 스마트 컨트랙트 주소를 가져오기 위해 await을 선언하여 sendTransaction이 완료된 후 다음 줄이 실행되도록 하였다.
                        from: wallet_addr[0].wallet_add,
                        data : deploy
                    });
                    console.log(con_addr);
                    var tar = [req.body.category, req.body.detail, req.body.title, req.body.price[0], req.body.price[1], req.body.content, req.files.file_name_front.name.substring(0,req.files.file_name_front.name.length-3), true, con_addr.contractAddress, req.body.hidden_num];
                    var sql1 = "update post set post_category=?, post_detail_category=?, post_title=?, post_price_min=?, post_price_max=?, post_content=?, post_picname_front=?, determinant=?, post_contract_address=? where trans_num=?";
                    req.files.file_name_front.mv(__dirname.substring(0,__dirname.length-6)+'public/img/upload/'+req.files.file_name_front.name.substring(0,req.files.file_name_front.name.length-3)+'jpg', function(err){
                        if(err){
                            console.log(err);
                        }else{
                            console.log("uploaded");
                        }
                    });
                    break    

                case 'false,true,false' :
                    web3.eth.personal.unlockAccount(wallet_addr[0].wallet_add, wallet_addr[0].password, 600);                 //계약 배포를 위해 계정을 먼저 잠금 해제해야 한다.
                    con_addr = web3.eth.sendTransaction({                                                                    //계약을 블록에 배포한 후 스마트 컨트랙트 주소를 가져오기 위해 await을 선언하여 sendTransaction이 완료된 후 다음 줄이 실행되도록 하였다.
                        from: wallet_addr[0].wallet_add,
                        data : deploy
                    });
                    console.log(con_addr);
                    var tar = [req.body.category, req.body.detail, req.body.title, req.body.price[0], req.body.price[1], req.body.content, req.files.file_name_side.name.substring(0,req.files.file_name_side.name.length-3), true, con_addr.contractAddress, req.body.hidden_num];
                    var sql1 = "update post set post_category=?, post_detail_category=?, post_title=?, post_price_min=?, post_price_max=?, post_content=?, post_picname_side=?, determinant=?, post_contract_address=? where trans_num=?";
                    req.files.file_name_side.mv(__dirname.substring(0,__dirname.length-6)+'public/img/upload/'+req.files.file_name_side.name.substring(0,req.files.file_name_side.name.length-3)+'jpg', function(err){
                        if(err){
                            console.log(err);
                        }else{
                            console.log("uploaded");
                        }
                    });
                    break

                case 'false,false,true' :
                    web3.eth.personal.unlockAccount(wallet_addr[0].wallet_add, wallet_addr[0].password, 600);                 //계약 배포를 위해 계정을 먼저 잠금 해제해야 한다.
                    con_addr = web3.eth.sendTransaction({                                                                    //계약을 블록에 배포한 후 스마트 컨트랙트 주소를 가져오기 위해 await을 선언하여 sendTransaction이 완료된 후 다음 줄이 실행되도록 하였다.
                        from: wallet_addr[0].wallet_add,
                        data : deploy
                    });
                    console.log(con_addr);
                    var tar = [req.body.category, req.body.detail, req.body.title, req.body.price[0], req.body.price[1], req.body.content, req.files.file_name_back.name.substring(0,req.files.file_name_back.name.length-3), true, con_addr.contractAddress, req.body.hidden_num];
                    var sql1 = "update post set post_category=?, post_detail_category=?, post_title=?, post_price_min=?, post_price_max=?, post_content=?, post_picname_back=?, determinant=?, post_contract_address=? where trans_num=?";
                    req.files.file_name_back.mv(__dirname.substring(0,__dirname.length-6)+'public/img/upload/'+req.files.file_name_back.name.substring(0,req.files.file_name_back.name.length-3)+'jpg', function(err){
                        if(err){
                            console.log(err);
                        }else{
                            console.log("uploaded");
                        }
                    });
                    break

                case 'true,true,false' :
                    web3.eth.personal.unlockAccount(wallet_addr[0].wallet_add, wallet_addr[0].password, 600);                 //계약 배포를 위해 계정을 먼저 잠금 해제해야 한다.
                    con_addr = web3.eth.sendTransaction({                                                                    //계약을 블록에 배포한 후 스마트 컨트랙트 주소를 가져오기 위해 await을 선언하여 sendTransaction이 완료된 후 다음 줄이 실행되도록 하였다.
                        from: wallet_addr[0].wallet_add,
                        data : deploy
                    });
                    console.log(con_addr);
                    var tar = [req.body.category, req.body.detail, req.body.title, req.body.price[0], req.body.price[1], req.body.content, req.files.file_name_front.name.substring(0,req.files.file_name_front.name.length-3), req.files.file_name_side.name.substring(0,req.files.file_name_side.name.length-3), true, con_addr.contractAddress, req.body.hidden_num];
                    var sql1 = "update post set post_category=?, post_detail_category=?, post_title=?, post_price_min=?, post_price_max=?, post_content=?, post_picname_front=?, post_picname_side=?, determinant=?, post_contract_address=? where trans_num=?";

                    req.files.file_name_front.mv(__dirname.substring(0,__dirname.length-6)+'public/img/upload/'+req.files.file_name_front.name.substring(0,req.files.file_name_front.name.length-3)+'jpg', function(err){
                        if(err){
                            console.log(err);
                        }else{
                            console.log("uploaded");
                        }
                    });

                    req.files.file_name_side.mv(__dirname.substring(0,__dirname.length-6)+'public/img/upload/'+req.files.file_name_side.name.substring(0,req.files.file_name_side.name.length-3)+'jpg', function(err){
                        if(err){
                            console.log(err);
                        }else{
                            console.log("uploaded");
                        }
                    });
                    break

                case 'true,false,true' :
                    web3.eth.personal.unlockAccount(wallet_addr[0].wallet_add, wallet_addr[0].password, 600);                 //계약 배포를 위해 계정을 먼저 잠금 해제해야 한다.
                    con_addr = web3.eth.sendTransaction({                                                                    //계약을 블록에 배포한 후 스마트 컨트랙트 주소를 가져오기 위해 await을 선언하여 sendTransaction이 완료된 후 다음 줄이 실행되도록 하였다.
                        from: wallet_addr[0].wallet_add,
                        data : deploy
                    });
                    console.log(con_addr);
                    var tar = [req.body.category, req.body.detail, req.body.title, req.body.price[0], req.body.price[1], req.body.content,  req.files.file_name_front.name.substring(0,req.files.file_name_front.name.length-3), req.files.file_name_back.name.substring(0,req.files.file_name_back.name.length-3), true, con_addr.contractAddress, req.body.hidden_num];
                    var sql1 = "update post set post_category=?, post_detail_category=?, post_title=?, post_price_min=?, post_price_max=?, post_content=?, post_picname_front=?, post_picname_back=?, determinant=?, post_contract_address=? where trans_num=?";
                    
                    req.files.file_name_front.mv(__dirname.substring(0,__dirname.length-6)+'public/img/upload/'+req.files.file_name_front.name.substring(0,req.files.file_name_front.name.length-3)+'jpg', function(err){
                        if(err){
                            console.log(err);
                        }else{
                            console.log("uploaded");
                        }
                    });

                    req.files.file_name_back.mv(__dirname.substring(0,__dirname.length-6)+'public/img/upload/'+req.files.file_name_back.name.substring(0,req.files.file_name_back.name.length-3)+'jpg', function(err){
                        if(err){
                            console.log(err);
                        }else{
                            console.log("uploaded");
                        }
                    });
                    break

                case 'false,true,true' :
                    web3.eth.personal.unlockAccount(wallet_addr[0].wallet_add, wallet_addr[0].password, 600);                 //계약 배포를 위해 계정을 먼저 잠금 해제해야 한다.
                    con_addr = web3.eth.sendTransaction({                                                                    //계약을 블록에 배포한 후 스마트 컨트랙트 주소를 가져오기 위해 await을 선언하여 sendTransaction이 완료된 후 다음 줄이 실행되도록 하였다.
                        from: wallet_addr[0].wallet_add,
                        data : deploy
                    });
                    console.log(con_addr);
                    var tar = [req.body.category, req.body.detail, req.body.title, req.body.price[0], req.body.price[1], req.body.content, req.files.file_name_side.name.substring(0,req.files.file_name_side.name.length-3), req.files.file_name_back.name.substring(0,req.files.file_name_back.name.length-3), true, con_addr.contractAddress, req.body.hidden_num];
                    var sql1 = "update post set post_category=?, post_detail_category=?, post_title=?, post_price_min=?, post_price_max=?, post_content=?, post_picname_side=?, post_picname_back=?, determinant=?, post_contract_address=? where trans_num=?";
                    
                    req.files.file_name_side.mv(__dirname.substring(0,__dirname.length-6)+'public/img/upload/'+req.files.file_name_side.name.substring(0,req.files.file_name_side.name.length-3)+'jpg', function(err){
                        if(err){
                            console.log(err);
                        }else{
                            console.log("uploaded");
                        }
                    });

                    req.files.file_name_back.mv(__dirname.substring(0,__dirname.length-6)+'public/img/upload/'+req.files.file_name_back.name.substring(0,req.files.file_name_back.name.length-3)+'jpg', function(err){
                        if(err){
                            console.log(err);
                        }else{
                            console.log("uploaded");
                        }
                    });
                    break
                    
                default :
                web3.eth.personal.unlockAccount(wallet_addr[0].wallet_add, wallet_addr[0].password, 600);                 //계약 배포를 위해 계정을 먼저 잠금 해제해야 한다.
                con_addr = web3.eth.sendTransaction({                                                                    //계약을 블록에 배포한 후 스마트 컨트랙트 주소를 가져오기 위해 await을 선언하여 sendTransaction이 완료된 후 다음 줄이 실행되도록 하였다.
                    from: wallet_addr[0].wallet_add,
                    data : deploy
                });
                console.log(con_addr);
                    var tar = [req.body.category, req.body.detail, req.body.title, req.body.price[0], req.body.price[1], req.body.content, req.files.file_name_front.name.substring(0,req.files.file_name_front.name.length-3), req.files.file_name_side.name.substring(0,req.files.file_name_side.name.length-3), req.files.file_name_back.name.substring(0,req.files.file_name_back.name.length-3), true, con_addr.contractAddress, req.body.hidden_num];
                    var sql1 = "update post set post_category=?, post_detail_category=?, post_title=?, post_price_min=?, post_price_max=?, post_content=?, post_picname_front=?, post_picname_side=?, post_picname_back=?, determinant=?, post_contract_address=? where trans_num=?";
                    
                    req.files.file_name_front.mv(__dirname.substring(0,__dirname.length-6)+'public/img/upload/'+req.files.file_name_front.name.substring(0,req.files.file_name_front.name.length-3)+'jpg', function(err){
                        if(err){
                            console.log(err);
                        }else{
                            console.log("uploaded");
                        }
                    });

                    req.files.file_name_side.mv(__dirname.substring(0,__dirname.length-6)+'public/img/upload/'+req.files.file_name_side.name.substring(0,req.files.file_name_side.name.length-3)+'jpg', function(err){
                        if(err){
                            console.log(err);
                        }else{
                            console.log("uploaded");
                        }
                    });

                    req.files.file_name_back.mv(__dirname.substring(0,__dirname.length-6)+'public/img/upload/'+req.files.file_name_back.name.substring(0,req.files.file_name_back.name.length-3)+'jpg', function(err){
                        if(err){
                            console.log(err);
                        }else{
                            console.log("uploaded");
                        }
                    });
                };
                let conn = mysql.createConnection(conn_info);
                conn.query(sql1,tar,function(err){
                    if(err){
                        console.log(err);
                    }
                res.redirect('/main_1_in');      //로그인 했을 때: main/1_in

                });
                
        })
        }catch(error){
            console.log(error);
        }
    });



    app.get("/main_1_in", function(req,res){
        let conn = mysql.createConnection(conn_info)
        var sql = "select trans_num, post_picname_front, post_title, post_price_max from post where determinant = 1"
        conn.query(sql, (err, result)=>{
            result.reverse();       //result를 reverse해서 가장 최신게시글이 자동으로 result[0]이 돼서 화면에 뿌려주는 코드            
            var render_data = {
                name : req.session.data1,
                result : result,
                noproduct : '등록된 상품이 없습니다',
                noprice : '-',
                noimg : 'no image'
                }
            res.render('./main/1_in.ejs',render_data);      //로그인 했을 때: main/1_in
                    })
    })

    app.get('/temp_detail', function(req,res){
        let conn = mysql.createConnection(conn_info);
        let sql = 'select trans_num, post_title, post_content, post_price_min, post_price_max, post_picname_front, post_picname_side, post_picname_back from post where trans_num = ? and determinant = 0'
        conn.query(sql, req.query.tar, (err, result)=>{
            var data = {
                trans_num : result[0].trans_num,
                title : result[0].post_title,
                content : result[0].post_content,
                price_min : result[0].post_price_min,
                price_max : result[0].post_price_max,
                img_front : result[0].post_picname_front,
                img_side : result[0].post_picname_side,
                img_back : result[0].post_picname_back
            }
            console.log(result);
            res.render('./main/14_temp.ejs', data)

        })
    })

    //DB에 있는 정보 꺼내서 상세페이지로 뿌려주는 코드  =>연결되는 페이지url에 따라 where조건 수정해야함
    app.get('/main_detail',function(req,res){        
        let conn = mysql.createConnection(conn_info)
        let sql = 'select post_fixed_buyer, post_buyer, trans_num, user_id, post_title, post_content, post_price_min, post_price_max, post_picname_front, post_picname_side, post_picname_back from post where trans_num = ? and determinant = 1';
        
        conn.query(sql, req.query.tar, (err, result)=>{
            var x = result[0].post_buyer.split(',');        // 문자열 오류로 인해 조건식으로 상황 구분
            if(x.length==1 && x[0]==''){                    
                var y = x.pop();
            }else{
                var y = x;
            }
            var data = {
                title : result[0].post_title,
                content : result[0].post_content,
                price_min : result[0].post_price_min,
                price_max : result[0].post_price_max,
                img_front : result[0].post_picname_front,
                img_side : result[0].post_picname_side,
                img_back : result[0].post_picname_back,
                name : result[0].user_id,
                num : result[0].trans_num,
                buyer : y                                 // 구매자 id가 구매자 페이지로도 넘어가므로 추후 보안 문제 발생의 우려가 있음
            }
            console.log(result[0].post_fixed_buyer)
            if(result[0].post_fixed_buyer == null){
                var first = 'false';
                var third = 'false';
            }else{
                var first = 'true';
                if(result[0].post_fixed_buyer == req.session.data1){
                    var third = 'true';
                }else{
                    var third = 'false';
                }
            }
            if(result[0].user_id == req.session.data1){
                var second = 'true';
            }else{
                var second = 'false';
            }
            if(x.includes(req.session.data1)){
                var fourth = 'true';
            }else{
                var fourth = 'false'
            }
            var array_check = [first,second,third,fourth];

            if(typeof req.session.data1 == 'undefined'){
                res.render('./main/14_not_login.ejs', data);
            }else{
                switch(array_check.join()){
                    case 'false,false,false,false' :
                        var z = '.ejs';
                        break;
                    case 'false,false,false,true' :
                        var z = '_bought.ejs';
                        break;
                    case 'false,true,false,false' :
                        var z = '_seller.ejs';
                        
                        break;
                    case 'true,true,false,false' :
                        var z = '_fixed_seller.ejs';
                        
                        break;
                    case 'true,false,true,true' :
                        var z = '_fixed_buyer.ejs'
                       
                        break;
                    default:
                        var z = '_cancelled.ejs';
                        
                }
                res.render('./main/14'+z,data);
            }

            
            // if(req.session.data1 == result[0].user_id){
            //     res.render('./main/14_seller.ejs', data);
            // }else if(typeof req.session.data1 == "undefined"){
                
            // }else{
            //     res.render('./main/14.ejs', data);
            // }
            

        })
    });

    app.get('/main_detail_buy', async function(req,res){              //비동기방식 구매요청이 db로 저장되는 페이지
        try{
            let conn = mysql.createConnection(conn_info)
            let sql = 'select post_buyer, post_contract_address from post where trans_num = ?';     //select post.user_id, guest.password, post.post_buyer, post.post_contract_address, guest.wallet_add from post left join guest on post.user_id = guest.user_id where trans_num = ?; join사용한 쿼리문
            let sql2 = 'select wallet_add, password from guest where user_id = ?';
            conn.query(sql, req.query.tar, (err,result)=>{
                if(result[0].post_buyer == ''){                      // 첫 구매 신청시
                    var sql1 = "update post set post_buyer = ? where trans_num = ?";
                    var input_data = [req.session.data1,req.query.tar];
                }else{
                    var sql1 = "update post set post_buyer = ? where trans_num = ?";        // 신청자가 이미 존재할 때
                    var input_data = [result[0].post_buyer+','+req.session.data1,req.query.tar];
                }
                conn.query(sql1, input_data, (err)=>{
                    console.log(err);
                
                })
                conn.query(sql2, req.session.data1, async (err,result1)=>{
                    web3.eth.personal.unlockAccount(result1[0].wallet_add, result1[0].password, 600)                   
                    let contract1 = new web3.eth.Contract(abi, result[0].post_contract_address)
                    let con1 = contract1.methods.set_buyers().send({
                        from: result1[0].wallet_add,
                        value: parseInt(req.query.coin_offer)*1000000000000000000         //coin_offer 구매자가 제시한 코인 쿼리에 실었음
                    })
                    console.log(con1);     
                    res.json();             
                })
                
            });                                                         //여기서 실행시킬 거야 구매자 트랜잭션!!!!!!  쿼리문 수정해서 계약 주소와 주소 가져올 수 있음
            
        
        }catch(error){
            console.log(error)
        }
        
    });

    app.post('/main_detail_sell', async function(req,res){            //비동기방식 판매하기가 db로 저장되는 페이지
        try{
            let conn = mysql.createConnection(conn_info)
            let sql = 'update post set post_fixed_buyer = ? where trans_num = ?';
            let sql1 = "select post.user_id, guest.password, post.post_buyer, post.post_contract_address, guest.wallet_add from post left join guest on post.user_id = guest.user_id where trans_num = ?"
            let tar = [req.body.fixed_buyer, req.body.num];
            conn.query(sql, tar, (err)=>{
                console.log(err);
                                                                //물건 판매하기 컨트랙트!!!!!!!
            })
            conn.query(sql1, req.body.num, (err,result)=>{
                let array = result[0].post_buyer.split(',');
            // array.indexof(req.body.fixed_buyer)+1            이거 이용
                web3.eth.personal.unlockAccount(result[0].wallet_add, result[0].password, 600);
                let contract1 = new web3.eth.Contract(abi, result[0].post_contract_address);
                let con1 = contract1.methods.sell_to_buyer(array.indexof(req.body.fixed_buyer)+1);
                console.log(con1);
            })
            res.json();
        }catch(error){
            console.log(error);
        }
        
    })

    app.get("/category_1", function(req, res){          //카테고리 페이지 하나로 합침
        var conn = mysql.createConnection(conn_info);
        // var sql1 = "SELECT large_women FROM category WHERE large_women IN (SELECT large_women FROM category WHERE large_id = 1);";
        var sql = 'SELECT '+req.query.id+' as name FROM category where not '+req.query.id+' is null';
        var sql1 = 'select trans_num, post_picname_front, post_picname_side, post_picname_back, post_title, post_price_max from post where determinant = 1 and post_category=?';
        conn.query(sql, function(err, result){
            conn.query(sql1, req.query.id, function(err,result1){
                if (err) {
                    throw err;
                } else {
                    result1.reverse(); 
                    var render_data = {
                        rows : result,
                        result1 : result1,
                        noproduct : '등록된 상품이 없습니다',
                        noprice : '-',
                        noimg : 'no image',
                        hd : req.query.id,
                        name : req.session.data1
                    }
                    console.log(result);
                    if (err) {
                        throw err;
                    }
                    if(req.session.data1){
                        res.render('./main/category_1_in.ejs',render_data);
                    }else{
                        res.render('./main/category_1.ejs', render_data);
                    }
                    
                }
            });
            
            }
        );
    });

    app.get("/category_1_test", function(req,res){      //비동기 데이터 전송 받는 곳
        var conn = mysql.createConnection(conn_info);
        var sql = 'select trans_num, post_picname_front, post_picname_side, post_picname_back, post_title, post_price_max from post where determinant = 1 and post_detail_category=?';
        // var sql = 'select post_picname_front, post_title, post_price from post where post_detail_category = ?'
        // var tar = req.query.data.val
        conn.query(sql, req.query.data1, (err,result)=>{
            var data = {
                result : result,
                noproduct : '등록된 상품이 없습니다',
                noprice : '-',
                noimg : 'no image'
            };
            console.log(data);
            if (err) {
                throw err;
            }
            res.json(data);
        });
    });
    
    app.get("/search_data", function(req,res){          //비동기 검색
        var conn = mysql.createConnection(conn_info)
        var sql = "select trans_num, post_title, post_content, post_picname_front, post_price_max from post where (post_title like ? or post_content like ?) and determinant = 1"
        console.log('query.val:', req.query.data)
        var msg = req.query.data
        console.log('msg:', msg)
        var arr = msg.split(" ");       //공백기준으로 문자열 잘라 배열로 저장
        var arr_length = arr.length;
        console.log('arr:', arr)
        var input_data0 = ['%'+arr[0]+'%','%'+arr[0]+'%']
        var input_data1 = ['%'+arr[1]+'%','%'+arr[1]+'%']
        var input_data2 = ['%'+arr[2]+'%','%'+arr[2]+'%']
        var input_data3 = ['%'+arr[3]+'%','%'+arr[3]+'%']
        var input_data4 = ['%'+arr[4]+'%','%'+arr[4]+'%']

        switch(arr_length){         //검색 시 앞의 키워드 5개만 검색가능
            case 1:         //키워드 1개
                conn.query(sql, input_data0, (err, result)=>{
                    var data = {
                        name : req.body.id,
                        result : result,
                        noproduct : '등록된 상품이 없습니다',
                        noprice : '-',
                        noimg : 'no image'
                    }
                    result.sort(function(a,b){
                        return parseFloat(b.trans_num) - parseFloat(a.trans_num);       
                    });
                    console.log('case1')
                    res.json(data)                
                })
                break;
            case 2:         //키워드 2개
                var cnt = 0;
                conn.query(sql, input_data0, (err, result)=>{
                    conn.query(sql, input_data1, (err, result1)=>{
                        for(i=0; i<result1.length; i++){
                            for(j=0; j<result.length; j++){
                                if(result[j].trans_num == result1[i].trans_num){        //2번째 쿼리에서 뽑아온 데이터가 이전에 뽑은 데이터랑 겹치면 cnt+1
                                    cnt = cnt + 1
                                }
                                else{
                                    cnt = cnt
                                }
                            }
                            if(cnt == 0){
                                result.push(result1[i])                         //앞의 for문이 끝났을 때 cnt=0이면 중복되는 데이터가 없으므로 배열에 데이터 추가
                            }    
                        }
                        var data = {
                            name : req.body.id,
                            result : result,
                            noproduct : '등록된 상품이 없습니다',
                            noprice : '-',
                            noimg : 'no image'
                        }
                        result.sort(function(a,b){
                            return parseFloat(b.trans_num) - parseFloat(a.trans_num);       //parsefloat:문자열=>숫자로 바꿈  //b-a로 배열 위치 내림차순으로 바꿔줌(최신순정렬)   (a-b하면 오름차순)
                        });
                        console.log('case2')
                        console.log(result)
                            res.json(data)
                    })
                })
                break;
            case 3:         //키워드 3개
                var cnt = 0;
                conn.query(sql, input_data0, (err, result)=>{
                    conn.query(sql, input_data1, (err, result1)=>{
                        for(i=0; i<result1.length; i++){
                            for(j=0; j<result.length; j++){
                                if(result[j].trans_num == result1[i].trans_num){       
                                    cnt = cnt + 1
                                }
                                else{
                                    cnt = cnt
                                }
                            }
                            if(cnt == 0){
                                result.push(result1[i])
                            }    
                        }
                        conn.query(sql, input_data2, (err, result2)=>{
                            for(i=0; i<result1.length; i++){
                                for(j=0; j<result.length; j++){
                                    if(result[j].trans_num == result1[i].trans_num){
                                        cnt = cnt + 1
                                    }
                                    else{
                                        cnt = cnt
                                    }
                                }
                                if(cnt == 0){
                                    result.push(result1[i])
                                }    
                            }    
                            var data = {
                                name : req.body.id,
                                result : result,
                                noproduct : '등록된 상품이 없습니다',
                                noprice : '-',
                                noimg : 'no image'
                            }
                            result.sort(function(a,b){
                                return parseFloat(b.trans_num) - parseFloat(a.trans_num);       //parsefloat:문자열=>숫자로 바꿈  //b-a로 배열 위치 내림차순으로 바꿔줌   (a-b하면 오름차순)
                            });                               
                            console.log('case3')
                            res.json(data)                        
                        })
                    })
                })
                break;
            case 4:         //키워드 4개
                var cnt = 0;
                conn.query(sql, input_data0,(err, result)=>{
                    conn.query(sql, input_data1, (err, result1)=>{
                        for(i=0; i<result1.length; i++){
                            for(j=0; j<result.length; j++){
                                if(result[j].trans_num == result1[i].trans_num){
                                    cnt = cnt + 1
                                }
                                else{
                                    cnt = cnt
                                }
                            }
                            if(cnt == 0){
                                result.push(result1[i])
                            }    
                        }
                        conn.query(sql, input_data2, (err, result2)=>{
                            for(i=0; i<result1.length; i++){
                                for(j=0; j<result.length; j++){
                                    if(result[j].trans_num == result1[i].trans_num){
                                        cnt = cnt + 1
                                    }
                                    else{
                                        cnt = cnt
                                    }
                                }
                                if(cnt == 0){
                                    result.push(result1[i])
                                }    
                            }    
                            conn.query(sql, input_data3, (err, result3)=>{
                                for(i=0; i<result1.length; i++){
                                    for(j=0; j<result.length; j++){
                                        if(result[j].trans_num == result1[i].trans_num){
                                            cnt = cnt + 1
                                        }
                                        else{
                                            cnt = cnt
                                        }
                                    }
                                    if(cnt == 0){
                                        result.push(result1[i])
                                    }    
                                }        
                                var data = {
                                    name : req.body.id,
                                    result : result,
                                    noproduct : '등록된 상품이 없습니다',
                                    noprice : '-',
                                    noimg : 'no image'
                                }
                                result.sort(function(a,b){
                                    return parseFloat(b.trans_num) - parseFloat(a.trans_num);       
                                });
                                console.log('case4')
                                res.json(data)                            
                            })
                        })
                    })
                })
                break;
            default:        //키워드 5개(6번째 키워드부터는 못뽑아옴)
                var cnt = 0;
                conn.query(sql, input_data0, (err, result)=>{
                    conn.query(sql, input_data1, (err, result1)=>{
                        for(i=0; i<result1.length; i++){
                            for(j=0; j<result.length; j++){
                                if(result[j].trans_num == result1[i].trans_num){
                                    cnt = cnt + 1
                                }
                                else{
                                    cnt = cnt
                                }
                            }
                            if(cnt == 0){
                                result.push(result1[i])
                            }    
                        }
                        conn.query(sql, input_data2, (err, result2)=>{
                            for(i=0; i<result1.length; i++){
                                for(j=0; j<result.length; j++){
                                    if(result[j].trans_num == result1[i].trans_num){
                                        cnt = cnt + 1
                                    }
                                    else{
                                        cnt = cnt
                                    }
                                }
                                if(cnt == 0){
                                    result.push(result1[i])
                                }    
                            }    
                            conn.query(sql, input_data3, (err, result3)=>{
                                for(i=0; i<result1.length; i++){
                                    for(j=0; j<result.length; j++){
                                        if(result[j].trans_num == result1[i].trans_num){
                                            cnt = cnt + 1
                                        }
                                        else{
                                            cnt = cnt
                                        }
                                    }
                                    if(cnt == 0){
                                        result.push(result1[i])
                                    }    
                                }        
                                conn.query(sql, input_data4, (err, result4)=>{
                                    for(i=0; i<result1.length; i++){
                                        for(j=0; j<result.length; j++){
                                            if(result[j].trans_num == result1[i].trans_num){
                                                cnt = cnt + 1
                                            }
                                            else{
                                                cnt = cnt
                                            }
                                        }
                                        if(cnt == 0){
                                            result.push(result1[i])
                                        }    
                                    }            
                                    var data = {
                                        name : req.body.id,
                                        result : result,
                                        noproduct : '등록된 상품이 없습니다',
                                        noprice : '-',
                                        noimg : 'no image'
                                    }
                                    result.sort(function(a,b){
                                        return parseFloat(b.trans_num) - parseFloat(a.trans_num);       
                                    });
                                    console.log('default')
                                    res.json(data)                                
                                })
                            })
                        })
                    })
                })
                break;
        }
    })


    app.get("/search_data2", function(req,res){          //동기 검색
        var conn = mysql.createConnection(conn_info)
        var sql = "select trans_num, post_title, post_content, post_picname_front, post_price_max from post where (post_title like ? or post_content like ?) and determinant = 1"
        var msg = req.query.search_data;
        var arr = msg.split(" ");       //공백기준으로 문자열 잘라 배열로 저장
        var arr_length = arr.length;
        console.log('arr:', arr)
        var input_data0 = ['%'+arr[0]+'%','%'+arr[0]+'%']
        var input_data1 = ['%'+arr[1]+'%','%'+arr[1]+'%']
        var input_data2 = ['%'+arr[2]+'%','%'+arr[2]+'%']
        var input_data3 = ['%'+arr[3]+'%','%'+arr[3]+'%']
        var input_data4 = ['%'+arr[4]+'%','%'+arr[4]+'%']

        switch(arr_length){         //검색 시 앞의 키워드 5개만 검색가능
            case 1:         //키워드 1개
                conn.query(sql, input_data0, (err, result)=>{
                    var data = {
                        name : req.body.id,
                        result : result,
                        noproduct : '등록된 상품이 없습니다',
                        noprice : '-',
                        noimg : 'no image'
                    }
                    result.sort(function(a,b){
                        return parseFloat(b.trans_num) - parseFloat(a.trans_num);       
                    });
                    console.log('case1')
                    if(req.session.data1){
                        res.render('./main/1_in.ejs',data)
                    }else{
                        res.render('./main/1.ejs',data)
                    }               
                })
                break;
            case 2:         //키워드 2개
                var cnt = 0;
                conn.query(sql, input_data0, (err, result)=>{
                    conn.query(sql, input_data1, (err, result1)=>{
                        for(i=0; i<result1.length; i++){
                            for(j=0; j<result.length; j++){
                                if(result[j].trans_num == result1[i].trans_num){        //2번째 쿼리에서 뽑아온 데이터가 이전에 뽑은 데이터랑 겹치면 cnt+1
                                    cnt = cnt + 1
                                }
                                else{
                                    cnt = cnt
                                }
                            }
                            if(cnt == 0){
                                result.push(result1[i])                         //앞의 for문이 끝났을 때 cnt=0이면 중복되는 데이터가 없으므로 배열에 데이터 추가
                            }    
                        }
                        var data = {
                            name : req.body.id,
                            result : result,
                            noproduct : '등록된 상품이 없습니다',
                            noprice : '-',
                            noimg : 'no image'
                        }
                        result.sort(function(a,b){
                            return parseFloat(b.trans_num) - parseFloat(a.trans_num);       //parsefloat:문자열=>숫자로 바꿈  //b-a로 배열 위치 내림차순으로 바꿔줌(최신순정렬)   (a-b하면 오름차순)
                        });
                        console.log('case2')
                        console.log(result)
                        if(req.session.data1){
                            res.render('./main/1_in.ejs',data)
                        }else{
                            res.render('./main/1.ejs',data)
                        }    
                    })
                })
                break;
            case 3:         //키워드 3개
                var cnt = 0;
                conn.query(sql, input_data0, (err, result)=>{
                    conn.query(sql, input_data1, (err, result1)=>{
                        for(i=0; i<result1.length; i++){
                            for(j=0; j<result.length; j++){
                                if(result[j].trans_num == result1[i].trans_num){       
                                    cnt = cnt + 1
                                }
                                else{
                                    cnt = cnt
                                }
                            }
                            if(cnt == 0){
                                result.push(result1[i])
                            }    
                        }
                        conn.query(sql, input_data2, (err, result2)=>{
                            for(i=0; i<result1.length; i++){
                                for(j=0; j<result.length; j++){
                                    if(result[j].trans_num == result1[i].trans_num){
                                        cnt = cnt + 1
                                    }
                                    else{
                                        cnt = cnt
                                    }
                                }
                                if(cnt == 0){
                                    result.push(result1[i])
                                }    
                            }    
                            var data = {
                                name : req.body.id,
                                result : result,
                                noproduct : '등록된 상품이 없습니다',
                                noprice : '-',
                                noimg : 'no image'
                            }
                            result.sort(function(a,b){
                                return parseFloat(b.trans_num) - parseFloat(a.trans_num);       //parsefloat:문자열=>숫자로 바꿈  //b-a로 배열 위치 내림차순으로 바꿔줌   (a-b하면 오름차순)
                            });                               
                            console.log('case3')
                            if(req.session.data1){
                                res.render('./main/1_in.ejs',data)
                            }else{
                                res.render('./main/1.ejs',data)
                            }                        
                        })
                    })
                })
                break;
            case 4:         //키워드 4개
                var cnt = 0;
                conn.query(sql, input_data0,(err, result)=>{
                    conn.query(sql, input_data1, (err, result1)=>{
                        for(i=0; i<result1.length; i++){
                            for(j=0; j<result.length; j++){
                                if(result[j].trans_num == result1[i].trans_num){
                                    cnt = cnt + 1
                                }
                                else{
                                    cnt = cnt
                                }
                            }
                            if(cnt == 0){
                                result.push(result1[i])
                            }    
                        }
                        conn.query(sql, input_data2, (err, result2)=>{
                            for(i=0; i<result1.length; i++){
                                for(j=0; j<result.length; j++){
                                    if(result[j].trans_num == result1[i].trans_num){
                                        cnt = cnt + 1
                                    }
                                    else{
                                        cnt = cnt
                                    }
                                }
                                if(cnt == 0){
                                    result.push(result1[i])
                                }    
                            }    
                            conn.query(sql, input_data3, (err, result3)=>{
                                for(i=0; i<result1.length; i++){
                                    for(j=0; j<result.length; j++){
                                        if(result[j].trans_num == result1[i].trans_num){
                                            cnt = cnt + 1
                                        }
                                        else{
                                            cnt = cnt
                                        }
                                    }
                                    if(cnt == 0){
                                        result.push(result1[i])
                                    }    
                                }        
                                var data = {
                                    name : req.body.id,
                                    result : result,
                                    noproduct : '등록된 상품이 없습니다',
                                    noprice : '-',
                                    noimg : 'no image'
                                }
                                result.sort(function(a,b){
                                    return parseFloat(b.trans_num) - parseFloat(a.trans_num);       
                                });
                                console.log('case4')
                                if(req.session.data1){
                                    res.render('./main/1_in.ejs',data)
                                }else{
                                    res.render('./main/1.ejs',data)
                                }                             
                            })
                        })
                    })
                })
                break;
            default:        //키워드 5개(6번째 키워드부터는 못뽑아옴)
                var cnt = 0;
                conn.query(sql, input_data0, (err, result)=>{
                    conn.query(sql, input_data1, (err, result1)=>{
                        for(i=0; i<result1.length; i++){
                            for(j=0; j<result.length; j++){
                                if(result[j].trans_num == result1[i].trans_num){
                                    cnt = cnt + 1
                                }
                                else{
                                    cnt = cnt
                                }
                            }
                            if(cnt == 0){
                                result.push(result1[i])
                            }    
                        }
                        conn.query(sql, input_data2, (err, result2)=>{
                            for(i=0; i<result1.length; i++){
                                for(j=0; j<result.length; j++){
                                    if(result[j].trans_num == result1[i].trans_num){
                                        cnt = cnt + 1
                                    }
                                    else{
                                        cnt = cnt
                                    }
                                }
                                if(cnt == 0){
                                    result.push(result1[i])
                                }    
                            }    
                            conn.query(sql, input_data3, (err, result3)=>{
                                for(i=0; i<result1.length; i++){
                                    for(j=0; j<result.length; j++){
                                        if(result[j].trans_num == result1[i].trans_num){
                                            cnt = cnt + 1
                                        }
                                        else{
                                            cnt = cnt
                                        }
                                    }
                                    if(cnt == 0){
                                        result.push(result1[i])
                                    }    
                                }        
                                conn.query(sql, input_data4, (err, result4)=>{
                                    for(i=0; i<result1.length; i++){
                                        for(j=0; j<result.length; j++){
                                            if(result[j].trans_num == result1[i].trans_num){
                                                cnt = cnt + 1
                                            }
                                            else{
                                                cnt = cnt
                                            }
                                        }
                                        if(cnt == 0){
                                            result.push(result1[i])
                                        }    
                                    }            
                                    var data = {
                                        name : req.body.id,
                                        result : result,
                                        noproduct : '등록된 상품이 없습니다',
                                        noprice : '-',
                                        noimg : 'no image'
                                    }
                                    result.sort(function(a,b){
                                        return parseFloat(b.trans_num) - parseFloat(a.trans_num);       
                                    });
                                    console.log('default')
                                    if(req.session.data1){
                                        res.render('./main/1_in.ejs',data)
                                    }else{
                                        res.render('./main/1.ejs',data)
                                    }                               
                                })
                            })
                        })
                    })
                })
                break;
        }
    })

    app.get('/offer_again', async function(req,res){
        //여기에 금액 수정하는 컨트랙트 넣을거야!!!!!!!!!!!!
        try{
            let conn = mysql.createConnection(conn_info);
            let sql = "select post_buyer, post_contract_address from post where trans_num = ?";
            let sql1 = "select wallet_add, password from guest where user_id = ?";
            conn.query(sql,req.query.tar, (err,result)=>{
                let array = result[0].post_buyer.split(',');
                conn.query(sql1, req.session.data1, (err,result1)=>{
                    web3.eth.personal.unlockAccount(result1[0].wallet_add, result1[0].password, 600);
                    let contract = new web3.eth.Contract(abi, result[0].post_contract_address);
                    let con1 = contract.methods.offer_again(array.indexOf(req.session.data1)+1).send({
                        from: result1[0].wallet_add,
                        value: req.query.coin_offer                                                 //아마 여기 부분 수정해야 함 14_bought.ejs query부분 문제
                    });                       // uint8에 이 값이 들어감
                    console.log(con1);
                    res.redirect('/main_1_in');
                })
            })
            
        }catch(error){

        }
        
    })

    app.get('/offer_cancel', async function(req,res){
        try{
            let conn = mysql.createConnection(conn_info);
            let sql = "select post_buyer from post where trans_num = ?";
            let sql1 = "update post set post_buyer = ? where trans_num = ?";

            conn.query(sql, req.query.tar, (err,result)=>{
                let array = result[0].post_buyer.split(',');
                console.log(array);
                let finder = array.indexOf(req.session.data1);
                console.log(finder)
                let list = array.splice(finder,1);
                if(array.length == 0){
                    array.splice(0,0,'');
                }
                console.log(array)
                conn.query(sql1, [array[0],req.query.tar], (err)=>{


                    res.redirect('/main_1_in');
                })
            })

        }catch(error){

        }
        
    })

    app.get('/offer_check' ,async function(req,res){                         //제시 금액 확인하는 컨트랙트 실행
        try{
            let conn = mysql.createConnection(conn_info);
            let sql = "select geust.wallet_add, guest.password, post.post_contract_address from post left join guest on guest.user_id = post.user_id where trans_num = ?"
            conn.query(sql,req.query.tar, (err,result)=>{
                web3.eth.personal.unlockAccount(result[0].wallet_add, result[0].password, 600);
                let contract = new web3.eth.Contract(abi, result[0].post_contract_address);
                let con1 = contract.methods.how_much().call({
                    from: result[0].wallet_add
                })
                console.log(con1)
                let data = {
                    amount : con1[0]
                }
                res.json(data)
        })
        }catch(error){
            console.log(error)
        }
        
    })

   
    app.get('/test', function(req, res){
        res.render('./main/test.ejs')
    })
};
