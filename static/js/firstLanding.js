
document.addEventListener('DOMContentLoaded', async () => {
console.log('SGV5IHRoZXJlLCBpdCBzZWVtcyBsaWtlIHlvdSBrbm93IGFib3V0IHdlYiBkZXYhIFlvdSBtaWdodCBiZSB3b25kZXJpbmcgd2h5IHRoaXMgcGFnZSBjb250YWlucyBhIGZha2UgbG9hZGluZyBzY3JlZW4uIFRoaXMgaXMgYmVjYXVzZSB0aGUgc2VydmVyIGlzIHN0aWxsIHByb2Nlc3NpbmcgaW5mb3JtYXRpb24gYW5kIEkgbmVlZCBhIHdheSBmb3IgdGhlIHVzZXIgdG8gd2FpdC4gSSBkbyBub3Qgd2FudCB0byBtYWtlIGl0IHRvbyBjb21wbGljYXRlZCBzbyBJIGZvdW5kIG91dCB0aGUgc2NyaXB0IHdpbGwgaGF2ZSBhIG1heGltdW0gcnVubmluZyB0aW1lIG9mIDIwIHNlY29uZHMgd2hpY2ggSSBtYWRlIGEgbG9hZGluZyBzY3JlZW4gZm9yIDI3LjUgc2Vjb25kcy4gSXQgd29ya3MgYnV0IGl0cyBzbG9wcHkuIEJhZCBzb2x1dGlvbiBidXQgaXQgd29ya3MuIFNvLi4uIFllYWguIFNodXQgdXAgYW5kIG1vdmUgb24uIEJ5ZSA7KQ==')
            function showFirstText() {
                setTimeout(() => {document.getElementById("bottomText").style.color = 'white';}, 200)
              document.getElementById("bottomText").style.visibility = "visible";
            }
            setTimeout(() => {showFirstText()}, 6400);

            function showSecondText() {
                setTimeout(() => {document.getElementById("endText").style.color = 'white';}, 200)
                document.getElementById("endText").style.visibility = "visible";
            }
            setTimeout(() => {showSecondText()}, 10400);

            function showTopLayerText() {
                setTimeout(() => {document.getElementById("topLayerText").style.color = 'white';}, 200)
                document.getElementById("topLayerText").style.visibility = "visible";
                document.getElementById("bottomText").innerHTML = "";
                document.getElementById("endText").innerHTML = "";
                document.getElementById("topText").innerHTML = "";
            }
            setTimeout(() => {showTopLayerText()}, 20400);

            function redirect() {
                window.location.href = "/";
            }
            setTimeout(() => {redirect()}, 28000);
        });