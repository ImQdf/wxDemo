/**
 * ydui main
 */
!function (window) {
    "use strict";

    var doc = window.document,
        ydui = {};

    $(window).on('load', function () {
        typeof FastClick == 'function' && FastClick.attach(doc.body);
    });

    var util = ydui.util = {
        parseOptions: function (string) {
            if ($.isPlainObject(string)) {
                return string;
            }

            var start = (string ? string.indexOf('{') : -1),
                options = {};

            if (start != -1) {
                try {
                    options = (new Function('', 'var json = ' + string.substr(start) + '; return JSON.parse(JSON.stringify(json));'))();
                } catch (e) {
                }
            }
            return options;
        },
        pageScroll: function () {
            var fn = function (e) {
                e.preventDefault();
                e.stopPropagation();
            };
            var islock = false;

            return {
                lock: function () {
                    if (islock)return;
                    islock = true;
                    doc.addEventListener('touchmove', fn);
                },
                unlock: function () {
                    islock = false;
                    doc.removeEventListener('touchmove', fn);
                }
            };
        }(),
        localStorage: function () {
            return storage(window.localStorage);
        }(),
        sessionStorage: function () {
            return storage(window.sessionStorage);
        }(),
        serialize: function (value) {
            if (typeof value === 'string') return value;
            return JSON.stringify(value);
        },
        deserialize: function (value) {
            if (typeof value !== 'string') return undefined;
            try {
                return JSON.parse(value);
            } catch (e) {
                return value || undefined;
            }
        }
    };

    function storage (ls) {
        return {
            set: function (key, value) {
                ls.setItem(key, util.serialize(value));
            },
            get: function (key) {
                return util.deserialize(ls.getItem(key));
            },
            remove: function (key) {
                ls.removeItem(key);
            },
            clear: function () {
                ls.clear();
            }
        };
    }

    $.fn.emulateTransitionEnd = function (duration) {
        var called = false,
            $el = this;

        $(this).one('webkitTransitionEnd', function () {
            called = true;
        });

        var callback = function () {
            if (!called) $($el).trigger('webkitTransitionEnd');
        };

        setTimeout(callback, duration);
    };

    if (typeof define === 'function') {
        define(ydui);
    } else {
        window.YDUI = ydui;
    }

}(window);

/**
 * ActionSheet Plugin
 */
!function (window) {
    "use strict";

    var doc = window.document,
        $doc = $(doc),
        $body = $(doc.body),
        $mask = $('<div class="mask-black"></div>');

    function ActionSheet (element, closeElement) {
        this.$element = $(element);
        this.closeElement = closeElement;
        this.toggleClass = 'actionsheet-toggle';
    }

    ActionSheet.prototype.open = function () {

        YDUI.device.isIOS && $('.g-scrollview').addClass('g-fix-ios-overflow-scrolling-bug');

        var _this = this;
        $body.append($mask);

        $mask.on('click.ydui.actionsheet.mask', function () {
            _this.close();
        });

        if (_this.closeElement) {
            $doc.on('click.ydui.actionsheet', _this.closeElement, function () {
                _this.close();
            });
        }

        _this.$element.addClass(_this.toggleClass).trigger('open.ydui.actionsheet');
    };

    ActionSheet.prototype.close = function () {
        var _this = this;

        YDUI.device.isIOS && $('.g-scrollview').removeClass('g-fix-ios-overflow-scrolling-bug');

        $mask.off('click.ydui.actionsheet.mask').remove();
        _this.$element.removeClass(_this.toggleClass).trigger('close.ydui.actionsheet');
        //$doc.off('click.ydui.actionsheet', _this.closeElement);
    };

    function Plugin (option) {
        var args = Array.prototype.slice.call(arguments, 1);

        return this.each(function () {
            var $this = $(this),
                actionsheet = $this.data('ydui.actionsheet');

            if (!actionsheet) {
                $this.data('ydui.actionsheet', (actionsheet = new ActionSheet(this, option.closeElement)));
                if (!option || typeof option == 'object') {
                    actionsheet.open();
                }
            }

            if (typeof option == 'string') {
                actionsheet[option] && actionsheet[option].apply(actionsheet, args);
            }
        });
    }

    $doc.on('click.ydui.actionsheet.data-api', '[data-ydui-actionsheet]', function (e) {
        e.preventDefault();

        var options = window.YDUI.util.parseOptions($(this).data('ydui-actionsheet')),
            $target = $(options.target),
            option = $target.data('ydui.actionsheet') ? 'open' : options;

        Plugin.call($target, option);
    });

    $.fn.actionSheet = Plugin;

}(window);

/**
 * 瑙ｅ喅:active杩欎釜楂樼娲嬫皵鐨凜SS浼被涓嶈兘浣跨敤闂
 */
!function (window) {
    window.document.addEventListener('touchstart', function (event) {
        /* Do Nothing */
    }, false);
}(window);

/**
 * CitySelect Plugin
 */
!function (window) {
    "use strict";

    var $body = $(window.document.body);

    function CitySelect (element, options) {
        this.$element = $(element);
        this.options = $.extend({}, CitySelect.DEFAULTS, options || {});
        this.init();
    }

    CitySelect.DEFAULTS = {
        provance: '',
        city: '',
        area: ''
    };

    CitySelect.prototype.init = function () {
        var _this = this,
            options = _this.options;

        if (typeof YDUI_CITYS == 'undefined') {
            console.error('璇峰湪ydui.js鍓嶅紩鍏dui.citys.js銆備笅杞藉湴鍧€锛歨ttp://cityselect.ydui.org');
            return;
        }

        _this.citys = YDUI_CITYS;

        _this.createDOM();

        _this.defaultSet = {
            provance: options.provance,
            city: options.city,
            area: options.area
        };
    };

    CitySelect.prototype.open = function () {
        var _this = this;

        $body.append(_this.$mask);

        // 闃叉鐏嫄娴忚鍣ㄦ枃鏈涓戜笐鐨勪竴鍧ㄥ皬姘存淮
        YDUI.device.isMozilla && _this.$element.blur();

        _this.$mask.on('click.ydui.cityselect.mask', function () {
            _this.close();
        });

        var $cityElement = _this.$cityElement,
            defaultSet = _this.defaultSet;

        $cityElement.find('.cityselect-content').removeClass('cityselect-move-animate cityselect-next cityselect-prev');

        _this.loadProvance();

        if (defaultSet.provance) {
            _this.setNavTxt(0, defaultSet.provance);
        } else {
            $cityElement.find('.cityselect-nav a').eq(0).addClass('crt').html('璇烽€夋嫨');
        }

        if (defaultSet.city) {
            _this.loadCity();
            _this.setNavTxt(1, defaultSet.city)
        }

        if (defaultSet.area) {
            _this.loadArea();
            _this.ForwardView(false);
            _this.setNavTxt(2, defaultSet.area);
        }

        $cityElement.addClass('brouce-in');
    };

    CitySelect.prototype.close = function () {
        var _this = this;

        _this.$mask.remove();
        _this.$cityElement.removeClass('brouce-in').find('.cityselect-nav a').removeClass('crt').html('');
        _this.$itemBox.html('');
    };

    CitySelect.prototype.createDOM = function () {
        var _this = this;

        _this.$mask = $('<div class="mask-black"></div>');

        _this.$cityElement = $('' +
            '<div class="m-cityselect">' +
            '    <div class="cityselect-header">' +
            '        <p class="cityselect-title">鎵€鍦ㄥ湴鍖�</p>' +
            '        <div class="cityselect-nav">' +
            '            <a href="javascript:;" ></a>' +
            '            <a href="javascript:;"></a>' +
            '            <a href="javascript:;"></a>' +
            '        </div>' +
            '    </div>' +
            '    <ul class="cityselect-content">' +
            '        <li class="cityselect-item">' +
            '            <div class="cityselect-item-box"></div>' +
            '        </li>' +
            '        <li class="cityselect-item">' +
            '            <div class="cityselect-item-box"></div>' +
            '        </li>' +
            '        <li class="cityselect-item">' +
            '            <div class="cityselect-item-box"></div>' +
            '        </li>' +
            '    </ul>' +
            '</div>');

        $body.append(_this.$cityElement);

        _this.$itemBox = _this.$cityElement.find('.cityselect-item-box');

        _this.$cityElement.on('click.ydui.cityselect', '.cityselect-nav a', function () {
            var $this = $(this);

            $this.addClass('crt').siblings().removeClass('crt');

            $this.index() < 2 ? _this.backOffView() : _this.ForwardView(true);
        });
    };

    CitySelect.prototype.setNavTxt = function (index, txt) {

        var $nav = this.$cityElement.find('.cityselect-nav a');

        index < 2 && $nav.removeClass('crt');

        $nav.eq(index).html(txt);
        $nav.eq(index + 1).addClass('crt').html('璇烽€夋嫨');
        $nav.eq(index + 2).removeClass('crt').html('');
    };

    CitySelect.prototype.backOffView = function () {
        this.$cityElement.find('.cityselect-content').removeClass('cityselect-next')
            .addClass('cityselect-move-animate cityselect-prev');
    };

    CitySelect.prototype.ForwardView = function (animate) {
        this.$cityElement.find('.cityselect-content').removeClass('cityselect-move-animate cityselect-prev')
            .addClass((animate ? 'cityselect-move-animate' : '') + ' cityselect-next');
    };

    CitySelect.prototype.bindItemEvent = function () {
        var _this = this,
            $cityElement = _this.$cityElement;

        $cityElement.on('click.ydui.cityselect', '.cityselect-item-box a', function () {
            var $this = $(this);

            if ($this.hasClass('crt'))return;
            $this.addClass('crt').siblings().removeClass('crt');

            var tag = $this.data('tag');

            _this.setNavTxt(tag, $this.text());

            var $nav = $cityElement.find('.cityselect-nav a'),
                defaultSet = _this.defaultSet;

            if (tag == 0) {

                _this.loadCity();
                $cityElement.find('.cityselect-item-box').eq(1).find('a').removeClass('crt');

            } else if (tag == 1) {

                _this.loadArea();
                _this.ForwardView(true);
                $cityElement.find('.cityselect-item-box').eq(2).find('a').removeClass('crt');

            } else {

                defaultSet.provance = $nav.eq(0).html();
                defaultSet.city = $nav.eq(1).html();
                defaultSet.area = $nav.eq(2).html();

                _this.returnValue();
            }
        });
    };

    CitySelect.prototype.returnValue = function () {
        var _this = this,
            defaultSet = _this.defaultSet;

        _this.$element.trigger($.Event('done.ydui.cityselect', {
            provance: defaultSet.provance,
            city: defaultSet.city,
            area: defaultSet.area
        }));

        _this.close();
    };

    CitySelect.prototype.scrollPosition = function (index) {

        var _this = this,
            $itemBox = _this.$itemBox.eq(index),
            itemHeight = $itemBox.find('a.crt').height(),
            itemBoxHeight = $itemBox.parent().height();

        $itemBox.parent().animate({
            scrollTop: $itemBox.find('a.crt').index() * itemHeight - itemBoxHeight / 3
        }, 0, function () {
            _this.bindItemEvent();
        });
    };

    CitySelect.prototype.fillItems = function (index, arr) {
        var _this = this;

        _this.$itemBox.eq(index).html(arr).parent().animate({scrollTop: 0}, 10);

        _this.scrollPosition(index);
    };

    CitySelect.prototype.loadProvance = function () {
        var _this = this;

        var arr = [];
        $.each(_this.citys, function (k, v) {
            arr.push($('<a class="' + (v.n == _this.defaultSet.provance ? 'crt' : '') + '" href="javascript:;"><span>' + v.n + '</span></a>').data({
                citys: v.c,
                tag: 0
            }));
        });
        _this.fillItems(0, arr);
    };

    CitySelect.prototype.loadCity = function () {
        var _this = this;

        var cityData = _this.$itemBox.eq(0).find('a.crt').data('citys');

        var arr = [];
        $.each(cityData, function (k, v) {
            arr.push($('<a class="' + (v.n == _this.defaultSet.city ? 'crt' : '') + '" href="javascript:;"><span>' + v.n + '</span></a>').data({
                citys: v.a,
                tag: 1
            }));
        });
        _this.fillItems(1, arr);
    };

    CitySelect.prototype.loadArea = function () {
        var _this = this;

        var areaData = _this.$itemBox.eq(1).find('a.crt').data('citys');

        var arr = [];
        $.each(areaData, function (k, v) {
            arr.push($('<a class="' + (v == _this.defaultSet.area ? 'crt' : '') + '" href="javascript:;"><span>' + v + '</span></a>').data({tag: 2}));
        });

        if (arr.length <= 0) {
            arr.push($('<a href="javascript:;"><span>鍏ㄥ尯</span></a>').data({tag: 2}));
        }
        _this.fillItems(2, arr);
    };

    function Plugin (option) {
        var args = Array.prototype.slice.call(arguments, 1);

        return this.each(function () {
            var $this = $(this),
                citySelect = $this.data('ydui.cityselect');

            if (!citySelect) {
                $this.data('ydui.cityselect', (citySelect = new CitySelect(this, option)));
            }

            if (typeof option == 'string') {
                citySelect[option] && citySelect[option].apply(citySelect, args);
            }
        });
    }

    $.fn.citySelect = Plugin;

}(window);

