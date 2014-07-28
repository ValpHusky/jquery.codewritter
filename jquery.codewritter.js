var jqcWritterLangRules = {};
// String code
var jqcWritterDefaults = {
    css: {
            commentline: {color: "#999999", "font-weight": "lighter"},
            commentblock: {color: "#999999", "font-weight": "lighter"},
            arithmeticOperator: {color: "#0040FF"},
            discreteOperator: {color: "#0040FF"},
            punctuation: {color: "#000000"},
            reservedWord: {color: "#5858FA", "font-weight": "bold"},
            specialWord: {color: "#DF01D7", "font-weight": "bold"},
            regex: {color: "#642EFE"},
            string: {color: "#FF8000"},
            number: {color: "#FE2E9A"},
            boolean: {color: "#088A08"},
            word: {color: "#333333"},
            break: { width: "100%", display: "block"},
            whitespace:{},
            tab: {}
    }, speed: 10,
    ajaxMethod: "POST",
    ajaxData: null,
    loop: true,
    cleanAfterDone: true,
    html: true,
    keepscroll:true,
    language: "javascript",
    classPrefix: "jqcw_",
    tabsize: "15px",
    breaksize: "5px",
    fontsize: "18px",
};

var jqcwritterCodeParser = function(code, params) {
	this.splitedCode = [];
	this.currentCode = code;
	this.params = params;
	this.counter = 0;
	this.wordCounter = 0;
	this.lastObject = null;
	this.doubleQuoteClosed = true;
	this.singleQuoteClosed = true;
	this.commentOpened = false;
	this.ignoreControl = false;

	this.constructor = function() {
		var word = "";
		var rules = jqcWritterLangRules[this.params.language];
		if (rules) {
			var capsuleOn = null;
			var capsuleWarn = {};
			var capsuleProcedure = "open";
			var match = false;
			var closing = false;
			var matching = false;
			var currentEval = "";
			for (var i = 0; i < this.currentCode.length; i++) {
				var char = this.currentCode[i];

				if (rules.capsulingRules) {
					if (!match) {
						var capsule = null;
						for (var cap in rules.capsulingRules) {
							capsule = rules.capsulingRules[cap];
							if (!capsuleWarn[cap]) {
								capsuleWarn[cap] = 0;
							}
							;
							for (var j = 0; j < capsule.length; j++) {
								if (capsule[j][capsuleProcedure][capsuleWarn[cap]]) {
									if (capsule[j][capsuleProcedure][capsuleWarn[cap]].test(char)) {
										if (!capsule[j][capsuleProcedure][capsuleWarn[cap] + 1]) {
											match = true;
											capsuleWarn = {};
											capsuleOn = cap;
											capsuleProcedure = "close";
											matching = true;

										} else {
											capsuleWarn[cap]++;
										}
									}
								}

							}
						}
					} else {
						capsule = rules.capsulingRules[capsuleOn];
						capsuleWarn[capsuleOn] = 0;
						for (var j = 0; j < capsule.length; j++) {
							if (capsule[j][capsuleProcedure][capsuleWarn[capsuleOn]]) {
								if (capsule[j][capsuleProcedure][capsuleWarn[capsuleOn]].test(char)) {

									if (!capsule[j][capsuleProcedure][capsuleWarn[capsuleOn] + 1]) {
										capsuleWarn = {};
										closing = true;
										match = false;
										capsuleProcedure = "open";
									} else {
										capsuleWarn[capsuleOn]++;
									}
								}
							}

						}

					}
				}

				if ((!rules.linecontrol.test(char) && !rules.punctuation.test(char)) || match) {
					word += char;
					if (!matching) {
						for (var ru in rules) {
							if (ru !== "capsulingRules") {
								if (word.match(rules[ru])) {
									var ob = {};
									ob.name = ru;
									ob.char = word;
									this.splitedCode.push(ob);
									word = "";
								}
							}
						}
					}
				} else {
					if (word !== "") {
						if (capsuleOn) {
							var ob = {};
							ob.name = capsuleOn;
							ob.char = word;
							this.splitedCode.push(ob);
							capsuleOn = null;
						} else {
							this.splitedCode.push({
								name : "word",
								char : word
							});
						}

						word = "";
					}

					if (rules.linecontrol.test(char)) {
						this.splitedCode.push({
							name : this.lines(this.currentCode[i]),
							char : char
						});
					} else if (rules.punctuation.test(char)) {
						this.splitedCode.push({
							name : "punctuation",
							char : char
						})
					}
				}
				if (closing) {
					closing = false;
					matching = false;

				}
			}

			//console.log(this.splitedCode);
		} else {
			throw "JQuery Code Writter:: Rules for language " + this.params.language + " are not defined.";
		}
	};
	this.lines = function(char) {
		if (char.match(/\n|\r/g)) {
			return "break";
		} else if (char.match(/\t/g)) {
			return "tab";
		} else if (char.match(/\s/g)) {
			return "whitespace";
		}
	}
	this.splitIndividualWord = function(word, rules) {
		var acum = "";
		for (var i = 0; i < word.length; i++) {
			acum += word[i];

		}
	}
	this.next = function() {
		var obj = this.lastObject;
		if (!obj) {
			var previousWord = this.lookForClosest(this.splitedCode, this.counter, -1);
			var nextWord = this.lookForClosest(this.splitedCode, this.counter, 1);
			this.lastObject = this.createNode(this.splitedCode[this.counter].name, previousWord, nextWord);
			obj = this.lastObject;
		}
		if (this.wordCounter <= this.splitedCode[this.counter].char.length) {
			obj.append(this.splitedCode[this.counter].char[this.wordCounter]);
			this.wordCounter++;
		} else {
			this.wordCounter = 0;
			this.lastObject = null;
			this.counter++;
		}
		return obj;

	};
	this.hasNext = function(object) {
		var has = false;
		if (this.splitedCode[this.counter]) {
			if (this.splitedCode[this.counter]) {
				has = true;
			} else {
				if (this.splitedCode[this.counter].char && this.splitedCode[this.counter].char[this.wordCounter]) {
					has = true;
				}
			}
		}

		if (!has && this.params.loop) {
			this.counter = 0;
			this.wordCounter = 0;
			if (this.params.cleanAfterDone) {
				$(object).html("");
			}
			return true;
		}
		return has;
	};
	this.lookForClosest = function(list, counter, moveTo) {
		var cCounter = counter;
		if (list[counter + moveTo]) {
			if (list[counter + moveTo].name !== "linecontrol") {
				return list[counter + moveTo].value;
			} else {
				cCounter = cCounter + moveTo;
				return this.lookForClosest(list, cCounter, moveTo);
			}
		}
		return null;
	}
	this.createNode = function(name, prev, next) {
		if (name) {
			var element = $(document.createElement('span')).addClass(this.params.classPrefix + name);
			element.addClass(this.elementType(name, prev, next));
			return element;
		}
	};
	this.elementType = function(char, prev, next) {
		return "";
	};

	this.constructor();
}
var jqcwritterReader = function(object, code, params) {
	this.object = $(object);
	this.code = code;
	this.colors = params.colors;
	this.speed = params.speed;
	this.params = params;
	this.interval = null;
	this.codeParser = null;

	this.constructor = function() {

		this.object.text("");
		this.codeParser = new jqcwritterCodeParser(this.code, this.params);
		this.doIntervals(this.interval, this.object, this.codeParser);
		this.createStyle();
	};
	this.doIntervals = function(interval, object, parser) {
		var me = this;
		if (interval) {
			clearTimeout(interval);
		}
		if (parser.hasNext(object)) {
			interval = setTimeout(function() {
				object.append(parser.next());
				me.doIntervals(interval, object, parser);
                                        if(me.params.keepscroll){
                                             object[0].scrollTop = object[0].scrollHeight;
                                        }
			}, me.newTimespan());
		}
	};
	this.newTimespan = function() {
		return Math.ceil(Math.round((Math.random() * 100) * 3) / Math.round(this.speed));
	};
	this.createStyle = function() {
		var head = document.head || document.getElementsByTagName('head')[0];
		var style = document.createElement('style');
		style.type = 'text/css';
                    var css = "";
                    css += ".jqcw > span{font-family:sans-serif;min-width:5px;min-height:5px;display:inline-block;float:left;font-size:"+this.params.fontsize+"}";
		for (var i in this.params.css) {
			css += "." + this.params.classPrefix + i + "{ ";
                              if(i==="tab"){
                                  this.params.css[i]["width"] = this.params.tabsize;
                              }
                              if(i==="break"){
                                  this.params.css[i]["height"] = this.params.breaksize;
                              }
			for (var j in this.params.css[i]) {
				css += j + ":" + this.params.css[i][j] + ";"
			}
			css += "}";
			
		}
                    if (style.styleSheet) {
				style.styleSheet.cssText = css;
			} else {
				style.appendChild(document.createTextNode(css));
			}
		head.appendChild(style);
	};

	this.constructor();
};

var jqcwritterRemote = {
	isURL : function(string) {
		return string.match(/(\/?[\w-]+)(\/[\w-]+)*\/?|(((http|ftp|https):\/\/)?[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?)/gi);
	},
	ajax : function(object, url, params) {

		$.ajax(url, {
			type : params.ajaxMethod,
			data : params.ajaxData,
			dataType : 'text',
			success : function(data) {
				new jqcwritterReader(object, data, params);
			},
			complete : function(d) {
			}
		});
	}
};

($ || JQuery).fn.codewritter = function(source, params) {
	if (!params) {
		params = {};
	}
	params = $.extend(params, jqcWritterDefaults);
          $(this).addClass("jqcw");
	if (jqcwritterRemote.isURL(source)) {
		jqcwritterRemote.ajax(this, source, params);
	} else {
		new jqcwritterReader(this, source, params);
	}
        
          
}
