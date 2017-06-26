(function($, window, document, undefined) {
    var $window = $(window);
    var defaults = {
        syntax: '<div class="ik_select_link"><div class="ik_select_link_text"></div></div><div class="ik_select_dropdown"><div class="ik_select_list"></div></div>',
        autoWidth: true,
        ddFullWidth: true,
        equalWidths: true,
        dynamicWidth: false,
        extractLink: false,
        customClass: '',
        linkCustomClass: '',
        ddCustomClass: '',
        ddMaxHeight: 200,
        filter: false,
        nothingFoundText: 'Nothing found',
        isDisabled: false,
        onShow: function() {},
        onHide: function() {},
        onKeyUp: function() {},
        onKeyDown: function() {},
        onHoverMove: function() {}
    };
    var instOpened;
    var uaMatch = function(ua) {
        ua = ua.toLowerCase();
        var match = /(chrome)[ \/]([\w.]+)/.exec(ua) || /(webkit)[ \/]([\w.]+)/.exec(ua) || /(opera)(?:.*version|)[ \/]([\w.]+)/.exec(ua) || /(msie) ([\w.]+)/.exec(ua) || ua.indexOf('compatible') < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec(ua) || [];
        return {
            browser: match[1] || '',
            version: match[2] || '0'
        };
    };
    if (!$.browser) {
        var matched = uaMatch(navigator.userAgent);
        var browser = {};
        if (matched.browser) {
            browser[matched.browser] = true;
            browser.version = matched.version;
        }
        if (browser.chrome) {
            browser.webkit = true;
        } else if (browser.webkit) {
            browser.safari = true;
        }
        $.browser = browser;
    }
    $.browser.mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile/i.test(navigator.userAgent);
    $.browser.operamini = Object.prototype.toString.call(window.operamini) === "[object OperaMini]";

    function IkSelect(element, options) {
        var dataOptions = {};
        this.el = element;
        this.$el = $(element);
        for (var key in defaults) {
            dataOptions[key] = this.$el.data(key.toLowerCase());
        }
        this.options = $.extend({}, defaults, options, dataOptions);
        if ($.browser.mobile) {
            this.options.filter = false;
        }
        this.init();
    }
    $.extend(IkSelect.prototype, {
        init: function() {
            this.$wrapper = $('<div class="ik_select">' + this.options.syntax + '</div>');
            this.$link = $('.ik_select_link', this.$wrapper);
            this.$linkText = $('.ik_select_link_text', this.$wrapper);
            this.$dropdown = $('.ik_select_dropdown', this.$wrapper);
            this.$list = $('.ik_select_list', this.$wrapper);
            this.$listInner = $('<div class="ik_select_list_inner"/>');
            this.$active = $([]);
            this.$hover = $([]);
            this.hoverIndex = 0;
            this.$optionSet = $([]);
            this.$optgroupSet = $([]);
            this.$list.append(this.$listInner);
            if (this.options.filter) {
                this.$filter = $([]);
                this.$optionSetOriginal = $([]);
                this.$nothingFoundText = $('<div class="ik_select_nothing_found"/>').html(this.options.nothingFoundText);
                this.$filterWrap = $('.ik_select_filter_wrap', this.$wrapper);
                if (!this.$filterWrap.length) {
                    this.$filterWrap = $('<div class="ik_select_filter_wrap"/>');
                }
                this.$filter = $('<input type="text" class="ik_select_filter">');
                this.$filterWrap.append(this.$filter);
                this.$list.prepend(this.$filterWrap);
                this.$filter.on({
                    'keydown.ikSelect keyup.ikSelect': $.proxy(this, '_elKeyUpDown'),
                    'keyup.ikSelect': $.proxy(this, '_filterKeyup')
                });
            }
            this.$wrapper.addClass(this.options.customClass);
            this.$link.addClass(this.options.linkCustomClass || (this.options.customClass && this.options.customClass + '-link'));
            this.$dropdown.addClass(this.options.ddCustomClass || (this.options.customClass && this.options.customClass + '-dd'));
            this.reset();
            this.toggle(!(this.options.isDisabled || this.$el.prop('disabled')));
            this.$link.on('click.ikSelect', $.proxy(this, '_linkClick'));
            this.$el.on({
                'focus.ikSelect': $.proxy(this, '_elFocus'),
                'blur.ikSelect': $.proxy(this, '_elBlur'),
                'change.ikSelect': $.proxy(this, '_syncOriginalOption'),
                'keydown.ikSelect keyup.ikSelect': $.proxy(this, '_elKeyUpDown')
            });
            this.$list.on({
                'click.ikSelect': $.proxy(this, '_optionClick'),
                'mouseover.ikSelect': $.proxy(this, '_optionMouseover')
            }, '.ik_select_option');
            this.$wrapper.on('click', function() {
                return false;
            });
            this.$el.after(this.$wrapper);
            this.redraw();
            this.$el.appendTo(this.$wrapper);
        },
        _linkClick: function() {
            if (this.isDisabled) {
                return;
            }
            if (this === instOpened) {
                this.hideDropdown();
            } else {
                this.showDropdown();
            }
        },
        _optionClick: function() {
            this._makeOptionActive(this.searchIndexes ? this.$optionSetOriginal.index(this.$hover) : this.hoverIndex, true);
            this.hideDropdown();
            this.$el.change().focus();
        },
        _optionMouseover: function(event) {
            var $option = $(event.currentTarget);
            if ($option.hasClass('ik_select_option_disabled')) {
                return;
            }
            this.$hover.removeClass('ik_select_hover');
            this.$hover = $option.addClass('ik_select_hover');
            this.hoverIndex = this.$optionSet.index(this.$hover);
        },
        _makeOptionActive: function(index, shouldSync) {
            var $option = $(this.el.options[index]);
            this.$linkText.text($option.text());
            this.$link.toggleClass('ik_select_link_novalue', !$option.attr('value'));
            this.$hover.removeClass('ik_select_hover');
            this.$active.removeClass('ik_select_active');
            this.$hover = this.$active = this.$optionSet.eq(index).addClass('ik_select_hover ik_select_active');
            this.hoverIndex = index;
            if (shouldSync) {
                this._syncFakeOption();
            }
        },
        _elKeyUpDown: function(event) {
            var $handle = $(event.currentTarget);
            var type = event.type;
            var keycode = event.which;
            var newTop;
            switch (keycode) {
                case 38:
                    if (type === 'keydown') {
                        event.preventDefault();
                        this._moveToPrevActive();
                    }
                    break;
                case 40:
                    if (type === 'keydown') {
                        event.preventDefault();
                        this._moveToNextActive();
                    }
                    break;
                case 33:
                    if (type === 'keydown') {
                        event.preventDefault();
                        newTop = this.$hover.position().top - this.$listInner.height();
                        this._moveToPrevActive(function(optionTop) {
                            return optionTop <= newTop;
                        });
                    }
                    break;
                case 34:
                    if (type === 'keydown') {
                        event.preventDefault();
                        newTop = this.$hover.position().top + this.$listInner.height();
                        this._moveToNextActive(function(optionTop) {
                            return optionTop >= newTop;
                        });
                    }
                    break;
                case 36:
                    if (type === 'keydown' && $handle.is(this.$el)) {
                        event.preventDefault();
                        this._moveToFirstActive();
                    }
                    break;
                case 35:
                    if (type === 'keydown' && $handle.is(this.$el)) {
                        event.preventDefault();
                        this._moveToLastActive();
                    }
                    break;
                case 32:
                    if (type === 'keydown' && $handle.is(this.$el)) {
                        event.preventDefault();
                        if (!this.$dropdown.is(':visible')) {
                            this._linkClick();
                        } else {
                            this.$hover.click();
                        }
                    }
                    break;
                case 13:
                    if (type === 'keydown' && this.$dropdown.is(':visible')) {
                        event.preventDefault();
                        this.$hover.click();
                    }
                    break;
                case 27:
                    if (type === 'keydown' && this.$dropdown.is(':visible')) {
                        event.preventDefault();
                        this.hideDropdown();
                    }
                    break;
                case 9:
                    if (type === 'keydown') {
                        if ($.browser.webkit && this.$dropdown.is(':visible')) {
                            event.preventDefault();
                        } else {
                            this.hideDropdown();
                        }
                    }
                    break;
                default:
                    if (type === 'keyup' && $handle.is(this.$el)) {
                        this._syncOriginalOption();
                    }
                    break;
            }
            if (type === 'keyup' && $.browser.mozilla) {
                this._syncFakeOption();
            }
            if (type === 'keydown') {
                this.options.onKeyDown(this, keycode);
                this.$el.trigger('ikkeydown', [this, keycode]);
            }
            if (type === 'keyup') {
                this.options.onKeyUp(this, keycode);
                this.$el.trigger('ikkeyup', [this, keycode]);
            }
        },
        _moveTo: function(index) {
            var optionTopLine, optionBottomLine;
            var $optgroup;
            if (!this.$dropdown.is(':visible') && $.browser.webkit) {
                this.showDropdown();
                return this;
            }
            if (!this.$dropdown.is(':visible') || $.browser.mozilla) {
                this._makeOptionActive(index, true);
            } else {
                this.$hover.removeClass('ik_select_hover');
                this.$hover = this.$optionSet.eq(index).addClass('ik_select_hover');
                this.hoverIndex = index;
            }
            optionTopLine = this.$hover.position().top;
            optionBottomLine = optionTopLine + this.$active.outerHeight();
            if (!this.$hover.index()) {
                $optgroup = this.$hover.closest('.ik_select_optgroup');
                if ($optgroup.length) {
                    optionTopLine = $optgroup.position().top;
                }
            }
            if (optionBottomLine > this.$listInner.height()) {
                this.$listInner.scrollTop(this.$listInner.scrollTop() + optionBottomLine - this.$listInner.height());
            } else if (optionTopLine < 0) {
                this.$listInner.scrollTop(this.$listInner.scrollTop() + optionTopLine);
            }
            this.options.onHoverMove(this);
            this.$el.trigger('ikhovermove', this);
        },
        _moveToFirstActive: function() {
            for (var i = 0; i < this.$optionSet.length; i++) {
                if (!this.$optionSet.eq(i).hasClass('ik_select_option_disabled')) {
                    this._moveTo(i);
                    break;
                }
            }
        },
        _moveToLastActive: function() {
            for (var i = this.$optionSet.length - 1; i >= 0; i++) {
                if (!this.$optionSet.eq(i).hasClass('ik_select_option_disabled')) {
                    this._moveTo(i);
                    break;
                }
            }
        },
        _moveToPrevActive: function(condition) {
            var $option;
            for (var i = this.hoverIndex - 1; i >= 0; i--) {
                $option = this.$optionSet.eq(i);
                if (!$option.hasClass('ik_select_option_disabled') && (typeof condition === 'undefined' || condition($option.position().top))) {
                    this._moveTo(i);
                    break;
                }
            }
        },
        _moveToNextActive: function(condition) {
            var $option;
            for (var i = this.hoverIndex + 1; i < this.$optionSet.length; i++) {
                $option = this.$optionSet.eq(i);
                if (!$option.hasClass('ik_select_option_disabled') && (typeof condition === 'undefined' || condition($option.position().top))) {
                    this._moveTo(i);
                    break;
                }
            }
        },
        _elFocus: function() {
            var wrapperOffsetTop, wrapperHeight, windowScrollTop, windowHeight;
            if (this.isDisabled) {
                return this;
            }
            this.$link.addClass('ik_select_link_focus');
            wrapperOffsetTop = this.$wrapper.offset().top;
            wrapperHeight = this.$wrapper.height();
            windowScrollTop = $window.scrollTop();
            windowHeight = $window.height();
            if ((wrapperOffsetTop + wrapperHeight > windowScrollTop + windowHeight) || (wrapperOffsetTop < windowScrollTop)) {
                $window.scrollTop(wrapperOffsetTop - windowHeight / 2);
            }
        },
        _elBlur: function() {
            this.$link.removeClass('ik_select_link_focus');
        },
        _filterKeyup: function() {
            var filterVal = $.trim(this.$filter.val());
            var filterValOld;
            this.$listInner.show();
            if (typeof this.searchIndexes === 'undefined') {
                this.$optionSetOriginal = this.$optionSet;
                this.searchIndexes = $.makeArray(this.$optionSet.map(function(optionIndex, option) {
                    return $(option).text().toLowerCase();
                }));
            }
            if (filterVal !== filterValOld) {
                if (filterVal === '') {
                    this.$optionSet = this.$optionSetOriginal.show();
                    this.$optgroupSet.show();
                    this.$nothingFoundText.remove();
                } else {
                    this.$optionSet = $([]);
                    this.$optgroupSet.show();
                    this.$optionSetOriginal.each($.proxy(function(optionIndex, option) {
                        var $option = $(option);
                        if (this.searchIndexes[optionIndex].indexOf(filterVal.toLowerCase()) >= 0) {
                            this.$optionSet = this.$optionSet.add($option);
                            $option.show();
                        } else {
                            $option.hide();
                        }
                    }, this));
                    if (this.$optionSet.length) {
                        this.$nothingFoundText.remove();
                        this.$optgroupSet.each(function(optgroupIndex, optgroup) {
                            var $optgroup = $(optgroup);
                            if (!$('.ik_select_option:visible', $optgroup).length) {
                                $optgroup.hide();
                            }
                        });
                        if (!this.$hover.is(':visible')) {
                            this._moveToFirstActive();
                        }
                    } else {
                        this.$listInner.hide();
                        this.$list.append(this.$nothingFoundText);
                    }
                }
                filterValOld = filterVal;
            }
        },
        _syncFakeOption: function() {
            this.el.selectedIndex = this.hoverIndex;
        },
        _syncOriginalOption: function() {
            this._makeOptionActive(this.el.selectedIndex);
        },
        _fixHeight: function() {
            this.$dropdown.show();
            this.$listInner.css('height', 'auto');
            if (this.$listInner.height() > this.options.ddMaxHeight) {
                this.$listInner.css({
                    overflow: 'auto',
                    height: this.options.ddMaxHeight,
                    position: 'relative'
                });
            }
            this.$dropdown.hide();
        },
        redraw: function() {
            var maxWidthOuter, scrollbarWidth, wrapperParentWidth;
            if (this.options.filter) {
                this.$filter.hide();
            }
            this.$wrapper.css({
                position: 'relative'
            });
            this.$dropdown.css({
                position: 'absolute',
                zIndex: 9998,
                width: '100%'
            });
            this.$list.css({
                position: 'relative'
            });
            this._fixHeight();
            if (this.options.dynamicWidth || this.options.autoWidth || this.options.ddFullWidth) {
                this.$wrapper.width('');
                this.$dropdown.show().width(9999);
                this.$listInner.css('float', 'left');
                this.$list.css('float', 'left');
                maxWidthOuter = this.$list.outerWidth(true);
                scrollbarWidth = this.$listInner.width() - this.$listInnerUl.width();
                this.$list.css('float', '');
                this.$listInner.css('float', '');
                this.$dropdown.css('width', '100%');
                if (this.options.ddFullWidth) {
                    this.$dropdown.width(maxWidthOuter + scrollbarWidth);
                }
                if (this.options.dynamicWidth) {
                    this.$wrapper.css({
                        display: 'inline-block',
                        width: 'auto',
                        verticalAlign: 'top'
                    });
                } else if (this.options.autoWidth) {
                    this.$wrapper.width(maxWidthOuter + (this.options.equalWidths ? scrollbarWidth : 0)).addClass('ik_select_autowidth');
                }
                wrapperParentWidth = this.$wrapper.parent().width();
                if (this.$wrapper.width() > wrapperParentWidth) {
                    this.$wrapper.width(wrapperParentWidth);
                }
            }
            if (this.options.filter) {
                this.$filter.show().outerWidth(this.$filterWrap.width());
            }
            this.$dropdown.hide();
            this.$el.css({
                position: 'absolute',
                margin: 0,
                padding: 0,
                top: 0,
                left: -9999
            });
            if ($.browser.mobile) {
                this.$el.css({
                    opacity: 0,
                    left: 0,
                    height: this.$wrapper.height(),
                    width: this.$wrapper.width()
                });
            }
        },
        reset: function() {
            var html = '';
            this.$linkText.html(this.$el.val());
            this.$listInner.empty();
            html = '<ul>';
            this.$el.children().each($.proxy(function(childIndex, child) {
                var $child = $(child);
                var tagName = child.tagName.toLowerCase();
                var options;
                if (tagName === 'optgroup') {
                    options = $child.children().map($.proxy(function(optionIndex, option) {
                        return this._generateOptionObject($(option));
                    }, this));
                    options = $.makeArray(options);
                    html += this._renderListOptgroup({
                        label: $child.attr('label') || '&nbsp;',
                        isDisabled: $child.is(':disabled'),
                        options: options
                    });
                } else if (tagName === 'option') {
                    html += this._renderListOption(this._generateOptionObject($child));
                }
            }, this));
            html += '</ul>';
            this.$listInner.append(html);
            this._syncOriginalOption();
            this.$listInnerUl = $('> ul', this.$listInner);
            this.$optgroupSet = $('.ik_select_optgroup', this.$listInner);
            this.$optionSet = $('.ik_select_option', this.$listInner);
        },
        hideDropdown: function() {
            if (this.options.filter) {
                this.$filter.val('').keyup();
            }
            this.$dropdown.hide().appendTo(this.$wrapper).css({
                'left': '',
                'top': ''
            });
            if (this.options.extractLink) {
                this.$wrapper.outerWidth(this.$wrapper.data('outerWidth'));
                this.$wrapper.height('');
                this.$link.removeClass('ik_select_link_extracted').css({
                    position: '',
                    top: '',
                    left: '',
                    zIndex: ''
                }).prependTo(this.$wrapper);
            }
            instOpened = null;
            this.$el.focus();
            this.options.onHide(this);
            this.$el.trigger('ikhide', this);
        },
        showDropdown: function() {
            var dropdownOffset, dropdownOuterWidth, dropdownOuterHeight;
            var wrapperOffset, wrapperOuterWidth;
            var windowWidth, windowHeight, windowScroll;
            var linkOffset;
            if (instOpened === this || !this.$optionSet.length) {
                return;
            } else if (instOpened) {
                instOpened.hideDropdown();
            }
            this._syncOriginalOption();
            this.$dropdown.show();
            dropdownOffset = this.$dropdown.offset();
            dropdownOuterWidth = this.$dropdown.outerWidth(true);
            dropdownOuterHeight = this.$dropdown.outerHeight(true);
            wrapperOffset = this.$wrapper.offset();
            windowWidth = $window.width();
            windowHeight = $window.height();
            windowScroll = $window.scrollTop();
            if (this.options.ddFullWidth && wrapperOffset.left + dropdownOuterWidth > windowWidth) {
                dropdownOffset.left = windowWidth - dropdownOuterWidth;
            }
            if (dropdownOffset.top + dropdownOuterHeight > windowScroll + windowHeight) {
                dropdownOffset.top = windowScroll + windowHeight - dropdownOuterHeight;
            }
            this.$dropdown.css({
                left: dropdownOffset.left,
                top: dropdownOffset.top,
                width: this.$dropdown.width()
            }).appendTo('body');
            if (this.options.extractLink) {
                linkOffset = this.$link.offset();
                wrapperOuterWidth = this.$wrapper.outerWidth();
                this.$wrapper.data('outerWidth', wrapperOuterWidth);
                this.$wrapper.outerWidth(wrapperOuterWidth);
                this.$wrapper.outerHeight(this.$wrapper.outerHeight());
                this.$link.outerWidth(this.$link.outerWidth());
                this.$link.addClass('ik_select_link_extracted').css({
                    position: 'absolute',
                    top: linkOffset.top,
                    left: linkOffset.left,
                    zIndex: 9999
                }).appendTo('body');
            }
            this.$listInner.scrollTop(this.$active.position().top - this.$list.height() / 2);
            if (this.options.filter) {
                this.$filter.focus();
            } else {
                this.$el.focus();
            }
            instOpened = this;
            this.options.onShow(this);
            this.$el.trigger('ikshow', this);
        },
        _generateOptionObject: function($option) {
            return {
                value: $option.val(),
                label: $option.html() || '&nbsp;',
                isDisabled: $option.is(':disabled')
            };
        },
        _renderListOption: function(option) {
            var html;
            var disabledClass = option.isDisabled ? ' ik_select_option_disabled' : '';
            html = '<li class="ik_select_option' + disabledClass + '" data-value="' + option.value + '">';
            html += '<span class="ik_select_option_label">';
            html += option.label;
            html += '</span>';
            html += '</li>';
            return html;
        },
        _renderListOptgroup: function(optgroup) {
            var html;
            var disabledClass = optgroup.isDisabled ? ' ik_select_optgroup_disabled' : '';
            html = '<li class="ik_select_optgroup' + disabledClass + '">';
            html += '<div class="ik_select_optgroup_label">' + optgroup.label + '</div>';
            html += '<ul>';
            if ($.isArray(optgroup.options)) {
                $.each(optgroup.options, $.proxy(function(optionIndex, option) {
                    html += this._renderListOption({
                        value: option.value,
                        label: option.label || '&nbsp;',
                        isDisabled: option.isDisabled
                    });
                }, this));
            }
            html += '</ul>';
            html += '</li>';
            return html;
        },
        _renderOption: function(option) {
            return '<option value="' + option.value + '">' + option.label + '</option>';
        },
        _renderOptgroup: function(optgroup) {
            var html;
            html = '<optgroup label="' + optgroup.label + '">';
            if ($.isArray(optgroup.options)) {
                $.each(optgroup.options, $.proxy(function(optionIndex, option) {
                    html += this._renderOption(option);
                }, this));
            }
            html += '</option>';
            return html;
        },
        addOptions: function(options, optionIndex, optgroupIndex) {
            var listHtml = '',
                selectHtml = '';
            var $destinationUl = this.$listInnerUl;
            var $destinationOptgroup = this.$el;
            var $ulOptions, $optgroupOptions;
            options = $.isArray(options) ? options : [options];
            $.each(options, $.proxy(function(index, option) {
                listHtml += this._renderListOption(option);
                selectHtml += this._renderOption(option);
            }, this));
            if ($.isNumeric(optgroupIndex) && optgroupIndex < this.$optgroupSet.length) {
                $destinationUl = this.$optgroupSet.eq(optgroupIndex);
                $destinationOptgroup = $('optgroup', this.$el).eq(optgroupIndex);
            }
            if ($.isNumeric(optionIndex)) {
                $ulOptions = $('.ik_select_option', $destinationUl);
                if (optionIndex < $ulOptions.length) {
                    $ulOptions.eq(optionIndex).before(listHtml);
                    $optgroupOptions = $('option', $destinationOptgroup);
                    $optgroupOptions.eq(optionIndex).before(selectHtml);
                }
            }
            if (!$optgroupOptions) {
                $destinationUl.append(listHtml);
                $destinationOptgroup.append(selectHtml);
            }
            this.$optionSet = $('.ik_select_option', this.$listInner);
            this._fixHeight();
        },
        addOptgroups: function(optgroups, optgroupIndex) {
            var listHtml = '',
                selectHtml = '';
            if (!optgroups) {
                return;
            }
            optgroups = $.isArray(optgroups) ? optgroups : [optgroups];
            $.each(optgroups, $.proxy(function(optgroupIndex, optgroup) {
                listHtml += this._renderListOptgroup(optgroup);
                selectHtml += this._renderOptgroup(optgroup);
            }, this));
            if ($.isNumeric(optgroupIndex) && optgroupIndex < this.$optgroupSet.length) {
                this.$optgroupSet.eq(optgroupIndex).before(listHtml);
                $('optgroup', this.$el).eq(optgroupIndex).before(selectHtml);
            } else {
                this.$listInnerUl.append(listHtml);
                this.$el.append(selectHtml);
            }
            this.$optgroupSet = $('.ik_select_optgroup', this.$listInner);
            this.$optionSet = $('.ik_select_option', this.$listInner);
            this._fixHeight();
        },
        removeOptions: function(optionIndexes, optgroupIndex) {
            var $removeList = $([]);
            var $listContext;
            var $selectContext;
            if ($.isNumeric(optgroupIndex)) {
                if (optgroupIndex < 0) {
                    $listContext = $('> .ik_select_option', this.$listInnerUl);
                    $selectContext = $('> option', this.$el);
                } else if (optgroupIndex < this.$optgroupSet.length) {
                    $listContext = $('.ik_select_option', this.$optgroupSet.eq(optgroupIndex));
                    $selectContext = $('optgroup', this.$el).eq(optgroupIndex).find('option');
                }
            }
            if (!$listContext) {
                $listContext = this.$optionSet;
                $selectContext = $(this.el.options);
            }
            if (!$.isArray(optionIndexes)) {
                optionIndexes = [optionIndexes];
            }
            $.each(optionIndexes, $.proxy(function(index, optionIndex) {
                if (optionIndex < $listContext.length) {
                    $removeList = $removeList.add($listContext.eq(optionIndex)).add($selectContext.eq(optionIndex));
                }
            }, this));
            $removeList.remove();
            this.$optionSet = $('.ik_select_option', this.$listInner);
            this._syncOriginalOption();
            this._fixHeight();
        },
        removeOptgroups: function(optgroupIndexes) {
            var $removeList = $([]);
            var $selectOptgroupSet = $('optgroup', this.el);
            if (!$.isArray(optgroupIndexes)) {
                optgroupIndexes = [optgroupIndexes];
            }
            $.each(optgroupIndexes, $.proxy(function(index, optgroupIndex) {
                if (optgroupIndex < this.$optgroupSet.length) {
                    $removeList = $removeList.add(this.$optgroupSet.eq(optgroupIndex)).add($selectOptgroupSet.eq(optgroupIndex));
                }
            }, this));
            $removeList.remove();
            this.$optionSet = $('.ik_select_option', this.$listInner);
            this.$optgroupSet = $('.ik_select_optgroup', this.$listInner);
            this._syncOriginalOption();
            this._fixHeight();
        },
        disable: function() {
            this.toggle(false);
        },
        enable: function() {
            this.toggle(true);
        },
        toggle: function(bool) {
            this.isDisabled = typeof bool !== 'undefined' ? !bool : !this.isDisabled;
            this.$el.prop('disabled', this.isDisabled);
            this.$link.toggleClass('ik_select_link_disabled', this.isDisabled);
        },
        select: function(value, isIndex) {
            if (!isIndex) {
                this.$el.val(value);
            } else {
                this.el.selectedIndex = value;
            }
            this._syncOriginalOption();
        },
        disableOptgroups: function(optgroupIndexes) {
            this.toggleOptgroups(optgroupIndexes, false);
        },
        enableOptgroups: function(optgroupIndexes) {
            this.toggleOptgroups(optgroupIndexes, true);
        },
        toggleOptgroups: function(optgroupIndexes, bool) {
            if (!$.isArray(optgroupIndexes)) {
                optgroupIndexes = [optgroupIndexes];
            }
            $.each(optgroupIndexes, $.proxy(function(index, optgroupIndex) {
                var isDisabled;
                var $optionSet, indexes = [],
                    indexFirst;
                var $optgroup = $('optgroup', this.$el).eq(optgroupIndex);
                isDisabled = typeof bool !== 'undefined' ? bool : $optgroup.prop('disabled');
                $optgroup.prop('disabled', !isDisabled);
                this.$optgroupSet.eq(optgroupIndex).toggleClass('ik_select_optgroup_disabled', !isDisabled);
                $optionSet = $('option', $optgroup);
                indexFirst = $(this.el.options).index($optionSet.eq(0));
                for (var i = indexFirst; i < indexFirst + $optionSet.length; i++) {
                    indexes.push(i);
                }
                this.toggleOptions(indexes, true, isDisabled);
            }, this));
            this._syncOriginalOption();
        },
        disableOptions: function(lookupValues, isIndex) {
            this.toggleOptions(lookupValues, isIndex, false);
        },
        enableOptions: function(lookupValues, isIndex) {
            this.toggleOptions(lookupValues, isIndex, true);
        },
        toggleOptions: function(lookupValues, isIndex, bool) {
            var $selectOptionSet = $('option', this.el);
            if (!$.isArray(lookupValues)) {
                lookupValues = [lookupValues];
            }
            var toggleOption = $.proxy(function($option, optionIndex) {
                var isDisabled = typeof bool !== 'undefined' ? bool : $option.prop('disabled');
                $option.prop('disabled', !isDisabled);
                this.$optionSet.eq(optionIndex).toggleClass('ik_select_option_disabled', !isDisabled);
            }, this);
            $.each(lookupValues, function(index, lookupValue) {
                if (!isIndex) {
                    $selectOptionSet.each(function(optionIndex, option) {
                        var $option = $(option);
                        if ($option.val() === lookupValue) {
                            toggleOption($option, optionIndex);
                            return this;
                        }
                    });
                } else {
                    toggleOption($selectOptionSet.eq(lookupValue), lookupValue);
                }
            });
            this._syncOriginalOption();
        },
        detach: function() {
            this.$el.off('.ikSelect').css({
                width: '',
                height: '',
                left: '',
                top: '',
                position: '',
                margin: '',
                padding: ''
            });
            this.$wrapper.before(this.$el);
            this.$wrapper.remove();
            this.$el.removeData('plugin_ikSelect');
        }
    });
    $.fn.ikSelect = function(options) {
        var args;
        if ($.browser.operamini) {
            return this;
        }
        args = Array.prototype.slice.call(arguments, 1);
        return this.each(function() {
            var plugin;
            if (!$.data(this, 'plugin_ikSelect')) {
                $.data(this, 'plugin_ikSelect', new IkSelect(this, options));
            } else if (typeof options === 'string') {
                plugin = $.data(this, 'plugin_ikSelect');
                if (typeof plugin[options] === 'function') {
                    plugin[options].apply(plugin, args);
                }
            }
        });
    };
    $.ikSelect = {
        extendDefaults: function(options) {
            $.extend(defaults, options);
        }
    };
    $(document).bind('click.ikSelect', function() {
        if (instOpened) {
            instOpened.hideDropdown();
        }
    });
})(jQuery, window, document); /* js/jquery.scrollbar.js */
(function($, doc, win) {
    'use strict';
    var debug = false;
    var lmb = 1,
        px = "px";
    var browser = {
        "data": {},
        "mobile": /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(win.navigator.userAgent),
        "scroll": null,
        "scrolls": [],
        "webkit": win.WebKitPoint ? true : false,
        "log": debug ? function(data, toString) {
            var output = data;
            if (toString && typeof data != "string") {
                output = [];
                $.each(data, function(i, v) {
                    output.push('"' + i + '": ' + v);
                });
                output = output.join(", ");
            }
            if (win.console && win.console.log) {
                win.console.log(output);
            } else {
                alert(output);
            }
        } : function() {}
    };
    var defaults = {
        "autoScrollSize": true,
        "autoUpdate": true,
        "debug": false,
        "disableBodyScroll": false,
        "duration": 200,
        "ignoreMobile": true,
        "scrollStep": 30,
        "showArrows": false,
        "stepScrolling": true,
        "type": "simple",
        "scrollx": null,
        "scrolly": null,
        "onDestroy": null,
        "onInit": null,
        "onScroll": null,
        "onUpdate": null
    };
    var customScrollbar = function(container, options) {
        if (!browser.scroll) {
            browser.log("Init jQuery Scrollbar v0.2.4");
            browser.scroll = getBrowserScrollSize();
            updateScrollbars();
            $(win).resize(function() {
                var forceUpdate = false;
                if (browser.scroll && (browser.scroll.height || browser.scroll.width)) {
                    var scroll = getBrowserScrollSize();
                    if (scroll.height != browser.scroll.height || scroll.width != browser.scroll.width) {
                        browser.scroll = scroll;
                        forceUpdate = true;
                    }
                }
                updateScrollbars(forceUpdate);
            });
        }
        this.container = container;
        this.options = $.extend({}, defaults, win.jQueryScrollbarOptions || {});
        this.scrollTo = null;
        this.scrollx = {};
        this.scrolly = {};
        this.init(options);
    };
    customScrollbar.prototype = {
        destroy: function() {
            if (!this.wrapper) {
                return;
            }
            var scrollLeft = this.container.scrollLeft();
            var scrollTop = this.container.scrollTop();
            this.container.insertBefore(this.wrapper).css({
                "height": "",
                "margin": ""
            }).removeClass("scroll-content").removeClass("scroll-scrollx_visible").removeClass("scroll-scrolly_visible").off(".scrollbar").scrollLeft(scrollLeft).scrollTop(scrollTop);
            this.scrollx.scrollbar.removeClass("scroll-scrollx_visible").find("div").andSelf().off(".scrollbar");
            this.scrolly.scrollbar.removeClass("scroll-scrolly_visible").find("div").andSelf().off(".scrollbar");
            this.wrapper.remove();
            $(doc).add("body").off(".scrollbar");
            if ($.isFunction(this.options.onDestroy))
                this.options.onDestroy.apply(this, [this.container]);
        },
        getScrollbar: function(d) {
            var scrollbar = this.options["scroll" + d];
            var html = {
                "advanced": '<div class="scroll-element_corner"></div>' + '<div class="scroll-arrow scroll-arrow_less"></div>' + '<div class="scroll-arrow scroll-arrow_more"></div>' + '<div class="scroll-element_outer">' + '    <div class="scroll-element_size"></div>' + '    <div class="scroll-element_inner-wrapper">' + '        <div class="scroll-element_inner scroll-element_track">' + '            <div class="scroll-element_inner-bottom"></div>' + '        </div>' + '    </div>' + '    <div class="scroll-bar">' + '        <div class="scroll-bar_body">' + '            <div class="scroll-bar_body-inner"></div>' + '        </div>' + '        <div class="scroll-bar_bottom"></div>' + '        <div class="scroll-bar_center"></div>' + '    </div>' + '</div>',
                "simple": '<div class="scroll-element_outer">' + '    <div class="scroll-element_size"></div>' + '    <div class="scroll-element_track"></div>' + '    <div class="scroll-bar"></div>' + '</div>'
            };
            var type = html[this.options.type] ? this.options.type : "advanced";
            if (scrollbar) {
                if (typeof(scrollbar) == "string") {
                    scrollbar = $(scrollbar).appendTo(this.wrapper);
                } else {
                    scrollbar = $(scrollbar);
                }
            } else {
                scrollbar = $("<div>").addClass("scroll-element").html(html[type]).appendTo(this.wrapper);
            }
            if (this.options.showArrows) {
                scrollbar.addClass("scroll-element_arrows_visible");
            }
            return scrollbar.addClass("scroll-" + d);
        },
        init: function(options) {
            var S = this;
            var c = this.container;
            var cw = this.containerWrapper || c;
            var o = $.extend(this.options, options || {});
            var s = {
                "x": this.scrollx,
                "y": this.scrolly
            };
            var w = this.wrapper;
            var initScroll = {
                "scrollLeft": c.scrollLeft(),
                "scrollTop": c.scrollTop()
            };
            if (browser.mobile && o.ignoreMobile) {
                return false;
            }
            if (!w) {
                this.wrapper = w = $('<div>').addClass('scroll-wrapper').addClass(c.attr('class')).css('position', c.css('position') == 'absolute' ? 'absolute' : 'relative').insertBefore(c).append(c);
                if (c.is('textarea')) {
                    this.containerWrapper = cw = $('<div>').insertBefore(c).append(c);
                    w.addClass('scroll-textarea');
                }
                cw.addClass("scroll-content").css({
                    "height": "",
                    "margin-bottom": browser.scroll.height * -1 + px,
                    "margin-right": browser.scroll.width * -1 + px
                });
                c.on("scroll.scrollbar", function(event) {
                    if ($.isFunction(o.onScroll)) {
                        o.onScroll.call(S, {
                            "maxScroll": s.y.maxScrollOffset,
                            "scroll": c.scrollTop(),
                            "size": s.y.size,
                            "visible": s.y.visible
                        }, {
                            "maxScroll": s.x.maxScrollOffset,
                            "scroll": c.scrollLeft(),
                            "size": s.x.size,
                            "visible": s.x.visible
                        });
                    }
                    s.x.isVisible && s.x.scroller.css("left", c.scrollLeft() * s.x.kx + px);
                    s.y.isVisible && s.y.scroller.css("top", c.scrollTop() * s.y.kx + px);
                });
                w.on("scroll", function() {
                    w.scrollTop(0).scrollLeft(0);
                });
                if (o.disableBodyScroll) {
                    var handleMouseScroll = function(event) {
                        isVerticalScroll(event) ? s.y.isVisible && s.y.mousewheel(event) : s.x.isVisible && s.x.mousewheel(event);
                    };
                    w.on({
                        "MozMousePixelScroll.scrollbar": handleMouseScroll,
                        "mousewheel.scrollbar": handleMouseScroll
                    });
                    if (browser.mobile) {
                        w.on("touchstart.scrollbar", function(event) {
                            var touch = event.originalEvent.touches && event.originalEvent.touches[0] || event;
                            var originalTouch = {
                                "pageX": touch.pageX,
                                "pageY": touch.pageY
                            };
                            var originalScroll = {
                                "left": c.scrollLeft(),
                                "top": c.scrollTop()
                            };
                            $(doc).on({
                                "touchmove.scrollbar": function(event) {
                                    var touch = event.originalEvent.targetTouches && event.originalEvent.targetTouches[0] || event;
                                    c.scrollLeft(originalScroll.left + originalTouch.pageX - touch.pageX);
                                    c.scrollTop(originalScroll.top + originalTouch.pageY - touch.pageY);
                                    event.preventDefault();
                                },
                                "touchend.scrollbar": function() {
                                    $(doc).off(".scrollbar");
                                }
                            });
                        });
                    }
                }
                if ($.isFunction(o.onInit))
                    o.onInit.apply(this, [c]);
            } else {
                cw.css({
                    "height": "",
                    "margin-bottom": browser.scroll.height * -1 + px,
                    "margin-right": browser.scroll.width * -1 + px
                });
            }
            $.each(s, function(d, scrollx) {
                var scrollCallback = null;
                var scrollForward = 1;
                var scrollOffset = (d == "x") ? "scrollLeft" : "scrollTop";
                var scrollStep = o.scrollStep;
                var scrollTo = function() {
                    var currentOffset = c[scrollOffset]();
                    c[scrollOffset](currentOffset + scrollStep);
                    if (scrollForward == 1 && (currentOffset + scrollStep) >= scrollToValue)
                        currentOffset = c[scrollOffset]();
                    if (scrollForward == -1 && (currentOffset + scrollStep) <= scrollToValue)
                        currentOffset = c[scrollOffset]();
                    if (c[scrollOffset]() == currentOffset && scrollCallback) {
                        scrollCallback();
                    }
                }
                var scrollToValue = 0;
                if (!scrollx.scrollbar) {
                    scrollx.scrollbar = S.getScrollbar(d);
                    scrollx.scroller = scrollx.scrollbar.find(".scroll-bar");
                    scrollx.mousewheel = function(event) {
                        if (!scrollx.isVisible || (d == 'x' && isVerticalScroll(event))) {
                            return true;
                        }
                        if (d == 'y' && !isVerticalScroll(event)) {
                            s.x.mousewheel(event);
                            return true;
                        }
                        var delta = event.originalEvent.wheelDelta * -1 || event.originalEvent.detail;
                        var maxScrollValue = scrollx.size - scrollx.visible - scrollx.offset;
                        if (!((scrollToValue <= 0 && delta < 0) || (scrollToValue >= maxScrollValue && delta > 0))) {
                            scrollToValue = scrollToValue + delta;
                            if (scrollToValue < 0)
                                scrollToValue = 0;
                            if (scrollToValue > maxScrollValue)
                                scrollToValue = maxScrollValue;
                            S.scrollTo = S.scrollTo || {};
                            S.scrollTo[scrollOffset] = scrollToValue;
                            setTimeout(function() {
                                if (S.scrollTo) {
                                    c.stop().animate(S.scrollTo, 240, 'linear', function() {
                                        scrollToValue = c[scrollOffset]();
                                    });
                                    S.scrollTo = null;
                                }
                            }, 1);
                        }
                        event.preventDefault();
                        return false;
                    };
                    scrollx.scrollbar.on({
                        "MozMousePixelScroll.scrollbar": scrollx.mousewheel,
                        "mousewheel.scrollbar": scrollx.mousewheel,
                        "mouseenter.scrollbar": function() {
                            scrollToValue = c[scrollOffset]();
                        }
                    });
                    scrollx.scrollbar.find(".scroll-arrow, .scroll-element_track").on("mousedown.scrollbar", function(event) {
                        if (event.which != lmb)
                            return true;
                        scrollForward = 1;
                        var data = {
                            "eventOffset": event[(d == "x") ? "pageX" : "pageY"],
                            "maxScrollValue": scrollx.size - scrollx.visible - scrollx.offset,
                            "scrollbarOffset": scrollx.scroller.offset()[(d == "x") ? "left" : "top"],
                            "scrollbarSize": scrollx.scroller[(d == "x") ? "outerWidth" : "outerHeight"]()
                        };
                        var timeout = 0,
                            timer = 0;
                        if ($(this).hasClass('scroll-arrow')) {
                            scrollForward = $(this).hasClass("scroll-arrow_more") ? 1 : -1;
                            scrollStep = o.scrollStep * scrollForward;
                            scrollToValue = scrollForward > 0 ? data.maxScrollValue : 0;
                        } else {
                            scrollForward = (data.eventOffset > (data.scrollbarOffset + data.scrollbarSize) ? 1 : (data.eventOffset < data.scrollbarOffset ? -1 : 0));
                            scrollStep = Math.round(scrollx.visible * 0.75) * scrollForward;
                            scrollToValue = (data.eventOffset - data.scrollbarOffset -
                                (o.stepScrolling ? (scrollForward == 1 ? data.scrollbarSize : 0) : Math.round(data.scrollbarSize / 2)));
                            scrollToValue = c[scrollOffset]() + (scrollToValue / scrollx.kx);
                        }
                        S.scrollTo = S.scrollTo || {};
                        S.scrollTo[scrollOffset] = o.stepScrolling ? c[scrollOffset]() + scrollStep : scrollToValue;
                        if (o.stepScrolling) {
                            scrollCallback = function() {
                                scrollToValue = c[scrollOffset]();
                                clearInterval(timer);
                                clearTimeout(timeout);
                                timeout = 0;
                                timer = 0;
                            };
                            timeout = setTimeout(function() {
                                timer = setInterval(scrollTo, 40);
                            }, o.duration + 100);
                        }
                        setTimeout(function() {
                            if (S.scrollTo) {
                                c.animate(S.scrollTo, o.duration);
                                S.scrollTo = null;
                            }
                        }, 1);
                        return handleMouseDown(scrollCallback, event);
                    });
                    scrollx.scroller.on("mousedown.scrollbar", function(event) {
                        if (event.which != lmb)
                            return true;
                        var eventPosition = event[(d == "x") ? "pageX" : "pageY"];
                        var initOffset = c[scrollOffset]();
                        scrollx.scrollbar.addClass("scroll-draggable");
                        $(doc).on("mousemove.scrollbar", function(event) {
                            var diff = parseInt((event[(d == "x") ? "pageX" : "pageY"] - eventPosition) / scrollx.kx, 10);
                            c[scrollOffset](initOffset + diff);
                        });
                        return handleMouseDown(function() {
                            scrollx.scrollbar.removeClass("scroll-draggable");
                            scrollToValue = c[scrollOffset]();
                        }, event);
                    });
                }
            });
            $.each(s, function(d, scrollx) {
                var scrollClass = "scroll-scroll" + d + "_visible";
                var scrolly = (d == "x") ? s.y : s.x;
                scrollx.scrollbar.removeClass(scrollClass);
                scrolly.scrollbar.removeClass(scrollClass);
                cw.removeClass(scrollClass);
            });
            $.each(s, function(d, scrollx) {
                $.extend(scrollx, (d == "x") ? {
                    "offset": parseInt(c.css("left"), 10) || 0,
                    "size": c.prop("scrollWidth"),
                    "visible": w.width()
                } : {
                    "offset": parseInt(c.css("top"), 10) || 0,
                    "size": c.prop("scrollHeight"),
                    "visible": w.height()
                });
            });
            var updateScroll = function(d, scrollx) {
                var scrollClass = "scroll-scroll" + d + "_visible";
                var scrolly = (d == "x") ? s.y : s.x;
                var offset = parseInt(c.css((d == "x") ? "left" : "top"), 10) || 0;
                var AreaSize = scrollx.size;
                var AreaVisible = scrollx.visible + offset;
                scrollx.isVisible = (AreaSize - AreaVisible) > 1;
                if (scrollx.isVisible) {
                    scrollx.scrollbar.addClass(scrollClass);
                    scrolly.scrollbar.addClass(scrollClass);
                    cw.addClass(scrollClass);
                } else {
                    scrollx.scrollbar.removeClass(scrollClass);
                    scrolly.scrollbar.removeClass(scrollClass);
                    cw.removeClass(scrollClass);
                }
                if (d == "y" && (scrollx.isVisible || scrollx.size < scrollx.visible)) {
                    cw.css("height", (AreaVisible + browser.scroll.height) + px);
                }
                if (s.x.size != c.prop("scrollWidth") || s.y.size != c.prop("scrollHeight") || s.x.visible != w.width() || s.y.visible != w.height() || s.x.offset != (parseInt(c.css("left"), 10) || 0) || s.y.offset != (parseInt(c.css("top"), 10) || 0)) {
                    $.each(s, function(d, scrollx) {
                        $.extend(scrollx, (d == "x") ? {
                            "offset": parseInt(c.css("left"), 10) || 0,
                            "size": c.prop("scrollWidth"),
                            "visible": w.width()
                        } : {
                            "offset": parseInt(c.css("top"), 10) || 0,
                            "size": c.prop("scrollHeight"),
                            "visible": w.height()
                        });
                    });
                    updateScroll(d == "x" ? "y" : "x", scrolly);
                }
            };
            $.each(s, updateScroll);
            if ($.isFunction(o.onUpdate))
                o.onUpdate.apply(this, [c]);
            $.each(s, function(d, scrollx) {
                var cssOffset = (d == "x") ? "left" : "top";
                var cssFullSize = (d == "x") ? "outerWidth" : "outerHeight";
                var cssSize = (d == "x") ? "width" : "height";
                var offset = parseInt(c.css(cssOffset), 10) || 0;
                var AreaSize = scrollx.size;
                var AreaVisible = scrollx.visible + offset;
                var scrollSize = scrollx.scrollbar.find(".scroll-element_size");
                scrollSize = scrollSize[cssFullSize]() + (parseInt(scrollSize.css(cssOffset), 10) || 0);
                if (o.autoScrollSize) {
                    scrollx.scrollbarSize = parseInt(scrollSize * AreaVisible / AreaSize, 10);
                    scrollx.scroller.css(cssSize, scrollx.scrollbarSize + px);
                }
                scrollx.scrollbarSize = scrollx.scroller[cssFullSize]();
                scrollx.kx = ((scrollSize - scrollx.scrollbarSize) / (AreaSize - AreaVisible)) || 1;
                scrollx.maxScrollOffset = AreaSize - AreaVisible;
            });
            c.scrollLeft(initScroll.scrollLeft).scrollTop(initScroll.scrollTop).trigger("scroll");
        }
    };
    $.fn.scrollbar = function(options, args) {
        var toReturn = this;
        if (options === "get")
            toReturn = null;
        this.each(function() {
            var container = $(this);
            if (container.hasClass("scroll-wrapper") || container.get(0).nodeName == "body") {
                return true;
            }
            var instance = container.data("scrollbar");
            if (instance) {
                if (options === "get") {
                    toReturn = instance;
                    return false;
                }
                var func = (typeof options == "string" && instance[options]) ? options : "init";
                instance[func].apply(instance, $.isArray(args) ? args : []);
                if (options === "destroy") {
                    container.removeData("scrollbar");
                    while ($.inArray(instance, browser.scrolls) >= 0)
                        browser.scrolls.splice($.inArray(instance, browser.scrolls), 1);
                }
            } else {
                if (typeof options != "string") {
                    instance = new customScrollbar(container, options);
                    container.data("scrollbar", instance);
                    browser.scrolls.push(instance);
                }
            }
            return true;
        });
        return toReturn;
    };
    $.fn.scrollbar.options = defaults;
    if (win.angular) {
        (function(angular) {
            var app = angular.module('jQueryScrollbar', []);
            app.directive('jqueryScrollbar', function() {
                return {
                    "link": function(scope, element) {
                        element.scrollbar(scope.options).on('$destroy', function() {
                            element.scrollbar('destroy');
                        });
                    },
                    "restring": "AC",
                    "scope": {
                        "options": "=jqueryScrollbar"
                    }
                };
            });
        })(win.angular);
    }
    var timer = 0,
        timerCounter = 0;
    var updateScrollbars = function(force) {
        var i, c, o, s, w, x, y;
        for (i = 0; i < browser.scrolls.length; i++) {
            s = browser.scrolls[i];
            c = s.container;
            o = s.options;
            w = s.wrapper;
            x = s.scrollx;
            y = s.scrolly;
            if (force || (o.autoUpdate && w && w.is(":visible") && (c.prop("scrollWidth") != x.size || c.prop("scrollHeight") != y.size || w.width() != x.visible || w.height() != y.visible))) {
                s.init();
                if (debug) {
                    browser.log({
                        "scrollHeight": c.prop("scrollHeight") + ":" + s.scrolly.size,
                        "scrollWidth": c.prop("scrollWidth") + ":" + s.scrollx.size,
                        "visibleHeight": w.height() + ":" + s.scrolly.visible,
                        "visibleWidth": w.width() + ":" + s.scrollx.visible
                    }, true);
                    timerCounter++;
                }
            }
        }
        if (debug && timerCounter > 10) {
            browser.log("Scroll updates exceed 10");
            updateScrollbars = function() {};
        } else {
            clearTimeout(timer);
            timer = setTimeout(updateScrollbars, 300);
        }
    };

    function getBrowserScrollSize() {
        if (browser.webkit) {
            return {
                "height": 0,
                "width": 0
            };
        }
        if (!browser.data.outer) {
            var css = {
                "border": "none",
                "box-sizing": "content-box",
                "height": "200px",
                "margin": "0",
                "padding": "0",
                "width": "200px"
            };
            browser.data.inner = $("<div>").css($.extend({}, css));
            browser.data.outer = $("<div>").css($.extend({
                "left": "-1000px",
                "overflow": "scroll",
                "position": "absolute",
                "top": "-1000px"
            }, css)).append(browser.data.inner).appendTo("body");
        }
        browser.data.outer.scrollLeft(1000).scrollTop(1000);
        return {
            "height": Math.ceil((browser.data.outer.offset().top - browser.data.inner.offset().top) || 0),
            "width": Math.ceil((browser.data.outer.offset().left - browser.data.inner.offset().left) || 0)
        };
    }

    function handleMouseDown(callback, event) {
        $(doc).on({
            "blur.scrollbar": function() {
                $(doc).add('body').off('.scrollbar');
                callback && callback();
            },
            "dragstart.scrollbar": function(event) {
                event.preventDefault();
                return false;
            },
            "mouseup.scrollbar": function() {
                $(doc).add('body').off('.scrollbar');
                callback && callback();
            }
        });
        $("body").on({
            "selectstart.scrollbar": function(event) {
                event.preventDefault();
                return false;
            }
        });
        event && event.preventDefault();
        return false;
    }

    function isVerticalScroll(event) {
        var e = event.originalEvent;
        if (e.axis && e.axis === e.HORIZONTAL_AXIS)
            return false;
        if (e.wheelDeltaX)
            return false;
        return true;
    }
})(jQuery, document, window); /* js/jGrowl-1.3.0/jquery.jgrowl.min.js */
! function(a) {
    var b = function() {
        return !1 === a.support.boxModel && a.support.objectAll && a.support.leadingWhitespace
    }();
    a.jGrowl = function(b, c) {
        0 === a("#jGrowl").size() && a('<div id="jGrowl"></div>').addClass(c && c.position ? c.position : a.jGrowl.defaults.position).appendTo("body"), a("#jGrowl").jGrowl(b, c)
    }, a.fn.jGrowl = function(b, c) {
        if (a.isFunction(this.each)) {
            var d = arguments;
            return this.each(function() {
                void 0 === a(this).data("jGrowl.instance") && (a(this).data("jGrowl.instance", a.extend(new a.fn.jGrowl, {
                    notifications: [],
                    element: null,
                    interval: null
                })), a(this).data("jGrowl.instance").startup(this)), a.isFunction(a(this).data("jGrowl.instance")[b]) ? a(this).data("jGrowl.instance")[b].apply(a(this).data("jGrowl.instance"), a.makeArray(d).slice(1)) : a(this).data("jGrowl.instance").create(b, c)
            })
        }
    }, a.extend(a.fn.jGrowl.prototype, {
        defaults: {
            pool: 0,
            header: "",
            group: "",
            sticky: !1,
            position: "top-right",
            glue: "after",
            theme: "default",
            themeState: "highlight",
            corners: "10px",
            check: 250,
            life: 3e3,
            closeDuration: "normal",
            openDuration: "normal",
            easing: "swing",
            closer: !0,
            closeTemplate: "&times;",
            closerTemplate: "<div>[ close all ]</div>",
            log: function() {},
            beforeOpen: function() {},
            afterOpen: function() {},
            open: function() {},
            beforeClose: function() {},
            close: function() {},
            animateOpen: {
                opacity: "show"
            },
            animateClose: {
                opacity: "hide"
            }
        },
        notifications: [],
        element: null,
        interval: null,
        create: function(b, c) {
            var d = a.extend({}, this.defaults, c);
            "undefined" != typeof d.speed && (d.openDuration = d.speed, d.closeDuration = d.speed), this.notifications.push({
                message: b,
                options: d
            }), d.log.apply(this.element, [this.element, b, d])
        },
        render: function(b) {
            var c = this,
                d = b.message,
                e = b.options;
            e.themeState = "" === e.themeState ? "" : "ui-state-" + e.themeState;
            var f = a("<div/>").addClass("jGrowl-notification " + e.themeState + " ui-corner-all" + (void 0 !== e.group && "" !== e.group ? " " + e.group : "")).append(a("<div/>").addClass("jGrowl-close").html(e.closeTemplate)).append(a("<div/>").addClass("jGrowl-header").html(e.header)).append(a("<div/>").addClass("jGrowl-message").html(d)).data("jGrowl", e).addClass(e.theme).children("div.jGrowl-close").bind("click.jGrowl", function() {
                a(this).parent().trigger("jGrowl.beforeClose")
            }).parent();
            a(f).bind("mouseover.jGrowl", function() {
                a("div.jGrowl-notification", c.element).data("jGrowl.pause", !0)
            }).bind("mouseout.jGrowl", function() {
                a("div.jGrowl-notification", c.element).data("jGrowl.pause", !1)
            }).bind("jGrowl.beforeOpen", function() {
                e.beforeOpen.apply(f, [f, d, e, c.element]) !== !1 && a(this).trigger("jGrowl.open")
            }).bind("jGrowl.open", function() {
                e.open.apply(f, [f, d, e, c.element]) !== !1 && ("after" == e.glue ? a("div.jGrowl-notification:last", c.element).after(f) : a("div.jGrowl-notification:first", c.element).before(f), a(this).animate(e.animateOpen, e.openDuration, e.easing, function() {
                    a.support.opacity === !1 && this.style.removeAttribute("filter"), null !== a(this).data("jGrowl") && (a(this).data("jGrowl").created = new Date), a(this).trigger("jGrowl.afterOpen")
                }))
            }).bind("jGrowl.afterOpen", function() {
                e.afterOpen.apply(f, [f, d, e, c.element])
            }).bind("jGrowl.beforeClose", function() {
                e.beforeClose.apply(f, [f, d, e, c.element]) !== !1 && a(this).trigger("jGrowl.close")
            }).bind("jGrowl.close", function() {
                a(this).data("jGrowl.pause", !0), a(this).animate(e.animateClose, e.closeDuration, e.easing, function() {
                    a.isFunction(e.close) ? e.close.apply(f, [f, d, e, c.element]) !== !1 && a(this).remove() : a(this).remove()
                })
            }).trigger("jGrowl.beforeOpen"), "" !== e.corners && void 0 !== a.fn.corner && a(f).corner(e.corners), a("div.jGrowl-notification:parent", c.element).size() > 1 && 0 === a("div.jGrowl-closer", c.element).size() && this.defaults.closer !== !1 && a(this.defaults.closerTemplate).addClass("jGrowl-closer " + this.defaults.themeState + " ui-corner-all").addClass(this.defaults.theme).appendTo(c.element).animate(this.defaults.animateOpen, this.defaults.speed, this.defaults.easing).bind("click.jGrowl", function() {
                a(this).siblings().trigger("jGrowl.beforeClose"), a.isFunction(c.defaults.closer) && c.defaults.closer.apply(a(this).parent()[0], [a(this).parent()[0]])
            })
        },
        update: function() {
            a(this.element).find("div.jGrowl-notification:parent").each(function() {
                void 0 !== a(this).data("jGrowl") && void 0 !== a(this).data("jGrowl").created && a(this).data("jGrowl").created.getTime() + parseInt(a(this).data("jGrowl").life, 10) < (new Date).getTime() && a(this).data("jGrowl").sticky !== !0 && (void 0 === a(this).data("jGrowl.pause") || a(this).data("jGrowl.pause") !== !0) && a(this).trigger("jGrowl.beforeClose")
            }), this.notifications.length > 0 && (0 === this.defaults.pool || a(this.element).find("div.jGrowl-notification:parent").size() < this.defaults.pool) && this.render(this.notifications.shift()), a(this.element).find("div.jGrowl-notification:parent").size() < 2 && a(this.element).find("div.jGrowl-closer").animate(this.defaults.animateClose, this.defaults.speed, this.defaults.easing, function() {
                a(this).remove()
            })
        },
        startup: function(c) {
            this.element = a(c).addClass("jGrowl").append('<div class="jGrowl-notification"></div>'), this.interval = setInterval(function() {
                a(c).data("jGrowl.instance").update()
            }, parseInt(this.defaults.check, 10)), b && a(this.element).addClass("ie6")
        },
        shutdown: function() {
            a(this.element).removeClass("jGrowl").find("div.jGrowl-notification").trigger("jGrowl.close").parent().empty(), clearInterval(this.interval)
        },
        close: function() {
            a(this.element).find("div.jGrowl-notification").each(function() {
                a(this).trigger("jGrowl.beforeClose")
            })
        }
    }), a.jGrowl.defaults = a.fn.jGrowl.prototype.defaults
}(jQuery); /* js/purl.js */
(function(factory) {
    if (typeof define === 'function' && define.amd) {
        define(factory);
    } else {
        window.purl = factory();
    }
})(function() {
    var tag2attr = {
            a: 'href',
            img: 'src',
            form: 'action',
            base: 'href',
            script: 'src',
            iframe: 'src',
            link: 'href',
            embed: 'src',
            object: 'data'
        },
        key = ['source', 'protocol', 'authority', 'userInfo', 'user', 'password', 'host', 'port', 'relative', 'path', 'directory', 'file', 'query', 'fragment'],
        aliases = {
            'anchor': 'fragment'
        },
        parser = {
            strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
            loose: /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
        },
        isint = /^[0-9]+$/;

    function parseUri(url, strictMode) {
        var str = decodeURI(url),
            res = parser[strictMode || false ? 'strict' : 'loose'].exec(str),
            uri = {
                attr: {},
                param: {},
                seg: {}
            },
            i = 14;
        while (i--) {
            uri.attr[key[i]] = res[i] || '';
        }
        uri.param['query'] = parseString(uri.attr['query']);
        uri.param['fragment'] = parseString(uri.attr['fragment']);
        uri.seg['path'] = uri.attr.path.replace(/^\/+|\/+$/g, '').split('/');
        uri.seg['fragment'] = uri.attr.fragment.replace(/^\/+|\/+$/g, '').split('/');
        uri.attr['base'] = uri.attr.host ? (uri.attr.protocol ? uri.attr.protocol + '://' + uri.attr.host : uri.attr.host) + (uri.attr.port ? ':' + uri.attr.port : '') : '';
        return uri;
    }

    function getAttrName(elm) {
        var tn = elm.tagName;
        if (typeof tn !== 'undefined') return tag2attr[tn.toLowerCase()];
        return tn;
    }

    function promote(parent, key) {
        if (parent[key].length === 0) return parent[key] = {};
        var t = {};
        for (var i in parent[key]) t[i] = parent[key][i];
        parent[key] = t;
        return t;
    }

    function parse(parts, parent, key, val) {
        var part = parts.shift();
        if (!part) {
            if (isArray(parent[key])) {
                parent[key].push(val);
            } else if ('object' == typeof parent[key]) {
                parent[key] = val;
            } else if ('undefined' == typeof parent[key]) {
                parent[key] = val;
            } else {
                parent[key] = [parent[key], val];
            }
        } else {
            var obj = parent[key] = parent[key] || [];
            if (']' == part) {
                if (isArray(obj)) {
                    if ('' !== val) obj.push(val);
                } else if ('object' == typeof obj) {
                    obj[keys(obj).length] = val;
                } else {
                    obj = parent[key] = [parent[key], val];
                }
            } else if (~part.indexOf(']')) {
                part = part.substr(0, part.length - 1);
                if (!isint.test(part) && isArray(obj)) obj = promote(parent, key);
                parse(parts, obj, part, val);
            } else {
                if (!isint.test(part) && isArray(obj)) obj = promote(parent, key);
                parse(parts, obj, part, val);
            }
        }
    }

    function merge(parent, key, val) {
        if (~key.indexOf(']')) {
            var parts = key.split('[');
            parse(parts, parent, 'base', val);
        } else {
            if (!isint.test(key) && isArray(parent.base)) {
                var t = {};
                for (var k in parent.base) t[k] = parent.base[k];
                parent.base = t;
            }
            if (key !== '') {
                set(parent.base, key, val);
            }
        }
        return parent;
    }

    function parseString(str) {
        return reduce(String(str).split(/&|;/), function(ret, pair) {
            try {
                pair = decodeURIComponent(pair.replace(/\+/g, ' '));
            } catch (e) {}
            var eql = pair.indexOf('='),
                brace = lastBraceInKey(pair),
                key = pair.substr(0, brace || eql),
                val = pair.substr(brace || eql, pair.length);
            val = val.substr(val.indexOf('=') + 1, val.length);
            if (key === '') {
                key = pair;
                val = '';
            }
            return merge(ret, key, val);
        }, {
            base: {}
        }).base;
    }

    function set(obj, key, val) {
        var v = obj[key];
        if (typeof v === 'undefined') {
            obj[key] = val;
        } else if (isArray(v)) {
            v.push(val);
        } else {
            obj[key] = [v, val];
        }
    }

    function lastBraceInKey(str) {
        var len = str.length,
            brace, c;
        for (var i = 0; i < len; ++i) {
            c = str[i];
            if (']' == c) brace = false;
            if ('[' == c) brace = true;
            if ('=' == c && !brace) return i;
        }
    }

    function reduce(obj, accumulator) {
        var i = 0,
            l = obj.length >> 0,
            curr = arguments[2];
        while (i < l) {
            if (i in obj) curr = accumulator.call(undefined, curr, obj[i], i, obj);
            ++i;
        }
        return curr;
    }

    function isArray(vArg) {
        return Object.prototype.toString.call(vArg) === "[object Array]";
    }

    function keys(obj) {
        var key_array = [];
        for (var prop in obj) {
            if (obj.hasOwnProperty(prop)) key_array.push(prop);
        }
        return key_array;
    }

    function purl(url, strictMode) {
        if (arguments.length === 1 && url === true) {
            strictMode = true;
            url = undefined;
        }
        strictMode = strictMode || false;
        url = url || window.location.toString();
        return {
            data: parseUri(url, strictMode),
            attr: function(attr) {
                attr = aliases[attr] || attr;
                return typeof attr !== 'undefined' ? this.data.attr[attr] : this.data.attr;
            },
            param: function(param) {
                return typeof param !== 'undefined' ? this.data.param.query[param] : this.data.param.query;
            },
            fparam: function(param) {
                return typeof param !== 'undefined' ? this.data.param.fragment[param] : this.data.param.fragment;
            },
            segment: function(seg) {
                if (typeof seg === 'undefined') {
                    return this.data.seg.path;
                } else {
                    seg = seg < 0 ? this.data.seg.path.length + seg : seg - 1;
                    return this.data.seg.path[seg];
                }
            },
            fsegment: function(seg) {
                if (typeof seg === 'undefined') {
                    return this.data.seg.fragment;
                } else {
                    seg = seg < 0 ? this.data.seg.fragment.length + seg : seg - 1;
                    return this.data.seg.fragment[seg];
                }
            }
        };
    }
    purl.jQuery = function($) {
        if ($ != null) {
            $.fn.url = function(strictMode) {
                var url = '';
                if (this.length) {
                    url = $(this).attr(getAttrName(this[0])) || '';
                }
                return purl(url, strictMode);
            };
            $.url = purl;
        }
    };
    purl.jQuery(window.jQuery);
    return purl;
}); /* js/ui.datepicker.js */
(function($) {
    function Datepicker() {
        this.debug = false;
        this._nextId = 0;
        this._inst = [];
        this._curInst = null;
        this._disabledInputs = [];
        this._datepickerShowing = false;
        this._inDialog = false;
        this.regional = [];
        this.regional[''] = {
            clearText: 'Очистить',
            clearStatus: 'Стереть текущую дату',
            closeText: 'Закрыть',
            closeStatus: 'Закрыть без сохранения',
            prevText: '&#x3c;Пред',
            prevStatus: 'Предыдущий месяц',
            nextText: 'След&#x3e;',
            nextStatus: 'Следующий месяц',
            currentText: 'Сегодня',
            currentStatus: 'Текущий месяц',
            monthNames: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
            monthNamesShort: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'],
            monthStatus: 'Показать другой месяц',
            yearStatus: 'Показать другой год',
            weekHeader: 'Нед',
            weekStatus: 'Неделя года',
            dayNames: ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'],
            dayNamesShort: ['Вск', 'Пнд', 'Втр', 'Срд', 'Чтв', 'Птн', 'Сбт'],
            dayNamesMin: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
            dayStatus: 'Установить первым днем недели',
            dateStatus: 'Выбрать день, месяц, год',
            dateFormat: 'dd.mm.yy',
            firstDay: 1,
            initStatus: 'Выбрать дату',
            isRTL: false
        };
        this._defaults = {
            showOn: 'focus',
            showAnim: 'show',
            defaultDate: null,
            appendText: '',
            buttonText: '...',
            buttonImage: '',
            buttonImageOnly: false,
            closeAtTop: true,
            mandatory: false,
            hideIfNoPrevNext: false,
            changeMonth: true,
            changeYear: true,
            yearRange: '-10:+10',
            changeFirstDay: true,
            showOtherMonths: false,
            showWeeks: false,
            calculateWeek: this.iso8601Week,
            shortYearCutoff: '+10',
            showStatus: false,
            statusForDate: this.dateStatus,
            minDate: null,
            maxDate: null,
            speed: 'medium',
            beforeShowDay: null,
            beforeShow: null,
            onSelect: null,
            numberOfMonths: 1,
            stepMonths: 1,
            rangeSelect: false,
            rangeSeparator: ' - '
        };
        $.extend(this._defaults, this.regional['']);
        this._datepickerDiv = $('<div id="datepicker_div"></div>');
    }
    $.extend(Datepicker.prototype, {
        markerClassName: 'hasDatepicker',
        log: function() {
            if (this.debug) {
                console.log.apply('', arguments);
            }
        },
        _register: function(inst) {
            var id = this._nextId++;
            this._inst[id] = inst;
            return id;
        },
        _getInst: function(id) {
            return this._inst[id] || id;
        },
        setDefaults: function(settings) {
            extendRemove(this._defaults, settings || {});
            return this;
        },
        _doKeyDown: function(e) {
            var inst = $.datepicker._getInst(this._calId);
            if ($.datepicker._datepickerShowing) {
                switch (e.keyCode) {
                    case 9:
                        $.datepicker.hideDatepicker('');
                        break;
                    case 13:
                        $.datepicker._selectDay(inst, inst._selectedMonth, inst._selectedYear, $('td.datepicker_daysCellOver', inst._datepickerDiv)[0]);
                        return false;
                        break;
                    case 27:
                        $.datepicker.hideDatepicker(inst._get('speed'));
                        break;
                    case 33:
                        $.datepicker._adjustDate(inst, (e.ctrlKey ? -1 : -inst._get('stepMonths')), (e.ctrlKey ? 'Y' : 'M'));
                        break;
                    case 34:
                        $.datepicker._adjustDate(inst, (e.ctrlKey ? +1 : +inst._get('stepMonths')), (e.ctrlKey ? 'Y' : 'M'));
                        break;
                    case 35:
                        if (e.ctrlKey) $.datepicker._clearDate(inst);
                        break;
                    case 36:
                        if (e.ctrlKey) $.datepicker._gotoToday(inst);
                        break;
                    case 37:
                        if (e.ctrlKey) $.datepicker._adjustDate(inst, -1, 'D');
                        break;
                    case 38:
                        if (e.ctrlKey) $.datepicker._adjustDate(inst, -7, 'D');
                        break;
                    case 39:
                        if (e.ctrlKey) $.datepicker._adjustDate(inst, +1, 'D');
                        break;
                    case 40:
                        if (e.ctrlKey) $.datepicker._adjustDate(inst, +7, 'D');
                        break;
                }
            } else if (e.keyCode == 36 && e.ctrlKey) {
                $.datepicker.showFor(this);
            }
        },
        _doKeyPress: function(e) {
            var inst = $.datepicker._getInst(this._calId);
            var chars = $.datepicker._possibleChars(inst._get('dateFormat'));
            var chr = String.fromCharCode(e.charCode == undefined ? e.keyCode : e.charCode);
            return (chr < ' ' || !chars || chars.indexOf(chr) > -1);
        },
        _connectDatepicker: function(target, inst) {
            var input = $(target);
            if (this._hasClass(input, this.markerClassName)) {
                return;
            }
            var appendText = inst._get('appendText');
            var isRTL = inst._get('isRTL');
            if (appendText) {
                if (isRTL) {
                    input.before('<span class="datepicker_append">' + appendText + '</span>');
                } else {
                    input.after('<span class="datepicker_append">' + appendText + '</span>');
                }
            }
            var showOn = inst._get('showOn');
            if (showOn == 'focus' || showOn == 'both') {
                input.focus(this.showFor);
            }
            if (showOn == 'button' || showOn == 'both') {
                var buttonText = inst._get('buttonText');
                var buttonImage = inst._get('buttonImage');
                var buttonImageOnly = inst._get('buttonImageOnly');
                var trigger = $(buttonImageOnly ? '<img class="datepicker_trigger" src="' +
                    buttonImage + '" alt="' + buttonText + '" title="' + buttonText + '"/>' : '<button type="button" class="datepicker_trigger">' + (buttonImage != '' ? '<img src="' + buttonImage + '" alt="' + buttonText + '" title="' + buttonText + '"/>' : buttonText) + '</button>');
                input.wrap('<span class="datepicker_wrap"></span>');
                if (isRTL) {
                    input.before(trigger);
                } else {
                    input.after(trigger);
                }
                trigger.click(this.showFor);
            }
            input.addClass(this.markerClassName).keydown(this._doKeyDown).keypress(this._doKeyPress);
            input[0]._calId = inst._id;
        },
        _inlineDatepicker: function(target, inst) {
            var input = $(target);
            if (this._hasClass(input, this.markerClassName)) {
                return;
            }
            input.addClass(this.markerClassName).append(inst._datepickerDiv);
            input[0]._calId = inst._id;
            this._updateDatepicker(inst);
        },
        _inlineShow: function(inst) {
            var numMonths = inst._getNumberOfMonths();
            inst._datepickerDiv.width(numMonths[1] * $('.datepicker', inst._datepickerDiv[0]).width());
        },
        _hasClass: function(element, className) {
            var classes = element.attr('class');
            return (classes && classes.indexOf(className) > -1);
        },
        dialogDatepicker: function(dateText, onSelect, settings, pos) {
            var inst = this._dialogInst;
            if (!inst) {
                inst = this._dialogInst = new DatepickerInstance({}, false);
                this._dialogInput = $('<input type="text" size="1" style="position: absolute; top: -100px;"/>');
                this._dialogInput.keydown(this._doKeyDown);
                $('body').append(this._dialogInput);
                this._dialogInput[0]._calId = inst._id;
            }
            extendRemove(inst._settings, settings || {});
            this._dialogInput.val(dateText);
            this._pos = (pos ? (pos.length ? pos : [pos.pageX, pos.pageY]) : null);
            if (!this._pos) {
                var browserWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
                var browserHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
                var scrollX = document.documentElement.scrollLeft || document.body.scrollLeft;
                var scrollY = document.documentElement.scrollTop || document.body.scrollTop;
                this._pos = [(browserWidth / 2) - 100 + scrollX, (browserHeight / 2) - 150 + scrollY];
            }
            this._dialogInput.css('left', this._pos[0] + 'px').css('top', this._pos[1] + 'px');
            inst._settings.onSelect = onSelect;
            this._inDialog = true;
            this._datepickerDiv.addClass('datepicker_dialog');
            this.showFor(this._dialogInput[0]);
            if ($.blockUI) {
                $.blockUI(this._datepickerDiv);
            }
            return this;
        },
        showFor: function(control) {
            control = (control.jquery ? control[0] : (typeof control == 'string' ? $(control)[0] : control));
            var input = (control.nodeName && control.nodeName.toLowerCase() == 'input' ? control : this);
            if (input.nodeName.toLowerCase() != 'input') {
                input = $('input', input.parentNode)[0];
            }
            if ($.datepicker._lastInput == input) {
                return;
            }
            if ($(input).isDisabledDatepicker()) {
                return;
            }
            var inst = $.datepicker._getInst(input._calId);
            var beforeShow = inst._get('beforeShow');
            extendRemove(inst._settings, (beforeShow ? beforeShow.apply(input, [input, inst]) : {}));
            $.datepicker.hideDatepicker('');
            $.datepicker._lastInput = input;
            inst._setDateFromField(input);
            if ($.datepicker._inDialog) {
                input.value = '';
            }
            if (!$.datepicker._pos) {
                $.datepicker._pos = $.datepicker._findPos(input);
                $.datepicker._pos[1] += input.offsetHeight;
            }
            var isFixed = false;
            $(input).parents().each(function() {
                isFixed |= $(this).css('position') == 'fixed';
            });
            if (isFixed && $.browser.opera) {
                $.datepicker._pos[0] -= document.documentElement.scrollLeft;
                $.datepicker._pos[1] -= document.documentElement.scrollTop;
            }
            inst._datepickerDiv.css('position', ($.datepicker._inDialog && $.blockUI ? 'static' : (isFixed ? 'fixed' : 'absolute'))).css('left', $.datepicker._pos[0] + 'px').css('top', $.datepicker._pos[1] + 'px');
            $.datepicker._pos = null;
            $.datepicker._showDatepicker(inst);
            return this;
        },
        _showDatepicker: function(id) {
            var inst = this._getInst(id);
            inst._rangeStart = null;
            this._updateDatepicker(inst);
            if (!inst._inline) {
                var speed = inst._get('speed');
                var postProcess = function() {
                    $.datepicker._datepickerShowing = true;
                    $.datepicker._afterShow(inst);
                };
                var showAnim = inst._get('showAnim') || 'show';
                inst._datepickerDiv[showAnim](speed, postProcess);
                if (speed == '') {
                    postProcess();
                }
                if (inst._input[0].type != 'hidden') {
                    inst._input[0].focus();
                }
                this._curInst = inst;
            }
        },
        _updateDatepicker: function(inst) {
            inst._datepickerDiv.empty().append(inst._generateDatepicker());
            var numMonths = inst._getNumberOfMonths();
            if (numMonths[0] != 1 || numMonths[1] != 1) {
                inst._datepickerDiv.addClass('datepicker_multi');
            } else {
                inst._datepickerDiv.removeClass('datepicker_multi');
            }
            if (inst._get('isRTL')) {
                inst._datepickerDiv.addClass('datepicker_rtl');
            } else {
                inst._datepickerDiv.removeClass('datepicker_rtl');
            }
            if (inst._input && inst._input[0].type != 'hidden') {
                inst._input[0].focus();
            }
        },
        _afterShow: function(inst) {
            var numMonths = inst._getNumberOfMonths();
            inst._datepickerDiv.width(numMonths[1] * $('.datepicker', inst._datepickerDiv[0]).width());
            if ($.browser.msie && parseInt($.browser.version) < 7) {
                $('#datepicker_cover').css({
                    width: inst._datepickerDiv.width() + 4,
                    height: inst._datepickerDiv.height() + 4
                });
            }
            var isFixed = inst._datepickerDiv.css('position') == 'fixed';
            var pos = inst._input ? $.datepicker._findPos(inst._input[0]) : null;
            var browserWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
            var browserHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
            var scrollX = (isFixed ? 0 : document.documentElement.scrollLeft || document.body.scrollLeft);
            var scrollY = (isFixed ? 0 : document.documentElement.scrollTop || document.body.scrollTop);
            if ((inst._datepickerDiv.offset().left + inst._datepickerDiv.width() -
                    (isFixed && $.browser.msie ? document.documentElement.scrollLeft : 0)) > (browserWidth + scrollX)) {
                inst._datepickerDiv.css('left', Math.max(scrollX, pos[0] + (inst._input ? $(inst._input[0]).width() : null) - inst._datepickerDiv.width() -
                    (isFixed && $.browser.opera ? document.documentElement.scrollLeft : 0)) + 'px');
            }
            if ((inst._datepickerDiv.offset().top + inst._datepickerDiv.height() -
                    (isFixed && $.browser.msie ? document.documentElement.scrollTop : 0)) > (browserHeight + scrollY)) {
                inst._datepickerDiv.css('top', Math.max(scrollY, pos[1] - (this._inDialog ? 0 : inst._datepickerDiv.height()) -
                    (isFixed && $.browser.opera ? document.documentElement.scrollTop : 0)) + 'px');
            }
        },
        _findPos: function(obj) {
            while (obj && (obj.type == 'hidden' || obj.nodeType != 1)) {
                obj = obj.nextSibling;
            }
            var curleft = curtop = 0;
            if (obj && obj.offsetParent) {
                curleft = obj.offsetLeft;
                curtop = obj.offsetTop;
                while (obj = obj.offsetParent) {
                    var origcurleft = curleft;
                    curleft += obj.offsetLeft;
                    if (curleft < 0) {
                        curleft = origcurleft;
                    }
                    curtop += obj.offsetTop;
                }
            }
            return [curleft, curtop];
        },
        hideDatepicker: function(speed) {
            var inst = this._curInst;
            if (!inst) {
                return;
            }
            var rangeSelect = inst._get('rangeSelect');
            if (rangeSelect && this._stayOpen) {
                this._selectDate(inst, inst._formatDate(inst._currentDay, inst._currentMonth, inst._currentYear));
            }
            this._stayOpen = false;
            if (this._datepickerShowing) {
                speed = (speed != null ? speed : inst._get('speed'));
                inst._datepickerDiv.hide(speed, function() {
                    $.datepicker._tidyDialog(inst);
                });
                if (speed == '') {
                    this._tidyDialog(inst);
                }
                this._datepickerShowing = false;
                this._lastInput = null;
                inst._settings.prompt = null;
                if (this._inDialog) {
                    this._dialogInput.css('position', 'absolute').css('left', '0px').css('top', '-100px');
                    if ($.blockUI) {
                        $.unblockUI();
                        $('body').append(this._datepickerDiv);
                    }
                }
                this._inDialog = false;
            }
            this._curInst = null;
        },
        _tidyDialog: function(inst) {
            inst._datepickerDiv.removeClass('datepicker_dialog');
            $('.datepicker_prompt', inst._datepickerDiv).remove();
        },
        _checkExternalClick: function(event) {
            if (!$.datepicker._curInst) {
                return;
            }
            var target = $(event.target);
            if ((target.parents("#datepicker_div").length == 0) && (target.attr('class') != 'datepicker_trigger') && $.datepicker._datepickerShowing && !($.datepicker._inDialog && $.blockUI)) {
                $.datepicker.hideDatepicker('');
            }
        },
        _adjustDate: function(id, offset, period) {
            var inst = this._getInst(id);
            inst._adjustDate(offset, period);
            this._updateDatepicker(inst);
        },
        _gotoToday: function(id) {
            var date = new Date();
            var inst = this._getInst(id);
            inst._selectedDay = date.getDate();
            inst._selectedMonth = date.getMonth();
            inst._selectedYear = date.getFullYear();
            this._adjustDate(inst);
        },
        _selectMonthYear: function(id, select, period) {
            var inst = this._getInst(id);
            inst._selectingMonthYear = false;
            inst[period == 'M' ? '_selectedMonth' : '_selectedYear'] = select.options[select.selectedIndex].value - 0;
            this._adjustDate(inst);
        },
        _clickMonthYear: function(id) {
            var inst = this._getInst(id);
            if (inst._input && inst._selectingMonthYear && !$.browser.msie) {
                inst._input[0].focus();
            }
            inst._selectingMonthYear = !inst._selectingMonthYear;
        },
        _changeFirstDay: function(id, day) {
            var inst = this._getInst(id);
            inst._settings.firstDay = day;
            this._updateDatepicker(inst);
        },
        _selectDay: function(id, month, year, td) {
            if (this._hasClass($(td), 'datepicker_unselectable')) {
                return;
            }
            var inst = this._getInst(id);
            var rangeSelect = inst._get('rangeSelect');
            if (rangeSelect) {
                if (!this._stayOpen) {
                    $('.datepicker td').removeClass('datepicker_currentDay');
                    $(td).addClass('datepicker_currentDay');
                }
                this._stayOpen = !this._stayOpen;
            }
            inst._currentDay = $('a', td).html();
            inst._currentMonth = month;
            inst._currentYear = year;
            this._selectDate(id, inst._formatDate(inst._currentDay, inst._currentMonth, inst._currentYear));
            if (this._stayOpen) {
                inst._endDay = inst._endMonth = inst._endYear = null;
                inst._rangeStart = new Date(inst._currentYear, inst._currentMonth, inst._currentDay);
                this._updateDatepicker(inst);
            } else if (rangeSelect) {
                inst._endDay = inst._currentDay;
                inst._endMonth = inst._currentMonth;
                inst._endYear = inst._currentYear;
                inst._selectedDay = inst._currentDay = inst._rangeStart.getDate();
                inst._selectedMonth = inst._currentMonth = inst._rangeStart.getMonth();
                inst._selectedYear = inst._currentYear = inst._rangeStart.getFullYear();
                inst._rangeStart = null;
                if (inst._inline) {
                    this._updateDatepicker(inst);
                }
            }
        },
        _clearDate: function(id) {
            var inst = this._getInst(id);
            this._stayOpen = false;
            inst._endDay = inst._endMonth = inst._endYear = inst._rangeStart = null;
            this._selectDate(inst, '');
        },
        _selectDate: function(id, dateStr) {
            var inst = this._getInst(id);
            dateStr = (dateStr != null ? dateStr : inst._formatDate());
            if (inst._rangeStart) {
                dateStr = inst._formatDate(inst._rangeStart) + inst._get('rangeSeparator') + dateStr;
            }
            if (inst._input) {
                inst._input.val(dateStr);
            }
            var onSelect = inst._get('onSelect');
            if (onSelect) {
                onSelect.apply((inst._input ? inst._input[0] : null), [dateStr, inst]);
            } else {
                if (inst._input) {
                    inst._input.trigger('change');
                }
            }
            if (inst._inline) {
                this._updateDatepicker(inst);
            } else {
                if (!this._stayOpen) {
                    this.hideDatepicker(inst._get('speed'));
                    this._lastInput = inst._input[0];
                    if (typeof(inst._input[0]) != 'object') {
                        inst._input[0].focus();
                    }
                    this._lastInput = null;
                }
            }
        },
        noWeekends: function(date) {
            var day = date.getDay();
            return [(day > 0 && day < 6), ''];
        },
        iso8601Week: function(date) {
            var checkDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            var firstMon = new Date(checkDate.getFullYear(), 1 - 1, 4);
            var firstDay = firstMon.getDay() || 7;
            firstMon.setDate(firstMon.getDate() + 1 - firstDay);
            if (firstDay < 4 && checkDate < firstMon) {
                checkDate.setDate(checkDate.getDate() - 3);
                return $.datepicker.iso8601Week(checkDate);
            } else if (checkDate > new Date(checkDate.getFullYear(), 12 - 1, 28)) {
                firstDay = new Date(checkDate.getFullYear() + 1, 1 - 1, 4).getDay() || 7;
                if (firstDay > 4 && (checkDate.getDay() || 7) < firstDay - 3) {
                    checkDate.setDate(checkDate.getDate() + 3);
                    return $.datepicker.iso8601Week(checkDate);
                }
            }
            return Math.floor(((checkDate - firstMon) / 86400000) / 7) + 1;
        },
        dateStatus: function(date, inst) {
            return $.datepicker.formatDate(inst._get('dateStatus'), date, inst._get('dayNamesShort'), inst._get('dayNames'), inst._get('monthNamesShort'), inst._get('monthNames'));
        },
        parseDate: function(format, value, shortYearCutoff, dayNamesShort, dayNames, monthNamesShort, monthNames) {
            if (format == null || value == null) {
                throw 'Invalid arguments';
            }
            value = (typeof value == 'object' ? value.toString() : value + '');
            if (value == '') {
                return null;
            }
            dayNamesShort = dayNamesShort || this._defaults.dayNamesShort;
            dayNames = dayNames || this._defaults.dayNames;
            monthNamesShort = monthNamesShort || this._defaults.monthNamesShort;
            monthNames = monthNames || this._defaults.monthNames;
            var year = -1;
            var month = -1;
            var day = -1;
            var literal = false;
            var lookAhead = function(match) {
                var matches = (iFormat + 1 < format.length && format.charAt(iFormat + 1) == match);
                if (matches) {
                    iFormat++;
                }
                return matches;
            };
            var getNumber = function(match) {
                lookAhead(match);
                var size = (match == 'y' ? 4 : 2);
                var num = 0;
                while (size > 0 && iValue < value.length && value.charAt(iValue) >= '0' && value.charAt(iValue) <= '9') {
                    num = num * 10 + (value.charAt(iValue++) - 0);
                    size--;
                }
                if (size == (match == 'y' ? 4 : 2)) {
                    throw 'Missing number at position ' + iValue;
                }
                return num;
            };
            var getName = function(match, shortNames, longNames) {
                var names = (lookAhead(match) ? longNames : shortNames);
                var size = 0;
                for (var j = 0; j < names.length; j++) {
                    size = Math.max(size, names[j].length);
                }
                var name = '';
                var iInit = iValue;
                while (size > 0 && iValue < value.length) {
                    name += value.charAt(iValue++);
                    for (var i = 0; i < names.length; i++) {
                        if (name == names[i]) {
                            return i + 1;
                        }
                    }
                    size--;
                }
                throw 'Unknown name at position ' + iInit;
            };
            var checkLiteral = function() {
                if (value.charAt(iValue) != format.charAt(iFormat)) {
                    throw 'Unexpected literal at position ' + iValue;
                }
                iValue++;
            };
            var iValue = 0;
            for (var iFormat = 0; iFormat < format.length; iFormat++) {
                if (literal) {
                    if (format.charAt(iFormat) == '\'' && !lookAhead('\'')) {
                        literal = false;
                    } else {
                        checkLiteral();
                    }
                } else {
                    switch (format.charAt(iFormat)) {
                        case 'd':
                            day = getNumber('d');
                            break;
                        case 'D':
                            getName('D', dayNamesShort, dayNames);
                            break;
                        case 'm':
                            month = getNumber('m');
                            break;
                        case 'M':
                            month = getName('M', monthNamesShort, monthNames);
                            break;
                        case 'y':
                            year = getNumber('y');
                            break;
                        case '\'':
                            if (lookAhead('\'')) {
                                checkLiteral();
                            } else {
                                literal = true;
                            }
                            break;
                        default:
                            checkLiteral();
                    }
                }
            }
            if (year < 100) {
                year += new Date().getFullYear() - new Date().getFullYear() % 100 +
                    (year <= shortYearCutoff ? 0 : -100);
            }
            var date = new Date(year, month - 1, day);
            if (date.getFullYear() != year || date.getMonth() + 1 != month || date.getDate() != day) {
                throw 'Invalid date';
            }
            return date;
        },
        formatDate: function(format, date, dayNamesShort, dayNames, monthNamesShort, monthNames) {
            if (!date) {
                return '';
            }
            dayNamesShort = dayNamesShort || this._defaults.dayNamesShort;
            dayNames = dayNames || this._defaults.dayNames;
            monthNamesShort = monthNamesShort || this._defaults.monthNamesShort;
            monthNames = monthNames || this._defaults.monthNames;
            var lookAhead = function(match) {
                var matches = (iFormat + 1 < format.length && format.charAt(iFormat + 1) == match);
                if (matches) {
                    iFormat++;
                }
                return matches;
            };
            var formatNumber = function(match, value) {
                return (lookAhead(match) && value < 10 ? '0' : '') + value;
            };
            var formatName = function(match, value, shortNames, longNames) {
                return (lookAhead(match) ? longNames[value] : shortNames[value]);
            };
            var output = '';
            var literal = false;
            if (date) {
                for (var iFormat = 0; iFormat < format.length; iFormat++) {
                    if (literal) {
                        if (format.charAt(iFormat) == '\'' && !lookAhead('\'')) {
                            literal = false;
                        } else {
                            output += format.charAt(iFormat);
                        }
                    } else {
                        switch (format.charAt(iFormat)) {
                            case 'd':
                                output += formatNumber('d', date.getDate());
                                break;
                            case 'D':
                                output += formatName('D', date.getDay(), dayNamesShort, dayNames);
                                break;
                            case 'm':
                                output += formatNumber('m', date.getMonth() + 1);
                                break;
                            case 'M':
                                output += formatName('M', date.getMonth(), monthNamesShort, monthNames);
                                break;
                            case 'y':
                                output += (lookAhead('y') ? date.getFullYear() : (date.getYear() % 100 < 10 ? '0' : '') + date.getYear() % 100);
                                break;
                            case '\'':
                                if (lookAhead('\'')) {
                                    output += '\'';
                                } else {
                                    literal = true;
                                }
                                break;
                            default:
                                output += format.charAt(iFormat);
                        }
                    }
                }
            }
            return output;
        },
        _possibleChars: function(format) {
            var chars = '';
            var literal = false;
            for (var iFormat = 0; iFormat < format.length; iFormat++) {
                if (literal) {
                    if (format.charAt(iFormat) == '\'' && !lookAhead('\'')) {
                        literal = false;
                    } else {
                        chars += format.charAt(iFormat);
                    }
                } else {
                    switch (format.charAt(iFormat)) {
                        case 'd':
                        case 'm':
                        case 'y':
                            chars += '0123456789';
                            break;
                        case 'D':
                        case 'M':
                            return null;
                        case '\'':
                            if (lookAhead('\'')) {
                                chars += '\'';
                            } else {
                                literal = true;
                            }
                            break;
                        default:
                            chars += format.charAt(iFormat);
                    }
                }
            }
            return chars;
        }
    });

    function DatepickerInstance(settings, inline) {
        this._id = $.datepicker._register(this);
        this._selectedDay = 0;
        this._selectedMonth = 0;
        this._selectedYear = 0;
        this._input = null;
        this._inline = inline;
        this._datepickerDiv = (!inline ? $.datepicker._datepickerDiv : $('<div id="datepicker_div_' + this._id + '" class="datepicker_inline"></div>'));
        this._settings = extendRemove({}, settings || {});
        if (inline) {
            this._setDate(this._getDefaultDate());
        }
    }
    $.extend(DatepickerInstance.prototype, {
        _get: function(name) {
            return (this._settings[name] != null ? this._settings[name] : $.datepicker._defaults[name]);
        },
        _setDateFromField: function(input) {
            this._input = $(input);
            var dateFormat = this._get('dateFormat');
            var dates = this._input ? this._input.val().split(this._get('rangeSeparator')) : null;
            this._endDay = this._endMonth = this._endYear = null;
            var shortYearCutoff = this._get('shortYearCutoff');
            shortYearCutoff = (typeof shortYearCutoff != 'string' ? shortYearCutoff : new Date().getFullYear() % 100 + parseInt(shortYearCutoff, 10));
            var date = defaultDate = this._getDefaultDate();
            if (dates.length > 0) {
                var dayNamesShort = this._get('dayNamesShort');
                var dayNames = this._get('dayNames');
                var monthNamesShort = this._get('monthNamesShort');
                var monthNames = this._get('monthNames');
                if (dates.length > 1) {
                    date = $.datepicker.parseDate(dateFormat, dates[1], shortYearCutoff, dayNamesShort, dayNames, monthNamesShort, monthNames) || defaultDate;
                    this._endDay = date.getDate();
                    this._endMonth = date.getMonth();
                    this._endYear = date.getFullYear();
                }
                try {
                    date = $.datepicker.parseDate(dateFormat, dates[0], shortYearCutoff, dayNamesShort, dayNames, monthNamesShort, monthNames) || defaultDate;
                } catch (e) {
                    $.datepicker.log(e);
                    date = defaultDate;
                }
            }
            this._selectedDay = this._currentDay = date.getDate();
            this._selectedMonth = this._currentMonth = date.getMonth();
            this._selectedYear = this._currentYear = date.getFullYear();
            this._adjustDate();
        },
        _getDefaultDate: function() {
            return this._determineDate('defaultDate', new Date());
        },
        _determineDate: function(name, defaultDate) {
            var offsetNumeric = function(offset) {
                var date = new Date();
                date.setDate(date.getDate() + offset);
                return date;
            };
            var offsetString = function(offset, getDaysInMonth) {
                var date = new Date();
                var matches = /^([+-]?[0-9]+)\s*(d|D|w|W|m|M|y|Y)?$/.exec(offset);
                if (matches) {
                    var year = date.getFullYear();
                    var month = date.getMonth();
                    var day = date.getDate();
                    switch (matches[2] || 'd') {
                        case 'd':
                        case 'D':
                            day += (matches[1] - 0);
                            break;
                        case 'w':
                        case 'W':
                            day += (matches[1] * 7);
                            break;
                        case 'm':
                        case 'M':
                            month += (matches[1] - 0);
                            day = Math.min(day, getDaysInMonth(year, month));
                            break;
                        case 'y':
                        case 'Y':
                            year += (matches[1] - 0);
                            day = Math.min(day, getDaysInMonth(year, month));
                            break;
                    }
                    date = new Date(year, month, day);
                }
                return date;
            };
            var date = this._get(name);
            return (date == null ? defaultDate : (typeof date == 'string' ? offsetString(date, this._getDaysInMonth) : (typeof date == 'number' ? offsetNumeric(date) : date)));
        },
        _setDate: function(date, endDate) {
            this._selectedDay = this._currentDay = date.getDate();
            this._selectedMonth = this._currentMonth = date.getMonth();
            this._selectedYear = this._currentYear = date.getFullYear();
            if (this._get('rangeSelect')) {
                if (endDate) {
                    this._endDay = endDate.getDate();
                    this._endMonth = endDate.getMonth();
                    this._endYear = endDate.getFullYear();
                } else {
                    this._endDay = this._currentDay;
                    this._endMonth = this._currentMonth;
                    this._endYear = this._currentYear;
                }
            }
            this._adjustDate();
        },
        _getDate: function() {
            var startDate = (!this._currentYear || (this._input && this._input.val() == '') ? null : new Date(this._currentYear, this._currentMonth, this._currentDay));
            if (this._get('rangeSelect')) {
                return [startDate, (!this._endYear ? null : new Date(this._endYear, this._endMonth, this._endDay))];
            } else {
                return startDate;
            }
        },
        _generateDatepicker: function() {
            var today = new Date();
            today = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            var showStatus = this._get('showStatus');
            var isRTL = this._get('isRTL');
            var clear = (this._get('mandatory') ? '' : '<div class="datepicker_clear"><a onclick="jQuery.datepicker._clearDate(' + this._id + ');"' +
                (showStatus ? this._addStatus(this._get('clearStatus') || '&#xa0;') : '') + '>' +
                this._get('clearText') + '</a></div>');
            var controls = '<div class="datepicker_control">' + (isRTL ? '' : clear) + '<div class="datepicker_close"><a onclick="jQuery.datepicker.hideDatepicker();"' +
                (showStatus ? this._addStatus(this._get('closeStatus') || '&#xa0;') : '') + '>' +
                this._get('closeText') + '</a></div>' + (isRTL ? clear : '') + '</div>';
            var prompt = this._get('prompt');
            var closeAtTop = this._get('closeAtTop');
            var hideIfNoPrevNext = this._get('hideIfNoPrevNext');
            var numMonths = this._getNumberOfMonths();
            var stepMonths = this._get('stepMonths');
            var isMultiMonth = (numMonths[0] != 1 || numMonths[1] != 1);
            var minDate = this._getMinMaxDate('min', true);
            var maxDate = this._getMinMaxDate('max');
            var drawMonth = this._selectedMonth;
            var drawYear = this._selectedYear;
            if (maxDate) {
                var maxDraw = new Date(maxDate.getFullYear(), maxDate.getMonth() - numMonths[1] + 1, maxDate.getDate());
                maxDraw = (minDate && maxDraw < minDate ? minDate : maxDraw);
                while (new Date(drawYear, drawMonth, 1) > maxDraw) {
                    drawMonth--;
                    if (drawMonth < 0) {
                        drawMonth = 11;
                        drawYear--;
                    }
                }
            }
            var prev = '<div class="datepicker_prev">' + (this._canAdjustMonth(-1, drawYear, drawMonth) ? '<a onclick="jQuery.datepicker._adjustDate(' + this._id + ', -' + stepMonths + ', \'M\');"' +
                (showStatus ? this._addStatus(this._get('prevStatus') || '&#xa0;') : '') + '>' +
                this._get('prevText') + '</a>' : (hideIfNoPrevNext ? '' : '<label>' + this._get('prevText') + '</label>')) + '</div>';
            var next = '<div class="datepicker_next">' + (this._canAdjustMonth(+1, drawYear, drawMonth) ? '<a onclick="jQuery.datepicker._adjustDate(' + this._id + ', +' + stepMonths + ', \'M\');"' +
                (showStatus ? this._addStatus(this._get('nextStatus') || '&#xa0;') : '') + '>' +
                this._get('nextText') + '</a>' : (hideIfNoPrevNext ? '>' : '<label>' + this._get('nextText') + '</label>')) + '</div>';
            var html = (prompt ? '<div class="datepicker_prompt">' + prompt + '</div>' : '') +
                (closeAtTop && !this._inline ? controls : '') + '<div class="datepicker_links">' + (isRTL ? next : prev) +
                (this._isInRange(today) ? '<div class="datepicker_current">' + '<a onclick="jQuery.datepicker._gotoToday(' + this._id + ');"' +
                    (showStatus ? this._addStatus(this._get('currentStatus') || '&#xa0;') : '') + '>' +
                    this._get('currentText') + '</a></div>' : '') + (isRTL ? prev : next) + '</div>';
            var showWeeks = this._get('showWeeks');
            for (var row = 0; row < numMonths[0]; row++) {
                for (var col = 0; col < numMonths[1]; col++) {
                    var selectedDate = new Date(drawYear, drawMonth, this._selectedDay);
                    html += '<div class="datepicker_oneMonth' + (col == 0 ? ' datepicker_newRow' : '') + '">' +
                        this._generateMonthYearHeader(drawMonth, drawYear, minDate, maxDate, selectedDate, row > 0 || col > 0) + '<table class="datepicker" cellpadding="0" cellspacing="0"><thead>' + '<tr class="datepicker_titleRow">' +
                        (showWeeks ? '<td>' + this._get('weekHeader') + '</td>' : '');
                    var firstDay = this._get('firstDay');
                    var changeFirstDay = this._get('changeFirstDay');
                    var dayNames = this._get('dayNames');
                    var dayNamesShort = this._get('dayNamesShort');
                    var dayNamesMin = this._get('dayNamesMin');
                    for (var dow = 0; dow < 7; dow++) {
                        var day = (dow + firstDay) % 7;
                        var status = this._get('dayStatus') || '&#xa0;';
                        status = (status.indexOf('DD') > -1 ? status.replace(/DD/, dayNames[day]) : status.replace(/D/, dayNamesShort[day]));
                        html += '<td' + ((dow + firstDay + 6) % 7 >= 5 ? ' class="datepicker_weekEndCell"' : '') + '>' +
                            (!changeFirstDay ? '<span' : '<a onclick="jQuery.datepicker._changeFirstDay(' + this._id + ', ' + day + ');"') +
                            (showStatus ? this._addStatus(status) : '') + ' title="' + dayNames[day] + '">' +
                            dayNamesMin[day] + (changeFirstDay ? '</a>' : '</span>') + '</td>';
                    }
                    html += '</tr></thead><tbody>';
                    var daysInMonth = this._getDaysInMonth(drawYear, drawMonth);
                    if (drawYear == this._selectedYear && drawMonth == this._selectedMonth) {
                        this._selectedDay = Math.min(this._selectedDay, daysInMonth);
                    }
                    var leadDays = (this._getFirstDayOfMonth(drawYear, drawMonth) - firstDay + 7) % 7;
                    var currentDate = new Date(this._currentYear, this._currentMonth, this._currentDay);
                    var endDate = this._endDay ? new Date(this._endYear, this._endMonth, this._endDay) : currentDate;
                    var printDate = new Date(drawYear, drawMonth, 1 - leadDays);
                    var numRows = (isMultiMonth ? 6 : Math.ceil((leadDays + daysInMonth) / 7));
                    var beforeShowDay = this._get('beforeShowDay');
                    var showOtherMonths = this._get('showOtherMonths');
                    var calculateWeek = this._get('calculateWeek') || $.datepicker.iso8601Week;
                    var dateStatus = this._get('statusForDate') || $.datepicker.dateStatus;
                    for (var dRow = 0; dRow < numRows; dRow++) {
                        html += '<tr class="datepicker_daysRow">' +
                            (showWeeks ? '<td class="datepicker_weekCol">' + calculateWeek(printDate) + '</td>' : '');
                        for (var dow = 0; dow < 7; dow++) {
                            var daySettings = (beforeShowDay ? beforeShowDay.apply((this._input ? this._input[0] : null), [printDate]) : [true, '']);
                            var otherMonth = (printDate.getMonth() != drawMonth);
                            var unselectable = otherMonth || !daySettings[0] || (minDate && printDate < minDate) || (maxDate && printDate > maxDate);
                            html += '<td class="datepicker_daysCell' +
                                ((dow + firstDay + 6) % 7 >= 5 ? ' datepicker_weekEndCell' : '') +
                                (otherMonth ? ' datepicker_otherMonth' : '') +
                                (printDate.getTime() == selectedDate.getTime() && drawMonth == this._selectedMonth ? ' datepicker_daysCellOver' : '') +
                                (unselectable ? ' datepicker_unselectable' : '') +
                                (otherMonth && !showOtherMonths ? '' : ' ' + daySettings[1] +
                                    (printDate.getTime() >= currentDate.getTime() && printDate.getTime() <= endDate.getTime() ? ' datepicker_currentDay' : (printDate.getTime() == today.getTime() ? ' datepicker_today' : ''))) + '"' +
                                (unselectable ? '' : ' onmouseover="jQuery(this).addClass(\'datepicker_daysCellOver\');' +
                                    (!showStatus || (otherMonth && !showOtherMonths) ? '' : 'jQuery(\'#datepicker_status_' +
                                        this._id + '\').html(\'' + (dateStatus.apply((this._input ? this._input[0] : null), [printDate, this]) || '&#xa0;') + '\');') + '"' + ' onmouseout="jQuery(this).removeClass(\'datepicker_daysCellOver\');' +
                                    (!showStatus || (otherMonth && !showOtherMonths) ? '' : 'jQuery(\'#datepicker_status_' +
                                        this._id + '\').html(\'&#xa0;\');') + '" onclick="jQuery.datepicker._selectDay(' +
                                    this._id + ',' + drawMonth + ',' + drawYear + ', this);"') + '>' +
                                (otherMonth ? (showOtherMonths ? printDate.getDate() : '&#xa0;') : (unselectable ? printDate.getDate() : '<a>' + printDate.getDate() + '</a>')) + '</td>';
                            printDate.setDate(printDate.getDate() + 1);
                        }
                        html += '</tr>';
                    }
                    drawMonth++;
                    if (drawMonth > 11) {
                        drawMonth = 0;
                        drawYear++;
                    }
                    html += '</tbody></table></div>';
                }
            }
            html += (showStatus ? '<div id="datepicker_status_' + this._id + '" class="datepicker_status">' + (this._get('initStatus') || '&#xa0;') + '</div>' : '') +
                (!closeAtTop && !this._inline ? controls : '') + '<div style="clear: both;"></div>' +
                ($.browser.msie && parseInt($.browser.version) < 7 && !this._inline ? '<iframe src="javascript:false;" class="datepicker_cover"></iframe>' : '');
            return html;
        },
        _generateMonthYearHeader: function(drawMonth, drawYear, minDate, maxDate, selectedDate, secondary) {
            minDate = (this._rangeStart && minDate && selectedDate < minDate ? selectedDate : minDate);
            var showStatus = this._get('showStatus');
            var html = '<div class="datepicker_header">';
            var monthNames = this._get('monthNames');
            if (secondary || !this._get('changeMonth')) {
                html += monthNames[drawMonth] + '&#xa0;';
            } else {
                var inMinYear = (minDate && minDate.getFullYear() == drawYear);
                var inMaxYear = (maxDate && maxDate.getFullYear() == drawYear);
                html += '<select class="datepicker_newMonth" ' + 'onchange="jQuery.datepicker._selectMonthYear(' + this._id + ', this, \'M\');" ' + 'onclick="jQuery.datepicker._clickMonthYear(' + this._id + ');"' +
                    (showStatus ? this._addStatus(this._get('monthStatus') || '&#xa0;') : '') + '>';
                for (var month = 0; month < 12; month++) {
                    if ((!inMinYear || month >= minDate.getMonth()) && (!inMaxYear || month <= maxDate.getMonth())) {
                        html += '<option value="' + month + '"' +
                            (month == drawMonth ? ' selected="selected"' : '') + '>' + monthNames[month] + '</option>';
                    }
                }
                html += '</select>';
            }
            if (secondary || !this._get('changeYear')) {
                html += drawYear;
            } else {
                var years = this._get('yearRange').split(':');
                var year = 0;
                var endYear = 0;
                if (years.length != 2) {
                    year = drawYear - 10;
                    endYear = drawYear + 10;
                } else if (years[0].charAt(0) == '+' || years[0].charAt(0) == '-') {
                    year = drawYear + parseInt(years[0], 10);
                    endYear = drawYear + parseInt(years[1], 10);
                } else {
                    year = parseInt(years[0], 10);
                    endYear = parseInt(years[1], 10);
                }
                year = (minDate ? Math.max(year, minDate.getFullYear()) : year);
                endYear = (maxDate ? Math.min(endYear, maxDate.getFullYear()) : endYear);
                html += '<select class="datepicker_newYear" ' + 'onchange="jQuery.datepicker._selectMonthYear(' + this._id + ', this, \'Y\');" ' + 'onclick="jQuery.datepicker._clickMonthYear(' + this._id + ');"' +
                    (showStatus ? this._addStatus(this._get('yearStatus') || '&#xa0;') : '') + '>';
                for (; year <= endYear; year++) {
                    html += '<option value="' + year + '"' +
                        (year == drawYear ? ' selected="selected"' : '') + '>' + year + '</option>';
                }
                html += '</select>';
            }
            html += '</div>';
            return html;
        },
        _addStatus: function(text) {
            return ' onmouseover="jQuery(\'#datepicker_status_' + this._id + '\').html(\'' + text + '\');" ' + 'onmouseout="jQuery(\'#datepicker_status_' + this._id + '\').html(\'&#xa0;\');"';
        },
        _adjustDate: function(offset, period) {
            var year = this._selectedYear + (period == 'Y' ? offset : 0);
            var month = this._selectedMonth + (period == 'M' ? offset : 0);
            var day = Math.min(this._selectedDay, this._getDaysInMonth(year, month)) +
                (period == 'D' ? offset : 0);
            var date = new Date(year, month, day);
            var minDate = this._getMinMaxDate('min', true);
            var maxDate = this._getMinMaxDate('max');
            date = (minDate && date < minDate ? minDate : date);
            date = (maxDate && date > maxDate ? maxDate : date);
            this._selectedDay = date.getDate();
            this._selectedMonth = date.getMonth();
            this._selectedYear = date.getFullYear();
        },
        _getNumberOfMonths: function() {
            var numMonths = this._get('numberOfMonths');
            return (numMonths == null ? [1, 1] : (typeof numMonths == 'number' ? [1, numMonths] : numMonths));
        },
        _getMinMaxDate: function(minMax, checkRange) {
            var date = this._determineDate(minMax + 'Date', null);
            if (date) {
                date.setHours(0);
                date.setMinutes(0);
                date.setSeconds(0);
                date.setMilliseconds(0);
            }
            return date || (checkRange ? this._rangeStart : null);
        },
        _getDaysInMonth: function(year, month) {
            return 32 - new Date(year, month, 32).getDate();
        },
        _getFirstDayOfMonth: function(year, month) {
            return new Date(year, month, 1).getDay();
        },
        _canAdjustMonth: function(offset, curYear, curMonth) {
            var numMonths = this._getNumberOfMonths();
            var date = new Date(curYear, curMonth + (offset < 0 ? offset : numMonths[1]), 1);
            if (offset < 0) {
                date.setDate(this._getDaysInMonth(date.getFullYear(), date.getMonth()));
            }
            return this._isInRange(date);
        },
        _isInRange: function(date) {
            var newMinDate = (!this._rangeStart ? null : new Date(this._selectedYear, this._selectedMonth, this._selectedDay));
            newMinDate = (newMinDate && this._rangeStart < newMinDate ? this._rangeStart : newMinDate);
            var minDate = newMinDate || this._getMinMaxDate('min');
            var maxDate = this._getMinMaxDate('max');
            return ((!minDate || date >= minDate) && (!maxDate || date <= maxDate));
        },
        _formatDate: function(day, month, year) {
            if (!day) {
                this._currentDay = this._selectedDay;
                this._currentMonth = this._selectedMonth;
                this._currentYear = this._selectedYear;
            }
            var date = (day ? (typeof day == 'object' ? day : new Date(year, month, day)) : new Date(this._currentYear, this._currentMonth, this._currentDay));
            return $.datepicker.formatDate(this._get('dateFormat'), date, this._get('dayNamesShort'), this._get('dayNames'), this._get('monthNamesShort'), this._get('monthNames'));
        }
    });

    function extendRemove(target, props) {
        $.extend(target, props);
        for (var name in props) {
            if (props[name] == null) {
                target[name] = null;
            }
        }
        return target;
    };
    $.fn.attachDatepicker = function(settings) {
        return this.each(function() {
            var inlineSettings = null;
            for (attrName in $.datepicker._defaults) {
                var attrValue = this.getAttribute('date:' + attrName);
                if (attrValue) {
                    inlineSettings = inlineSettings || {};
                    try {
                        inlineSettings[attrName] = eval(attrValue);
                    } catch (err) {
                        inlineSettings[attrName] = attrValue;
                    }
                }
            }
            var nodeName = this.nodeName.toLowerCase();
            if (nodeName == 'input') {
                var instSettings = (inlineSettings ? $.extend($.extend({}, settings || {}), inlineSettings || {}) : settings);
                var inst = (inst && !inlineSettings ? inst : new DatepickerInstance(instSettings, false));
                $.datepicker._connectDatepicker(this, inst);
            } else if (nodeName == 'div' || nodeName == 'span') {
                var instSettings = $.extend($.extend({}, settings || {}), inlineSettings || {});
                var inst = new DatepickerInstance(instSettings, true);
                $.datepicker._inlineDatepicker(this, inst);
            }
        });
    };
    $.fn.removeDatepicker = function() {
        var jq = this.each(function() {
            var $this = $(this);
            var nodeName = this.nodeName.toLowerCase();
            var calId = this._calId;
            this._calId = null;
            if (nodeName == 'input') {
                $this.siblings('.datepicker_append').replaceWith('');
                $this.siblings('.datepicker_trigger').replaceWith('');
                $this.removeClass($.datepicker.markerClassName).unbind('focus', $.datepicker.showFor).unbind('keydown', $.datepicker._doKeyDown).unbind('keypress', $.datepicker._doKeyPress);
                var wrapper = $this.parents('.datepicker_wrap');
                if (wrapper) {
                    wrapper.replaceWith(wrapper.html());
                }
            } else if (nodeName == 'div' || nodeName == 'span') {
                $this.removeClass($.datepicker.markerClassName).empty();
            }
            if ($('input[_calId=' + calId + ']').length == 0) {
                $.datepicker._inst[calId] = null;
            }
        });
        if ($('input.hasDatepicker').length == 0) {
            $.datepicker._datepickerDiv.replaceWith('');
        }
        return jq;
    };
    $.fn.enableDatepicker = function() {
        return this.each(function() {
            this.disabled = false;
            $(this).siblings('button.datepicker_trigger').each(function() {
                this.disabled = false;
            });
            $(this).siblings('img.datepicker_trigger').css({
                opacity: '1.0',
                cursor: ''
            });
            var $this = this;
            $.datepicker._disabledInputs = $.map($.datepicker._disabledInputs, function(value) {
                return (value == $this ? null : value);
            });
        });
    };
    $.fn.disableDatepicker = function() {
        return this.each(function() {
            this.disabled = true;
            $(this).siblings('button.datepicker_trigger').each(function() {
                this.disabled = true;
            });
            $(this).siblings('img.datepicker_trigger').css({
                opacity: '0.5',
                cursor: 'default'
            });
            var $this = this;
            $.datepicker._disabledInputs = $.map($.datepicker._disabledInputs, function(value) {
                return (value == $this ? null : value);
            });
            $.datepicker._disabledInputs[$.datepicker._disabledInputs.length] = this;
        });
    };
    $.fn.isDisabledDatepicker = function() {
        if (this.length == 0) {
            return false;
        }
        for (var i = 0; i < $.datepicker._disabledInputs.length; i++) {
            if ($.datepicker._disabledInputs[i] == this[0]) {
                return true;
            }
        }
        return false;
    };
    $.fn.changeDatepicker = function(name, value) {
        var settings = name || {};
        if (typeof name == 'string') {
            settings = {};
            settings[name] = value;
        }
        return this.each(function() {
            var inst = $.datepicker._getInst(this._calId);
            if (inst) {
                extendRemove(inst._settings, settings);
                $.datepicker._updateDatepicker(inst);
            }
        });
    };
    $.fn.showDatepicker = function() {
        $.datepicker.showFor(this);
        return this;
    };
    $.fn.setDatepickerDate = function(date, endDate) {
        return this.each(function() {
            var inst = $.datepicker._getInst(this._calId);
            if (inst) {
                inst._setDate(date, endDate);
                $.datepicker._updateDatepicker(inst);
            }
        });
    };
    $.fn.getDatepickerDate = function() {
        var inst = (this.length > 0 ? $.datepicker._getInst(this[0]._calId) : null);
        return (inst ? inst._getDate() : null);
    };
    $(document).ready(function() {
        $.datepicker = new Datepicker();
        $(document.body).append($.datepicker._datepickerDiv).mousedown($.datepicker._checkExternalClick);
    });
})(jQuery); /* assets/js/jquery.maskedinput.min.js */
! function(a) {
    "function" == typeof define && define.amd ? define(["jquery"], a) : a("object" == typeof exports ? require("jquery") : jQuery)
}(function(a) {
    var b, c = navigator.userAgent,
        d = /iphone/i.test(c),
        e = /chrome/i.test(c),
        f = /android/i.test(c);
    a.mask = {
        definitions: {
            9: "[0-9]",
            a: "[A-Za-z]",
            "*": "[A-Za-z0-9]"
        },
        autoclear: !0,
        dataName: "rawMaskFn",
        placeholder: "_"
    }, a.fn.extend({
        caret: function(a, b) {
            var c;
            if (0 !== this.length && !this.is(":hidden")) return "number" == typeof a ? (b = "number" == typeof b ? b : a, this.each(function() {
                this.setSelectionRange ? this.setSelectionRange(a, b) : this.createTextRange && (c = this.createTextRange(), c.collapse(!0), c.moveEnd("character", b), c.moveStart("character", a), c.select())
            })) : (this[0].setSelectionRange ? (a = this[0].selectionStart, b = this[0].selectionEnd) : document.selection && document.selection.createRange && (c = document.selection.createRange(), a = 0 - c.duplicate().moveStart("character", -1e5), b = a + c.text.length), {
                begin: a,
                end: b
            })
        },
        unmask: function() {
            return this.trigger("unmask")
        },
        mask: function(c, g) {
            var h, i, j, k, l, m, n, o;
            if (!c && this.length > 0) {
                h = a(this[0]);
                var p = h.data(a.mask.dataName);
                return p ? p() : void 0
            }
            return g = a.extend({
                autoclear: a.mask.autoclear,
                placeholder: a.mask.placeholder,
                completed: null
            }, g), i = a.mask.definitions, j = [], k = n = c.length, l = null, a.each(c.split(""), function(a, b) {
                "?" == b ? (n--, k = a) : i[b] ? (j.push(new RegExp(i[b])), null === l && (l = j.length - 1), k > a && (m = j.length - 1)) : j.push(null)
            }), this.trigger("unmask").each(function() {
                function h() {
                    if (g.completed) {
                        for (var a = l; m >= a; a++)
                            if (j[a] && C[a] === p(a)) return;
                        g.completed.call(B)
                    }
                }

                function p(a) {
                    return g.placeholder.charAt(a < g.placeholder.length ? a : 0)
                }

                function q(a) {
                    for (; ++a < n && !j[a];);
                    return a
                }

                function r(a) {
                    for (; --a >= 0 && !j[a];);
                    return a
                }

                function s(a, b) {
                    var c, d;
                    if (!(0 > a)) {
                        for (c = a, d = q(b); n > c; c++)
                            if (j[c]) {
                                if (!(n > d && j[c].test(C[d]))) break;
                                C[c] = C[d], C[d] = p(d), d = q(d)
                            }
                        z(), B.caret(Math.max(l, a))
                    }
                }

                function t(a) {
                    var b, c, d, e;
                    for (b = a, c = p(a); n > b; b++)
                        if (j[b]) {
                            if (d = q(b), e = C[b], C[b] = c, !(n > d && j[d].test(e))) break;
                            c = e
                        }
                }

                function u() {
                    var a = B.val(),
                        b = B.caret();
                    if (a.length < o.length) {
                        for (A(!0); b.begin > 0 && !j[b.begin - 1];) b.begin--;
                        if (0 === b.begin)
                            for (; b.begin < l && !j[b.begin];) b.begin++;
                        B.caret(b.begin, b.begin)
                    } else {
                        for (A(!0); b.begin < n && !j[b.begin];) b.begin++;
                        B.caret(b.begin, b.begin)
                    }
                    h()
                }

                function v() {
                    A(), B.val() != E && B.change()
                }

                function w(a) {
                    if (!B.prop("readonly")) {
                        var b, c, e, f = a.which || a.keyCode;
                        o = B.val(), 8 === f || 46 === f || d && 127 === f ? (b = B.caret(), c = b.begin, e = b.end, e - c === 0 && (c = 46 !== f ? r(c) : e = q(c - 1), e = 46 === f ? q(e) : e), y(c, e), s(c, e - 1), a.preventDefault()) : 13 === f ? v.call(this, a) : 27 === f && (B.val(E), B.caret(0, A()), a.preventDefault())
                    }
                }

                function x(b) {
                    if (!B.prop("readonly")) {
                        var c, d, e, g = b.which || b.keyCode,
                            i = B.caret();
                        if (!(b.ctrlKey || b.altKey || b.metaKey || 32 > g) && g && 13 !== g) {
                            if (i.end - i.begin !== 0 && (y(i.begin, i.end), s(i.begin, i.end - 1)), c = q(i.begin - 1), n > c && (d = String.fromCharCode(g), j[c].test(d))) {
                                if (t(c), C[c] = d, z(), e = q(c), f) {
                                    var k = function() {
                                        a.proxy(a.fn.caret, B, e)()
                                    };
                                    setTimeout(k, 0)
                                } else B.caret(e);
                                i.begin <= m && h()
                            }
                            b.preventDefault()
                        }
                    }
                }

                function y(a, b) {
                    var c;
                    for (c = a; b > c && n > c; c++) j[c] && (C[c] = p(c))
                }

                function z() {
                    B.val(C.join(""))
                }

                function A(a) {
                    var b, c, d, e = B.val(),
                        f = -1;
                    for (b = 0, d = 0; n > b; b++)
                        if (j[b]) {
                            for (C[b] = p(b); d++ < e.length;)
                                if (c = e.charAt(d - 1), j[b].test(c)) {
                                    C[b] = c, f = b;
                                    break
                                }
                            if (d > e.length) {
                                y(b + 1, n);
                                break
                            }
                        } else C[b] === e.charAt(d) && d++, k > b && (f = b);
                    return a ? z() : k > f + 1 ? g.autoclear || C.join("") === D ? (B.val() && B.val(""), y(0, n)) : z() : (z(), B.val(B.val().substring(0, f + 1))), k ? b : l
                }
                var B = a(this),
                    C = a.map(c.split(""), function(a, b) {
                        return "?" != a ? i[a] ? p(b) : a : void 0
                    }),
                    D = C.join(""),
                    E = B.val();
                B.data(a.mask.dataName, function() {
                    return a.map(C, function(a, b) {
                        return j[b] && a != p(b) ? a : null
                    }).join("")
                }), B.one("unmask", function() {
                    B.off(".mask").removeData(a.mask.dataName)
                }).on("focus.mask", function() {
                    if (!B.prop("readonly")) {
                        clearTimeout(b);
                        var a;
                        E = B.val(), a = A(), b = setTimeout(function() {
                            z(), a == c.replace("?", "").length ? B.caret(0, a) : B.caret(a)
                        }, 10)
                    }
                }).on("blur.mask", v).on("keydown.mask", w).on("keypress.mask", x).on("input.mask paste.mask", function() {
                    B.prop("readonly") || setTimeout(function() {
                        var a = A(!0);
                        B.caret(a), h()
                    }, 0)
                }), e && f && B.off("input.mask").on("input.mask", u), A()
            })
        }
    })
}); /* assets/js/fancybox/jquery.fancybox.pack.js */
/*! fancyBox v2.1.5 fancyapps.com | fancyapps.com/fancybox/#license */
(function(r, G, f, v) {
    var J = f("html"),
        n = f(r),
        p = f(G),
        b = f.fancybox = function() {
            b.open.apply(this, arguments)
        },
        I = navigator.userAgent.match(/msie/i),
        B = null,
        s = G.createTouch !== v,
        t = function(a) {
            return a && a.hasOwnProperty && a instanceof f
        },
        q = function(a) {
            return a && "string" === f.type(a)
        },
        E = function(a) {
            return q(a) && 0 < a.indexOf("%")
        },
        l = function(a, d) {
            var e = parseInt(a, 10) || 0;
            d && E(a) && (e *= b.getViewport()[d] / 100);
            return Math.ceil(e)
        },
        w = function(a, b) {
            return l(a, b) + "px"
        };
    f.extend(b, {
        version: "2.1.5",
        defaults: {
            padding: 15,
            margin: 20,
            width: 800,
            height: 600,
            minWidth: 100,
            minHeight: 100,
            maxWidth: 9999,
            maxHeight: 9999,
            pixelRatio: 1,
            autoSize: !0,
            autoHeight: !1,
            autoWidth: !1,
            autoResize: !0,
            autoCenter: !s,
            fitToView: !0,
            aspectRatio: !1,
            topRatio: 0.5,
            leftRatio: 0.5,
            scrolling: "auto",
            wrapCSS: "",
            arrows: !0,
            closeBtn: !0,
            closeClick: !1,
            nextClick: !1,
            mouseWheel: !0,
            autoPlay: !1,
            playSpeed: 3E3,
            preload: 3,
            modal: !1,
            loop: !0,
            ajax: {
                dataType: "html",
                headers: {
                    "X-fancyBox": !0
                }
            },
            iframe: {
                scrolling: "auto",
                preload: !0
            },
            swf: {
                wmode: "transparent",
                allowfullscreen: "true",
                allowscriptaccess: "always"
            },
            keys: {
                next: {
                    13: "left",
                    34: "up",
                    39: "left",
                    40: "up"
                },
                prev: {
                    8: "right",
                    33: "down",
                    37: "right",
                    38: "down"
                },
                close: [27],
                play: [32],
                toggle: [70]
            },
            direction: {
                next: "left",
                prev: "right"
            },
            scrollOutside: !0,
            index: 0,
            type: null,
            href: null,
            content: null,
            title: null,
            tpl: {
                wrap: '<div class="fancybox-wrap" tabIndex="-1"><div class="fancybox-skin"><div class="fancybox-outer"><div class="fancybox-inner"></div></div></div></div>',
                image: '<img class="fancybox-image" src="{href}" alt="" />',
                iframe: '<iframe id="fancybox-frame{rnd}" name="fancybox-frame{rnd}" class="fancybox-iframe" frameborder="0" vspace="0" hspace="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen' +
                    (I ? ' allowtransparency="true"' : "") + "></iframe>",
                error: '<p class="fancybox-error">The requested content cannot be loaded.<br/>Please try again later.</p>',
                closeBtn: '<a title="Close" class="fancybox-item fancybox-close" href="javascript:;"></a>',
                next: '<a title="Next" class="fancybox-nav fancybox-next" href="javascript:;"><span></span></a>',
                prev: '<a title="Previous" class="fancybox-nav fancybox-prev" href="javascript:;"><span></span></a>'
            },
            openEffect: "fade",
            openSpeed: 250,
            openEasing: "swing",
            openOpacity: !0,
            openMethod: "zoomIn",
            closeEffect: "fade",
            closeSpeed: 250,
            closeEasing: "swing",
            closeOpacity: !0,
            closeMethod: "zoomOut",
            nextEffect: "elastic",
            nextSpeed: 250,
            nextEasing: "swing",
            nextMethod: "changeIn",
            prevEffect: "elastic",
            prevSpeed: 250,
            prevEasing: "swing",
            prevMethod: "changeOut",
            helpers: {
                overlay: !0,
                title: !0
            },
            onCancel: f.noop,
            beforeLoad: f.noop,
            afterLoad: f.noop,
            beforeShow: f.noop,
            afterShow: f.noop,
            beforeChange: f.noop,
            beforeClose: f.noop,
            afterClose: f.noop
        },
        group: {},
        opts: {},
        previous: null,
        coming: null,
        current: null,
        isActive: !1,
        isOpen: !1,
        isOpened: !1,
        wrap: null,
        skin: null,
        outer: null,
        inner: null,
        player: {
            timer: null,
            isActive: !1
        },
        ajaxLoad: null,
        imgPreload: null,
        transitions: {},
        helpers: {},
        open: function(a, d) {
            if (a && (f.isPlainObject(d) || (d = {}), !1 !== b.close(!0))) return f.isArray(a) || (a = t(a) ? f(a).get() : [a]), f.each(a, function(e, c) {
                var k = {},
                    g, h, j, m, l;
                "object" === f.type(c) && (c.nodeType && (c = f(c)), t(c) ? (k = {
                    href: c.data("fancybox-href") || c.attr("href"),
                    title: c.data("fancybox-title") || c.attr("title"),
                    isDom: !0,
                    element: c
                }, f.metadata && f.extend(!0, k, c.metadata())) : k = c);
                g = d.href || k.href || (q(c) ? c : null);
                h = d.title !== v ? d.title : k.title || "";
                m = (j = d.content || k.content) ? "html" : d.type || k.type;
                !m && k.isDom && (m = c.data("fancybox-type"), m || (m = (m = c.prop("class").match(/fancybox\.(\w+)/)) ? m[1] : null));
                q(g) && (m || (b.isImage(g) ? m = "image" : b.isSWF(g) ? m = "swf" : "#" === g.charAt(0) ? m = "inline" : q(c) && (m = "html", j = c)), "ajax" === m && (l = g.split(/\s+/, 2), g = l.shift(), l = l.shift()));
                j || ("inline" === m ? g ? j = f(q(g) ? g.replace(/.*(?=#[^\s]+$)/, "") : g) : k.isDom && (j = c) : "html" === m ? j = g : !m && (!g && k.isDom) && (m = "inline", j = c));
                f.extend(k, {
                    href: g,
                    type: m,
                    content: j,
                    title: h,
                    selector: l
                });
                a[e] = k
            }), b.opts = f.extend(!0, {}, b.defaults, d), d.keys !== v && (b.opts.keys = d.keys ? f.extend({}, b.defaults.keys, d.keys) : !1), b.group = a, b._start(b.opts.index)
        },
        cancel: function() {
            var a = b.coming;
            a && !1 !== b.trigger("onCancel") && (b.hideLoading(), b.ajaxLoad && b.ajaxLoad.abort(), b.ajaxLoad = null, b.imgPreload && (b.imgPreload.onload = b.imgPreload.onerror = null), a.wrap && a.wrap.stop(!0, !0).trigger("onReset").remove(), b.coming = null, b.current || b._afterZoomOut(a))
        },
        close: function(a) {
            b.cancel();
            !1 !== b.trigger("beforeClose") && (b.unbindEvents(), b.isActive && (!b.isOpen || !0 === a ? (f(".fancybox-wrap").stop(!0).trigger("onReset").remove(), b._afterZoomOut()) : (b.isOpen = b.isOpened = !1, b.isClosing = !0, f(".fancybox-item, .fancybox-nav").remove(), b.wrap.stop(!0, !0).removeClass("fancybox-opened"), b.transitions[b.current.closeMethod]())))
        },
        play: function(a) {
            var d = function() {
                    clearTimeout(b.player.timer)
                },
                e = function() {
                    d();
                    b.current && b.player.isActive && (b.player.timer = setTimeout(b.next, b.current.playSpeed))
                },
                c = function() {
                    d();
                    p.unbind(".player");
                    b.player.isActive = !1;
                    b.trigger("onPlayEnd")
                };
            if (!0 === a || !b.player.isActive && !1 !== a) {
                if (b.current && (b.current.loop || b.current.index < b.group.length - 1)) b.player.isActive = !0, p.bind({
                    "onCancel.player beforeClose.player": c,
                    "onUpdate.player": e,
                    "beforeLoad.player": d
                }), e(), b.trigger("onPlayStart")
            } else c()
        },
        next: function(a) {
            var d = b.current;
            d && (q(a) || (a = d.direction.next), b.jumpto(d.index + 1, a, "next"))
        },
        prev: function(a) {
            var d = b.current;
            d && (q(a) || (a = d.direction.prev), b.jumpto(d.index - 1, a, "prev"))
        },
        jumpto: function(a, d, e) {
            var c = b.current;
            c && (a = l(a), b.direction = d || c.direction[a >= c.index ? "next" : "prev"], b.router = e || "jumpto", c.loop && (0 > a && (a = c.group.length + a % c.group.length), a %= c.group.length), c.group[a] !== v && (b.cancel(), b._start(a)))
        },
        reposition: function(a, d) {
            var e = b.current,
                c = e ? e.wrap : null,
                k;
            c && (k = b._getPosition(d), a && "scroll" === a.type ? (delete k.position, c.stop(!0, !0).animate(k, 200)) : (c.css(k), e.pos = f.extend({}, e.dim, k)))
        },
        update: function(a) {
            var d = a && a.type,
                e = !d || "orientationchange" === d;
            e && (clearTimeout(B), B = null);
            b.isOpen && !B && (B = setTimeout(function() {
                var c = b.current;
                c && !b.isClosing && (b.wrap.removeClass("fancybox-tmp"), (e || "load" === d || "resize" === d && c.autoResize) && b._setDimension(), "scroll" === d && c.canShrink || b.reposition(a), b.trigger("onUpdate"), B = null)
            }, e && !s ? 0 : 300))
        },
        toggle: function(a) {
            b.isOpen && (b.current.fitToView = "boolean" === f.type(a) ? a : !b.current.fitToView, s && (b.wrap.removeAttr("style").addClass("fancybox-tmp"), b.trigger("onUpdate")), b.update())
        },
        hideLoading: function() {
            p.unbind(".loading");
            f("#fancybox-loading").remove()
        },
        showLoading: function() {
            var a, d;
            b.hideLoading();
            a = f('<div id="fancybox-loading"><div></div></div>').click(b.cancel).appendTo("body");
            p.bind("keydown.loading", function(a) {
                if (27 === (a.which || a.keyCode)) a.preventDefault(), b.cancel()
            });
            b.defaults.fixed || (d = b.getViewport(), a.css({
                position: "absolute",
                top: 0.5 * d.h + d.y,
                left: 0.5 * d.w + d.x
            }))
        },
        getViewport: function() {
            var a = b.current && b.current.locked || !1,
                d = {
                    x: n.scrollLeft(),
                    y: n.scrollTop()
                };
            a ? (d.w = a[0].clientWidth, d.h = a[0].clientHeight) : (d.w = s && r.innerWidth ? r.innerWidth : n.width(), d.h = s && r.innerHeight ? r.innerHeight : n.height());
            return d
        },
        unbindEvents: function() {
            b.wrap && t(b.wrap) && b.wrap.unbind(".fb");
            p.unbind(".fb");
            n.unbind(".fb")
        },
        bindEvents: function() {
            var a = b.current,
                d;
            a && (n.bind("orientationchange.fb" + (s ? "" : " resize.fb") + (a.autoCenter && !a.locked ? " scroll.fb" : ""), b.update), (d = a.keys) && p.bind("keydown.fb", function(e) {
                var c = e.which || e.keyCode,
                    k = e.target || e.srcElement;
                if (27 === c && b.coming) return !1;
                !e.ctrlKey && (!e.altKey && !e.shiftKey && !e.metaKey && (!k || !k.type && !f(k).is("[contenteditable]"))) && f.each(d, function(d, k) {
                    if (1 < a.group.length && k[c] !== v) return b[d](k[c]), e.preventDefault(), !1;
                    if (-1 < f.inArray(c, k)) return b[d](), e.preventDefault(), !1
                })
            }), f.fn.mousewheel && a.mouseWheel && b.wrap.bind("mousewheel.fb", function(d, c, k, g) {
                for (var h = f(d.target || null), j = !1; h.length && !j && !h.is(".fancybox-skin") && !h.is(".fancybox-wrap");) j = h[0] && !(h[0].style.overflow && "hidden" === h[0].style.overflow) && (h[0].clientWidth && h[0].scrollWidth > h[0].clientWidth || h[0].clientHeight && h[0].scrollHeight > h[0].clientHeight), h = f(h).parent();
                if (0 !== c && !j && 1 < b.group.length && !a.canShrink) {
                    if (0 < g || 0 < k) b.prev(0 < g ? "down" : "left");
                    else if (0 > g || 0 > k) b.next(0 > g ? "up" : "right");
                    d.preventDefault()
                }
            }))
        },
        trigger: function(a, d) {
            var e, c = d || b.coming || b.current;
            if (c) {
                f.isFunction(c[a]) && (e = c[a].apply(c, Array.prototype.slice.call(arguments, 1)));
                if (!1 === e) return !1;
                c.helpers && f.each(c.helpers, function(d, e) {
                    if (e && b.helpers[d] && f.isFunction(b.helpers[d][a])) b.helpers[d][a](f.extend(!0, {}, b.helpers[d].defaults, e), c)
                });
                p.trigger(a)
            }
        },
        isImage: function(a) {
            return q(a) && a.match(/(^data:image\/.*,)|(\.(jp(e|g|eg)|gif|png|bmp|webp|svg)((\?|#).*)?$)/i)
        },
        isSWF: function(a) {
            return q(a) && a.match(/\.(swf)((\?|#).*)?$/i)
        },
        _start: function(a) {
            var d = {},
                e, c;
            a = l(a);
            e = b.group[a] || null;
            if (!e) return !1;
            d = f.extend(!0, {}, b.opts, e);
            e = d.margin;
            c = d.padding;
            "number" === f.type(e) && (d.margin = [e, e, e, e]);
            "number" === f.type(c) && (d.padding = [c, c, c, c]);
            d.modal && f.extend(!0, d, {
                closeBtn: !1,
                closeClick: !1,
                nextClick: !1,
                arrows: !1,
                mouseWheel: !1,
                keys: null,
                helpers: {
                    overlay: {
                        closeClick: !1
                    }
                }
            });
            d.autoSize && (d.autoWidth = d.autoHeight = !0);
            "auto" === d.width && (d.autoWidth = !0);
            "auto" === d.height && (d.autoHeight = !0);
            d.group = b.group;
            d.index = a;
            b.coming = d;
            if (!1 === b.trigger("beforeLoad")) b.coming = null;
            else {
                c = d.type;
                e = d.href;
                if (!c) return b.coming = null, b.current && b.router && "jumpto" !== b.router ? (b.current.index = a, b[b.router](b.direction)) : !1;
                b.isActive = !0;
                if ("image" === c || "swf" === c) d.autoHeight = d.autoWidth = !1, d.scrolling = "visible";
                "image" === c && (d.aspectRatio = !0);
                "iframe" === c && s && (d.scrolling = "scroll");
                d.wrap = f(d.tpl.wrap).addClass("fancybox-" + (s ? "mobile" : "desktop") + " fancybox-type-" + c + " fancybox-tmp " + d.wrapCSS).appendTo(d.parent || "body");
                f.extend(d, {
                    skin: f(".fancybox-skin", d.wrap),
                    outer: f(".fancybox-outer", d.wrap),
                    inner: f(".fancybox-inner", d.wrap)
                });
                f.each(["Top", "Right", "Bottom", "Left"], function(a, b) {
                    d.skin.css("padding" + b, w(d.padding[a]))
                });
                b.trigger("onReady");
                if ("inline" === c || "html" === c) {
                    if (!d.content || !d.content.length) return b._error("content")
                } else if (!e) return b._error("href");
                "image" === c ? b._loadImage() : "ajax" === c ? b._loadAjax() : "iframe" === c ? b._loadIframe() : b._afterLoad()
            }
        },
        _error: function(a) {
            f.extend(b.coming, {
                type: "html",
                autoWidth: !0,
                autoHeight: !0,
                minWidth: 0,
                minHeight: 0,
                scrolling: "no",
                hasError: a,
                content: b.coming.tpl.error
            });
            b._afterLoad()
        },
        _loadImage: function() {
            var a = b.imgPreload = new Image;
            a.onload = function() {
                this.onload = this.onerror = null;
                b.coming.width = this.width / b.opts.pixelRatio;
                b.coming.height = this.height / b.opts.pixelRatio;
                b._afterLoad()
            };
            a.onerror = function() {
                this.onload = this.onerror = null;
                b._error("image")
            };
            a.src = b.coming.href;
            !0 !== a.complete && b.showLoading()
        },
        _loadAjax: function() {
            var a = b.coming;
            b.showLoading();
            b.ajaxLoad = f.ajax(f.extend({}, a.ajax, {
                url: a.href,
                error: function(a, e) {
                    b.coming && "abort" !== e ? b._error("ajax", a) : b.hideLoading()
                },
                success: function(d, e) {
                    "success" === e && (a.content = d, b._afterLoad())
                }
            }))
        },
        _loadIframe: function() {
            var a = b.coming,
                d = f(a.tpl.iframe.replace(/\{rnd\}/g, (new Date).getTime())).attr("scrolling", s ? "auto" : a.iframe.scrolling).attr("src", a.href);
            f(a.wrap).bind("onReset", function() {
                try {
                    f(this).find("iframe").hide().attr("src", "//about:blank").end().empty()
                } catch (a) {}
            });
            a.iframe.preload && (b.showLoading(), d.one("load", function() {
                f(this).data("ready", 1);
                s || f(this).bind("load.fb", b.update);
                f(this).parents(".fancybox-wrap").width("100%").removeClass("fancybox-tmp").show();
                b._afterLoad()
            }));
            a.content = d.appendTo(a.inner);
            a.iframe.preload || b._afterLoad()
        },
        _preloadImages: function() {
            var a = b.group,
                d = b.current,
                e = a.length,
                c = d.preload ? Math.min(d.preload, e - 1) : 0,
                f, g;
            for (g = 1; g <= c; g += 1) f = a[(d.index + g) % e], "image" === f.type && f.href && ((new Image).src = f.href)
        },
        _afterLoad: function() {
            var a = b.coming,
                d = b.current,
                e, c, k, g, h;
            b.hideLoading();
            if (a && !1 !== b.isActive)
                if (!1 === b.trigger("afterLoad", a, d)) a.wrap.stop(!0).trigger("onReset").remove(), b.coming = null;
                else {
                    d && (b.trigger("beforeChange", d), d.wrap.stop(!0).removeClass("fancybox-opened").find(".fancybox-item, .fancybox-nav").remove());
                    b.unbindEvents();
                    e = a.content;
                    c = a.type;
                    k = a.scrolling;
                    f.extend(b, {
                        wrap: a.wrap,
                        skin: a.skin,
                        outer: a.outer,
                        inner: a.inner,
                        current: a,
                        previous: d
                    });
                    g = a.href;
                    switch (c) {
                        case "inline":
                        case "ajax":
                        case "html":
                            a.selector ? e = f("<div>").html(e).find(a.selector) : t(e) && (e.data("fancybox-placeholder") || e.data("fancybox-placeholder", f('<div class="fancybox-placeholder"></div>').insertAfter(e).hide()), e = e.show().detach(), a.wrap.bind("onReset", function() {
                                f(this).find(e).length && e.hide().replaceAll(e.data("fancybox-placeholder")).data("fancybox-placeholder", !1)
                            }));
                            break;
                        case "image":
                            e = a.tpl.image.replace("{href}", g);
                            break;
                        case "swf":
                            e = '<object id="fancybox-swf" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="100%" height="100%"><param name="movie" value="' + g + '"></param>', h = "", f.each(a.swf, function(a, b) {
                                e += '<param name="' + a + '" value="' + b + '"></param>';
                                h += " " + a + '="' + b + '"'
                            }), e += '<embed src="' + g + '" type="application/x-shockwave-flash" width="100%" height="100%"' + h + "></embed></object>"
                    }(!t(e) || !e.parent().is(a.inner)) && a.inner.append(e);
                    b.trigger("beforeShow");
                    a.inner.css("overflow", "yes" === k ? "scroll" : "no" === k ? "hidden" : k);
                    b._setDimension();
                    b.reposition();
                    b.isOpen = !1;
                    b.coming = null;
                    b.bindEvents();
                    if (b.isOpened) {
                        if (d.prevMethod) b.transitions[d.prevMethod]()
                    } else f(".fancybox-wrap").not(a.wrap).stop(!0).trigger("onReset").remove();
                    b.transitions[b.isOpened ? a.nextMethod : a.openMethod]();
                    b._preloadImages()
                }
        },
        _setDimension: function() {
            var a = b.getViewport(),
                d = 0,
                e = !1,
                c = !1,
                e = b.wrap,
                k = b.skin,
                g = b.inner,
                h = b.current,
                c = h.width,
                j = h.height,
                m = h.minWidth,
                u = h.minHeight,
                n = h.maxWidth,
                p = h.maxHeight,
                s = h.scrolling,
                q = h.scrollOutside ? h.scrollbarWidth : 0,
                x = h.margin,
                y = l(x[1] + x[3]),
                r = l(x[0] + x[2]),
                v, z, t, C, A, F, B, D, H;
            e.add(k).add(g).width("auto").height("auto").removeClass("fancybox-tmp");
            x = l(k.outerWidth(!0) - k.width());
            v = l(k.outerHeight(!0) - k.height());
            z = y + x;
            t = r + v;
            C = E(c) ? (a.w - z) * l(c) / 100 : c;
            A = E(j) ? (a.h - t) * l(j) / 100 : j;
            if ("iframe" === h.type) {
                if (H = h.content, h.autoHeight && 1 === H.data("ready")) try {
                    H[0].contentWindow.document.location && (g.width(C).height(9999), F = H.contents().find("body"), q && F.css("overflow-x", "hidden"), A = F.outerHeight(!0))
                } catch (G) {}
            } else if (h.autoWidth || h.autoHeight) g.addClass("fancybox-tmp"), h.autoWidth || g.width(C), h.autoHeight || g.height(A), h.autoWidth && (C = g.width()), h.autoHeight && (A = g.height()), g.removeClass("fancybox-tmp");
            c = l(C);
            j = l(A);
            D = C / A;
            m = l(E(m) ? l(m, "w") - z : m);
            n = l(E(n) ? l(n, "w") - z : n);
            u = l(E(u) ? l(u, "h") - t : u);
            p = l(E(p) ? l(p, "h") - t : p);
            F = n;
            B = p;
            h.fitToView && (n = Math.min(a.w - z, n), p = Math.min(a.h - t, p));
            z = a.w - y;
            r = a.h - r;
            h.aspectRatio ? (c > n && (c = n, j = l(c / D)), j > p && (j = p, c = l(j * D)), c < m && (c = m, j = l(c / D)), j < u && (j = u, c = l(j * D))) : (c = Math.max(m, Math.min(c, n)), h.autoHeight && "iframe" !== h.type && (g.width(c), j = g.height()), j = Math.max(u, Math.min(j, p)));
            if (h.fitToView)
                if (g.width(c).height(j), e.width(c + x), a = e.width(), y = e.height(), h.aspectRatio)
                    for (;
                        (a > z || y > r) && (c > m && j > u) && !(19 < d++);) j = Math.max(u, Math.min(p, j - 10)), c = l(j * D), c < m && (c = m, j = l(c / D)), c > n && (c = n, j = l(c / D)), g.width(c).height(j), e.width(c + x), a = e.width(), y = e.height();
                else c = Math.max(m, Math.min(c, c - (a - z))), j = Math.max(u, Math.min(j, j - (y - r)));
            q && ("auto" === s && j < A && c + x + q < z) && (c += q);
            g.width(c).height(j);
            e.width(c + x);
            a = e.width();
            y = e.height();
            e = (a > z || y > r) && c > m && j > u;
            c = h.aspectRatio ? c < F && j < B && c < C && j < A : (c < F || j < B) && (c < C || j < A);
            f.extend(h, {
                dim: {
                    width: w(a),
                    height: w(y)
                },
                origWidth: C,
                origHeight: A,
                canShrink: e,
                canExpand: c,
                wPadding: x,
                hPadding: v,
                wrapSpace: y - k.outerHeight(!0),
                skinSpace: k.height() - j
            });
            !H && (h.autoHeight && j > u && j < p && !c) && g.height("auto")
        },
        _getPosition: function(a) {
            var d = b.current,
                e = b.getViewport(),
                c = d.margin,
                f = b.wrap.width() + c[1] + c[3],
                g = b.wrap.height() + c[0] + c[2],
                c = {
                    position: "absolute",
                    top: c[0],
                    left: c[3]
                };
            d.autoCenter && d.fixed && !a && g <= e.h && f <= e.w ? c.position = "fixed" : d.locked || (c.top += e.y, c.left += e.x);
            c.top = w(Math.max(c.top, c.top + (e.h - g) * d.topRatio));
            c.left = w(Math.max(c.left, c.left + (e.w - f) * d.leftRatio));
            return c
        },
        _afterZoomIn: function() {
            var a = b.current;
            a && (b.isOpen = b.isOpened = !0, b.wrap.css("overflow", "visible").addClass("fancybox-opened"), b.update(), (a.closeClick || a.nextClick && 1 < b.group.length) && b.inner.css("cursor", "pointer").bind("click.fb", function(d) {
                !f(d.target).is("a") && !f(d.target).parent().is("a") && (d.preventDefault(), b[a.closeClick ? "close" : "next"]())
            }), a.closeBtn && f(a.tpl.closeBtn).appendTo(b.skin).bind("click.fb", function(a) {
                a.preventDefault();
                b.close()
            }), a.arrows && 1 < b.group.length && ((a.loop || 0 < a.index) && f(a.tpl.prev).appendTo(b.outer).bind("click.fb", b.prev), (a.loop || a.index < b.group.length - 1) && f(a.tpl.next).appendTo(b.outer).bind("click.fb", b.next)), b.trigger("afterShow"), !a.loop && a.index === a.group.length - 1 ? b.play(!1) : b.opts.autoPlay && !b.player.isActive && (b.opts.autoPlay = !1, b.play()))
        },
        _afterZoomOut: function(a) {
            a = a || b.current;
            f(".fancybox-wrap").trigger("onReset").remove();
            f.extend(b, {
                group: {},
                opts: {},
                router: !1,
                current: null,
                isActive: !1,
                isOpened: !1,
                isOpen: !1,
                isClosing: !1,
                wrap: null,
                skin: null,
                outer: null,
                inner: null
            });
            b.trigger("afterClose", a)
        }
    });
    b.transitions = {
        getOrigPosition: function() {
            var a = b.current,
                d = a.element,
                e = a.orig,
                c = {},
                f = 50,
                g = 50,
                h = a.hPadding,
                j = a.wPadding,
                m = b.getViewport();
            !e && (a.isDom && d.is(":visible")) && (e = d.find("img:first"), e.length || (e = d));
            t(e) ? (c = e.offset(), e.is("img") && (f = e.outerWidth(), g = e.outerHeight())) : (c.top = m.y + (m.h - g) * a.topRatio, c.left = m.x + (m.w - f) * a.leftRatio);
            if ("fixed" === b.wrap.css("position") || a.locked) c.top -= m.y, c.left -= m.x;
            return c = {
                top: w(c.top - h * a.topRatio),
                left: w(c.left - j * a.leftRatio),
                width: w(f + j),
                height: w(g + h)
            }
        },
        step: function(a, d) {
            var e, c, f = d.prop;
            c = b.current;
            var g = c.wrapSpace,
                h = c.skinSpace;
            if ("width" === f || "height" === f) e = d.end === d.start ? 1 : (a - d.start) / (d.end - d.start), b.isClosing && (e = 1 - e), c = "width" === f ? c.wPadding : c.hPadding, c = a - c, b.skin[f](l("width" === f ? c : c - g * e)), b.inner[f](l("width" === f ? c : c - g * e - h * e))
        },
        zoomIn: function() {
            var a = b.current,
                d = a.pos,
                e = a.openEffect,
                c = "elastic" === e,
                k = f.extend({
                    opacity: 1
                }, d);
            delete k.position;
            c ? (d = this.getOrigPosition(), a.openOpacity && (d.opacity = 0.1)) : "fade" === e && (d.opacity = 0.1);
            b.wrap.css(d).animate(k, {
                duration: "none" === e ? 0 : a.openSpeed,
                easing: a.openEasing,
                step: c ? this.step : null,
                complete: b._afterZoomIn
            })
        },
        zoomOut: function() {
            var a = b.current,
                d = a.closeEffect,
                e = "elastic" === d,
                c = {
                    opacity: 0.1
                };
            e && (c = this.getOrigPosition(), a.closeOpacity && (c.opacity = 0.1));
            b.wrap.animate(c, {
                duration: "none" === d ? 0 : a.closeSpeed,
                easing: a.closeEasing,
                step: e ? this.step : null,
                complete: b._afterZoomOut
            })
        },
        changeIn: function() {
            var a = b.current,
                d = a.nextEffect,
                e = a.pos,
                c = {
                    opacity: 1
                },
                f = b.direction,
                g;
            e.opacity = 0.1;
            "elastic" === d && (g = "down" === f || "up" === f ? "top" : "left", "down" === f || "right" === f ? (e[g] = w(l(e[g]) - 200), c[g] = "+=200px") : (e[g] = w(l(e[g]) + 200), c[g] = "-=200px"));
            "none" === d ? b._afterZoomIn() : b.wrap.css(e).animate(c, {
                duration: a.nextSpeed,
                easing: a.nextEasing,
                complete: b._afterZoomIn
            })
        },
        changeOut: function() {
            var a = b.previous,
                d = a.prevEffect,
                e = {
                    opacity: 0.1
                },
                c = b.direction;
            "elastic" === d && (e["down" === c || "up" === c ? "top" : "left"] = ("up" === c || "left" === c ? "-" : "+") + "=200px");
            a.wrap.animate(e, {
                duration: "none" === d ? 0 : a.prevSpeed,
                easing: a.prevEasing,
                complete: function() {
                    f(this).trigger("onReset").remove()
                }
            })
        }
    };
    b.helpers.overlay = {
        defaults: {
            closeClick: !0,
            speedOut: 200,
            showEarly: !0,
            css: {},
            locked: !s,
            fixed: !0
        },
        overlay: null,
        fixed: !1,
        el: f("html"),
        create: function(a) {
            a = f.extend({}, this.defaults, a);
            this.overlay && this.close();
            this.overlay = f('<div class="fancybox-overlay"></div>').appendTo(b.coming ? b.coming.parent : a.parent);
            this.fixed = !1;
            a.fixed && b.defaults.fixed && (this.overlay.addClass("fancybox-overlay-fixed"), this.fixed = !0)
        },
        open: function(a) {
            var d = this;
            a = f.extend({}, this.defaults, a);
            this.overlay ? this.overlay.unbind(".overlay").width("auto").height("auto") : this.create(a);
            this.fixed || (n.bind("resize.overlay", f.proxy(this.update, this)), this.update());
            a.closeClick && this.overlay.bind("click.overlay", function(a) {
                if (f(a.target).hasClass("fancybox-overlay")) return b.isActive ? b.close() : d.close(), !1
            });
            this.overlay.css(a.css).show()
        },
        close: function() {
            var a, b;
            n.unbind("resize.overlay");
            this.el.hasClass("fancybox-lock") && (f(".fancybox-margin").removeClass("fancybox-margin"), a = n.scrollTop(), b = n.scrollLeft(), this.el.removeClass("fancybox-lock"), n.scrollTop(a).scrollLeft(b));
            f(".fancybox-overlay").remove().hide();
            f.extend(this, {
                overlay: null,
                fixed: !1
            })
        },
        update: function() {
            var a = "100%",
                b;
            this.overlay.width(a).height("100%");
            I ? (b = Math.max(G.documentElement.offsetWidth, G.body.offsetWidth), p.width() > b && (a = p.width())) : p.width() > n.width() && (a = p.width());
            this.overlay.width(a).height(p.height())
        },
        onReady: function(a, b) {
            var e = this.overlay;
            f(".fancybox-overlay").stop(!0, !0);
            e || this.create(a);
            a.locked && (this.fixed && b.fixed) && (e || (this.margin = p.height() > n.height() ? f("html").css("margin-right").replace("px", "") : !1), b.locked = this.overlay.append(b.wrap), b.fixed = !1);
            !0 === a.showEarly && this.beforeShow.apply(this, arguments)
        },
        beforeShow: function(a, b) {
            var e, c;
            b.locked && (!1 !== this.margin && (f("*").filter(function() {
                return "fixed" === f(this).css("position") && !f(this).hasClass("fancybox-overlay") && !f(this).hasClass("fancybox-wrap")
            }).addClass("fancybox-margin"), this.el.addClass("fancybox-margin")), e = n.scrollTop(), c = n.scrollLeft(), this.el.addClass("fancybox-lock"), n.scrollTop(e).scrollLeft(c));
            this.open(a)
        },
        onUpdate: function() {
            this.fixed || this.update()
        },
        afterClose: function(a) {
            this.overlay && !b.coming && this.overlay.fadeOut(a.speedOut, f.proxy(this.close, this))
        }
    };
    b.helpers.title = {
        defaults: {
            type: "float",
            position: "bottom"
        },
        beforeShow: function(a) {
            var d = b.current,
                e = d.title,
                c = a.type;
            f.isFunction(e) && (e = e.call(d.element, d));
            if (q(e) && "" !== f.trim(e)) {
                d = f('<div class="fancybox-title fancybox-title-' + c + '-wrap">' + e + "</div>");
                switch (c) {
                    case "inside":
                        c = b.skin;
                        break;
                    case "outside":
                        c = b.wrap;
                        break;
                    case "over":
                        c = b.inner;
                        break;
                    default:
                        c = b.skin, d.appendTo("body"), I && d.width(d.width()), d.wrapInner('<span class="child"></span>'), b.current.margin[2] += Math.abs(l(d.css("margin-bottom")))
                }
                d["top" === a.position ? "prependTo" : "appendTo"](c)
            }
        }
    };
    f.fn.fancybox = function(a) {
        var d, e = f(this),
            c = this.selector || "",
            k = function(g) {
                var h = f(this).blur(),
                    j = d,
                    k, l;
                !g.ctrlKey && (!g.altKey && !g.shiftKey && !g.metaKey) && !h.is(".fancybox-wrap") && (k = a.groupAttr || "data-fancybox-group", l = h.attr(k), l || (k = "rel", l = h.get(0)[k]), l && ("" !== l && "nofollow" !== l) && (h = c.length ? f(c) : e, h = h.filter("[" + k + '="' + l + '"]'), j = h.index(this)), a.index = j, !1 !== b.open(h, a) && g.preventDefault())
            };
        a = a || {};
        d = a.index || 0;
        !c || !1 === a.live ? e.unbind("click.fb-start").bind("click.fb-start", k) : p.undelegate(c, "click.fb-start").delegate(c + ":not('.fancybox-item, .fancybox-nav')", "click.fb-start", k);
        this.filter("[data-fancybox-start=1]").trigger("click");
        return this
    };
    p.ready(function() {
        var a, d;
        f.scrollbarWidth === v && (f.scrollbarWidth = function() {
            var a = f('<div style="width:50px;height:50px;overflow:auto"><div/></div>').appendTo("body"),
                b = a.children(),
                b = b.innerWidth() - b.height(99).innerWidth();
            a.remove();
            return b
        });
        if (f.support.fixedPosition === v) {
            a = f.support;
            d = f('<div style="position:fixed;top:20px;"></div>').appendTo("body");
            var e = 20 === d[0].offsetTop || 15 === d[0].offsetTop;
            d.remove();
            a.fixedPosition = e
        }
        f.extend(b.defaults, {
            scrollbarWidth: f.scrollbarWidth(),
            fixed: f.support.fixedPosition,
            parent: f("body")
        });
        a = f(r).width();
        J.addClass("fancybox-lock-test");
        d = f(r).width();
        J.removeClass("fancybox-lock-test");
        f("<style type='text/css'>.fancybox-margin{margin-right:" + (d - a) + "px;}</style>").appendTo("head")
    })
})(window, document, jQuery); /* assets/js/validate/jquery.validate.min.js */
/*! jQuery Validation Plugin - v1.13.1 - 10/14/2014
 * http://jqueryvalidation.org/
 * Copyright (c) 2014 Jörn Zaefferer; Licensed MIT */
! function(a) {
    "function" == typeof define && define.amd ? define(["jquery"], a) : a(jQuery)
}(function(a) {
    a.extend(a.fn, {
        validate: function(b) {
            if (!this.length) return void(b && b.debug && window.console && console.warn("Nothing selected, can't validate, returning nothing."));
            var c = a.data(this[0], "validator");
            return c ? c : (this.attr("novalidate", "novalidate"), c = new a.validator(b, this[0]), a.data(this[0], "validator", c), c.settings.onsubmit && (this.validateDelegate(":submit", "click", function(b) {
                c.settings.submitHandler && (c.submitButton = b.target), a(b.target).hasClass("cancel") && (c.cancelSubmit = !0), void 0 !== a(b.target).attr("formnovalidate") && (c.cancelSubmit = !0)
            }), this.submit(function(b) {
                function d() {
                    var d, e;
                    return c.settings.submitHandler ? (c.submitButton && (d = a("<input type='hidden'/>").attr("name", c.submitButton.name).val(a(c.submitButton).val()).appendTo(c.currentForm)), e = c.settings.submitHandler.call(c, c.currentForm, b), c.submitButton && d.remove(), void 0 !== e ? e : !1) : !0
                }
                return c.settings.debug && b.preventDefault(), c.cancelSubmit ? (c.cancelSubmit = !1, d()) : c.form() ? c.pendingRequest ? (c.formSubmitted = !0, !1) : d() : (c.focusInvalid(), !1)
            })), c)
        },
        valid: function() {
            var b, c;
            return a(this[0]).is("form") ? b = this.validate().form() : (b = !0, c = a(this[0].form).validate(), this.each(function() {
                b = c.element(this) && b
            })), b
        },
        removeAttrs: function(b) {
            var c = {},
                d = this;
            return a.each(b.split(/\s/), function(a, b) {
                c[b] = d.attr(b), d.removeAttr(b)
            }), c
        },
        rules: function(b, c) {
            var d, e, f, g, h, i, j = this[0];
            if (b) switch (d = a.data(j.form, "validator").settings, e = d.rules, f = a.validator.staticRules(j), b) {
                case "add":
                    a.extend(f, a.validator.normalizeRule(c)), delete f.messages, e[j.name] = f, c.messages && (d.messages[j.name] = a.extend(d.messages[j.name], c.messages));
                    break;
                case "remove":
                    return c ? (i = {}, a.each(c.split(/\s/), function(b, c) {
                        i[c] = f[c], delete f[c], "required" === c && a(j).removeAttr("aria-required")
                    }), i) : (delete e[j.name], f)
            }
            return g = a.validator.normalizeRules(a.extend({}, a.validator.classRules(j), a.validator.attributeRules(j), a.validator.dataRules(j), a.validator.staticRules(j)), j), g.required && (h = g.required, delete g.required, g = a.extend({
                required: h
            }, g), a(j).attr("aria-required", "true")), g.remote && (h = g.remote, delete g.remote, g = a.extend(g, {
                remote: h
            })), g
        }
    }), a.extend(a.expr[":"], {
        blank: function(b) {
            return !a.trim("" + a(b).val())
        },
        filled: function(b) {
            return !!a.trim("" + a(b).val())
        },
        unchecked: function(b) {
            return !a(b).prop("checked")
        }
    }), a.validator = function(b, c) {
        this.settings = a.extend(!0, {}, a.validator.defaults, b), this.currentForm = c, this.init()
    }, a.validator.format = function(b, c) {
        return 1 === arguments.length ? function() {
            var c = a.makeArray(arguments);
            return c.unshift(b), a.validator.format.apply(this, c)
        } : (arguments.length > 2 && c.constructor !== Array && (c = a.makeArray(arguments).slice(1)), c.constructor !== Array && (c = [c]), a.each(c, function(a, c) {
            b = b.replace(new RegExp("\\{" + a + "\\}", "g"), function() {
                return c
            })
        }), b)
    }, a.extend(a.validator, {
        defaults: {
            messages: {},
            groups: {},
            rules: {},
            errorClass: "error",
            validClass: "valid",
            errorElement: "label",
            focusCleanup: !1,
            focusInvalid: !0,
            errorContainer: a([]),
            errorLabelContainer: a([]),
            onsubmit: !0,
            ignore: ":hidden",
            ignoreTitle: !1,
            onfocusin: function(a) {
                this.lastActive = a, this.settings.focusCleanup && (this.settings.unhighlight && this.settings.unhighlight.call(this, a, this.settings.errorClass, this.settings.validClass), this.hideThese(this.errorsFor(a)))
            },
            onfocusout: function(a) {
                this.checkable(a) || !(a.name in this.submitted) && this.optional(a) || this.element(a)
            },
            onkeyup: function(a, b) {
                (9 !== b.which || "" !== this.elementValue(a)) && (a.name in this.submitted || a === this.lastElement) && this.element(a)
            },
            onclick: function(a) {
                a.name in this.submitted ? this.element(a) : a.parentNode.name in this.submitted && this.element(a.parentNode)
            },
            highlight: function(b, c, d) {
                "radio" === b.type ? this.findByName(b.name).addClass(c).removeClass(d) : a(b).addClass(c).removeClass(d)
            },
            unhighlight: function(b, c, d) {
                "radio" === b.type ? this.findByName(b.name).removeClass(c).addClass(d) : a(b).removeClass(c).addClass(d)
            }
        },
        setDefaults: function(b) {
            a.extend(a.validator.defaults, b)
        },
        messages: {
            required: "This field is required.",
            remote: "Please fix this field.",
            email: "Please enter a valid email address.",
            url: "Please enter a valid URL.",
            date: "Please enter a valid date.",
            dateISO: "Please enter a valid date ( ISO ).",
            number: "Please enter a valid number.",
            digits: "Please enter only digits.",
            creditcard: "Please enter a valid credit card number.",
            equalTo: "Please enter the same value again.",
            maxlength: a.validator.format("Please enter no more than {0} characters."),
            minlength: a.validator.format("Please enter at least {0} characters."),
            rangelength: a.validator.format("Please enter a value between {0} and {1} characters long."),
            range: a.validator.format("Please enter a value between {0} and {1}."),
            max: a.validator.format("Please enter a value less than or equal to {0}."),
            min: a.validator.format("Please enter a value greater than or equal to {0}.")
        },
        autoCreateRanges: !1,
        prototype: {
            init: function() {
                function b(b) {
                    var c = a.data(this[0].form, "validator"),
                        d = "on" + b.type.replace(/^validate/, ""),
                        e = c.settings;
                    e[d] && !this.is(e.ignore) && e[d].call(c, this[0], b)
                }
                this.labelContainer = a(this.settings.errorLabelContainer), this.errorContext = this.labelContainer.length && this.labelContainer || a(this.currentForm), this.containers = a(this.settings.errorContainer).add(this.settings.errorLabelContainer), this.submitted = {}, this.valueCache = {}, this.pendingRequest = 0, this.pending = {}, this.invalid = {}, this.reset();
                var c, d = this.groups = {};
                a.each(this.settings.groups, function(b, c) {
                    "string" == typeof c && (c = c.split(/\s/)), a.each(c, function(a, c) {
                        d[c] = b
                    })
                }), c = this.settings.rules, a.each(c, function(b, d) {
                    c[b] = a.validator.normalizeRule(d)
                }), a(this.currentForm).validateDelegate(":text, [type='password'], [type='file'], select, textarea, [type='number'], [type='search'] ,[type='tel'], [type='url'], [type='email'], [type='datetime'], [type='date'], [type='month'], [type='week'], [type='time'], [type='datetime-local'], [type='range'], [type='color'], [type='radio'], [type='checkbox']", "focusin focusout keyup", b).validateDelegate("select, option, [type='radio'], [type='checkbox']", "click", b), this.settings.invalidHandler && a(this.currentForm).bind("invalid-form.validate", this.settings.invalidHandler), a(this.currentForm).find("[required], [data-rule-required], .required").attr("aria-required", "true")
            },
            form: function() {
                return this.checkForm(), a.extend(this.submitted, this.errorMap), this.invalid = a.extend({}, this.errorMap), this.valid() || a(this.currentForm).triggerHandler("invalid-form", [this]), this.showErrors(), this.valid()
            },
            checkForm: function() {
                this.prepareForm();
                for (var a = 0, b = this.currentElements = this.elements(); b[a]; a++) this.check(b[a]);
                return this.valid()
            },
            element: function(b) {
                var c = this.clean(b),
                    d = this.validationTargetFor(c),
                    e = !0;
                return this.lastElement = d, void 0 === d ? delete this.invalid[c.name] : (this.prepareElement(d), this.currentElements = a(d), e = this.check(d) !== !1, e ? delete this.invalid[d.name] : this.invalid[d.name] = !0), a(b).attr("aria-invalid", !e), this.numberOfInvalids() || (this.toHide = this.toHide.add(this.containers)), this.showErrors(), e
            },
            showErrors: function(b) {
                if (b) {
                    a.extend(this.errorMap, b), this.errorList = [];
                    for (var c in b) this.errorList.push({
                        message: b[c],
                        element: this.findByName(c)[0]
                    });
                    this.successList = a.grep(this.successList, function(a) {
                        return !(a.name in b)
                    })
                }
                this.settings.showErrors ? this.settings.showErrors.call(this, this.errorMap, this.errorList) : this.defaultShowErrors()
            },
            resetForm: function() {
                a.fn.resetForm && a(this.currentForm).resetForm(), this.submitted = {}, this.lastElement = null, this.prepareForm(), this.hideErrors(), this.elements().removeClass(this.settings.errorClass).removeData("previousValue").removeAttr("aria-invalid")
            },
            numberOfInvalids: function() {
                return this.objectLength(this.invalid)
            },
            objectLength: function(a) {
                var b, c = 0;
                for (b in a) c++;
                return c
            },
            hideErrors: function() {
                this.hideThese(this.toHide)
            },
            hideThese: function(a) {
                a.not(this.containers).text(""), this.addWrapper(a).hide()
            },
            valid: function() {
                return 0 === this.size()
            },
            size: function() {
                return this.errorList.length
            },
            focusInvalid: function() {
                if (this.settings.focusInvalid) try {
                    a(this.findLastActive() || this.errorList.length && this.errorList[0].element || []).filter(":visible").focus().trigger("focusin")
                } catch (b) {}
            },
            findLastActive: function() {
                var b = this.lastActive;
                return b && 1 === a.grep(this.errorList, function(a) {
                    return a.element.name === b.name
                }).length && b
            },
            elements: function() {
                var b = this,
                    c = {};
                return a(this.currentForm).find("input, select, textarea").not(":submit, :reset, :image, [disabled], [readonly]").not(this.settings.ignore).filter(function() {
                    return !this.name && b.settings.debug && window.console && console.error("%o has no name assigned", this), this.name in c || !b.objectLength(a(this).rules()) ? !1 : (c[this.name] = !0, !0)
                })
            },
            clean: function(b) {
                return a(b)[0]
            },
            errors: function() {
                var b = this.settings.errorClass.split(" ").join(".");
                return a(this.settings.errorElement + "." + b, this.errorContext)
            },
            reset: function() {
                this.successList = [], this.errorList = [], this.errorMap = {}, this.toShow = a([]), this.toHide = a([]), this.currentElements = a([])
            },
            prepareForm: function() {
                this.reset(), this.toHide = this.errors().add(this.containers)
            },
            prepareElement: function(a) {
                this.reset(), this.toHide = this.errorsFor(a)
            },
            elementValue: function(b) {
                var c, d = a(b),
                    e = b.type;
                return "radio" === e || "checkbox" === e ? a("input[name='" + b.name + "']:checked").val() : "number" === e && "undefined" != typeof b.validity ? b.validity.badInput ? !1 : d.val() : (c = d.val(), "string" == typeof c ? c.replace(/\r/g, "") : c)
            },
            check: function(b) {
                b = this.validationTargetFor(this.clean(b));
                var c, d, e, f = a(b).rules(),
                    g = a.map(f, function(a, b) {
                        return b
                    }).length,
                    h = !1,
                    i = this.elementValue(b);
                for (d in f) {
                    e = {
                        method: d,
                        parameters: f[d]
                    };
                    try {
                        if (c = a.validator.methods[d].call(this, i, b, e.parameters), "dependency-mismatch" === c && 1 === g) {
                            h = !0;
                            continue
                        }
                        if (h = !1, "pending" === c) return void(this.toHide = this.toHide.not(this.errorsFor(b)));
                        if (!c) return this.formatAndAdd(b, e), !1
                    } catch (j) {
                        throw this.settings.debug && window.console && console.log("Exception occurred when checking element " + b.id + ", check the '" + e.method + "' method.", j), j
                    }
                }
                if (!h) return this.objectLength(f) && this.successList.push(b), !0
            },
            customDataMessage: function(b, c) {
                return a(b).data("msg" + c.charAt(0).toUpperCase() + c.substring(1).toLowerCase()) || a(b).data("msg")
            },
            customMessage: function(a, b) {
                var c = this.settings.messages[a];
                return c && (c.constructor === String ? c : c[b])
            },
            findDefined: function() {
                for (var a = 0; a < arguments.length; a++)
                    if (void 0 !== arguments[a]) return arguments[a];
                return void 0
            },
            defaultMessage: function(b, c) {
                return this.findDefined(this.customMessage(b.name, c), this.customDataMessage(b, c), !this.settings.ignoreTitle && b.title || void 0, a.validator.messages[c], "<strong>Warning: No message defined for " + b.name + "</strong>")
            },
            formatAndAdd: function(b, c) {
                var d = this.defaultMessage(b, c.method),
                    e = /\$?\{(\d+)\}/g;
                "function" == typeof d ? d = d.call(this, c.parameters, b) : e.test(d) && (d = a.validator.format(d.replace(e, "{$1}"), c.parameters)), this.errorList.push({
                    message: d,
                    element: b,
                    method: c.method
                }), this.errorMap[b.name] = d, this.submitted[b.name] = d
            },
            addWrapper: function(a) {
                return this.settings.wrapper && (a = a.add(a.parent(this.settings.wrapper))), a
            },
            defaultShowErrors: function() {
                var a, b, c;
                for (a = 0; this.errorList[a]; a++) c = this.errorList[a], this.settings.highlight && this.settings.highlight.call(this, c.element, this.settings.errorClass, this.settings.validClass), this.showLabel(c.element, c.message);
                if (this.errorList.length && (this.toShow = this.toShow.add(this.containers)), this.settings.success)
                    for (a = 0; this.successList[a]; a++) this.showLabel(this.successList[a]);
                if (this.settings.unhighlight)
                    for (a = 0, b = this.validElements(); b[a]; a++) this.settings.unhighlight.call(this, b[a], this.settings.errorClass, this.settings.validClass);
                this.toHide = this.toHide.not(this.toShow), this.hideErrors(), this.addWrapper(this.toShow).show()
            },
            validElements: function() {
                return this.currentElements.not(this.invalidElements())
            },
            invalidElements: function() {
                return a(this.errorList).map(function() {
                    return this.element
                })
            },
            showLabel: function(b, c) {
                var d, e, f, g = this.errorsFor(b),
                    h = this.idOrName(b),
                    i = a(b).attr("aria-describedby");
                g.length ? (g.removeClass(this.settings.validClass).addClass(this.settings.errorClass), g.html(c)) : (g = a("<" + this.settings.errorElement + ">").attr("id", h + "-error").addClass(this.settings.errorClass).html(c || ""), d = g, this.settings.wrapper && (d = g.hide().show().wrap("<" + this.settings.wrapper + "/>").parent()), this.labelContainer.length ? this.labelContainer.append(d) : this.settings.errorPlacement ? this.settings.errorPlacement(d, a(b)) : d.insertAfter(b), g.is("label") ? g.attr("for", h) : 0 === g.parents("label[for='" + h + "']").length && (f = g.attr("id").replace(/(:|\.|\[|\])/g, "\\$1"), i ? i.match(new RegExp("\\b" + f + "\\b")) || (i += " " + f) : i = f, a(b).attr("aria-describedby", i), e = this.groups[b.name], e && a.each(this.groups, function(b, c) {
                    c === e && a("[name='" + b + "']", this.currentForm).attr("aria-describedby", g.attr("id"))
                }))), !c && this.settings.success && (g.text(""), "string" == typeof this.settings.success ? g.addClass(this.settings.success) : this.settings.success(g, b)), this.toShow = this.toShow.add(g)
            },
            errorsFor: function(b) {
                var c = this.idOrName(b),
                    d = a(b).attr("aria-describedby"),
                    e = "label[for='" + c + "'], label[for='" + c + "'] *";
                return d && (e = e + ", #" + d.replace(/\s+/g, ", #")), this.errors().filter(e)
            },
            idOrName: function(a) {
                return this.groups[a.name] || (this.checkable(a) ? a.name : a.id || a.name)
            },
            validationTargetFor: function(b) {
                return this.checkable(b) && (b = this.findByName(b.name)), a(b).not(this.settings.ignore)[0]
            },
            checkable: function(a) {
                return /radio|checkbox/i.test(a.type)
            },
            findByName: function(b) {
                return a(this.currentForm).find("[name='" + b + "']")
            },
            getLength: function(b, c) {
                switch (c.nodeName.toLowerCase()) {
                    case "select":
                        return a("option:selected", c).length;
                    case "input":
                        if (this.checkable(c)) return this.findByName(c.name).filter(":checked").length
                }
                return b.length
            },
            depend: function(a, b) {
                return this.dependTypes[typeof a] ? this.dependTypes[typeof a](a, b) : !0
            },
            dependTypes: {
                "boolean": function(a) {
                    return a
                },
                string: function(b, c) {
                    return !!a(b, c.form).length
                },
                "function": function(a, b) {
                    return a(b)
                }
            },
            optional: function(b) {
                var c = this.elementValue(b);
                return !a.validator.methods.required.call(this, c, b) && "dependency-mismatch"
            },
            startRequest: function(a) {
                this.pending[a.name] || (this.pendingRequest++, this.pending[a.name] = !0)
            },
            stopRequest: function(b, c) {
                this.pendingRequest--, this.pendingRequest < 0 && (this.pendingRequest = 0), delete this.pending[b.name], c && 0 === this.pendingRequest && this.formSubmitted && this.form() ? (a(this.currentForm).submit(), this.formSubmitted = !1) : !c && 0 === this.pendingRequest && this.formSubmitted && (a(this.currentForm).triggerHandler("invalid-form", [this]), this.formSubmitted = !1)
            },
            previousValue: function(b) {
                return a.data(b, "previousValue") || a.data(b, "previousValue", {
                    old: null,
                    valid: !0,
                    message: this.defaultMessage(b, "remote")
                })
            }
        },
        classRuleSettings: {
            required: {
                required: !0
            },
            email: {
                email: !0
            },
            url: {
                url: !0
            },
            date: {
                date: !0
            },
            dateISO: {
                dateISO: !0
            },
            number: {
                number: !0
            },
            digits: {
                digits: !0
            },
            creditcard: {
                creditcard: !0
            }
        },
        addClassRules: function(b, c) {
            b.constructor === String ? this.classRuleSettings[b] = c : a.extend(this.classRuleSettings, b)
        },
        classRules: function(b) {
            var c = {},
                d = a(b).attr("class");
            return d && a.each(d.split(" "), function() {
                this in a.validator.classRuleSettings && a.extend(c, a.validator.classRuleSettings[this])
            }), c
        },
        attributeRules: function(b) {
            var c, d, e = {},
                f = a(b),
                g = b.getAttribute("type");
            for (c in a.validator.methods) "required" === c ? (d = b.getAttribute(c), "" === d && (d = !0), d = !!d) : d = f.attr(c), /min|max/.test(c) && (null === g || /number|range|text/.test(g)) && (d = Number(d)), d || 0 === d ? e[c] = d : g === c && "range" !== g && (e[c] = !0);
            return e.maxlength && /-1|2147483647|524288/.test(e.maxlength) && delete e.maxlength, e
        },
        dataRules: function(b) {
            var c, d, e = {},
                f = a(b);
            for (c in a.validator.methods) d = f.data("rule" + c.charAt(0).toUpperCase() + c.substring(1).toLowerCase()), void 0 !== d && (e[c] = d);
            return e
        },
        staticRules: function(b) {
            var c = {},
                d = a.data(b.form, "validator");
            return d.settings.rules && (c = a.validator.normalizeRule(d.settings.rules[b.name]) || {}), c
        },
        normalizeRules: function(b, c) {
            return a.each(b, function(d, e) {
                if (e === !1) return void delete b[d];
                if (e.param || e.depends) {
                    var f = !0;
                    switch (typeof e.depends) {
                        case "string":
                            f = !!a(e.depends, c.form).length;
                            break;
                        case "function":
                            f = e.depends.call(c, c)
                    }
                    f ? b[d] = void 0 !== e.param ? e.param : !0 : delete b[d]
                }
            }), a.each(b, function(d, e) {
                b[d] = a.isFunction(e) ? e(c) : e
            }), a.each(["minlength", "maxlength"], function() {
                b[this] && (b[this] = Number(b[this]))
            }), a.each(["rangelength", "range"], function() {
                var c;
                b[this] && (a.isArray(b[this]) ? b[this] = [Number(b[this][0]), Number(b[this][1])] : "string" == typeof b[this] && (c = b[this].replace(/[\[\]]/g, "").split(/[\s,]+/), b[this] = [Number(c[0]), Number(c[1])]))
            }), a.validator.autoCreateRanges && (null != b.min && null != b.max && (b.range = [b.min, b.max], delete b.min, delete b.max), null != b.minlength && null != b.maxlength && (b.rangelength = [b.minlength, b.maxlength], delete b.minlength, delete b.maxlength)), b
        },
        normalizeRule: function(b) {
            if ("string" == typeof b) {
                var c = {};
                a.each(b.split(/\s/), function() {
                    c[this] = !0
                }), b = c
            }
            return b
        },
        addMethod: function(b, c, d) {
            a.validator.methods[b] = c, a.validator.messages[b] = void 0 !== d ? d : a.validator.messages[b], c.length < 3 && a.validator.addClassRules(b, a.validator.normalizeRule(b))
        },
        methods: {
            required: function(b, c, d) {
                if (!this.depend(d, c)) return "dependency-mismatch";
                if ("select" === c.nodeName.toLowerCase()) {
                    var e = a(c).val();
                    return e && e.length > 0
                }
                return this.checkable(c) ? this.getLength(b, c) > 0 : a.trim(b).length > 0
            },
            email: function(a, b) {
                return this.optional(b) || /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(a)
            },
            url: function(a, b) {
                return this.optional(b) || /^(https?|s?ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(a)
            },
            date: function(a, b) {
                return this.optional(b) || !/Invalid|NaN/.test(new Date(a).toString())
            },
            dateISO: function(a, b) {
                return this.optional(b) || /^\d{4}[\/\-](0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])$/.test(a)
            },
            number: function(a, b) {
                return this.optional(b) || /^-?(?:\d+|\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/.test(a)
            },
            digits: function(a, b) {
                return this.optional(b) || /^\d+$/.test(a)
            },
            creditcard: function(a, b) {
                if (this.optional(b)) return "dependency-mismatch";
                if (/[^0-9 \-]+/.test(a)) return !1;
                var c, d, e = 0,
                    f = 0,
                    g = !1;
                if (a = a.replace(/\D/g, ""), a.length < 13 || a.length > 19) return !1;
                for (c = a.length - 1; c >= 0; c--) d = a.charAt(c), f = parseInt(d, 10), g && (f *= 2) > 9 && (f -= 9), e += f, g = !g;
                return e % 10 === 0
            },
            minlength: function(b, c, d) {
                var e = a.isArray(b) ? b.length : this.getLength(b, c);
                return this.optional(c) || e >= d
            },
            maxlength: function(b, c, d) {
                var e = a.isArray(b) ? b.length : this.getLength(b, c);
                return this.optional(c) || d >= e
            },
            rangelength: function(b, c, d) {
                var e = a.isArray(b) ? b.length : this.getLength(b, c);
                return this.optional(c) || e >= d[0] && e <= d[1]
            },
            min: function(a, b, c) {
                return this.optional(b) || a >= c
            },
            max: function(a, b, c) {
                return this.optional(b) || c >= a
            },
            range: function(a, b, c) {
                return this.optional(b) || a >= c[0] && a <= c[1]
            },
            equalTo: function(b, c, d) {
                var e = a(d);
                return this.settings.onfocusout && e.unbind(".validate-equalTo").bind("blur.validate-equalTo", function() {
                    a(c).valid()
                }), b === e.val()
            },
            remote: function(b, c, d) {
                if (this.optional(c)) return "dependency-mismatch";
                var e, f, g = this.previousValue(c);
                return this.settings.messages[c.name] || (this.settings.messages[c.name] = {}), g.originalMessage = this.settings.messages[c.name].remote, this.settings.messages[c.name].remote = g.message, d = "string" == typeof d && {
                    url: d
                } || d, g.old === b ? g.valid : (g.old = b, e = this, this.startRequest(c), f = {}, f[c.name] = b, a.ajax(a.extend(!0, {
                    url: d,
                    mode: "abort",
                    port: "validate" + c.name,
                    dataType: "json",
                    data: f,
                    context: e.currentForm,
                    success: function(d) {
                        var f, h, i, j = d === !0 || "true" === d;
                        e.settings.messages[c.name].remote = g.originalMessage, j ? (i = e.formSubmitted, e.prepareElement(c), e.formSubmitted = i, e.successList.push(c), delete e.invalid[c.name], e.showErrors()) : (f = {}, h = d || e.defaultMessage(c, "remote"), f[c.name] = g.message = a.isFunction(h) ? h(b) : h, e.invalid[c.name] = !0, e.showErrors(f)), g.valid = j, e.stopRequest(c, j)
                    }
                }, d)), "pending")
            }
        }
    }), a.format = function() {
        throw "$.format has been deprecated. Please use $.validator.format instead."
    };
    var b, c = {};
    a.ajaxPrefilter ? a.ajaxPrefilter(function(a, b, d) {
        var e = a.port;
        "abort" === a.mode && (c[e] && c[e].abort(), c[e] = d)
    }) : (b = a.ajax, a.ajax = function(d) {
        var e = ("mode" in d ? d : a.ajaxSettings).mode,
            f = ("port" in d ? d : a.ajaxSettings).port;
        return "abort" === e ? (c[f] && c[f].abort(), c[f] = b.apply(this, arguments), c[f]) : b.apply(this, arguments)
    }), a.extend(a.fn, {
        validateDelegate: function(b, c, d) {
            return this.bind(c, function(c) {
                var e = a(c.target);
                return e.is(b) ? d.apply(e, arguments) : void 0
            })
        }
    })
}); /* assets/js/validate/validate.ru.js */
jQuery.extend(jQuery.validator.messages, {
    required: "Это поле необходимо заполнить.",
    remote: "Пожалуйста, введите правильное значение.",
    email: "Пожалуйста, введите корректный адрес электронной почты.",
    url: "Пожалуйста, введите корректный URL.",
    date: "Пожалуйста, введите корректную дату.",
    dateISO: "Пожалуйста, введите корректную дату в формате ISO.",
    number: "Пожалуйста, введите число.",
    digits: "Пожалуйста, вводите только цифры.",
    creditcard: "Пожалуйста, введите правильный номер кредитной карты.",
    equalTo: "Пожалуйста, введите такое же значение ещё раз.",
    accept: "Пожалуйста, выберите файл с правильным расширением.",
    maxlength: jQuery.validator.format("Пожалуйста, введите не больше {0} символов."),
    minlength: jQuery.validator.format("Пожалуйста, введите не меньше {0} символов."),
    rangelength: jQuery.validator.format("Пожалуйста, введите значение длиной от {0} до {1} символов."),
    range: jQuery.validator.format("Пожалуйста, введите число от {0} до {1}."),
    max: jQuery.validator.format("Пожалуйста, введите число, меньшее или равное {0}."),
    min: jQuery.validator.format("Пожалуйста, введите число, большее или равное {0}."),
    rusname: jQuery.validator.format("Принимаются только символы русского алфавита")
}); /* assets/js/AN/jHelper.js */
(function($) {
    $(function() {
        $.jHelper = {
            htmlDecode: function(str) {
                return $('<div/>').html(str).text();
            },
            htmlEncode: function(str) {
                return $("<div/>").text(str).html();
            },
            getObjFromString: function(str, selector) {
                return $(selector, $('<output>').append($.parseHTML(str)));
            },
            getHtmlFromObj: function(obj) {
                return $('<div/>').append(obj.clone()).html();
            },
            issetData: function(obj, key) {
                return (typeof $(obj).data(key) !== 'undefined')
            },
            defaultData: function(obj, key, value) {
                var ret;
                if ($.jHelper.issetData($(obj), key)) {
                    ret = $(obj).data(key);
                } else {
                    $(obj).data(key, value);
                    ret = value;
                }
                return ret;
            },
            tagName: function(el) {
                return $(el).prop("tagName");
            },
            lowerCase: function(val) {
                return val.toLowerCase();
            },
            renderTPL: function(template, data) {
                var out = '';
                if (template != '') {
                    out = template.replace(/[\r\t\n]/g, " ").split("<%").join("\t").replace(/((^|%>)[^\t]*)'/g, "$1\r").replace(/\t=(.*?)%>/g, "',$1,'").split("\t").join("');").split("%>").join("p.push('").split("\r").join("\\'");
                    out = new Function("obj", "var p=[],print=function(){p.push.apply(p,arguments);};with(obj){p.push('" + out + "');}return p.join('');")(data);
                }
                return out;
            },
            formatSize: function(length, type) {
                var i = 0;
                type = type || ['б', 'Кб', 'Мб', 'Гб', 'Тб', 'Пб'];
                while ((length / 1000 | 0) && i < type.length - 1) {
                    length /= 1024;
                    i++;
                }
                return length.toFixed(2) + ' ' + type[i];
            }
        };
    });
})(jQuery); /* assets/js/AN/jquery.dataSelector.js */
(function($) {
    $.extend($.expr[':'], {
        data: function(a, i, m) {
            var e = $(a).get(0),
                keyVal;
            if (!m[3]) {
                for (var x in e) {
                    if ((/jQuery\d+/).test(x)) {
                        return true;
                    }
                }
            } else {
                keyVal = m[3].split('=');
                if (keyVal[1]) {
                    if ((/^\/.+\/([mig]+)?$/).test(keyVal[1])) {
                        return (new RegExp(keyVal[1].substr(1, keyVal[1].lastIndexOf('/') - 1), keyVal[1].substr(keyVal[1].lastIndexOf('/') + 1))).test($(a).data(keyVal[0]));
                    } else {
                        return $(a).data(keyVal[0]) == keyVal[1];
                    }
                } else {
                    if ($(a).data(keyVal[0])) {
                        return true;
                    } else {
                        $(a).removeData(keyVal[0]);
                        return false;
                    }
                }
            }
            return false;
        }
    });
})(jQuery); /* assets/js/AN/jquery.dataSerialize.js */
(function($) {
    $.fn.dataSerialize = function(prefix) {
        prefix = prefix || '';
        var toReturn = [];
        var els = $(this).data();
        $.each(els, function(key, val) {
            var useKey = (prefix === '' ? key : (prefix + '[' + key + ']'));
            toReturn.push(encodeURIComponent(useKey) + "=" + encodeURIComponent(val));
        });
        return toReturn.join("&").replace(/%20/g, "+");
    };
})(jQuery); /* assets/js/AN/ANMsg.js */
(function($) {
    $(function() {
        $.ANMsg = {
            info: function(text, mode) {
                mode = mode || 'modal';
                switch (mode) {
                    case 'alert':
                        {
                            if (typeof $.fn.jGrowl !== 'undefined') {
                                $.jGrowl(text, {
                                    theme: 'ommsg-info'
                                });
                            } else {
                                alert(text);
                            }
                            break;
                        }
                    default:
                        {
                            $.sender.fancy(text);
                        }
                }
            },
            notice: function(text, mode) {
                mode = mode || 'modal';
                switch (mode) {
                    case 'alert':
                        {
                            if (typeof $.fn.jGrowl !== 'undefined') {
                                $.jGrowl(text, {
                                    theme: 'ommsg-success'
                                });
                            } else {
                                alert(text);
                            }
                            break;
                        }
                    default:
                        {
                            $.sender.fancy('<div class="errorMessage"><h1>Произошла ошибка</h1><br />' + text + '</div>');
                        }
                }
            },
            error: function(text, mode) {
                mode = mode || 'modal';
                switch (mode) {
                    case 'alert':
                        {
                            if (typeof $.fn.jGrowl !== 'undefined') {
                                $.jGrowl(text, {
                                    theme: 'ommsg-error'
                                });
                            } else {
                                alert(text);
                            }
                            break;
                        }
                    default:
                        {
                            $.sender.fancy('<div class="errorMessage"><h1>Произошла ошибка</h1><br />' + text + '</div>');
                        }
                }
            },
            fail: function(text, mode) {
                mode = mode || 'modal';
                switch (mode) {
                    case 'alert':
                        {
                            if (typeof $.fn.jGrowl !== 'undefined') {
                                $.jGrowl(text, {
                                    theme: 'ommsg-error'
                                });
                            } else {
                                alert(text);
                            }
                            break;
                        }
                    default:
                        {
                            $.sender.fancy('<div class="errorMessage"><h1>Произошла ошибка</h1><br />' + text + '</div>', true);
                        }
                }
            }
        };
    });
})(jQuery); /* js/script.js */
$(document).ready(function() {
    jQuery('form input[type="text"],form input[type="password"],form textarea,.popups input[type="text"],.popups input[type="password"],.popups textarea').live('focus', function(event) {
        if (this.value.length <= 0) {
            $(this).parent().find('abbr').hide();
        }
    });
    jQuery('form input[type="text"],form input[type="password"],form textarea,.popups input[type="text"],.popups input[type="password"],.popups textarea').live('blur', function(event) {
        if (this.value.length == 0) {
            $(this).parent().find('abbr').show();
        }
    });
    $('#zoom').fancybox();
    $(".scroll-top a").click(function() {
        $('html, body').animate({
            scrollTop: 0
        }, 'slow');
        return false;
    });
    $('.map-blok .spisok .collasp a').click(function() {
        $(".map-blok .spisok").slideToggle("slow", function() {
            $(".map-blok .collasp-open").slideToggle("slow")
        });
        return false;
    });
    $('.map-blok .collasp-open a').click(function() {
        $(".map-blok .collasp-open").slideToggle("slow", function() {
            $(".map-blok .spisok").slideToggle("slow")
        });
        return false;
    });
    $('.accordion li i,.accordion li a.link').click(function() {
        var dropblok = $(this).parent().find('.drop-block');
        if (dropblok.is(":hidden")) {
            dropblok.slideDown("slow", function() {
                $(this).parent().addClass('selected');
            });
        } else {
            dropblok.slideUp("slow", function() {
                $(this).parent().removeClass('selected');
            });
        }
    });
    $('.accordion li a.closed').click(function() {
        $(this).parent().slideUp("slow", function() {
            $(this).parent().removeClass('selected');
        });
    });
    if ($('select').length) {
        $('select').ikSelect({
            autoWidth: false,
            ddFullWidth: false
        });
    }
    $("form").validate();
    $('.tooltip ul li > a').click(function() {
        if ($(this).parent().hasClass('active')) {
            $(this).parent().removeClass('active').find('.tooltips').fadeOut(20).css({
                'top': '-230%',
                'opacity': '0'
            });
            return false;
        }
        $('.tooltip').find('.tooltips').fadeOut(20).css({
            'top': '-230%',
            'opacity': '0'
        });
        $('.tooltip').find('li.active').removeClass('active');
        $(this).parent().addClass('active').find('.tooltips').css({
            'display': 'block'
        }).stop().animate({
            'opacity': '1',
            top: '-260%'
        }, 400);
        return false;
    });
    $(document).click(function(event) {
        if ($(event.target).closest(".tooltip .tooltips").length) return;
        $(".tooltip .tooltips").fadeOut("slow");
        $('.tooltip').find('li.active').removeClass('active');
        event.stopPropagation();
    });
}); /* js/script-n.js */
(function($) {
    $.fn.extended_itf = function() {
        if (/msie/.test(navigator.userAgent.toLowerCase())) return;
        this.each(function() {
            var obj = $(this);
            var placeholder = obj.is('[placeholder]') ? obj.attr('placeholder') : '';
            var value = $('<div class="upload_value"/>').html('<div>' + placeholder + '</div>');
            var button = $('<div class="upload_button"/>');
            obj.wrap('<label class="upload_file"/>');
            obj.parent().append(value);
            obj.parent().append(button);
            obj.change(function() {
                value.find('div').text($(this).val());
            });
        });
    };
})(jQuery);
$(document).ready(function() {
    if (($('input[type="checkbox"]').length) || ($('input[type="radio"]').length)) {
        for (var i = 0; i < $('input[type="checkbox"]').length; i++) {
            var element = $($('input[type="checkbox"]')[i]),
                chk_active = element.attr("checked") == "checked" ? " active" : "",
                chk_disable = element.attr("disabled") == "disabled" ? " disable" : "";
            element.addClass('number' + i).wrap('<span class="span_checkbox' + chk_active + chk_disable + '"></span>');
        }
        for (var i = 0; i < $('input[type="radio"]').length; i++) {
            var element = $($('input[type="radio"]')[i]),
                chk_active = element.attr("checked") == "checked" ? " active" : "",
                chk_disable = element.attr("disabled") == "disabled" ? " disable" : "";
            element.addClass('numbers' + i).wrap('<span class="span_radio' + chk_active + chk_disable + '"></span>');
        }
    }
    $(document).on('click', '.span_checkbox', function() {
        var tmp = $(this);
        if (tmp.hasClass('active')) {
            tmp.removeClass('active');
            tmp.children('input[type="checkbox"]').removeAttr("checked");
        } else {
            tmp.addClass('active');
            tmp.children('input[type="checkbox"]').attr("checked", "checked");
        }
        if (tmp.children('input[type="checkbox"]').attr("disabled") == "disabled") {} else {
            eval(tmp.children('input[type="checkbox"]').attr("onclick"));
        }
    });
    $(document).on('click', '.span_radio', function() {
        var tmp = $(this);
        $('.radio').find('.active').removeClass('active');
        $('.radio').find('input[type="radio"]').removeAttr("checked");
        tmp.addClass('active');
        tmp.children('input[type="radio"]').attr("checked", "checked");
    });
    $(document).on('click', 'form .accord .accord-link', function() {
        var box = $(this).attr('data-box');
        $('form .accord').find('.box').hide();
        $('form .accord').find('.' + box).show();
    });
    $('input[type="file"]').extended_itf();
});

var mapPoints = [];

function addPoint(position, content, header, title) {
    mapPoints.push({
        type: "Feature",
        geometry: {
            type: "Point",
            coordinates: position
        },
        properties: {
            name: "point",
            balloonContentBody: content,
            balloonContentHeader: header,
            balloonTitle: title
        },
        options: {
            preset: "my#preset1"
        }
    });
};;
(function($) {
    $(function() {
        if (typeof $.fn.jGrowl !== 'undefined') {
            $.jGrowl.defaults.closerTemplate = '<div>[ Закрыть ]</div>';
            $.jGrowl.defaults.life = 10000;
        }
        $.OMMsg = {
            info: function(text) {
                $.jGrowl(text, {
                    theme: 'ommsg-info'
                });
            },
            notice: function(text) {
                $.jGrowl(text, {
                    theme: 'ommsg-success'
                });
            },
            error: function(text) {
                $.jGrowl(text, {
                    theme: 'ommsg-error'
                });
            }
        };
        $.sender = {
            lang: {
                errorSend: 'Не удалось получить ответ от сервера. Попробуйте повторить попытку позже',
                required: 'Это поле необходимо заполнить'
            },
            fancy: function(text, reload) {
                $.event.trigger("onFancyOpen", [{
                    content: text
                }]);
                $.fancybox({
                    content: text,
                    overlayColor: "#25437d",
                    overlayOpacity: 0.40,
                    autoWidth: true,
                    autoResize: true,
                    scrolling: 'auto',
                    ajax: {
                        dataType: 'html',
                        headers: {
                            'X-fancyBox': true,
                            'X-ANSender': true
                        }
                    },
                    openSpeed: 450,
                    openEffect: 'fade',
                    closeEffect: 'fade',
                    closeSpeed: 50,
                    afterClose: function() {
                        if (reload) {
                            location.reload();
                        }
                    }
                });
            },
            ajax: function(form, url) {
                $.ajax({
                    url: $(form).attr('action'),
                    data: $(form).serialize() + '&' + $("body").dataSerialize('main'),
                    cache: false,
                    type: $(form).attr('method')
                }).done(function(responce) {
                    if (typeof responce.status !== 'undefined' && responce.status == 'ok') {
                        var el = (typeof responce.replace !== 'undefined') ? responce.replace : null;
                        if (el && $(el).length) {
                            el = $(el);
                            el.fadeToggle('slow', function() {
                                el.replaceWith(responce.text)
                            }).fadeToggle('slow');
                        } else {
                            var url = (typeof responce.url !== 'undefined') ? responce.url : null;
                            if (url) {
                                $(location).attr('href', url);
                            } else {
                                $.sender.fancy(responce.text, true);
                            }
                        }
                    } else {
                        if (typeof responce.text !== 'undefined') {
                            $.sender.fancy(responce.text);
                        } else {
                            $.ANMsg.error($.sender.lang.errorSend);
                        }
                    }
                }).fail(function() {
                    $.ANMsg.error($.sender.lang.errorSend);
                });
            },
            ajaxOld: function(form, url) {
                $.ajax({
                    url: '/sender.php',
                    data: $(form).serialize() + '&docID=' + $.jHelper.defaultData('body', 'pageid', 0) + '&activityID=' + $.jHelper.defaultData('body', 'activityid', 0),
                    cache: false,
                    type: "POST"
                }).done(function(responce) {
                    if (typeof responce.status !== 'undefined' && responce.status == 'ok') {
                        var el = $(form).parents('.wrapAjaxForm');
                        el.fadeToggle('slow', function() {
                            el.html(responce.text)
                        }).fadeToggle('slow');
                    } else {
                        var text = $.sender.lang.errorSend;
                        if (typeof responce.text !== 'undefined') {
                            text = responce.text;
                        }
                        $.OMMsg.error(text);
                    }
                }).fail(function() {
                    $.OMMsg.notice.error($.sender.lang.errorSend);
                });
            }
        };
        $('.addFavorite').click(function(e) {
            $.OMMsg.notice("Нажмите CTRL + D для добавления страницы в закладки");
            e.preventDefault();
        });
        $('a.fancybox').fancybox();
        $('a.fancy').fancybox();
        var validatorConfig = {
            errorPlacement: function(error, element) {},
            highlight: function(element, errorClass, validClass) {
                var tagName = $.jHelper.lowerCase($.jHelper.tagName($(element)));
                var el;
                if (tagName == 'select') {
                    el = $(element).parent();
                } else {
                    el = $(element);
                }
                $("div.jGrowl").jGrowl("close");
                if (el.attr('type') == "checkbox" && el.attr('name') == "confirm") {
                    $.OMMsg.error("Необходимо дать согласие на обработку персональных данных");
                }
                el.addClass(errorClass).removeClass(validClass);
                $(element.form).find("label[for=" + element.id + "]").addClass(errorClass);
            },
            unhighlight: function(element, errorClass, validClass) {
                var tagName = $.jHelper.lowerCase($.jHelper.tagName($(element)));
                var el;
                if (tagName == 'select') {
                    el = $(element).parent();
                } else {
                    el = $(element);
                }
                el.removeClass(errorClass).addClass(validClass);
                $(element.form).find("label[for=" + element.id + "]").removeClass(errorClass);
            },
            rules: {
                email: {
                    email: true
                }
            },
            submitHandler: function(form) {
                $.sender.ajaxOld(form);
            }
        };
        $.validatorConfig = $.extend({}, $.validatorConfig, {
            submitHandler: function(form) {
                $.sender.ajax(form);
            }
        });
        var ajaxForm = $('.send-vopros .forms form').not(':data(modx=ajax)');
        $('.sendBtn', ajaxForm).on('click', function(e) {
            ajaxForm.trigger('submit');
            e.preventDefault();
        });

        function ajaxLink() {
            $('body').on('click', 'a:data(modx=ajax)', function(e) {
                e.preventDefault();
                $.ajax({
                    url: $(this).attr('href'),
                    data: {
                        data: $(this).data(),
                        main: $("body").data()
                    },
                    type: "GET"
                }).done(function(responce) {
                    $.sender.fancy(responce);
                    initAjax();
                }).fail(function() {
                    $.ANMsg.error($.sender.lang.errorLoad);
                });
            });
        }
        ajaxLink();

        function ajaxFormSend() {
            var validateForm = $('form.old:not(.no-validate)').not(':data(modx=ajax)');
            if (validateForm.length) {
                var oldAjaxConfig = $.extend({}, $.validatorConfig, {
                    submitHandler: function(form) {
                        $.sender.ajaxOld(form);
                    }
                });
                validateForm.each(function(index) {
                    $(this).validate(oldAjaxConfig);
                });
            }
            var validateForm = $('form:not(.no-validate)').not(':data(modx=ajax)');
            if (validateForm.length) {
                var noAjaxConfig = $.extend({}, $.validatorConfig, {
                    submitHandler: function(form) {
                        form.submit();
                    }
                });
                validateForm.each(function(index) {
                    $(this).validate(noAjaxConfig);
                });
            }
            var ajaxForm = $('form:data(modx=ajax)');
            if (ajaxForm.length) {
                ajaxForm.each(function(index) {
                    $(this).validate($.validatorConfig);
                });
            }
        }
        $('body').on('click', '.modal-link', function(e) {
            e.preventDefault();
            var selector = $.jHelper.defaultData($(this), 'inline', '');
            if (selector !== '' && $(selector).length) {
                $.sender.fancy($(selector).html());
                ajaxFormSend();
            }
        });

        function initAjax() {
            $("input[name=phone]").mask("+7 (999) 999-99-99");
            ajaxFormSend();
        }
        initAjax();
        $('body').on('click', '.noclick', function(e) {
            e.preventDefault();
        });
        ajaxForm.validate(validatorConfig);
        if (typeof FileAPI != 'undefined') {
            if ($("#uploader").length) {
                var form = $("#uploader").parents('form');
                $(".sendForm", form).hide();
                $('#uploader').fileapi({
                    url: '/upload.php',
                    autoUpload: true,
                    multiple: false,
                    clearOnSelect: true,
                    elements: {
                        size: '.js-size',
                        active: {
                            show: '.js-upload',
                            hide: '.js-browse'
                        },
                        progress: '.js-progress'
                    },
                    onBeforeUpload: function() {
                        $(".sendForm", form).hide();
                    },
                    onComplete: function(evt, ui) {
                        if (!ui.error) {
                            if (ui.result) {
                                $("#inpresume").val(ui.result);
                                $.OMMsg.notice("Ваш файл успешно загружен на сервер");
                                $(".sendForm", form).show();
                            } else {
                                $.OMMsg.error('Не удалось загрузить файл на сервер');
                            }
                        } else {
                            $.OMMsg.error('Во время загрузки файла произошла ошибка');
                        }
                    },
                });
            }
        }
        $.Hash = {
            get: function() {
                var vars = {},
                    hash, splitter, hashes;
                if (!this.oldbrowser()) {
                    var pos = window.location.href.indexOf('?');
                    hashes = (pos != -1) ? decodeURIComponent(window.location.href.substr(pos + 1)) : '';
                    splitter = '&';
                } else {
                    hashes = decodeURIComponent(window.location.hash.substr(1));
                    splitter = '/';
                }
                if (hashes.length == 0) {
                    return vars;
                } else {
                    hashes = hashes.split(splitter);
                }
                for (var i in hashes) {
                    if (hashes.hasOwnProperty(i)) {
                        hash = hashes[i].split('=');
                        if (typeof hash[1] == 'undefined') {
                            vars['anchor'] = hash[0];
                        } else {
                            vars[hash[0]] = hash[1];
                        }
                    }
                }
                return vars;
            },
            set: function(vars) {
                var hash = '';
                for (var i in vars) {
                    if (vars.hasOwnProperty(i)) {
                        hash += '&' + i + '=' + vars[i];
                    }
                }
                if (!this.oldbrowser()) {
                    if (hash.length != 0) {
                        hash = '?' + hash.substr(1);
                    }
                    window.history.pushState(hash, '', document.location.pathname + hash);
                } else {
                    window.location.hash = hash.substr(1);
                }
            },
            add: function(key, val) {
                var hash = this.get();
                hash[key] = val;
                this.set(hash);
            },
            remove: function(key) {
                var hash = this.get();
                delete hash[key];
                this.set(hash);
            },
            clear: function() {
                this.set({});
            },
            oldbrowser: function() {
                return !(window.history && history.pushState);
            }
        };
        $('.analytics').on('click', function(e) {
            $.ajax({
                url: '/analytics.php',
                data: {
                    type: 'link',
                    href: $(this).attr('href'),
                    name: $.jHelper.defaultData($(this), 'id', '')
                },
                cache: true,
                type: "POST"
            });;
        });
        if ($("#practicFilter").length && $("#listPractic").length) {
            var formObj = $("#practicFilter");
            $("#practicFilter").change(function(e) {
                e.preventDefault();
                $("#listPractic").html('<img src="/css/images/ajax-loader.gif" class="ajaxLoader"/>');
                $.Hash.clear();
                $.Hash.set({
                    'start': $("input[name=start]", formObj).val().trim(),
                    'end': $("input[name=end]", formObj).val().trim(),
                    'sud': $("select[name=sud]", formObj).val().trim()
                });
                $.ajax({
                    url: window.location.pathname,
                    data: $(formObj).serialize(),
                    cache: true,
                    type: "GET"
                }).done(function(responce) {
                    $('#listPractic').html($('#listPractic', responce).html());
                }).fail(function() {
                    $.OMMsg.notice.error($.sender.lang.errorSend);
                });
            });
            $("#listPractic").on('click', '.pagination a', function(e) {
                e.preventDefault();
                var href = $(this).attr('href');
                var url = $.url(href);
                var page = parseInt(url.param('page'), 10);
                if (isNaN(page)) {
                    $.Hash.remove('page');
                } else {
                    $.Hash.add('page', page);
                }
                $("#listPractic").html('<img src="/css/images/ajax-loader.gif" class="ajaxLoader"/>');
                $.ajax({
                    url: href,
                    cache: true,
                    type: "GET"
                }).done(function(responce) {
                    $('#listPractic').html($('#listPractic', responce).html());
                }).fail(function() {
                    $.OMMsg.notice.error($.sender.lang.errorSend);
                });
            });
        }
        if ($("#mnenieFilter").length && $("#listMnenie").length) {
            var formObj = $("#mnenieFilter");
            $("#mnenieFilter").change(function(e) {
                e.preventDefault();
                $("#listMnenie").html('<img src="/css/images/ajax-loader.gif" class="ajaxLoader"/>');
                $.Hash.clear();
                $.Hash.set({
                    'start': $("input[name=start]", formObj).val().trim(),
                    'end': $("input[name=end]", formObj).val().trim()
                });
                $.ajax({
                    url: window.location.pathname,
                    data: $(formObj).serialize(),
                    cache: true,
                    type: "GET"
                }).done(function(responce) {
                    $('#listMnenie').html($('#listMnenie', responce).html());
                }).fail(function() {
                    $.OMMsg.notice.error($.sender.lang.errorSend);
                });
            });
            $("#listMnenie").on('click', '.pagination a', function(e) {
                e.preventDefault();
                var href = $(this).attr('href');
                var url = $.url(href);
                var page = parseInt(url.param('page'), 10);
                if (isNaN(page)) {
                    $.Hash.remove('page');
                } else {
                    $.Hash.add('page', page);
                }
                $("#listMnenie").html('<img src="/css/images/ajax-loader.gif" class="ajaxLoader"/>');
                $.ajax({
                    url: href,
                    cache: true,
                    type: "GET"
                }).done(function(responce) {
                    $('#listMnenie').html($('#listMnenie', responce).html());
                }).fail(function() {
                    $.OMMsg.notice.error($.sender.lang.errorSend);
                });
            });
        }
        if ($('.scrollbar-inner').length) {
            $('.scrollbar-inner').scrollbar();
        }
        $('#search_point').bind('keyup', function() {
            var poisk_val = $(this).val();
            if (poisk_val.length >= 3) {
                $('#result_map_search').show();
                map_resuult();
            }
        });
        var TPL = {
            point: '',
            search: ''
        };
        if ($('#contentMapPoint').length) {
            TPL.point = $('#contentMapPoint').html();
        }
        if ($('#searchItem').length) {
            TPL.search = $('#searchItem').html();
        }

        function balloonContentBody_slice_img(balloonContentBody_img) {
            for (var i = 0; i < 10; i++) {
                var pos_img = balloonContentBody_img.indexOf("<img");
                if (pos_img == '-1') {
                    return balloonContentBody_img;
                    break;
                }
                var pos_img_end = balloonContentBody_img.indexOf("/>", pos_img);
                var balloonContentBody_img1 = balloonContentBody_img.slice(0, pos_img);
                var balloonContentBody_img2 = balloonContentBody_img.slice(pos_img_end + 2);
                balloonContentBody_img = balloonContentBody_img1 + balloonContentBody_img2;
                if (pos_img == '-1') {
                    return balloonContentBody_img;
                    break;
                }
            }
        }
        if (typeof ymaps !== 'undefined') {
            var mapexMap;
            ymaps.ready(function() {
                function geoObjectsCollect() {
                    mapexMap.geoObjects.each(function(geoObject) {
                        var tek_name = geoObject.properties.get('balloonContentHeader');
                        $('ul.list_point li').find('.zag').each(function(i, val) {
                            if ($(val).html() == tek_name) {
                                $(this).click(function() {
                                    geoObject.balloon.open();
                                    return false;
                                })
                            }
                        });
                    });
                }
                var myGeoObjects = new ymaps.GeoObjectCollection({}, {});
                var objects = ymaps.geoQuery({
                    type: 'FeatureCollection',
                    features: mapPoints
                });
                ymaps.option.presetStorage.add('my#preset1', {
                    iconLayout: "default#imageWithContent",
                    iconImageHref: 'css/images/map-marker.png',
                    iconShadow: true,
                    iconImageSize: [40, 55],
                    iconImageOffset: [-22, -26]
                });
                mapexMap = new ymaps.Map("map", {
                    center: [55.609356975352, 38.067591871094],
                    zoom: 9,
                    controls: []
                });
                mapexMap.controls.add('geolocationControl', {
                    position: {
                        left: 5,
                        top: 5
                    }
                });
                mapexMap.controls.add('fullscreenControl', {
                    position: {
                        left: 5,
                        bottom: 5
                    }
                });
                mapexMap.controls.add('zoomControl', {
                    position: {
                        left: 5,
                        top: 100
                    }
                });
                mapexMap.setType("yandex#map");
                mapexMap.behaviors.enable('scrollZoom');
                objects.addToMap(mapexMap);

                function pointRenderNav(el) {
                    var point_spis = $.jHelper.renderTPL(TPL.point, {
                        header: el.properties.get('balloonContentHeader'),
                        title: el.properties.get('balloonTitle'),
                        content: balloonContentBody_slice_img(el.properties.get('balloonContentBody'))
                    });
                    $(point_spis).appendTo($('ul.list_point'));
                }
                for (var j = 0, m = objects.getLength(); j < m; j++) {
                    pointRenderNav(objects.get(j));
                }
                geoObjectsCollect();
                mapexMap.events.add('boundschange', function() {
                    var visibleObjects = objects.searchInside(mapexMap).addToMap(mapexMap);
                    var visibleObjects_count = visibleObjects.getLength();
                    if (visibleObjects_count > 0) {
                        $(".spisok-content .nothing").hide();
                        $('ul.list_point').empty();
                        for (var j = 0, m = visibleObjects_count; j < m; j++) {
                            pointRenderNav(visibleObjects.get(j));
                        }
                        objects.remove(visibleObjects).removeFromMap(mapexMap);
                    } else {
                        $('ul.list_point').empty();
                        $(".spisok-content .nothing").show();
                        for (var j = 0, m = objects.getLength(); j < m; j++) {
                            pointRenderNav(objects.get(j));
                        }
                        objects.addToMap(mapexMap);
                    }
                    geoObjectsCollect();
                });
            });

            function map_resuult() {
                var point_search = $('#search_point').val();
                var myGeocoder = ymaps.geocode(point_search);
                myGeocoder.then(function(res) {
                    var firstGeoObject = res.geoObjects.get(0),
                        bounds = firstGeoObject.properties.get('boundedBy');
                    $('#result_map_search').empty();
                    for (var j = 0, m = res.geoObjects.getLength(); j < m; j++) {
                        var el = res.geoObjects.get(j);
                        var point_spis = $.jHelper.renderTPL(TPL.search, {
                            name: el.properties.get('name')
                        });
                        $(point_spis).appendTo($('#result_map_search'));
                    }
                    $('#result_map_search .result_map_el').each(function(i, val) {
                        var result_map_name = $(val).text();
                        $(val).on('click', function() {
                            ymaps.geocode(result_map_name, {
                                results: 1
                            }).then(function(res) {
                                var firstGeoObject = res.geoObjects.get(0),
                                    coords = firstGeoObject.geometry.getCoordinates(),
                                    bounds = firstGeoObject.properties.get('boundedBy');
                                mapexMap.geoObjects.add(firstGeoObject);
                                mapexMap.setBounds(bounds, {
                                    checkZoomRange: true
                                });
                            });
                            $('#result_map_search').hide();
                            $('#search_point').val(result_map_name);
                            return false;
                        })
                    });
                });
            }
            $(".search_map").submit(function(e) {
                e.preventDefault();
            });
            $('.search_map button').click(function(e) {
                var poisk_val = $('#search_point').val();
                if (poisk_val.length >= 3) {
                    $('#result_map_search').show();
                    ymaps.geocode(poisk_val, {
                        results: 1
                    }).then(function(res) {
                        var firstGeoObject = res.geoObjects.get(0),
                            coords = firstGeoObject.geometry.getCoordinates(),
                            bounds = firstGeoObject.properties.get('boundedBy');
                        mapexMap.geoObjects.add(firstGeoObject);
                        mapexMap.setBounds(bounds, {
                            checkZoomRange: true
                        });
                    });
                    $('#result_map_search').hide();
                    $('#search_point').val(poisk_val);
                }
                e.preventDefault();
            });
        }
        if ($('#FormRegister').length) {
            $('#FormRegister input[name=type]').change(function(e) {
                e.preventDefault();
                if ($(this).val() == 1) {
                    $("#CompanyRegForm").show("slow");
                } else {
                    $("#CompanyRegForm").hide("slow");
                }
            });
        }
        if ($('#calcForm').length) {
            $('#calc-end-date').prop('disabled', true);
            $.attachCalcDatepicker = function(maxDate) {
                $('#calc-start-date').attachDatepicker({
                    minDate: new Date(2012, 9 - 1, 14),
                    maxDate: maxDate,
                    closeAtTop: false,
                    changeMonth: false,
                    changeYear: false,
                    showAnim: 'slideDown',
                    onSelect: function(startDate) {
                        $('#calc-end-date').removeDatepicker().prop('disabled', false).attachDatepicker({
                            minDate: $.datepicker.parseDate('dd.mm.yy', startDate),
                            closeAtTop: false,
                            changeMonth: false,
                            changeYear: false,
                            showAnim: 'slideDown',
                            onSelect: function(endDate) {
                                $('#calc-start-date').removeDatepicker();
                                $.attachCalcDatepicker($.datepicker.parseDate('dd.mm.yy', endDate));
                            }
                        });
                    }
                });
            };
            $.attachCalcDatepicker('-1');
            var calcForm = $('#calcForm form');
            $('.reset', calcForm).on('click', function(e) {
                e.preventDefault();
                calcForm.trigger('reset');
                $('#calcForm .result-header').html('');
            });
            $('.sendBtn', calcForm).on('click', function(e) {
                e.preventDefault();
                calcForm.trigger('submit');
            });
            calcForm.validate({
                errorPlacement: function(error, element) {},
                highlight: function(element, errorClass, validClass) {
                    var tagName = $.jHelper.lowerCase($.jHelper.tagName($(element)));
                    var el;
                    if (tagName == 'select') {
                        el = $(element).parent();
                    } else {
                        el = $(element);
                    }
                    el.addClass(errorClass).removeClass(validClass);
                    $(element.form).find("label[for=" + element.id + "]").addClass(errorClass);
                },
                unhighlight: function(element, errorClass, validClass) {
                    var tagName = $.jHelper.lowerCase($.jHelper.tagName($(element)));
                    var el;
                    if (tagName == 'select') {
                        el = $(element).parent();
                    } else {
                        el = $(element);
                    }
                    el.removeClass(errorClass).addClass(validClass);
                    $(element.form).find("label[for=" + element.id + "]").removeClass(errorClass);
                },
                submitHandler: function(form) {
                    var el = $('#calcForm .result-header');
                    el.html('<img src="/css/images/ajax-loader.gif" class="ajaxLoader"/>');
                    $.ajax({
                        url: $(form).attr('action'),
                        data: $(form).serialize(),
                        cache: false,
                        type: $(form).attr('method')
                    }).done(function(responce) {
                        if (typeof responce.status !== 'undefined' && responce.status == 'ok') {
                            el.fadeToggle('slow', function() {
                                el.html(responce.text);
                            }).fadeToggle('slow');
                        } else {
                            el.html('');
                            if (typeof responce.text !== 'undefined') {
                                $.OMMsg.error(responce.text);
                            } else {
                                $.ANMsg.error($.sender.lang.errorSend);
                            }
                        }
                    }).fail(function() {
                        $.ANMsg.error($.sender.lang.errorSend);
                    });
                }
            });
        }
    });
})(jQuery);