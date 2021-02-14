// ==UserScript==
// @name         leboncoin flat research helper
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  TODO
// @author       Aldo Mollica
// @match        https://www.leboncoin.fr/*
// @grant        none
// ==/UserScript==

var PRIX_AU_METRE_CARRE = 4401;

function LOG(text) {
    console.log(text);
}

// format the priceovermq in red if greater than the PRIX_AU_METRE_CARRE, green otherwise.
// make it bold as well
function format(priceovermq) {
    var pmq_s = priceovermq.toString() + " euro au m²";
    if(priceovermq > PRIX_AU_METRE_CARRE)
    {
        pmq_s = pmq_s.fontcolor("red");
    }
    else
    {
        pmq_s = pmq_s.fontcolor("green");
    }
    pmq_s = pmq_s.bold();
    return pmq_s;
}


function calculatePriceOverMq() {
    'use strict';

    if(document.getElementsByClassName("styles_mainListing__PjWbm").length == 0)
    {
        LOG('skip calculatePriceOverMq, element not found');
        return;
    }

    // Get list of items
    var flats = document.getElementsByClassName("styles_mainListing__PjWbm")[0].children;
    LOG("Flats found: " + flats.length);
    for (var i = 0; i < flats.length; i++) {
        try {
            LOG("------------------");
            LOG(flats[i]);
            var title_whole = flats[i].getElementsByClassName('_2-MzW _23lZh HlrAk _2k-6T')[0].getElementsByTagName('p')[0].innerHTML;
            var price_whole = flats[i].getElementsByClassName('_1C-CB')[0].innerHTML;
            //LOG(title_whole);
            //LOG(price_whole);
            var mq = 0;
            if(title_whole.includes('m²') || title_whole.includes('m2')) {
                var rg = "(\\d\+)(\.\\d\+)?(\.)?(m)";
                mq = parseInt(title_whole.match(rg)[1]); // "match digits before 'm' of mq or m²";
                if(title_whole.match(rg)[2])
                {
                    mq = parseFloat(title_whole.match(rg)[1].concat(title_whole.match(rg)[2]));
                }
                //LOG(mq);
            }
            var price_begin = price_whole.match("(\\d+)(\&nbsp;)(\\d\+)")[1]; // "match thosands digits"
            var price_end = price_whole.match("(\\d+)(\&nbsp;)(\\d\+)")[3]; // "match the rest of the digits"
            var price = parseInt(price_begin.concat(price_end));
            //LOG(price);

            if(mq != 0 && Number.isInteger(price))
            {
                var priceovermq = Math.ceil(price/mq);
                LOG("price per mq: " + priceovermq);

                // Now create and append to innerDiv
                var innerDiv = document.createElement('div');
                innerDiv.className = 'priceovermq';

                // The variable iDiv is still good... Just append to it.
                flats[i].getElementsByClassName('_3Q1Yj _1qZ_s')[0].appendChild(innerDiv);
                innerDiv.innerHTML = format(priceovermq);
            }
        }
        catch (e) {
            LOG("Error, go to the next");
            LOG(e);
            continue;
        }
    }
}

// Click on "Voir plus" to extend the descriptiom and highlight some words
function highlight()
{
    // Open the whole description by clicking on "Voir plus"
    document.getElementsByClassName("_27ngl _64Mha _2NG-q _29R_v _3Q3XS HGqCc -HQxY _3FpaQ Mb3fh _137P- P4PEa _35DXM")[0].click();

    var description = document.getElementsByClassName("_1fFkI")[0];
    //LOG(description.innerHTML);

    var keywords = ["ascenseur", "parking", "balcon","garage","terrasse", "cave", "travaux"];

    if(keywords.length)
    {
       keywords.sort((a, b) => b.length - a.length);
       var regex = new RegExp(keywords.join('|') + '(?!([^<]+)?<)', 'gi');
       description.innerHTML = description.textContent.replace(regex, '<b style="background-color:#ff0;font-size:100%">$&</b>');
     }
}

// Execute only when the page is fully load
window.onload = function(){
    setTimeout(calculatePriceOverMq(), 1000);
    setTimeout(highlight(), 10);
}
