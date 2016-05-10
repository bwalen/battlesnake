var app = angular.module("snake");

app.controller('snakeController', snake);

app.$inject = ['$http','$interval'];

function snake($http, $interval){
  var socket = io();
  vm=this;
  vm.nextMove = [1,0];
  vm.lastMove = [-1,-1];
  var incomingBoard;

  socket.on("board", function(msg){
    incomingBoard = msg;
  })

  socket.on("status", function(msg){
    vm.player = msg;
    vm.nextMove = [1,0];
    vm.lastMove = [-1,-1];
  })

  socket.on("win", function(msg){
    vm.win = msg;
  })

  vm.color = function(color){
    if(color ==0){
      return "black";
    }
    if(color == 1){
      return "green";
    }
    if(color == 2){
      return "brown";
    }
    if(color == 3){
      return "red";
    }
    if(color == 4){
      return "yellow";
    }
  }

  window.addEventListener("keydown", function(e){
    if(e.keyCode == 37 && vm.lastMove != "0,1"){
      vm.lastMove = [0,-1];
      socket.emit("player move", [0,-1]);
    }
    if(e.keyCode == 39 && vm.lastMove != "0,-1"){
      vm.lastMove = [0,1];
      socket.emit("player move", [0,1]);
    }
    if(e.keyCode == 38 && vm.lastMove != "1,0"){
      vm.lastMove = [-1,0];
      socket.emit("player move", [-1,0]);
    }
    if(e.keyCode == 40 && vm.lastMove != "-1,0"){
      vm.lastMove = [1,0];
      socket.emit("player move", [1,0]);
    }
  })

  vm.timer = $interval(function(){
    vm.board = incomingBoard;
  }, 250);
}