/**
 * Device
 */
!function (window) {
    var doc = window.document,
        ydui = window.YDUI,
        ua = window.navigator && window.navigator.userAgent || '';

    var ipad = !!ua.match(/(iPad).*OS\s([\d_]+)/),
        ipod = !!ua.match(/(iPod)(.*OS\s([\d_]+))?/),
        iphone = !ipad && !!ua.match(/(iPhone\sOS)\s([\d_]+)/);

    ydui.device = {
        isMobile: !!ua.match(/AppleWebKit.*Mobile.*/) || 'ontouchstart' in doc.documentElement,
        isIOS: !!ua.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/),
        isAndroid: !!ua.match(/(Android);?[\s\/]+([\d.]+)?/),
        isIpad: ipad,
        isIpod: ipod,
        isIphone: iphone,
        isWebView: (iphone || ipad || ipod) && !!ua.match(/.*AppleWebKit(?!.*Safari)/i),
        isWeixin: ua.indexOf('MicroMessenger') > -1,
        isMozilla: /firefox/.test(navigator.userAgent.toLowerCase()),
        pixelRatio: window.devicePixelRatio || 1
    };
}(window);

/**
 * Dialog
 */
!function (window, ydui) {
    "use strict";

    var dialog = ydui.dialog = ydui.dialog || {},
        $body = $(window.document.body);

    dialog.confirm = function (title, mes, opts) {
        var ID = 'YDUI_CONFRIM';

        $('#' + ID).remove();

        var args = arguments.length;
        if (args < 2) {
            console.error('From YDUI\'s confirm: Please set two or three parameters!!!');
            return;
        }

        if (typeof arguments[1] != 'function' && args == 2 && !arguments[1] instanceof Array) {
            console.error('From YDUI\'s confirm: The second parameter must be a function or array!!!');
            return;
        }

        if (args == 2) {
            opts = mes;
            mes = title;
            title = '鎻愮ず';
        }

        var btnArr = opts;
        if (typeof opts === 'function') {
            btnArr = [{
                txt: '鍙栨秷',
                color: false
            }, {
                txt: '纭畾',
                color: true,
                callback: function () {
                    opts && opts();
                }
            }];
        }

        var $dom = $('' +
            '<div class="mask-black-dialog" id="' + ID + '">' +
            '   <div class="m-confirm">' +
            '       <div class="confirm-hd"><strong class="confirm-title">' + title + '</strong></div>' +
            '       <div class="confirm-bd">' + mes + '</div>' +
            '   </div>' +
            '</div>');

        var $btnBox = $('<div class="confirm-ft"></div>');

        $.each(btnArr, function (i, val) {
            var $btn;
            if (typeof val.color == 'boolean') {
                $btn = $('<a href="javascript:;" class="' + 'confirm-btn ' + (val.color ? 'primary' : 'default') + '">' + (val.txt || '') + '</a>');
            } else if (typeof val.color == 'string') {
                $btn = $('<a href="javascript:;" style="color: ' + val.color + '">' + (val.txt || '') + '</a>');
            }

            (function (p) {
                $btn.on('click', function (e) {
                    e.stopPropagation();

                    if (!btnArr[p].stay) {
                        ydui.util.pageScroll.unlock();
                        $dom.remove();
                    }
                    btnArr[p].callback && btnArr[p].callback();
                });
            })(i);
            $btnBox.append($btn);
        });

        $dom.find('.m-confirm').append($btnBox);

        ydui.util.pageScroll.lock();

        $body.append($dom);
    };

    dialog.alert = function (mes, callback) {

        var ID = 'YDUI_ALERT';

        $('#' + ID).remove();

        var $dom = $('' +
            '<div id="' + ID + '">' +
            '   <div class="mask-black-dialog">' +
            '       <div class="m-confirm m-alert">' +
            '           <div class="confirm-bd">' + (mes || 'YDUI Touch') + '</div>' +
            '           <div class="confirm-ft">' +
            '               <a href="javascript:;" class="confirm-btn primary">纭畾</a>' +
            '           </div>' +
            '       </div>' +
            '   </div>' +
            '</div>');

        ydui.util.pageScroll.lock();

        $body.append($dom);

        $dom.find('a').on('click', function () {
            $dom.remove();
            ydui.util.pageScroll.unlock();
            typeof callback === 'function' && callback();
        });
    };

    dialog.toast = function () {
        var timer = null;
        return function (mes, type, timeout, callback) {

            clearTimeout(timer);

            var ID = 'YDUI_TOAST';

            $('#' + ID).remove();

            var args = arguments.length;
            if (args < 2) {
                console.error('From YDUI\'s toast: Please set two or more parameters!!!');
                return;
            }

            var iconHtml = '';
            if (type == 'success' || type == 'error') {
                iconHtml = '<div class="' + (type == 'error' ? 'toast-error-ico' : 'toast-success-ico') + '"></div>';
            }

            var $dom = $('' +
                '<div class="mask-white-dialog" id="' + ID + '">' +
                '    <div class="m-toast ' + (iconHtml == '' ? 'none-icon' : '') + '">' + iconHtml +
                '        <p class="toast-content">' + (mes || '') + '</p>' +
                '    </div>' +
                '</div>');

            ydui.util.pageScroll.lock();

            $body.append($dom);

            if (typeof timeout === 'function' && arguments.length >= 3) {
                callback = timeout;
                timeout = 2000;
            }

            timer = setTimeout(function () {
                clearTimeout(timer);
                ydui.util.pageScroll.unlock();
                $dom.remove();
                typeof callback === 'function' && callback();
            }, (~~timeout || 2000) + 100);//100涓哄姩鐢绘椂闂�
        };
    }();

    dialog.notify = function () {

        var timer = null;

        return function (mes, timeout, callback) {

            clearTimeout(timer);

            var ID = 'YDUI_NOTIFY';

            $('#' + ID).remove();

            var $dom = $('<div id="' + ID + '"><div class="m-notify">' + (mes || '') + '</div></div>');

            $body.append($dom);

            var next = function () {
                $dom.remove();
                typeof callback == 'function' && callback();
            };

            var closeNotify = function () {
                clearTimeout(timer);

                $dom.find('.m-notify').addClass('notify-out');

                $dom.one('webkitTransitionEnd', next).emulateTransitionEnd(150);
            };

            $dom.on('click', closeNotify);

            if (~~timeout > 0) {
                timer = setTimeout(closeNotify, timeout + 200);
            }
        }
    }();

    dialog.loading = function () {

        var ID = 'YDUI_LOADING';

        return {
            open: function (text) {
                $('#' + ID).remove();

                var $dom = $('' +
                    '<div class="mask-white-dialog" id="' + ID + '">' +
                    '   <div class="m-loading">' +
                    '       <div class="loading-icon"></div>' +
                    '       <div class="loading-txt">' + (text || '鏁版嵁鍔犺浇涓�') + '</div>' +
                    '   </div>' +
                    '</div>').remove();

                ydui.util.pageScroll.lock();
                $body.append($dom);
            },
            close: function () {
                ydui.util.pageScroll.unlock();
                $('#' + ID).remove();
            }
        };
    }();
}(window, YDUI);

