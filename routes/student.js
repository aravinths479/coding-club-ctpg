const express = require("express");
const router = express.Router();
const {
  ensureAuthenticated,
  forwardAuthenticated,
  isFaculty,
  isStudent,
} = require("../config/auth");

const Event = require("../models/Event");
const Student = require("../models/Student");
const Faculty = require("../models/Faculty");

router.get('/list-events',ensureAuthenticated,isStudent,(req,res)=>{
    try{
        
    }
    catch(err){
        console.log(err);
    }
})




module.exports = router;
