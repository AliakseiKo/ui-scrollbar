const messageInput = document.querySelector('.message-input');
const messageInputScrollbar = document.querySelector('.message-input-scrollbar .scrollbar__track');

const backBtn = document.querySelector('.scrollbar__button_back');
const forwardBtn = document.querySelector('.scrollbar__button_forward');

const scrollBar = new ScrollBar(messageInput, messageInputScrollbar, {
  backButton: backBtn,
  forwardButton: forwardBtn
});
