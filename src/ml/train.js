let agent = require('./agent.js');

for(let i = 0; i < 10; i++) {
    agent.train();
    console.log(i, 'maybe add compare??');
}

agent.play();
agent.save();