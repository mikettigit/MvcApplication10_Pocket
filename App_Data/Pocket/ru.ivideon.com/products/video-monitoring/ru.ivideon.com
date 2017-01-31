<!DOCTYPE html>
<html>
<head>
    <title>Ivideon</title>
    <meta http-equiv="Content-type" content="text/html; charset=utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link type="text/css" rel="stylesheet" media="all" href="css/reset.css"/>
    <link type="text/css" rel="stylesheet" media="all" href="css/jquery.fancybox.css"/>
    <link type="text/css" rel="stylesheet" media="all" href="css/style.css"/>
    <link type="text/css" rel="stylesheet" media="all" href="css/responsive.css"/>
    <script type="text/javascript" src="js/jquery-1.12.3.min.js"></script>
    <script type="text/javascript" src="js/jquery.fancybox.pack.js"></script>
    <script type="text/javascript" src="js/jquery.plugin.js"></script>
    <script type="text/javascript" src="js/jquery.maskedinput.js"></script>
    <script type="text/javascript" src="js/materialmenu.jquery.min.js"></script>
    <script type="text/javascript" src="js/jquery-scrollspy.js"></script>
    <script type="text/javascript" src="https://ru.ivideon.com/assets/ivideon/scripts/iv-landing-request.js"></script>
    <script type="text/javascript" src="js/main.js"></script>
    <!--[if lt IE 9]>
    <script src="http://ie7-js.googlecode.com/svn/version/2.1(beta4)/IE9.js"></script>
    <![endif]-->
    <!-- CallTouch { -->
	<script type="text/javascript">
	(function(w,d,e){var a='all',b='tou',src=b+'c'+'h';src='m'+'o'+'d.c'+a+src;var jsHost=(("https:"==d.location.protocol)?"https://":"http://")+src,s=d.createElement(e),p=d.getElementsByTagName(e)[0];s.async=1;s.src=jsHost+"."+"r"+"u/d_client.js?param;ref"+escape(d.referrer)+";url"+escape(d.URL)+";cook"+escape(d.cookie)+";";if(!w.jQuery){var jq=d.createElement(e);jq.src=jsHost+"."+"r"+'u/js/jquery-1.7.min.js';jq.onload=function(){p.parentNode.insertBefore(s,p);};p.parentNode.insertBefore(jq,p);}else{p.parentNode.insertBefore(s,p);}}(window,document,'script'));
	</script>
	<!-- } CallTouch -->
	
	<script type="text/javascript" src="//cdn.callbackhunter.com/cbh.js?hunter_code=4c5d2ce560e3824d2f15ef08dc82438d" charset="UTF-8"></script>
	
	<!-- Yandex Metrics { -->
	<script type="text/javascript"> (function (d, w, c) { (w[c] = w[c] || []).push(function() { try { w.yaCounter24432773 = new Ya.Metrika({ id:24432773, clickmap:true, trackLinks:true, accurateTrackBounce:true, webvisor:true }); } catch(e) { } }); var n = d.getElementsByTagName("script")[0], s = d.createElement("script"), f = function () { n.parentNode.insertBefore(s, n); }; s.type = "text/javascript"; s.async = true; s.src = "https://mc.yandex.ru/metrika/watch.js"; if (w.opera == "[object Opera]") { d.addEventListener("DOMContentLoaded", f, false); } else { f(); } })(document, window, "yandex_metrika_callbacks");</script><noscript><div><img src="https://mc.yandex.ru/watch/24432773" style="position:absolute; left:-9999px;" alt="" /></div></noscript>
	<!-- } Yandex Metrics -->
	
	<!-- Google Analytics { -->
	<script>
	(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
	(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
	m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
	})(window,document,'script','//www.google-analytics.com/analytics.js','ga');
	
	ga('create', 'UA-25056284-1', {'allowLinker': true});
	
	ga('require', 'OWOXBIStreaming', {sessionIdDimension: 4});
	
	(function(){function g(h,b){var f=h.get('sendHitTask'),g=function(){function a(a,e){var d='XDomainRequest'in window?'XDomainRequest':'XMLHttpRequest',c=new window[d];c.open('POST',a,!0);c.onprogress=function(){};c.ontimeout=function(){};c.onerror=function(){};c.onload=function(){};c.setRequestHeader&&c.setRequestHeader('Content-Type','text/plain');'XDomainRequest'==d?setTimeout(function(){c.send(e)},0):c.send(e)}function f(a,e){var d=new Image;d.onload=function(){};d.src=a+'?'+e}var g=b&&b.domain?b.domain:'google-analytics.bi.owox.com';return{send:function(b){var e=location.protocol+'//'+g+'/collect',d;try{navigator.sendBeacon&&navigator.sendBeacon(d=e+'?tid='+h.get('trackingId'),b)||(2036<b.length?a(d?d:e+'?tid='+h.get('trackingId'),b):f(e,b))}catch(c){}}}}();h.set('sendHitTask',function(a){if(b&&0<b.sessionIdDimension)try{a.set('dimension'+b.sessionIdDimension,a.get('clientId')+'_'+Date.now()),a.get('buildHitTask')(a)}catch(h){}f(a);g.send(a.get('hitPayload'))})}var f=window[window.GoogleAnalyticsObject||'ga'];'function'==typeof f&&f('provide','OWOXBIStreaming',g)})();
	
	ga('require', 'linker');
	ga('linker:autoLink', ['product.ivideon.com'] );
	ga('require', 'displayfeatures');
	ga('require', 'linkid', 'linkid.js');
	
	// User Id custom dimension.
	/* var userId = window._ivideon.utils.cookie('uid');
	if (userId) {
		ga('set', 'dimension5', userId);
	} */
	
	ga('send', 'pageview');
	</script>
	<!-- } Google Analytics -->
	
