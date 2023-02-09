const authModel=require('../model/authModel');
const bcrypt = require("bcryptjs");
const uuid=require('uuid');
const jwt=require('jsonwebtoken')
const dotenv=require('dotenv');
const { response } = require('express');
dotenv.config();
const signup=async(req,res,next)=>{
    const{ name,email,password}=req.body;
    if(!name && !email && !password)
    {
        return res.status(404).json('Enter value first!!');
    }
    let existingUser;
    try {
        existingUser=await authModel.findOne({email:email})
    } catch (error) {
        console.log(error)
    }
    if(existingUser)
    {
        console.log(existingUser)
        return res.status(200).json({msg:'user already exists!! Login instead'})
    }
    else{
   console.log(name)
  

   
const hashedPassword = bcrypt.hashSync(password);
//    console.log(encryPassword);
    try{
     const user=await authModel.create({name,email,password:hashedPassword}) 
       res.status(200).json(user);
    }catch(error){
       res.status(404).json(error)
    }
}
}
const login=async(req,res,next)=>{
    const{name,email,password}=req.body;
    let existingUser;
    try {
        existingUser=await authModel.findOne({email})
    } catch (error) {
        return new Error(error);
    }
    if(!existingUser)
    {
        res.status(404).json({msg:'User not found.SignUp please'})
    }
const isPasswordCorrect = bcrypt.compareSync(password, existingUser.password);
    
    if(!isPasswordCorrect)
    {
     
     return res.status(400).json({msg:'Invalid Email/Password'})
    }
    const token=jwt.sign({id:existingUser._id},process.env.SECRET_KEY,{
        expiresIn:"24h",
    })
      if (req.cookies[`${existingUser._id}`]) {
        req.cookies[`${existingUser._id}`] = "";
      }

    res.cookie(String(existingUser._id), token, {
      path: "/",
      expires: new Date(Date.now() + 86400 * 1000),
      httpOnly: true,
      sameSite: "lax",
    });

    return res.status(200).json({msg:'Succesfully Loggedin !!!',existingUser})
    

}

const verify= async(req,res,next)=>{
    const cookie=req.headers.cookie;
    // console.log(cookie);
    // const { authorization } = req.headers;
    // console.log(authorization);
    // if(!authorization && !authorization.startsWith('bearer'))
    // {
    //     return res.status(404).json('Token not present');
    // }
     const token = cookie.split("=")[1];
     if (!token) {
       res.status(404).json({ message: "No token found" });
     }
    const decoded=jwt.verify(String(token),process.env.SECRET_KEY);
    if(!decoded)
    {
        return res.status(400).json('caught an error while accesing the token');
    }
    const id=decoded.id;
    req.id=id;
    // console.log(id)
    // if(id)
    // {
    //     return res.status(200).json({id:id});
    // }
next()
}
const getUser=async(req,res)=>{
    const UserId=req.id;
    try {
        const user=await authModel.findById(UserId,'-password');
        if (!user) {
          return res.status(404).json({ msg: "user not found" });
        }
        return res.status(200).json({ user });
    } catch (error) {
           return new Error(error);
    }
    
    
}
const refreshToken = (req, res, next) => {
  const cookies = req.headers.cookie;
  const prevToken = cookies.split("=")[1];
  if (!prevToken) {
    return res.status(400).json({ message: "Couldn't find token" });
  }
  jwt.verify(String(prevToken), process.env.SECRET_KEY, (err, user) => {
    if (err) {
      console.log(err);
      return res.status(403).json({ message: "Authentication failed" });
    }
    res.clearCookie(`${user.id}`);
    req.cookies[`${user.id}`] = "";

    const token = jwt.sign({ id: user.id }, process.env.SECRET_KEY, {
      expiresIn: "24h",
    });
    console.log("Regenerated Token\n", token);

    res.cookie(String(user.id), token, {
      path: "/",
      expires: new Date((Date.now() + 86400 * 1000)), // 30 seconds
      httpOnly: true,
      sameSite: "lax",
    });

    req.id = user.id;
    next();
  });
};


module.exports={signup,login,verify,getUser,refreshToken};