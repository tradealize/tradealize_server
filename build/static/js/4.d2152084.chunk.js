(this.webpackJsonptradealize_client=this.webpackJsonptradealize_client||[]).push([[4],{161:function(e,t,r){"use strict";r.r(t),r.d(t,"DeviceWeb",(function(){return p}));var n=r(22),a=r(3),i=r(8),o=r(11),s=r(10),u=r(12),c=r(13),p=function(e){Object(u.a)(r,e);var t=Object(c.a)(r);function r(){return Object(o.a)(this,r),t.apply(this,arguments)}return Object(s.a)(r,[{key:"getId",value:function(){var e=Object(i.a)(Object(a.a)().mark((function e(){return Object(a.a)().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.abrupt("return",{uuid:this.getUid()});case 1:case"end":return e.stop()}}),e,this)})));return function(){return e.apply(this,arguments)}}()},{key:"getInfo",value:function(){var e=Object(i.a)(Object(a.a)().mark((function e(){var t,r;return Object(a.a)().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if("undefined"!==typeof navigator&&navigator.userAgent){e.next=2;break}throw this.unavailable("Device API not available in this browser");case 2:return t=navigator.userAgent,r=this.parseUa(t),e.abrupt("return",{model:r.model,platform:"web",operatingSystem:r.operatingSystem,osVersion:r.osVersion,manufacturer:navigator.vendor,isVirtual:!1,webViewVersion:r.browserVersion});case 5:case"end":return e.stop()}}),e,this)})));return function(){return e.apply(this,arguments)}}()},{key:"getBatteryInfo",value:function(){var e=Object(i.a)(Object(a.a)().mark((function e(){var t;return Object(a.a)().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if("undefined"!==typeof navigator&&navigator.getBattery){e.next=2;break}throw this.unavailable("Device API not available in this browser");case 2:return t={},e.prev=3,e.next=6,navigator.getBattery();case 6:t=e.sent,e.next=11;break;case 9:e.prev=9,e.t0=e.catch(3);case 11:return e.abrupt("return",{batteryLevel:t.level,isCharging:t.charging});case 12:case"end":return e.stop()}}),e,this,[[3,9]])})));return function(){return e.apply(this,arguments)}}()},{key:"getLanguageCode",value:function(){var e=Object(i.a)(Object(a.a)().mark((function e(){return Object(a.a)().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.abrupt("return",{value:navigator.language.split("-")[0].toLowerCase()});case 1:case"end":return e.stop()}}),e)})));return function(){return e.apply(this,arguments)}}()},{key:"getLanguageTag",value:function(){var e=Object(i.a)(Object(a.a)().mark((function e(){return Object(a.a)().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.abrupt("return",{value:navigator.language});case 1:case"end":return e.stop()}}),e)})));return function(){return e.apply(this,arguments)}}()},{key:"parseUa",value:function(e){var t={},r=e.indexOf("(")+1,a=e.indexOf(") AppleWebKit");-1!==e.indexOf(") Gecko")&&(a=e.indexOf(") Gecko"));var i=e.substring(r,a);if(-1!==e.indexOf("Android")){var o=i.replace("; wv","").split("; ").pop();o&&(t.model=o.split(" Build")[0]),t.osVersion=i.split("; ")[1]}else if(t.model=i.split("; ")[0],"undefined"!==typeof navigator&&navigator.oscpu)t.osVersion=navigator.oscpu;else if(-1!==e.indexOf("Windows"))t.osVersion=i;else{var s=i.split("; ").pop();if(s){var u=s.replace(" like Mac OS X","").split(" ");t.osVersion=u[u.length-1].replace(/_/g,".")}}/android/i.test(e)?t.operatingSystem="android":/iPad|iPhone|iPod/.test(e)&&!window.MSStream?t.operatingSystem="ios":/Win/.test(e)?t.operatingSystem="windows":/Mac/i.test(e)?t.operatingSystem="mac":t.operatingSystem="unknown";var c=!!window.InstallTrigger,p=!!window.ApplePaySession,l=!!window.chrome,v=/Edg/.test(e),f=/FxiOS/.test(e),d=/CriOS/.test(e),g=/EdgiOS/.test(e);if(p||l&&!v||f||d||g){var x;x=f?"FxiOS":d?"CriOS":g?"EdgiOS":p?"Version":"Chrome";var b,w=e.split(" "),h=Object(n.a)(w);try{for(h.s();!(b=h.n()).done;){var y=b.value;if(y.includes(x)){var O=y.split("/")[1];t.browserVersion=O}}}catch(j){h.e(j)}finally{h.f()}}else if(c||v){var m=e.split("").reverse().join("").split("/")[0].split("").reverse().join("");t.browserVersion=m}return t}},{key:"getUid",value:function(){if("undefined"!==typeof window&&window.localStorage){var e=window.localStorage.getItem("_capuid");return e||(e=this.uuid4(),window.localStorage.setItem("_capuid",e),e)}return this.uuid4()}},{key:"uuid4",value:function(){return"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,(function(e){var t=16*Math.random()|0;return("x"===e?t:3&t|8).toString(16)}))}}]),r}(r(44).b)}}]);
//# sourceMappingURL=4.d2152084.chunk.js.map