const brain = require('brain.js');
const fs = require('fs');

// create a brain
const net = new brain.NeuralNetwork();
net.train([{
    input: Array(18).fill(0),
    output: [0]
}], {
    iterations: 1
});
let save = net.toJSON()

// stringify and save JSON Object
save = JSON.stringify(save);
fs.writeFile("save.json", save, 'utf8', function (err) {
    if (err) {
        console.log("An error occured while writing JSON Object to File.");
        return console.log(err);
    }
 
    console.log("JSON file has been saved.");
});