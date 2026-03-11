const collapsibleLabels = document.getElementsByClassName('collapsible-label');

for (let i = 0; i < collapsibleLabels.length; i++) {
  collapsibleLabels[i].addEventListener('click', function () {
    const element = this.parentElement;
    const content = element.querySelector('.collapsible-content');

    if (element.classList.contains('active')) {
      content.style.maxHeight = null;
      element.classList.remove('active');
    } else {
      element.classList.add('active');
      content.style.maxHeight = content.scrollHeight + 'px';
    }
  });
}
