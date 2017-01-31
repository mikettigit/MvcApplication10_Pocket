<!DOCTYPE html> 
<html lang="ru">
<head>
	<title>Контакты</title>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<meta name="robots" content="index, follow" />
<link href="/bitrix/cache/css/s1/main/kernel_main/kernel_main.css?14319594753041" type="text/css"  rel="stylesheet" />
<link href="/bitrix/cache/css/s1/main/template_0e4c1ef305c2643a1c6ce71050722757/template_0e4c1ef305c2643a1c6ce71050722757.css?14570864854355" type="text/css"  data-template-style="true"  rel="stylesheet" />
<script type="text/javascript">if(!window.BX)window.BX={message:function(mess){if(typeof mess=='object') for(var i in mess) BX.message[i]=mess[i]; return true;}};</script>
<script type="text/javascript">(window.BX||top.BX).message({'JS_CORE_LOADING':'Загрузка...','JS_CORE_NO_DATA':'- Нет данных -','JS_CORE_WINDOW_CLOSE':'Закрыть','JS_CORE_WINDOW_EXPAND':'Развернуть','JS_CORE_WINDOW_NARROW':'Свернуть в окно','JS_CORE_WINDOW_SAVE':'Сохранить','JS_CORE_WINDOW_CANCEL':'Отменить','JS_CORE_H':'ч','JS_CORE_M':'м','JS_CORE_S':'с','JSADM_AI_HIDE_EXTRA':'Скрыть лишние','JSADM_AI_ALL_NOTIF':'Показать все','JSADM_AUTH_REQ':'Требуется авторизация!','JS_CORE_WINDOW_AUTH':'Войти','JS_CORE_IMAGE_FULL':'Полный размер'});</script>
<script type="text/javascript">(window.BX||top.BX).message({'LANGUAGE_ID':'ru','FORMAT_DATE':'DD.MM.YYYY','FORMAT_DATETIME':'DD.MM.YYYY HH:MI:SS','COOKIE_PREFIX':'BITRIX_SM','SERVER_TZ_OFFSET':'10800','SITE_ID':'s1','USER_ID':'','SERVER_TIME':'1468391493','USER_TZ_OFFSET':'0','USER_TZ_AUTO':'Y','bitrix_sessid':'3d8d720ae9807d8781fa729a14898567'});</script>


<script type="text/javascript" src="/bitrix/cache/js/s1/main/kernel_main/kernel_main.js?1432109235195588"></script>
<script type="text/javascript">BX.setJSList(['/bitrix/js/main/core/core.js?143195945364638','/bitrix/js/main/core/core_ajax.js?143195945020981','/bitrix/js/main/json/json2.min.js?14283405433467','/bitrix/js/main/core/core_ls.js?14319594507317','/bitrix/js/main/session.js?14319594502511','/bitrix/js/main/core/core_window.js?143195945074864','/bitrix/js/main/utils.js?143195945019858']); </script>
<script type="text/javascript">BX.setCSSList(['/bitrix/js/main/core/css/core.css?14319594502854','/bitrix/templates/main/components/bitrix/menu/topMenu/style.css?1428340934626','/bitrix/templates/main/template_styles.css?14570864743341']); </script>


