var getAjax = function (url, callback, params) {
    var xmlhttp = new XMLHttpRequest(),
        jsonResp,
        timestamp,
        active,
        data;
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState === 4) {
            if (xmlhttp.status === 200) {
                jsonResp = xmlhttp.responseText;
            } else {
                jsonResp = 'Ocurrió un error al cargar';
            }
            active = localStorage.getItem('active');
            if (params) {
                data = JSON.parse(params);
                if (data.accion === active && url !== acciones.urlJSON) {
                    callback(jsonResp);
                }
                
            } else if (url !== acciones.urlJSON || active === 'noticias-prin') {
                callback(jsonResp);
            }
        }
    };
    timestamp = new Date().getTime();
    if (params) {
        xmlhttp.open("POST", url, true);
        xmlhttp.send(params);
    } else {
        xmlhttp.open("GET", url+'?ts='+timestamp, true);
        xmlhttp.send();
    }
};

function checkConnection() {
    var networkState = navigator.connection.type;

    var states = {};
    states[Connection.UNKNOWN]  = 'Unknown connection';
    states[Connection.ETHERNET] = 'Ethernet connection';
    states[Connection.WIFI]     = 'WiFi connection';
    states[Connection.CELL_2G]  = 'Cell 2G connection';
    states[Connection.CELL_3G]  = 'Cell 3G connection';
    states[Connection.CELL_4G]  = 'Cell 4G connection';
    states[Connection.CELL]     = 'Cell generic connection';
    states[Connection.NONE]     = 'No network connection';

    return states[networkState];
}

function monthDiff(d1, d2) {
    var months;
    months = (d2.getFullYear() - d1.getFullYear()) * 12;
    months -= d1.getMonth() + 1;
    months += d2.getMonth() + 1;
    return months <= 0 ? 0 : months;
}

/*:::::::::::::::::::::::::::
:::::::::: Funtion ::::::::::
:::::::::::::::::::::::::::*/

function loading(element, message)
{
    // Loading
    var container = document.getElementById(element),
        str; 
    str = '<div align="center" class="loadingMargin"><i class="fa fa-spinner fa-spin"></i>';
    if (message) {
        str += '</br></br>' + message;
    }
    str += '</div>';
    container.innerHTML = str;
}

//Función para verificar si existe una clase
function existeClase(obj,cls)
{
    return obj.className.match(new RegExp('(\\s|^)'+cls+'(\\s|$)'));
}
//Función para agregar una clase, si no existe la clase enviada - agrega la clase.
function addClass(obj,cls)
{
    if(!existeClase(obj,cls)) 
    {
        obj.className+=" "+cls;
    }
}
//Función para Eliminar una clase
function removeClass(cls)
{
    var obj1 = document.getElementById('noticias');
    var obj2 = document.getElementById('personales');
    var obj3 = document.getElementById('perfil');
    var obj4 = document.getElementById('buscar');
    var obj5 = document.getElementById('configuracion');
    if(existeClase(obj1,cls)) 
    {
        var exp =new RegExp('(\\s|^)'+cls+'(\\s|$)');
        obj1.className=obj1.className.replace(exp,"");
    }
    if(existeClase(obj2,cls)) 
    {
        var exp =new RegExp('(\\s|^)'+cls+'(\\s|$)');
        obj2.className=obj2.className.replace(exp,"");
    }
    if(existeClase(obj3,cls)) 
    {
        var exp =new RegExp('(\\s|^)'+cls+'(\\s|$)');
        obj3.className=obj3.className.replace(exp,"");
    }
    if(existeClase(obj4,cls)) 
    {
        var exp =new RegExp('(\\s|^)'+cls+'(\\s|$)');
        obj4.className=obj4.className.replace(exp,"");
    }
    if(existeClase(obj5,cls)) 
    {
        var exp =new RegExp('(\\s|^)'+cls+'(\\s|$)');
        obj5.className=obj5.className.replace(exp,"");
    }
}