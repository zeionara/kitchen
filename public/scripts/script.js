
function showError(container, errorMessage) {
      container.className = 'error';
      var msgElem = document.createElement('span');
      msgElem.className = "error-message";
      msgElem.innerHTML = errorMessage;
      container.appendChild(msgElem);
}

function resetError(container) {
  container.className = '';
  if (container.lastChild.className == "error-message") {
    container.removeChild(container.lastChild);
  }
}

function validate(form) {
  var elems = form.elements;
  var RegLetters = new RegExp("^[A-zА-яЁё]+$");
  var valid = true;

  resetError(elems.name.parentNode);
  if (!(elems.name.value && RegLetters.test(elems.name.value))) {
    showError(elems.name.parentNode, 'Please, type valid name');
    valid = false;
  }

  resetError(elems.surname.parentNode);
  if (!(elems.surname.value && RegLetters.test(elems.surname.value))) {
    showError(elems.surname.parentNode, 'Please, type valid surname');
    valid = false;
  }

  resetError(elems.patronymic.parentNode);
  if (!(elems.patronymic.value && RegLetters.test(elems.patronymic.value))) {
    showError(elems.patronymic.parentNode, 'Please, type valid patronymic');
    valid = false;
  }

  resetError(elems.russian.parentNode);
  if(!(elems.russian.checked || elems.italian.checked || elems.japanese.checked)){
    showError(elems.russian.parentNode, 'Cook can\'t have no qualifications');
    valid = false;
  }

  resetError(document.getElementById("morningshifts").parentNode);
  if (!elems.shiftstime.value) {
    showError(document.getElementById("morningshifts").parentNode, 'Cook can\'t have no desired time of shifts');
    valid = false;
  }

  resetError(elems.dayduration.parentNode);
  if (parseInt(elems.dayduration.value) > parseInt(elems.dayduration.max) || (parseInt(elems.dayduration.value) < parseInt(elems.dayduration.min))) {
    showError(elems.dayduration.parentNode, 'Please, select valid duration of the working day');
    valid = false;
  }

  if (valid){
    form.submit();
  }
}