;(function () {
    'use strict';

    /**
     * @preserve FastClick: polyfill to remove click delays on browsers with touch UIs.
     *
     * @codingstandard ftlabs-jsv2
     * @copyright The Financial Times Limited [All Rights Reserved]
     * @license MIT License (see LICENSE.txt)
     */

    /*jslint browser:true, node:true*/
    /*global define, Event, Node*/


    /**
     * Instantiate fast-clicking listeners on the specified layer.
     *
     * @constructor
     * @param {Element} layer The layer to listen on
     * @param {Object} [options={}] The options to override the defaults
     */
    function FastClick(layer, options) {
        var oldOnClick;

        options = options || {};

        /**
         * Whether a click is currently being tracked.
         *
         * @type boolean
         */
        this.trackingClick = false;


        /**
         * Timestamp for when click tracking started.
         *
         * @type number
         */
        this.trackingClickStart = 0;


        /**
         * The element being tracked for a click.
         *
         * @type EventTarget
         */
        this.targetElement = null;


        /**
         * X-coordinate of touch start event.
         *
         * @type number
         */
        this.touchStartX = 0;


        /**
         * Y-coordinate of touch start event.
         *
         * @type number
         */
        this.touchStartY = 0;


        /**
         * ID of the last touch, retrieved from Touch.identifier.
         *
         * @type number
         */
        this.lastTouchIdentifier = 0;


        /**
         * Touchmove boundary, beyond which a click will be cancelled.
         *
         * @type number
         */
        this.touchBoundary = options.touchBoundary || 10;


        /**
         * The FastClick layer.
         *
         * @type Element
         */
        this.layer = layer;

        /**
         * The minimum time between tap(touchstart and touchend) events
         *
         * @type number
         */
        this.tapDelay = options.tapDelay || 200;

        /**
         * The maximum time for a tap
         *
         * @type number
         */
        this.tapTimeout = options.tapTimeout || 700;

        if (FastClick.notNeeded(layer)) {
            return;
        }

        // Some old versions of Android don't have Function.prototype.bind
        function bind(method, context) {
            return function() { return method.apply(context, arguments); };
        }


        var methods = ['onMouse', 'onClick', 'onTouchStart', 'onTouchMove', 'onTouchEnd', 'onTouchCancel'];
        var context = this;
        for (var i = 0, l = methods.length; i < l; i++) {
            context[methods[i]] = bind(context[methods[i]], context);
        }

        // Set up event handlers as required
        if (deviceIsAndroid) {
            layer.addEventListener('mouseover', this.onMouse, true);
            layer.addEventListener('mousedown', this.onMouse, true);
            layer.addEventListener('mouseup', this.onMouse, true);
        }

        layer.addEventListener('click', this.onClick, true);
        layer.addEventListener('touchstart', this.onTouchStart, false);
        layer.addEventListener('touchmove', this.onTouchMove, false);
        layer.addEventListener('touchend', this.onTouchEnd, false);
        layer.addEventListener('touchcancel', this.onTouchCancel, false);

        // Hack is required for browsers that don't support Event#stopImmediatePropagation (e.g. Android 2)
        // which is how FastClick normally stops click events bubbling to callbacks registered on the FastClick
        // layer when they are cancelled.
        if (!Event.prototype.stopImmediatePropagation) {
            layer.removeEventListener = function(type, callback, capture) {
                var rmv = Node.prototype.removeEventListener;
                if (type === 'click') {
                    rmv.call(layer, type, callback.hijacked || callback, capture);
                } else {
                    rmv.call(layer, type, callback, capture);
                }
            };

            layer.addEventListener = function(type, callback, capture) {
                var adv = Node.prototype.addEventListener;
                if (type === 'click') {
                    adv.call(layer, type, callback.hijacked || (callback.hijacked = function(event) {
                            if (!event.propagationStopped) {
                                callback(event);
                            }
                        }), capture);
                } else {
                    adv.call(layer, type, callback, capture);
                }
            };
        }

        // If a handler is already declared in the element's onclick attribute, it will be fired before
        // FastClick's onClick handler. Fix this by pulling out the user-defined handler function and
        // adding it as listener.
        if (typeof layer.onclick === 'function') {

            // Android browser on at least 3.2 requires a new reference to the function in layer.onclick
            // - the old one won't work if passed to addEventListener directly.
            oldOnClick = layer.onclick;
            layer.addEventListener('click', function(event) {
                oldOnClick(event);
            }, false);
            layer.onclick = null;
        }
    }

    /**
     * Windows Phone 8.1 fakes user agent string to look like Android and iPhone.
     *
     * @type boolean
     */
    var deviceIsWindowsPhone = navigator.userAgent.indexOf("Windows Phone") >= 0;

    /**
     * Android requires exceptions.
     *
     * @type boolean
     */
    var deviceIsAndroid = navigator.userAgent.indexOf('Android') > 0 && !deviceIsWindowsPhone;


    /**
     * iOS requires exceptions.
     *
     * @type boolean
     */
    var deviceIsIOS = /iP(ad|hone|od)/.test(navigator.userAgent) && !deviceIsWindowsPhone;


    /**
     * iOS 4 requires an exception for select elements.
     *
     * @type boolean
     */
    var deviceIsIOS4 = deviceIsIOS && (/OS 4_\d(_\d)?/).test(navigator.userAgent);


    /**
     * iOS 6.0-7.* requires the target element to be manually derived
     *
     * @type boolean
     */
    var deviceIsIOSWithBadTarget = deviceIsIOS && (/OS [6-7]_\d/).test(navigator.userAgent);

    /**
     * BlackBerry requires exceptions.
     *
     * @type boolean
     */
    var deviceIsBlackBerry10 = navigator.userAgent.indexOf('BB10') > 0;

    /**
     * Determine whether a given element requires a native click.
     *
     * @param {EventTarget|Element} target Target DOM element
     * @returns {boolean} Returns true if the element needs a native click
     */
    FastClick.prototype.needsClick = function(target) {
        switch (target.nodeName.toLowerCase()) {

            // Don't send a synthetic click to disabled inputs (issue #62)
            case 'button':
            case 'select':
            case 'textarea':
                if (target.disabled) {
                    return true;
                }

                break;
            case 'input':

                // File inputs need real clicks on iOS 6 due to a browser bug (issue #68)
                if ((deviceIsIOS && target.type === 'file') || target.disabled) {
                    return true;
                }

                break;
            case 'label':
            case 'iframe': // iOS8 homescreen apps can prevent events bubbling into frames
            case 'video':
                return true;
        }

        return (/\bneedsclick\b/).test(target.className);
    };


    /**
     * Determine whether a given element requires a call to focus to simulate click into element.
     *
     * @param {EventTarget|Element} target Target DOM element
     * @returns {boolean} Returns true if the element requires a call to focus to simulate native click.
     */
    FastClick.prototype.needsFocus = function(target) {
        switch (target.nodeName.toLowerCase()) {
            case 'textarea':
                return true;
            case 'select':
                return !deviceIsAndroid;
            case 'input':
                switch (target.type) {
                    case 'button':
                    case 'checkbox':
                    case 'file':
                    case 'image':
                    case 'radio':
                    case 'submit':
                        return false;
                }

                // No point in attempting to focus disabled inputs
                return !target.disabled && !target.readOnly;
            default:
                return (/\bneedsfocus\b/).test(target.className);
        }
    };


    /**
     * Send a click event to the specified element.
     *
     * @param {EventTarget|Element} targetElement
     * @param {Event} event
     */
    FastClick.prototype.sendClick = function(targetElement, event) {
        var clickEvent, touch;

        // On some Android devices activeElement needs to be blurred otherwise the synthetic click will have no effect (#24)
        if (document.activeElement && document.activeElement !== targetElement) {
            document.activeElement.blur();
        }

        touch = event.changedTouches[0];

        // Synthesise a click event, with an extra attribute so it can be tracked
        clickEvent = document.createEvent('MouseEvents');
        clickEvent.initMouseEvent(this.determineEventType(targetElement), true, true, window, 1, touch.screenX, touch.screenY, touch.clientX, touch.clientY, false, false, false, false, 0, null);
        clickEvent.forwardedTouchEvent = true;
        targetElement.dispatchEvent(clickEvent);
    };

    FastClick.prototype.determineEventType = function(targetElement) {

        //Issue #159: Android Chrome Select Box does not open with a synthetic click event
        if (deviceIsAndroid && targetElement.tagName.toLowerCase() === 'select') {
            return 'mousedown';
        }

        return 'click';
    };


    /**
     * @param {EventTarget|Element} targetElement
     */
    FastClick.prototype.focus = function(targetElement) {
        var length;

        // Issue #160: on iOS 7, some input elements (e.g. date datetime month) throw a vague TypeError on setSelectionRange. These elements don't have an integer value for the selectionStart and selectionEnd properties, but unfortunately that can't be used for detection because accessing the properties also throws a TypeError. Just check the type instead. Filed as Apple bug #15122724.
        if (deviceIsIOS && targetElement.setSelectionRange && targetElement.type.indexOf('date') !== 0 && targetElement.type !== 'time' && targetElement.type !== 'month') {
            length = targetElement.value.length;
            targetElement.setSelectionRange(length, length);
        } else {
            targetElement.focus();
        }
    };


    /**
     * Check whether the given target element is a child of a scrollable layer and if so, set a flag on it.
     *
     * @param {EventTarget|Element} targetElement
     */
    FastClick.prototype.updateScrollParent = function(targetElement) {
        var scrollParent, parentElement;

        scrollParent = targetElement.fastClickScrollParent;

        // Attempt to discover whether the target element is contained within a scrollable layer. Re-check if the
        // target element was moved to another parent.
        if (!scrollParent || !scrollParent.contains(targetElement)) {
            parentElement = targetElement;
            do {
                if (parentElement.scrollHeight > parentElement.offsetHeight) {
                    scrollParent = parentElement;
                    targetElement.fastClickScrollParent = parentElement;
                    break;
                }

                parentElement = parentElement.parentElement;
            } while (parentElement);
        }

        // Always update the scroll top tracker if possible.
        if (scrollParent) {
            scrollParent.fastClickLastScrollTop = scrollParent.scrollTop;
        }
    };


    /**
     * @param {EventTarget} targetElement
     * @returns {Element|EventTarget}
     */
    FastClick.prototype.getTargetElementFromEventTarget = function(eventTarget) {

        // On some older browsers (notably Safari on iOS 4.1 - see issue #56) the event target may be a text node.
        if (eventTarget.nodeType === Node.TEXT_NODE) {
            return eventTarget.parentNode;
        }

        return eventTarget;
    };


    /**
     * On touch start, record the position and scroll offset.
     *
     * @param {Event} event
     * @returns {boolean}
     */
    FastClick.prototype.onTouchStart = function(event) {
        var targetElement, touch, selection;

        // Ignore multiple touches, otherwise pinch-to-zoom is prevented if both fingers are on the FastClick element (issue #111).
        if (event.targetTouches.length > 1) {
            return true;
        }

        targetElement = this.getTargetElementFromEventTarget(event.target);
        touch = event.targetTouches[0];

        if (deviceIsIOS) {

            // Only trusted events will deselect text on iOS (issue #49)
            selection = window.getSelection();
            if (selection.rangeCount && !selection.isCollapsed) {
                return true;
            }

            if (!deviceIsIOS4) {

                // Weird things happen on iOS when an alert or confirm dialog is opened from a click event callback (issue #23):
                // when the user next taps anywhere else on the page, new touchstart and touchend events are dispatched
                // with the same identifier as the touch event that previously triggered the click that triggered the alert.
                // Sadly, there is an issue on iOS 4 that causes some normal touch events to have the same identifier as an
                // immediately preceeding touch event (issue #52), so this fix is unavailable on that platform.
                // Issue 120: touch.identifier is 0 when Chrome dev tools 'Emulate touch events' is set with an iOS device UA string,
                // which causes all touch events to be ignored. As this block only applies to iOS, and iOS identifiers are always long,
                // random integers, it's safe to to continue if the identifier is 0 here.
                if (touch.identifier && touch.identifier === this.lastTouchIdentifier) {
                    event.preventDefault();
                    return false;
                }

                this.lastTouchIdentifier = touch.identifier;

                // If the target element is a child of a scrollable layer (using -webkit-overflow-scrolling: touch) and:
                // 1) the user does a fling scroll on the scrollable layer
                // 2) the user stops the fling scroll with another tap
                // then the event.target of the last 'touchend' event will be the element that was under the user's finger
                // when the fling scroll was started, causing FastClick to send a click event to that layer - unless a check
                // is made to ensure that a parent layer was not scrolled before sending a synthetic click (issue #42).
                this.updateScrollParent(targetElement);
            }
        }

        this.trackingClick = true;
        this.trackingClickStart = event.timeStamp;
        this.targetElement = targetElement;

        this.touchStartX = touch.pageX;
        this.touchStartY = touch.pageY;

        // Prevent phantom clicks on fast double-tap (issue #36)
        if ((event.timeStamp - this.lastClickTime) < this.tapDelay) {
            event.preventDefault();
        }

        return true;
    };


    /**
     * Based on a touchmove event object, check whether the touch has moved past a boundary since it started.
     *
     * @param {Event} event
     * @returns {boolean}
     */
    FastClick.prototype.touchHasMoved = function(event) {
        var touch = event.changedTouches[0], boundary = this.touchBoundary;

        if (Math.abs(touch.pageX - this.touchStartX) > boundary || Math.abs(touch.pageY - this.touchStartY) > boundary) {
            return true;
        }

        return false;
    };


    /**
     * Update the last position.
     *
     * @param {Event} event
     * @returns {boolean}
     */
    FastClick.prototype.onTouchMove = function(event) {
        if (!this.trackingClick) {
            return true;
        }

        // If the touch has moved, cancel the click tracking
        if (this.targetElement !== this.getTargetElementFromEventTarget(event.target) || this.touchHasMoved(event)) {
            this.trackingClick = false;
            this.targetElement = null;
        }

        return true;
    };


    /**
     * Attempt to find the labelled control for the given label element.
     *
     * @param {EventTarget|HTMLLabelElement} labelElement
     * @returns {Element|null}
     */
    FastClick.prototype.findControl = function(labelElement) {

        // Fast path for newer browsers supporting the HTML5 control attribute
        if (labelElement.control !== undefined) {
            return labelElement.control;
        }

        // All browsers under test that support touch events also support the HTML5 htmlFor attribute
        if (labelElement.htmlFor) {
            return document.getElementById(labelElement.htmlFor);
        }

        // If no for attribute exists, attempt to retrieve the first labellable descendant element
        // the list of which is defined here: http://www.w3.org/TR/html5/forms.html#category-label
        return labelElement.querySelector('button, input:not([type=hidden]), keygen, meter, output, progress, select, textarea');
    };


    /**
     * On touch end, determine whether to send a click event at once.
     *
     * @param {Event} event
     * @returns {boolean}
     */
    FastClick.prototype.onTouchEnd = function(event) {
        var forElement, trackingClickStart, targetTagName, scrollParent, touch, targetElement = this.targetElement;

        if (!this.trackingClick) {
            return true;
        }

        // Prevent phantom clicks on fast double-tap (issue #36)
        if ((event.timeStamp - this.lastClickTime) < this.tapDelay) {
            this.cancelNextClick = true;
            return true;
        }

        if ((event.timeStamp - this.trackingClickStart) > this.tapTimeout) {
            return true;
        }

        // Reset to prevent wrong click cancel on input (issue #156).
        this.cancelNextClick = false;

        this.lastClickTime = event.timeStamp;

        trackingClickStart = this.trackingClickStart;
        this.trackingClick = false;
        this.trackingClickStart = 0;

        // On some iOS devices, the targetElement supplied with the event is invalid if the layer
        // is performing a transition or scroll, and has to be re-detected manually. Note that
        // for this to function correctly, it must be called *after* the event target is checked!
        // See issue #57; also filed as rdar://13048589 .
        if (deviceIsIOSWithBadTarget) {
            touch = event.changedTouches[0];

            // In certain cases arguments of elementFromPoint can be negative, so prevent setting targetElement to null
            targetElement = document.elementFromPoint(touch.pageX - window.pageXOffset, touch.pageY - window.pageYOffset) || targetElement;
            targetElement.fastClickScrollParent = this.targetElement.fastClickScrollParent;
        }

        targetTagName = targetElement.tagName.toLowerCase();
        if (targetTagName === 'label') {
            forElement = this.findControl(targetElement);
            if (forElement) {
                this.focus(targetElement);
                if (deviceIsAndroid) {
                    return false;
                }

                targetElement = forElement;
            }
        } else if (this.needsFocus(targetElement)) {

            // Case 1: If the touch started a while ago (best guess is 100ms based on tests for issue #36) then focus will be triggered anyway. Return early and unset the target element reference so that the subsequent click will be allowed through.
            // Case 2: Without this exception for input elements tapped when the document is contained in an iframe, then any inputted text won't be visible even though the value attribute is updated as the user types (issue #37).
            if ((event.timeStamp - trackingClickStart) > 100 || (deviceIsIOS && window.top !== window && targetTagName === 'input')) {
                this.targetElement = null;
                return false;
            }

            this.focus(targetElement);
            this.sendClick(targetElement, event);

            // Select elements need the event to go through on iOS 4, otherwise the selector menu won't open.
            // Also this breaks opening selects when VoiceOver is active on iOS6, iOS7 (and possibly others)
            if (!deviceIsIOS || targetTagName !== 'select') {
                this.targetElement = null;
                event.preventDefault();
            }

            return false;
        }

        if (deviceIsIOS && !deviceIsIOS4) {

            // Don't send a synthetic click event if the target element is contained within a parent layer that was scrolled
            // and this tap is being used to stop the scrolling (usually initiated by a fling - issue #42).
            scrollParent = targetElement.fastClickScrollParent;
            if (scrollParent && scrollParent.fastClickLastScrollTop !== scrollParent.scrollTop) {
                return true;
            }
        }

        // Prevent the actual click from going though - unless the target node is marked as requiring
        // real clicks or if it is in the whitelist in which case only non-programmatic clicks are permitted.
        if (!this.needsClick(targetElement)) {
            event.preventDefault();
            this.sendClick(targetElement, event);
        }

        return false;
    };


    /**
     * On touch cancel, stop tracking the click.
     *
     * @returns {void}
     */
    FastClick.prototype.onTouchCancel = function() {
        this.trackingClick = false;
        this.targetElement = null;
    };


    /**
     * Determine mouse events which should be permitted.
     *
     * @param {Event} event
     * @returns {boolean}
     */
    FastClick.prototype.onMouse = function(event) {

        // If a target element was never set (because a touch event was never fired) allow the event
        if (!this.targetElement) {
            return true;
        }

        if (event.forwardedTouchEvent) {
            return true;
        }

        // Programmatically generated events targeting a specific element should be permitted
        if (!event.cancelable) {
            return true;
        }

        // Derive and check the target element to see whether the mouse event needs to be permitted;
        // unless explicitly enabled, prevent non-touch click events from triggering actions,
        // to prevent ghost/doubleclicks.
        if (!this.needsClick(this.targetElement) || this.cancelNextClick) {

            // Prevent any user-added listeners declared on FastClick element from being fired.
            if (event.stopImmediatePropagation) {
                event.stopImmediatePropagation();
            } else {

                // Part of the hack for browsers that don't support Event#stopImmediatePropagation (e.g. Android 2)
                event.propagationStopped = true;
            }

            // Cancel the event
            event.stopPropagation();
            event.preventDefault();

            return false;
        }

        // If the mouse event is permitted, return true for the action to go through.
        return true;
    };


    /**
     * On actual clicks, determine whether this is a touch-generated click, a click action occurring
     * naturally after a delay after a touch (which needs to be cancelled to avoid duplication), or
     * an actual click which should be permitted.
     *
     * @param {Event} event
     * @returns {boolean}
     */
    FastClick.prototype.onClick = function(event) {
        var permitted;

        // It's possible for another FastClick-like library delivered with third-party code to fire a click event before FastClick does (issue #44). In that case, set the click-tracking flag back to false and return early. This will cause onTouchEnd to return early.
        if (this.trackingClick) {
            this.targetElement = null;
            this.trackingClick = false;
            return true;
        }

        // Very odd behaviour on iOS (issue #18): if a submit element is present inside a form and the user hits enter in the iOS simulator or clicks the Go button on the pop-up OS keyboard the a kind of 'fake' click event will be triggered with the submit-type input element as the target.
        if (event.target.type === 'submit' && event.detail === 0) {
            return true;
        }

        permitted = this.onMouse(event);

        // Only unset targetElement if the click is not permitted. This will ensure that the check for !targetElement in onMouse fails and the browser's click doesn't go through.
        if (!permitted) {
            this.targetElement = null;
        }

        // If clicks are permitted, return true for the action to go through.
        return permitted;
    };


    /**
     * Remove all FastClick's event listeners.
     *
     * @returns {void}
     */
    FastClick.prototype.destroy = function() {
        var layer = this.layer;

        if (deviceIsAndroid) {
            layer.removeEventListener('mouseover', this.onMouse, true);
            layer.removeEventListener('mousedown', this.onMouse, true);
            layer.removeEventListener('mouseup', this.onMouse, true);
        }

        layer.removeEventListener('click', this.onClick, true);
        layer.removeEventListener('touchstart', this.onTouchStart, false);
        layer.removeEventListener('touchmove', this.onTouchMove, false);
        layer.removeEventListener('touchend', this.onTouchEnd, false);
        layer.removeEventListener('touchcancel', this.onTouchCancel, false);
    };


    /**
     * Check whether FastClick is needed.
     *
     * @param {Element} layer The layer to listen on
     */
    FastClick.notNeeded = function(layer) {
        var metaViewport;
        var chromeVersion;
        var blackberryVersion;
        var firefoxVersion;

        // Devices that don't support touch don't need FastClick
        if (typeof window.ontouchstart === 'undefined') {
            return true;
        }

        // Chrome version - zero for other browsers
        chromeVersion = +(/Chrome\/([0-9]+)/.exec(navigator.userAgent) || [,0])[1];

        if (chromeVersion) {

            if (deviceIsAndroid) {
                metaViewport = document.querySelector('meta[name=viewport]');

                if (metaViewport) {
                    // Chrome on Android with user-scalable="no" doesn't need FastClick (issue #89)
                    if (metaViewport.content.indexOf('user-scalable=no') !== -1) {
                        return true;
                    }
                    // Chrome 32 and above with width=device-width or less don't need FastClick
                    if (chromeVersion > 31 && document.documentElement.scrollWidth <= window.outerWidth) {
                        return true;
                    }
                }

                // Chrome desktop doesn't need FastClick (issue #15)
            } else {
                return true;
            }
        }

        if (deviceIsBlackBerry10) {
            blackberryVersion = navigator.userAgent.match(/Version\/([0-9]*)\.([0-9]*)/);

            // BlackBerry 10.3+ does not require Fastclick library.
            // https://github.com/ftlabs/fastclick/issues/251
            if (blackberryVersion[1] >= 10 && blackberryVersion[2] >= 3) {
                metaViewport = document.querySelector('meta[name=viewport]');

                if (metaViewport) {
                    // user-scalable=no eliminates click delay.
                    if (metaViewport.content.indexOf('user-scalable=no') !== -1) {
                        return true;
                    }
                    // width=device-width (or less than device-width) eliminates click delay.
                    if (document.documentElement.scrollWidth <= window.outerWidth) {
                        return true;
                    }
                }
            }
        }

        // IE10 with -ms-touch-action: none or manipulation, which disables double-tap-to-zoom (issue #97)
        if (layer.style.msTouchAction === 'none' || layer.style.touchAction === 'manipulation') {
            return true;
        }

        // Firefox version - zero for other browsers
        firefoxVersion = +(/Firefox\/([0-9]+)/.exec(navigator.userAgent) || [,0])[1];

        if (firefoxVersion >= 27) {
            // Firefox 27+ does not have tap delay if the content is not zoomable - https://bugzilla.mozilla.org/show_bug.cgi?id=922896

            metaViewport = document.querySelector('meta[name=viewport]');
            if (metaViewport && (metaViewport.content.indexOf('user-scalable=no') !== -1 || document.documentElement.scrollWidth <= window.outerWidth)) {
                return true;
            }
        }

        // IE11: prefixed -ms-touch-action is no longer supported and it's recomended to use non-prefixed version
        // http://msdn.microsoft.com/en-us/library/windows/apps/Hh767313.aspx
        if (layer.style.touchAction === 'none' || layer.style.touchAction === 'manipulation') {
            return true;
        }

        return false;
    };


    /**
     * Factory method for creating a FastClick object
     *
     * @param {Element} layer The layer to listen on
     * @param {Object} [options={}] The options to override the defaults
     */
    FastClick.attach = function(layer, options) {
        return new FastClick(layer, options);
    };


    if (typeof define === 'function' && typeof define.amd === 'object' && define.amd) {

        // AMD. Register as an anonymous module.
        define(function() {
            return FastClick;
        });
    } else if (typeof module !== 'undefined' && module.exports) {
        module.exports = FastClick.attach;
        module.exports.FastClick = FastClick;
    } else {
        window.FastClick = FastClick;
    }
}());

