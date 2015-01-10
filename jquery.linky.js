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
                hashtags: false,
                urls: true,
                linkTo: 'local',
                target: '_blank'
            },
            extendedOptions = $.extend(defaultOptions, options),
            elContent = $el.html(),
            /**
             * Regular Expression for URL validation
             *
 			 * Author:	Diego Perini
 			 * Updated:	2010/12/05
 			 * License: MIT
 			 * @link	https://gist.github.com/dperini/729294
 			 *
			 * Copyright (c) 2010-2013 Diego Perini (http://www.iport.it)
			 *
			 * Permission is hereby granted, free of charge, to any person
			 * obtaining a copy of this software and associated documentation
			 * files (the "Software"), to deal in the Software without
			 * restriction, including without limitation the rights to use,
			 * copy, modify, merge, publish, distribute, sublicense, and/or sell
			 * copies of the Software, and to permit persons to whom the
			 * Software is furnished to do so, subject to the following
			 * conditions:
			 *
			 * The above copyright notice and this permission notice shall be
			 * included in all copies or substantial portions of the Software.
			 *
			 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
			 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
			 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
			 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
			 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
			 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
			 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
			 * OTHER DEALINGS IN THE SOFTWARE.
			 *
			 * the regular expression composed & commented
			 * could be easily tweaked for RFC compliance,
			 * it was expressly modified to fit & satisfy
			 * these test for an URL shortener:
			 *
			 * http://mathiasbynens.be/demo/url-regex
			 *
			 * Notes on possible differences from a standard/generic validation:
			 *
			 * - utf-8 char class take in consideration the full Unicode range
			 * - TLDs have been made mandatory so single names like "localhost" fails
			 * - protocols have been restricted to ftp, http and https only as requested
			 *
			 * Changes:
			 *
			 * - IP address dotted notation validation, range: 1.0.0.0 - 223.255.255.255
			 * first and last IP address of each class is considered invalid
			 * (since they are broadcast/network addresses)
			 *
			 * - Added exclusion of private, reserved and/or local networks ranges
			 *
			 * Compressed one-line versions:
			 *
			 * Javascript version
			 *
			 * /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/i
			 *
			 * PHP version
			 *
			 * _^(?:(?:https?|ftp)://)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\x{00a1}-\x{ffff}0-9]-*)*[a-z\x{00a1}-\x{ffff}0-9]+)(?:\.(?:[a-z\x{00a1}-\x{ffff}0-9]-*)*[a-z\x{00a1}-\x{ffff}0-9]+)*(?:\.(?:[a-z\x{00a1}-\x{ffff}]{2,})))(?::\d{2,5})?(?:/\S*)?$_iuS
			*/
			 urlRegEx = new RegExp(
			 "^" +
			 // protocol identifier
			 "(?:(?:https?|ftp)://)" +
			 // user:pass authentication
			 "(?:\\S+(?::\\S*)?@)?" +
			 "(?:" +
			 // IP address exclusion
			 // private & local networks
			 "(?!(?:10|127)(?:\\.\\d{1,3}){3})" +
			 "(?!(?:169\\.254|192\\.168)(?:\\.\\d{1,3}){2})" +
			 "(?!172\\.(?:1[6-9]|2\\d|3[0-1])(?:\\.\\d{1,3}){2})" +
			 // IP address dotted notation octets
			 // excludes loopback network 0.0.0.0
			 // excludes reserved space >= 224.0.0.0
			 // excludes network & broacast addresses
			 // (first & last IP address of each class)
			 "(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])" +
			 "(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}" +
			 "(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))" +
			 "|" +
			 // host name
			 "(?:(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)" +
			 // domain name
			 "(?:\\.(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)*" +
			 // TLD identifier
			 "(?:\\.(?:[a-z\\u00a1-\\uffff]{2,}))" +
			 ")" +
			 // port number
			 "(?::\\d{2,5})?" +
			 // resource path
			 "(?:/\\S*)?" +
			 "$", "i"
			 ), 
            matches;

            // Linkifying URLs
            if (extendedOptions.urls) {
                matches = elContent.match(urlRegEx);
                if ( matches ) {
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
    // an 'a' element, linkify them.
    function _linkifyUrls(matches, $el, linkObj) {
        var elContent = $el.html();

        $.each(matches, function( index, value ) {
            // Only linkify URLs that are not already identified as
            // 'a' elements with an 'href' or are not YouTube URLS
        	var isEmbed				= false;
        	
        	// check for YouTube embed
        	var isYouTubeEmbed      = value.match( /youtube\.com\/embed/ig );
        	var isYouTubeAltEmbed   = value.match( /youtube\-nocookie\.com\/embed/ig );
        	isYouTubeEmbed          = ( isYouTubeEmbed !== null || isYouTubeAltEmbed !== null ) ? true : false;        	
        	
        	// check for Vimeo embed
        	var isVimeoEmbed		= value.match( /player\.vimeo\.com\/video/ig );
        	isYouTubeEmbed          = ( isVimeoEmbed !== null ) ? true : false;
        	
        	if( isYouTubeEmbed || isVimeoEmbed ) {
        		isEmbed = true;
        	}
        	       
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
