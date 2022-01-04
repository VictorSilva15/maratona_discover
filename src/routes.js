//Requering Express
const express = require("express");
//Catching the properties and methods of express.Router() function to routes constant
const routes = express.Router();

//looking for views folder in src directory
const views = __dirname + "/views/";

//Creating an object with the properties of the user
const Profile = {
    data: {
        name: "Victor",
        avatar: "https://github.com/VictorSilva15.png",
        "monthly-budget": 3000,
        "days-per-week": 5,
        "hours-per-day": 7,
        "vacation-per-year": 4,
        "value-hour": 15,
    }, 

    controllers: {
        index(_, res) {
            res.render(views + "profile", { profile: Profile.data });
        },
        update(req, res) {
            //req.body to get the datas
            const data = req.body;

            //Defining how many weeks there're in a year
            const weekPerYear = Math.floor(365 / 7); // 52 weeks

            //Removing the vacation weeks from the year, to get how many weeks
            //will work in 1 month
            const weeksPerMonth = (weekPerYear - data["vacation-per-year"]) / 12 ;

            //Defining how many hours per week I'm working
            const weekTotalHours = data["hours-per-day"] * data["days-per-week"];

            //Catching the total hours worked in the month
            const monthlyTotalHours = weekTotalHours * weeksPerMonth;

            data["value-hour"] = data["monthly-budget"] / monthlyTotalHours;

            Profile.data = data;

            return res.redirect("/profile")
        }
    }, 
}

//This object will store all functionality that allow our code
//process the data in the right way!
const Job = {

    //Creating an array with ojbects items where will stored all the jobs to perform
    data: [
        {
            id:1,
            name: "Pizzaria Guloso",
            "daily-hours": 4,
            "total-hours": 166,
            created_at: Date.now(),
        },
    
        {
            id: 2,
            name: "OneTwo Project",
            "daily-hours": 3,
            "total-hours": 47,
            created_at: Date.now(),
        }
    ],

    controllers: {
        index(_, res) {
            
            //Creating a job object with updated datas
            const updatedJob = Job.data.map((job) => {
            
                const remaining = Job.services.remainingDays(job);
                const status = remaining <= 0 ? 'done' : 'progress';
                const budget = Job.services.calculateBudget(job);
                    
                return {
                    ...job,
                    remaining,
                    status,
                    budget: Job.services.calculateBudget(job, Profile.data["value-hour"])
                };
            });
            
            //Returning the index.ejs page with the job and profile objects
            return res.render(views + "index", {
            
                jobs: updatedJob, 
                profile: {
                    name: Profile.data["name"], 
                    avatar: Profile.data["avatar"]
                }
            
            });
            
        },
        create(req, res) {
            res.render(views + "job");
        },
        save(req, res) {
            const lastId = Job.data[Job.data.length - 1]?.id || 0;

            Job.data.push({
                ...req.body,
                id: lastId + 1,
                created_at: Date.now(),
            });

            res.redirect("/");
        },
        show(req, res) {
            //req.params get the parameters of the url that are separeted per slashs (/)
            const jobId = req.params.id;

            const job = Job.data.find(job => Number(job.id) === Number(jobId));
            //we can do this way:
            //const job = Job.data.filter((job) => job.id === jobId);
            if(!job) {
                res.send("Job not found")
            }

            job.budget = Job.services.calculateBudget(job, Profile.data["value-hour"]);

            return res.render(views + "job-edit", {job})
        },
        update(req, res) {
           const jobId = req.params.id;

           const job = Job.data.find(job=> Number(job.id) === Number(jobId));
        

           if(!job) {
               return res.send('job not found');
           }


           const updatedJob = {
               ...job,
               name: req.body.name === "" ? job.name : req.body.name,
               "total-hours": req.body["total-hours"] === "" ? job['total-hours'] : req.body["total-hours"],
               "daily-hours": req.body["daily-hours"] === "" ? job['daily-hours'] : req.body["daily-hours"],
           }

           Job.data = Job.data.map((job) => {
               
            if(Number(job.id) === Number(jobId)){
                job = updatedJob;
            }

            return job;

           })

           res.redirect('/job/' + jobId);
            
        },
        delete(req, res) {
            const jobId = req.params.id;

            Job.data = Job.data.filter(job=> Number(job.id) !== Number(jobId));

            return res.redirect("/")
        }
    },

    services: {
        //A function that will calculate the remainingDays
        remainingDays(job){
            
                //Calculations remaining days:
                const remainingDays = (job["total-hours"] / job["daily-hours"]).toFixed()
                
                //converting the millisecond created date to day number
                const createdDate = new Date(job.created_at);
                //calculating the due day making the sum of createdDate and remainingDays
                const dueDay = createdDate.getDate() + Number(remainingDays);
                //Settings the createdDate in milliseconds with the setDate method and dueDay
                //as argument
                const dueDateInMs = createdDate.setDate(dueDay);
                
                //Catching the remaining Days depending of the due Date and the now date
                const timeDiffInMs = dueDateInMs - Date.now();
            
                //Transform the millisecond days in days:
                const dayInMs = 1000 * 60 * 60 * 24;
                const dayDiff = Math.floor(timeDiffInMs / dayInMs);
                
                //x days left
                return dayDiff;
        },

        calculateBudget: (job, valueHour) => valueHour * job["total-hours"],

    }
}



//Creating paths to render the pages with some object datas
routes.get("/", Job.controllers.index);
routes.get("/job", Job.controllers.create)
//In order to catch the id of the jobs, we need specify the parameter of the url
//that will represent the id, and this id must contain a double points before it.
//Doing it, we're be able to get the value passed into URL, that here are referenced as
// job/:id
routes.get("/job/:id", Job.controllers.show)
routes.get("/profile", Profile.controllers.index)

//job with POST method
routes.post("/job", Job.controllers.save);
//Update profile data with POST method
routes.post("/profile", Profile.controllers.update);
//Update job data with POST method
routes.post("/job/:id", Job.controllers.update);
//Dele job data with POST method
routes.post("/job/delete/:id", Job.controllers.delete);


//response.send() returns a text that we passed as argument into send() function
//return response.send("Hello World") 
//To redirect we use response.redirect()
//To use req.body we need to habilitate the urlencoded({extended: true}) into the instance
//App of express as follows:

//App.use(express.urlencoded({extended:true})) into server.js file

//res.sendFile() is a method that allow render files, but, this way no pass through the
//engine. So it's impossible pass an object in the same time, or use relative paths to
//catch the images and styles that are allocated in other folder. Besides, this way
//will not pass through the routes created, and will be necessary specify the absolute
//file name with the extension.



//Here we're exporting our routes method to server.js using it
module.exports = routes; 