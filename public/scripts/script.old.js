function removeChilds(element, num_left){
  while(element.childNodes.length > num_left) element.removeChild(element.lastChild);
}

function showCooks(data){
  for (var i=0; i < data.length; i++){//for each cook

    var rawElement = document.createElement('tr');
    rawElement.setAttribute("class","cookinfo");

    for (key in data[i]){//for each property of cook
      if (key == 'workingmode_2_2') continue;

      var cellElement = document.createElement('td');
      cellElement.innerHTML = data[i][key];
      cellElement.setAttribute("class",key);

      ((data[i][key] == 1)&&(key != 'cookid'))?cellElement.innerHTML = 'yes':data[i][key] == 0?cellElement.innerHTML = 'no':console.log();

      if (key == 'workingmode_5_2'){
        data[i][key] == 1?cellElement.innerHTML = '5/2':cellElement.innerHTML = '2/2';
        cellElement.setAttribute("class","workingmode");
      }
      rawElement.appendChild(cellElement);
    }//for each property of cook
    document.getElementById("cooks").appendChild(rawElement);
  }//for each cook
}

function loadCooksInfo(){
    removeChilds(document.getElementById("cooks"), 2);//clear table
    $.ajax({
      type : "post",
      url : "/load_cooks_handler",
      success : function(data){
        showCooks(data);
      },
    });
}

function showActionResult(form_elems, result, good_result, good_msg, bad_msg){
  resetError(form_elems.submit.parentNode);
  resetNotification(form_elems.submit.parentNode);
  if (result==good_result) {
    showNotification(form_elems.submit.parentNode, good_msg);
  } else {
    showError(form_elems.submit.parentNode, bad_msg+" : "+data);
  }
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
        loadCooksInfo();
        showActionResult(elems, data, "Accepted", "New cook added", "New cook wasn't added");
      },
    });
  };//if(isValid(this))
}