/**
 * InfiniteScroll Plugin
 */
!function (window) {
    "use strict";

    var util = window.YDUI.util;

    function InfiniteScroll (element, options) {
        this.$element = $(element);
        this.options = $.extend({}, InfiniteScroll.DEFAULTS, options || {});
        this.init();
    }

    InfiniteScroll.DEFAULTS = {
        binder: window,  
        initLoad: true,  
        pageSize: 0,  
        loadingHtml: '鍔犺浇涓�...',  
        doneTxt: '娌℃湁鏇村鏁版嵁浜�',  
        backposition: false,  
        jumpLink: '',  
        loadListFn: null,  
        loadStorageListFn: null  
    };

    InfiniteScroll.prototype.init = function () {
        var _this = this,
            options = _this.options,
            _location = window.location;

        if (~~options.pageSize <= 0) {
            console.error('[YDUI warn]: 闇€鎸囧畾pageSize鍙傛暟銆愬嵆姣忛〉璇锋眰鏁版嵁鐨勯暱搴︺€�');
            return;
        }

        var primaryKey = _location.pathname.toUpperCase().replace(/\/?\.?/g, '');
        if (!primaryKey) {
            primaryKey = 'YDUI_' + _location.host.toUpperCase().replace(/\/?\.?:?/g, '');
        }

        _this.backParamsKey = primaryKey + '_BACKPARAMS';
        _this.backParamsListKey = primaryKey + '_LIST_';

        _this.$element.append(_this.$tag = $('<div class="J_InfiniteScrollTag"></div>'));

        _this.listOffsetTop = _this.$element.offset().top;

        _this.initLoadingTip();

        if (options.initLoad) {
            if (!options.backposition) {
                _this.loadList();
            } else {
                // !util.localStorage.get(_this.backParamsKey) && _this.loadList();
                !util.sessionStorage.get(_this.backParamsKey) && _this.loadList();
            }
        }

        _this.bindScrollEvent();

        if (options.backposition) {
            _this.loadListFromStorage();

            _this.bindLinkEvent();
        }
    };
    InfiniteScroll.prototype.initLoadingTip = function () {
        var _this = this;

        _this.$element.append(_this.$loading = $('<div class="list-loading">' + _this.options.loadingHtml + '</div>'));
    };

    InfiniteScroll.prototype.scrollPosition = function () {
        var _this = this,
            options = _this.options,
            $binder = $(options.binder);

        var backParams = util.sessionStorage.get(_this.backParamsKey);

        backParams && $binder.stop().animate({scrollTop: backParams.offsetTop}, 0, function () {
            _this.scrolling = false;
        });

        options.backposition && _this.bindLinkEvent();

        util.pageScroll.unlock();

        util.sessionStorage.remove(_this.backParamsKey);
    };

    InfiniteScroll.prototype.bindScrollEvent = function () {
        var _this = this,
            $binder = $(_this.options.binder),
            isWindow = $binder.get(0) === window,
            contentHeight = isWindow ? $(window).height() : $binder.height();

        $binder.on('scroll.ydui.infinitescroll', function () {

            if (_this.loading || _this.isDone)return;

            var contentTop = isWindow ? $(window).scrollTop() : $binder.offset().top;

            if (_this.$tag.offset().top <= contentTop + contentHeight + contentHeight / 10) {
                _this.loadList();
            }
        });
    };

    /**
     * 璺宠浆璇︽儏椤靛墠澶勭悊鎿嶄綔
     * description: 鐐瑰嚮璺宠浆鍓嶅偍瀛樺綋鍓嶄綅缃互鍙婇〉闈紝涔嬪悗鍐嶈烦杞�
     */
    InfiniteScroll.prototype.bindLinkEvent = function () {
        var _this = this,
            options = _this.options;

        if (!options.jumpLink) {
            console.error('[YDUI warn]: 闇€鎸囧畾璺宠浆璇︽儏椤甸摼鎺ュ厓绱�');
            return;
        }

        $(_this.options.binder).on('click.ydui.infinitescroll', _this.options.jumpLink, function (e) {
            e.preventDefault();

            var $this = $(this),
                page = $this.data('page');

            if (!page) {
                console.error('[YDUI warn]: 璺宠浆閾炬帴鍏冪礌闇€娣诲姞灞炴€data-page="鍏舵墍鍦ㄩ〉鐮�"]');
                return;
            }

            util.sessionStorage.set(_this.backParamsKey, {
                offsetTop: $(_this.options.binder).scrollTop() + $this.offset().top - _this.listOffsetTop,
                page: page
            });

            location.href = $this.attr('href');
        });
    };

    InfiniteScroll.prototype.loadList = function () {
        var _this = this,
            options = _this.options;

        _this.loading = true;
        _this.$loading.show();

        if (typeof options.loadListFn == 'function') {

            options.loadListFn().done(function (listArr, page) {
                var len = listArr.length;

                if (~~len <= 0) {
                    console.error('[YDUI warn]: 闇€鍦� resolve() 鏂规硶閲屽洖浼犳湰娆¤幏鍙栬褰曢泦鍚�');
                    return;
                }

                if (len < options.pageSize) {
                    _this.$element.append('<div class="list-donetip">' + options.doneTxt + '</div>');
                    _this.isDone = true;
                }
                _this.$loading.hide();
                _this.loading = false;

                if (options.backposition) {
                    util.sessionStorage.set(_this.backParamsListKey + page, listArr);
                }
            });
        }
    };

    InfiniteScroll.prototype.loadListFromStorage = function () {
        var _this = this,
            storage = util.sessionStorage.get(_this.backParamsKey);

        if (!storage)return;

        util.pageScroll.lock();

        var pageTotal = storage.page;

        var listArr = [];

        for (var i = 1; i <= pageTotal; i++) {
            var _list = util.sessionStorage.get(_this.backParamsListKey + i);

            listArr.push({
                page: i,
                list: _list
            });

            if (i == pageTotal && _list.length < _this.options.pageSize) {
                _this.$element.append('<div class="list-donetip">' + _this.options.doneTxt + '</div>');
                _this.$loading.hide();
                _this.loading = false;
                _this.isDone = true;
            }
        }

        _this.options.loadStorageListFn(listArr, pageTotal + 1).done(function () {
            _this.scrollPosition();
        });
    };

    function Plugin (option) {
        return this.each(function () {
            new InfiniteScroll(this, option);
        });
    }

    $.fn.infiniteScroll = Plugin;

}(window);

