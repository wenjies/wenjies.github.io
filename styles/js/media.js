var list=[];
var ind=0;
var time=0;
var his=0;
var myAudio=$("#media")[0];

window.onload = function(){
	if(myAudio){
		list=$.map($("#media>source"),function(obj,i){return $(obj).attr('src');});
		myAudio.volume=0.8;
		myAudio.loop = false;
		myAudio.src = list[0];
		myAudio.addEventListener("ended", playEndedHandler);
		myAudio.addEventListener("timeupdate",timeupdateHandler);
		myAudio.pause();
		checkMusic();
	}
 }

function play(index){
	ind=index;
	time=0;
	saveTime(true);
	var $that=$('.play.glyphicon');
	$that.addClass('glyphicon-pause');
	$that.removeClass('glyphicon-play');
	myAudio.src = list[index];
	myAudio.preload="auto";
	myAudio.play();
}

$(".glyphicon").click(function(){
	var index=list.indexOf(myAudio.src);
	var len=list.length;
	var $that=$(this);
	if($that.hasClass('glyphicon-backward')){
		index=index-1;
		index=index<0?len-1:index;
		play(index);
	}else if($that.hasClass('glyphicon-forward')){
		index=index+1;
		index=index>len-1?0:index;
		play(index);
	}else if($that.hasClass('glyphicon-pause')){
		$that.addClass('glyphicon-play');
		$that.removeClass('glyphicon-pause');
		myAudio.pause();
		setTimeout(function(){saveTime(false);},500)
	}else if($that.hasClass('glyphicon-play')){
		$that.removeClass('glyphicon-play');
		$that.addClass('glyphicon-pause');
		myAudio.play();
	}
});

function playEndedHandler(){
	var index=list.indexOf(myAudio.src);
	var len=list.length;
	index=index+1;
	index=index>len-1?0:index;
	play(index);
}

function timeupdateHandler(){
	time = myAudio.currentTime;
	if(time!=his){
		his=time;
		saveTime(true);
	}
}

function  checkMusic(){
	var music = getTime();
	if(music){
		ind=music.index;
		time=music.time;
		his=time;
		myAudio.src = list[ind];
		myAudio.preload="auto";
		myAudio.currentTime = time;
		if(music.isPlay){
			var $that=$('.play.glyphicon');
			$that.addClass('glyphicon-pause');
			$that.removeClass('glyphicon-play');
			myAudio.play();
		}
	}
	
}

function saveTime(isPlay){
	if(window.localStorage){
		var music = {index:ind,isPlay:isPlay,time:time};
		var musicObj = JSON.stringify(music);
		localStorage.setItem("music", musicObj);
	}
}

function getTime(){
	if(window.localStorage){
		var music = localStorage.getItem("music");
		var musicObj = JSON.parse(music);
		return musicObj;
	}
}