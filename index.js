console.log("Hello");

let textArea = document.getElementById("inputArea");
textArea.addEventListener("input", listener);

function listener() {
    let text = textArea.value;
    if (text == "") {
        // if there is nothing in text area
        document.getElementById("suggestion").innerHTML = "";
        return;
    }
    let xhr = new XMLHttpRequest();
    xhr.open("GET", `https://suggestqueries.google.com/complete/search?output=toolbar&hl=en&q=${text}`, true);
    xhr.send();
    xhr.onload = function () {
        if (this.status == 200) {
            let xml = this.responseText;
            let XmlNode = new DOMParser().parseFromString(xml, 'text/xml');
            let res = xmlToJson(XmlNode);

            let obj = res.toplevel.CompleteSuggestion;
            // console.log(obj);
            let html = "";
            obj.forEach((result, index) => {
                html += `
                        <button type="button" class="list-group-item list-group-item-action" id="${index}" onclick="clicker(${index})">${result.suggestion["@attributes"].data}</button>
                    `;
            });
            document.getElementById("suggestion").innerHTML = html;
        }
        else {
            document.getElementById("suggestion").innerHTML = "";
            console.log("some error occured");
        }
    }
}


// when a suggestion is clicked this will run
function clicker(index) {
    let text = document.getElementById(`${index}`).innerText;
    textArea.value = text;
    listener();
}



// converts a xml string to json Object
function xmlToJson(xml) {
    // Create the return object
    var obj = {};

    if (xml.nodeType == 1) {
        // element
        // do attributes
        if (xml.attributes.length > 0) {
            obj["@attributes"] = {};
            for (var j = 0; j < xml.attributes.length; j++) {
                var attribute = xml.attributes.item(j);
                obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
            }
        }
    } else if (xml.nodeType == 3) {
        // text
        obj = xml.nodeValue;
    }

    // do children
    // If all text nodes inside, get concatenated text from them.
    var textNodes = [].slice.call(xml.childNodes).filter(function (node) {
        return node.nodeType === 3;
    });
    if (xml.hasChildNodes() && xml.childNodes.length === textNodes.length) {
        obj = [].slice.call(xml.childNodes).reduce(function (text, node) {
            return text + node.nodeValue;
        }, "");
    } else if (xml.hasChildNodes()) {
        for (var i = 0; i < xml.childNodes.length; i++) {
            var item = xml.childNodes.item(i);
            var nodeName = item.nodeName;
            if (typeof obj[nodeName] == "undefined") {
                obj[nodeName] = xmlToJson(item);
            } else {
                if (typeof obj[nodeName].push == "undefined") {
                    var old = obj[nodeName];
                    obj[nodeName] = [];
                    obj[nodeName].push(old);
                }
                obj[nodeName].push(xmlToJson(item));
            }
        }
    }
    return obj;
}