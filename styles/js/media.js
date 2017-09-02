
 window.onload = function(){
	var play="/styles/images/voice_play.png";
	var stop="/styles/images/voice_stop.png";
	var myAudio=document.getElementById("media");
	if(myAudio){
		var list=$.map($("#media>source"),function(obj,i){return $(obj).attr('src');});
		myAudio.volume=0.4;
		myAudio.loop = false;
		myAudio.preload="auto";
		myAudio.src = list.shift();
		myAudio.addEventListener("ended", playEndedHandler);
		myAudio.pause();
		function playEndedHandler(){
			if(list.length==0){
				list=$.map($("#media>source"),function(obj,i){return $(obj).attr('src');});
				myAudio.pause();
			}
			myAudio.src = list.shift();
			myAudio.preload="auto";
			myAudio.play();
		}
		
		$("#music").click(function(){
			var img=$("#music>img");
			if(myAudio.paused){
				myAudio.play();
				img.attr('src',play);
			}else{
				myAudio.pause();
				img.attr('src',stop);
			}
		});
	}else{
		$("#music>img").attr('src',stop);
	}
 }