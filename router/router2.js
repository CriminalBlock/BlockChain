var bodyParser = require("body-parser");
const { render } = require("ejs");
var parser = bodyParser.urlencoded({extended:false});
var fs = require("fs")
var solc = require("solc");
var Web3 = require("web3");
var web3 = new Web3('http://localhost:8545');

const mysql = require("mysql2");
const { NULL } = require("mysql2/lib/constants/types");
let conn_info = {
    host : 'localhost',
    port : 3300,
    user : 'root',
    password : '1234',
    database : 'mydb'
};



let pay_abi =  [
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_price",
				"type": "uint256"
			},
			{
				"internalType": "bytes32",
				"name": "_product",
				"type": "bytes32"
			},
			{
				"internalType": "address payable",
				"name": "_manager",
				"type": "address"
			}
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"constant": false,
		"inputs": [],
		"name": "buyer_win",
		"outputs": [],
		"payable": true,
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"internalType": "uint8",
				"name": "",
				"type": "uint8"
			}
		],
		"name": "buyers",
		"outputs": [
			{
				"internalType": "address payable",
				"name": "wallet_name_buyer",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "coin",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"internalType": "uint8",
				"name": "tar",
				"type": "uint8"
			}
		],
		"name": "cancel",
		"outputs": [],
		"payable": true,
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "check_product",
				"type": "bytes32"
			}
		],
		"name": "certificate_product",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "check_product2",
				"type": "bytes32"
			}
		],
		"name": "certificate_product_seller",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [],
		"name": "get_money",
		"outputs": [],
		"payable": true,
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "how_much",
		"outputs": [
			{
				"internalType": "uint256[]",
				"name": "",
				"type": "uint256[]"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"internalType": "uint8",
				"name": "tar",
				"type": "uint8"
			}
		],
		"name": "offer_again",
		"outputs": [],
		"payable": true,
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"internalType": "uint8",
				"name": "tar",
				"type": "uint8"
			}
		],
		"name": "sell_to_buyer",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "seller_address",
		"outputs": [
			{
				"internalType": "address payable",
				"name": "",
				"type": "address"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [],
		"name": "seller_win",
		"outputs": [],
		"payable": true,
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [],
		"name": "set_buyers",
		"outputs": [],
		"payable": true,
		"stateMutability": "payable",
		"type": "function"
	}
]; 
//exchange.sol 컴파일
// let source2 = fs.readFileSync(__dirname+"/exchange.sol", 'utf8');             //source에 pay.sol을 utf8형식으로 불러옴
// let solcInput2 = {                                                       //solc.compile이 json타입으로 입력되어야 하므로 꼴을 맞춰줌
//     language: "Solidity",
//     sources: {
//         contract: {
//             content: source2
//         }
//     },
//     settings: {
//         outputSelection: {
//             '*': {
//                 '*': ['*']
//             }
//         }
//     }
// }
// let compiledContract2 = solc.compile(JSON.stringify(solcInput2));
// let output2 = JSON.parse(compiledContract2);
// let bytecode2 = output2.contracts.contract['MulitiplyContract'].evm.bytecode.object;     //컴파일 후 bytecode 가져오기
// let abi2 = output2.contracts.contract['MulitiplyContract'].abi;                          //컴파일 후 abi 가져오기            bytecode와 abi는 deploy할 때 꼭 필요하다. abi는 배포된 계약 주소를 통해 계약 내부 메소드 호출이나 상태를 변경시키기 위한 instance를 만들 때 필요하다.
// console.log('abi2:',abi2)

//exchange.sol : Multiplycontract deploy
// let conn = mysql.createConnection(conn_info);
// let sql2 = 'select user_id, password, wallet_add from manager'      //manager 정보: 가져와서 unlock하고 deploy해야함
// let sql3 = 'update exchange set exchange_contract_address = ? where exchange_num = ?'
// conn.query(sql2, async (err, result1)=>{
//     console.log(err)
//     await web3.eth.personal.unlockAccount(result1[0].wallet_add,result1[0].password, 600);
//     let MyContract = await new web3.eth.Contract(abi2);       
//     var deploy = await MyContract.deploy({
//         data: '0x'+bytecode2,
//         arguments: [result1[0].wallet_add]
//         }).encodeABI();
//     console.log('deploy',deploy)
//     fs.writeFileSync(__dirname+'/deploy.txt',deploy);
// })

