const collapsibleElements = document.getElementsByClassName('collapsible-element');

for (i=0; i<collapsibleElements.length; i++) {
  collapsibleElements[i].addEventListener('click', function () {
    this.classList.toggle('active')
    console.log('töötab')
  })
}
