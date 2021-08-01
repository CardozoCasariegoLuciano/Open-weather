(function () {
  var win = window,
    data = [];

  get = function (event) {
    event.preventDefault();

    var ciudadInput = document.getElementById("input_clima1");

    var ciudadBuscada = ciudadInput.value;

    if (ciudadBuscada.length > 0) {
      ciudadInput.value = "";

      if (isNaN(ciudadBuscada)) {
        var ciudad =
          ciudadBuscada.charAt(0).toUpperCase() + ciudadBuscada.slice(1);
      } else {
        var ciudad = ciudadBuscada;
      }

      if (!this.existeEnData(ciudad)) {
        var info = this.buscarAlApi(ciudad);
        this.aplicarCambios(event);
        return info;
      } else {
        var clima = data.find(
          (elem) => elem.id == ciudad || elem.name == ciudad
        );
        this.alertarCiudadYaEnData();
        return clima;
      }
    }
  };

  existeEnData = function (ciudad) {
    return data.some((elem) => elem.id == ciudad || elem.name == ciudad);
  };

  buscarAlApi = function (ciudad) {
    var api = new XMLHttpRequest();
    var tipoDedato = isNaN(ciudad) ? "q=" : "id=";
    var url =
      "https://api.openweathermap.org/data/2.5/weather?" +
      tipoDedato +
      ciudad +
      "&units=metric&appid=bedc22c85f76808a7cc7989b90a57009&lang=es";

    api.open("GET", url, false);
    api.send();
    var info = JSON.parse(api.response);

    if (info.cod == 200) {
      data.push(info);
      this.actualizarBotones();
      if (navigator.cookieEnabled) {
        localStorage.setItem("dataList", JSON.stringify(data));
      }
    } else {
      this.alertarCiudadNoValida();
    }

    return info;
  };

  dibujarDATA = function (dataList) {
    var root = document.getElementById("root");
    root.innerHTML = "";

    dataList.map(function (elem) {
      this.dibujarClimaEnDOM(elem);
    });
  };

  aplicarCambios = function (event) {
    event.preventDefault();
    logicaDeOrdenado = this.getLogicaDeOrdenado();

    var newData = data.sort(logicaDeOrdenado);
    this.dibujarDATA(newData);
    this.actualizarHeaderRank();
  };

  getLogicaDeOrdenado = function () {
    var radioNodeList = document.formOptios.orden;
    var isDesc = radioNodeList[4].checked;
    var funcRet;

    for (i = 0; i < 4; i++) {
      if (radioNodeList[i].checked) {
        break;
      }
    }
    logica = radioNodeList[i].value;
    logica_id = radioNodeList[i].id;

    if (navigator.cookieEnabled) {
      localStorage.setItem("orderBy", logica_id);
      localStorage.setItem("desc", isDesc);
    }

    switch (logica) {
      case "Temp":
        funcRet = function (a, b) {
          if (a.main.temp > b.main.temp) {
            return isDesc ? -1 : 1;
          }
          if (a.main.temp < b.main.temp) {
            return !isDesc ? -1 : 1;
          }
        };
        break;
      case "Hum":
        funcRet = function (a, b) {
          if (a.main.humidity > b.main.humidity) {
            return isDesc ? -1 : 1;
          }
          if (a.main.humidity < b.main.humidity) {
            return !isDesc ? -1 : 1;
          }
        };
        break;
      case "Nomb":
        funcRet = function (a, b) {
          if (a.name > b.name) {
            return isDesc ? -1 : 1;
          }
          if (a.name < b.name) {
            return !isDesc ? -1 : 1;
          }
        };
        break;
      case "Cod":
        funcRet = function (a, b) {
          if (a.id > b.id) {
            return isDesc ? -1 : 1;
          }
          if (a.id < b.id) {
            return !isDesc ? -1 : 1;
          }
        };
        break;
      default:
        break;
    }

    return funcRet;
  };

  dibujarClimaEnDOM = function (obj) {
    var root = document.getElementById("root");

    //div card
    var nuevoClima = document.createElement("div");
    nuevoClima.classList.add("elem_busqueda");
    nuevoClima.style.backgroundImage =
      "url(http://openweathermap.org/img/wn/" +
      obj.weather[0].icon +
      "@2x.png)";
    nuevoClima.style.backgroundRepeat = "no-repeat";
    nuevoClima.style.backgroundPosition = "0px -15px";
    nuevoClima.style.backgroundSize = "auto";
    nuevoClima.dataset.id = obj.id;

    //div contenedor de la informacion
    var climaContent = document.createElement("div");
    climaContent.classList.add("clima_content");

    //ID , Titulo y estado de la ciudad (header)
    var climaContent_ID = document.createElement("p");
    climaContent_ID.classList.add("clima_content_id");
    climaContent_ID.textContent = obj.id;

    var climaContent_H3 = document.createElement("h3");
    climaContent_H3.classList.add("clima_content_H3");
    climaContent_H3.textContent = obj.name;

    var climaContent_estado = document.createElement("p");
    climaContent_estado.classList.add("clima_content_estado");
    climaContent_estado.textContent = obj.weather[0].description;

    //btn eliminar card
    var btn_Eliminar_card = document.createElement("p");
    btn_Eliminar_card.classList.add("btn_eliminar_Card");
    btn_Eliminar_card.textContent = "X";
    btn_Eliminar_card.setAttribute(
      "onclick",
      "window.weatherData.eliminarCard(event)"
    );

    //div seccion datos (body)
    var div_Data = document.createElement("div");
    div_Data.classList.add("div_Data");

    //div seccion temperaturas
    var div_temperatura = document.createElement("div");
    div_temperatura.classList.add("clima_temp");
    //titulo seccion temperaturas
    var temperaturaData_tit = document.createElement("h4");
    temperaturaData_tit.classList.add("Data_tit");
    temperaturaData_tit.textContent = "Temperatura";
    //Temperatura actual titulo
    var temperaturaData_actual_tit = document.createElement("h4");
    temperaturaData_actual_tit.classList.add("temperatura_tit");
    temperaturaData_actual_tit.textContent = "Actual";
    //Temperatura actual cont
    var temperaturaData_actual_cont = document.createElement("p");
    temperaturaData_actual_cont.classList.add("temperatura_contenido");
    temperaturaData_actual_cont.textContent = obj.main.temp;
    // titulo temperatura maxima/minima
    var temperaturaData_maxmin_tit = document.createElement("h4");
    temperaturaData_maxmin_tit.classList.add("temperatura_tit");
    temperaturaData_maxmin_tit.textContent = "Maxima|Minima";
    //Temperatura minima/maxima
    var temperaturaData_minima_cont = document.createElement("p");
    temperaturaData_minima_cont.classList.add("temperatura_contenidoManMin");
    temperaturaData_minima_cont.innerHTML =
      "<span class='tempMax'>" +
      obj.main.temp_max +
      "</span>" +
      " " +
      "<span class='tempMin'>" +
      obj.main.temp_min +
      "</span> ";
    // titulo temperatura terminca
    var temperaturaData_termica_tit = document.createElement("h4");
    temperaturaData_termica_tit.classList.add("temperatura_tit");
    temperaturaData_termica_tit.textContent = "Terminca";
    //Temperatura terminca
    var temperaturaData_termica_cont = document.createElement("p");
    temperaturaData_termica_cont.classList.add("temperatura_contenido");
    temperaturaData_termica_cont.innerHTML = obj.main.feels_like;

    //div humedad y viento
    var div_humedad_viento = document.createElement("div");
    div_humedad_viento.classList.add("div_humedadViento");

    //div seccion humedad
    var div_humedad = document.createElement("div");
    div_humedad.classList.add("clima_humedad");
    //titulo seccion humedad
    var humedad_tit = document.createElement("h4");
    humedad_tit.classList.add("Data_tit");
    humedad_tit.textContent = "Humedad";
    //humedad dato
    var humedad_cont = document.createElement("p");
    humedad_cont.classList.add("humedad_contenido");
    humedad_cont.innerHTML = obj.main.humidity;

    //div seccion viento
    var div_viento = document.createElement("div");
    div_viento.classList.add("clima_viento");
    //titulo seccion viento
    var viento_tit = document.createElement("h4");
    viento_tit.classList.add("Data_tit");
    viento_tit.textContent = "Viento";
    //viento dato
    var viento_cont = document.createElement("p");
    viento_cont.classList.add("viento_contenido");
    viento_cont.innerHTML = (obj.wind.speed * 3.6).toFixed(1);

    //Añadiendo al DOM
    root.appendChild(nuevoClima);

    nuevoClima.appendChild(climaContent);

    nuevoClima.appendChild(climaContent);

    climaContent.append(
      climaContent_ID,
      climaContent_H3,
      climaContent_estado,
      btn_Eliminar_card,
      div_Data
    );

    div_Data.appendChild(div_temperatura);

    div_temperatura.append(
      temperaturaData_tit,
      temperaturaData_actual_tit,
      temperaturaData_actual_cont,
      temperaturaData_maxmin_tit,
      temperaturaData_minima_cont,
      temperaturaData_termica_tit,
      temperaturaData_termica_cont
    );

    div_Data.appendChild(div_humedad_viento);

    div_humedad_viento.appendChild(div_humedad);

    div_humedad.appendChild(humedad_tit);
    div_humedad.appendChild(humedad_cont);

    div_humedad_viento.appendChild(div_viento);

    div_viento.appendChild(viento_tit);
    div_viento.appendChild(viento_cont);
  };

  actualizar = function (event) {
    event.preventDefault();

    var root = document.getElementById("root");
    root.innerHTML = "";

    var newData = data;
    data = [];

    newData.forEach(function (elem) {
      this.buscarAlApi(elem.id);
    });

    this.aplicarCambios(event);
    this.actualizarHeaderRank();

    var alerta_footer = document.getElementById("alerta_footer");
    alerta_footer.classList.remove("mostrarAlerta");

    this.actualizarBotones();
  };

  borrarData = function (e) {
    e.preventDefault();
    data = [];
    if (navigator.cookieEnabled) {
      localStorage.setItem("dataList", []);
    }
    this.dibujarDATA(data);
    this.actualizarHeaderRank();
    this.actualizarBotones();
  };

  autoload = function (event) {
    var checkBox = document.getElementById("checkbox_autoload");
    var spanStatus = document.getElementById("AL_status");

    var intervalo, alertInterval;

    if (checkBox.checked) {
      clearInterval(alertInterval);
      spanStatus.innerText = "ON";

      intervalo = setInterval(function () {
        this.actualizar(event);
      }, /* 1000 */ 300000);
    } else {
      alertInterval = setInterval(function () {
        var alerta_footer = document.getElementById("alerta_footer");
        var alerta_text = document.getElementById("alerta_footer_text");
        alerta_text.innerText = "Algunos climas estan desactualizados";
        alerta_footer.classList.add("mostrarAlerta");
      }, /* 2000 */ 9000000);
    }

    checkBox.addEventListener("change", function () {
      if (checkBox.checked) {
        clearInterval(alertInterval);
        if (navigator.cookieEnabled) {
          localStorage.setItem("autoload", true);
        }
        spanStatus.innerText = "ON";

        intervalo = setInterval(function () {
          this.actualizar(event);
        }, /* 1000 */ 300000);
      } else {
        clearInterval(intervalo);
        if (navigator.cookieEnabled) {
          localStorage.setItem("autoload", false);
        }
        spanStatus.innerText = "OFF";

        alertInterval = setInterval(function () {
          var alerta_footer = document.getElementById("alerta_footer");
          var alerta_text = document.getElementById("alerta_footer_text");
          alerta_text.innerText = "Algunos climas estan desactualizados";
          alerta_footer.classList.add("mostrarAlerta");
        }, /* 2000 */ 9000000);
      }
    });
  };

  eliminarCard = function (event) {
    event.preventDefault();

    var root = document.getElementById("root");
    var self = event.path[2];

    self_id = self.dataset.id;

    data = data.filter(function (elem) {
      return elem.id != self_id;
    });

    if (navigator.cookieEnabled) {
      localStorage.setItem("dataList", JSON.stringify(data));
    }

    root.removeChild(self);
    this.actualizarHeaderRank();
    this.actualizarBotones();
  };

  loadPage = function (event) {
    event.preventDefault();

    if (navigator.cookieEnabled) {
      if (localStorage.getItem("desc") == "true") {
        var chackbox = document.getElementById("ord_asc");
        chackbox.setAttribute("checked", "");
      }

      if (localStorage.getItem("orderBy")) {
        var orderTo = localStorage.getItem("orderBy");
        var radio = document.getElementById(orderTo);
        radio.setAttribute("checked", "");
      }

      if (localStorage.getItem("autoload") == "false") {
        var checkBox = document.getElementById("checkbox_autoload");
        checkBox.removeAttribute("checked");
      }

      if (localStorage.getItem("dataList")) {
        dataList = localStorage.getItem("dataList");
        data = JSON.parse(dataList);
        this.actualizar(event);
      }
    } else {
      var alerta_modal = document.getElementById("modal_Alert_NoCookies");
      var alerta_modal_text = document.getElementById(
        "modal_Alert_text_NoCookies"
      );
      alerta_modal_text.innerText =
        "Local storage deshabilidato, los cambios no se persistiran";
      alerta_modal.classList.add("mostrarAlerta");

      setTimeout(function () {
        alerta_modal.classList.remove("mostrarAlerta");
      }, 10000);
    }

    this.actualizarBotones();
    this.actualizarHeaderRank();
    this.autoload(event);

    window.addEventListener("scroll", this.animacionBTNactualizar);
  };

  actualizarHeaderRank = function () {
    var textNOData = document.getElementById("topClimas_sinClimas");
    var textTopFria = document.getElementById("topClimas_frio");
    var textTopHumeda = document.getElementById("topClimas_humedo");

    if (data.length == 0) {
      textNOData.innerText = "Aun no has realizado ninguna busqueda";
      textTopFria.innerHTML = "";
      textTopHumeda.innerHTML = "";
    } else {
      var masFria = data.sort(function (a, b) {
        if (a.main.temp > b.main.temp) {
          return 1;
        }
        if (a.main.temp < b.main.temp) {
          return -1;
        }
      })[0];

      var masHumeda = data.sort(function (a, b) {
        if (a.main.humidity > b.main.humidity) {
          return -1;
        }
        if (a.main.humidity < b.main.humidity) {
          return 1;
        }
      })[0];

      textNOData.innerText = "";
      textTopFria.innerHTML =
        "Ciudad mas fria: <span class='span_topClimas'>" +
        masFria.name +
        "<span>";
      textTopHumeda.innerHTML =
        "Ciudad mas humeda: <span class='span_topClimas'>" +
        masHumeda.name +
        "<span>";
    }
  };

  animacionBTNactualizar = function () {
    var divActualizar = document.getElementById("divBTN_actualizar");
    var topHeigth = document.documentElement.scrollTop;
    var topDiv = divActualizar.offsetTop;

    var btn_subir = document.getElementById("div_subir");

    if (topDiv > topHeigth) {
      divActualizar.classList.remove("efectoBTN_actualizar");
      btn_subir.classList.remove("mostrarBTN_subir");
    } else {
      divActualizar.classList.add("efectoBTN_actualizar");
      btn_subir.classList.add("mostrarBTN_subir");
    }
  };

  alertarCiudadNoValida = function () {
    var parrafo = document.getElementById("formBusqueda_alertSection");

    parrafo.innerText = "La ciudad buscada no existe";
    parrafo.classList.remove("ciudadYaEnData");
    parrafo.classList.add("ciudadNoValida");

    setTimeout(function () {
      parrafo.classList.remove("ciudadNoValida");
    }, 5000);
  };

  alertarCiudadYaEnData = function () {
    var parrafo = document.getElementById("formBusqueda_alertSection");

    parrafo.innerText = "La ciudad buscada ya esta en la lista";
    parrafo.classList.remove("ciudadNoValida");
    parrafo.classList.add("ciudadYaEnData");

    setTimeout(function () {
      parrafo.classList.remove("ciudadYaEnData");
    }, 5000);
  };

  actualizarBotones = function () {
    var btn_ordenar = document.getElementById("btn_aplicar");
    var btn_Eliminar = document.getElementById("btn-EliminarTodos");
    var btn_Actualizar = document.getElementById("btn-actualizar");

    if (data.length == 0) {
      btn_ordenar.classList.add("desmarcarBTNs");
      btn_Eliminar.classList.add("desmarcarBTNs");
      btn_Actualizar.classList.add("desmarcarBTNs");

      btn_ordenar.setAttribute("disable", "");
      btn_Eliminar.setAttribute("disable", "");
      btn_Actualizar.setAttribute("disable", "");
    } else {
      btn_ordenar.classList.remove("desmarcarBTNs");
      btn_Eliminar.classList.remove("desmarcarBTNs");
      btn_Actualizar.classList.remove("desmarcarBTNs");

      btn_ordenar.removeAttribute("disable", "");
      btn_Eliminar.removeAttribute("disable", "");
      btn_Actualizar.removeAttribute("disable", "");
    }
  };

  win.weatherData = {
    get: get,
    existeEnData: existeEnData,
    data: data,
    dibujarClimaEnDOM: dibujarClimaEnDOM,
    actualizar: actualizar,
    aplicarCambios: aplicarCambios,
    dibujarDATA,
    getLogicaDeOrdenado,
    borrarData,
    autoload,
    buscarAlApi,
    eliminarCard,
    loadPage,
    actualizarHeaderRank,
    animacionBTNactualizar,
    alertarCiudadNoValida,
    actualizarBotones,
    alertarCiudadYaEnData,
  };

  return win.weatherData;
})();
