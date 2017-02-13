var express = require('express');
var bodyParser = require('body-parser');
var mysql = require('mysql');

var app = new express();
var jsonParser = bodyParser.json();
var connection = mysql.createConnection({
  host : "127.0.0.1",
  user : "root",
  password: "stopper",
  database : "dbmain",
});

app.use(express.static(__dirname + "/public"));
app.get("/",function(request,response){
  response.send("Main page");
});

app.post("/addnew_handler",jsonParser,function(request,response){
    if(!request.body) return response.sendStatus(400);

    connection.query("INSERT INTO cooks (name, surname, patronymic, russian, italian, japanese, morningshifts, eveningshifts, "+
    "necessityshiftstime, dayduration, necessitydayduration, workingmode_5_2, workingmode_2_2) "+
    "VALUES ('"+request.body.name+"', '"+request.body.surname+"', '"+request.body.patronymic+"', "+request.body.russian+", "+request.body.italian+", "+
    request.body.japanese+", "+request.body.morningshifts+", "+request.body.eveningshifts+", "+request.body.necessityshiftstime+", "+request.body.dayduration+
    ", "+request.body.necessitydayduration+", "+request.body.workingmode_5_2+", "+request.body.workingmode_2_2+");",function(error,result,fields){
      if(error) return response.json(error);
    });

    //console.log(request.body)
    response.json("Accepted");
});

app.post("/edit_handler",jsonParser,function(request,response){
    if(!request.body) return response.sendStatus(400);

    var rb = request.body;

    connection.query("UPDATE cooks SET name = '"+rb.name+"', surname = '"+rb.surname+"', patronymic = '"+rb.patronymic+"', russian = "+rb.russian+", italian = "+rb.italian+
    ", japanese = "+rb.japanese+", morningshifts = "+rb.morningshifts+", eveningshifts = "+rb.eveningshifts+", necessityshiftstime = "+rb.necessityshiftstime+
    ", dayduration = "+rb.dayduration+", necessitydayduration = "+rb.necessitydayduration+", workingmode_5_2 = "+rb.workingmode_5_2+", workingmode_2_2 = "+
    rb.workingmode_2_2+" WHERE cookid = "+rb.cookid+";",function(error,result,fields){
      if(error) return response.json(error);
    });

    response.json("Accepted");
});

app.post("/delete_handler",jsonParser,function(request,response){
    if(!request.body) return response.sendStatus(400);

    connection.query("DELETE FROM cooks WHERE cookid = "+request.body.cookid+";",function(error,result,fields){
      if(error) return response.json(error);
    });

    response.json("Accepted");
});

app.post("/load_cooks_handler",jsonParser,function(request, response){
  console.log("ok");
  connection.query("SELECT * FROM cooks",function(error,result,fields){
    if(error) return response.json(error);
    response.json(result);
  });
});

app.post("/create_scedule_handler",jsonParser,function(request,response){
    if(!request.body) return response.sendStatus(400);

    var result = connection.query("SELECT * FROM cooks",function(error,result,fields){
      if(error) return response.json(error);
      createScedule(result,parseInt(request.body.num_of_restaurants));
    });
    response.json("Accepted");
});

function generateDayConfig(qualification, hour, dayduration, preferred){
  var day_config = {};
  day_config.qualification = qualification;
  day_config.begin_hour = hour;
  day_config.end_hour = hour + dayduration;
  day_config.watched = 0;
  day_config.selected = 0;
  day_config.preferred = preferred;
  return day_config;
}

function addAllPossibleConfigs(day_configs, dayduration, qualification, preferred, begin_hour, end_hour){
  for (var hour = begin_hour; hour <= end_hour; hour++){
    day_configs.push(generateDayConfig(qualification,hour,dayduration,preferred));
  }
}