module.exports = function(app){
   
    app.get("/",function(req,res){
        res.render("aa_css.ejs");
    });

    app.post("/al",parser,function(req,res){

        
        let conn = mysql.createConnection(conn_info);
        var sql1 = "select user_id, password, wallet_add from manager where user_id = ?";
        let goal = req.body.id;
        conn.query(sql1,goal,(err,result,fields)=>{
            console.log(result);
            if (result==''){
                console.log("실행");
                res.render("aa_css.ejs");
            }else{
                if (result[0].password != req.body.pw){
                    res.render("aa_css.ejs");
                }else{
                    req.session.data1 = req.body.id
                    req.session.data2 = req.body.pw
                    req.session.data3 = result[0].wallet_add
                    res.redirect("al3?num=1");
                    web3.eth.personal.unlockAccount(req.session.data3, req.session.data2, 600);
                }
            }
            
        });
        conn.end();
    });
    // app.get("/al1", function(req,res){
    //     var name = req.session.data1;
    //     let conn = mysql.createConnection(conn_info);
    //     var sql1 = "select user_id, post_title, post_content from post";
    //     conn.query(sql1,function(err, result){
    //         var render_data = {
    //             name : name,
    //             result : result
    //         }
    //         console.log(result);
    //         res.render("cc_css_2.ejs",render_data);
    //     });
    // });

    app.get("/al2",function(req,res){
        console.log(req.session.data1);
        let conn = mysql.createConnection(conn_info);
        var sql1 = "insert into post (user_id, post_title, post_content) values(?, ?, ?)";
        var target = [req.session.data1, req.query.title_name, req.query.content_text];
        conn.query(sql1,target, (err, result)=>{
            console.log(sql1);
            console.log("저장완료");
            conn.end();
            res.redirect("al3?num=1");
        });
    });

    // app.get("/al31", function(req,res){
    //     var name = req.session.data1;
    //     let conn = mysql.createConnection(conn_info);
    //     var sql1 = "select count(*) as cnt from post";
    //     var sql2 = "select user_id, post_title, post_content from post limit 10";
    //     conn.query(sql1,function(err, result){
    //         conn.query(sql2,function(err, result1){
    //             var render_data = {
    //                 name : name,
    //                 result : result,
    //                 result1 : result1
    //             };
    //             console.log(result[0]);
    //             res.render("cc_css_2.ejs",render_data);
    //         });
    //     });
    // });

    app.get("/al3", function(req,res){
        var name = req.session.data1;
        req.session.data2 = req.query.num;
        let conn = mysql.createConnection(conn_info);
        var tar = parseInt(req.query.num);
        var r_tar = (tar-1)*10;
        var sql2 = "select count(*) as cnt from post";
        var sql1 = "select user_id, post_title, post_content from post limit "+r_tar+", 10";
        conn.query(sql2,function(err, result){
            conn.query(sql1,function(err,result1){
                var render_data = {
                    name : name,
                    result : result,
                    result1 : result1,
                    present : tar
                }
                console.log(result1);
                res.render("cc_css_2.ejs",render_data);
            });
            
        });
    });

    app.get("/al4", function(req,res){
        var name = req.session.data1;
        let page = req.session.data2;
        let conn = mysql.createConnection(conn_info);
        var sql1 = "select trans_num, user_id, post_title, post_content, post_picname_front, post_picname_side, post_picname_back from post where trans_num = ?"
        var sql2 = "select count(*) as cnt from post";
        var sql3 = "select user_id, post_comment from comment where trans_num = ?"
        let number = req.query.number;
        let real_number = (parseInt(page)-1)*10+parseInt(number);
        console.log(real_number);
        // console.log(number);
        conn.query(sql1, real_number,(err,result)=>{
            console.log(result);
            conn.query(sql2,(err, result1)=>{
                conn.query(sql3,result[0].trans_num,(err,result2)=>{
                var render_data = {
                    name : name,
                    result : result,
                    result1 : result1,
                    result2 : result2
                };
                
                res.render("dd_o.ejs",render_data);
                
            })
          });
            
            
        });
    });
    // app.get("/al41", function(req,res){
    //     var name = req.session.data1;
    //     let page = req.session.data2;
    //     let conn = mysql.createConnection(conn_info);
    //     var sql1 = "select trans_num, user_id, post_title, post_content from post where trans_num = ?"
    //     var sql2 = "select count(*) as cnt from post";
    //     let number = req.query.number;
    //     let real_number = parseInt(number);
    //     console.log(real_number);
    //     // console.log(number);
    //     conn.query(sql1, real_number,(err,result)=>{
    //         console.log(result);
    //         conn.query(sql2,(err, result1)=>{
    //             var render_data = {
    //                 name : name,
    //                 result : result,
    //                 result1 : result1
    //             };
    //             if(name!=result[0].user_id){
    //                 res.render("dd.ejs", render_data);             
    //             }else{
    //                 res.render("dd_o.ejs",render_data);
    //             };
    //         });
            
            
    //     });
    // });

    app.post("/dd_o_result",parser, async function(req, res){
        let conn = mysql.createConnection(conn_info);
        var sql1 = "insert into comment(user_id, trans_num, post_comment) values (?,?,?)"              
        var input_data1 = [req.body.com_id, req.body.com_trans_num, req.body.comment]                           //이 부분 순서 바뀌어 있었음
        console.log(req.body.com_id, req.body.com_title, req.body.comment);
        conn.query(sql1, input_data1,(err)=>{
            console.log("코멘트 저장");
            res.redirect("al4?number="+req.body.com_trans_num);
            console.log("trans_num:", req.body.com_trans_num);
            console.log("id:",req.body.com_id)
        });

        console.log("이거 받아오냐?"+req.body.title);
    });

    app.get("/al5", function(req,res){
        var name = req.session.data1;
        let conn = mysql.createConnection(conn_info);
        var sql1 = "update post set post_title = ?, post_content = ? where trans_num = ?"
        var tar = [req.query.title_name, req.query.content_text,req.query.title_number];
        conn.query(sql1,tar,(err)=>{
            console.log(tar);
            res.redirect("al3?num=1");
        });
    });

    app.get("/al6", function(req,res){
        var name = req.session.data1;
        let num = parseInt(req.query.search_tar)+1;
        let conn = mysql.createConnection(conn_info);
        if(req.query.list=="trans_num"){
            var sql1 = "select trans_num, user_id, post_title, post_content from post where "+req.query.list+" = "+num;
            var sql2 = "select count(*) as ctn from post where "+req.query.list+" = "+num;
        }else{
            var sql1 = "select trans_num, user_id, post_title, post_content from post where "+req.query.list+" like "+"'"+req.query.search_tar+"%'";
            var sql2 = "select count(*) as ctn from post where "+req.query.list+" like "+"'"+req.query.search_tar+"%'";
        };
        console.log(sql1);
        conn.query(sql2,(err,result)=>{
            conn.query(sql1,(err,result1)=>{
                var render_data = {
                    name : name,
                    result : result,
                    result1 : result1
                }
                res.render("cc_css_2.ejs",render_data)
            });
            
        });
    });

    app.get("/al6_user", function(req,res){
        var name = req.session.data1;
        let num = parseInt(req.query.search_tar)+1;
        let conn = mysql.createConnection(conn_info);
        if(req.query.list=="idguest"){
            var sql1 = "select idguest, user_id, wallet_status from guest where "+req.query.list+" = "+num;
            var sql2 = "select count(*) as ctn from guest where "+req.query.list+" = "+num;
        }else{
            var sql1 = "select idguest, user_id, wallet_status from guest where "+req.query.list+" like "+"'"+req.query.search_tar+"%'";
            var sql2 = "select count(*) as ctn from guest where "+req.query.list+" like "+"'"+req.query.search_tar+"%'";
        };
        console.log(sql1);
        conn.query(sql2,(err,result)=>{
            conn.query(sql1,(err,result1)=>{
                var render_data = {
                    name : name,
                    result : result,
                    result1 : result1
                }
                res.render("admin_user.ejs",render_data)
            });
            
        });
    });

    app.get("/newacc", function(req,res){
        res.render('newacc_css.ejs');

    });

    app.get("/newacc_correct",function(req,res){
        console.log("aaaaaa");
        let conn = mysql.createConnection(conn_info);
        let sql1 = "select user_id, password from guest where user_id = ?"
        let tar = req.query.id;
        conn.query(sql1, tar,(err,result)=>{
            console.log(result);
            if (result==''){ 
                console.log("사용가능");
            }else{
                console.log("중복");
                res.redirect("/newacc");
            };
        // conn.end();
        
        });
    });
    
    app.post("/suc",parser,function(req,res){
        
        var a = req.body.id;
        var b = req.body.pw;
        let conn = mysql.createConnection(conn_info);
        conn.connect(function(err){
            if(err){
                console.log('접속오류');
                console.log(err);
            }else{
                console.log('접속성공');
                let sql1 = "insert into guest (user_id, password) values (?, ?)";
                let input_data1 = [a, b];
                conn.query(sql1, input_data1, (err, result)=>{
                    console.log('저장완료');
                    console.log("아이디 : "+result.insertId);
                });
        
        
                conn.end();
        
            }
        });
        
        res.render('suc.ejs');
    });
    app.get("/del",function(req,res){
        let num = req.query.num;
        let conn = mysql.createConnection(conn_info);
        var sql1 = "delete from post where trans_num = ?;"
        // alter table post auto_increment=1; set @count=0; update post set post.trans_num=@count:=@count+1;";
        var sql2 = "alter table post auto_increment=1;"
        var sql3 = "set @count=0;"
        var sql4 = "update post set post.trans_num=@count:=@count+1;"
        console.log(num);
        conn.query(sql1,num,(err)=>{
        });
        conn.query(sql2,(err)=>{
        });
        conn.query(sql3,(err)=>{
        });
        conn.query(sql4,(err)=>{
            res.redirect("al3?num=1");
        });
    });

    app.get("/del_com", function(req, res){
        //let comment = req.query.comment;
        let conn = mysql.createConnection(conn_info);

        var sql1 = "select trans_num, post_comment from comment where trans_num=? and post_comment=?"
        var input_data1 = [req.query.com_trans_num, req.query.com_comment]
        var sql2 = "delete from comment where post_comment=?"
        var input_data2 = [req.query.com_comment]

        conn.query(sql1, input_data1,(err)=>{
            conn.query(sql2, input_data2,(err)=>{
               res.redirect("al4?number="+req.query.com_trans_num);
                console.log("deletecomment")
                console.log("id:",req.query.com_id)
                console.log("comment:",input_data2)
            })
        })

    });







    app.get("/admin_user",function(req,res){
        var name = req.session.data1;
        req.session.data2 = req.query.num;
        let conn = mysql.createConnection(conn_info);
        var tar = parseInt(req.query.num);
        var r_tar = (tar-1)*10;
        var sql2 = "select count(*) as cnt from guest";
        var sql1 = "select user_id, wallet_status from guest limit "+r_tar+", 10";
        conn.query(sql2,function(err, result){
            conn.query(sql1,function(err,result1){
                var render_data = {
                    name : name,
                    result : result,
                    result1 : result1,
                    present : tar
                }
                console.log(result1);
                res.render("admin_user.ejs",render_data);
            });
            
        });
    });
    app.post("/disable_result", async function(req,res){
        let conn = mysql.createConnection(conn_info);
        var sql1 = "update guest set wallet_status = ? where user_id = ?"
        var sql2 = "select wallet_status from guest where user_id = ?"
        conn.query(sql1,[req.body.val+'d',req.body.id],function(err){
            conn.query(sql2,req.body.id,function(err,result){
                if (req.body.val == "disable"){
                    var data = {
                        val : "enable",
                        sta : result[0].wallet_status
                    };
                }else {
                    var data = {
                        val : "disable",
                        sta : result[0].wallet_status
                    };
                };
                res.json(data);
            });
        });
        
        
        console.log(req.body);
        
    });

    app.get("/delete_user", async function(req,res){
        let conn = mysql.createConnection(conn_info);
        var sql1 = "delete from guest where user_id = ?;";
        var sql2 = "alter table guest auto_increment=1;";
        var sql3 = "set @count=0;";
        var sql4 = "update guest set post.idguest=@count:=@count+1;";
        conn.query(sql1,req.query.id,(err)=>{
        });
        conn.query(sql2,(err)=>{
        });
        conn.query(sql3,(err)=>{
        });
        conn.query(sql4,(err)=>{
            res.redirect("admin_user?num=1");
        });
        
    });
    app.get('/seller_win', function(req, res){
        try{
            console.log(req.query.trans_num)
            let conn = mysql.createConnection(conn_info);
            var sql = 'select post_contract_address from post where trans_num = ?'
                
                web3.eth.personal.unlockAccount(req.session.data3, req.session.data2,600)      //manager unlock
                console.log('password:',result1[0].password)
                    conn.query(sql, req.query.trans_num, (err, result)=>{     //컨트랙트 주소 가져옴
                        console.log(result)
                        console.log(err)
                        contract_seller= new web3.eth.Contract(pay_abi, result[0].post_contract_address);
                        console.log('adress:', result[0].post_contract_address)

                        var seller = contract_seller.methods.seller_win().send({from:req.session.data3});   //지금은 일단 관리자를 manager테이블의 0번째 주소로 설정     //관리자페이지 : 관리자만 로그인가능하도록 수정 => 로그인한 세션으로 수정하기
                        console.log('seller_win:',seller)
                        console.log(err)
                        res.json();
                        })
        }catch(error){
            console.log('err:',error)
        }
    })

    app.get('/buyer_win', function(req, res){
        try{
            console.log(req.query.trans_num)
            let conn = mysql.createConnection(conn_info);
            var sql = 'select post_contract_address from post where trans_num = ?'
                web3.eth.personal.unlockAccount(req.session.data3, req.session.data2,600)      //manager unlock
                conn.query(sql, req.query.trans_num, (err, result)=>{     //컨트랙트 주소 가져옴
                    console.log(result)
                    console.log(err)
                    contract_buyer= new web3.eth.Contract(pay_abi, result[0].post_contract_address);
                    console.log('adress:', result[0].post_contract_address)

                    var buyer = contract_buyer.methods.buyer_win().send({from:req.session.data3});   //지금은 일단 관리자를 manager테이블의 0번째 주소로 설정     //관리자페이지 : 관리자만 로그인가능하도록 수정 => 로그인한 세션으로 수정하기
                    console.log('buyer_win:',buyer)
                    console.log(err)
                res.json();
                })
        }catch(error){
            console.log('err:',error)
        }
    })

    // app.get('/contact', function(req,res){
    //     let conn = mysql.createConnection(conn_info);
    //     var sql = 'select exchange_num, user_id, eth_value from exchange'
    //     conn.query(sql, (err, result)=>{
    //         conn.query('select user_id, password, wallet_add from manager',(err,result1)=>{
    //             web3.eth.personal.unlockAccount(result1[0].wallet_add,result1[0].password, 600);
    //             data = {
    //                 name: req.session.data1,
    //                 result1 : result
    //             }
    //             res.render('exchange_manager', data)    
    //         })
    //     })
    // })

    // app.get('/exchange_denied', function(req, res){
    //     let conn = mysql.createConnection(conn_info);
    //     var sql = 'delete from exchange where exchange_num = ?'
    //     conn.query(sql, req.query.ex_num, (err, result)=>{
    //         console.log(err)
    //         res.json()
    //         // res.redirect('/exchange_manager')
    //     })
    // })
    
    // app.get('/exchange_success', async function(req,res){
    //     let conn = mysql.createConnection(conn_info);
    //     var sql = 'select * from exchange inner join guest on exchange.user_id = guest.user_id and exchange_num = ?' //구매자 정보: eth value, wallet_add 가져오려고
    //     var sql2 = 'select user_id, password, wallet_add from manager'      //manager 정보: 가져와서 unlock하고 deploy해야함
    //     var sql3 = 'update exchange set exchange_contract_address = ? where user_id = ? and exchange_num = ?'
    //     conn.query(sql, req.query.ex_num, (err, result)=>{
    //         console.log(err)

    //         conn.query(sql2, async (err, result1)=>{
    //         let con_addr;
    //         var deploy = fs.readFileSync(__dirname+'/deploy.txt')       //deploy data가 exchange.sol contract deploy할 때 sql쿼리문 안에서 생성한 데이터라 밖으로 못가져와서 파일로 따로 저장한 후 읽어와서 변수에 저장해 준 것
    //         var deploy2 = deploy.toString();

    //         con_addr = await web3.eth.sendTransaction({       //계약을 블록에 배포한 후 스마트 컨트랙트 주소를 가져오기 위해 await을 선언하여 sendTransaction이 완료된 후 다음 줄이 실행되도록 하였다.
    //             from: result1[0].wallet_add,
    //             data : deploy2
    //         });

    //             conn.query(sql3, [con_addr.contractAddress, result[0].user_id, req.query.ex_num],async (err,result3)=>{    //contract주소 exchange에 update
    //                 console.log(err)
    //                 let contract = await new web3.eth.Contract(abi2, con_addr.contractAddress);        //exchange.sol의 Execution함수 실행
    //                 contract.methods.Execution(result[0].wallet_add).send({
    //                     from: result1[0].wallet_add,
    //                     value: parseInt(result[0].eth_value)*1000000000000000000         
    //                 }); 
    //                 conn.query('delete from exchange where exchange_num = ?',[req.query.ex_num],(err,result4)=>{    //송금 후 삭제(contract address도 같이 삭제)
    //                     res.json()   
    //                 })
    //                 // res.redirect('/exchange_manager')
 
    //             })
    //         })
    //     })
    // })
}

// -나중에 고객이 해당 거래 정보를 요청했을 때 어떻게 꺼내 줄 것인가? : blockHash/blockNumber/contractAddress/transactionHash 등이 필요하진 않은지