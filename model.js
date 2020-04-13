var mongoose = require('mongoose');
var listschema= new mongoose.Schema({
    title:{
        type:String
    },
    link:{
        type:String
    },
    content:{
        type:String
    }
});
module.exports=mongoose.model('craw_vnexpress_data_B',listschema);