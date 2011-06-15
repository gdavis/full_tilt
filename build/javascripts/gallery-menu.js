(function($) {
    $.GalleryMenu = function( $el, $gallery ) {
        var container = $el;
        var gallery = $gallery;
        var dispatcher = $gallery.container;
        var base = this;
        

        base.init = function() {
            // build dots for gallery items
            var num = $('li', dispatcher).length;

            // bail if we have 1 or fewer images
            if( num <= 1 ) return;
            
            for( var i=0; i<num; i++ ) {
                var dot = document.createElement('div');
                dot.className = "dot";
                container.appendChild(dot);

                $(dot).click([i], function( $event ) {
                    gallery.setIndex( $event.data[0] );
                });
            }

            // spoof change event to init on first dot
            base.handleGalleryChange('', 0);

            // wire up listener to respond to gallery
            $(dispatcher).bind($.LeftRightGallery.CHANGE, base.handleGalleryChange.context(this) )
        };

        base.handleGalleryChange = function( $event, $index ) {
            // reset classes on dots
            var dots = $('.dot', container);
            var num = dots.length;
            for( var i=0; i<num; i++ ) {
                if( i == $index ) {
                    dots.eq(i).addClass('active');
                }
                else dots.eq(i).removeClass('active');
            }
        };

        base.init();
    }
}(jQuery));