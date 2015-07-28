/**
 * snake.js
 *
 * Copyright (c) 2015 Arnis Ritins
 * Released under the MIT license
 */
(function(){

	'use strict';

	// Game variables
	var canvas;
	var ctx;
	var size = 20;
	var fps = 7;
	var state = 0;
	var score = 0;
	var record = parseInt(localStorage.getItem('snake-record')) || 0;

	// Game objects
	var field = {x: 16,	y: 14};
	var snake;
	var food;

	// Initializes game
	initialize();

	/**
	 * Snake object
	 *
	 */
	function Snake(){
		 
		/**
		 * Snake head position
		 */
		this.head = {
			x: null,
			y: null
		};

		/**
		 * Array of snake body pieces
		 */		
		this.body = [];
		
		/**
		 * Snake direction object
		 */
		this.direction = {
			current: 'R',
			next: 'R',
			inverse: {L: 'R', U: 'D', R: 'L', D: 'U'},
			queue: function(next){
				if(state == 1){
					if(next != this.inverse[this.current]){
						this.next = next;
					}
				}
			},
			update: function(){
				this.current = this.next;
			}
		};
		
		/**
		 * Moves the snake
		 */
		this.move = function(){
			this.body.shift();
			this.body.push({x: snake.head.x, y: snake.head.y});
			switch(this.direction.current){
				case 'R':
					this.head.x = (this.head.x == field.x-1) ? 0 : this.head.x+1;
				break;
				case 'L':
					this.head.x = (this.head.x == 0) ? field.x-1 : this.head.x-1;
				break;
				case 'U':
					this.head.y = (this.head.y == 0) ? field.y-1 : this.head.y-1;
				break;
				case 'D':
					this.head.y = (this.head.y == field.y-1) ? 0 : this.head.y+1;
				break;
			}
		};
		
		/**
		 * Increases snake length
		 */
		this.grow = function(){
			this.body.unshift({x: this.head.x, y: this.head.y});
		};
		
		/**
		 * Checks for snake collision
		 */
		this.collision = function(){
			for(var i = 0; i < this.body.length; i++){
				if(this.head.x == this.body[i].x && this.head.y == this.body[i].y){
					return true;
				}
			}
			return false;
		};

		/**
		 * Resets snake object
		 */
		this.reset = function(){
			this.head = {x: 5, y: 5};
			this.body = [{x: 3, y: 5}, {x: 4, y: 5}];
			this.direction.current = this.direction.next = 'R';
		};

		/**
		 * Renders snake graphics
		 */
		this.render = function(){
			for(var i = 0; i < this.body.length; i++){
				ctx.beginPath();
				ctx.rect(this.body[i].x*size+1, this.body[i].y*size+1, size-2, size-2);
				ctx.fillStyle = (i%2 != 0) ? '#A6E22E' : '#BBEF53';
				ctx.fill();
			}
			ctx.beginPath();
			ctx.rect(this.head.x*size+1, this.head.y*size+1, size-2, size-2);
			ctx.fillStyle = '#679A01';
			ctx.fill();
		};

	}

	/**
	 * Food object
	 *
	 */
	function Food(){

		/**
		 * Food position
		 */
		this.x = null;
		this.y = null;
		
		/**
		 * Food value
		 */		
		this.value = 10;

		/**
		 * Adds food on the field
		 */
		this.add = function(){
			var position = getPosition();
			this.x = position.x;
			this.y = position.y;
		};

		/**
		 * Renders food graphics
		 */
		this.render = function(){
			ctx.beginPath();
			ctx.rect(this.x*size+1, this.y*size+1, size-2, size-2);
			ctx.fillStyle = '#FF2413';
			ctx.fill();
		};

	}

	/**
	 * Initializes game
	 *
	 */
	function initialize(){
		
		// Gets canvas element
		canvas = document.getElementById('snake');

		// Sets canvas size
		canvas.width = field.x * size;
		canvas.height = field.y * size;

		// Gets canvas 2D context
		ctx = canvas.getContext('2d');

		// Creates game objects
		snake = new Snake();
		food = new Food();

		// Listens for keydown event
		window.addEventListener('keydown', function(e){
			var key = e.keyCode || e.which;
			switch(key){
				case 37: case 65: snake.direction.queue('L'); break;
				case 38: case 87: snake.direction.queue('U'); break;
				case 39: case 68: snake.direction.queue('R'); break;
				case 40: case 83: snake.direction.queue('D'); break;
				case 32: toggle(); break;
			}
		});

		// Starts game loop
		loop();

	}

	/**
	 * Game loop
	 *
	 */
	function loop(){

		setTimeout(function(){
			requestAnimationFrame(loop);
			update();
			render();
		}, 1000 / fps);

	}

	/**
	 * Resets game objects and variables
	 *
	 */
	function reset(){

		score = 0;
		snake.reset();
		food.add();

	}

	/** 
	 * Updates game objects and variables
	 *
	 */
	function update(){

		if(state != 1){
			return;
		}

		snake.direction.update();
		snake.move();

		// Checks for snake collision
		if(snake.collision()){
			state = -1;
			return;
		}

		// Checks if the food and snake head position matches
		if(snake.head.x == food.x && snake.head.y == food.y){
			snake.grow();
			score += food.value;
			// Checks if record is beaten
			if(score > record){
				localStorage.setItem('snake-record', score.toString());
				record = score;
			}
			food.add();
		}

	}

	/** 
	 * Renders game graphics
	 *
	 */
	function render(){

		// Draws background
		ctx.beginPath();
		ctx.rect(0, 0, canvas.width, canvas.height);
		ctx.fillStyle = '#222';
		ctx.fill();

		switch(state){
			// Menu
			case 0:
				ctx.fillStyle = '#fff';
				ctx.textAlign = 'center';
				ctx.textBaseline = 'top';
				ctx.font = '30px Arial';
				ctx.fillText('SNAKE GAME', canvas.width/2, 60);
				ctx.font = '16px Arial';
				ctx.fillText('Press SPACE to play', canvas.width/2, 200);
			break;
			// Play/pause
			case 1:
			case 2:
				ctx.fillStyle = '#fff';
				ctx.textAlign = 'left';
				ctx.textBaseline = 'top';
				ctx.font = '20px Arial';
				ctx.fillText(score, 20, 20);

				food.render();
				snake.render();
			break;
			// Game over
			case -1:
				ctx.fillStyle = '#fff';
				ctx.textAlign = 'center';
				ctx.textBaseline = 'top';
				ctx.font = '30px Arial';
				ctx.fillText('GAME OVER', canvas.width/2, 60);
				ctx.font = '16px Arial';
				ctx.fillText('Score: '+score, canvas.width/2, 125);
				ctx.fillText('Record: '+record, canvas.width/2, 145);
				ctx.fillText('Press SPACE to play again', canvas.width/2, 200);
			break;
		}

	}

	/**
	 * Toggles game state
	 *
	 */
	function toggle(){

		switch(state){
			case -1:
			case 0:
				state = 1;
				reset();
			break;
			case 1:
				state = 2;
			break;
			case 2:
				state = 1;
			break;
		}

	}

	/**
	 * Gets random available position on the field
	 *
	 */
	function getPosition(){

		// Generates random position
		var position = {
			x: rand(0, field.x-1),
			y: rand(0, field.y-1)
		};
		
		// Returns position or regenerates it
		return (function(){

			var unavailable = [].concat(snake.body);
			unavailable.push(
				{x: snake.head.x, y: snake.head.y},
				{x: food.x, y: food.y}
			);

			for(var i in unavailable){
				// Checks if the position is available
				if(position.x == unavailable[i].x && position.y == unavailable[i].y){
					return true;
				}
			}
			return false;

		}()) ? getPosition() : position;

	}

	/**
	 * Generates random number
	 *
	 */
	function rand(from, to){

		return Math.floor(Math.random() * (to - from + 1)) + from;

	}

}());