/**
 * KeyBoard Plugin
 */
!function (window) {
    "use strict";

    var $body = $(window.document.body),
        isMobile = !!(window.navigator && window.navigator.userAgent || '').match(/AppleWebKit.*Mobile.*/) || 'ontouchstart' in window.document.documentElement,
        triggerEvent = isMobile ? 'touchstart' : 'click';

    function KeyBoard (element, options) {
        this.$element = $(element);
        this.options = $.extend({}, KeyBoard.DEFAULTS, options || {});
        this.init();
    }

    KeyBoard.DEFAULTS = {
        disorder: false,
        title: '瀹夊叏閿洏'
    };

    KeyBoard.prototype.init = function () {
        var _this = this;

        _this.inputNums = '';

        _this.toggleClass = 'keyboard-show';

        function getDot () {
            var s = '';
            for (var i = 0; i < 6; i++) {
                s += '<li><i></i></li>';
            }
            return s;
        }

        var hd = '' +
            '<div class="keyboard-head"><strong>杈撳叆鏁板瓧瀵嗙爜</strong></div>' +
            '<div class="keyboard-error"></div>' +
            '<ul class="keyboard-password J_FillPwdBox">' + getDot() + '</ul>';

        var ft = '' +
            '<div class="keyboard-content">' +
            '   <div class="keyboard-title">' + _this.options.title + '</div>' +
            '   <ul class="keyboard-numbers"></ul>' +
            '</div>';

        _this.$element.prepend(hd).append(ft);

        _this.$numsBox = _this.$element.find('.keyboard-numbers');

        _this.$mask = $('<div class="mask-black"></div>');
    };

    KeyBoard.prototype.open = function () {
        var _this = this,
            $element = _this.$element,
            $numsBox = _this.$numsBox;

        YDUI.device.isIOS && $('.g-scrollview').addClass('g-fix-ios-overflow-scrolling-bug');

        $element.addClass(_this.toggleClass);

        if (_this.options.disorder || $numsBox.data('loaded-nums') != 1) {
            $numsBox.data('loaded-nums', 1).html(_this.createNumsHtml());
        }

        $body.append(_this.$mask);

        _this.bindEvent();
    };

    KeyBoard.prototype.close = function () {
        var _this = this;

        YDUI.device.isIOS && $('.g-scrollview').removeClass('g-fix-ios-overflow-scrolling-bug');

        _this.$mask.remove();
        _this.$element.removeClass(_this.toggleClass);
        _this.unbindEvent();

        _this.inputNums = '';
        _this.fillPassword();

        _this.clearError();
    };

    KeyBoard.prototype.bindEvent = function () {
        var _this = this,
            $element = _this.$element;

        _this.$mask.on(triggerEvent + '.ydui.keyboard.mask', function (e) {
            e.preventDefault();
            _this.close();
        });

        $element.on(triggerEvent + '.ydui.keyboard.nums', '.J_Nums', function (e) {
            if (_this.inputNums.length >= 6)return;

            _this.inputNums = _this.inputNums + $(this).html();

            _this.clearError();
            _this.fillPassword();
        });

        $element.on(triggerEvent + '.ydui.keyboard.backspace', '.J_Backspace', function (e) {
            e.preventDefault();
            _this.backspace();
        });

        $element.on(triggerEvent + '.ydui.keyboard.cancel', '.J_Cancel', function (e) {
            e.preventDefault();
            _this.close();
        });
    };

    KeyBoard.prototype.unbindEvent = function () {
        this.$element.off(triggerEvent + '.ydui.keyboard');
        $(window).off('hashchange.ydui.keyboard');
    };

    KeyBoard.prototype.fillPassword = function () {
        var _this = this,
            inputNums = _this.inputNums,
            length = inputNums.length;

        var $li = _this.$element.find('.J_FillPwdBox').find('li');
        $li.find('i').hide();
        $li.filter(':lt(' + length + ')').find('i').css('display', 'block');

        if (length >= 6) {
            _this.$element.trigger($.Event('done.ydui.keyboard', {
                password: inputNums
            }));
        }
    };

    KeyBoard.prototype.clearError = function () {
        this.$element.find('.keyboard-error').html('');
    };

    KeyBoard.prototype.error = function (mes) {
        var _this = this;
        _this.$element.find('.keyboard-error').html(mes);

        _this.inputNums = '';
        _this.fillPassword();
    };

    KeyBoard.prototype.backspace = function () {
        var _this = this;

        var _inputNums = _this.inputNums;
        if (_inputNums) {
            _this.inputNums = _inputNums.substr(0, _inputNums.length - 1);
        }

        _this.fillPassword();
    };

    KeyBoard.prototype.createNumsHtml = function () {
        var _this = this,
            nums = _this.createNums();

        _this.options.disorder && _this.upsetOrder(nums);

        var arr = [];
        $.each(nums, function (k) {
            if (k % 3 == 0) {
                if (k >= nums.length - 2) {
                    arr.push('<li><a href="javascript:;" class="J_Cancel">鍙栨秷</a>' + nums.slice(k, k + 3).join('') + '<a href="javascript:;" class="J_Backspace"></a></li>');
                } else {
                    arr.push('<li>' + nums.slice(k, k + 3).join('') + '</li>');
                }
            }
        });

        return arr.join('');
    };

    KeyBoard.prototype.createNums = function () {
        var _this = this;
        var disorder = _this.options.disorder;

        if (disorder && _this.cacheNums) {
            return _this.cacheNums;
        }

        var strArr = [];
        for (var i = 1; i <= 10; i++) {
            strArr.push('<a href="javascript:;" class="J_Nums">' + (i % 10) + '</div>');
        }

        if (!disorder) {
            _this.cacheNums = strArr;
        }

        return strArr;
    };

    KeyBoard.prototype.upsetOrder = function (arr) {
        var floor = Math.floor,
            random = Math.random,
            len = arr.length, i, j, temp,
            n = floor(len / 2) + 1;
        while (n--) {
            i = floor(random() * len);
            j = floor(random() * len);
            if (i !== j) {
                temp = arr[i];
                arr[i] = arr[j];
                arr[j] = temp;
            }
        }
        return arr;
    };

    function Plugin (option) {
        var args = Array.prototype.slice.call(arguments, 1);

        return this.each(function () {

            var $this = $(this),
                keyboard = $this.data('ydui.keyboard');

            if (!keyboard) {
                $this.data('ydui.keyboard', (keyboard = new KeyBoard(this, option)));
            }

            if (typeof option == 'string') {
                keyboard[option] && keyboard[option].apply(keyboard, args);
            }
        });
    }

    $.fn.keyBoard = Plugin;

}(window);

/**
 * LazyLoad Plugin
 * @example $(selector).find("img").lazyLoad();
 */
!function (window) {
    "use strict";

    function LazyLoad (element, options) {
        this.$element = $(element);
        this.options = $.extend({}, LazyLoad.DEFAULTS, options || {});
        this.init();
    }

    LazyLoad.DEFAULTS = {
        attr: 'data-url',
        binder: window,
        placeholder: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAAAAAA6fptVAAAACklEQVQIHWN4BQAA7ADrKJeAMwAAAABJRU5ErkJggg=='
    };

    LazyLoad.prototype.init = function () {
        var _this = this;

        _this.bindImgEvent();

        _this.loadImg();

        $(_this.options.binder).on('scroll.ydui.lazyload', function () {
            _this.loadImg();
        });

        $(window).on('resize.ydui.lazyload', function () {
            _this.loadImg();
        });
    };

    LazyLoad.prototype.loadImg = function () {
        var _this = this,
            options = _this.options,
            $binder = $(options.binder);

        var contentHeight = $binder.height(),
            contentTop = $binder.get(0) === window ? $(window).scrollTop() : $binder.offset().top;

        _this.$element.each(function () {
            var $img = $(this);

            var post = $img.offset().top - contentTop,
                posb = post + $img.height();

            if ((post >= 0 && post < contentHeight) || (posb > 0 && posb <= contentHeight)) {
                $img.trigger('appear.ydui.lazyload');
            }
        });
    };

    LazyLoad.prototype.bindImgEvent = function () {
        var _this = this,
            options = _this.options;

        _this.$element.each(function () {
            var $img = $(this);

            if ($img.is("img") && !$img.attr("src")) {
                $img.attr("src", options.placeholder);
            }

            $img.one("appear.ydui.lazyload", function () {
                if ($img.is("img")) {
                    $img.attr("src", $img.attr(options.attr));
                }
            });
        });
    };

    $.fn.lazyLoad = function (option) {
        new LazyLoad(this, option);
    };

}(window);

/**
 * ProgressBar Plugin
 * Refer to: https://github.com/kimmobrunfeldt/progressbar.js.git
 */
