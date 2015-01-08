/**
 * jquery.linky.js v0.1.8
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
                    baseUrl: "//domain.tld/",
                    hashtagSearchUrl: "search/",
                    target: '_self'
                },        		
                twitter: {
                    baseUrl: "https://twitter.com/",
                    hashtagSearchUrl: "hashtag/",
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
                hashtags: true,
                urls: false,
                linkTo: 'local',
                target: '_blank'
            },
            extendedOptions = $.extend(defaultOptions, options),
            elContent = $el.html(),
            // Regular expression courtesy of Matthew O'Riordan, see: http://goo.gl/3syEKK
            urlRegEx = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-]*)?\??(?:[\-\+=&;%@\.\w]*)#?(?:[\.\!\/\\\w]*))?)/g,
            matches;

            // Linkifying URLs
            if (extendedOptions.urls) {
                matches = elContent.match(urlRegEx);
                if (matches) {
                    elContent = _linkifyUrls(matches, $el, links);
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

    // For any URLs present, unless they are already identified within
    // an `a` element, linkify them.
    function _linkifyUrls(matches, $el, linkObj) {
        var elContent = $el.html();

        $.each(matches, function( index, value ) {
            // Only linkify URLs that are not already identified as
            // 'a' elements with an 'href' or are not YouTube URLS
        	var isYouTubeEmbed      = value.match( /youtube\.com\/embed/ig );
        	var isYouTubeAltEmbed   = value.match( /youtube\-nocookie\.com\/embed/ig );
        	isYouTubeEmbed          = ( isYouTubeEmbed !== null || isYouTubeAltEmbed !== null ) ? true : false;        	
        	
            if ( !isYouTubeEmbed && $el.find("a[href='" + this + "']").length === 0) {
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
