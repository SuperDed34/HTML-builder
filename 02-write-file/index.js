const path = require('path');
const fs = require('fs');
const filePath = path.join(__dirname, 'createdFile.txt');
const readLine = require('readline');
const file = fs.createWriteStream(filePath, 'utf-8');

let rl = readLine.createInterface(process.stdin, process.stdout);
rl.setPrompt(
  'Hello mate, how are you today? Hope you are great! \nPlease, input text what do you want to write in the file\nAfter you end - enter "exit" or press Ctrl(Cmd)+C:\n',
);
rl.prompt();
rl.on('SIGINT', handleExit);
rl.on('line', (input) => {
  if (input === 'exit') {
    handleExit('exit');
  } else {
    file.write(input + '\n');
  }
});

function handleExit(sign) {
  console.log(
    `You give me ${
      sign != undefined ? sign : 'CTRL+C'
    }, it's mean you must go - good bye and good luck!`,
  );
  rl.close();
}
