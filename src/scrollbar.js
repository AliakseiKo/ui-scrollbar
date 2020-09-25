import { getMatrix, setMatrix, animate } from './utils.js';

class ScrollBar {
  constructor(target, track, {
    backButton,
    forwardButton,
    selector = '.scrollbar__thumb',
    minThumbSize = 17
  } = {}) {
    this.SCROLL_STEP_RATIO = 0.875;

    this.target = target;
    this.track = track;
    this.thumb = track.querySelector(selector);
    this.backButton = backButton;
    this.forwardButton = forwardButton;

    this.minThumbSize = minThumbSize;

    this.trackStyle = window.getComputedStyle(track);

    this.addedSize = 0;
    this.mouseControl = false;
    this.cachedScrollHeight;
    this.thumbHeight;

    this._updateTrackState();
    this._updateButtonsState();

    this._scrollHandler = this._scrollHandler.bind(this);
    this._mousedownThumbHandler = this._mousedownThumbHandler.bind(this);
    this._mousedownTrackHandler = this._mousedownTrackHandler.bind(this);

    this.target.addEventListener('scroll', this._scrollHandler);
    this.track.addEventListener('mousedown', this._mousedownTrackHandler);
    this.thumb.addEventListener('mousedown', this._mousedownThumbHandler);

    if (this.backButton) {
      this._mousedownBackButtonHandler = this._mousedownButtonHandler.bind(this, -1);
      this.backButton.addEventListener('mousedown', this._mousedownBackButtonHandler);
    }

    if (this.forwardButton) {
      this._mousedownForwardButtonHandler = this._mousedownButtonHandler.bind(this, 1);
      this.forwardButton.addEventListener('mousedown', this._mousedownForwardButtonHandler);
    }
  }

  destructor() {
    this.target.removeEventListener('scroll', this._scrollHandler);
    this.track.removeEventListener('mousedown', this._mousedownTrackHandler);
    this.thumb.removeEventListener('mousedown', this._mousedownThumbHandler);

    if (this.backButton)
      this.backButton.removeEventListener('mousedown', this._mousedownBackButtonHandler);
    if (this.forwardButton)
      this.forwardButton.removeEventListener('mousedown', this._mousedownForwardButtonButtonHandler);
  }

  _updateTrackState() {
    this.thumbHeight = Math.floor(
      this.target.clientHeight
        / this.target.scrollHeight
        * parseFloat(this.trackStyle.height)
    );

    if (this.thumbHeight < this.minThumbSize) {
      this.addedSize = this.minThumbSize - this.thumbHeight;
      this.thumbHeight = this.minThumbSize;
    } else {
      this.addedSize = 0;
    }

    this.thumb.style.height = this.thumbHeight + 'px';

    this.cachedScrollHeight = this.target.scrollHeight;
  }

  _updateButtonsState() {
    if (this.backButton) {
      if (this.target.scrollTop === 0) {
        this.backButton.disabled = true;
      } else {
        this.backButton.disabled = false;
      }
    }

    if (this.forwardButton) {
      if (this.target.scrollTop === this.target.scrollHeight - this.target.clientHeight) {
        this.forwardButton.disabled = true;
      } else {
        this.forwardButton.disabled = false;
      }
    }
  }

  _scrollHandler(event) {
    if (this.mouseControl) return;

    if (this.target.scrollHeight !== this.cachedScrollHeight) {
      this._updateTrackState();
    }

    const matrix = getMatrix(this.thumb);
    matrix[5] = Math.ceil(
      this.target.scrollTop
      / this.target.scrollHeight
      * (parseFloat(this.trackStyle.height) - this.addedSize)
    );
    setMatrix(this.thumb, matrix);

    this._updateButtonsState();
  }

  _mousedownThumbHandler(event) {
    event.preventDefault();
    this.mouseControl = true;

    const mousedownPos = event.clientY;
    const scrollThumbMatrix = getMatrix(this.thumb);
    const scrollThumbPos = scrollThumbMatrix[5];

    const mousemove = this._mousemoveHandler.bind(this, mousedownPos, scrollThumbPos, scrollThumbMatrix);
    const mouseup = this._mouseupHandler.bind(this, mousemove);

    window.addEventListener('mousemove', mousemove);
    window.addEventListener('mouseup', mouseup, { once: true });
  }

  _mousemoveHandler(mousedownPos, scrollThumbPos, scrollThumbMatrix, event) {
    event.preventDefault();

    let current = scrollThumbPos - mousedownPos + event.clientY;

    const maxOffset = parseFloat(this.trackStyle.height) - this.thumbHeight;
    if (current < 0) {
      current = 0;
    } else if (current > maxOffset) {
      current = maxOffset;
    }

    scrollThumbMatrix[5] = current;

    setMatrix(this.thumb, scrollThumbMatrix);

    this.target.scrollTop = current
      / (parseFloat(this.trackStyle.height) - this.addedSize)
      * this.target.scrollHeight;

    this._updateButtonsState();
  }

  _mouseupHandler(mousemove, event) {
    event.preventDefault();
    this.mouseControl = false;

    window.removeEventListener('mousemove', mousemove);
  }

  _mousedownTrackHandler(event) {
    event.preventDefault();
    let current = event.clientY;

    this._scrollByStep(current, 150);

    const func = () => {
      this._scrollByStep(current, 150);
      timeoutId = setTimeout(func, 150);
    }

    let timeoutId = setTimeout(func, 500);

    const mousemove = (event) => {
      current = event.clientY;
    }

    const mouseup = (event) => {
      clearTimeout(timeoutId);
      window.removeEventListener('mousemove', mousemove);
    }

    window.addEventListener('mousemove', mousemove);
    window.addEventListener('mouseup', mouseup, { once: true });
  }

  _mousedownButtonHandler(sign, event) {
    event.preventDefault();
    let scrollto = this.target.scrollTop + 40 * sign;

    this.scrollTo(scrollto);

    let timeoutId;

    const _func = () => {
      if (event.target.disabled) return;
      scrollto += 40 * sign;
      this.scrollTo(scrollto, 50);

      timeoutId = setTimeout(_func, 50);
    }

    timeoutId = setTimeout(_func, 500);

    const mouseup = () => clearTimeout(timeoutId);
    window.addEventListener('mouseup', mouseup, { once: true });
  }

  _scrollByStep(y, duration) {
    const scrollTop = this.target.scrollTop;
    const thumbCoords = this.thumb.getBoundingClientRect();

    let sign;

    if (y < thumbCoords.top) {
      sign = -1;
    } else if (y > thumbCoords.bottom) {
      sign = 1;
    } else {
      return;
    }

    const scrollStep = this.SCROLL_STEP_RATIO * this.target.clientHeight * sign;

    this.scrollTo(scrollTop + scrollStep, duration);
  }

  scrollTo(y, duration = 150) {
    const scrollTop = this.target.scrollTop;
    const offset = y - scrollTop;

    animate({
      draw: (progress) => {
        this.target.scrollTop = scrollTop + offset * progress;
      },
      duration
    });
  }
}

export default ScrollBar;