// Read both files and generate two arrays of objects: "setData" and "themeData"
const setData = require("../data/setData");
const themeData = require("../data/themeData");

// Allow access to postgres database
require("dotenv").config();
const Sequelize = require("sequelize");

// set up sequelize to point to our postgres database
const sequelize = new Sequelize(
  process.env.DB_DATABASE,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "postgres",
    port: 5432,
    dialectOptions: {
      ssl: { rejectUnauthorized: false },
    },
  }
);

sequelize
  .authenticate()
  .then(() => {
    console.log("Connection has been established successfully.");
  })
  .catch((err) => {
    console.log("Unable to connect to the database:", err);
  });

// Define models
const Theme = sequelize.define(
  "Theme",
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: Sequelize.STRING,
  },
  {
    createdAt: false, // disable createdAt
    updatedAt: false, // disable updatedAt
  }
);

const Set = sequelize.define(
  "Set",
  {
    set_num: {
      type: Sequelize.STRING,
      primaryKey: true,
    },
    name: Sequelize.STRING,
    year: Sequelize.INTEGER,
    num_parts: Sequelize.INTEGER,
    theme_id: Sequelize.INTEGER,
    img_url: Sequelize.STRING,
  },
  {
    createdAt: false, // disable createdAt
    updatedAt: false, // disable updatedAt
  }
);

Set.belongsTo(Theme, { foreignKey: "theme_id" });

function initialize() {
  return new Promise(async (resolve, reject) => {
    try {
      await sequelize.sync();
      // Ensure that existing data is inserted into "Themes" and "Sets" tables
      // Check for default themes in the DB
      const themeCount = await Theme.count();
      if (themeCount === 0) {
        await Theme.bulkCreate(themeData);
        console.log("Default themes added to the database.");
      }

      // Check for default sets in the DB
      const setCount = await Set.count();
      if (setCount === 0) {
        await Set.bulkCreate(setData);
        console.log("Default sets added to the database.");
      }

      resolve();
    } catch (err) {
      reject(err.message);
    }
  });
}

// Return complete "sets" array
function getAllSets() {
  return Set.findAll({ include: [Theme] });
}

// Return a specific "set" object from the "sets" array, whose "set_num" value matches the value of the "setNum" parameter
function getSetByNum(setNum) {
  return new Promise((resolve, reject) => {
    Set.findOne({
      // Using findOne instead of findAll to more efficiently return a single object directly
      where: { set_num: setNum },
      include: [Theme],
    })
      .then((set) => {
        if (set) {
          resolve(set);
        } else {
          reject("Unable to find requested set");
        }
      })
      .catch((err) => {
        reject(err.message);
      });
  });
}

// Return an array of objects from the "sets" array whose "theme" value matches the "theme" parameter
function getSetsByTheme(theme) {
  return new Promise((resolve, reject) => {
    Set.findAll({
      include: [Theme],
      where: {
        "$Theme.name$": {
          [Sequelize.Op.iLike]: `%${theme}%`,
        },
      },
    })
      .then((sets) => {
        if (sets.length > 0) {
          resolve(sets);
        } else {
          reject("Unable to find requested sets");
        }
      })
      .catch((err) => {
        reject(err.message);
      });
  });
}

// Return a Promise that resolves once a set has been created
function addSet(setData) {
  return new Promise((resolve, reject) => {
    Set.create(setData)
      .then(() => resolve())
      .catch((err) => {
        if (err && err.errors) {
          reject(err.errors[0].message);
        } else {
          reject("An unexpected error occurred");
        }
      });
  });
}

// Return a Promise that resolves with all the themes in the database
function getAllThemes() {
  return new Promise((resolve, reject) => {
    Theme.findAll()
      .then((themes) => resolve(themes))
      .catch((err) => reject(err.message));
  });
}

// Return a Promise that resolves once a set has been updated
function editSet(set_num, setData) {
  return new Promise((resolve, reject) => {
    Set.update(setData, {
      where: { set_num: set_num }
    })
    .then(result => {
      if (result[0] > 0) {  
        resolve();
      } else {
        reject("No set found with the specified number.");
      }
    })
    .catch(err => {
      reject(err.errors[0].message); 
    });
  });
}

// Return a Promise that resolves once a set has been deleted
function deleteSet(set_num) {
  return new Promise((resolve, reject) => {
      Set.destroy({
          where: { set_num: set_num }
      })
      .then(result => {
          if (result > 0) {
              resolve(); 
          } else {
              reject("No set found with that set number."); 
          }
      })
      .catch(err => {
          reject(err.message); 
      });
  });
}

module.exports = {
  initialize,
  getAllSets,
  getSetByNum,
  getSetsByTheme,
  addSet,
  getAllThemes,
  editSet,
  deleteSet
};
