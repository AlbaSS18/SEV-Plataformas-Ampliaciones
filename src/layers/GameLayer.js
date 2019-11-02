class GameLayer extends Layer {

    constructor() {
        super();
        this.mensaje = new Boton(imagenes.mensaje_como_jugar, 480/2, 320/2);
        this.pausa = true;
        this.salvar = false;
        this.iniciar();
    }

    iniciar() {
        this.espacio = new Espacio(1);

        this.botonSalto = new Boton(imagenes.boton_salto,480*0.9,320*0.55);
        this.botonDisparo = new Boton(imagenes.boton_disparo,480*0.75,320*0.83);

        this.pad = new Pad(480*0.14,320*0.8);

        this.scrollX = 0;
        this.bloques = [];

        this.fondo = new Fondo(imagenes.fondo_2,480*0.5,320*0.5);

        this.disparosJugador = []
        this.enemigos = [];
        this.itemRecolectable = [];
        this.tiles = [];
        this.tilesDestruiblesDisparo = [];
        this.puertas = [];
        this.plataformasSalto = [];

        this.delayTime = 0;
        this.colisionConTile = false;
        this.puertaEncontrada = false;
        this.puerta;

        this.fondoPuntos =
            new Fondo(imagenes.icono_puntos, 480*0.85,320*0.05);
        this.fondoRecolectable =
            new Fondo(imagenes.icono_recolectable, 480*0.65,320*0.06);
        this.puntos = new Texto(0,480*0.9,320*0.07 );
        this.puntosRecolectables = new Texto(0,480*0.7,320*0.07 );

        this.cargarMapa("res/"+nivelActual+".txt");

        this.puntoDeSalvado.imagen.src = imagenes.vida;
        if(this.salvar){
            this.jugador.x = this.puntoDeSalvado.x;
            this.puntoDeSalvado.imagen.src = imagenes.corazonAmarillo;
        }

    }

    actualizar (){

        if (this.pausa){
            return;
        }

        this.espacio.actualizar();

        if ( this.copa.colisiona(this.jugador)){
            nivelActual++;
            if (nivelActual > nivelMaximo){
                nivelActual = 0;
            }
            this.pausa = true;
            this.mensaje =
                new Boton(imagenes.mensaje_ganar, 480/2, 320/2);
            this.salvar = false;
            this.iniciar();
        }

        // Jugador se cae
        if ( this.jugador.y > 480 ){
            this.iniciar();
        }

        this.fondo.vx = -1;
        this.fondo.actualizar();

        console.log("disparosJugador: "+this.disparosJugador.length);
        // Eliminar disparos fuera de pantalla
        for (var i=0; i < this.disparosJugador.length; i++){
            if ( this.disparosJugador[i] != null &&
                !this.disparosJugador[i].estaEnPantalla()){
                this.espacio
                    .eliminarCuerpoDinamico(this.disparosJugador[i]);
                this.disparosJugador.splice(i, 1);
                i=i-1;
            }
        }

        this.jugador.actualizar();

        for (var i=0; i < this.enemigos.length; i++){
            this.enemigos[i].actualizar();
        }

        for (var i=0; i < this.itemRecolectable.length; i++){
            this.itemRecolectable[i].actualizar();
        }

        for (var i=0; i < this.disparosJugador.length; i++) {
            this.disparosJugador[i].actualizar();
        }

        // Enemigos muertos fuera del juego
        for (var j=0; j < this.enemigos.length; j++){
            if ( this.enemigos[j] != null &&
                this.enemigos[j].estado == estados.muerto  ) {

                this.espacio
                    .eliminarCuerpoDinamico(this.enemigos[j]);
                this.enemigos.splice(j, 1);
                j = j-1;
            }
        }

        // A partir de aquí solo hago colisiones
        // colisiones
        for (var i=0; i < this.enemigos.length; i++){
            if ( this.jugador.colisiona(this.enemigos[i])){
                this.jugador.golpeado();
                if (this.jugador.vidas <= 0){
                    this.iniciar();
                }
            }
        }

        // colisiones , disparoJugador - Enemigo
        for (var i=0; i < this.disparosJugador.length; i++){
            for (var j=0; j < this.enemigos.length; j++){
                if (this.disparosJugador[i] != null &&
                    this.enemigos[j] != null &&
                    this.disparosJugador[i].colisiona(this.enemigos[j])) {

                    this.espacio
                        .eliminarCuerpoDinamico(this.disparosJugador[i]);
                    this.disparosJugador.splice(i, 1);
                    i = i-1;
                    this.enemigos[j].impactado();
                    this.puntos.valor++;
                }
            }
        }

        // colisiones , jugador - recolectable
        for (var i=0; i < this.itemRecolectable.length; i++){
            if ( this.jugador.colisiona(this.itemRecolectable[i])){
                this.espacio.eliminarCuerpoDinamico(this.itemRecolectable[i]);
                this.itemRecolectable.splice(i, 1);
                i = i-1;
                this.puntosRecolectables.valor++;
            }
        }

        // colisiones , jugador - tileDestruible
        for (var i=0; i < this.tiles.length; i++){
            if ( this.jugador.colisiona(this.tiles[i])){
                if (this.jugador.colisionaPorEncima(this.tiles[i]) && this.jugador.vy > 0){
                    this.colisionConTile = true;
                    this.numeroDeTile = i;
                }
            }
        }

        if(this.colisionConTile){
            if(this.delayTime==20){
                this.espacio.eliminarCuerpoEstatico(this.tiles[this.numeroDeTile]);
                this.tiles.splice(this.numeroDeTile, 1);
                this.colisionConTile = false;
                this.delayTime=0;
            }
            else{
                this.delayTime++;
            }
        }

        // colisiones , jugador - tileDestruibleDisparo
        for (var i=0; i < this.disparosJugador.length; i++){
            for (var j=0; j < this.tilesDestruiblesDisparo.length; j++){
                if (this.disparosJugador[i] != null &&
                    this.tilesDestruiblesDisparo[j] != null &&
                    this.disparosJugador[i].colisiona(this.tilesDestruiblesDisparo[j])) {

                    this.espacio
                        .eliminarCuerpoDinamico(this.disparosJugador[i]);
                    this.disparosJugador.splice(i, 1);
                    i = i-1;
                    this.espacio
                        .eliminarCuerpoEstatico(this.tilesDestruiblesDisparo[j]);
                    this.tilesDestruiblesDisparo.splice(j, 1);
                    j = j-1;
                }
            }
        }

        // colisiones , jugador - puntoDeSalvado
        if ( this.jugador.colisiona(this.puntoDeSalvado)){
            this.salvar = true;
            this.puntoDeSalvado.imagen.src = imagenes.corazonAmarillo;
        }

        // colisiones , jugador - plataformaSalto
        for (var i=0; i < this.plataformasSalto.length; i++){
            if (this.jugador.colisiona(this.plataformasSalto[i])){
               this.jugador.saltarJugador();
            }
        }


        // colisiones , jugador - puerta
        for (var i=0; i < this.puertas.length; i++){
            if (this.jugador.colisiona(this.puertas[i])){
                var otraPuerta = this.buscarPuerta(this.puertas[i]);
                this.puerta = otraPuerta;
                this.puertaEncontrada = true;
            }
        }

        if(this.puertaEncontrada){
            this.jugador.x = this.puerta.x + 50;
            this.jugador.y = this.puerta.y;
            this.puertaEncontrada = false;
        }
    }

    buscarPuerta(puertaActual){
        for (var i=0; i < this.puertas.length; i++){
            if(this.puertas[i].numeroDePuerta == puertaActual.numeroDePuerta){
                if(this.puertas[i] != puertaActual){
                    return this.puertas[i];
                }
            }
        }
        return null;
    }

    calcularScroll(){
        // limite izquierda
        if ( this.jugador.x > 480 * 0.3) {
            if (this.jugador.x - this.scrollX < 480 * 0.3) {
                this.scrollX = this.jugador.x - 480 * 0.3;
            }
        }

        // limite derecha
        if ( this.jugador.x < this.anchoMapa - 480 * 0.3 ) {
            if (this.jugador.x - this.scrollX > 480 * 0.7) {
                this.scrollX = this.jugador.x - 480 * 0.7;
            }
        }


    }

    dibujar (){

        this.calcularScroll();
        this.fondo.dibujar();

        for (var i=0; i < this.bloques.length; i++){
            this.bloques[i].dibujar(this.scrollX);
        }

        for (var i=0; i < this.disparosJugador.length; i++) {
            this.disparosJugador[i].dibujar(this.scrollX);
        }

        for (var i=0; i < this.tiles.length; i++){
            this.tiles[i].dibujar(this.scrollX);
        }

        for (var i=0; i < this.plataformasSalto.length; i++){
            this.plataformasSalto[i].dibujar(this.scrollX);
        }

        this.copa.dibujar(this.scrollX);
        this.puntoDeSalvado.dibujar(this.scrollX);
        this.jugador.dibujar(this.scrollX);
        for (var i=0; i < this.enemigos.length; i++){
            this.enemigos[i].dibujar(this.scrollX);
        }

        for (var i=0; i < this.tilesDestruiblesDisparo.length; i++){
            this.tilesDestruiblesDisparo[i].dibujar(this.scrollX);
        }

        for (var i=0; i < this.itemRecolectable.length; i++) {
            this.itemRecolectable[i].dibujar(this.scrollX);
        }

        for (var i=0; i < this.puertas.length; i++) {
            this.puertas[i].dibujar(this.scrollX);
        }

        // HUD --> A partir de aquí son elementos de interfaz
        this.fondoPuntos.dibujar();
        this.puntos.dibujar();
        this.fondoRecolectable.dibujar();
        this.puntosRecolectables.dibujar();
        if ( !this.pausa && entrada == entradas.pulsaciones) {
            this.botonDisparo.dibujar();
            this.botonSalto.dibujar();
            this.pad.dibujar();
        }

        if ( this.pausa ) {
            this.mensaje.dibujar();
        }

    }

    procesarControles( ){
        if (controles.continuar){
            controles.continuar = false;
            this.pausa = false;
        }
        // disparar
        if (  controles.disparo ){
            var nuevoDisparo = this.jugador.disparar();
            if ( nuevoDisparo != null ) {
                this.espacio.agregarCuerpoDinamico(nuevoDisparo);
                this.disparosJugador.push(nuevoDisparo);
            }
        }

        // Eje X
        if ( controles.moverX > 0 ){
            this.jugador.moverX(1);

        }else if ( controles.moverX < 0){
            this.jugador.moverX(-1);
        } else {
            this.jugador.moverX(0);
        }

        // Eje Y
        if ( controles.moverY > 0 ){
            this.jugador.saltar();

        } else if ( controles.moverY < 0 ){


        } else {

        }

    }

    cargarMapa(ruta){
        var fichero = new XMLHttpRequest();
        fichero.open("GET", ruta, false);

        fichero.onreadystatechange = function () {
            var texto = fichero.responseText;
            var lineas = texto.split('\n');
            this.anchoMapa = (lineas[0].length-1) * 40;
            for (var i = 0; i < lineas.length; i++){
                var linea = lineas[i];
                for (var j = 0; j < linea.length; j++){
                    var simbolo = linea[j];
                    var x = 40/2 + j * 40; // x central
                    var y = 32 + i * 32; // y de abajo
                    this.cargarObjetoMapa(simbolo,x,y);
                }
            }
        }.bind(this);

        fichero.send(null);
    }

    cargarObjetoMapa(simbolo, x, y){
        switch(simbolo) {
            case "C":
                this.copa = new Bloque(imagenes.copa, x,y);
                this.copa.y = this.copa.y - this.copa.alto/2;
                // modificación para empezar a contar desde el suelo
                this.espacio.agregarCuerpoDinamico(this.copa);
                break;
            case "E":
                var enemigo = new Enemigo(x,y);
                enemigo.y = enemigo.y - enemigo.alto/2;
                // modificación para empezar a contar desde el suelo
                this.enemigos.push(enemigo);
                this.espacio.agregarCuerpoDinamico(enemigo);
                break;
            case "1":
                this.jugador = new Jugador(x, y);
                // modificación para empezar a contar desde el suelo
                this.jugador.y = this.jugador.y - this.jugador.alto/2;
                this.espacio.agregarCuerpoDinamico(this.jugador);
            case "#":
                var bloque = new Bloque(imagenes.bloque_tierra, x,y);
                bloque.y = bloque.y - bloque.alto/2;
                // modificación para empezar a contar desde el suelo
                this.bloques.push(bloque);
                this.espacio.agregarCuerpoEstatico(bloque);
                break;
            case "I":
                var item = new ItemRecolectable(x,y);
                item.y = item.y - item.alto/2;
                // modificación para empezar a contar desde el suelo
                this.itemRecolectable.push(item);
                this.espacio.agregarCuerpoDinamico(item);
                break;
            case "W":
                var tileDestruible = new TilesDestruibles(imagenes.tile_destruible,x,y);
                tileDestruible.y = tileDestruible.y - tileDestruible.alto/2;
                // modificación para empezar a contar desde el suelo
                this.tiles.push(tileDestruible);
                this.espacio.agregarCuerpoEstatico(tileDestruible);
                break;
            case "A":
                this.puntoDeSalvado = new PuntoDeSalvado(x,y);
                this.puntoDeSalvado.y = this.puntoDeSalvado.y - this.puntoDeSalvado.alto/2;
                this.espacio.agregarCuerpoDinamico(this.puntoDeSalvado);
                break;
            case "9":
                var puerta = new Puertas(imagenes.puerta_9,x,y,9);
                puerta.y = puerta.y - puerta.alto/2;
                // modificación para empezar a contar desde el suelo
                this.puertas.push(puerta);
                this.espacio.agregarCuerpoEstatico(puerta);
                break;
            case "8":
                var puerta = new Puertas(imagenes.puerta_8,x,y,8);
                puerta.y = puerta.y - puerta.alto/2;
                // modificación para empezar a contar desde el suelo
                this.puertas.push(puerta);
                this.espacio.agregarCuerpoEstatico(puerta);
                break;
            case "7":
                var puerta = new Puertas(imagenes.puerta_7,x,y,7);
                puerta.y = puerta.y - puerta.alto/2;
                // modificación para empezar a contar desde el suelo
                this.puertas.push(puerta);
                this.espacio.agregarCuerpoEstatico(puerta);
                break;
            case "5":
                var puerta = new Puertas(imagenes.puerta_5,x,y,5);
                puerta.y = puerta.y - puerta.alto/2;
                // modificación para empezar a contar desde el suelo
                this.puertas.push(puerta);
                this.espacio.agregarCuerpoEstatico(puerta);
                break;
            case "4":
                var puerta = new Puertas(imagenes.puerta_4,x,y,4);
                puerta.y = puerta.y - puerta.alto/2;
                // modificación para empezar a contar desde el suelo
                this.puertas.push(puerta);
                this.espacio.agregarCuerpoEstatico(puerta);
                break;
            case "U":
                var tileDestruible = new TilesDestruibles(imagenes.bloque_metal,x,y);
                tileDestruible.y = tileDestruible.y - tileDestruible.alto/2;
                // modificación para empezar a contar desde el suelo
                this.tilesDestruiblesDisparo.push(tileDestruible);
                this.espacio.agregarCuerpoEstatico(tileDestruible);
                break;
            case "Y":
                var plataformaDeSalto = new PlataformaSalto (imagenes.plataforma_salto,x,y);
                plataformaDeSalto.y = plataformaDeSalto.y - plataformaDeSalto.alto/2;
                // modificación para empezar a contar desde el suelo
                this.plataformasSalto.push(plataformaDeSalto);
                this.espacio.agregarCuerpoEstatico(plataformaDeSalto);
                break;

        }
    }

    calcularPulsaciones(pulsaciones){
        // Suponemos botones no estan pulsados
        this.botonDisparo.pulsado = false;
        this.botonSalto.pulsado = false;
        // suponemos que el pad está sin tocar
        controles.moverX = 0;

        // Suponemos a false
        controles.continuar = false;

        for(var i=0; i < pulsaciones.length; i++){
            // MUY SIMPLE SIN BOTON cualquier click en pantalla lo activa
            if(pulsaciones[i].tipo == tipoPulsacion.inicio){
                controles.continuar = true;
            }
            if (this.pad.contienePunto(pulsaciones[i].x , pulsaciones[i].y) ){
                var orientacionX = this.pad.obtenerOrientacionX(pulsaciones[i].x);
                if ( orientacionX > 20) { // de 0 a 20 no contabilizamos
                    controles.moverX = orientacionX;
                }
                if ( orientacionX < -20) { // de -20 a 0 no contabilizamos
                    controles.moverX = orientacionX;
                }
            }

            if (this.botonDisparo.contienePunto(pulsaciones[i].x , pulsaciones[i].y) ){
                this.botonDisparo.pulsado = true;
                if ( pulsaciones[i].tipo == tipoPulsacion.inicio) {
                    controles.disparo = true;
                }
            }

            if (this.botonSalto.contienePunto(pulsaciones[i].x , pulsaciones[i].y) ){
                this.botonSalto.pulsado = true;
                if ( pulsaciones[i].tipo == tipoPulsacion.inicio) {
                    controles.moverY = 1;
                }
            }

        }

        // No pulsado - Boton Disparo
        if ( !this.botonDisparo.pulsado ){
            controles.disparo = false;
        }

        // No pulsado - Boton Salto
        if ( !this.botonSalto.pulsado ){
            controles.moverY = 0;
        }
    }




}
