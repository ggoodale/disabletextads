// ==UserScript==
// @name          Disable Text Ads
// @namespace     http://www.fibble.org/
// @description	  Disables inline text ads from Vibrant Media (IntelliTXT), Kontera, Linkworth, EchoTopic, Targetpoint, Amazon and Mediatext.
// @version 8.2
// @include       http://*
// ==/UserScript==

var disableTextAds = {

  blockAds: function(elt) {
    var target = elt;
    var childNode;
    
    switch(elt.nodeName.toLowerCase()) {

      // EchoTopic wraps their inserted links in a <nobr> tag.
      case 'nobr':
      if (elt.firstChild.getAttribute('class') == "tfTextLink") {
        childNode = elt.firstChild.firstChild;
      }
      break;

      // AdBrite check
      case 'ispan':
      if (elt.hasAttribute('id')) {
        if (match = elt.getAttribute('id').match(/AdBriteInlineAd_(.*)/i)) {
          childNode = document.createTextNode(match[1]);
        }
      }
      break;

      // The rest of the networks
      case 'a':

      // Vibrant Media
      if (elt.hasAttribute('itxtdid')) {
        childNode = elt.firstChild;
        break;
      }

      // Mediatext
      if (elt.hasAttribute('c4fadvertpos')) {
        childNode = elt.firstChild;
        break;
      }

      // Targetpoint Check
      if (elt.hasAttribute('tpi')) {
        childNode = elt.firstChild;
        break;
      }			

      // Kontera check
      if (elt.getAttribute('class') == 'kLink') {
        childNode = disableTextAds.findKonteraText(elt);
        break;
      }


      // Old AdBrite check - not sure if this is still relevant
      if (elt.hasAttribute('id')) {
        if (match = elt.getAttribute('id').match(/AdBriteInlineAd_(.*)/i)) {
          childNode = document.createTextNode(match[1]);
        }
        break;
      }

      // Credit to 'Mike' for Linkworth ad blocking code
      if ( elt.getAttribute('class') == "lw_cad_link" ) {
        childNode = elt.firstChild;
        break;
      }

      // Can't be too cautious.
      break;
      } // case


      // Grab the inner text and replace the inserted tag with it
      if (childNode) {
        target.parentNode.replaceChild(childNode, target);
      }
    },

    findKonteraText: function(elt) {
      // kontera triply-nests the original content: 
      // <a><font><span>text</span><span>here</span></font></a>

      var kTextNodes = document.evaluate("font/span[@class='kLink']/text()", elt, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
      var kTextNode = kTextNodes.iterateNext();
      var content = '';
      while(kTextNode) {
        content += kTextNode.data + ' ';
        kTextNode = kTextNodes.iterateNext();
      }

      return document.createTextNode(content.substring(0,content.length-1));
    }
  };

  document.addEventListener('DOMNodeInserted', function(event) { disableTextAds.blockAds(event.target); }, true);

  // Strictly for Linkworth blocking
  window.addEventListener("load", function(event) { 
    // According to LingoSpot, setting this global variable will disable all ads.  Doesn't actually see to have any effect.
    unsafeWindow.LINGOSPOT_DISABLED = true;

    // Thanks to Descriptor for yet another way to block LingoSpot; doesn't on every page, unfortunately.
    // Still, it should reduce runtime for pages where it works.
    unsafeWindow.tf_maxKeywords = 0;

    var div = document.getElementById("lw_context_ads");
    if (div) {
      var links = document.evaluate("//a[@class='lw_cad_link']", div, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
      for (var i=0; i<links.snapshotLength; i++) { disableTextAds.blockAds(links.snapshotItem(i)); }
    }

    span = document.getElementById('intellitxt');
    if (span) {
      var anchors = document.evaluate("//a[@itxtdid]", span, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
      for(var i=0; i<anchors.snapshotLength; i++) {
        var anchor = anchors.snapshotItem(i);
        anchor.parentNode.replaceChild(document.createTextNode(anchor.textContent), anchor);
      }
    }
  }, false);
