//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
/*const date = require(__dirname + "/date.js");*/

const app = express();

const _ = require("lodash");

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const mongoose = require("mongoose")

/** url взято з https://cloud.mongodb.com/v2/   короче реальна база, тут тільки підставляємо реальний пасворд,
 * і видаляємо все після net аж до нашої бази яку ми створюємо*/
mongoose.connect("mongodb+srv://cherenuha1:28011984@cluster0.hnhoqnb.mongodb.net/todolistDB",{
  useNewUrlParser: true,
  useUnifiedTopology: true
});



const itemSchema = new mongoose.Schema({name:{type:String}});
const ItemsModel = mongoose.model("items",itemSchema);

const titleSchema = new mongoose.Schema({name:{type:String},
item:{type:[itemSchema]}});
const TitleModel = mongoose.model("title",titleSchema);

app.get("/",(req, res)=>{
  ItemsModel.find().then((resalt)=>{

      res.render("list",{listTitle:"Home" , newListItems:resalt});

  })
});

app.post("/",(req, res)=>{
  const valueButton = req.body.list;
  const newItem = req.body.newItem;
  if (valueButton==="Home"){
    const itemsForSaving = new ItemsModel({name:newItem});
    itemsForSaving.save().then((result)=>{
      console.log(result)})
  res.redirect("/");
  }else {
    TitleModel.findOne({name:valueButton}).then((result)=>{
      if (result===null) {
        const titleSave = new TitleModel({name:valueButton,item:[{name:newItem}]});
        titleSave.save().then()
      }else {
        console.log("we have start");
        const itemsModelForTitle = new ItemsModel({name:newItem});
        TitleModel.findOneAndUpdate({name:valueButton},{$push:{item: itemsModelForTitle}}).then((result)=>{
          console.log(result)});
        console.log("we have end")
      }
    });

    res.redirect("/"+ valueButton);
  }
})

app.get("/:otherDbList", (req, res) => {
  const otherDbList = req.params.otherDbList;

  TitleModel.findOne({name: _.capitalize(otherDbList)}).then((result) => {

    if (result === null) {
      res.render("list",{listTitle:_.capitalize(otherDbList) , newListItems:[]});

    }else {
      res.render("list",{listTitle:_.capitalize(otherDbList) , newListItems:result.item});
    }
  });

});



app.post("/delete",(req, res)=>{
  const whatWeDelete = req.body.whatWeDelete;
  const che = req.body.che;

  console.log(whatWeDelete);
  console.log(che);
  if (whatWeDelete==="Home"){
    ItemsModel.findByIdAndDelete(che).then((result)=>{
      console.log(result)});
    res.redirect("/");
  }else {
    TitleModel.findOneAndUpdate({name:whatWeDelete}, {$pull: {item: {_id: che}}}).then((resul)=>{
      console.log(resul)});
    res.redirect("/"+whatWeDelete);

  }

});


let port = process.env.PORT;
console.log(port)
if (port==null||port == ""){
  port=3000;
}

app.listen(port, function() {
  console.log("Server started on port " + port);
});