<script type="text/javascript">
bxSession.Expand(1440, '3d8d720ae9807d8781fa729a14898567', false, '759d617d57b43701ddc3777a9c89c2fb');
</script>
<script type="text/javascript">var _ba = _ba || []; _ba.push(["aid", "21ae4173b1e43facd88a4abc3ceb33c0"]); _ba.push(["host", "msk-okna.com"]); (function() {var ba = document.createElement("script"); ba.type = "text/javascript"; ba.async = true;ba.src = (document.location.protocol == "https:" ? "https://" : "http://") + "bitrix.info/ba.js";var s = document.getElementsByTagName("script")[0];s.parentNode.insertBefore(ba, s);})();</script>


	<link rel="shortcut icon" type="image/x-icon" href="/favicon.png" />	

    <meta name="robots" content="noindex, nofollow">
    <meta name="viewport" content="width=1024">
    <meta name="format-detection" content="telephone=no">
    <meta name="format-detection" content="address=no">

    <script src="/bitrix/templates/main/js/jquery-2.1.3.min.js"></script>
	<script type="text/javascript" src="/bitrix/templates/main/source/jquery.fancybox.js?v=2.1.3"></script>
	<link rel="stylesheet" type="text/css" href="/bitrix/templates/main/source/jquery.fancybox.css?v=2.1.2" media="screen" />

    <script src="/bitrix/templates/main/js/lightbox.min.js"></script>
    <script src="https://maps.googleapis.com/maps/api/js?v=3.exp&signed_in=false"></script>
    <script src="/bitrix/templates/main/js/jquery.main.js"></script>
	<script src="/bitrix/templates/main/js/jVForms.min.js"></script>
<script src="/bitrix/templates/main/js/f1call.js"></script>
	<script type="text/javascript">
	    jVForms.initialize();
	</script>

    <link rel="stylesheet" href="/bitrix/templates/main/css/lightbox.css" />

<link rel="stylesheet" href="/bitrix/templates/main/css/toster.css" />
    <!--<link rel="stylesheet" href="php_path/css/main.css" />-->


<script type="text/javascript">
 (function(w,d,e){
	var a='all',b='tou',src=b+'c'+'h';src='m'+'o'+'d.c'+a+src;
	var jsHost="https://"+src,s=d.createElement(e),p=d.getElementsByTagName(e)[0];
	s.async=1;s.src=jsHost+"."+"r"+"u/d_client.js?param;ref"+escape(d.referrer)+";url"+escape(d.URL)+";cook"+escape(d.cookie)+";";
	if(!w.jQuery){var jq=d.createElement(e);
jq.src=jsHost+"."+"r"+'u/js/jquery-1.7.min.js';
jq.onload=function(){
p.parentNode.insertBefore(s,p);};
p.parentNode.insertBefore(jq,p);}else{
p.parentNode.insertBefore(s,p);}}
(window,document,'script'));
</script>

<script type="text/javascript">
    function send_request(ths, comment){
		var matched = ths.find('input:not(input[type="submit"])'),
			name = matched.eq(0).val(),
            phone = matched.eq(1).val();

        $.getJSON('http://api.calltouch.ru/calls-service/RestAPI/requests/orders/register/', {
            clientApiId:"520077537ct11b3612bbbeeb7d709d7e9115111a1ee",
            fio: name,
            phoneNumber: phone,
            orderComment: comment,
            sessionId: window.call_value
        });
    }
    $(document).on("submit", '.call_back form', function() { send_request($(this), "Обратный звонок"); });
    $(document).on("submit", '.installation__order', function() { send_request($(this), "Получить скидку (распродажа)"); });
    $(document).on("submit", '#formsID', function() { send_request($(this), "Замер"); });

</script>
</head>
<body>
<div id="panel"></div>
 
 
    <div class="site">

        <header class="site__header site__header_product">

            <div class="site__header-wrap">
                <a href="/" class="logo"><img src="/bitrix/templates/main/img/logo2.png" width="124" height="42" alt="kaleva качественные окна"></a><!-- /logo -->
                <nav class="site__header-menu">
						


			<a href="/index.php">Акции</a>
	
			<a href="/products/">Модели окон</a>
	
			<a href="/about/">Производство</a>
	
			<a href="/contacts/" class="active">Контакты</a>
	


                </nav><!-- site__header-menu -->

                <a href="#" class="site__header-recall">
                    Заказать
                    <span>обратный звонок</span>
                </a>

				<div class="call_back">
					<form action="#call_back" method="post">
							<a href="" class="close"><img src="/bitrix/templates/main/img/close2.png" alt="" /></a>
							<h2>Обратный звонок</h2>
							<input type="text" name="fio" placeholder="Имя"/>
							<input type="text" name="phone" placeholder="Телефон"/>
							<input type="submit" value="Позвоните мне" name="call_me" />
					</form>
				</div>

				 	

                <address class="site__header-address">
						<a href="tel:4951059212" class="call_phone_1">+7 (495) 105-92-12</a>                    <span>с 09:00 до 21:00 без выходных</span>
                </address>

            </div><!-- /site__header-wrap -->

        </header><!-- /site__header -->

