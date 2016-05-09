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
var apple = [11,12];
var nextMoveA = [1,0];
var nextMoveB = [-1,0];
var lastMoveA = [0,1];
var lastMoveB = [0,1];
var lost = false;
var playerAId;
var playerBId;
var board = addApple(addSnake(createBoardArray()));
var timer;

io.on("connection", function(socket){
  io.emit("board", board);
  if(playerAId){
    playerBId = socket.id;
    start();
  }
  else{
    playerAId = socket.id;
  }
  socket.on("player move", function(msg){
    if(socket.id == playerAId){
      nextMoveA = msg;
    }
    if(socket.id == playerBId){
      nextMoveB = msg;
    }
  })
  console.log("user " + socket.id + " connected");
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
  if(board[newY][newX] == 0 || board[newY][newX] == 2 || board[newY][newX] == 4){
    lost = true;
    clearInterval(timer);
  }
  else if(board[newY][newX] == 3 ){
    apple = [-1,-1];
    board=addApple(addSnake(createBoardArray()));
  }
  else{
    snakeA.splice(0,1);
    board=addApple(addSnake(createBoardArray()));
  }
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
