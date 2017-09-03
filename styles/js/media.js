
window.onload = function(){
	var myAudio=document.getElementById("media");
	var list=null;
	if(myAudio){
		list=$.map($("#media>source"),function(obj,i){return $(obj).attr('src');});
		myAudio.volume=0.4;
		myAudio.loop = false;
		myAudio.src = list[0];
		myAudio.addEventListener("ended", playEndedHandler);
		myAudio.pause();
		
		function playEndedHandler(){
			var index=list.indexOf(myAudio.src);
			var len=list.length;
			index=index+1;
			index=index>len-1?0:index;
			play(index);
		}
		
		function play(index){
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
			}else if($that.hasClass('glyphicon-play')){
				$that.removeClass('glyphicon-play');
				$that.addClass('glyphicon-pause');
				myAudio.play();
			}
			
			
			
		});
	}else{
	}
 }