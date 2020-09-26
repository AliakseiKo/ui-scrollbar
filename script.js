const msgV = document.querySelector('.msgV');

const inputV = msgV.querySelector('.message-input');
const trackV = msgV.querySelector('.scrollbar__track');
const backBtnV = msgV.querySelector('.scrollbar__button_top');
const forwardBtnV = msgV.querySelector('.scrollbar__button_bottom');

const scrollBarV = new ScrollBar(inputV, trackV, {
  backButton: backBtnV,
  forwardButton: forwardBtnV
});



const msgH = document.querySelector('.msgH');

const inputH = msgH.querySelector('.message-input');
const trackH = msgH.querySelector('.scrollbar__track');
const backBtnH = msgH.querySelector('.scrollbar__button_left');
const forwardBtnH = msgH.querySelector('.scrollbar__button_right');

const scrollBarH = new ScrollBar(inputH, trackH, {
  backButton: backBtnH,
  forwardButton: forwardBtnH,
  horizontal: true
});