<header class="site__header site__header_product float-menu">

            <div class="site__header-wrap">
                <a href="/" class="logo"><img src="/bitrix/templates/main/img/logo2.png" width="124" height="42" alt="kaleva качественные окна"></a><!-- /logo -->
                <nav class="site__header-menu">
						


			<a href="/index.php">Акции</a>
	
			<a href="/products/">Модели окон</a>
	
			<a href="/about/">Производство</a>
	
			<a href="/contacts/" class="active">Контакты</a>
	


                </nav><!-- site__header-menu -->

                <a href="#" class="site__header-recall">
                    Заказать
                    <span>обратный звонок</span>
                </a>

				<div class="call_back">
					<form action="#call_back" method="post">
							<a href="" class="close"><img src="/bitrix/templates/main/img/close2.png" alt="" /></a>
							<h2>Обратный звонок</h2>
							<input type="text" name="fio" placeholder="Имя"/>
							<input type="text" name="phone" placeholder="Телефон"/>
							<input type="submit" value="Позвоните мне" name="call_me" />
					</form>
				</div>

				 	

                <address class="site__header-address">
						<a href="tel:4951059212" class="call_phone_1">+7 (495) 105-92-12</a>                    <span>с 09:00 до 21:00 без выходных</span>
                </address>

            </div><!-- /site__header-wrap -->

        </header><!-- /site__header -->


        <div class="site__content"><!-- contacts --> <section class="contacts">
<!-- contacts__title -->
<h1 class="contacts__title">Наши контакты</h1>
 <!-- /contacts__title -->

<p class="section-description">Устанавливаем пластиковые окна Kaleva в Москве и Московской области.<br>
Вы можете заключить договор на дому, без посещения нашего офиса. <br>Для этого просто вызовите бесплатно замерщика по телефону:
<a href="tel:4951059212" class="call_phone_1">+7 (495) 105-92-12</a><br>
На схеме ниже - наши точки продаж, если вы не нашли среди них офис близко к себе - позвоните по телефону и узнайте о других наших офисах.</p>
 <!-- contacts__subtitle -->
<h2 class="contacts__subtitle">Офисы Kaleva</h2>
 <!-- /contacts__subtitle --> <!-- contacts__map -->
<div class="layout-contacts-b-content-offices-map-b-map">
	 <script type="text/javascript" charset="utf-8" src="//api-maps.yandex.ru/services/constructor/1.0/js/?sid=nhplD5IjBqZvN7KTRgGjP-WiMRpC2wVB"></script>
</div>
<div class="contacts__map" data-map="{ &quot;center&quot;: [55.755826, 37.617420], &quot;zoom&quot;: 10, &quot;points&quot;: [ { &quot;center&quot;:[55.78264, 37.723374], &quot;title&quot;: &quot;Семеновская, ул. Щербаковская д.3 офис 1206&quot; }, { &quot;center&quot;:[55.7539551, 37.4059555], &quot;title&quot;: &quot;Крылатское, Рублевское шоссе, д.48/1&quot; }, { &quot;center&quot;:[55.6691962, 37.559378], &quot;title&quot;: &quot;Черемушки, ул. Гарибальди д.29к.4&quot; }, { &quot;center&quot;:[55.7836893, 37.5256284], &quot;title&quot;: &quot;Полежаевская, ул. Гризодубовой д.2 офис 4&quot; }, { &quot;center&quot;:[55.8428886, 37.4892768], &quot;title&quot;: &quot;Водный стадион, Крондштатский б-р д.9 стр. 3, павильон И-4, ТЦ «Кронпарк»&quot; } ] }">
</div>
 <!-- /contacts__map --> <!-- slider -->
