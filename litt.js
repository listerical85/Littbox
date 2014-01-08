/**
 * Created by Listerical on 08-01-14.
 */
(function() {
    var $, Littbox, LittboxOptions;

    $ = jQuery;

    LittboxOptions = (function() {
        function LittboxOptions() {
            this.LittTargetWidth = 700;
            this.LittOffset = false;
            this.LittOriginalWidth = 0;
            this.LittOriginalHeight = 0;
            this.LittDetail = true;
        }
        return LittboxOptions;
    })();
    Littbox.prototype.start = function($clickedImage) {
        var self = this;
        //Thumb bewaren
        this.littThumb = $clickedImage.attr('src');
        //Wrapper link van de img
        this.$littLink = $($clickedImage.parent());

        //Littbox afmetingen eerst klaar zetten op thumb afmeting
        this.$littbox.width($clickedImage.width());
        this.$littbox.height($clickedImage.height());
        this.$littClickedImage = $clickedImage;
        this.options.LittOriginalWidth = this.$littbox.width;
        this.options.LittOriginalHeight = this.$littbox.height;


        //Zorgen dat de wrapper positioned is
        if(this.$littLink.css('position').length==0)this.$littLink.css({'position':'relative'});
        this.$littLink.append(this.$littbox);

        //Image preload
        self.preloadImage();
    };
    Littbox.prototype.preloadImage = function(){
        var self = this;
        var littLargeImage = new Image();
        littLargeImage.src = this.$littLink.attr('href');
        littLargeImage.onload = function(){
            self.imageLoaded(littLargeImage);
        }
    };
    Littbox.prototype.imageLoaded = function(littLargeImage){
        var self = this;
        //Disable spinner
        this.$littbox.css({'background':'none'});
        $littLargeImage = $('<img src="'+littLargeImage.src+'"/>');
        //Breedte aanpassen aan thumbnail
        $littLargeImage.width(this.$littClickedImage.width());
        //Alvast tonen om hoogte te kunnen bepalen
        this.$littbox.html($littLargeImage);
        //Huidige afmetingen
        var currentHeight = $littLargeImage.height();
        var currentWidth = $littLargeImage.width();
        //Toekomstige afmetingen
        var divider = this.options.LittOriginalWidth/currentWidth;
        var heightOfLargeImage = currentHeight*divider;
        //afstand van links
        var marginLeft = Math.ceil(($(window).width()-this.options.LittOriginalWidth)/2);
        this.settings.LittOffset = this.$littbox.offset();
        marginLeft = marginLeft - this.$littbox.offset().left;
        //afstand van boven
        var tmpMarginTop = Math.ceil(($(window).height()-heightOfLargeImage)/2);
        tmpMarginTop = tmpMarginTop - $overlay.offset().top+$(window).scrollTop();

        if((tmpMarginTop+heightOfLargeImage)<$(window).height()){
            var marginTop = tmpMarginTop;
        }else{
            var marginTop = 0;
        }
    };
    Littbox = (function() {
        function Littbox(options) {
            this.options = options;
            this.init();
        }

        Littbox.prototype.init = function() {
            this.enable();
            return this.build();
        };

        Littbox.prototype.enable = function() {
            var self = this;
            return $('body').on('click', 'a[rel^=littbox]', function(e) {
                self.start($(e.currentTarget));
                return false;
            });
        };
        Littbox.prototype.build = function() {
            var self = this;

            $('<div id="littbox" class="littbox"></div>');
            //1 $("<div id='lightboxOverlay' class='lightboxOverlay'></div><div id='lightbox' class='lightbox'><div class='lb-outerContainer'><div class='lb-container'><img class='lb-image' src='' /><div class='lb-nav'><a class='lb-prev' href='' ></a><a class='lb-next' href='' ></a></div><div class='lb-loader'><a class='lb-cancel'></a></div></div></div><div class='lb-dataContainer'><div class='lb-data'><div class='lb-details'><span class='lb-caption'></span><span class='lb-number'></span></div><div class='lb-closeContainer'><a class='lb-close'></a></div></div></div></div>").appendTo($('body'));

            this.$littbox = $('#littbox');
            this.$fsoverlay = $('#littboxFullscreenOverlay');


            this.$fsoverlay.hide().on('click', function() {
                self.closeLitt();
                return false;
            });

        };

        return Littbox;

    })();

    $(function() {
        var littbox, options;
        options = new LittboxOptions();
        return littbox = new Littbox(options);
    });

}).call(this);