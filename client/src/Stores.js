import Reflux from 'reflux';
import Actions from './Actions'

class GuestStore extends Reflux.Store
{
	constructor()
	{
		super();
		this.state = {messages: this.getMessages()};
		this.listenables = Actions;
		//console.log(this.getMessages());
	}

	getMessages(){
		var messages = localStorage.getItem('messages');
		if(messages){
			return JSON.parse(messages);
		} else {
			return [];
		}
	}

	setMessages(messages){
		var messagesJSON = JSON.stringify(messages);
		localStorage.setItem('messages',messagesJSON);
	}
	
	onSubmit(email, messageBody)
	{
		console.log(this.state)
		const message = {
			email: email,
			text: messageBody
		};

		var messages = this.getMessages();
		messages.push(message);
		this.setMessages(messages);
        this.setState((prevState, props)=>{
            return {messages: messages};
        });
	}
	
}

export default GuestStore;