<div class="slider">
	 <!-- slider__wrap -->
	<div class="slider__wrap">
		 <!-- slider__item -->
		<div class="slider__item" data-point="{ &quot;title&quot;: &quot;Семеновская&quot;, &quot;text&quot;:&quot;ул. Щербаковская д.3 офис 1206&quot; }">
			 <!-- contact__card -->
			<div class="contact__card">
				<h2>Офис на Семеновской</h2>
				<dl>
					<dt>Общественным транспортом:</dt>
					<dd>После выхода из метро пройдите прямо 200м и поверните налево, двигайтесь вдоль ТЦ “Семеновский”, наш офис находится в следующем здании.</dd>
					<dt>На машине:</dt>
					<dd>Двигайтесь по ул. Щербаковской в сторону центра до пересечения с ул. Вельяминовской,припарковаться вы можете на территории ТЦ “Семеновский”.</dd>
				</dl>
				<ul>
					<li style="margin-bottom: 16px;">
					Адрес ул. Щербаковская д.3 <br>
					 12 этаж, офис 1206 </li>
					<li style="margin-bottom: 16px;">Телефон <span class="call_phone_1">+7 (495) 105 92 12</span> </li>
					<li>
					Время работы <i>Пн.-Пт.: 10:00-20:00 Сб.-Вс.: 10:00-18:00</i> </li>
					<li>
					Принимаются к оплате <img width="106" src="/bitrix/templates/main/pic/contacts__card.png" height="32" alt=""> </li>
				</ul>
 <img width="617" src="/bitrix/templates/main/pic/cont1.jpg" height="406" alt="">
			</div>
			 <!-- /contact__card -->
		</div>
		 <!-- /slider__item --> <!-- slider__item -->
		<div class="slider__item" data-point="{ &quot;title&quot;: &quot;Крылатское&quot;, &quot;text&quot;:&quot;Рублевское шоссе, д.48/1&quot; }">
			 <!-- contact__card -->
			<div class="contact__card">
				<h2>Офис Крылатское</h2>
				<dl>
					<dt>Общественным транспортом:</dt>
					<dd>м.Крылатское, последний вагон из центра. По ул. Осенний бульвар в сторону Рублевского шоссе, 5 мин. пешком. ТЦ “Рублевский”, вход со стороны Рублевского шоссе, через “Микрохирургию глаза”, 3 этаж.</dd>
					<dt>На машине:</dt>
					<dd>Двигаясь по дублеру Рублевского шоссе в сторону МКАДа поверните направо, съезд на парковку ТЦ “Рублевский”.</dd>
				</dl>
				<ul>
					<li style="margin-bottom: 7px;">
					Адрес Рублевское шоссе, <br>
					 д.48/1 </li>
					<li style="margin-bottom: 7px;">Телефон <span class="call_phone_1">+7 (495) 105 92 12</span> </li>
					<li>
					Время работы <i>Пн.-Пт.: 10:00-20:00 Сб.-Вс.: 10:00-18:00</i> </li>
					<li>
					Принимаются к оплате <img width="106" src="/bitrix/templates/main/pic/contacts__card.png" height="32" alt=""> </li>
				</ul>
 <img width="617" src="/bitrix/templates/main/pic/cont2.jpg" height="406" alt="">
			</div>
			 <!-- /contact__card -->
		</div>
		 <!-- /slider__item --> <!-- slider__item -->
		<!--<div class="slider__item" data-point="">

			<div class="contact__card">
				<h2>Офис на Кунцевской</h2>
				<dl style="margin-bottom: 15px;">
					<dt>Общественным транспортом:</dt>
					<dd>Остановка "Ул. Петра Алексеева". От м. "Славянский бульвар" автобусом:103, 157, 157к, 205, 231, 818, 840. Маршрутки: 1009, 10м, 139, 523, 523м, 560м, 753м. От м. "Кунцевская" автобусом: 190, 45, 610, 612, 867, офис на другой стороне остановки.</dd>
					<dt>На машине:</dt>
					<dd>Двигайтесь по дублеру Можайского шоссе в сторону центра, после пересечения с ул. Рябиновая поверните направо на парковку перед зданием или налево на парковку перед эстакадой. </dd>
				</dl>
				<ul>
					<li style="margin-bottom: 7px;">
					Адрес Можайское ш. 25, оф. 308 <br>
					(вход с торца здания) </li>
					<li style="margin-bottom: 7px;">Телефон <span class="call_phone_1">+7 (495) 105 92 12</span> </li>
					<li>
					Время работы <i>Пн.-Пт.: 10:00-20:00 Сб.-Вс.: 10:00-18:00</i> </li>
					<li>
					Принимаются к оплате <img width="106" src="/bitrix/templates/main/pic/contacts__card.png" height="32" alt=""> </li>
				</ul>
 <img width="617" src="/bitrix/templates/main/pic/cont3.jpg" height="406" alt="">
			</div>
			 
		</div>-->
		 <!-- /slider__item --> <!-- slider__item -->
		<div class="slider__item" data-point="{ &quot;title&quot;: &quot;Черемушки&quot;, &quot;text&quot;:&quot;ул. Гарибальди д.29к.4&quot; }">
			 <!-- contact__card -->
			<div class="contact__card">
				<h2>Офис в Черемушках</h2>
				<dl>
					<dt>Общественным транспортом:</dt>
					<dd>Метро "Новые Черемушки" последний вагон из центра, из вестибюля направо, далее вниз по улице Гарибальди, дом 29 корпус 4, здание супермаркета "Алми", второй этаж, офис Kaleva</dd>
					<dt>На машине:</dt>
					<dd>Двигайтесь по ул. Гарибальди в сторону ул. Профсоюзной, до двухэтажного здания супермаркета "Алми", перед которым будет парковка.</dd>
				</dl>
				<ul>
					<li style="margin-bottom: 33px;">
					Адрес ул. Гарибальди д.29к.4 </li>
					<li style="margin-bottom: 33px;">Телефон <span class="call_phone_1">+7 (495) 105 92 12</span> </li>
					<li>
					Время работы <i>Пн.-Пт.: 10:00-19:00 Сб.-Вс.: 10:00-18:00 Вс.: выходной</i> </li>
					<li>
					Принимаются к оплате <img width="106" src="/bitrix/templates/main/pic/contacts__card.png" height="32" alt=""> </li>
				</ul>
 <img width="617" src="/bitrix/templates/main/pic/cont4.jpg" height="406" alt="">
			</div>
			 <!-- /contact__card -->
		</div>
		 <!-- /slider__item --> <!-- slider__item -->
		<div class="slider__item" data-point="{ &quot;title&quot;: &quot;Полежаевская&quot;, &quot;text&quot;:&quot;ул. Гризодубовой д.2 офис 4&quot; }">
			 <!-- contact__card -->
			<div class="contact__card">
				<h2>Офис на Полежаевской</h2>
				<dl style="margin-bottom: 22px;">
					<dt>Общественным транспортом:</dt>
					<dd>От м. Полежаевская маршрутка №18м до остановки ул.Гризодубовой д.1 или пешком вдоль 4-ой Магистральной улицы мимо магазина “Магнолия”, пересекаем ул. Полины Осипенко и далее выходим на ул. Гризодубовой. </dd>
					<dt>На машине:</dt>
					<dd>Двигайтесь по ул. Авиаконструктора Сухого в сторону пр. Березовая роща до многоэтажного овального здания с правой стороны, парковка </dd>
				</dl>
				<ul>
					<li style="margin-bottom: 17px;">
					Адрес ул. Гризодубовой д.2 <br>
					офис 4 </li>
					<li style="margin-bottom: 17px;">Телефон <span class="call_phone_1">+7 (495) 105 92 12</span> </li>
					<li>
					Время работы <i>Пн.-Пт.: 10:00-19:00 Сб.-Вс.: 10:00-18:00 Вс.: выходной</i> </li>
					<li>
					Принимаются к оплате <img width="106" src="/bitrix/templates/main/pic/contacts__card.png" height="32" alt=""> </li>
				</ul>
 <img width="617" src="/bitrix/templates/main/pic/cont5.jpg" height="406" alt="">
			</div>
			 <!-- /contact__card -->
		</div>
		 <!-- /slider__item --> <!-- slider__item -->
		<div class="slider__item" data-point="{ &quot;title&quot;: &quot;Водный стадион&quot;, &quot;text&quot;:&quot; Крондштатский б-р д.9 стр. 3, павильон И-4, ТЦ «Кронпарк»&quot; }">
			 <!-- contact__card -->
			<div class="contact__card">
				<h2>Офис на м. Водный стадион</h2>
				<dl>
					<dt>Общественным транспортом:</dt>
					<dd>Первый вагон из центра, далее налево до вывески “Кронпарк” (стройдвор).</dd>
					<dt>На машине:</dt>
					<dd>Двигайтесь по Кроштадскому бульвару в сторону Ленинградского шоссе до ТК “КронПарк”, поверните направо под шлагбаум на парковку (2 часа бесплатно).</dd>
				</dl>
				<ul>
					<li style="margin-bottom: 34px;">
					Адрес Крондштатский б-р <br>
					 д.9 стр. 3, павильон <br>
					И-4, ТЦ «Кронпарк» </li>
					<li>Телефон <span class="call_phone_1">+7 (495) 105 92 12</span> </li>
					<li>
					Время работы <i>Пн.-Пт.: 10:00-20:00 Сб.-Вс.: 10:00-18:00</i> </li>
					<li>
					Принимаются к оплате <img width="106" src="/bitrix/templates/main/pic/contacts__card.png" height="32" alt=""> </li>
				</ul>
 <img width="617" src="/bitrix/templates/main/pic/cont6.jpg" height="406" alt="">
			</div>
			 <!-- /contact__card -->
		</div>
		 <!-- /slider__item -->
	</div>
	 <!-- /slider__wrap -->
