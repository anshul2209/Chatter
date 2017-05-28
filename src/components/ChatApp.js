import React from 'react';
import ReactDOM from 'react-dom';
import io from 'socket.io-client'
// require('../styles.chatapp.css');
let socket;
if (typeof window !== 'undefined') {
    socket = io(window.location.origin);
}
export default class ChatApp extends React.Component {
  constructor(props){
  	super(props);
  	this.state = {
  		inputvalue: '',
      friendList: [ 'Alex', 'Bob', 'Kathy', 'Derek'],
  		friend: '',
      allMessages: [],
      username: '',
      searchText: ''
  	}
  }
  scrollToBottom(){
    const node = ReactDOM.findDOMNode(this.messagesEnd);
    node.scrollIntoView({behavior: "smooth"});
  }
  componentDidMount(){
    const that = this;
    socket.on('sendAllMessages', this.setAllMessages.bind(this));
    let username = prompt('Select a username? (Alex, Bob, Kathy, Derek)');
    if(username){
      this.setState({
        username: username
      });
      socket.emit('join', username); 
    }
    this.scrollToBottom();
  }
  componentDidUpdate() {
      this.scrollToBottom();
  }
  setFriend(friendname){
    socket.emit('getAllMessages', { 'from': this.state.username, 'to': friendname});
    this.setState({
      friend: friendname
    });
  }
  setAllMessages(data){
    this.setState({
      allMessages: data.messages
    });
  }
  handleInput(event){
  	event.preventDefault();
  	const value = event.target.value;
  	this.setState({
  	  inputvalue: value
  	});
  }
  handleSubmit(event){
  	event.preventDefault();
  	let input = this.state.inputvalue;
    if(input){
      var messageObj = {
        from: this.state.username,
        to: this.state.friend,
        message: input
      }
      socket.emit('client_message', messageObj );
      this.setState({
        inputvalue: ''
      });
    }
  }
  searchHandler(event) {
    event.preventDefault();
    const searchText = event.target.value;
    this.setState({
      searchText: searchText
    });
  }
  render() {
    const messagesData = this.state.allMessages;
    const messages = messagesData.map((message, index)=>{
      return(
        <div className={ message.from === this.state.username ? 'messageWrapper right': 'messageWrapper left'} key={index}>
          <span>{message.from}</span>
          <p>{message.message}</p>
        </div> 
      );
    });
    const friends = this.state.friendList.filter((friend)=>{
      return ((friend.toLowerCase().indexOf(this.state.searchText.toLowerCase()) !== -1) && (friend !== this.state.username));
    }).map((friend, index)=>{
      return(
        <div className={'wrapper'} key={index} onClick={this.setFriend.bind(this,friend)}>
          <p>{friend}</p>
        </div>
      );
    });
    return (
      <div className={'appWrapper'}>
        <div className={'showFriends'}>
          <div className={'searchSection'}>
            <input type="text" placeholder= "Search..." value={this.state.searchtext} onChange={this.searchHandler.bind(this)} />
          </div>
          { friends }
        </div>
        <div className={'chatSectionWrapper'}>
          <div className={ (this.state.username && !this.state.friend) ? 'startMessage' : 'none'}>
            <p>Select a friend on the left to start a chat</p>
          </div>
          <div className={ this.state.friend ? 'friendNameSection' : 'none'}>
            <p>Chatting with {this.state.friend}</p>
          </div>
          <div className={'displayMessages'}>
            { messages }
            <div style={ {float:"left", clear: "both"} } ref={(el) => { this.messagesEnd = el; }}></div>
          </div>
          <form className={ this.state.friend ? 'formWrapper' : 'none'} onSubmit={this.handleSubmit.bind(this)}>
            <input type="text" placeholder="Type a message" value={this.state.inputvalue} onChange={this.handleInput.bind(this)}/>
            <button onClick={this.handleSubmit.bind(this)}>Submit</button>
          </form>
        </div>
      </div>
    );
  }
}
