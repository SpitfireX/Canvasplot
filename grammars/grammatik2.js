{
	var variables = [];
}

Input "input"
  = head:Header _ "=" _ expr:Expression { return expr; }

Header "header"
  = Name _ "(" _ vars:((Vard/"") (_ "," _ Vard)*) _ ")" {
    if (vars[0] === "" && vars[1].length > 0) {
    	error("Leading comma in argument list.");
    }
  }

Expression "expression"
  = head:Term tail:(_ ("+" / "-") _ Term)* {
	return function(){
    	var result = head.apply(this, arguments), i;

      	for (i = 0; i < tail.length; i++) {
        	if (tail[i][1] === "+") { result += tail[i][3].apply(this, arguments); }
        	if (tail[i][1] === "-") { result -= tail[i][3].apply(this, arguments); }
      	}

		return result;
    }
  }

Term "term"
  = head:Exponation tail:(_ ("*" / "/") _ Exponation)* {
	return function(){
		var result = head.apply(this, arguments), i;
		
      	for (i = 0; i < tail.length; i++) {
        	if (tail[i][1] === "*") { result *= tail[i][3].apply(this, arguments); }
        	if (tail[i][1] === "/") { result /= tail[i][3].apply(this, arguments); }
      	}

    	return result;
    }
  }

Exponation "exponation"
  = head:Unary tail:(_ "^" _ Unary)* {
    var exp = [head];
    tail.forEach(function(e){
    	exp.push(e[3]);
    });
    
	return function(){
    	var results = []
        for(var i = 0; i < exp.length; i++){
        	results[i] = exp[i].apply(this, arguments);
        }
        
        if (results.length > 1) {
            for(var i = results.length-2; i >= 0; i--){
        		results[i] = Math.pow(results[i], results[i+1]);
        	}
    	}
    
    	return results[0];
    }
  }

Unary "unary"
  = "-" fac:Factor {
  	return function(){
    	return -fac.apply(this, arguments);
    }
  }
  / fac:Factor {
	 return function(){
    	return fac.apply(this, arguments);
    } 
 }

Factor "factor"
  = Const
  / Func
  / "(" _ expr:Expression _ ")" { return expr; }
  / Real
  / Integer
  / Var

Const "constant"
  = [A-Z] ([A-Z] / [0-9] / "_")* {
  	var c = text();
	var result = Math[c];
	if(result){
    	return function(){ return result; };
    } else {
        error( "\"" + c + "\" is not a valid constant.");
    }
  }

Func "function"
  = name:Name "(" _ expr:Expression* expr2:(_ "," _ Expression)* _ ")" {
    var args = expr;
    expr2.forEach(function(arg){
    	args.push(arg[2]);
    });
    try {
       	return function(){
        	var results = []
            for (var i = 0; i < args.length; i++){
            	results[i] = args[i].apply(this, arguments);
            }
        	return Math[name].apply(this, results);
        };
    } catch  (err) {
        error( "\"" + name + "\" is not a valid function.");
    }
  }

Vard "variable declaration"
  = [a-z] {
	if (variables.indexOf(text()) > -1){
    	error("Variable \"" + text() + "\" already in use.");
    } else {
    	variables.push(text());
        return(text());
    }
  }

Var "variable"
  = [a-z] {
  	var i = variables.indexOf(text());
	if (i > -1){
    	return function(){
        	return arguments[i];
        };
    } else {
    	error("Variable \"" + text() + "\" not defined.");
    }
  }

Name "identifier"
  = [a-z] ([a-z]i / [0-9])* {return text(); }

Real "number"
  = left:Integer "." right:Integer{ 
	var result = parseFloat(left + "." + right);
    return function(){ return result; };
  }

Integer "integer"
  = [0-9]+ {
  	var result = parseInt(text(), 10);
    return function(){ return result; };
  }

_ "whitespace"
  = [ \t\n\r]*