!function (window) {
    "use strict";

    var doc = window.document,
        util = window.YDUI.util;

    function Circle (element, options) {
        this.pathTemplate = 'M 50,50 m 0,-{radius} a {radius},{radius} 0 1 1 0,{2radius} a {radius},{radius} 0 1 1 0,-{2radius}';
        ProgressBar.apply(this, arguments);
    }

    Circle.prototype = new ProgressBar();

    Circle.prototype.getPathString = function (widthOfWider) {
        var _this = this,
            r = 50 - widthOfWider / 2;
        return _this.render(_this.pathTemplate, {
            radius: r,
            '2radius': r * 2
        });
    };

    Circle.prototype.initSvg = function (svg) {
        svg.setAttribute('viewBox', '0 0 100 100');
        svg.style.display = 'block';
        svg.style.width = '100%';
    };

    function Line (element, options) {
        this.pathTemplate = 'M 0,{center} L 100,{center}';
        ProgressBar.apply(this, arguments);
    }

    Line.prototype = new ProgressBar();

    Line.prototype.getPathString = function (widthOfWider) {
        var _this = this;
        return _this.render(_this.pathTemplate, {
            center: widthOfWider / 2
        });
    };

    Line.prototype.initSvg = function (svg, options) {
        svg.setAttribute('viewBox', '0 0 100 ' + options.strokeWidth);
        svg.setAttribute('preserveAspectRatio', 'none');
        svg.style.width = '100%';
        svg.style.height = '100%';
    };

    function ProgressBar (element, options) {
        this.$element = $(element);
        this.options = $.extend({}, ProgressBar.DEFAULTS, options || {});
    }

    ProgressBar.DEFAULTS = {
        type: 'circle',
        strokeWidth: 0,
        strokeColor: '#E5E5E5',
        trailWidth: 0,
        trailColor: '#646464',
        fill: '',
        progress: 0,
        delay: true,
        binder: window
    };

    ProgressBar.prototype.set = function (progress) {

        var _this = this,
            length = _this.trailPath.getTotalLength();

        if (!progress) progress = _this.options.progress;
        if (progress > 1)progress = 1;

        _this.trailPath.style.strokeDashoffset = length - progress * length;
    };

    ProgressBar.prototype.appendView = function () {
        var _this = this,
            options = _this.options,
            progress = options.progress,
            svgView = _this.createSvgView(),
            $element = _this.$element;

        _this.$binder = options.binder === window || options.binder == 'window' ? $(window) : $(options.binder);

        var path = svgView.trailPath,
            length = path.getTotalLength();

        path.style.strokeDasharray = length + ' ' + length;

        var $svg = $(svgView.svg);
        $svg.one('appear.ydui.progressbar', function () {
            _this.set(progress);
        });
        $element.append($svg);

        if (options.delay) {
            _this.checkInView($svg);

            _this.$binder.on('scroll.ydui.progressbar', function () {
                _this.checkInView($svg);
            });

            $(window).on('resize', function () {
                _this.checkInView($svg);
            });
        } else {
            $svg.trigger('appear.ydui.progressbar');
        }

        return this;
    };

    ProgressBar.prototype.checkInView = function ($svg) {

        var _this = this,
            $binder = _this.$binder,
            contentHeight = $binder.height(),
            contentTop = $binder.get(0) === window ? $(window).scrollTop() : $binder.offset().top;

        var post = $svg.offset().top - contentTop,
            posb = post + $svg.height();

        if ((post >= 0 && post < contentHeight) || (posb > 0 && posb <= contentHeight)) {
            $svg.trigger('appear.ydui.progressbar');
        }
    };

    ProgressBar.prototype.createSvgView = function () {
        var _this = this,
            options = _this.options;

        var svg = doc.createElementNS('http://www.w3.org/2000/svg', 'svg');
        _this.initSvg(svg, options);

        var path = _this.createPath(options);
        svg.appendChild(path);

        var trailPath = null;
        if (options.trailColor || options.trailWidth) {
            trailPath = _this.createTrailPath(options);
            trailPath.style.strokeDashoffset = trailPath.getTotalLength();
            svg.appendChild(trailPath);
        }

        _this.svg = svg;
        _this.trailPath = trailPath;

        return {
            svg: svg,
            trailPath: trailPath
        }
    };

    ProgressBar.prototype.createTrailPath = function (options) {

        var _this = this;

        if (options.trailWidth == 0) {
            options.trailWidth = options.strokeWidth;
        }

        var pathString = _this.getPathString(options.trailWidth);

        return _this.createPathElement(pathString, options.trailColor, options.trailWidth);
    };

    ProgressBar.prototype.createPath = function (options) {
        var _this = this,
            width = options.strokeWidth;

        if (options.trailWidth && options.trailWidth > options.strokeWidth) {
            width = options.trailWidth;
        }

        var pathString = _this.getPathString(width);
        return _this.createPathElement(pathString, options.strokeColor, options.strokeWidth, options.fill);
    };

    ProgressBar.prototype.createPathElement = function (pathString, color, width, fill) {

        var path = doc.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', pathString);
        path.setAttribute('stroke', color);
        path.setAttribute('stroke-width', width);

        if (fill) {
            path.setAttribute('fill', fill);
        } else {
            path.setAttribute('fill-opacity', '0');
        }

        return path;
    };

    ProgressBar.prototype.render = function (template, vars) {
        var rendered = template;

        for (var key in vars) {
            if (vars.hasOwnProperty(key)) {
                var val = vars[key];
                var regExpString = '\\{' + key + '\\}';
                var regExp = new RegExp(regExpString, 'g');

                rendered = rendered.replace(regExp, val);
            }
        }

        return rendered;
    };

    function Plugin (option) {
        var args = Array.prototype.slice.call(arguments, 1);

        return this.each(function () {
            var $this = $(this),
                progressbar = $this.data('ydui.progressbar');

            if (!progressbar) {
                if (option.type == 'line') {
                    $this.data('ydui.progressbar', (progressbar = new Line(this, option)));
                } else {
                    $this.data('ydui.progressbar', (progressbar = new Circle(this, option)));
                }
                if (!option || typeof option == 'object') {
                    progressbar.appendView();
                }
            }

            if (typeof option == 'string') {
                progressbar[option] && progressbar[option].apply(progressbar, args);
            }
        });
    }

    $('[data-ydui-progressbar]').each(function () {
        var $this = $(this);

        Plugin.call($this, util.parseOptions($this.data('ydui-progressbar')));
    });

    $.fn.progressBar = Plugin;

}(window);

/**
 * PullRefresh Plugin
 */
!function (window) {
    "use strict";

    function PullRefresh(element, options) {
        this.$element = $(element);
        this.options = $.extend({}, PullRefresh.DEFAULTS, options || {});
        this.init();
    }

    PullRefresh.DEFAULTS = {
        loadListFn: null,
        initLoad: true,
        distance: 100
    };

    PullRefresh.prototype.init = function () {
        var _this = this,
            touches = _this.touches;

        _this.$dragTip = $('<div class="pullrefresh-dragtip"><span></span></div>');

        _this.$element.after(_this.$dragTip);

        _this.offsetTop = _this.$element.offset().top;

        _this.initTip();

        _this.bindEvent();

        if (_this.options.initLoad) {
            touches.loading = true;

            typeof _this.options.loadListFn == 'function' && _this.options.loadListFn().done(function () {
                touches.loading = false;
            });
        }
    };

    PullRefresh.prototype.bindEvent = function () {
        var _this = this;

        _this.$element.on('touchstart.ydui.pullrefresh', function (e) {
            _this.onTouchStart(e);
        }).on('touchmove.ydui.pullrefresh', function (e) {
            _this.onTouchMove(e);
        }).on('touchend.ydui.pullrefresh', function (e) {
            _this.onTouchEnd(e);
        });

        _this.stopWeixinDrag();
    };

    PullRefresh.prototype.touches = {
        loading: false,
        startClientY: 0,
        moveOffset: 0,
        isDraging: false
    };

    PullRefresh.prototype.stopWeixinDrag = function () {
        var _this = this;
        $(document.body).on('touchmove.ydui.pullrefresh', function (event) {
            _this.touches.isDraging && event.preventDefault();
        });
    };

    PullRefresh.prototype.onTouchStart = function (event) {
        var _this = this;

        if (_this.touches.loading) {
            event.preventDefault();
            return;
        }

        if (_this.$element.offset().top < _this.offsetTop) {
            return;
        }

        _this.touches.startClientY = event.originalEvent.touches[0].clientY;
    };

    PullRefresh.prototype.onTouchMove = function (event) {
        var _this = this,
            _touches = event.originalEvent.touches[0];

        if (_this.touches.loading) {
            event.preventDefault();
            return;
        }

        if (_this.touches.startClientY > _touches.clientY || _this.$element.offset().top < _this.offsetTop || _this.touches.loading) {
            return;
        }

        _this.touches.isDraging = true;

        var deltaSlide = _touches.clientY - _this.touches.startClientY;

        _this.$dragTip.find('span').css('opacity', deltaSlide / 100);

        if (deltaSlide >= _this.options.distance) {
            deltaSlide = _this.options.distance;
        }

        _this.$dragTip.find('span').css('transform', 'rotate(' + deltaSlide / 0.25 + 'deg)');

        _this.touches.moveOffset = deltaSlide;

        _this.moveDragTip(deltaSlide);
    };

    PullRefresh.prototype.onTouchEnd = function (event) {

        var _this = this,
            touches = _this.touches;

        if (touches.loading) {
            event.preventDefault();
            return;
        }

        if (_this.$element.offset().top < _this.offsetTop) {
            return;
        }

        _this.$dragTip.addClass('pullrefresh-animation-timing');

        if (touches.moveOffset >= _this.options.distance) {
            _this.moveDragTip(_this.options.distance / 1.5);
            _this.$dragTip.find('span').addClass('pullrefresh-loading');
            _this.triggerLoad();
            return;
        }

        _this.touches.isDraging = false;

        _this.resetDragTip();

        _this.resetLoading();
    };

    PullRefresh.prototype.triggerLoad = function () {
        var _this = this,
            touches = _this.touches;

        touches.loading = true;

        typeof _this.options.loadListFn == 'function' && _this.options.loadListFn().done(function () {
            setTimeout(function () {
                _this.$dragTip.css({'transform': 'translate3d(0px, ' + (_this.options.distance / 1.5) + 'px, 0px) scale(0)'});
                _this.resetDragTip();
            }, 200);
        });
    };

    PullRefresh.prototype.resetLoading = function () {
        var _this = this;
        _this.moveDragTip(0);

        _this.$dragTip.find('span').removeClass('pullrefresh-loading').css({'opacity': 0.5, 'transform': 'rotate(0deg)'});
    };

    PullRefresh.prototype.resetDragTip = function () {
        var _this = this,
            touches = _this.touches;

        setTimeout(function () {
            touches.isDraging = false;
            touches.loading = false;
            touches.moveOffset = 0;
            _this.moveDragTip(0);
            _this.resetLoading();
            _this.$dragTip.removeClass('pullrefresh-animation-timing');
        }, 150);
    };

    PullRefresh.prototype.moveDragTip = function (y) {
        this.$dragTip.css({'transform': 'translate3d(0,' + y + 'px,0) scale(1)'});
    };

    PullRefresh.prototype.initTip = function () {
        var _this = this,
            ls = window.localStorage;

        if (ls.getItem('LIST-PULLREFRESH-TIP') == 'YDUI')return;

        _this.$tip = $('<div class="pullrefresh-draghelp"><div><span>涓嬫媺鏇存柊</span></div></div>');

        _this.$tip.on('click.ydui.pullrefresh', function () {
            $(this).remove();
        });

        _this.$element.after(_this.$tip);
        ls.setItem('LIST-PULLREFRESH-TIP', 'YDUI');

        setTimeout(function () {
            _this.$tip.remove();
        }, 5000);
    };

    function Plugin(option) {
        return this.each(function () {
            var self = this;
            new PullRefresh(self, option);
        });
    }

    $.fn.pullRefresh = Plugin;

}(window);

/**
 * ScrollTab Plugin
 */
