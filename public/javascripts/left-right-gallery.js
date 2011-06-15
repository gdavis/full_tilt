(function($) {
    $.LeftRightGallery = function( $el, $width, $height ) {

        var base = this;

        // public vars
        var container = base.container = $el;
        var width = base.width = $width || $(container).width();
        var height = base.height = $height || $(container).height();

        // private vars
        var imagesContainer = $('.gallery-images', container);
        var controlsContainer = $('.gallery-controls', container);
        var leftBtn = $('.left-btn', controlsContainer );
        var rightBtn = $('.right-btn', controlsContainer );
        var index;
        var total;
        var platformHelper;

        base.init = function() {

            index = 0;
            total = $('li', imagesContainer ).length;

            platformHelper = new PlatformHelper();
            platformHelper.init();

            // give the overall image container a new width to hold all the images
            imagesContainer.width( (total * width) + 'px' );

            // hide controls if we don't have enough to page through
            if( total <= 1 ) {
                controlsContainer.hide();
            }
            else {
               // give the controls a set size to correctly position the buttons. fixes IE's lack of support for 'inherit' CSS declarations.
               controlsContainer.height( height + 'px' );
            }
            
            // prevent dragging/selecting of buttons and images
            imagesContainer.get(0).onselectstart = function(){ return false; };
            imagesContainer.get(0).ondragstart = function(){ return false; };
            leftBtn.get(0).onselectstart = function(){ return false; };
            leftBtn.get(0).ondragstart = function(){ return false; };
            rightBtn.get(0).onselectstart = function(){ return false; };
            rightBtn.get(0).ondragstart = function(){ return false; };

            // hookup button clicks
            leftBtn.click( base.prev.context( base ) );
            rightBtn.click( base.next.context( base ) );

            // TODO: PNG fix for buttons
            leftBtn.pngFix();
            rightBtn.pngFix();

            // set buttons in initial state
            base.updateButtons();
        };

        base.prev = function( $e ) {
            if( $e ) $e.preventDefault();
            index = Math.max( 0, index-1 );
            base.move();
            base.updateButtons();
        };

        base.next = function( $e ) {
            if( $e ) $e.preventDefault();
            index = Math.min( total-1, index+1 );
            base.move();
            base.updateButtons();
        };

        base.move = function() {
            var xp = -( index * width );
            $(imagesContainer).animate({ left:xp });
            $(container).trigger( $.LeftRightGallery.CHANGE, new String(index));
        };

        base.setIndex = function( $index ) {
            index = Math.max( 0, Math.min( total, $index ));
            console.log('new index: ' + index );
            base.move();
            base.updateButtons();
        };

        base.updateButtons = function() {
            index == 0 ? leftBtn.addClass('disabled') : leftBtn.removeClass('disabled');
            index == total-1 ? rightBtn.addClass('disabled') : rightBtn.removeClass('disabled');
        };

        base.init();
    };

    $.LeftRightGallery.CHANGE = 'LeftRightGallery.Changed';
})(jQuery);