function handleShiftsTime(necessityshiftstime, morningshifts, day_configs, dayduration, qualification, longday, preferred){
  var begin_hour_morning = 10;
  var end_hour_morning = 17 - dayduration;

  var begin_hour_evening = 17;
  var end_hour_evening = 24 - dayduration;

  var good_shift_time = 1;
  var bad_shift_time = 0;

  if (longday == 1){
    end_hour_morning = begin_hour_morning;
    begin_hour_evening = end_hour_evening;
  }

  if (preferred == 0){
    // preferred = 0 if it's not selected, but acceptable day duration
    good_shift_time = 0;
  }

  if (necessityshiftstime == 1){
    if (morningshifts == 1){
        addAllPossibleConfigs(day_configs, dayduration, qualification, good_shift_time, begin_hour_morning, end_hour_morning);
    } else {
        addAllPossibleConfigs(day_configs, dayduration, qualification, good_shift_time, begin_hour_evening, end_hour_evening)
    }// if it is only evening shifts
  } else {
    if (morningshifts == 1){
        addAllPossibleConfigs(day_configs, dayduration, qualification, good_shift_time, begin_hour_morning, end_hour_morning);
        addAllPossibleConfigs(day_configs, dayduration, qualification, bad_shift_time, begin_hour_evening, end_hour_evening);
    } else {
        addAllPossibleConfigs(day_configs, dayduration, qualification, good_shift_time, begin_hour_morning, end_hour_morning);
        addAllPossibleConfigs(day_configs, dayduration, qualification, bad_shift_time, begin_hour_evening, end_hour_evening);
    }// if it is only evening shifts
  }// if shiftstime is not very important
}

function handleDayDuration(dayduration, necessityshiftstime, morningshifts, day_configs, qualification, preferred){
  if (dayduration <= 7){
    handleShiftsTime(necessityshiftstime, morningshifts, day_configs, dayduration, qualification, 0, preferred);
  } else {
    handleShiftsTime(necessityshiftstime, morningshifts, day_configs, dayduration, qualification, 1, preferred);
  }
}

function handleNecessityDayDuration(necessitydayduration, dayDuration, necessityshiftstime, morningshifts, day_configs, qualification){
  if (necessitydayduration == 1){
    handleDayDuration(dayDuration, necessityshiftstime, morningshifts, day_configs, qualification, 1);
  } else {
    handleDayDuration(dayDuration, necessityshiftstime, morningshifts, day_configs, qualification, 1);
    for (var dayduration = 4; dayduration <= 10; dayduration++){
      if (dayduration == dayDuration) continue;
      handleDayDuration(dayduration, necessityshiftstime, morningshifts, day_configs, qualification, 0);
    }//for each day duration
  }// if dayduration is not very important
}

function getDayNameForLongWeek(workmode_config, i){
  return "day";
}

function getDayNameForShortWeek(workmode_config, i){
  return "day";
}

function handleDays(workmode_config, cook, dayset){
  var counter = 0;
  for (var i = 0; i < 30; i++){
    counter++;
    var day = {};

    if (workmode_config.length = 5){
      day.name = getDayNameForLongWeek(workmode_config, i);
      //workmode_configs[i % 5];
    } else {
      day.name = getDayNameForShortWeek(workmode_config, i);
    }

    day.selected = 0;
    day.configs = [];

    if (cook.russian == 1) handleNecessityDayDuration(cook.necessitydayduration, cook.dayduration, cook.necessityshiftstime, cook.morningshifts, day.configs, "russian");

    if (cook.italian == 1) handleNecessityDayDuration(cook.necessitydayduration, cook.dayduration, cook.necessityshiftstime, cook.morningshifts, day.configs, "italian");

    if (cook.japanese == 1) handleNecessityDayDuration(cook.necessitydayduration, cook.dayduration, cook.necessityshiftstime, cook.morningshifts, day.configs, "japanese");

    dayset.days.push(day);
  }// for each possible set of working days in month
}

function handleWorkMode(cook){
  var all_shifts_configures = cook.workingmode_5_2 == 1? all_configs_5_2 : all_configs_2_2;
  var cook_config = {};
  cook_config.selected = 0;
  cook_config.workdaycounter = 0;
  cook_config.restdaycounter = 0;
  cook_config.busy = 0;
  cook_config.workingmode_5_2 = cook.workingmode_5_2;
  cook_config.daysets = [];
  for (j in all_shifts_configures){// for each possible day configuration
    var dayset = {};
    dayset.selected = 0;
    dayset.days = [];
    handleDays(all_shifts_configures[j], cook, dayset);
    cook_config.daysets.push(dayset);
  }
  return cook_config;
}

function handleConfigures(cooks){
  var full_cooks_configs = new Array(cooks.length);

  all_configs_5_2 = [
    ["mon", "tue", "wed", "thu", "fri"],
    ["tue", "wed", "thu", "fri", "sat"],
    ["wed", "thu", "fri", "sat", "sun"],
    ["thu", "fri", "sat", "sun", "mon"],
    ["fri", "sat", "sun", "mon", "tue"],
    ["sat", "sun", "mon", "tue", "wed"],
    ["sun", "mon", "tue", "wed", "thu"],
  ];

  all_configs_2_2 = [
    ["mon", "tue", "fri", "sat", "tue", "wed", "sat", "sun"],
    ["tue", "wed", "sat", "sun", "wed", "thu", "sun", "mon"],
    ["wed", "thu", "sun", "mon", "thu", "fri", "mon", "tue"],
    ["thu", "fri", "mon", "tue", "fri", "sat", "tue", "wed"],
  ];

  for (i in cooks){
    full_cooks_configs[i] = handleWorkMode(cooks[i]);
    //console.log("Full cooks config "+i+" : "+full_cooks_configs[i]);
  }

  return full_cooks_configs;
}

