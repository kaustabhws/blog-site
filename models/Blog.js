const mongoose = require('mongoose');
const { Schema } = mongoose;

const BlogsSchema = new Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    title:{
        type: String,
        required: true
    },
    content:{
        type: String,
        required: true, 
    },
    imgUrl:{
        type: String,
    },
    author:{
        type: mongoose.Schema.Types.String,
        ref: 'name'
    },
    tag:{
        type: String,
        default: "General"
    },
    date:{
        type: Date,
        default: Date.now
    },
  });

  module.exports = mongoose.model('blogs', BlogsSchema);