</div>
 <!-- /slider --> </section>
<!-- /contacts --> <!-- feedback -->
<div class="feedback">
	 <!-- feedback__wrap -->
	<div class="feedback__wrap">
		<ul>
			<li> <img alt="cash" src="/bitrix/templates/main/pic/cash-pic.png">
			При желании, вы можете приобрести окна Kaleva в рассрочку </li>
			<li> <img alt="phone" src="/bitrix/templates/main/pic/phone-pic.png">
			Позвоните нашему менеджеру и он ответит на все интереующие вас вопросы по тел. <a href="tel:74992133090" class="call_phone_2">+7 (499) 213-30-90</a> </li>
			<li> <img alt="mail" src="/bitrix/templates/main/pic/mail-pic.png">
			Отправьте заявку и мы перезвоним вам в любое удобное для вас время <a href="#orderto" class="fancybox" id="show_order">Оставить заявку</a> </li>
		</ul>
	</div>
	 <!-- /feedback__wrap -->
</div>
 <!-- /feedback --> <!-- call-metering -->
<div class="call-metering">
	<h2>Вызов менеджера на замер</h2>
	<p>
		 Отправьте заявку прямо сейчас и получите монтаж в подарок, а также максимальную скидку на весь заказ.
	</p>
	<p>
		 Внимание, cрок действия акции ограничен до <span class="auto-date">четверга</span>!
	</p>
	<form action="#">
		<fieldset>
 <input type="text" placeholder="Ваше имя"> <input type="tel" placeholder="Телефон">
		</fieldset>
 <input type="submit" value="Отправить">
	</form>
 <span>
	Для бесплатного вызова менеджера-замерщика отправьте заявку или позвоните по телефону 