function createScedule(cooks,num_of_restaurants){
  var full_cooks_configs = handleConfigures(cooks);
  //console.log("1th day in 1th cook config's 1th dayset has "+full_cooks_configs[5].daysets[0].days[0].configs.length+" days configs");
  var counter = 0;
  var broke = false;
  var time_restaurants = new Array(num_of_restaurants);

  for (var day = 1; day <= 3; day++){
    unbusyAll(full_cooks_configs);
    for (var i = 0; i < num_of_restaurants; i++){
      time_restaurants[i] = 10;
    }
  while(!isAllBusy(time_restaurants)){
  for (var h = 0; h < num_of_restaurants; h++){
  broke = false;
  for (var i = 0; i < cooks.length; i++){
    //console.log(cooks[i].name+" "+cooks[i].surname+" "+full_cooks_configs[i].workdaycounter+" "+full_cooks_configs[i].workingmode_2_2);
    if(full_cooks_configs[i].busy == 1) continue;
    if ((full_cooks_configs[i].workingmode_5_2 == 1) && (full_cooks_configs[i].workdaycounter == 5)){
        if (full_cooks_configs[i].restdaycounter < 2){
          full_cooks_configs[i].busy = 1;
          full_cooks_configs[i].restdaycounter++;
          continue;
        } else {
          full_cooks_configs[i].workdaycounter = 0;
          full_cooks_configs[i].restdaycounter = 0;
        }
    }
    if ((full_cooks_configs[i].workingmode_5_2 == 0) && (full_cooks_configs[i].workdaycounter == 2)){
        if (full_cooks_configs[i].restdaycounter < 2){
          //console.log(cooks[i].name+" --- "+cooks[i].surname+" "+full_cooks_configs[i].workdaycounter);
          full_cooks_configs[i].busy = 1;
          full_cooks_configs[i].restdaycounter++;
          continue;
        } else {
          full_cooks_configs[i].workdaycounter = 0;
          full_cooks_configs[i].restdaycounter = 0;
        }
    }
    for (var j = 0; j < full_cooks_configs[i].daysets.length; j++){
      for (var k = 0; k < full_cooks_configs[i].daysets[j].days.length; k++){
        for (var l = 0; l < full_cooks_configs[i].daysets[j].days[k].configs.length; l++){
          //console.log("Required beginning : "+time_restaurants[h]);
          //console.log("We have now "+full_cooks_configs[i].daysets[j].days[k].configs[l].begin_hour);
          //console.log((full_cooks_configs[i].daysets[j].days[k].configs[l].begin_hour == time_restaurants[h]));
          if ((full_cooks_configs[i].daysets[j].days[k].configs[l].begin_hour == time_restaurants[h]) &&
          (((24-full_cooks_configs[i].daysets[j].days[k].configs[l].end_hour) >= 4)||(full_cooks_configs[i].daysets[j].days[k].configs[l].end_hour==24))){
            console.log(day+" "+cooks[i].name+" "+cooks[i].surname+" "+full_cooks_configs[i].daysets[j].days[k].configs[l].begin_hour+" - "+
            full_cooks_configs[i].daysets[j].days[k].configs[l].end_hour+" at "+(h + 1)+" restaurant");
            time_restaurants[h] = full_cooks_configs[i].daysets[j].days[k].configs[l].end_hour;
            full_cooks_configs[i].workdaycounter++;
            full_cooks_configs[i].busy = 1;
            broke = true;
            break;
          }
          //if(broke) break;
        }
        if (broke) break;
      }
      if (broke) break;
    }
    if (broke) {
      break;
    } else {
      //console.log("No one");
      //return;
    }
  }
}
}
}

  console.log(time_restaurants);
  console.log(counter);
  //console.log("Full cooks configs : "+full_cooks_configs);
}

function isAllBusy(time_restaurants){
  for (i in time_restaurants){
    if (time_restaurants[i] != 24){
      return false;
    }
  }
  return true;
}

function unbusyAll(cooks){
  for (var i = 0; i < cooks.length; i++){
    cooks[i].busy = false;
  }
}

app.listen(3000);
