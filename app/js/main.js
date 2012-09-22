// Issues
// 1. Last symbol must be overwritten when a new symbol is added to the buffer
// before another number so that our stack can be held to a maximum size of three
// always. We only support single/double operands for now anyway.
// 2. Need for unit tests. jUnit maybe?

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
    screenLabel: "0",
    clearLabel: "ac",
  });

  App.SYMBOL = 'symbol',
  App.NUMBER = 'number',

  /* Arithmatic Logic Unit of this program */
  App.alu = em.Object.create({
    // Stack size
    stack: [],
    maxStackSize: 2,
    currentStackSize: 0,
    // Precision
    maxPrecision: 10,

    // Observers
    stackLengthObserver: function() {
      if (this.countNumInStack() > 1) {
        // Flip the label of the "AC" button.
        App.controller.set('clearLabel', "c");
      }
    }.observes('currentStackSize'),

    // Basic math API
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

    // Stack operations
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

    countNumInStack: function() {
      return this.stack.filter(function(n) {
        return n && (n.type == App.NUMBER);
        }).length;
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

    popLastNumFromStack: function() {
      number = false;
      do {
        try {
          elem = this.popFromStack();
          if (elem.type == App.NUMBER) {
            number = true;
          }
        } catch (e) {
          break;
        }
        } while (number === false);
      },

      popLastSymbolFromStack: function() {
        // Keep popping until the last symbol is removed.
      },

      emptyStack: function() {
        this.set('stack', []);
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
          push = false;

          if (sym.value == "+") {
            ret = this.add(p.value, q.value);
            push = true;
          }
          else if (sym.value == "-") {
            ret = this.subtract(q.value, p.value);
            push = true;
          }
          else if (sym.value == "x") {
            ret = this.multiply(p.value, q.value);
            push = true;
          }
          else if (sym.value == "/") {
            try {
              ret = this.divide(q.value, p.value);
              push = true;
            } catch (e) {
              alert(e);
              push = false;
            }
          }

          if (push !== false) {
            this.pushToStack(ret, App.NUMBER);
            return ret;
          }
          else {
            return push;
          }
        }
      }
  });

  App.ready = function() {
    var renderedButtons = []; // Set of rendered buttons
    for (var i = 0; i < buttonLabels.length; i++) {
      classMap[i].push('calc-button');
      var opts = {
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
            App.controller.set('screenLabel', disp);
          }
          else if ($t.hasClass('btn-action')) {
            var act = $.trim($t.text());
            switch (act) {
              case "+":
              case "-":
              case "x":
              case "/":
              case "+/-":
              case "=":
              ret = alu.processStack();
              if (ret !== false) {
                disp = ret;
              }
              break;
            }
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
                break;
              case "ac":
                alu.emptyStack();
                disp = "0";
                break;
              case "c":
                // Flip label back to ac
                App.controller.set('clearLabel', "ac");
                // Keep popping till the last stack element that is a number is popped
                alu.popLastNumFromStack();
                disp = '0';
                break;
            }
            if (disp) {
              App.controller.set('screenLabel', disp);
            }
          }
       }
    };
    if (buttonLabels[i] == "c") {
      opts.labelBinding = "Calculator.controller.clearLabel";
    }
    renderedButtons.push(em.View.extend(opts));
  }

  em.View.create({
    templateName: 'main-template',
    header: em.View.extend({
      templateName: 'calc-screen-template',
      valBinding: "Calculator.controller.screenLabel"
      }),
      body: em.View.extend({
        templateName: 'calc-body-template',
        button: renderedButtons
      })
    }).append();
  }

  return App;	

})(jQuery, Ember);