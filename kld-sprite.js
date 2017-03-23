
+(function($, global){

	"use strict";

	var Sprite = function($container, options){
		var that = this;
		this.$container = $container;
		this.options = $.extend({}, Sprite.defaults, options);
		this.duration = 1;
		this.tid = [];
		this.key = this.options.startAt;

		// this.$container.css({
			// backgroundImage: "url('"+ this.options.urlSprite +"')"
		// });

		this.$container.append('<div class="sprite-inner"></div>');
		this.$inner = this.$container.find('.sprite-inner');

		this.$container.css({
			// position: 'relative'
		});

		this.$inner.css({
			position: 'relative',
			backgroundImage: "url('"+ this.options.urlSprite +"')"
		});

        $.ajax({
			url: this.options.urlJson,
			method: "POST",
			dataType: "json",
			data: {}
		})
		.done(function(data){
			that.meta = data.meta;
			that.frames = [];

			for(var i in data.frames){
				var frame = data.frames[i];
				that.frames.push(frame);
			}

			if (!that.options.autoload){
				that.displayFrame(0);
			}else{
				that.loop();
			}


		})
		.fail(function(){
			console.log('sprite fail')
		})

	};

	Sprite.prototype.displayFrame = function(_key){
		var that = this;
		var frame = that.frames[_key];

		this.$container.css({
			width: frame.sourceSize.w + 'px',
			height: frame.sourceSize.h + 'px'
		});

		this.$inner.css({
			left: frame.spriteSourceSize.x + 'px',
			top: frame.spriteSourceSize.y + 'px',
			width: frame.frame.w + 'px',
			height: frame.frame.h + 'px',
			backgroundSize: that.meta.size.w + 'px ' + that.meta.size.h + 'px',
			backgroundPosition: -frame.frame.x + 'px ' + -frame.frame.y + 'px'
		});
	}

	Sprite.prototype.loop = function(){
		var that = this;
		var duration = 1000 / this.options.fps;
		that.tid.push(setInterval(function(){

			that.displayFrame(that.key);

			that.key++;

			if (that.key == that.frames.length){
				that.key = 0;
				$(document).trigger('kld.sprite.loopCompleted');
				if (!that.options.autoloop){
					that.killLoop();
				}
			}
		}, duration));
	}

	Sprite.prototype.action = function(options){
		var that = this;
		this.options = $.extend({}, Sprite.defaults, options);

		switch (options.action){

			case 'play':
				this.killLoop();
				if (options.startAt != undefined)
					this.key = options.startAt;
				this.loop();
			break;

			case 'stop':
				this.key = 0;
				this.displayFrame(0);
				this.killLoop();
			break;

			case 'pause':
				if (options.startAt != undefined)
					this.key = options.startAt;
				this.killLoop();
			break;
		}
	}

	Sprite.prototype.killLoop = function(){
		var that = this;
		for (var key in this.tid){
			clearInterval(this.tid[key]);
		}
	}

	Sprite.prototype.jsonExtend = function(json, defaultJSON){
		var result={};
		for(var key in defaultJSON) result[key]=defaultJSON[key];
		for(var key in json) 		result[key]=json[key];
		return result;
	}

	Sprite.defaults = {
		fps: 12,
		startAt: 0,
		autoloop: true,
		autoload: true,
		urlJson: '',
		urlSprite: '',
		action: ''		// start, stop, pause
	};


	function module(selector, options) {
		$(selector).each(function () {
			var $this = $(this);
			var object = new Sprite($this, options);

			$this.data('kld.sprite', object);

			$.fn.kldSprite = function(options){
				if (options == undefined)
					return;

				var object = $(this).data('kld.sprite');
				object.action(options)
			}

			$this.kldSprite();
			global.Kld.Sprite.stack.push(object);
		});
	}

	global.Kld = global.Kld || {};

	global.Kld.Sprite = module;

	global.Kld.Sprite.stack = [];

}(jQuery, window));