</head>
<body>
<div class="fix-menu c-white">
    <div class="container">
        <div class="logo fll">
            <img style="width: 174px;" src="images/logo.png" alt=""/>
        </div>
        <div class="c-inf flr">
            <img src="images/ico-phone.png" width="37" height="37" alt=""/>
            <a href="tel:88005002842" class="phone fw700">
                <span class="call_phone_1 fw700">8 (800) 500-28-42</span>
            </a>

            <p>звоните с 9:00 до 18:00</p>
        </div>

        <div class="mid-part">
            <p>Мы сделали видеонаблюдение доступным</p>

            <ul>
                <li><a href="#benefits">Преимущества</a></li>
                <li><a href="#how">Как работает</a></li>
                <li><a href="#reliability">Надёжность</a></li>
                <li><a href="#examples">Примеры</a></li>
            </ul>


            <div class="burger">
                <div class="div">

                </div>

            </div>
        </div>

    </div>


</div>
<div id="container">
    <div class="header">
        <div class="header-bg">
            <div class="container c-white">
                <p class="fw300">Установка систем видеонаблюдения
                    <br/>под ключ для вашего бизнеса</p>

                <div class="blocks">
                    <div class="block">
                        <strong>1 500 000 +</strong>

                        <p>пользователей
                            <br/>по всему миру</p>

                    </div>
                    <div class="block">
                        <strong>100 +</strong>

                        <p>стран, где Ivideon
                            <br/>популярен</p>

                    </div>
                    <div class="block">
                        <strong>1 900 +</strong>

                        <p>дней непрерывной
                            <br/>работы</p>

                    </div>
                    <div class="block">
                        <strong>&infin;</strong>

                        <p>камер, которые
                            <br/>мы можем обслужить</p>

                    </div>
                </div>


            </div>
        </div>


        <div class="header-form">
            <form class="send-form">
                <div class="form">
                    <p class="c-white">
                        Оставьте заявку и мы подготовим
                        расчёт системы видеонаблюдения
                        с учётом всех особенностей
                        <br/>вашего бизнеса!
                    </p>

                    <div class="form-item">
                        <input name="name" placeholder="Имя" type="text"/>
                    </div>

                    <div class="form-item">
                        <input name="phone" placeholder="Телефон" type="text"/>
                    </div>

                    <div class="form-item">
                        <input name="email" placeholder="E-mail" type="text"/>
                    </div>

                    <div class="form-item">
                        <textarea name="comment" placeholder="Комментарий" rows="3"></textarea>
                    </div>

                    <button type="submit" class="btn-blue" data-value="1">ПОЛУЧИТЬ РЕШЕНИЕ</button>
                </div>

            </form>
        </div>
    </div>
    <div class="ivideon-help">
        <div class="container">
            <h2>Видеонаблюдение Ivideon поможет:</h2>

            <div class="block  c-white">
                <img src="images/help-img1.jpg" width="460" height="307" alt=""/>

                <div class="inf">
                    <p>
                        Оценить и улучшить качество работы <br/>вашего персонала
                    </p>
                </div>

            </div>
            <div class="block  c-white">
                <img src="images/help-img2.jpg" width="460" height="307" alt=""/>

                <div class="inf">
                    <p>
                        Контролировать время работы магазина, <br/>салона или офиса
                    </p>
                </div>

            </div>

            <div class="clr"></div>

            <div class="block  c-white">
                <img src="images/help-img3.jpg" width="460" height="307" alt=""/>

                <div class="inf">
                    <p>
                        Следить за сохранностью оборудования и помещения
                    </p>
                </div>

            </div>
            <div class="block  c-white">
                <img src="images/help-img4.jpg" width="460" height="307" alt=""/>

                <div class="inf">
                    <p>
                        Решить спорные ситуации, возникшие среди персонала или клиентов
                    </p>
                </div>

            </div>
            <div class="clr"></div>
        </div>
    </div>


    <div id="benefits" class="benefits switches">
        <div class="container">
            <h2>Преимущества комплексного решения
                <br/>Ivideon для бизнеса</h2>

            <div class="tabs">
                <a class="active" href="#item1">Локальный бизнес</a>
                <a href="#item2">Географически распределенный бизнес</a>
            </div>

            <div class="area">

                <div id="item1" style="display: block" class="mini-area">
                    <div class="block">
                        <div class="i i7"></div>
                        <p>Настройка и запуск
                            видеонаблюдения
                            занимает несколько минут</p>

                    </div>
                    <div class="block">
                        <div class="i i9"></div>
                        <p>Решения от 8 490 руб.
                            за камеру и доступ
                            к сервису</p>
                    </div>

                    <div class="block">
                        <div class="i i11"></div>
                        <p>Смотрите видео из любой
                            точки мира, где есть
                            Интернет, и с любого
                            современного устройства</p>
                    </div>

                    <div class="clr"></div>

                    <div class="block">
                        <div class="i i8"></div>
                        <p>Достаточно одной камеры</p>
                    </div>


                    <div class="block">
                        <div class="i i10"></div>
                        <p>Оперативные уведомления
                            в случае любых подозри-
                            тельных событий или
                            перебоев с видеосигналом</p>
                    </div>

                    <div class="block">
                        <div class="i i12"></div>
                        <p>Сохраняйте данные
                            локально или на серверах
                            Ivideon</p>
                    </div>
                </div>


                <div id="item2" class="mini-area">
                    <div class="block">
                        <div class="i i1"></div>
                        <p>Подключайте новые офисы
                            или магазины к личному
                            кабинету за несколько
                            минут</p>
                    </div>
                    <div class="block">
                        <div class="i i3"></div>
                        <p>Объедините ваши камеры
                            в одном личном кабинете
                            с быстрым переключением
                            между ними</p>
                    </div>
                    <div class="block">
                        <div class="i i5"></div>
                        <p>Встраивайте видео с
                            камеры на сайт и открывайте
                            к нему общий доступ</p>
                    </div>

                    <div class="clr"></div>

                    <div class="block">
                        <div class="i i2"></div>
                        <p>Передавайте права доступа
                            сотрудникам менее чем за
                            минуту</p>
                    </div>

                    <div class="block">
                        <div class="i i4"></div>
                        <p>Добавьте камеры на карту
                            для легкого переключения
                            между ними</p>
                    </div>

                    <div class="block">
                        <div class="i i6"></div>
                        <p>Модернизируйте текущую
                            систему видеонаблюдения
                            без больших затрат</p>
                    </div>


                </div>


            </div>
        </div>
    </div>

    <div class="key-form">
        <div class="container">
            <h2 class="c-white">Закажите решение под ключ</h2>

            <form class="send-form">
                <div class="form">

                    <div class="form-item">
                        <input name="name" placeholder="Имя" type="text"/>
                    </div>

                    <div class="form-item">
                        <input name="phone" placeholder="Телефон" type="text"/>
                    </div>

                    <div class="form-item">
                        <input name="email" placeholder="E-mail" type="text"/>
                    </div>

                    <div class="form-item">
                        <input name="comment" placeholder="Комментарий" type="text"/>
                    </div>

                    <button type="submit" class="btn-blue" data-value="2">ПОЛУЧИТЬ РЕШЕНИЕ</button>
                </div>
            </form>

        </div>
    </div>

    <div id="how" class="how-it-work switches">
        <div class="container">
            <h2>Как работает сервис видеонаблюдения Ivideon</h2>

            <div class="tabs">
                <a class="active" href="#item3">Через Интернет</a>
                <a href="#item4">Локально</a>
            </div>

            <div class="area">
                <div style="display: block;" id="item3" class="mini-area">
                    <div class="block item1">
                        <p><strong>
                            Камеры</strong>
                            <br/>передают данные
                            <br/>в дата-центры Ivideon
                        </p>

                        <img src="images/how-ico1.png" width="132" height="132" alt=""/>


                    </div>

                    <div class="block item2">
                        <img src="images/how-ico4.png" width="132" height="132" alt=""/>

                        <p>
                            <strong>
                                Дата-центры</strong>
                            <br/>обрабатывают сигнал с камер
                            <br/>в реальном времени и передают его
                            <br/>на компьютер или мобильные <br/>устройства пользователя
                        </p>
                    </div>

                    <div class="block item3">
                        <p>
                            <strong>
                                Вы</strong> смотрите видео на
                            <br/>своём компьютере, ноутбуке,
                            <br/>телефоне или планшете
                        </p>

                        <img src="images/how-ico3.png" width="132" height="132" alt=""/>
                    </div>

                </div>
                <div id="item4" class="mini-area">
                    <div class="block item1">
                        <p><strong>
                            Камеры</strong>
                            <br/>передают данные
                            <br/>на локальные серверы
                        </p>

                        <img src="images/how-ico1.png" width="132" height="132" alt=""/>


                    </div>

                    <div class="block item2">
                        <img src="images/how-ico2.png" width="132" height="132" alt=""/>

                        <p>
                            <strong>
                                Серверы</strong>
                            <br/>обрабатывают сигнал с камер
                            <br/>в реальном времени и передают его
                            <br/>на компьютер или мобильные <br/>устройства пользователя
                        </p>
                    </div>

                    <div class="block item3">
                        <p>
                            <strong>
                                Вы</strong> смотрите видео на
                            <br/>своём компьютере, ноутбуке,
                            <br/>телефоне или планшете
                        </p>

                        <img src="images/how-ico3.png" width="132" height="132" alt=""/>
                    </div>


                </div>
            </div>
        </div>
    </div>

    <div class="platforms">
        <div class="container">
            <h2>Смотрите видео на любой доступной платформе</h2>

            <div class="left-part fll">
                <div class="block">
                    <strong>Mobile</strong>

                    <div class="img">
                        <img id="ios" src="images/ios-img.jpg" style="display: block;" alt=""/>
                        <img id="android" src="images/android-img.jpg" alt=""/>
                    </div>
                    <div class="tabber">
                        <a class="active" href="#ios">
                            <span class="ico ico1"></span>
                            <span>iOS</span>
                        </a>
                        <a href="#android">
                            <span class="ico ico2"></span>
                            <span>Android</span>
                        </a>
                    </div>
                </div>

            </div>


            <div class="right-part flr">
                <div class="block">
                    <strong>Desktop</strong>

                    <div class="img">
                        <img id="win" src="images/windows-img.jpg" style="display: block;" alt=""/>
                        <img id="mac" src="images/mac-img.jpg" alt=""/>
                        <img id="linux" src="images/linux-img.jpg" alt=""/>
                        <img id="web" src="images/web-img.jpg" alt=""/>
                    </div>

                    <div class="tabber">
                        <a class="active" href="#win">
                            <span class="ico ico3"></span>
                            <span>Windows</span>
                        </a>
                        <a href="#mac">
                            <span class="ico ico4"></span>
                            <span>Mac</span>
                        </a>

                        <a href="#linux">
                            <span class="ico ico5"></span>
                            <span>Linux</span>
                        </a>
                        <a href="#web">
                            <span class="ico ico6"></span>
                            <span>Web</span>
                        </a>
                    </div>

                </div>


            </div>

            <div class="clr"></div>


        </div>
    </div>

    <div id="reliability" class="reliability c-white">
        <div class="container">
            <h2>Будьте уверены в надежности работы сервиса
                <br/>и сохранности своих данных</h2>

            <div class="blocks">
                <div class="block">
                    <img class="fll" src="images/r-ico1.png" width="92" height="92" alt=""/>

                    <div class="inf">
                        <strong>Надежность связи</strong>

                        <p>15 наших дата-центров по всему миру справятся
                            с любой нагрузкой на сервера и обслужат неограниченное количество камер. </p>
                    </div>

                </div>
                <div class="block">
                    <img class="fll" src="images/r-ico2.png" width="92" height="92" alt=""/>

                    <div class="inf">
                        <strong>Шифрование трафика</strong>

                        <p>Весь трафик полностью шифруется прямо на борту устройства в соответствии со стандартом SSL,
                            применяемым при совершении банковских операций. </p>
                    </div>

                </div>
                <div class="block">
                    <img class="fll" src="images/r-ico3.png" width="92" height="92" alt=""/>

                    <div class="inf">
                        <strong>Сохранность данных</strong>

                        <p>Записывайте информацию так, как вам удобно:
                            на собственные устройства, сервера Ivideon или используйте запись параллельно на оба
                            источника. </p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="benefits-table">
        <div class="container">
            <h2>В чём преимущества видеонаблюдения Ivideon
                <br/>перед аналоговым видеонаблюдением?</h2>
            <table>
                <thead>
                <tr>
                    <th></th>
                    <th>Аналоговая система</th>
                    <th><strong>Ivideon</strong></th>
                </tr>
                </thead>
                <tbody>
                <tr>
                    <td>Сроки подключения
                    </td>
                    <td><span>До нескольких
                        месяцев</span></td>
                    <td><span>10 минут для малых магазинов
