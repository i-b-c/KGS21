const collapsibleLables = document.getElementsByClassName('collapsible-label');

for (i=0; i<collapsibleLables.length; i++) {
  collapsibleLables[i].addEventListener('click', function () {
    this.parentElement.classList.toggle('active')
  })
}
