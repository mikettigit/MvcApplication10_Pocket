var sliderIntervalID = false;
// slider with pager
function pagerSlider(pSlider,pSliderItem){
	existSlide=false;
	$(pSlider).each(function(pSi, pSliderItems){
		nsli=$(pSliderItems).find(pSliderItem).size();
		if(nsli>1){
			existSlide=true;
			navi='';
			for(i=0;i<nsli;i++){
				navi+='<a href="javascript:void(0);"'+(i==0?'class="active"':'')+' num="'+i+'" onClick="changePSlide(jQuery(this), \''+pSlider+'\',\''+pSliderItem+'\')"/>';
			}
			$(pSliderItems).append('<div class="slider-pager">'+navi+'<div>');
			delete navi;
		}
	});
	
	if(existSlide){
		hoverState(pSlider);
		sliderIntervalID = setInterval(function(){
			$(pSlider+':not(.over)').each(function(index, pSliderEl) {
				$(pSliderEl).find('.slider-pager a.active').next('a').size() ? $(pSliderEl).find('.slider-pager a.active').next('a').click() : $(pSliderEl).find('.slider-pager a').eq(0).click();
			});
		},	5000);
	}
}

function changePSlide(obj,pSlider,pSliderItem){
	if(!(obj.hasClass('active'))){
		li_Slide=obj.parents(pSlider).find(pSliderItem);
		li_Slide.eq(obj.parent().find('a.active').removeClass('active').attr('num')).fadeOut();
		li_Slide.eq(obj.addClass('active').attr('num')).fadeIn();
	}
}

function nextPSlide(){
	console.log('nextPSlide');
	sliderIntervalID && clearInterval(sliderIntervalID);
	var num=0;
	jQuery(".slider-pager a").each(function(){if($(this).hasClass('active')){num=(jQuery(this).index()+1)}});
	if(num==jQuery(".slider-pager a").length) num=0;
	changePSlide((jQuery(".slider-pager a").eq(num)), '.slider-with-rounds','.slider-item');
}

function prevPSlide(){
	console.log('prevPSlide');
	sliderIntervalID && clearInterval(sliderIntervalID);
	$(this).attr('rel','durty');
	var num=0;
	jQuery(".slider-pager a").each(function(){if($(this).hasClass('active')){num=(jQuery(this).index()-1)}});
	if(num==-1) num=(jQuery(".slider-pager a").length)-1;
	changePSlide((jQuery(".slider-pager a").eq(num)), '.slider-with-rounds','.slider-item');
}

// horizontal slider 
function horSlider(slider,li_item){
	$(slider).each(function(iSlide,block) {
		if($(block).find(li_item).size()>3){
			$(block).find(li_item).appendTo($(block).find(li_item).eq(0).parent());
			$(block).after('<a href="#prevItem" class="slider-prev" onclick="changeSlide(this,\''+slider+'\',\''+li_item+'\'); return false;"/><a href="#nextItem" class="slider-next" onclick="changeSlide(this,\''+slider+'\',\''+li_item+'\'); return false;"/>');
		}
	});
}


// horizontal slider otdelka balkona
function horSlider_otdelka(slider,li_item){
	$(slider).each(function(iSlide,block) {
		if($(block).find(li_item).size()>3){
			$(block).find(li_item).appendTo($(block).find(li_item).eq(0).parent());
			$(block).after('<a href="#prevItem" class="slider-prev" onclick="changeSlide(this,\''+slider+'\',\''+li_item+'\'); return false;"/><a href="#nextItem" class="slider-next" onclick="changeSlide(this,\''+slider+'\',\''+li_item+'\'); return false;"/>');
		}
	});
}





function changeSlide(obj,block,li){
	$(obj).parent().find(block+' '+li).stop(true,true);
	
	if($(obj).hasClass('slider-prev')){
		liLast=$(obj).parent().find(block+' '+li+':last');
		liLast.prependTo(liLast.parent()).css('margin-left','-'+liLast.width()+'px').animate({marginLeft:0});
	}
	else{
		liFirst=$(obj).parent().find(block+' '+li+':eq(0)');
		liFirst.animate({marginLeft:0-liFirst.width()},function(){
			liFirst.css('margin-left',0).appendTo(liFirst.parent());
		});
	}
}

// main slider [home]
function homeSlider(){
	hoverState('.home-slider');
	$('.home-slider .slider-item.active').removeClass('active').addClass('current').find('.slide-content').show();
	$('.home-slider .slide-navi a').click(function(e) {
		slide =	$(this).parents('.slider-item');
		if(!slide.hasClass('current')){
			current=$('.home-slider .slider-item.current');
			current.removeClass('current').find('.slide-center img').stop(true,true).animate({marginLeft:2500},500).parents('.slide-content').stop(true,true).fadeOut(300);
			current.removeClass('current').find('.slide-right').stop(true,true).animate({marginLeft:2500},500);
			slide.addClass('current').find('.slide-center img, .slide-right').stop(true,true).css('margin-left',-2500).parent('.slide-content').stop(true,true).fadeIn(300).find('.slide-center img, .slide-right').animate({marginLeft:0},500);
		}
		return false;
	});
	
	setInterval(function(){
		if(!$('.home-slider').hasClass('over')){
			$('.home-slider .slider-item.current').next().size() ?
				$('.home-slider .slider-item.current').next().find('.slide-navi a').click() :
				$('.home-slider .slider-item:first .slide-navi a').click();
		}
	},5000);
}

function hoverState(obj){
	$(obj).mouseover(function(){$(this).addClass('over');}).mouseleave(function(){$(this).removeClass('over');});
}

function showAJAXloader() {
	$('body').css('overflow-y', 'none');
	$.fancybox.showLoading();
}

function hideAJAXloader() {
	$('body').css('overflow-y', 'auto');
	$.fancybox.hideLoading();
}