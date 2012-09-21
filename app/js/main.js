Calculator = (function($, em) {
	
	// http://stackoverflow.com/questions/9160966/is-there-an-alternate-to-metamorph-script-tags-in-ember-js
	// http://emberjs.com/documentation/
	var buttonLabels = [
	  'c', '+/-', '/', 'x',
	  '7', '8', '9', '-',
	  '4', '5', '6', '+',
	  '1', '2', '3', '=',
	  '0', '.'
	];
	
	var classMap = [
	  ['clear', 'btn-action'], ['sign', 'btn-action'], ['divide', 'btn-action'], ['multiply', 'btn-action'],
	  ['seven', 'btn-number'], ['eight', 'btn-number'], ['nine', 'btn-number'], ['subtract', 'btn-action'],
	  ['four', 'btn-number'], ['five', 'btn-number'], ['six', 'btn-number'], ['add', 'btn-action'],
	  ['one', 'btn-number'], ['two', 'btn-number'], ['three', 'btn-number'], ['equals', 'btn-action'],
	  ['zero', 'btn-number'], ['decimal', 'btn-action']
	];
	
	var App = em.Application.create();

	App.controller = em.Object.create({
		content: "0",
		clearVal: "ac",
	});
	
	App.SYMBOL = 'symbol',
	App.NUMBER = 'number',
	
	App.alu = em.Object.create({
		// Stack size
	  stack: [],
		maxStackSize: 2,
		currentStackSize: 0,
		// Precision
		maxPrecision: 10,
		stackLengthObserver: function() {
			if (this.get('stack') > 1) {
				App.controller.set('clearVal', 'c');
			}
		}.observes('stack'),
		add: function(n1, n2) {
			return (n1 + n2);
		},
		subtract: function(n1, n2) {
			return (n1 - n2);
		},
		multiply: function(n1, n2) {
			return (n1 * n2);
		},
		divide: function(n1, n2) {
			if (n2 === 0) {
				throw new Ember.Error("Cannot divide by zero.");
			}
			return (n1 / n2);
		},
		changeSign: function(n) {
			return n * -1;
		},
		appendTo: function(n) {
			stack = this.get('stack');
			try {
				val1 = this.popFromStack();
			} catch (e) {
				// Empty stack
				val1 = { value: 0, type: App.NUMBER };
			}
			val2 = n + (10 * val1.value);
			this.pushToStack(val2, App.NUMBER);
		},
		peekStack: function() {
			stack = this.get('stack');
			if (stack.length !== 0) {
				len = stack.length;
				return stack[len - 1];
			}
		},
		pushToStack: function(n, type) {
			stack = this.get('stack');
			stack.push({
				value: n,
				type: type
			});
			this.set('stack', stack);
			this.set('currentStackSize', this.get('currentStackSize') + 1);
		},
		popFromStack: function() {
			stack = this.get('stack');
			if (stack.length === 0) {
				throw new Ember.Error("Cannot pop from an empty stack.");
			}
			ret = stack.pop();
			this.set('stack', stack);
			this.set('currentStackSize', this.get('currentStackSize') - 1);
			return ret;
		},
		processStack: function() {
			size = this.get('currentStackSize');
			if (size < 3) {
				return false;
			}
			else {
				var p = this.popFromStack();
				var sym = this.popFromStack();
				var q = this.popFromStack();
				if (sym.value == "+") {
					ret = this.add(p.value, q.value);
					this.pushToStack(ret, App.NUMBER);
					return ret;
				}
				else if (sym.value == "-") {
					ret = this.subtract(q.value, p.value);
					this.pushToStack(ret, App.NUMBER);
					return ret;
				}
				else if (sym.value == "x") {
					ret = this.multiply(p.value, q.value);
					this.pushToStack(ret, App.NUMBER);
					return ret;
				}
				else if (sym.value == "/") {
					try {
					  ret = this.divide(q.value, p.value);
					  this.pushToStack(ret, App.NUMBER);
					  return ret;
					} catch (e) {
						alert(e);
					}
				}
			}
		}
	});
	
	App.ready = function() {
		var renderedButtons = []; // Set of rendered buttons
		for (var i = 0; i < buttonLabels.length; i++) {
			classMap[i].push('calc-button');
			renderedButtons.push(em.View.extend({
				templateName: 'calc-button-template',
				label: buttonLabels[i],
				cssClasses: classMap[i].join(' '),
				click: function(event) {
					$t = $(event.target);
					var text = $t.text();
				  var alu = App.get('alu');
					if ($t.hasClass('btn-number')) {
						var n = parseInt($t.text());
						var disp = App.controller.get('content');
						var popped = alu.peekStack();
						if (popped && (popped.type == App.NUMBER) && (alu.get('currentStackSize') >= 1)) {
							alu.appendTo(n);
							elem = alu.peekStack();
							disp = elem.value;
						}
						else {
							alu.pushToStack(n, App.NUMBER);
							disp = n;
						}
						App.controller.set('content', disp);
					}
					else if ($t.hasClass('btn-action')) {
						var act = $.trim($t.text());
						switch (act) {
							case "+/-":
							  var val = alu.peekStack();
							  if (val && val.type == App.NUMBER) {
								  val2 = alu.changeSign(val.value);
								  alu.popFromStack();
							    alu.pushToStack(val2, App.NUMBER);
							    disp = val2;
						    }
							  break;
							case "+":
							  alu.pushToStack('+', App.SYMBOL);
							  break;
							case "-":
							  alu.pushToStack('-', App.SYMBOL);
							  break;
							case "x":
								alu.pushToStack('x', App.SYMBOL);
								break;
							case "/":
							  alu.pushToStack('/', App.SYMBOL);
							  break;
							case "=":
							  var ret = alu.processStack();
							  if (ret !== false) {
								  disp = ret;
							  }
							  break;
							case "c":
							  // Remove last number added from the end.
							  break;
						}
						if (disp) {
						  App.controller.set('content', disp);
					  }
					}
				}
			}));
		}
		
		em.View.create({
			templateName: 'main-template',
			header: em.View.extend({
				templateName: 'calc-screen-template',
				valBinding: "Calculator.controller.content"
			}),
			body: em.View.extend({
				templateName: 'calc-body-template',
				button: renderedButtons
			})
		}).append();
	}
	
	return App;	
	
})(jQuery, Ember);