function editCook(e){
  e.preventDefault();

  if(isValid(this)){
    var cookid = cid;
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
      url : "/edit_handler",
      data : JSON.stringify({cookid : cookid, name : name, surname : surname, patronymic : patronymic, russian : russian, italian : italian, japanese : japanese,
      morningshifts : morningshifts, eveningshifts : eveningshifts, necessityshiftstime : necessityshiftstime, dayduration : dayduration,
      necessitydayduration : necessitydayduration, workingmode_5_2 : workingmode_5_2, workingmode_2_2 : workingmode_2_2}),
      dataTpe : "json",
      contentType : "application/json",
      success : function(data){
        loadCooksInfo();
        showActionResult(elems, data, "Accepted", "Changes saved", "Changes wasn't saved");
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

function setAlternative(rawElement, form_id, qualifications, new_attribute, good_value, new_good, new_bad){
  if(rawElement.getElementsByClassName(qualifications)[0].innerHTML == good_value){
    document.getElementById(form_id).elements[qualifications].value = new_good;
  } else {
    document.getElementById(form_id).elements[qualifications].value = new_bad;
  }
}

function setSwitcher(rawElement, form_id, qualifications, new_attribute, good_value){
  if(rawElement.getElementsByClassName(qualifications)[0].innerHTML == good_value){
    document.getElementById(form_id).elements[qualifications].checked = true;
  } else {
    document.getElementById(form_id).elements[qualifications].checked = false;
  }
}


function initializeEditingCook(e){
  if(e.target.parentNode != document.getElementById("cooks").getElementsByTagName("tr")[0]){
    var rawElement = e.target.parentNode;

    cid = rawElement.getElementsByClassName("cookid")[0].innerHTML;
    document.getElementById("edit").elements["name"].value = rawElement.getElementsByClassName("name")[0].innerHTML;
    document.getElementById("edit").elements["surname"].value = rawElement.getElementsByClassName("surname")[0].innerHTML;
    if(rawElement.getElementsByClassName("patronymic")[0].innerHTML != "no"){
      document.getElementById("edit").elements["patronymic"].value = rawElement.getElementsByClassName("patronymic")[0].innerHTML;
    } else {
      document.getElementById("edit").elements["patronymic"].value = "";
    }

    /*if(rawElement.getElementsByClassName("russian")[0].innerHTML == "yes"){
      document.getElementById("edit").elements["russian"].checked = true;
    } else {
      document.getElementById("edit").elements["russian"].checked = false;
    }*/

    setSwitcher(rawElement, "edit", "russian", "russian", "yes");

    /*if(rawElement.getElementsByClassName("italian")[0].innerHTML == "yes"){
      document.getElementById("edit").elements["italian"].checked = true;
    } else {
      document.getElementById("edit").elements["italian"].checked = false;
    }*/

    setSwitcher(rawElement, "edit", "italian", "italian", "yes");

    /*if(rawElement.getElementsByClassName("japanese")[0].innerHTML == "yes"){
      document.getElementById("edit").elements["japanese"].checked = true;
    } else {
      document.getElementById("edit").elements["japanese"].checked = false;
    }*/

    setSwitcher(rawElement, "edit", "japanese", "japanese", "yes");

    /*if(rawElement.getElementsByClassName("morningshifts")[0].innerHTML == "yes"){
      document.getElementById("edit").elements["shiftstime"].value = "morning";
    } else {
      document.getElementById("edit").elements["shiftstime"].value = "evening";
    }*/

    setAlternative(rawElement, "edit", "morningshifts", "shiftstime", "yes", "morning", "evening");

    /*if(rawElement.getElementsByClassName("necessityshiftstime")[0].innerHTML == "yes"){
      document.getElementById("edit").elements["necessityshiftstime"].checked = true;
    } else {
      document.getElementById("edit").elements["necessityshiftstime"].checked = false;
    }*/

    setSwitcher(rawElement, "edit", "necessityshiftstime", "necessityshiftstime", "yes");

    document.getElementById("edit").elements["dayduration"].value = rawElement.getElementsByClassName("dayduration")[0].innerHTML;

    /*if(rawElement.getElementsByClassName("necessitydayduration")[0].innerHTML == "yes"){
      document.getElementById("edit").elements["necessitydayduration"].checked = true;
    } else {
      document.getElementById("edit").elements["necessitydayduration"].checked = false;
    }*/

    setSwitcher(rawElement, "edit", "necessitydayduration", "necessitydayduration", "yes");

    /*if(rawElement.getElementsByClassName("workingmode")[0].innerHTML == "5/2"){
      document.getElementById("edit").elements["workingmode"].value = "5/2";
    } else {
      document.getElementById("edit").elements["workingmode"].value = "2/2";
    }*/

    setAlternative(rawElement, "edit", "workingmode", "workingmode", "5/2", "5/2", "2/2");

    showEditingForm();

    console.log(rawElement);
  }
}

function showEditingForm(){
  $('#overlay').fadeIn(400,
		 	function(){
				$('#modal_form')
					.css('display', 'block')
					.animate({opacity: 1, top: '50%'}, 200);
	});
}

function hideEditingForm(){
  $('#modal_form')
    .animate({opacity: 0, top: '45%'}, 200,
      function(){
        $(this).css('display', 'none');
        $('#overlay').fadeOut(400);
        resetError(document.getElementById("edit").elements["submit"].parentNode);
        resetError(document.getElementById("edit").elements["russian"].parentNode);
        resetNotification(document.getElementById("edit").elements["submit"].parentNode);
      }
    );
}

function deleteCook(){
  console.log("delete");
  var cookid = cid;

  $.ajax({
    type : "post",
    url : "/delete_handler",
    data : JSON.stringify({cookid : cookid}),
    dataTpe : "json",
    contentType : "application/json",
    success : function(data){
      console.log(data);
      loadCooksInfo();
      if (data=="Accepted") {
        showNotification(elems.submit.parentNode, 'Changes saved');
      } else {
        showError(elems.submit.parentNode, 'Changes wasn\'t saved : '+data);
      }
    },
  });//ajax
}

function switchCooksVisibility(){
  if($("table#cooks").css("display") == "table"){
    document.getElementById("hide_cooks").innerHTML = "Show";
    $("table#cooks").css("display","none");
  } else {
    document.getElementById("hide_cooks").innerHTML = "Hide";
    $("table#cooks").css("display","table");
  }
}

function showAntiSchedule(data){
  removeChilds(document.getElementById("schedule"), 0);

  var h3Elem = document.createElement('h3');
  h3Elem.className = "bad_schedule_header";
  h3Elem.innerHTML = "Can't make schedule with this params.";
  document.getElementById("schedule").appendChild(h3Elem);

  h3Elem = document.createElement('h3');
  h3Elem.className = "bad_schedule_header";
  h3Elem.innerHTML = "Required : ";
  document.getElementById("schedule").appendChild(h3Elem);

  var ulElem = document.createElement('ul');
  ulElem.id = "bad_schedule_list";
  document.getElementById("schedule").appendChild(ulElem);

  var kitchen;
  for (var i = 0; i < data.length; i++){
      if (i == 0) kitchen = "russian";
      if (i == 1) kitchen = "italian";
      if (i == 2) kitchen = "japanese";

      for (var j = 0; j < data[i].length; j++){
        if (data[i][j] < 24){
          var liElem = document.createElement("li");
          liElem.innerHTML = "Cook(s) for "+kitchen+" kitchen in "+(j+1)+" restaurant for time "+data[i][j]+":00 - 24:00";
          document.getElementById("bad_schedule_list").appendChild(liElem);
        }
      }
  }

}

function showSchedule(data){
  removeChilds(document.getElementById("schedule"), 0);

  var h3Elem = document.createElement('h3');
  h3Elem.className = "good_schedule_header";
  h3Elem.innerHTML = "Schedule";
  document.getElementById("schedule").appendChild(h3Elem);

  var ulElem = document.createElement('ul');
  ulElem.id = "good_schedule_list";

  document.getElementById("schedule").appendChild(ulElem);

  var kitchen;
  for (var i = 0; i < data.length; i++){
    var liElem = document.createElement("li");
    liElem.id = "day_"+i;
    liElem.innerHTML = (i+1)+" day :";
    document.getElementById("good_schedule_list").appendChild(liElem);

    ulElem = document.createElement('ul');
    ulElem.id = "good_schedule_list_day_"+i;
    ulElem.className = "day_list";
    document.getElementById("day_"+i).appendChild(ulElem);

    for (var j = 0; j < data[i].length; j++){
      liElem = document.createElement("li");
      liElem.id = "day_"+i+"_restaurant_"+j;
      liElem.innerHTML = (j+1)+" restaurant :";
      document.getElementById("good_schedule_list_day_"+i).appendChild(liElem);

      ulElem = document.createElement('ul');
      ulElem.id = "good_schedule_list_day_"+i+"_restaurant_"+j;
      ulElem.className = "restaurant_list";
      document.getElementById("day_"+i+"_restaurant_"+j).appendChild(ulElem);

      for (var k = 0; k < data[i][j].length; k++){
        if (k == 0) kitchen = "russian";
        if (k == 1) kitchen = "italian";
        if (k == 2) kitchen = "japanese";

        liElem = document.createElement("li");
        liElem.id = "day_"+i+"_restaurant_"+j+"_kitchen_"+k;
        liElem.innerHTML = kitchen+" kitchen : ";
        document.getElementById("good_schedule_list_day_"+i+"_restaurant_"+j).appendChild(liElem);

        ulElem = document.createElement('ul');
        ulElem.id = "good_schedule_list_day_"+i+"_restaurant_"+j+"_kitchen_"+k;
        ulElem.className = "kitchen_list";
        document.getElementById("day_"+i+"_restaurant_"+j+"_kitchen_"+k).appendChild(ulElem);

        for (var l = 0; l < data[i][j][k].length; l++){
          liElem = document.createElement("li");
          liElem.innerHTML = data[i][j][k][l].snp+"( id = "+data[i][j][k][l].id+" ) : "+data[i][j][k][l].worktime;
          document.getElementById("good_schedule_list_day_"+i+"_restaurant_"+j+"_kitchen_"+k).appendChild(liElem);
        }
      }
    }
  }
}

function createScedule(){
  var num_of_restaurants = document.getElementById("num_of_restaurants").value;

  $.ajax({
    type : "post",
    url : "/create_scedule_handler",
    data : JSON.stringify({num_of_restaurants : num_of_restaurants}),
    dataTpe : "json",
    contentType : "application/json",
    success : function(data){
      if (typeof(data[0][0]) == "number"){
        showAntiSchedule(data);
      } else {
        showSchedule(data);
      }

      //loadCooksInfo();
    },
  });//ajax
}

$(document).ready(function(){

  loadCooksInfo();

  $("form#addnew").submit(addNewCook);

  $("button#load_cooks").click(loadCooksInfo);

  $("button#hide_cooks").click(switchCooksVisibility);

  $("input#delete").click(deleteCook);

  $("table#cooks").click(initializeEditingCook);

  $('#modal_close, #overlay').click(hideEditingForm);

  $("form#edit").submit(editCook);

  $("button#create_scedule").click(createScedule);
});