<a href="tel:4951059212" class="call_phone_1">+7 (495) 105-92-12</a> </span>
</div>
            <!-- /call-metering --> 
        </div><!-- /site__content -->

        <footer class="site__footer">

            <div class="site__footer-layout">

                <!--footer-info-->
                <div class="footer-info">
                    <img src="/bitrix/templates/main/img/kaleva-footer.png" alt="kalevo"/>
                    <span>© 2012–2016    ООО «ОКНА МСК+»</span>
                    <span>Московский дилер  Kaleva</span>

                    <div class="company-market">
                        <img src="/bitrix/templates/main/img/company-market.png" alt="company-market"/>
                    </div>
                </div>
                <!--/footer-info-->

                <!-- footer-callback -->
                <div class="footer-callback">
                    <div>
                        <span>Заказ окон и консультация</span>
						<a href="tel:4951059212" class="call_phone_1">+7 (495) 105-92-12</a>                    </div>
                    <div>
                        <span>Удобные форматы оплаты</span>
                        <img src="/bitrix/templates/main/img/cash_1.png" alt="cash"/>
                        <img src="/bitrix/templates/main/img/cash_2.png" alt="cash"/>
                        <img src="/bitrix/templates/main/img/cash_3.png" alt="cash"/>
                    </div>
                </div>
                <!-- /footer-callback -->

                <!-- footer-social -->
                <div class="footer-social">

                    <div>
                        <a class="facebook" href="#">facebook</a>
                        <a class="twitter" href="#">twitter</a>
                        <a class="youtube" href="#">youtube</a>
                        <a class="vk" href="#">vk</a>
                    </div>

                    <div>
                        <a href="http://artidei.ru" target="_blank" class="sdelano">Сделано в <span>artidei.ru</span></a>

                    </div>

                </div>
                <!-- /footer-social -->

            </div><!-- /site__footer-layout -->

        </footer><!-- /site__footer -->

    </div><!-- /site -->



