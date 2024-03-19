/********************************************************************************
 *  WEB322 – Assignment 03
 *
 *  I declare that this assignment is my own work in accordance with Seneca's
 *  Academic Integrity Policy:
 *
 *  https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
 *
 *  Name: Lamuel Tong Vargas Wong Student ID: 171959216 Date: 2024-03-18
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
      res.sendFile(path.join(__dirname, "views", "home.html"));
    });

    // Route for about page
    app.get("/about", (req, res) => {
      res.sendFile(path.join(__dirname, "views", "about.html"));
    });

    // Route for getting lego sets
    app.get("/lego/sets", async (req, res) => {
      try {
        const theme = req.query.theme;
        if (theme) {
          const themedSets = await legoData.getSetsByTheme(theme);
          res.json(themedSets);
        } else {
          const sets = await legoData.getAllSets();
          res.json(sets);
        }
      } catch (error) {
        res.status(404).send(error);
      }
    });

    // Route for getting specific lego set by set number
    app.get("/lego/sets/:setNum", async (req, res) => {
      try {
        const set = await legoData.getSetByNum(req.params.setNum);
        set ? res.json(set) : res.status(404).send("Set not found");
      } catch (error) {
        res.status(404).send(error.message);
      }
    });

    // Custom 404 error
    app.use((req, res) => {
      res.status(404).sendFile(path.join(__dirname, "views", "404.html"));
    });
  })
  .catch((error) => {
    console.error(error);
  });
