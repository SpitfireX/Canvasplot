{
	var variables = [];
}

Input "input"
  = head:Header _ "=" _ expr:Expression { return expr; }

Header "header"
  = name:Name _ "(" _ args:((Vard/"") ("," _ Vard)*) _ ")"

Expression "expression"
  = head:Term tail:(_ ("+" / "-") _ Term)* {
      var result = head, i;

      for (i = 0; i < tail.length; i++) {
        if (tail[i][1] === "+") { result += tail[i][3]; }
        if (tail[i][1] === "-") { result -= tail[i][3]; }
      }

      return result;
    }

Term "term"
  = head:Exponation tail:(_ ("*" / "/") _ Exponation)* {
      var result = head, i;

      for (i = 0; i < tail.length; i++) {
        if (tail[i][1] === "*") { result *= tail[i][3]; }
        if (tail[i][1] === "/") { result /= tail[i][3]; }
      }

      return result;
    }

Exponation "exponation"
  = head:Unary tail:(_ "^" _ Unary)* {
    var exp = [head];
    tail.forEach(function(e){
    	exp.push(e[3]);
    });
	
    if (exp.length > 1) {
    	for(var i = exp.length-2; i >= 0; i--){
        	exp[i] = Math.pow(exp[i], exp[i+1]);
        }
    }
    
    return exp[0];
  }

Unary "unary"
 = "-" fac:Factor { return -fac; }
 / fac:Factor { return fac; }

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
    	return result;
    } else {
        error( "\"" + c + "\" is not a valid constant.");
    }
  }

Func "function"
  = name:Name "(" expr:Expression* expr2:("," _ Expression)* ")" {
    var args = expr;
    expr2.forEach(function(arg){
    	args.push(arg[2]);
    });
    try {
       	return Math[name].apply(this, args);
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
    }
  }

Var "variable"
  = [a-z] {
  	var i = variables.indexOf(text());
	if (i > -1){
    	return text();
    } else {
    	error("Variable \"" + text() + "\" not defined.");
    }
  }

Name "identifier"
  = [a-z] ([a-z]i / [0-9])* {return text(); }

Real "number"
  = left:Integer "." right:Integer{ return parseFloat(left + "." + right)}

Integer "integer"
  = [0-9]+ { return parseInt(text(), 10); }

_ "whitespace"
  = [ \t\n\r]*