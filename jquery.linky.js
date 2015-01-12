/**
 * jquery.linky.js v0.2.0
 * https://github.com/AnSavvides/jquery.linky
 * https://github.com/MarQuisKnox/jquery.linky
 * The MIT License (MIT)
 *
 * Copyright (c) 2013 - 2015 Andreas Savvides et al
 * Copyright (c) 2014 - 2015 MarQuis Knox
 */
(function($) {

    "use strict";

    $.fn.linky = function(options) {
        return this.each(function() {
            var $el = $(this),
                linkifiedContent = _linkify($el, options);

            $el.html(linkifiedContent);
        });
    };

    function _linkify($el, options) {
        var links = {
                local: {
                    baseUrl: BASEURL + "/",
                    hashtagSearchUrl: "search/",
                    target: '_self'
                },        		
                twitter: {
                    baseUrl: "https://twitter.com/",
                    hashtagSearchUrl: "search?q=",
                    target: '_blank'
                },
                instagram: {
                    baseUrl: "http://instagram.com/",
                    hashtagSearchUrl: null,
                    target: '_blank'
                },
                github: {
                    baseUrl: "https://github.com/",
                    hashtagSearchUrl: null,
                    target: '_blank'
                }
            },
            defaultOptions = {
                mentions: true,
                hashtags: false,
                urls: true,
                linkTo: 'local',
                target: '_blank'
            },
            extendedOptions = $.extend(defaultOptions, options),
            elContent = $el.html(),

            // @link	http://snipplr.com/view/68530/regular-expression-for-matching-urls-with-or-without-https
            urlRegEx = /(?:(?:http|https):\/\/)?([-a-zA-Z0-9.]{2,256}\.[a-z]{2,4})\b(?:\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi,
            matches;

            // Linkifying URLs
            if ( extendedOptions.urls ) {
                matches = elContent.match( urlRegEx );
                if ( matches ) {
                    elContent = _linkifyUrls( matches, $el, extendedOptions );
                }
            }

            // Linkifying mentions
            if (extendedOptions.mentions) {
                elContent = _linkifyMentions(elContent, links[extendedOptions.linkTo].baseUrl);
            }

            // Linkifying hashtags
            if (extendedOptions.hashtags) {
                elContent = _linkifyHashtags(elContent, links[extendedOptions.linkTo]);
            }

        return elContent;
    }
    
    function _isEmbed( url ) {
    	// check for Dailymotion embed
    	var isDailymotionEmbed	= url.match( /dailymotion\.com\/embed/ig );
    	isDailymotionEmbed		= ( isDailymotionEmbed !== null ) ? true : false;
    	
    	if( isDailymotionEmbed ) {
    		return true;
    	}
    	    	
    	// check for Vimeo embed
    	var isVimeoEmbed	= url.match( /player\.vimeo\.com\/video/ig );
    	isVimeoEmbed		= ( isVimeoEmbed !== null ) ? true : false;
    	
    	if( isVimeoEmbed ) {
    		return true;
    	}    	
    	
    	// check for YouTube embed
    	var isYouTubeEmbed      = url.match( /youtube\.com\/embed/ig );
    	var isYouTubeAltEmbed   = url.match( /youtube\-nocookie\.com\/embed/ig );
    	isYouTubeEmbed          = ( isYouTubeEmbed !== null || isYouTubeAltEmbed !== null ) ? true : false;
    	
    	if( isYouTubeEmbed ) {
    		return true;
    	}
    	
    	return false;
    }    

    // For any URLs present, unless they are already identified within
    // an 'a' element, linkify them.
    function _linkifyUrls(matches, $el, linkObj) {
        
    	var elContent = $el.html();
        $.each( matches, function( index, value ) {
            // Only linkify URLs that are not already identified as
            // 'a' elements with an 'href' or are not YouTube URLS
        	var isEmbed = _isEmbed( value );
        	       
            if ( !isEmbed && $el.find('a[href="' + this + '"]').length === 0 ) {
                elContent = elContent.replace(this, '<a class="linkified" href="' + this + '" target="'+ linkObj.target +'">' + this + '</a>');
            }
        });

        return elContent;
    }

    // Find any mentions (e.g. @andreassavvides) and turn them into links that
    // refer to the appropriate social profile (e.g. twitter or instagram).
    function _linkifyMentions(text, baseUrl) {
        return text.replace(/(^|\s|\(|>)@(\w+)/g, "$1<a class='linkified' href='" + baseUrl + "$2' target='_blank'>@$2</a>");
    }

    // Find any hashtags (e.g. #linkyrocks) and turn them into links that refer
    // to the appropriate social profile.
    function _linkifyHashtags(text, links) {
        // If there is no search URL for a hashtag, there isn't much we can do
        if (links.hashtagSearchUrl === null) return text;
        return text.replace(/(^|\s|\(|>)#((\w|[\u00A1-\uFFFF])+)/g, "$1<a class='linkified' href='" + links.baseUrl + links.hashtagSearchUrl + "$2' target='_blank'>#$2</a>");
    }

}(jQuery));
