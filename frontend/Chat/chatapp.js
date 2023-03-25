///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Get DOM elements
const chatForm = document.getElementById('chat-form');
const chatMessageInput = document.getElementById('chat-message');
const userList = document.getElementById('user-list');
const chatMessages = document.getElementById('chat-messages');
const createGroupForm = document.querySelector('#create-group-form');
const groupNameInput = document.querySelector('#group-name');
const membersInput = document.querySelector('#members');
const groupsList = document.querySelector('#groups');

// Function to parse JWT token
function parseJwt(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    window.atob(base64)
      .split('')
      .map((c) => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join('')
  );
  return JSON.parse(jsonPayload);
}

// Function to add a chat message to local storage and display it on the screen
function addChatMessageToLocalAndScreen(name, text) {
  const obj = { name, text };
  const date = new Date().getTime(); // Get current timestamp
  localStorage.setItem(date, JSON.stringify(obj)); // Store chat message with timestamp as key
  
  // Remove oldest chat message if there are more than 10 saved
  let oldestKey=localStorage.key(0);
  if (localStorage.length > 11) {
    for(let i=1;i<localStorage.length;i++){
      if(localStorage.key(i)<oldestKey){
        oldestKey=localStorage.key(i);
      }   
    } // Get key of oldest chat message
    localStorage.removeItem(oldestKey); // Remove oldest chat message from localStorage
  }
  
  // Display the new chat message on screen
  const chatMessageElement = document.createElement('div');
  chatMessageElement.textContent = `${name}: ${text}`;
  chatMessages.appendChild(chatMessageElement);
}

// Event listener for sending chat messages
chatForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  
  const token = localStorage.getItem('token');
  const decodedToken = parseJwt(token);
  
  const message = { text: chatMessageInput.value };
  
  // Add chat message to local storage and screen
  addChatMessageToLocalAndScreen(decodedToken.name, chatMessageInput.value);
  
  // Send chat message to the server
  const response = await axios.post('http://localhost:3000/users/chat', message, { headers: { 'Authentication': token } });
  
  chatMessageInput.value = ''; // Clear the chat message input field
});

// Function to display a group on the screen
function displayGroup(groupName, groupId) {
  const groupElement = document.createElement('li');
  groupElement.textContent = groupName;
  groupElement.addEventListener('click', () => {
    localStorage.setItem('groupId', groupId);
    window.location.href = './groupchat.html';
  });
  groupsList.appendChild(groupElement);
}

// Function to display a list of groups on the screen
function displayGroups(groups) {
  groupsList.innerHTML = ''; // Clear the list of groups
  groups.forEach((group) => {
    displayGroup(group.groupName, group.groupId);
  });
}

// Function to get the list of groups from the server and display them on the screen
async function getGroups() {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get('http://localhost:3000/users/getgroupname', { headers: { 'Authentication': token } });
    const groups = response.data.groupDetails;
    displayGroups(groups);
  } catch (error) {
    console.log(error)
  }
}


async function insideGroup(id){
  try{
     localStorage.setItem("groupId",id)
      window.location.href="./groupchat.html"
  }catch(err){
      console.log("error in inside group FE",err)
  }

}

async function getusers(){
  const response = await axios.get("http://localhost:3000/users/signup");
  const userlist=response.data.users;
  userlist.forEach((user) => {
    const userElement = document.createElement('div');
    userElement.textContent = user.name+" joined";
    userList.appendChild(userElement);
  });
  }


  async function getmessages(){
    let newKey=localStorage.key(0);
    for(let i=1;i<localStorage.length;i++){
        if(localStorage.key(i)<newKey){
       newKey=localStorage.key(i);
      }
      
    }
  }


  function startUpdatingMessages() {
    // Clear any previous interval
    clearInterval(intervalId);
    
    // Set new interval to call the function every 1 second
    intervalId = setInterval(getmessages, 1000);
  }
  
   //startUpdatingMessages();


   createGroupForm.addEventListener('submit', async(event) => {
      event.preventDefault();
      let grpinformation = {
        groupName: groupNameInput.value,
        members: membersInput.value.split(',').map(name => name.trim())
      };
      
      if (groupNameInput.value && membersInput.value) {
        try {
           const token= localStorage.getItem('token');
           const response = await axios.post("http://localhost:3000/group/creategrp",grpinformation ,{headers: {'Authentication' :token}});
             console.log(response.data.groupid) ;
          if (response.status==201) {
            // Add new group to list of groups
            const parent=document.querySelector('#groups');
           
                let child=`<li onclick="insideGroup(${response.data.groupid}); getgroups()">${groupNameInput.value}</li>`
        
                parent.innerHTML=parent.innerHTML+child
                
             
            // Close modal and clear form inputs
           // closeModal();
            groupNameInput.value = '';
            membersInput.value = '';
          
          }
          else if(response.status==202){
            groupNameInput.value = '';
            membersInput.value = '';
           alert('You are not admin of the group,you can not add the user to the group')
          }
           else {
            groupNameInput.value = '';
            membersInput.value = '';
            throw new Error(response.message);
          }
        } catch (error) {
          alert(error.message);
        }
      } else {
        alert('Please fill out all fields.');
      }
    });
  