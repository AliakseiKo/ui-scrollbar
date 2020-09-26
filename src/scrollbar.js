import { getMatrix, setMatrix, animate } from './utils.js';

class ScrollBar {
  constructor(target, track, {
    backButton,
    forwardButton,
    selector = '.scrollbar__thumb',
    trackDisabledClass = 'scrollbar__track_disabled',
    buttonDisabledClass = 'scrollbar__button_disabled',
    minThumbSize = 17,
    horizontal = false
  } = {}) {
    this.SCROLL_STEP_RATIO = 0.875;

    this.target = target;
    this.track = track;
    this.thumb = track.querySelector(selector);
    this.backButton = backButton;
    this.forwardButton = forwardButton;
    this.trackDisabledClass = trackDisabledClass;
    this.buttonDisabledClass = buttonDisabledClass;
    this.minThumbSize = minThumbSize;
    this.horizontal = horizontal;

    this.trackStyle = window.getComputedStyle(track);

    this.addedSize = 0;
    this.mouseControl = false;
    this.cachedScrollHeight;
    this.thumbSize;

    this.matrixIndex = (this.horizontal) ? 4 : 5;
    this.eventAxis = (this.horizontal) ? 'clientX' : 'clientY';

    if (this.scrollOffset === 0) this.scrollOffset = 1;

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

  get scrollOffset() {
    return (this.horizontal) ? this.target.scrollLeft : this.target.scrollTop;
  }

  set scrollOffset(value) {
    if (this.horizontal) this.target.scrollLeft = value;
    else this.target.scrollTop = value;
  }

  get clientSize() {
    return (this.horizontal) ? this.target.clientWidth : this.target.clientHeight;
  }

  get scrollSize() {
    return (this.horizontal) ? this.target.scrollWidth : this.target.scrollHeight;
  }

  get trackSize() {
    return (this.horizontal) ? parseFloat(this.trackStyle.width) :  parseFloat(this.trackStyle.height);
  }

  get thumbSize() {
    return this.cachedThumbSize;
  }

  set thumbSize(value) {
    if (this.horizontal) this.thumb.style.width = value + 'px';
    else this.thumb.style.height = value + 'px';
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
    this.cachedThumbSize = Math.floor(this.clientSize / this.scrollSize * this.trackSize);

    if (this.cachedThumbSize < this.minThumbSize) {
      this.addedSize = this.minThumbSize - this.cachedThumbSize;
      this.cachedThumbSize = this.minThumbSize;
    } else {
      this.addedSize = 0;
    }

    this.thumbSize = this.cachedThumbSize;

    this.cachedScrollHeight = this.target.scrollHeight;

    if (this.clientSize === this.scrollSize) {
      this.track.classList.add(this.trackDisabledClass);
    } else {
      this.track.classList.remove(this.trackDisabledClass);
    }
  }

  _updateButtonsState() {
    if (this.backButton) {
      if (this.scrollOffset <= 1) {
        this.backButton.classList.add(this.buttonDisabledClass);
      } else {
        this.backButton.classList.remove(this.buttonDisabledClass);
      }
    }

    if (this.forwardButton) {
      if (this.scrollOffset === this.scrollSize - this.clientSize) {
        this.forwardButton.classList.add(this.buttonDisabledClass);
      } else {
        this.forwardButton.classList.remove(this.buttonDisabledClass);
      }
    }
  }

  _scrollHandler(event) {
    if (this.mouseControl) return;

    if (this.scrollOffset === 0) this.scrollOffset = 1;

    if (this.scrollSize !== this.cachedScrollHeight) {
      this._updateTrackState();
    }

    const matrix = getMatrix(this.thumb);
    matrix[this.matrixIndex] =
      Math.ceil((this.scrollOffset - 1) / this.scrollSize * (this.trackSize - this.addedSize));
    setMatrix(this.thumb, matrix);

    this._updateButtonsState();
  }

  _mousedownThumbHandler(event) {
    event.preventDefault();
    this.mouseControl = true;

    const mousedownPos = event[this.eventAxis];
    const scrollThumbMatrix = getMatrix(this.thumb);
    const scrollThumbPos = scrollThumbMatrix[this.matrixIndex];

    const mousemove = this._mousemoveHandler.bind(this, mousedownPos, scrollThumbPos, scrollThumbMatrix);
    const mouseup = this._mouseupHandler.bind(this, mousemove);

    window.addEventListener('mousemove', mousemove);
    window.addEventListener('mouseup', mouseup, { once: true });
  }

  _mousemoveHandler(mousedownPos, scrollThumbPos, scrollThumbMatrix, event) {
    event.preventDefault();

    let current = scrollThumbPos - mousedownPos + event[this.eventAxis];

    const maxOffset = this.trackSize - this.thumbSize;
    if (current < 0) {
      current = 0;
    } else if (current > maxOffset) {
      current = maxOffset;
    }

    scrollThumbMatrix[this.matrixIndex] = current;

    setMatrix(this.thumb, scrollThumbMatrix);

    this.scrollOffset = current / (this.trackSize - this.addedSize) * this.scrollSize || 1;

    this._updateButtonsState();
  }

  _mouseupHandler(mousemove, event) {
    event.preventDefault();
    this.mouseControl = false;

    window.removeEventListener('mousemove', mousemove);
  }

  _mousedownTrackHandler(event) {
    if (event.target !== event.currentTarget) return;
    event.preventDefault();
    let current = event[this.eventAxis];

    this._scrollByStep(current, 150);

    const func = () => {
      this._scrollByStep(current, 150);
      timeoutId = setTimeout(func, 150);
    }

    let timeoutId = setTimeout(func, 500);

    const mousemove = (event) => {
      current = event[this.eventAxis];
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
    if (event.target.classList.contains(this.buttonDisabledClass)) return;
    let scrollto = this.scrollOffset;

    this.scrollTo(scrollto += 40 * sign);

    let timeoutId;

    const _func = () => {
      if (event.target.classList.contains(this.buttonDisabledClass)) return;
      this.scrollTo(scrollto += 40 * sign, 50);
      timeoutId = setTimeout(_func, 50);
    }

    timeoutId = setTimeout(_func, 500);

    const mouseup = () => clearTimeout(timeoutId);
    window.addEventListener('mouseup', mouseup, { once: true });
  }

  _scrollByStep(y, duration) {
    const scrollTop = this.scrollOffset;
    const thumbCoords = this.thumb.getBoundingClientRect();

    let sign;

    if (y < thumbCoords.top) {
      sign = -1;
    } else if (y > thumbCoords.bottom) {
      sign = 1;
    } else {
      return;
    }

    const scrollStep = this.SCROLL_STEP_RATIO * this.clientSize * sign;

    this.scrollTo(scrollTop + scrollStep, duration);
  }

  scrollTo(y, duration = 150) {
    const scrollTop = this.scrollOffset;
    const offset = y - scrollTop;

    animate({
      draw: (progress) => {
        this.scrollOffset = scrollTop + offset * progress;
      },
      duration
    });
  }
}

export default ScrollBar;
