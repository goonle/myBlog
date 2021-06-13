//jshint esversion:6
const express = require('express');
const {render} = require("ejs");
const mongoose = require('mongoose');
const app = express();
const _ = require('lodash');


mongoose.connect('mongodb://localhost:27017/myBlog', {useNewUrlParser: true, useUnifiedTopology: true});

const workoutSchema = {
    title:String,
    category:String,
    textContent:String,
    writedTime:String,
    writer:String,
    image:String
    };

const Workout = mongoose.model("Workout", workoutSchema);

// default items just before made DB

getDate = function() {

    const today = new Date();
  
    const options = {
      weekday: "long",
      day: "numeric",
      month: "long"
    };

    return today.toLocaleDateString("ko-KR", options);
  
  };



const workout1 = new Workout({ 
    title: "Candito linear",
    category:"Power Lifting",
    textContent:"It's for powerlifter",
    writedTime:getDate(),
    writer:"Jason",
    image: "workout3.jpg"
});
const workout2 = new Workout({ 
    title: "5x5 Madcow",
    category:"Power Lifting",
    textContent:"It's the famous powerlifter",
    writedTime:getDate(),
    writer:"Jack",
    image: "workout2.jpg"

});
const workout3 = new Workout({ 
    title: "Ashitanga Yoga",
    category:"Yoga",
    textContent:"find Ashitanga Yoga",
    writedTime:getDate(),
    writer:"Jun",
    image: "yoga.jpg"
});

const defaultWorkouts = [workout1,workout2,workout3]


app.set("view engine", "ejs");
// urlencoded 가 있으면 res.body 사용가능
app.use(express.urlencoded({extended:true}));

app.use(express.static("public"));


app.get("/",function(req,res){
    res.render("banner");
});

app.get("/compose",function(req,res){
    res.render("compose")
})
app.get("/delete",function(req,res){
    Workout.find({},function(err,results){
        res.render("delete",{workout: results})
  
    })

})
app.get("/rest",function(req,res){
    res.render("rest")
})
app.get("/diet",function(req,res){
    res.render("diet")
})


app.route("/workout")
.get(function(req,res){
    Workout.find({},function(err,results){
        if(results.length===0){
            Workout.insertMany(defaultWorkouts,function(err,results){
                if(err){
                    console.log("Error to insert items")
                }else{
                    console.log("Successfully saved default items to DB")
                    console.log(defaultWorkouts)

                }
            })
        }else{
            console.log(results)
            res.render("workout",{workout: results})
            // console.log(results)
        }
    })
})
.post(function(req,res){
    const getit = req.body;
    const selectedItem = getit.checkedItem;


    Workout.findOne({title:selectedItem},function(err,foundItem){
        res.redirect("/workout/"+selectedItem)
    })
})

app.post('/search',function(req,res){
    const searchText = req.body.search.toLowerCase()
    let searchedArray = []
    // console.log(searchText)
    Workout.find({},function(err, result){
        if(err){console.log(err)}
        else{
            result.forEach((element)=>{
                const lowerCasedTitle = element.title.toLowerCase()
                if(lowerCasedTitle.includes(searchText)){
                    // console.log(element)
                    searchedArray.push(element)
                }
            })

        }

        res.render("workout",{workout : searchedArray})

    })
    // console.log(searchedArray)


})


app.get("/workout/:selectedItem",function(req,res){
    Workout.findOne({title:req.params.selectedItem},function(err,foundItem){
        if(!err){
            // console.log(foundItem)
            res.render("workout-item",{workout:foundItem});
        }
    })

})
app.get("/signup",function(req,res){
    res.render("newsletter")
})

app.post("/compose",function(req,res){
    const getit = req.body
    const newWorkout = new Workout({
        id: getit.id,
        title: getit.title,
        category: getit.category,
        writedTime: getDate(),
        writer: "Jun",
        image:getit.image,
        textContent:getit.textContent
    })
    //  console.log(newWorkout)
    Workout.insertMany(newWorkout)
    res.redirect("/workout")
})

app.post("/delete",function(req,res){
    console.log(req.body)
    const deleteItem = req.body.checkedItem

    Workout.findByIdAndRemove(deleteItem,function(err){
        if(err){
            console.log(Item)
            }else{
            res.redirect("/")
            console.log("Successfully removed the item")
            }
    })

})

app.listen(3000, function(){
    console.log("Server started on port 3000");
});
