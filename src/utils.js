function getMatrix(element) {
  const matrix = window.getComputedStyle(element).transform;
  if (matrix === 'none') return [1, 0, 0, 1, 0, 0];
  const bracketPos = matrix.indexOf('(');
  return matrix
    .slice(bracketPos + 1, -1)
    .split(', ')
    .map((el) => parseFloat(el));
}

function setMatrix(element, matrix) {
  element.style.transform = `matrix(${matrix.join(', ')})`;
}

function animate({ draw, duration, timing = linear }) {
  let start = performance.now();

  let fraimeId = requestAnimationFrame(function animate(time) {
    let timeFraction = (performance.now() - start) / duration;
    if (timeFraction > 1) timeFraction = 1;

    const progress = timing(timeFraction);

    draw(progress);

    if (timeFraction < 1) fraimeId = requestAnimationFrame(animate);
  });
}

function linear(timeFraction) {
  return timeFraction;
}

export { getMatrix, setMatrix, animate, linear };
