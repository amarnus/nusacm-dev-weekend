var ENV = {
  CP_DEFAULT_CACHEABLE: true
};

(function($, em) {
	
	// A Stack implementated as an Ember object.
	var Stack = em.Object.extend({
		
		_stack: [],
		stackLength: null,
		
		stackObserver: function(oldObject, key, value) {
			console.log(key);
			console.log(value);
			this.set('stackLength', this.get('_stack').get('length'));
		}.observes('_stack'),
		
		popElem: function() {
			return this.get('_stack').pop();
		},
		
		pushElem: function(elem) {
			this.get('_stack').push(elem);
		},
		
		dump: function() {
			console.log(this.get('_stack'));
		}
		
	});
	
	var CalculatorApp = em.Application.create({
		version: '0.1',
		ready: function() {
			var stack = Stack.create();
			stack.set('_stack', ['1', '2', '3', '4']);
			var s = stack.get('_stack').push(5);
			stack.notifyPropertyChange('_stack');
			console.log(stack.get('_stack').get('length'));
			// stack.pushElem('5');
			// console.log(stack.get('stackLength'));
			// console.log(stack.get('_stack').get('length'));
			// stack.popElem();
			// stack.dump();
		}
	});
	
})(jQuery, Ember);