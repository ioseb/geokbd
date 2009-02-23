// ----------------------------------------------------------------------------
// GeoKBD - Georgian Keyboard
// v 1.0
// Dual licensed under the MIT and GPL licenses.
// ----------------------------------------------------------------------------
// Copyright (C) 2009 Ioseb Dzmanashvili
// http://www.code.ge/geokbd
// ----------------------------------------------------------------------------
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
// ----------------------------------------------------------------------------

(function() {
	
	/**
	 * GeoKBD 1.0 RC 1 - Georgian keyboard and text convertation library
	 *
	 * Copyright (c) 2007 Ioseb Dzmanashvili (http://www.code.ge)
	 * Licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
	 */
	
	String.prototype.pasteTo = function(field) {
		field.focus();
		if (document.selection) {
			var range = document.selection.createRange();
			if (range) {
				range.text = this;
			}
		} else if (field.selectionStart != undefined) {
			with(field) {
				var scroll = scrollTop, start = selectionStart, end = selectionEnd;
			}
			var value = field.value.substr(0, start) + this + field.value.substr(end, field.value.length);
			field.value = value;
			field.scrollTop = scroll;
			field.setSelectionRange(start + this.length, start + this.length); 
		} else {
			field.value += this;
			field.setSelectionRange(field.value.length, field.value.length);		
		}
	};
	
	String.prototype.translateToKA = function() {
		
		/**
		 * Original idea by Irakli Nadareishvili
		 * http://www.sapikhvno.org/viewtopic.php?t=47&postdays=0&postorder=asc&start=10
		 */
		var index, chr, text = [], symbols = "abgdevzTiklmnopJrstufqRySCcZwWxjh";
		
		for (var i = 0; i < this.length; i++) {
			chr = this.substr(i, 1);
			if ((index = symbols.indexOf(chr)) >= 0) {
				text.push(String.fromCharCode(index + 4304));
			} else {
				text.push(chr);
			}
		}
		
		return text.join('');
		
	};
	
	function $(needle, context, lang, switcher, excludeFields) {
		
		var els = this.els = [];
		context = context || document.forms;
		
		if (needle && (needle.nodeType || typeof needle == 'object')) {
			this.els.push(needle);
		} else if (!needle || typeof needle == 'string' || excludeFields) {
			(function(query) {
				
				var tokens = [];
				
				if (query) {
					tokens = query.replace(/ /g, '')
						 		  .replace(/\./g, 'className.')
						 		  .replace(/#/g, 'id.')								  
						 		  .split(',');
				}
				
				for(var i = 0; i < context.length; i++) {
					var form = context[i];
					fn(form).extend(new KAForm());
					form.init(lang, switcher);
					for (var j = 0; j < context[i].elements.length; j++) {
						var el = form.elements[j];
						if (el.type && /text|textarea/i.test(el.type)) {
							if (tokens.length) {
								var fld = false;
								for (var k = 0; k < tokens.length; k++) {
									var tmp = tokens[k].split('.');
									if (fld = (tmp.length == 1 && el.name == tmp[0]) || (tmp.length == 2 && el[tmp[0]] == tmp[1])) {
										break;
									}
								}
								if (fld && !excludeFields) {
									el.ka = true;
									fld = false;
								} else if (!fld && excludeFields) {
									el.ka = true;
								}
							} else {
								el.ka = true;
							}
						}
					}
				}
				
			})(needle || excludeFields);
		}
		
		return this;
		
	}
	
	$.prototype = {
		each: function(fn) {
			if (fn) {
				for (var i = 0; i < this.els.length; i++) {
					fn.call(this, this.els[i], i);
				}
			}
			return this;
		},
		extend: function() {
			var p, args = arguments;			
			this.each(
				function(target) {
					for (var i = 0; i < args.length; i++) {
						if ((p = args[i]) != null) {
							for (var idx in p) {
								if (target == p) {
									continue;
								} else if (p[idx] != undefined) {
									target[idx] = p[idx];
								}
							}
						}
					}
				}
			);			
			return this;
		},
		get: function(index) {
			return this.els[index || 0] || null;
		}
	};
	
	function fn(needle, context, lang, switcher, excludeFields) {
		return new $(needle, context, lang, switcher, excludeFields);
	};
	
	fn.event = function(e) {
		var event = function(orig) {
			this.orig = e;
		};
		event.prototype = {
			getKeyCode: function() {
				return this.keyCode || this.which;
			},
			getTarget: function() {
				return this.target || this.srcElement
			},
			targetIs: function(tagName) {
				var t = this.getTarget();
				t.tagName.toLowerCase() == tagName ? t : null;
			},
			cancel: function() {
				try {
					e.stopPropagation();
					e.preventDefault();
				} catch(ex) {
					e.cancelBubble = true;
					e.returnValue = false;
				}
			}		
		};
		return fn(new event()).extend((e || window.event)).get();
	};
	
	fn.event.attach = function(o, evt, fnc) {
		if (o.addEventListener) {
			o.addEventListener(evt, fnc, false);
		} else if (o.attachEvent) {
			return o.attachEvent('on' + evt, fnc);
		} else {
			o['on' + evt] = fnc;
		}	
	};
	
	fn.event.detach = function(o, evt, fnc) {
		if (o.removeEventListener) {
			o.removeEventListener(evt, fnc, false);
		} else if (o.detachEvent) {
			o.detachEvent('on' + evt, fnc);
		} else {
			o['on' + evt] = null;
		}
	};
	
	var ua = navigator.userAgent.toLowerCase();
	fn.browser = {
		is: function(key) {ua.indexOf(key) > -1},
		isOpera: ua.indexOf('opera')  > -1,
		isIe:    ua.indexOf('msie')   > -1,
		isIe6:   ua.indexOf('msie 6') > -1,
		isIe7:   ua.indexOf('msie 7') > -1
	};
	
	var KAForm = function() {
		this.ka 	  = true;
		this.switcher = null;
		this.global   = true;
		this.init = function(lang, switcher) {
			this.global = !!!lang;
			if (!this.global) {
				lang = lang || GeoKBD.KA;
			} else {
				lang = lang || GeoKBD.lang;
			}
			switcher = switcher || 'geo';
			if (this.elements[switcher]) {
				this.switcher = this.elements[switcher];
				//this.global = false;
			} else {
				this.switcher = {};
				this.switcher.checked = lang == GeoKBD.KA;
			}
			this.ka = this.switcher.checked;
		},
		this.changeLang = function(flag) {
			if (this.switcher) {
				if (flag == undefined) {
					this.switcher.checked = flag = !this.switcher.checked;
				} else {
					this.switcher.checked = flag;
				}
			}
			this.ka = !!flag;
		},
		this.onkeypress = function(e) {

			e = fn.event(e);
			
			if (e.altKey || e.ctrlKey || e.metaKey) return;
					
			if (!fn.browser.isIe && !fn.browser.isOpera && !e.charCode) {
				return;
			}
			
			var target = e.getTarget();
			
			if (target.ka != undefined && target.ka) {
				
				var keyCode = e.getKeyCode();
				if (keyCode == 96) {
					this.changeLang();
					return false;
				}
				
				if (!this.switcher.checked) return;
				
				var text   = String.fromCharCode(keyCode);
				var kaText = text.translateToKA();
				
				if (kaText != text) {
					if (fn.browser.isIe) {
						window.event.keyCode = kaText.charCodeAt(0);
					} else {
						kaText.pasteTo(target);
						return false;
					}
				}
				
			}
			
		}
	};
	
	var GeoKBD = {
		KA:   'ka',
		EN:   'en',
		lang: 'ka',
		setGlobalLanguage: function(lang, switcher) {
			
			function changeLang(switcher) {
				for (var i = 0; i < document.forms.length; i++) {
					var form = document.forms[i];
					if (form.global && form.changeLang && !form.switcher.nodeName) {
						form.changeLang(switcher.checked);
					}
				}
			};
			
			this.lang = lang;
			switcher  = document.getElementById(switcher) || {};
			
			if (!switcher.nodeType) {
				switcher.checked = lang == GeoKBD.KA;
			} else {
				switcher.onclick = function() {
					changeLang(this);
				}
			}
			
			document.onkeypress = function(e) {
				e = fn.event(e);
				var isTextField = /input|textarea/i.test(e.getTarget().nodeName);
				if (e.getKeyCode() == 96 && (!isTextField || (isTextField && !e.getTarget().form.switcher.nodeName))) {
					switcher.checked = !switcher.checked;
					changeLang(switcher);
					return false;
				}
			}
			
		},
		pasteSelection: function(field) {
			try {
				var selection = document.selection ? document.selection.createRange().text : document.getSelection();
				selection.pasteTo(field);
			} catch(e) {}
			return false;
		},
		map:function(params) {
			
			var form, fields, switcher, lang, excludeFields;
			if (params) {
				form = params.forms || null;
				fields = params.fields || null;
				switcher = params.switcher || null;
				lang = params.lang || null;
				excludeFields = params.excludeFields || null;
			}
			var names = [], forms = [];
			
			if (form) {
				if (form.constructor) {
					if (form.constructor == String) {
						names.push(form);
					} else if (form.constructor == Array) {
						names = form;
					}
					if (names.length) {
						for (var idx in names) {
							if (document.forms[names[idx]]) {
								forms.push(document.forms[names[idx]]);
							}
						}
					}
				} else {
					forms.push(form);
				}
			} else {
				forms = document.forms;
			}
			
			if (fields) {
				fields = typeof fields == 'string' ? fields : fields.join(',');
			}
			
			if (excludeFields) {
				excludeFields = typeof excludeFields == 'string' ? excludeFields : excludeFields.join(',');
			}
			
			fn(fields, forms, lang, switcher, excludeFields);
			
		},
		
		mapForm: function(form, fields, lang, switcher) {
			this.map(
				{
					forms: form,
					fields: fields, 
					switcher: switcher, 
					lang: lang
				}
			);
		},
		
		mapFields: function(fields, lang) {
			this.map(null, fields, null, lang);
		},
		
		mapIFrame: function(iframe) {
			
			var __keypress = function(e) {
				
				e = fn.event(e);
				if (e.altKey || e.ctrlKey) return;
				
				var doc = e.getTarget().ownerDocument;
				if (doc.ka == undefined) doc.ka = true;
				
				var keyCode = e.getKeyCode(),
					text = String.fromCharCode(keyCode),
					form = parent.document.forms[doc.parentForm];

				if (keyCode == 96) {
					doc.ka = !doc.ka;
					if (form && form.changeLang) form.changeLang(doc.ka);
					e.cancel();
				} else if (form && form.switcher) {
					doc.ka = form.switcher.checked;
				}
				
				form = null;
				
				if (doc.ka) {				
					var kaText = text.translateToKA();
					if (kaText != text) {
						if (!fn.browser.isIe) {
							doc.execCommand('InsertHTML', false, kaText);
						} else {
							var range = doc.selection.createRange();
							range.pasteHTML(kaText);
						}
						e.cancel();
					}
				}
				
			}
			
			var __focus = function(e) {
				fn.event.attach(this.contentWindow.document, 'keypress', __keypress);
				this.onfocus = null;
			};
			
			var interval = window.setInterval(function() {
				var el = typeof iframe=='string' ? document.getElementById(iframe) : iframe();
				if (el) {
					for (var p = el.parentNode; p && p != document.body; p = p.parentNode) {
						if (/form/i.test(p.tagName)) {
							if (el.contentWindow.document) {
								el.contentWindow.document.parentForm = p.name || p.id;
							} else {
								el.document.parentForm = p.name || p.id;
							}
							break;
						}
					}
					if (!fn.browser.isIe) {
						fn.event.attach(el.contentWindow.document, 'keypress', __keypress, true);
					} else {
						el.onfocus = __focus;
					}
					el = null;
					window.clearInterval(interval);
				}
			}, 0);
			
		},
		
		ready: function(fn) {
			var load = window.onload;
			if (!window.onload) {
				window.onload = fn;
			} else {
				window.onload = function() {
					load(); fn();
				};
			}
		}
		
	};
	
	window.GeoKBD = GeoKBD;
	
})();