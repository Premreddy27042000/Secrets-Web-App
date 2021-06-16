//jshint esversion:6

require('dotenv').config()
const express = require("express");
const bodyparser = require("body-parser");
const ejs = require("ejs");
const mongoose =require("mongoose");
// const encrypt = require("mongoose-encryption")
// const md5 = require("md5")
// const bcrypt = require("bcrypt");
// const { Hash } = require('crypto');

// const saltRounds = 10;

const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();
// console.log(process.env.API_KEY);
// console.log(md5("1"))

app.set("view engine","ejs");
app.use(bodyparser.urlencoded({extended:true}));

app.use(express.static("public"));

app.use(session({
    secret : "our little secret",
    resave  :false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());


mongoose.set('useNewUrlParser', true);
mongoose.set('useUnifiedTopology', true);
mongoose.connect("mongodb://localhost:27017/UsersDB");
mongoose.set("useCreateIndex" , true)

const userSchema = new mongoose.Schema( {
    email: String,
    password:String,
    secret : String
});

userSchema.plugin(passportLocalMongoose);
// userSchema.plugin(encrypt,{secret :process.env.SERECT,encryptedFields : ["password"]})

const User = new mongoose.model("User",userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get("/",function(req,res){
    res.render("home")
})
app.get("/login",function(req,res){
    res.render("login")
})
app.get("/register",function(req,res){
    res.render("register")
})


app.get("/secrets",function(req,res){

    User.find({"secret":{$ne : null}},function(err,foundUsers){
        if(err){
            console.log(err)
        }else{
            if(foundUsers){
                res.render("secrets" , {usersWithSecrects : foundUsers})
            }
        }
    })

    // if(req.isAuthenticated()){
    //     res.render("secrets")
    // }else{
    //     res.redirect("/login")
    // }
})


app.get("/submit",function(req,res){

  

    if(req.isAuthenticated()){
        res.render("submit")
    }else{
        res.redirect("/login")
    }
})

app.get("/logout",function(req,res){
    req.logOut();
    res.redirect("/")
})

app.post("/submit",function(req,res){
    const submittedForm = req.body.secret;

    console.log(req.user.id)

    User.findById(req.user.id,function(err,foundUser){
        if(err){
            console.log(err);
        }else {
            if(foundUser){
                foundUser.secret = submittedForm;
                foundUser.save(function(){
                    res.redirect("/secrets")
                })
            }
        }
    })
})

app.post("/register",function(req,res){

  User.register({username:req.body.username},req.body.password,function(err,User){
      if(err){
          console.log(err);
          res.redirect("/register");
      }else {
          passport.authenticate("local")(req,res,function(){
              res.redirect("/secrets")
          })
      }
  })

//   bcrypt.hash(req.body.password, saltRounds,function(err,hash){
//     const user = new User({
//         email:req.body.username,
//         password:hash

//         // md5(req.body.password)
//     })
  
//     user.save(function(err){
//         if(err){
//             res.render(err);
//         }else{
//             res.render("secrets")
//         }
//     })

//   });

});


app.post("/login",function(req,res){

     const user = new User ({
         username : req.body.username,
         password: req.body.password
     });
  
     req.login(user,function(err){
         if(err){
             console.log(err);
         }else {
             passport.authenticate("local")(req,res,function(){
                 res.redirect("/secrets")
             })
         }
     })
   





    // const username = req.body.username;
    // const password = req.body.password;

    // User.findOne({email:username},function(err,foundUser){
    //     if(err){
    //         res.render(err);
    //     }else{
    //         if(foundUser){
    //             bcrypt.compare(password, foundUser.password,function(err,result){
    //                if( result === true){
    //                 res.render("secrets");
    //                }
    //             }); 
    //         }
    //     }
    // })
})

app.listen(3000,function(){
    console.log("Server Started")
})

// if(foundUser.password === password){
//     res.render("secrets")
// }