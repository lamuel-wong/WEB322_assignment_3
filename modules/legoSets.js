// Read both files and generate two arrays of objects: "setData" and "themeData"
const setData = require("../data/setData");
const themeData = require("../data/themeData");

// The completed array of Lego "set" objects
let sets = [];

// Function to fill the "sets" array, by adding copies of all the setData objects
function initialize() {
  return new Promise((resolve, reject) => {
    try {
      // Loop through each object in setData array
      setData.forEach((set) => {
        // Find matching id from themeData with matching theme_id from setData
        const theme = themeData.find(
          (theme) => theme.id.toString() === set.theme_id.toString()
        );
        if (theme) {
          // Add matched theme to 'sets' array
          sets.push({
            ...set,
            theme: theme.name,
          });
        }
      });
      resolve();
    } catch (error) {
      reject("Error with initialize()");
    }
  });
}

// Return complete "sets" array
function getAllSets() {
  return new Promise((resolve, reject) => {
    // If no sets are found
    if (sets.length > 0) {
      resolve(sets);
    } else {
      reject("Error with getAllSets()");
    }
  });
}

// Return a specific "set" object from the "sets" array, whose "set_num" value matches the value of the "setNum" parameter
function getSetByNum(setNum) {
  return new Promise((resolve, reject) => {
    const matchedSet = sets.find((set) => set.set_num === setNum);
    if (matchedSet) {
      resolve(matchedSet);
    } else {
      reject("Unable to find requested set");
    }
  });
}

// Return an array of objects from the "sets" array whose "theme" value matches the "theme" parameter
function getSetsByTheme(theme) {
  return new Promise((resolve, reject) => {
    const matchedSets = sets.filter((set) =>
      set.theme.toLowerCase().includes(theme.toLowerCase())
    );
    // If no sets are found
    if (matchedSets.length > 0) {
      resolve(matchedSets);
    } else {
      reject("Unable to find requested sets");
    }
  });
}

module.exports = { initialize, getAllSets, getSetByNum, getSetsByTheme };
