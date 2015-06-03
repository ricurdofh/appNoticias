/*jslint browser: true, devel: true */
var acciones = (function () {
    'use strict';

    var self = {

        //para guardar datos que luego serán enviados
        data : {
            id_usuario : localStorage.getItem('i_idusernews'),
        },

        //para guardar las noticias principales
        noticias : [],

        //para guardar los resultados de la última busqueda
        noticiasBuscadas : [],

        //para guardar los resultados de la última busqueda de palabras del perfil
        noticiasPersonales : [],

        //dirección de donde trae las últimas noticias
        urlJSON : "http://noticiasvenezolanas.co.ve/txts/noticiasJSON.txt",

        //dirección del backend de la app
        urlPalabras : 'http://noticiasvenezolanas.co.ve/phpBots/noticiasPalabras.php',

        addTema : function () {
            var tema = document.getElementById('tema').value.replace(/\s+/g,' ').trim(),
                data;
            if (!tema) {
                alert('Debe ingresar una palabra o frase para filtrar noticias');
            } else {
                self.data.accion = 'insert';
                self.data.palabra = tema;
                localStorage.setItem('active', self.data.accion);
                data = JSON.stringify(self.data);
                // alert('data ' + data);
                self.llamarAjax(self.urlPalabras, function (resp) {
                    // alert('resp ' + resp);
                    if (resp === 'ok')
                        self.updateProfileList(tema);
                    else if (resp === 'rep')
                        alert("No puede agregar temas de búsqueda repetidos");
                    else if (resp === 'max')
                        alert("Solo puede agregar 5 temas de búsqueda");
                    else
                        alert("Ocurrió un error al guardar el tema");
                }, data);
                document.getElementById('tema').value = '';
            }
        },

        asignaTiempoDescarga : function (tiempo) {
            localStorage.setItem('refreshRate', tiempo);
        },

        asignaConexion : function (tipoconexion) {
            localStorage.setItem('tipoconexion', tipoconexion);
        },

        buscarNoticias : function () {
            var desde = document.getElementById('desde'),
                hasta = document.getElementById('hasta'),
                palabra = document.getElementById('palabra').value.replace(/\s+/g,' ').trim(),
                lista = document.getElementById('lista'),
                hoy = new Date(),
                data;

            if (palabra) {
                if (hasta.valueAsDate >= desde.valueAsDate && hasta.valueAsDate < hoy && desde.value !== '' && hasta.value !== '') {
                    if (monthDiff(desde.valueAsDate, hasta.valueAsDate) <= 3) {
                        self.noticiasBuscadas = [];
                        self.data.accion = "buscar";
                        self.data.desde = desde.value;
                        self.data.hasta = hasta.value;
                        self.data.palabra = palabra;
                        data = JSON.stringify(self.data);
                        loading('lista', '');
                        self.llamarAjax(self.urlPalabras, function (noticias) {
                            var loading = document.getElementsByClassName('loadingMargin')[0];
                            loading.parentNode.removeChild(loading);
                            try {
                                if (noticias === 'null') throw 'Se recibió null';
                                noticias = JSON.parse(noticias);
                            } catch (e) {
                                noticias = "No se ha encontrado ninguna noticia con su patrón de busqueda";
                                lista.innerHTML = noticias;
                            }
                            if (typeof noticias !== 'string' && noticias.length > 0) {
                                noticias.forEach(function (noticia) {
                                    noticia.buscadas = true;
                                    var noticias = self.procesaNoticia(noticia);
                                    self.noticiasBuscadas.push(noticias);
                                });
                            } else {
                                noticias = "No se ha encontrado ninguna noticia con su patrón de busqueda";
                                lista.innerHTML = noticias;
                            }
                        }, data);
                    } else {
                        alert('Debe ingresar un rango de fechas de hasta 3 meses');
                    }
                } else {
                    alert('Debe ingresar un rango de fechas válido');
                }
            } else {
                alert('Debe ingresar una palabra o frase para filtrar noticias');
            }


        },

        cambiaAlertsStatus : function (status) {
            self.data.accion = 'cambiaStatus';
            self.data.status = status === 'activo' ? 1 : 0;
            var data = JSON.stringify(self.data);
            self.llamarAjax(self.urlPalabras, function (resp) {
                if (resp === 'ok') {
                    localStorage.setItem('alertsStatus', status);
                } else {
                    alert('Ocurrió un error al actualizar la configuración');
                }
            }, data);
        },

        clearTimer : function () {
            if (self.cicloConexion) {
                clearTimeout(self.cicloConexion);
            }
        },

        deleteTema : function (el) {
            var tema = el.textContent.trim(),
                del;
            del = confirm('¿Está seguro que desea eliminar "' + tema + '" de la lista de temas?');
            if (del) {
                var ul = document.getElementById('lista'),
                    data;
                self.data.accion = 'delete';
                self.data.palabra = tema;
                data = JSON.stringify(self.data);
                localStorage.setItem('active', self.data.accion);
                self.llamarAjax(self.urlPalabras, function (resp) {
                    if (resp === 'ok')
                        ul.removeChild(el);
                    else {
                        alert("Ocurrió un error al borrar el tema, por favor vuelva a intentar");                        
                    }
                }, data);
            }
        },

        detailBuscadas : function (params) {
            self.clearTimer();
            self.noticiasBuscadas.forEach(function (noticia) {
                if (noticia.ID === params.id) {
                    self.detailsBuscadas(noticia);
                }
            });
        },

        detailNoticia : function (params) {
            self.clearTimer();
            self.noticias.forEach(function (noticia) {
                if (noticia.ID === params.id) {
                    self.details(noticia);
                }
            });
        },

        detailPersonales : function (params) {
            self.clearTimer();
            self.noticiasPersonales.forEach(function (noticia) {
                if (noticia.id_noticia === params.id) {
                    self.details(noticia);
                }
            });
        },

        details : function (noticia) {
            var detailTemplate = document.getElementById('detailNoticia-template'),
                wrapper = document.getElementById('wrapper'),
                iconos = document.getElementById('iconos');
                
            iconos.innerHTML = '<i class="fa fa-newspaper-o icono_info"></i> Detalle Noticias   <i onclick="window.history.go(-1);" class="fa fa-reply icono_back"></i>';
            document.getElementById('searchbox').setAttribute('style','display: none !important');
            document.getElementById('wrapper').setAttribute('style','top: 39px !important');
            
            wrapper.innerHTML = tmpl(detailTemplate.innerHTML, noticia);            
        },

        detailsBuscadas : function (noticia) {
            var detailTemplate = document.getElementById('detailNoticia-template'),
            wrapper = document.getElementById('wrapper'),
            iconos = document.getElementById('iconos');
                          
            iconos.innerHTML = '<i class="fa fa-newspaper-o icono_info"></i> Detalle Noticias   <i onclick="window.history.go(-1);" class="fa fa-reply icono_back"></i>',
                wrapper = document.getElementById('lista');
            wrapper.innerHTML = tmpl(detailTemplate.innerHTML, noticia);            
        },

        initNoticias : function () {
            var iconos = document.getElementById('iconos');
            localStorage.setItem('active', 'noticias');
            iconos.innerHTML = '<i class="fa fa-newspaper-o icono_info"></i> Noticias';
            loading('container', '');
            self.llamarAjax(self.urlJSON, self.showNoticias);
        },

        llamarAjax : function (url, callback, post) {
            var tipoconexion = localStorage.getItem('tipoconexion') || 'wifi',
                verificarConexion = checkConnection();
            if (verificarConexion === 'Unknown connection' || verificarConexion === 'No network connection' || tipoconexion === 'wifi'  &&  (verificarConexion === "Cell 4G connection" || verificarConexion === "Cell 3G connection" || verificarConexion === "Cell 2G connection")) {
                if (!document.getElementById('settings-template').innerHTML) {
                    loadTemplate('settings-template');
                }
                alert('No hay conexión! Puede cambiar el tipo de acceso a internet y activar la conexión con datos si aún no lo ha hecho');
                self.showSettings();
                window.location.href='#/settings/';
            } else {
                getAjax(url, callback, post);
            }
        },

        onNotification : function (e) {
            switch(e.event) {
                case 'registered':
                    if (e.regid.length > 0) {
                        var data;
                        if (!localStorage.getItem('i_idusernews')) {
                            self.data.id_usuario = e.regid;
                            self.data.accion = 'register';
                            localStorage.setItem('active', self.data.accion);
                            data = JSON.stringify(self.data);
                            self.llamarAjax(self.urlPalabras, function (resp) {
                                localStorage.setItem('i_idusernews', e.regid);
                            }, data);
                        }
                        console.log('Regid : ' + e.regid);
                    }
                    break;
                case 'message':
                    if (!e.foreground) {
                        self.showPersonales();
                    }
                    break;
            }
        },

        procesaNoticia : function (noticia) {
            var cont,
                img,
                lista,
                listTemplate;
            lista = document.getElementById('lista');
            listTemplate = document.getElementById('listNews-template');
            cont = noticia.post_content.split(/<div class="post-image">(.*?)<\/div>/);
            if (cont.length > 1) {
                img = cont[1].split(/src=\"(.*?)\"/);
                noticia.urlImg = img[1] || '';
                cont = noticia.urlImg ? cont[2] : cont;
            } else {
                noticia.urlImg = '';
                cont = cont[0];
            }
            noticia.contAll = cont.replace(/\s+/g,' ').trim();
            noticia.contAll = noticia.contAll.replace('[showmyads]', '');
            noticia.contRes = noticia.contAll.substr(0, cont.trim().length / 4);
            while (noticia.contRes.length >= 300){
                noticia.contRes = noticia.contRes.substr(0, noticia.contRes.length / 2);
            }
            noticia.contRes += ' (cont...)';
            if (!noticia.ID) {
                noticia.ID = "";
            }
            lista.innerHTML += tmpl(listTemplate.innerHTML, noticia);
            return noticia;
        },

        showBuscar : function () {
            self.clearTimer();
            var container = document.getElementById('container'),
                buscar = document.getElementById('buscar-template'),
                iconos = document.getElementById('iconos');

            localStorage.setItem('active', 'buscar');
            iconos.innerHTML = '<i class="fa fa-search icono_info"></i> Buscar';

            removeClass('is-active');
            addClass(document.getElementById('buscar') ,'is-active');

            container.innerHTML = buscar.innerHTML;

            if (self.noticiasBuscadas.length > 0) {
                self.noticiasBuscadas.forEach(self.procesaNoticia);
            }
        },

        showNoticias : function (noticias) {
            var tmplt,
                container = document.getElementById('container'),
                refreshRate = localStorage.getItem('refreshRate') || 100000;
            localStorage.setItem('active', 'noticias');
            self.clearTimer();
            try {
                noticias = JSON.parse(noticias);
            } catch (e) {
                container.innerHTML = noticias;
            }
            if (typeof noticias !== 'string'){
                tmplt = document.getElementById('wrapper-template');
                container.innerHTML = tmplt.innerHTML;
                noticias.forEach(function (noticia){
                    noticia = self.procesaNoticia(noticia);
                    self.noticias.push(noticia);
                });
                removeClass('is-active');
                addClass(document.getElementById('noticias') ,'is-active');
                Search("searchbox", "lista", "search_list", function (element) {
                  element.innerHTML += ' - enter';
                });
                self.cicloConexion = setTimeout(function () {
                    self.llamarAjax(self.urlJSON, self.showNoticias);
                }, refreshRate);
            }
        },

        showPerfil : function () {
            var profile = document.getElementById('profile-template'),
                container = document.getElementById('container'),
                iconos = document.getElementById('iconos'),
                data;
            iconos.innerHTML = '<i class="fa fa-user icono_info"></i> Perfil';
            self.clearTimer();
            loading('container', '');
            self.data.accion = 'get';
            localStorage.setItem('active', self.data.accion);
            data = JSON.stringify(self.data);
            self.llamarAjax(self.urlPalabras, function (temas) {
                container.innerHTML = profile.innerHTML;
                temas = JSON.parse(temas);
                temas.forEach(function (tema) {
                    self.updateProfileList(tema.palabra);
                });
            }, data);
            removeClass('is-active');
            addClass(document.getElementById('perfil') ,'is-active');
        },

        showPersonales : function () {
            loading('container', '');
            var data,
                iconos = document.getElementById('iconos');
            iconos.innerHTML = '<i class="fa fa-bell icono_info"></i> Personales';
            self.data.accion = 'noticias';
            localStorage.setItem('active', self.data.accion);
            data = JSON.stringify(self.data);
            self.clearTimer();
            self.llamarAjax(self.urlPalabras, function (resp) {
                var tmplt = document.getElementById('wrapper-template'),
                    container = document.getElementById('container');
                try {
                    if (resp === 'null') throw 'Se recibió null';
                    resp = JSON.parse(resp);
                } catch (e) {
                    resp = "No se ha encontrado ninguna noticia con su patrón de busqueda o no ha agregado ninguno a su perfil";
                    container.innerHTML = resp;
                }
                if (typeof resp !== 'string') {
                    container.innerHTML = tmplt.innerHTML;
                    resp.forEach(function (noticia) {
                        var noticiasPersonales = self.procesaNoticia(noticia);
                        self.noticiasPersonales.push(noticiasPersonales);
                    });
                    removeClass('is-active');
                    addClass(document.getElementById('personales') ,'is-active');
                    Search("searchbox", "lista", "search_list", function (element) {
                      element.innerHTML += ' - enter';
                    });
                }
                self.clearTimer();

            }, data);
        },

        showSettings : function () {
            var settingsTemplate = document.getElementById('settings-template'),
                container = document.getElementById('container'),
                iconos = document.getElementById('iconos'),
                tipoconexion = localStorage.getItem('tipoconexion') || 'wifi',
                refreshRate = localStorage.getItem('refreshRate') || '100000',
                alertsStatus = localStorage.getItem('alertsStatus') || 'activo',
                data;
            iconos.innerHTML = '<i class="fa fa-cogs icono_info"></i> Configuración';
            self.clearTimer();

            data = {
                tipoconexion : tipoconexion,
                refreshRate : refreshRate,
                alertsStatus : alertsStatus
            };
            
            localStorage.setItem('active', 'settings');

            removeClass('is-active');
            addClass(document.getElementById('configuracion') ,'is-active');

            container.innerHTML = tmpl(settingsTemplate.innerHTML, data);
        },

        updateProfileList : function (tema) {
            var ul = document.getElementById('lista'),
                li = document.getElementById('listTemas-template'),
                obj = {};
            if (tema) {
                obj.tema = tema;
                obj.id = tema.replace(/\s+/g,'').trim();
                ul.innerHTML = tmpl(li.innerHTML, obj) + ul.innerHTML;
            }
        } 

    };

    return self;


}());