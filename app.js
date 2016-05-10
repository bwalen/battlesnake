var express = require("express");
var app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);
var port = process.env.PORT || 1337;

app.use(express.static("./public"));

http.listen(port, function(){
  console.log("Listening on port " + port);
});

var BOARDSIZE = 25;
var snakeA = [[1,1],[2,1]];
var snakeB = [[23,23],[22,23]];
var apple = [12,12];
var nextMoveA = [1,0];
var nextMoveB = [-1,0];
var lastMoveA = [0,1];
var lastMoveB = [0,-1];
var lost = false;
var playerQueue = [];
var board = addApple(addSnake(createBoardArray()));
var timer;

io.on("connection", function(socket){
  playerQueue.push(socket.id);
  socket.emit("board", board);
  if(playerQueue[0] && playerQueue[1]){
    socket.emit("status", "spectate");
  }
  else if(playerQueue[0]){
    socket.emit("status", "yelow");
    start();
  }
  else{
    socket.emit("status", "red");
  }
  socket.on("player move", function(msg){
    if(socket.id == playerQueue[0]){
      nextMoveA = msg;
    }
    if(socket.id == playerQueue[1]){
      nextMoveB = msg;
    }
  })
  socket.on("disconnect",function(){
    io.emit("disonnect");
    if(socket.id == playerQueue[0]){
      playerQueue.splice(1,1);
      wins(playerQueue[1]);
    }
    else if(socket.id == playerQueue[1]){
      playerQueue.splice(0,1);
      wins(playerQueue[0]);
    }
    else{
      for(var i = 0; i < playerQueue.length; i++){
        if(playerQueue[i] == socket.id){
          playerQueue.splice(i,1);
        }
      }
    }
  })
})

function start(){
  timer = setInterval(move, 1000);
}

function addSnake(boardArray){
  for (var i = 0; i < snakeA.length; i++)
  {
    var y = snakeA[i][0];
    var x = snakeA[i][1];
    boardArray[y][x] = 2;
  }
  for (var j = 0; j < snakeB.length; j++)
  {
    var a = snakeB[j][0];
    var b = snakeB[j][1];
    boardArray[a][b] = 4;
  }
  return boardArray;
}

function addApple(boardArray){
  var where;
  if(apple[0] >= 0){
    where = apple;
  }
  else{
    where = whereApple(boardArray);
    apple = [where[0],where[1]];
  }
  boardArray[where[0]][where[1]] = 3;
  return boardArray;
}

function whereApple(boardArray){
  var x = Math.floor(Math.random() * (24 - 1) + 1);
  var y = Math.floor(Math.random() * (24 - 1) + 1);
  while(boardArray[y][x] == 2 || boardArray[y][x] == 4){
    x = Math.floor(Math.random() * (24 - 1) + 1);
    y = Math.floor(Math.random() * (24 - 1) + 1);
  }
  return ([y,x]);
}

function move(){
  var currentPositionA = snakeA[snakeA.length-1];
  var currentPositionB = snakeB[snakeB.length-1];
  lastMoveA = nextMoveA;
  lastMoveB = nextMoveB;
  if(nextMoveA[0]==1){
    snakeA.push([currentPositionA[0]+1,currentPositionA[1]]);
  }
  if(nextMoveB[0]==1){
    snakeB.push([currentPositionB[0]+1,currentPositionB[1]]);
  }
  if(nextMoveA[0]==-1){
    snakeA.push([currentPositionA[0]-1,currentPositionA[1]]);
  }
  if(nextMoveB[0]==-1){
    snakeB.push([currentPositionB[0]-1,currentPositionB[1]]);
  }
  if(nextMoveA[1]==1){
    snakeA.push([currentPositionA[0], currentPositionA[1]+1]);
  }
  if(nextMoveB[1]==1){
    snakeB.push([currentPositionB[0], currentPositionB[1]+1]);
  }
  if(nextMoveA[1]==-1){
    snakeA.push([currentPositionA[0],currentPositionA[1]-1]);
  }
  if(nextMoveB[1]==-1){
    snakeB.push([currentPositionB[0],currentPositionB[1]-1]);
  }
  var newY = snakeA[snakeA.length-1][0];
  var newX = snakeA[snakeA.length-1][1];
  var newB = snakeB[snakeB.length-1][0];
  var newA = snakeB[snakeB.length-1][1];
  if(board[newY][newX] == 0 || board[newY][newX] == 2 || board[newY][newX] == 4){
    lost = true;
    console.log("Player 2 wins");
    clearInterval(timer);
  }
  else if(board[newY][newX] == 3 ){
    apple = [-1,-1];
  }
  else{
    snakeA.splice(0,1);
  }
  if(board[newB][newA] == 0 || board[newB][newA] == 2 || board[newB][newA] == 4){
    lost = true;
    console.log("Player 1 wins");
    clearInterval(timer);
  }
  else if(board[newB][newA] == 3 ){
    apple = [-1,-1];
  }
  else{
    snakeB.splice(0,1);
  }
  board=addApple(addSnake(createBoardArray()));
  io.emit("board", board);
}

function createBoardArray(){
  var boardArray = [];
  boardArray.push(createBorderRow());
  for(var i = 1; i < BOARDSIZE-1; i++){
    boardArray.push(createBoardRow());
  }
  boardArray.push(createBorderRow());
  return boardArray;
}

function createBorderRow(){
  var rowArray=[];
  for(var i = 0; i < BOARDSIZE; i++){
    rowArray.push(0);
  }
  return rowArray;
}

function createBoardRow(){
  var rowArray=[];
  rowArray.push(0);
  for(var i = 1; i < BOARDSIZE-1; i++){
    rowArray.push(1);
  }
  rowArray.push(0);
  return(rowArray);
}

function wins(){
  snakeA = [[1,1],[2,1]];
  snakeB = [[23,23],[22,23]];
  apple = [12,12];
  nextMoveA = [1,0];
  nextMoveB = [-1,0];
  lastMoveA = [0,1];
  lastMoveB = [0,-1];
  board = addApple(addSnake(createBoardArray()));
}
