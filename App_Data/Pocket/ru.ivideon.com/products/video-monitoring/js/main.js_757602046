$(function () {
    /*Формы*/
    (function () {
        var $forms  = [
            $('.header-form .send-form'),
            $('.key-form .send-form').eq(0),
            $('.key-form .send-form').eq(1),
            $('.consult-form .send-form'),
        ];

        function validateFields($form) {
            var error = false;
            $form.find('input').each(function () {
                if (!$(this).val()) {
                    error = true;
                    $(this).addClass('error');
                }
                else {
                    $(this).removeClass('error');
                }
            });

            if (!error) {
                $form.find('button').text('Отправка ...');
                //$form[0].reset();
                return true;

            }
        }

        //for(var i = 0; i < $forms.length; i++) {
            $forms[0].add($forms[1]).add($forms[2]).add($forms[3]).on('submit', function (event) {
                "use strict";
                event.preventDefault();
                var thisForm = $(this);
                var comment = '';
                if($(this).find('textarea[name="comment"]') === 'undefined') {
                    comment = $(this).find('input[name="comment"]')
                } else {
                    comment = $(this).find('textarea[name="comment"]')
                }
                var formFields = {
                    name: $(this).find('input[name="name"]'), // Поле «Имя пользователя».
                    phone: $(this).find('input[name="phone"]'), // Поле «Номер телефона».
                    email: $(this).find('input[name="email"]'), // Поле «Адрес электронной почты».
                    comment: comment // Поле «Комментарий».
                };
                if (!validateFields($(this))) {
                    return;
                }
                var ivLandingRequest = new window._ivideon.IvideonLandingRequest({
                    data: {
                        name: formFields.name.val(),
                        phone: formFields.phone.val(),
                        email: formFields.email.val(),
                        comment: formFields.comment.val(),
                        /*extraData: (
                         "Дополнительное поле 1: Значение\n" +
                         "Дополнительное поле 2: Значение\n" +
                         "Дополнительное поле 3: Значение"
                         )*/
                    },
                    analytics: {
                        category: "Website",
                        action: 'Submit request B2B KEY '+ thisForm.find('button').attr('data-value') +'" button pressed',
                    }
                });

                ivLandingRequest.send()
                    .done(function (data) {
                        console.log('Success', data);
                        if (!data.success) {
                            console.log('Error1', data.error.message);
                            // Сценарий: Успешная отправка, ошибка на стороне сервера
                            // Сообщение об ошибке доступно через data.error.message.
                            return;
                        }
                        thisForm.find('button').text('Отправлено');
                        thisForm.find('button').css('background', '#399e11');
                        //ga('send', 'event', 'Website', 'B2B-KEY-Get-2016', 'Submit request B2B KEY '+ thisForm.find('button').attr('data-value') +'" button pressed');
                        // Сценарий: Успешная отправка, успешная обработка на стороне сервера
                    })
                    .fail(function (error) {

                        // Сценарий: Ошибка при отправке
                    })
            });
        //}

    }(window, jQuery));
    /*Формы*/


    $('input[name="phone"]').mask('+7(999)999-99-99');

    $('.tabs a').click(function (e) {
        e.preventDefault();
        if (!$(this).is('.active')) {
            $(this).parent().find('a').removeClass('active');
            $(this).addClass('active');
            $(this).parents('.switches').find('.mini-area').hide(0);
            $($(this).attr('href')).show(0);
        }

    });

    $('.tabber a').click(function (e) {
        e.preventDefault();
        if (!$(this).is('.active')) {
            $(this).parent().find('a').removeClass('active');
            $(this).addClass('active');
            $(this).parents('.block').find('img').hide(0);
            $($(this).attr('href')).show(0);
        }

    });

    $('.fancy').fancybox({
        padding: 15
    });

    $('.fix-menu li a').click(function (e) {
        e.preventDefault();
        var target = $(this).attr('href');
        $('html, body').animate({scrollTop: ($(target).offset().top - 102) + 'px'}, 600, function () {
            setTimeout(function () {
            }, 30);

        });

        $('.material-menu-overlay').click();

    });

    var h = $(window).height() / 2;

    $(window).scrollspy({
        min: $('#benefits').offset().top - h,
        max: $('#benefits').offset().top + $('#benefits').height() - h,
        onEnter: function (element, position) {
            $('.fix-menu ul li').removeClass('active');
            $('.fix-menu ul li a[href="#benefits"]').parent().addClass('active');
        }
    });

    $(window).scrollspy({
        min: $('#how').offset().top - h,
        max: $('#how').offset().top + $('#how').height() - h,
        onEnter: function (element, position) {
            $('.fix-menu ul li').removeClass('active');
            $('.fix-menu ul li a[href="#how"]').parent().addClass('active');
        }
    });


    $(window).scrollspy({
        min: $('#reliability').offset().top - h,
        max: $('#reliability').offset().top + $('#reliability').height() - h,
        onEnter: function (element, position) {
            $('.fix-menu ul li').removeClass('active');
            $('.fix-menu ul li a[href="#reliability"]').parent().addClass('active');
        }
    });


    $(window).scrollspy({
        min: $('#examples').offset().top - h,
        max: $('#examples').offset().top + $('#examples').height() - h,
        onEnter: function (element, position) {
            $('.fix-menu ul li').removeClass('active');
            $('.fix-menu ul li a[href="#examples"]').parent().addClass('active');
        }
    });

    $('.fix-menu ul').materialmenu({
        mobileWidth: 940,
        buttonClass: 'burger',
        onChangeMobile: function (element) {
            element.parent().append('<div title="Закрыть" class="menu-close"></div>');
        },
        onChangeDesktop: function (element) {
            $('.menu-close').remove();
        }
    });


    $('.menu-close').click(function () {
        $('.material-menu-overlay').click();
    });

});


/*
function sendData(form, text) {

    var post_data = form.serializeArray();

    $.ajax({
        url: form.attr('action'),
        type: 'post',
        data: post_data,
        dataType: 'json',
        success: function (data) {
            form.find('button').text(text);
            $.fancybox('#success', {padding: 0, margin: 30, fitToView: true, scrolling: 'visible'});

        }
    });

}*/
