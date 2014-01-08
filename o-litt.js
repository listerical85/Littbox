var sttSettings,
    Stt = {
        settings: {
            debug: true,
            customLightWidth: 700,
            customLightOffset: 0,
            customLightOriginalWidth: 0,
            customLightOriginalHeight: 0,
            customLightImage: '',
            customLightOverlay: '',
            customLightThumb: '',
            customLightDetail: true
        },
        init: function(){
            var self = this;
            sttSettings = self.settings;
            self.loadSidebar();
            self.bindUIActions();
        },
        bindUIActions: function(){
            var self = this;
            self.setDefaultBootstrapDropdown();
            $('.dropdown-menu li a').click(function(event){
                event.preventDefault();
                self.handleBootstrapDropdown(event);
            });
            $('.chzn-select').chosen( {disable_search: true,width: '145px'} );
            $('a[rel=customlight]').click(function(event){
                event.preventDefault();
                if($('.fullscreenoverlay')[0])self.customLightClose();
                else self.customLight($(event.target));
            });
            $('body').on('click','.fullscreenoverlay',function(event){
                event.preventDefault();
                self.customLightClose();
            });
            $('body').on('click','a[rel=customlight-close]',function(event){
                event.preventDefault();
                self.customLightClose();
            });

        },
        loadSidebar: function(){
            var self = this;
            var currentheight = $('nav.sidenav').height();
            var treshold = 345;
            if(currentheight<treshold)$('nav.sidenav').css({'margin-bottom':treshold-currentheight+'px'});
        },
        customLightClose:function(){
            var self = this;
            //Afbeelding terug naar formaat thumb
            if(self.settings.customLightDetail)$('.customlight-detail').fadeOut();
            self.settings.customLightImage.animate({'width':self.settings.customLightOriginalWidth+'px'},function(){
                //Afbeelding uitfaden en vervangen door thumb en terug in faden
                self.settings.customLightImage.fadeOut(function(){
                    self.settings.customLightImage.attr('src',self.settings.customLightThumb);
                    self.settings.customLightImage.fadeIn(function(){
                        //Overlay verwijderen
                        $('.fullscreenoverlay').fadeOut(function(){
                            $('.fullscreenoverlay').remove();
                            $('.spinner').remove();
                        });
                    });
                   }
                );

            });
            self.settings.customLightOverlay.animate({'left':'0px','top':'0px'});

        },
        customLight: function($clickedImage){
            var self = this;
            //Voor close thumb bewaren
            self.settings.customLightThumb = $clickedImage.attr('src');
            //Wrapper van de image is de link
            $clickedLink = $($clickedImage.parent());

            //Overlay met spinner op de afbeelding plaatsen
            var $overlay = $('<div class="spinner"></div>');
            $overlay.width($clickedImage.width());
            $overlay.height($clickedImage.height());
            self.settings.customLightOriginalWidth = $clickedImage.width();
            self.settings.customLightOriginalHeight = $clickedImage.height();

            //Zorgen dat de link wel gepositioneerd is
            $clickedLink.css({'position':'relative','display':'block'});
            $clickedLink.append($overlay);

            //Afbeelding laden
            var heavyImage = new Image();
            heavyImage.src = $clickedLink.attr('href');
            heavyImage.onload= function(){
                //Spinner disablen
                $overlay.css({'background-image':'none','visibility':'visible'});
                $heavyImage = $('<img src="'+heavyImage.src+'"/>');
                //Breedte aanpassen aan thumbnail
                $heavyImage.width($clickedImage.width());
                // al laten zien om de hoogte te kunnen gebruiken
                $overlay.html($heavyImage);

                // huidige afmetingen
                var currentHeight = $heavyImage.height();
                var currentWidth = $heavyImage.width();

                // toekomstige afmetingen
                var divider = self.settings.customLightWidth/currentWidth;
                var heightOfLargeImage = currentHeight*divider;

                // afstand van links
                var marginLeft = Math.ceil(($(window).width()-self.settings.customLightWidth)/2);
                self.settings.customLightOffset = $overlay.offset();
                marginLeft = marginLeft - $overlay.offset().left;

                // afstand van boven
                var tmpMarginTop = Math.ceil(($(window).height()-heightOfLargeImage)/2);
                tmpMarginTop = tmpMarginTop - $overlay.offset().top+$(window).scrollTop();

                if((tmpMarginTop+heightOfLargeImage)<$(window).height()){
                    var marginTop = tmpMarginTop;
                }else{
                    var marginTop = 0;
                }

                // Animeer naar de juiste positie
                $overlay.animate({'left':marginLeft+'px','top':marginTop+'px'});
                self.settings.customLightOverlay = $overlay;

                // Fullscreen overlay toevoegen
                $fullscreenoverlay = $('<div class="fullscreenoverlay"><a rel="customlight-close" class="customlight-close" href="#"></a></div>');
                $fullscreenoverlay.css({'top':$(window).scrollTop()})
                $('body').height($(window).height());
                $('body').prepend($fullscreenoverlay);

                // Afbeelding vergroten
                $heavyImage.animate({'width':self.settings.customLightWidth+'px'});

                self.settings.customLightImage = $heavyImage;

                if(self.settings.customLightDetail)self.loadCustomLightDetail($clickedImage);

            }
        },
        loadCustomLightDetail: function($clickedImage){
            var product_titel = $clickedImage.parent().parent().find('h5');
            var product_omschrijving = $clickedImage.parent().parent().find('p');
            var $detail = $('<div class="customlight-detail"><h5>'+product_titel.html()+'</h5><p>'+product_omschrijving.html()+'</p></div>');
            $('.fullscreenoverlay').append($detail);
        },
        log: function(variabele){
            var self = this;
            if(self.settings.debug && typeof console == "object")console.log(variabele);
        },
        attachFileUploader: function(jsObject){
            var self = this;
            var uploader = new qq.FileUploader({
                element: $('.button-import')[0],
                action: BASE+'ajax/csvupload.php',
                buttonTxt: '<i class="glyphicon glyphicon-import"></i>&nbsp;Import',
                dropTxt: '',
                onLoad:function(){$('.qq-upload-list').hide()},
                onSubmit:function(){$('.qq-upload-list').hide()},
                onComplete:function(id,fileName,responseJSON){
                    if(responseJSON.success){
                        var file = new Object();
                        file.file_naam = responseJSON.filename;
                        jsObject.handleCsv(file);
                    }else{
                        Stt.log(responseJSON.error);
                    }
                },
                debug: true
            });
        },
        setDefaultBootstrapDropdown: function(){
            //Voor elke bootstrap dropdown
            $('.dropdown-toggle-main').each(function(){
                //Dropdownbutton
                var $dropdownButton = $(this);
                //Ophalen hidden field
                var $idHiddenField = $dropdownButton.data('target');
                var $hiddenfield = $('#'+$idHiddenField);
                if($hiddenfield.val()!=""){
                    var $selectedItem = $dropdownButton.parent().find('.dropdown-menu li a[data-value='+$hiddenfield.val()+']');
                    if(typeof $selectedItem.html()!='undefined'){
                        var $caret = $dropdownButton.find('span');
                        if($caret[0]){
                            //Dropdownbutton tekst setten
                            $dropdownButton.html($selectedItem.html()+'&nbsp;');
                            $dropdownButton.append($caret);
                        }else{
                            //Dropdownbutton tekst setten
                            $dropdownButton.html($selectedItem.html());
                        }


                        //Trigger change event
                        $hiddenfield.trigger('change');
                    }
                }

            });
        },
        handleBootstrapDropdown: function(event){
            //Geselecteerd item
            var $selectedItem = $(event.target);
            //Dropdownbutton
            var $dropdownButton = $selectedItem.parent().parent().parent().find('.dropdown-toggle-main');
            //Ophalen hidden field
            var idHiddenField = $dropdownButton.data('target');
            var $hiddenField = $('#'+idHiddenField);
            //Hiddenfield value setten
            $hiddenField.val($selectedItem.data('value'));
            //Tijdelijke caret opslaand
            var $caret = $dropdownButton.find('span');
            if($caret[0]){
                //Dropdownbutton tekst setten
                $dropdownButton.html($selectedItem.html()+'&nbsp;');
                $dropdownButton.append($caret);
            }else{
                //Dropdownbutton tekst setten
                $dropdownButton.html($selectedItem.html());
            }
            //Trigger change event
            $hiddenField.trigger('change');
        },
    }
$(document).ready(function(){Stt.init()});