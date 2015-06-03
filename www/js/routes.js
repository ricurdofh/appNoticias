(function () {
    'use strict';

    Finch.route('/', acciones.initNoticias);
    Finch.route('noticias/:id', acciones.detailNoticia);
    Finch.route('perfil/', acciones.showPerfil);
    Finch.route('buscar/', acciones.showBuscar);
    Finch.route('detailBuscadas/:id', acciones.detailBuscadas);
    Finch.route('personales/', acciones.showPersonales);
    Finch.route('personales/:id', acciones.detailPersonales);
    Finch.route('settings/', acciones.showSettings);
}());