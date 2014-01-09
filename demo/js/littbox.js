/**
 * Created by Listerical on 08-01-14.
 * Version 0.1
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
    Littbox = (function() {
        function Littbox(options) {
            this.options = options;
            this.init();
        }
        Littbox.prototype.init = function() {
            this.enable();

        };
        Littbox.prototype.start = function($clickedLink) {
            $clickedImage = $($clickedLink.find('img'));
            var self = this;
            //Thumb bewaren
            this.littThumb = $clickedImage.attr('src');
            //Wrapper link van de img
            this.$littLink = $clickedLink

            this.$littbox = $('<div id="littbox" class="littbox"></div>');
            //Littbox afmetingen eerst klaar zetten op thumb afmeting
            this.$littbox.width($clickedImage.width());
            this.$littbox.height($clickedImage.height());
            this.$littClickedImage = $clickedImage;
            this.options.LittOriginalWidth = this.$littbox.width();
            this.options.LittOriginalHeight = this.$littbox.height();
            this.$littLink.append(this.$littbox);

            //Zorgen dat de wrapper positioned is
            if(this.$littLink.css('position')=='static')this.$littLink.css({'position':'relative','display':'block'});


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
            this.$littLargeImage = $('<img src="'+littLargeImage.src+'"/>');
            //Breedte aanpassen aan thumbnail
            this.$littLargeImage.width(this.$littClickedImage.width());
            //Alvast tonen om hoogte te kunnen bepalen
            this.$littbox.html(this.$littLargeImage);
            this.$littLargeImage.width(this.options.LittTargetWidth+'px');

            //Huidige afmetingen
            //ToDo needs a better solution
            this.$clone = this.$littLargeImage.clone();
            $('body').append(this.$clone);
            this.$clone.css({'display':'block','visibility':'visible'});

            this.$clone.on('load',function(){
                self.$littLargeImage.width(self.options.LittOriginalWidth+'px');

                self.imageLoadedContinued();

            });

        };
        Littbox.prototype.imageLoadedContinued = function(){
            var self = this;

            var currentHeight = this.$clone.height();
            var currentWidth = this.$littLargeImage.width();
            this.$clone.remove();
            //Toekomstige afmetingen
            var heightOfLargeImage = currentHeight;
            //afstand van links
            var marginLeft = Math.ceil(($(window).width()-this.options.LittTargetWidth)/2);
            this.options.LittOffset = this.$littbox.offset();
            marginLeft = marginLeft - this.$littbox.offset().left;
            //afstand van boven
            var tmpMarginTop = Math.ceil(($(window).height()-heightOfLargeImage)/2);
            tmpMarginTop = tmpMarginTop - this.$littbox.offset().top+$(window).scrollTop();

            if((tmpMarginTop+heightOfLargeImage)<$(window).height()){
                var marginTop = tmpMarginTop;
            }else{
                var marginTop = 0;
            }

            // Animeer naar de juiste positie
            this.$littbox.animate({'left':marginLeft+'px','top':marginTop+'px'});
            // Fullscreen overlay toevoegen
            this.$fsoverlay = $('<div class="littbox-fsoverlay"><a rel="littbox-close" class="littbox-close" href="#"></a></div>');
            this.$fsoverlay.css({'top':$(window).scrollTop()})
            this.$fsoverlay.on('click', function() {
                self.closeLitt();
                return false;
            });
            $('body').height($(window).height());
            $('body').prepend(this.$fsoverlay);

            // Afbeelding vergroten
            this.$littLargeImage.animate({'width':self.options.LittTargetWidth+'px'});

            if(self.options.LittDetail)self.loadLittDetail(this.$littClickedImage);

        };
        Littbox.prototype.loadLittDetail = function(){
            var product_titel = this.$littClickedImage.parent().parent().find('.littbox-title');
            var product_omschrijving = this.$littClickedImage.parent().parent().find('.littbox-subtitle');
            this.$littDetail = $('<div class="littbox-detail"><h2>'+product_titel.html()+'</h2><p>'+product_omschrijving.html()+'</p></div>');

            this.$fsoverlay.append(this.$littDetail);
        };

        Littbox.prototype.closeLitt = function(){
            var self = this;
            //Afbeelding terug naar formaat thumb
            if(self.options.LittDetail)this.$littDetail.fadeOut();
            self.$fsoverlay.find('.littbox-close').fadeOut();
            self.$littLargeImage.animate({'width':self.options.LittOriginalWidth+'px'},function(){
                //Afbeelding uitfaden en vervangen door thumb en terug in faden
                self.$littLargeImage.fadeOut(function(){
                        self.$littLargeImage.attr('src',self.$littClickedImage.attr('src'));
                        self.$littLargeImage.fadeIn(function(){
                            //Overlay verwijderen

                            self.$fsoverlay.fadeOut(function(){
                                self.$fsoverlay.remove();
                                self.$littbox.remove();
                            });
                        });
                    }
                );

            });
            self.$littbox.animate({'left':'0px','top':'0px'});
        };

        Littbox.prototype.enable = function() {
            var self = this;

            return $('body').on('click', 'a[rel^=littbox]', function(e) {
                self.start($(e.currentTarget));
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