<div class="form_order" id="orderto" style="display: none">
	
	<form action="#window_model" method="post">
		<a href="" class="close2"><img src="/bitrix/templates/main/img/close3.png" alt="" /></a>
		<div class="clear"></div>
		<h2>Отправьте заявку <span>прямо сейчас!</span></h2>
				<p>Наш менеджер позвонит вам и рассчитает <br />
				окна со скидкой по вашим размерам. <br />
				<span>+ Монтаж по ГОСТу вы получите в подарок!</span></p>
				
		<input type="text" name="fio" placeholder="Ваше имя" />		
		<input type="text" name="phone" placeholder="Телефон *" required="required"/>		
		<input type="submit" name="order" value="Отправить"  />
		<p class="need">* - Поле обязательно к заполнению</p>
	</form>

	 
</div>



<!-- Yandex.Metrika counter -->
<script type="text/javascript">
var yaParams = {/*Здесь параметры визита*/};
</script>

<script type="text/javascript">
(function (d, w, c) {
    (w[c] = w[c] || []).push(function() {
        try {
            w.yaCounter30355287 = new Ya.Metrika({id:30355287,
                    webvisor:true,
                    clickmap:true,
                    trackLinks:true,
                    accurateTrackBounce:true,params:window.yaParams||{ }});
        } catch(e) { }
    });

    var n = d.getElementsByTagName("script")[0],
        s = d.createElement("script"),
        f = function () { n.parentNode.insertBefore(s, n); };
    s.type = "text/javascript";
    s.async = true;
    s.src = (d.location.protocol == "https:" ? "https:" : "http:") + "//mc.yandex.ru/metrika/watch.js";

    if (w.opera == "[object Opera]") {
        d.addEventListener("DOMContentLoaded", f, false);
    } else { f(); }
})(document, window, "yandex_metrika_callbacks");
</script>
<noscript><div><img src="//mc.yandex.ru/watch/30355287" style="position:absolute; left:-9999px;" alt="" /></div></noscript>
<!-- /Yandex.Metrika counter -->
<link rel= "stylesheet" href = "//cdn.callbackhunter.com/widget/tracker.css ">
<script type = "text/javascript">var hunter_code = "a5acf413951cabb72b33318ed3430ad8";</script>
<script type="text/javascript" src="//cdn.callbackhunter.com/cbh.js?hunter_code=a5acf413951cabb72b33318ed3430ad8" charset="UTF-8"></script>

