// add javascript here
date.textContent = time();

// global variables
let score, answer, level;
const levelArr = document.getElementsByName("level");
const scoreArr = [];

// event listeners
playBtn.addEventListener("click", play);
guessBtn.addEventListener("click", makeGuess);

function time() {
    let d = new Date();
    // concatonate date & time
    let str = d.getMonth() + 1 + "/" + d.getDate() + "/" + d.getFullYear();
    // update
    return str;
}

function play() {
    playBtn.disabled = true;
    guessBtn.disabled = false;
    guess.disabled = false;
    for(let i = 0; i < levelArr.length; i++) {
        levelArr[i].disabled = true;
        if(levelArr[i].checked) {
            level = levelArr[i].value;
        }
    }
    answer = Math.floor(Math.random()*level) + 1;
    msg.textContent = "Guess a number from 1-" + level;
    guess.placeholder = answer;
    score = 0;
}

function makeGuess() {
    let userGuess = parseInt(guess.value);
    if(isNaN(userGuess) || userGuess < 1 || userGuess > level){
        msg.textContent = "INVALID, guess a number in the range of 1-" + level + "!";
        return;
    }

    score++;

    if (userGuess > answer) {
        msg.textContent = "Too high, try again!";
    }

    else if (userGuess < answer) {
        msg.textContent = "Too low, try again!";
    }

    else {
        msg.textContent = "Correct! It took " + score + " tries.";
        reset();
        updateScore();
    }
}

function reset() {
    guessBtn.disabled = true;
    guess.value = "";
    guess.disabled = true;
    playBtn.disabled = false;
    for(let i = 0; i < levelArr.length; i++){
        levelArr[i].disabled = false;
    }
}
function updateScore() {
    scoreArr.push(score); // adds current score to arr
    wins.textContent = "Total wins: " + scoreArr.length;
    let sum = 0;
    scoreArr.sort((a, b) => a - b); //sorts ascending
    // leaderboard
    const lb = document.getElementsByName("leaderboard");
    
    for(let i = 0; i < scoreArr.length; i++){
        sum += scoreArr[i];
        if(i < lb.length){
            lb[i].textContent = scoreArr[i];
        }
    }
    let avg = sum/scoreArr.length;
    avgScore.textContent = "Average Score: " + avg.toFixed(2);

}