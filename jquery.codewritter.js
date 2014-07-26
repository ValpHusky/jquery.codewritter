
// String code
var jqcwritterCodeParser = function(code){
	this.code = code;
	this.preCode = "";
	//this.postCode = "";
	this.counter = 0;
	
	
	this.next = function(){
		var extracted = this.code.substring(this.counter,1);
		this.counter++;
		this.preCode += extracted;
		//this.postCode = this.code.substring(this.counter,this.code.length);
		return extracted; 
	};
	this.hasNext = function(){
		var has = (this.code.indexOf(this.counter)!=-1)?true:false;
		return has;
	};
}


var jqcwritterReader = function(object,code,colors,speed){
	this.object = $(object);
	this.code = code;
	this.colors = colors;
	this.speed = speed;
	this.interval = null;
	this.codeParser = null;
	
	this.constructor = function(){
		this.object.text("");
		this.codeParser = new jqcwritterCodeParser(this.code);
		this.doIntervals(this.interval,this.object,this.codeParser);
	};
	this.doIntervals = function(interval,object,parser){
		var me = this;
		if(interval){
			clearTimeout(interval);
		}
		if(parset.hasNext()){
			interval = setTimeout(function(){
				object.append(parser.next());
				me.doIntervals(interval,object,parser);
			},me.newTimespan());
		}
	}
	this.newTimespan = function(){
		return Math.ceil(Math.round((Math.random()*1000)*3)/Math.round(this.speed));
	}
	
	this.constructor();
}