!function (window) {
    "use strict";

    function ScrollTab (element, options) {
        this.$element = $(element);
        this.options = $.extend({}, ScrollTab.DEFAULTS, options || {});
        this.init();
    }

    ScrollTab.DEFAULTS = {
        navItem: '.aui-scroll-item',
        content: '.aui-scroll-content',
        contentItem: '.aui-scroll-content-item',
        initIndex: 0
    };

    ScrollTab.prototype.init = function () {
        var _this = this,
            $element = _this.$element,
            options = _this.options;

        _this.$navItem = $element.find(options.navItem);
        _this.$content = $element.find(options.content);
        _this.$contentItem = $element.find(options.contentItem);

        _this.scrolling = false;
        _this.contentOffsetTop = _this.$content.offset().top;

        _this.bindEvent();

        _this.movePosition(_this.options.initIndex, false);
    };

    ScrollTab.prototype.bindEvent = function () {
        var _this = this;

        _this.$content.on('resize.ydui.scrolltab scroll.ydui.scrolltab', function () {
            _this.checkInView();
        });

        _this.$navItem.on('click.ydui.scrolltab', function () {
            _this.movePosition($(this).index(), true);
        });
    };

    ScrollTab.prototype.movePosition = function (index, animate) {
        var _this = this;

        if (_this.scrolling)return;
        _this.scrolling = true;

        _this.$navItem.removeClass('aui-crt');
        _this.$navItem.eq(index).addClass('aui-crt');

        var $item = _this.$contentItem.eq(index);
        if (!$item[0])return;

        var offset = $item.offset().top;

        var top = offset + _this.$content.scrollTop() - _this.contentOffsetTop + 1;

        _this.$content.stop().animate({scrollTop: top}, animate ? 200 : 0, function () {
            _this.scrolling = false;
        });
    };

    ScrollTab.prototype.checkInView = function () {
        var _this = this;

        if (_this.scrolling)return;

        if (_this.isScrollTop()) {
            _this.setClass(0);
            return;
        }

        if (_this.isScrollBottom()) {
            _this.setClass(_this.$navItem.length - 1);
            return;
        }

        _this.$contentItem.each(function () {
            var $this = $(this);

            if ($this.offset().top <= _this.contentOffsetTop) {
                _this.setClass($this.index());
            }
        });
    };

    ScrollTab.prototype.setClass = function (index) {
        this.$navItem.removeClass('crt').eq(index).addClass('crt');
    };

    ScrollTab.prototype.isScrollTop = function () {
        return this.$content.scrollTop() == 0;
    };

    ScrollTab.prototype.isScrollBottom = function () {
        var _this = this;

        return _this.$content.scrollTop() + 3 >= _this.$contentItem.height() * _this.$contentItem.length - _this.$content.height();
    };

    function Plugin (option) {
        var args = Array.prototype.slice.call(arguments, 1);

        return this.each(function () {
            var target = this,
                $this = $(target),
                scrollTab = $this.data('ydui.scrolltab');

            if (!scrollTab) {
                $this.data('ydui.scrolltab', (scrollTab = new ScrollTab(target, option)));
            }

            if (typeof option == 'string') {
                scrollTab[option] && scrollTab[option].apply(scrollTab, args);
            }
        });
    }

    $(window).on('load.ydui.scrolltab', function () {
        $('[data-ydui-scrolltab]').each(function () {
            var $this = $(this);
            $this.scrollTab(window.YDUI.util.parseOptions($this.data('ydui-scrolltab')));
        });
    });

    $.fn.scrollTab = Plugin;

}(window);

/**
 * SendCode Plugin
 */
