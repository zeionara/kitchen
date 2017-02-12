function clearTable(table){
  while(table.childNodes.length > 2) table.removeChild(table.lastChild);
}


function loadCooksInfo(){
    console.log("pressed");
    clearTable(document.getElementById("cooks"));
    $.ajax({
      type : "post",
      url : "/load_cooks_handler",
      success : function(data){
        for (var i=0; i < data.length; i++){
          console.log(data[i]);
          var rawElement = document.createElement('tr');

          for (key in data[i]){
            if ((key == 'cookid')||(key == 'workingmode_2_2')) continue;
            var cellElement = document.createElement('td');
            cellElement.innerHTML = data[i][key];
            data[i][key] == 1?cellElement.innerHTML = 'yes':data[i][key] == 0?cellElement.innerHTML = 'no':console.log();
            if (key == 'workingmode_5_2') data[i][key] == 1?cellElement.innerHTML = '5/2':cellElement.innerHTML = '2/2';
            rawElement.appendChild(cellElement);
          }
          document.getElementById("cooks").appendChild(rawElement);
        }
      },
    });//ajax
}

function addNewCook(e){
  e.preventDefault();

  if(isValid(this)){
    var name = this.elements["name"].value;
    var surname = this.elements["surname"].value;
    var patronymic = this.elements["patronymic"].value;

    var japanese = this.elements["japanese"].checked;
    var italian = this.elements["italian"].checked;
    var russian = this.elements["russian"].checked;

    var morningshifts = false;
    var eveningshifts = false;
    if (this.elements["shiftstime"].value == 'evening'){
      eveningshifts = true;
    } else {
      morningshifts = true;
    }

    //var shiftstime = this.elements["shiftstime"].value;
    var necessityshiftstime = this.elements["necessityshiftstime"].checked;

    var dayduration = this.elements["dayduration"].value;
    var necessitydayduration = this.elements["necessitydayduration"].checked;

    var workingmode_5_2 = false;
    var workingmode_2_2 = false;
    if (this.elements["workingmode"].value == '5/2'){
      workingmode_5_2 = true;
    } else {
      workingmode_2_2 = true;
    }

    //var workingmode = this.elements["workingmode"].value;

    var elems = this.elements;

    $.ajax({
      type : "post",
      url : "/addnew_handler",
      data : JSON.stringify({name : name, surname : surname, patronymic : patronymic, russian : russian, italian : italian, japanese : japanese,
      morningshifts : morningshifts, eveningshifts : eveningshifts, necessityshiftstime : necessityshiftstime, dayduration : dayduration,
      necessitydayduration : necessitydayduration, workingmode_5_2 : workingmode_5_2, workingmode_2_2 : workingmode_2_2}),
      dataTpe : "json",
      contentType : "application/json",
      success : function(data){
        console.log(data);
        resetError(elems.submit.parentNode);
        resetNotification(elems.submit.parentNode);
        if (data=="Accepted") {
          showNotification(elems.submit.parentNode, 'New cook added');
        } else {
          showError(elems.submit.parentNode, 'New cook wasn\'t added : '+data);
        }
      },
    });//ajax
  };//if(isValid(this))
}


function showError(container, errorMessage) {
      container.className = 'error';
      var msgElem = document.createElement('span');
      msgElem.className = "error-message";
      msgElem.innerHTML = errorMessage;
      container.appendChild(msgElem);
}

function showNotification(container, notificationMessage) {
      container.className = 'notification';
      var msgElem = document.createElement('span');
      msgElem.className = "notification-message";
      msgElem.innerHTML = notificationMessage;
      container.appendChild(msgElem);
}

function resetError(container) {
  container.className = '';
  if (container.lastChild.className == "error-message") {
    container.removeChild(container.lastChild);
  }
}

function resetNotification(container) {
  container.className = '';
  if (container.lastChild.className == "notification-message") {
    container.removeChild(container.lastChild);
  }
}

function isValid(form) {
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

  return valid;
}

$(document).ready(function(){

  loadCooksInfo();

  $("form#addnew").submit(addNewCook);

  $("button#load_cooks").click(loadCooksInfo);
});