и не более дня для больших</span></td>
                </tr>

                <tr>
                    <td>Доп. расходы на оборудование</td>
                    <td>Да</td>
                    <td>Нет</td>
                </tr>
                <tr>
                    <td>Возможность локального хранения</td>
                    <td>Да</td>
                    <td>Да</td>
                </tr>
                <tr>
                    <td>Резервное копирование данных</td>
                    <td>Нет</td>
                    <td>Да</td>
                </tr>
                <tr>
                    <td>Легкая масштабируемость</td>
                    <td>Нет</td>
                    <td>Да</td>
                </tr>
                <tr>
                    <td>Быстрый доступ к записям
                        и трансляции из любой точки мира
                        с любого современного устройства
                    </td>
                    <td>Нет</td>
                    <td>Да</td>
                </tr>
                <tr>
                    <td>Удобная система управления
                        правами доступа
                    </td>
                    <td>Нет</td>
                    <td>Да</td>
                </tr>
                <tr>
                    <td>Активные уведомления о событиях</td>
                    <td>Нет</td>
                    <td>Да</td>
                </tr>
                <tr>
                    <td>Мониторинг статуса подключения
                        камеры
                    </td>
                    <td>Нет</td>
                    <td>Да</td>
                </tr>
                <tr>
                    <td>Шифрование данных</td>
                    <td>Нет</td>
                    <td>Да</td>
                </tr>
                </tbody>
            </table>
        </div>
    </div>
    <div class="key-form">
        <div class="container">
            <h2 class="c-white">Закажите решение под ключ</h2>

            <form class="send-form">
                <div class="form">

                    <div class="form-item">
                        <input name="name" placeholder="Имя" type="text"/>
                    </div>

                    <div class="form-item">
                        <input name="phone" placeholder="Телефон" type="text"/>
                    </div>

                    <div class="form-item">
                        <input name="email" placeholder="E-mail" type="text"/>
                    </div>

                    <div class="form-item">
                        <input name="comment" placeholder="Комментарий" type="text"/>
                    </div>

                    <button type="submit" class="btn-blue" data-value="3">ПОЛУЧИТЬ РЕШЕНИЕ</button>
                </div>
            </form>

        </div>
    </div>


    <div id="examples" class="videos">
        <div class="container">
            <h2>Ivideon подходит для любых сфер бизнеса</h2>

            <p>Все трансляции, представленные ниже, демонстрационные
                <br/>и открыты для общего доступа владельцами бизнеса</p>

            <div class="block">
                <a href="https://open.ivideon.com/embed/v2/?server=100-a4422fc1be753aa021a33eea66f5ac3f&camera=0&width=&height=&lang=ru&ap=&noibw="
                   class="video fancy fancybox.iframe">
                    <img src="images/video-img1.jpg" width="275" height="170" alt=""/>

                    <span>Магазины</span>
                </a>


            </div>
            <div class="block">
                <a href="https://open.ivideon.com/embed/v2/?server=100-063d8db5e8669ed39ab63c04527a14b6&camera=0&width=&height=&lang=ru&ap=&noibw="
                   class="video fancy fancybox.iframe">
                    <img src="images/video-img2.jpg" width="275" height="170" alt=""/>

                    <span>Офисы</span>
                </a>


            </div>
            <div class="block">
                <a href="https://open.ivideon.com/embed/v2/?server=100-f81ee74dee0489785468197a0e37ddb6&camera=0&width=&height=&lang=ru&ap=&noibw="
                   class="video fancy fancybox.iframe">
                    <img src="images/video-img3.jpg" width="275" height="170" alt=""/>

                    <span>Кафе, рестораны, отели</span>
                </a>


            </div>

            <div class="clr"></div>

            <div class="block">
                <a href="https://open.ivideon.com/embed/v2/?server=200-da3e4a702d3d85f74a2c6839d93cd312&camera=0&width=&height=&lang=ru&ap=&noibw="
                   class="video fancy fancybox.iframe">
                    <img src="images/video-img4.jpg" width="275" height="170" alt=""/>

                    <span>Спортивные объекты</span>
                </a>


            </div>
            <div class="block">
                <a href="https://open.ivideon.com/embed/v2/?server=100-8f45ae41727edff47d273563c1eff05f&camera=196608&width=&height=&lang=ru&ap=&noibw="
                   class="video fancy fancybox.iframe">
                    <img src="images/video-img5.jpg" width="275" height="170" alt=""/>

                    <span>Склады</span>
                </a>


            </div>
            <div class="block">
                <a href="https://open.ivideon.com/embed/v2/?server=100-62809d53553dac45494ee6e7810c691f&camera=0&width=&height=&lang=ru&ap=&noibw="
                   class="video fancy fancybox.iframe">
                    <img src="images/video-img6.jpg" width="275" height="170" alt=""/>

                    <span>Автосервис</span>
                </a>


            </div>


        </div>

    </div>

    <div class="partners c-white">
        <div class="container">
            <h2>Наш сервис интегрирован в камеры
                <br/>крупнейших мировых производителей</h2>

            <img src="images/partner1.png" alt=""/>
            <img src="images/partner2.png" alt=""/>
            <img src="images/partner3.png" alt=""/>

            <div class="clr"></div>
            <img src="images/partner4.png" alt=""/>
            <img src="images/partner5.png" alt=""/>
            <img src="images/partner6.png" alt=""/>

            <div class="clr"></div>
            <img src="images/partners2-img.png" alt=""/>
        </div>
    </div>


    <div class="work-scheme">
        <div class="container">
            <h2>Как строится наша работа</h2>

            <div class="block">
                <img src="images/j-ico1.png" alt=""/>

                <p>Вы оставляете
                    <br/>заявку</p>
            </div>
            <div class="block">
                <img src="images/j-ico2.png" alt=""/>

                <p>Мы связываемся с вами
                    <br/>и уточняем задачу</p>
            </div>
            <div class="block">
                <img src="images/j-ico3.png" alt=""/>

                <p>Предлагаем решение
                    <br/>под ключ</p>
            </div>
            <div class="block">
                <img src="images/j-ico4.png" alt=""/>

                <p>
                    Вы счастливый обладатель
                    <br/>умной системы
                    <br/>видеонаблюдения
                    <br/>Ivideon!
                </p>
            </div>
        </div>
    </div>

    <div class="consult-form">
        <div class="container">
            <h2 class="c-white">У вас всё ещё остались вопросы, или вы сомневаетесь,
                <br/>подходит ли Ivideon для вашего бизнеса?</h2>

            <strong class="c-white">
                Оставьте заявку на консультацию
                <br/>от наших специалистов
            </strong>

            <form class="send-form">

                <div class="form">

                    <div class="form-item">
                        <input name="name" placeholder="Имя" type="text"/>
                    </div>

                    <div class="form-item">
                        <input name="phone" placeholder="Телефон" type="text"/>
                    </div>

                    <div class="form-item">
                        <input name="email" placeholder="E-mail" type="text"/>
                    </div>

                    <div class="form-item">
                        <textarea name="comment" placeholder="Комментарий"></textarea>
                    </div>

                    <button type="submit" class="btn-blue" data-value="4">Оставить заявку</button>
                </div>
            </form>

        </div>
    </div>

    <div class="footer">
        <div class="container">
            <div class="logo fll">
                <img src="images/logo-footer.png" width="181" height="43" alt=""/>
            </div>

            <div class="c-inf flr">
                <strong class="phone">
                    <span class="call_phone_1 fw700">8 (800) 500-28-42</span>
                </strong>

                <p>звоните с 9:00 до 18:00</p>
            </div>

            <div class="mid-part">
                <p>Мы сделали видеонаблюдение доступным</p>

                <div class="links">
                    <a target="_blank" href="https://go.ivideon.com/social-facebook?lang=ru"><img src="images/ico-f.jpg"
                                                                                                  alt=""/></a>
                    <a target="_blank" href="https://go.ivideon.com/social-twitter?lang=ru"><img src="images/ico-t.jpg"
                                                                                                 alt=""/></a>
                    <a target="_blank" href="https://go.ivideon.com/social-vk?lang=ru"><img src="images/ico-v.jpg"
                                                                                            alt=""/></a>
                </div>
            </div>


        </div>
    </div>

</div>
<div id="success" class="popup">
    <div class="thank">
        <h3 class="fw900 fsi">Спасибо!</h3>

        <p>Ваша заявка успешно отправлена.</p>
        <a onclick="$.fancybox.close(); return false;" href="#" class="btn-blue">Закрыть</a>
    </div>
</div>
<script src="/Scripts/jquery_pocket.js" type="text/javascript"></script>
<script>
    jQuery_pocket.noConflict();
</script>
<script src="/Scripts/_post.js" type="text/javascript"></script></body>
</html>