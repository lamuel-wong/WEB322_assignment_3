/********************************************************************************
 *  WEB322 – Assignment 04
 *
 *  I declare that this assignment is my own work in accordance with Seneca's
 *  Academic Integrity Policy:
 *
 *  https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
 *
 *  Name: Lamuel Tong Vargas Wong Student ID: 171959216 Date: 2024-03-29
 *
 *  Published URL: ___________________________________________________________
 *
 ********************************************************************************/

// "require" the Express and legoSets module
const express = require("express");
const legoData = require("./modules/legoSets");
const path = require("path");

// Obtain the "app" object
const app = express();

// Assign a port
const HTTP_PORT = process.env.PORT || 8080;

// Public files
app.use(express.static("public"));

// Set the view engine to EJS
app.set("view engine", "ejs");

// Set the views directory
app.set("views", path.join(__dirname, "views"));

// Ensure that the "sets" array has been successfully built within our "legoSets" module before the server starts
legoData
  .initialize()
  .then(() => {
    // Start the server on the port and output a confirmation to the console
    app.listen(HTTP_PORT, () =>
      console.log(`server listening on: http://localhost:${HTTP_PORT}`)
    );

    // Route for home page
    app.get("/", (req, res) => {
      res.render("home");
    });

    // Route for about page
    app.get("/about", (req, res) => {
      res.render("about");
    });

    // Route for getting lego sets
    app.get("/lego/sets", async (req, res) => {
      try {
        // Render sets.ejs view with the legoSets data stored in a "sets" variable
        const theme = req.query.theme;
        let sets;
        if (theme) {
          sets = await legoData.getSetsByTheme(theme);
        } else {
          sets = await legoData.getAllSets();
        }
        res.render("sets", { sets: sets });
      } catch (error) {
        res.status(404).render("404", { message: error });
      }
    });

    // Route for getting specific lego set by set number
    app.get("/lego/sets/:setNum", async (req, res) => {
      try {
        const set = await legoData.getSetByNum(req.params.setNum);
        if (set) {
          res.render("set", { set: set });
        } else {
          res.status(404).send("Set not found");
        }
      } catch (error) {
        res.status(404).render("404", { message: error });
      }
    });

    // Custom 404 error
    app.use((req, res) => {
      res.status(404).render("404", {message: "I'm sorry, we're unable to find what you're looking for..."});
    });
  })
  .catch((error) => {
    console.error(error);
  });