!function () {
    "use strict";

    function SendCode (element, options) {
        this.$btn = $(element);
        this.options = $.extend({}, SendCode.DEFAULTS, options || {});
    }

    SendCode.DEFAULTS = {
        run: false,  
        secs: 60,  
        disClass: '',  
        runStr: '{%s}绉掑悗閲嶆柊鑾峰彇',  
        resetStr: '閲嶆柊鑾峰彇楠岃瘉鐮�'  
    };

    SendCode.timer = null;

    SendCode.prototype.start = function () {
        var _this = this,
            options = _this.options,
            secs = options.secs;

        _this.$btn.html(_this.getStr(secs)).css('pointer-events', 'none').addClass(options.disClass);

        _this.timer = setInterval(function () {
            secs--;
            _this.$btn.html(_this.getStr(secs));
            if (secs <= 0) {
                _this.resetBtn();
                clearInterval(_this.timer);
            }
        }, 1000);
    };

    SendCode.prototype.getStr = function (secs) {
        return this.options.runStr.replace(/\{([^{]*?)%s(.*?)\}/g, secs);
    };

    SendCode.prototype.resetBtn = function () {
        var _this = this,
            options = _this.options;

        _this.$btn.html(options.resetStr).css('pointer-events', 'auto').removeClass(options.disClass);
    };

    function Plugin (option) {
        var args = Array.prototype.slice.call(arguments, 1);

        return this.each(function () {
            var $this = $(this),
                sendcode = $this.data('ydui.sendcode');

            if (!sendcode) {
                $this.data('ydui.sendcode', (sendcode = new SendCode(this, option)));
                if (typeof option == 'object' && option.run) {
                    sendcode.start();
                }
            }
            if (typeof option == 'string') {
                sendcode[option] && sendcode[option].apply(sendcode, args);
            }
        });
    }

    $.fn.sendCode = Plugin;
}();
!function (window) {
    "use strict";

    function Slider (element, options) {
        this.$element = $(element);
        this.options = $.extend({}, Slider.DEFAULTS, options || {});
        this.init();
    }

    Slider.DEFAULTS = {
        speed: 400, 
        autoplay: 4000,  
        lazyLoad: false,  
        pagination: '.aui-banner-pagination',
        wrapperClass: 'aui-banner-wrapper',
        slideClass: 'aui-banner-wrapper-item',
        bulletClass: 'slider-pagination-item',
        bulletActiveClass: 'slider-pagination-item-active'
    };

    Slider.prototype.init = function () {
        var _this = this,
            options = _this.options,
            $element = _this.$element;

        _this.index = 1;
        _this.autoPlayTimer = null;
        _this.$pagination = $element.find(options.pagination);
        _this.$wrapper = $element.find('.' + options.wrapperClass);
        _this.itemNums = _this.$wrapper.find('.' + options.slideClass).length;

        options.lazyLoad && _this.loadImage(0);

        _this.createBullet();

        _this.cloneItem().bindEvent();
    };

    Slider.prototype.bindEvent = function () {
        var _this = this,
            touchEvents = _this.touchEvents();

        _this.$wrapper.find('.' + _this.options.slideClass)
            .on(touchEvents.start, function (e) {
                _this.onTouchStart(e);
            }).on(touchEvents.move, function (e) {
            _this.onTouchMove(e);
        }).on(touchEvents.end, function (e) {
            _this.onTouchEnd(e);
        });

        $(window).on('resize.ydui.slider', function () {
            _this.setSlidesSize();
        });

        ~~_this.options.autoplay > 0 && _this.autoPlay();

        _this.$wrapper.on('click.ydui.slider', function (e) {
            if (!_this.touches.allowClick) {
                e.preventDefault();
            }
        });
    };

    Slider.prototype.cloneItem = function () {
        var _this = this,
            $wrapper = _this.$wrapper,
            $sliderItem = _this.$wrapper.find('.' + _this.options.slideClass),
            $firstChild = $sliderItem.filter(':first-child').clone(),
            $lastChild = $sliderItem.filter(':last-child').clone();

        $wrapper.prepend($lastChild);
        $wrapper.append($firstChild);

        _this.setSlidesSize();

        return _this;
    };

    Slider.prototype.createBullet = function () {

        var _this = this;

        if (!_this.$pagination[0])return;

        var initActive = '<span class="' + (_this.options.bulletClass + ' ' + _this.options.bulletActiveClass) + '"></span>';

        _this.$pagination.append(initActive + new Array(_this.itemNums).join('<span class="' + _this.options.bulletClass + '"></span>'));
    };

    Slider.prototype.activeBullet = function () {
        var _this = this;

        if (!_this.$pagination[0])return;

        var itemNums = _this.itemNums,
            index = _this.index % itemNums >= itemNums ? 0 : _this.index % itemNums - 1,
            bulletActiveClass = _this.options.bulletActiveClass;

        !!_this.$pagination[0] && _this.$pagination.find('.' + _this.options.bulletClass)
            .removeClass(bulletActiveClass)
            .eq(index).addClass(bulletActiveClass);
    };

    Slider.prototype.setSlidesSize = function () {
        var _this = this,
            _width = _this.$wrapper.width();

        _this.$wrapper.css('transform', 'translate3d(-' + _width + 'px,0,0)');
        _this.$wrapper.find('.' + _this.options.slideClass).css({width: _width});
    };

    Slider.prototype.autoPlay = function () {
        var _this = this;

        _this.autoPlayTimer = setInterval(function () {

            if (_this.index > _this.itemNums) {
                _this.index = 1;
                _this.setTranslate(0, -_this.$wrapper.width());
            }

            _this.setTranslate(_this.options.speed, -(++_this.index * _this.$wrapper.width()));

        }, _this.options.autoplay);
    };

    Slider.prototype.stopAutoplay = function () {
        var _this = this;
        clearInterval(_this.autoPlayTimer);
        return _this;
    };

    Slider.prototype.loadImage = function (index) {
        var _this = this,
            $img = _this.$wrapper.find('.' + _this.options.slideClass).eq(index).find('img'),
            imgsrc = $img.data('src');

        $img.data('load') != 1 && !!imgsrc && $img.attr('src', imgsrc).data('load', 1);
    };

    Slider.prototype.setTranslate = function (speed, x) {
        var _this = this;

        _this.options.lazyLoad && _this.loadImage(_this.index);

        _this.activeBullet();

        _this.$wrapper.css({
            'transitionDuration': speed + 'ms',
            'transform': 'translate3d(' + x + 'px,0,0)'
        });
    };

  
    Slider.prototype.touches = {
        moveTag: 0, 
        startClientX: 0, 
        moveOffset: 0, 
        touchStartTime: 0, 
        isTouchEvent: false, 
        allowClick: false 
    };

    Slider.prototype.onTouchStart = function (event) {
        if (event.originalEvent.touches)
            event = event.originalEvent.touches[0];

        var _this = this,
            touches = _this.touches;

        touches.allowClick = true;

        touches.isTouchEvent = event.type === 'touchstart';

        if (!touches.isTouchEvent && 'which' in event && event.which === 3) return;

        if (touches.moveTag == 0) {
            touches.moveTag = 1;

            touches.startClientX = event.clientX;
            touches.touchStartTime = Date.now();

            var itemNums = _this.itemNums;

            if (_this.index == 0) {
                _this.index = itemNums;
                _this.setTranslate(0, -itemNums * _this.$wrapper.width());
                return;
            }

            if (_this.index > itemNums) {
                _this.index = 1;
                _this.setTranslate(0, -_this.$wrapper.width());
            }
        }
    };

    Slider.prototype.onTouchMove = function (event) {
        event.preventDefault();

        if (event.originalEvent.touches)
            event = event.originalEvent.touches[0];

        var _this = this,
            touches = _this.touches;

        touches.allowClick = false;

        if (touches.isTouchEvent && event.type === 'mousemove') return;

        var deltaSlide = touches.moveOffset = event.clientX - touches.startClientX;

        if (deltaSlide != 0 && touches.moveTag != 0) {

            if (touches.moveTag == 1) {
                _this.stopAutoplay();
                touches.moveTag = 2;
            }
            if (touches.moveTag == 2) {
                _this.setTranslate(0, -_this.index * _this.$wrapper.width() + deltaSlide);
            }
        }
    };

    Slider.prototype.onTouchEnd = function () {
        var _this = this,
            speed = _this.options.speed,
            _width = _this.$wrapper.width(),
            touches = _this.touches,
            moveOffset = touches.moveOffset;

        setTimeout(function () {
            touches.allowClick = true;
        }, 0);

        if (touches.moveTag == 1) {
            touches.moveTag = 0;
        }

        if (touches.moveTag == 2) {
            touches.moveTag = 0;

            var timeDiff = Date.now() - touches.touchStartTime;

            if (timeDiff > 300 && Math.abs(moveOffset) <= _this.$wrapper.width() * .5) {
                _this.setTranslate(speed, -_this.index * _this.$wrapper.width());
            } else {
                _this.setTranslate(speed, -((moveOffset > 0 ? --_this.index : ++_this.index) * _width));
            }
            _this.autoPlay();
        }
    };


    Slider.prototype.touchEvents = function () {
        var supportTouch = (window.Modernizr && !!window.Modernizr.touch) || (function () {
                return !!(('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch);
            })();

        return {
            start: supportTouch ? 'touchstart.ydui.slider' : 'mousedown.ydui.slider',
            move: supportTouch ? 'touchmove.ydui.slider' : 'mousemove.ydui.slider',
            end: supportTouch ? 'touchend.ydui.slider' : 'mouseup.ydui.slider'
        };
    };

    function Plugin (option) {
        return this.each(function () {

            var $this = $(this),
                slider = $this.data('ydui.slider');

            if (!slider) {
                $this.data('ydui.slider', new Slider(this, option));
            }
        });
    }

    $(window).on('load.ydui.slider', function () {
        $('[data-aui-slider]').each(function () {
            var $this = $(this);
            $this.slider(window.YDUI.util.parseOptions($this.data('ydui-slider')));
        });
    });

    $.fn.slider = Plugin;

}(window);

/**
 * Spinner Plugin
 */
!function (window) {
    "use strict";

    function Spinner(element, options) {
        this.$element = $(element);
        this.options = $.extend({}, Spinner.DEFAULTS, options || {});
        this.init();
    }

    Spinner.DEFAULTS = {
        input: '.J_Input',
        add: '.J_Add',
        minus: '.J_Del',
        unit: 1,
        max: 0,
        min: -1,
        longpress: true,
        callback: null
    };

    Spinner.prototype.init = function () {
        var _this = this,
            options = _this.options;

        _this.$input = $(options.input, _this.$element);
        _this.$add = $(options.add, _this.$element);
        _this.$minus = $(options.minus, _this.$element);

        _this.changeParameters();

        _this.checkParameters();

        _this.bindEvent();
    };

    Spinner.prototype.tapParams = {};

    Spinner.prototype.isNumber = function (val) {
        //return /^([0]|[1-9]\d*)(\.\d{1,2})?$/.test(val);
        return /^\d*$/.test(val);
    };

    Spinner.prototype.FixNumber = function (val) {
        //return parseFloat(val);
        return parseInt(val);
    };

    Spinner.prototype.changeParameters = function () {

        var _this = this,
            options = _this.options;

        var params = [
            {param: 'unit', default: 1},
            {param: 'max', default: 0}
        ];

        $.each(params, function (k, v) {
            var _val = options[v.param],
                _dataVal = _this.$input.data(v.param);

            if (!!_dataVal) {
                _val = _dataVal;
                if (!_this.isNumber(_dataVal)) {
                    _val = options[v.param];
                    if (typeof _val == 'function') {
                        _val = _val();
                    }
                }
            } else {
                if (typeof options[v.param] == 'function') {
                    var _fnVal = options[v.param]();

                    _val = _fnVal;
                    if (!_this.isNumber(_fnVal)) {
                        _val = options[v.param];
                    }
                }
            }

            if (!_this.isNumber(_val)) {
                _val = v.default;
            }

            options[v.param] = _this.FixNumber(_val);
        });
    };

    Spinner.prototype.checkParameters = function () {
        var _this = this,
            options = _this.options,
            value = _this.$input.val();

        if (value) {
            _this.setValue(value);
        } else {
            if (options.max < options.min && options.max != 0) {
                options.max = options.min;
            }

            if (options.min < options.unit && options.min > 0) {
                options.min = options.unit;
            }
            if (options.min % options.unit != 0 && options.min > 0) {
                options.min = options.min - options.min % options.unit;
            }

            if (options.max < options.unit && options.max != 0) {
                options.max = options.unit;
            }
            if (options.max % options.unit != 0) {
                options.max = options.max - options.max % options.unit;
            }
            if (options.min < 0) {
                options.min = options.unit;
            }
            _this.setValue(options.min);
        }
    };

    Spinner.prototype.calculation = function (type) {
        var _this = this,
            options = _this.options,
            max = options.max,
            unit = options.unit,
            min = options.min,
            $input = _this.$input,
            val = _this.FixNumber($input.val());

        if (!!$input.attr('readonly') || !!$input.attr('disabled'))return;

        var newval;
        if (type == 'add') {
            newval = val + unit;
            if (max != 0 && newval > max)return;
        } else {
            newval = val - unit;
            if (newval < min)return;
        }

        _this.setValue(newval);

        options.longpress && _this.longpressHandler(type);
    };

    Spinner.prototype.longpressHandler = function (type) {
        var _this = this;

        var currentDate = new Date().getTime() / 1000,
            intervalTime = currentDate - _this.tapStartTime;

        if (intervalTime < 1) intervalTime = 0.5;

        var secondCount = intervalTime * 10;
        if (intervalTime == 30) secondCount = 50;
        if (intervalTime >= 40) secondCount = 100;

        _this.tapParams.timer = setTimeout(function () {
            _this.calculation(type);
        }, 1000 / secondCount);
    };

    Spinner.prototype.setValue = function (val) {
        var _this = this,
            options = _this.options,
            max = options.max,
            unit = options.unit,
            min = options.min < 0 ? unit : options.min;

        if (!/^(([1-9]\d*)|0)$/.test(val)) val = max;

        if (val > max && max != 0) val = max;

        if (val % unit > 0) {
            val = val - val % unit + unit;
            if (val > max && max != 0) val -= unit;
        }

        if (val < min) val = min - min % unit;

        _this.$input.val(val);

        typeof options.callback == 'function' && options.callback(val, _this.$input);
    };

    Spinner.prototype.bindEvent = function () {
        var _this = this,
            options = _this.options,
            isMobile = YDUI.device.isMobile,
            mousedownEvent = 'mousedown.ydui.spinner',
            mouseupEvent = 'mouseup.ydui.spinner';

        if (isMobile) {
            mousedownEvent = 'touchstart.ydui.spinner';
            mouseupEvent = 'touchend.ydui.spinner';
        }

        _this.$add.on(mousedownEvent, function (e) {
            if (options.longpress) {
                e.preventDefault();
                e.stopPropagation();
                _this.tapStartTime = new Date().getTime() / 1000;

                _this.$add.on(mouseupEvent, function () {
                    _this.clearTapTimer();
                });
            }

            _this.calculation('add');
        });

        _this.$minus.on(mousedownEvent, function (e) {
            if (options.longpress) {
                e.preventDefault();
                e.stopPropagation();

                _this.tapStartTime = new Date().getTime() / 1000;

                _this.$minus.on(mouseupEvent, function () {
                    _this.clearTapTimer();
                });
            }

            _this.calculation('minus');
        });

        _this.$input.on('change.ydui.spinner', function () {
            _this.setValue($(this).val());
        }).on('keydown', function (event) {
            if (event.keyCode == 13) {
                _this.setValue($(this).val());
                return false;
            }
        });
    };

    Spinner.prototype.clearTapTimer = function () {
        var _this = this;
        clearTimeout(_this.tapParams.timer);
    };

    function Plugin(option) {
        var args = Array.prototype.slice.call(arguments, 1);

        return this.each(function () {
            var $this = $(this),
                spinner = $this.data('ydui.spinner');

            if (!spinner) {
                $this.data('ydui.spinner', (spinner = new Spinner(this, option)));
            }

            if (typeof option == 'string') {
                spinner[option] && spinner[option].apply(spinner, args);
            }
        });
    }

    $(window).on('load.ydui.spinner', function () {
        $('[data-ydui-spinner]').each(function () {
            var $this = $(this);
            $this.spinner(window.YDUI.util.parseOptions($this.data('ydui-spinner')));
        });
    });

    $.fn.spinner = Plugin;
}(window);


!function (window) {
    "use strict";

    function Tab (element, options) {
        this.$element = $(element);
        this.options = $.extend({}, Tab.DEFAULTS, options || {});
        this.init();
        this.bindEvent();
        this.transitioning = false;
    }

    Tab.TRANSITION_DURATION = 150;

    Tab.DEFAULTS = {
        nav: '.tab-nav-item',
        panel: '.tab-panel-item',
        activeClass: 'tab-active'
    };

    Tab.prototype.init = function () {
        var _this = this,
            $element = _this.$element;

        _this.$nav = $element.find(_this.options.nav);
        _this.$panel = $element.find(_this.options.panel);
    };


    Tab.prototype.bindEvent = function () {
        var _this = this;
        _this.$nav.each(function (e) {
            $(this).on('click.ydui.tab', function () {
                _this.open(e);
            });
        });
    };


    Tab.prototype.open = function (index) {
        var _this = this;

        index = typeof index == 'number' ? index : _this.$nav.filter(index).index();

        var $curNav = _this.$nav.eq(index);

        if (_this.transitioning || $curNav.hasClass(_this.options.activeClass))return;

        _this.transitioning = true;

        $curNav.trigger($.Event('open.ydui.tab', {
            index: index
        }));

        _this.active($curNav, _this.$nav);

        _this.active(_this.$panel.eq(index), _this.$panel, function () {
            $curNav.trigger({
                type: 'opened.ydui.tab',
                index: index
            });
            _this.transitioning = false;
        });
    };


    Tab.prototype.active = function ($element, $container, callback) {
        var _this = this,
            activeClass = _this.options.activeClass;

        var $avtive = $container.filter('.' + activeClass);

        function next () {
            typeof callback == 'function' && callback();
        }

        $element.one('webkitTransitionEnd', next).emulateTransitionEnd(Tab.TRANSITION_DURATION);

        $avtive.removeClass(activeClass);
        $element.addClass(activeClass);
    };

    function Plugin (option) {
        var args = Array.prototype.slice.call(arguments, 1);

        return this.each(function () {
            var target = this,
                $this = $(target),
                tab = $this.data('ydui.tab');

            if (!tab) {
                $this.data('ydui.tab', (tab = new Tab(target, option)));
            }

            if (typeof option == 'string') {
                tab[option] && tab[option].apply(tab, args);
            }
        });
    }

    $(window).on('load.ydui.tab', function () {
        $('[data-ydui-tab]').each(function () {
            var $this = $(this);
            $this.tab(window.YDUI.util.parseOptions($this.data('ydui-tab')));
        });
    });

    $.fn.tab = Plugin;

}(window);


!function (window) {
    "use strict";

    var util = window.YDUI.util = window.YDUI.util || {},
        doc = window.document;


    util.timestampTotime = function (format, time) {
        var t = {},
            floor = Math.floor;

        t.f = time % 1000;
        time = floor(time / 1000);
        t.s = time % 60;
        time = floor(time / 60);
        t.m = time % 60;
        time = floor(time / 60);
        t.h = time % 24;
        t.d = floor(time / 24);

        var ment = function (a) {
            if (a <= 0) {
                return '';
            }
            return '$1' + (a < 10 ? '0' + a : a) + '$2';
        };

        format = format.replace(/\{([^{]*?)%d(.*?)\}/g, ment(t.d));
        format = format.replace(/\{([^{]*?)%h(.*?)\}/g, ment(t.h));
        format = format.replace(/\{([^{]*?)%m(.*?)\}/g, ment(t.m));
        format = format.replace(/\{([^{]*?)%s(.*?)\}/g, ment(t.s));
        format = format.replace(/\{([^{]*?)%f(.*?)\}/g, ment(t.f));

        return format;
    };


    util.countdown = function (format, time, speed, callback) {
        var that = this;
        var timer = setInterval(function () {
            var l_time = time - new Date().getTime();
            if (l_time > 0) {
                callback(that.timestampTotime(format, l_time));
            } else {
                clearInterval(timer);
                typeof callback == 'function' && callback('');
            }
        }, speed);
    };


    util.calc = function (arg1, op, arg2) {
        var ra = 1, rb = 1, m;

        try {
            ra = arg1.toString().split('.')[1].length;
        } catch (e) {
        }
        try {
            rb = arg2.toString().split('.')[1].length;
        } catch (e) {
        }
        m = Math.pow(10, Math.max(ra, rb));

        switch (op) {
            case '+':
            case '-':
                arg1 = Math.round(arg1 * m);
                arg2 = Math.round(arg2 * m);
                break;
            case '*':
                ra = Math.pow(10, ra);
                rb = Math.pow(10, rb);
                m = ra * rb;
                arg1 = Math.round(arg1 * ra);
                arg2 = Math.round(arg2 * rb);
                break;
            case '/':
                arg1 = Math.round(arg1 * m);
                arg2 = Math.round(arg2 * m);
                m = 1;
                break;
        }
        try {
            var result = eval('(' + '(' + arg1 + ')' + op + '(' + arg2 + ')' + ')/' + m);
        } catch (e) {
        }
        return result;
    };


    util.getImgBase64 = function (obj, callback) {
        var that = this, dataimg = '', file = obj.files[0];
        if (!file)return;
        if (!/image\/\w+/.test(file.type)) {
            that.tipMes('璇蜂笂浼犲浘鐗囨枃浠�', 'error');
            return;
        }
        var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function () {
            dataimg = this.result;
            typeof callback === 'function' && callback(dataimg);
        };
    };


    util.getQueryString = function (name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"),
            r = window.location.search.substr(1).match(reg),
            qs = '';
        if (r != null)qs = decodeURIComponent(r[2]);
        return qs;
    };


    util.cookie = function () {
        return {

            get: function (name) {
                var m = doc.cookie.match('(?:^|;)\\s*' + name + '=([^;]*)');
                return (m && m[1]) ? decodeURIComponent(m[1]) : '';
            },

            set: function (name, val, expires, domain, path, secure) {
                var text = String(encodeURIComponent(val)),
                    date = expires;

                if (typeof date === 'number') {
                    date = new Date();
                    date.setTime(date.getTime() + expires * 1000);
                }

                date instanceof Date && (text += '; expires=' + date.toUTCString());

                !!domain && (text += '; domain=' + domain);

                text += '; path=' + (path || '/');

                secure && (text += '; secure');

                doc.cookie = name + '=' + text;
            }
        }
    }();

}(window);