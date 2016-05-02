var Botkit = require('botkit');
var os = require('os');
var config = require('./config');
var data = require('./data');

var controller = Botkit.facebookbot({
    debug: true,
    access_token: config.page_token,
    verify_token: config.verify_token
});

var bot = controller.spawn({
});

controller.setupWebserver(process.env.port || 3000, function(err, webserver) {
    controller.createWebhookEndpoints(webserver, bot, function() {
        console.log('ONLINE!');
    });
});

controller.hears(['hello', 'hi'], 'message_received', function(bot, message) {


    controller.storage.users.get(message.user, function(err, user) {
        if (user && user.name) {
            bot.reply(message, 'Hello ' + user.name + '!!');
        } else {
            bot.reply(message, 'Hello.');
        }
    });
});

var askForOrder = function(response, convo) {	
	var strd_ask_for_order = {
		'attachment': {
			'type': 'template',
			'payload': {
				'template_type': 'buttons',
				'text': 'Do you want to order some food? You can either select following options or answer by yes or no!',
				'buttons': [					
                    {
                        'type': 'postback',                        
                        'title': 'Pick me anything!',
                        'payload': 'AS_RANDOM_PICK'
                    },
                    {
                        'type': 'postback',
                        'title': 'Show me what you got!',
                        'payload': 'AS_SHOW_DISHES'
                    },
                    {
                        'type': 'postback',
                        'title': 'I do not want anything',
                        'payload': 'AS_SHOW_DISHES'
                    }
				]
			}
		}
	}

	convo.ask();
}

var doubleCheckSelection = function(response, convo, dish_key) {
	var dish_info = data['dishes'][dish_key];
	var strd_double_check = {
		'attachment': {
			'type': 'template',
			'payload': {
				'template_type': 'generic',
				'text': 'We have selected for you following meal, let us know what you think!',
				'elements': [					
                    'title': dish_info['title'],
					'image_url': dish_info['image_url'],
					'subtitle': dish_info['subtitle'],					
					'buttons': [
						{
							'type': 'postback',
                            'title': 'I will take this',
                            'payload': 'ORDER_' + dish_key
						},
						{
							'type': 'postback',
                            'title': 'I will pick myself then',
                            'payload': 'AS_SHOW_DISHES'
						}
					]
				]
			}
		}
	}

	convo.ask();
}

var showDishList = function(response, convo) {
	function buildDishesPayload(dishes) {
		var elements = [];
		for (var dish_info in dishes) {
			if (dishes.hasOwnProperty(dish_info)) {
				var dish_info = dishes[dish_info];

				var element = {
					'title': dish_info['title'],
					'image_url': dish_info['image_url'],
					'subtitle': dish_info['subtitle'],					
					'buttons': [
						{
							'type': 'web_url',
                            'url': dish_info['web_url'],
                            'title': 'View ' + dish_info['title']
						},
						{
							'type': 'postback',
                            'title': 'order ' + dish_info['title'],
                            'payload': 'ORDER_' + disk_key
						}
					]
				};

				elements.push(element);
			}
		}

		return elements;
	}

	var strd_show_dish_list = {
		'attachment': {
			'type': 'template',
			'payload': {
				'template_type': 'generic',
				'text': 'Do you want to order some food? You can either select following options or answer by yes or no!',
				'elements': buildDishesPayload(data['dishes']);
			}
		}
	}

	convo.ask();
}


var showReceipt = function(response, convo, dish_key) {
	var dish_info = data['dishes'][dish_key];
	var generateReceiptPayload = function(dish_key, username) {
		var strd_receipt = {
			'attachment': {
				'type': 'template',
				'payload': {
					'template_type': 'receipt',
					'recipient_name': username,
			        'order_number':'12345678902',
			        'currency':'USD',
			        'payment_method':"Visa 2345 (don't worry, random number!",        
			        'order_url':'http://www.google.com',
			        'timestamp':'1428444852',
			        'elements': [			        	
         				{
				            'title': dish_info['title'],
				            'subtitle': dish_info['subtitle'],
				            'quantity':1,
				            'price':50,
				            'currency':'USD',
				            'image_url': dish_info['image_url']
				        }
			        ],
			        'address':{
			          'street_1':'1 Hacker Way',
			          'street_2':'',
			          'city':'Menlo Park',
			          'postal_code':'94025',
			          'state':'CA',
			          'country':'US'
			        },
			        'summary':{
			          'subtotal':75.00,
			          'shipping_cost':4.95,
			          'total_tax':6.19,
			          'total_cost':56.14
			        },
			        'adjustments':[
			          {
			            'name':'New Customer Discount',
			            'amount':20
			          },
			          {
			            'name':'$10 Off Coupon',
			            'amount':10
			          }
			        ]
				}
			}
		}

		return strd_receipt;
	}

	controller.storage.users.get(message.user, function(err, user) {
		var username = '';
        if (user && user.name) {
            username = user.name;
        } else {
            username = 'Someone';
        }

        convo.ask();
    });

}



// Handle postback, received when press postback button from structured message
controller.on('facebook_postback', function(bot, message) {

    // if (message.payload == 'AS_RANDOM_PICK') {
    //     bot.reply(message, 'You ate the chocolate cookie!')
    // }
    switch (message.payload) {
    	case 'AS_RANDOM_PICK':
    		break;
    	case 'AS_SHOW_DISHES':
    		break;
    	default:
    		break;
    }

});


controller.on('message_received', function(bot, message) {
    bot.reply(message, 'Try: `what is my name` or `structured` or `call me captain`');
    return false;
});