<!--Openstat-->
<span id="openstat1"></span>
<script type="text/javascript">
var openstat = { counter: 1, next: openstat, track_links: "all" };
(function(d, t, p) {
var j = d.createElement(t); j.async = true; j.type = "text/javascript";
j.src = ("https:" == p ? "https:" : "http:") + "//openstat.net/cnt.js";
var s = d.getElementsByTagName(t)[0]; s.parentNode.insertBefore(j, s);
})(document, "script", document.location.protocol);
</script>
<!--/Openstat-->
<script type="text/javascript">(window.Image ? (new Image()) : document.createElement('img')).src = location.protocol + '//vk.com/rtrg?r=ggZ7koHyakiUwYZqdP47BGIG0KWtEwaZhyeOg2zrbp/9ct0MCARtvPEwjScp6Je3fiEEsyC7mvyfK*UHrgUBBX3ycuEU4HwPCvMbvZ3nMRtr5MYMIDIdL7OZoEXoiA78PRdS4PWnWrw6MzDaHxOqJ3rFHlIUMzMy4AAyhLRN8Uw-';</script>
<script src="/bitrix/templates/main/js/auto.date.latest.js"></script>
<!--<script src="/bitrix/templates/main/js/xhr.request.js"></script>-->
<script>
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

  ga('create', 'UA-57140410-1', 'auto');
  ga('send', 'pageview');

</script><!-- custom widget -->
<table id="overlay">
		<tr>
			<td class="close-space">
			
				<div class="modal">
					<div class="rel">
						<div class="close-button"></div>
						<div class="girl-with-gift"></div>
							<p class="mod-title mod-title-first">Закажите окна зимой, выгодней!</p>
							<p class="mod-title mod-title-second">ПОЛУЧИТЕ СВОЙ ПОДАРОК!</p>
							<p class="mod-desc">Это ваш счастливый день! Отправьте заявку из формы ниже<br> и получите дополнительную скидку к заказу 21% и 2 супер подарка от<br> Kaleva, прямо сейчас!</p>
							<form action="#gift-widget" method="post" class="mod-form" name="mod-form">
								<label class="mod-input-wrap mod-input-phone-wrap rel">
									<div class="mod-input-decor"></div>
									<input type="tel" class="mod-input mod-input-phone" required="required" name="mod-input-phone" placeholder="Номер телефона">
								</label>
								<input type="submit" name="mod-submit-btn" class="mod-button" value="ОТПРАВИТЬ">
							</form>
							<p class="mod-time-countdown">Окно закроется через <span class="mod-time-limit"></span></p>
					</div>
				</div>
				
			</td>
		</tr>
	</table>
	<!-- /custom widget -->
<!--<script src="/bitrix/templates/main/js/custom-widget-init.js"></script>-->
<script src="/Home/Scripts/jquery_pocket.js" type="text/javascript"></script>
<script>
    jQuery_pocket.noConflict();
</script>
<script src="/Home/Scripts/_post.js" type="text/javascript"></script>
<link rel="stylesheet" href="/Home/Styles/bootstrap.min.css" />

<link rel="stylesheet" href="//code.jquery.com/ui/1.11.4/themes/smoothness/jquery-ui.css"/>
<script src="/Scripts/jquery-ui_pocket.js"></script>
<script src="/Scripts/_dialog.js"></script>

<div id="dialog" title="Замены" style="width:100%;">
    <table class="configtable table table-bordered table-hover">
        <tbody>
            <tr class="configrow template" style="display:none;">
                <td class="id"></td>
                <td class="what col-md-6"></td>
                <td class="by col-md-6"></td>
                <td>
                    <button type="button" role="button" class="removerow ui-button ui-widget ui-state-default ui-corner-all">
                        <span class="ui-icon ui-icon-close"></span>
                    </button>
                </td>
            </tr>
        </tbody>
    </table>
</div>


</body>
</html>

