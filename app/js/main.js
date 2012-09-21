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
		content: "0" 
	});
	
	App.ready = function() {
		var renderedButtons = []; // Set of rendered buttons
		for (var i = 0; i < buttonLabels.length; i++) {
			classMap[i].push('calc-button');
			renderedButtons.push(Ember.View.extend({
				templateName: 'calc-button-template',
				label: buttonLabels[i],
				cssClasses: classMap[i].join(' '),
				click: function(event) {
					var text = $(event.target).text();
					App.controller.set('content', text);
				}
			}));
		}
		
		em.View.create({
			templateName: 'main-template',
			header: em.View.extend({
				templateName: 'calc-screen-template',
				valBinding: "App.controller.content"
			}),
			body: em.View.extend({
				templateName: 'calc-body-template',
				button: renderedButtons
			})
		}).append();
	}
	
	return App;	
	
})(jQuery, Ember);